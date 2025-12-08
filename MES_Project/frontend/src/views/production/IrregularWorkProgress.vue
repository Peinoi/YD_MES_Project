<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { useWorkStore } from '@/stores/workStore.js';

import BasicInfo from '@/components/production/IrregularWork/BasicInfoBox.vue';
import ProductionInfo from '@/components/production/IrregularWork/ProductionInfo.vue';
import AvailableEquipment from '@/components/production/IrregularWork/AvailableEquipment.vue';

const workStore = useWorkStore();

// Pinia에서 Irregular 데이터 복원
onBeforeMount(() => {
    workStore.restoreIrregularData();
});

const irregular = computed(() => workStore.irregularData || {});
const work = computed(() => irregular.value.work);
const details = computed(() => irregular.value.details || []);

// 진행 제어용 상태값
const currentProcessIndex = ref(0); // 현재 공정 인덱스
const currentRate = ref(0); // 현재 공정 진행률 (0~100)
const isRunning = ref(false); // 작업 진행 중 여부
const isFinishedAll = ref(false); // 모든 공정 완료 여부
const selectedEq = ref(null); // 선택한 설비 코드
const workStartTime = ref(null); // 전체 작업 시작 시간 (Date)
const workEndTime = ref(null); // 전체 작업 종료 시간 (Date)

let rateTimer = null; // 1초에 10%씩 올리는 타이머

// 설비 선택 이벤트 핸들러 (AvailableEquipment에서 emit)
const handleSelectEquipment = (eqCode) => {
    selectedEq.value = eqCode;
};

// 현재 공정 row
const currentProcess = computed(() => {
    return details.value[currentProcessIndex.value] || null;
});

// 전체 작업 시간(초) 계산
const totalSeconds = computed(() => {
    if (!workStartTime.value || !workEndTime.value) return 0;
    return Math.floor((workEndTime.value - workStartTime.value) / 1000);
});

// ======== 공정 진행 로직 ========

// prdrInsert 호출 (실적 등록)
// NOTE: 실제로는 prdr_code, work_order_code, emp_code, prod_code, ord_qtt 를 모두 채워야 함
const callPrdrInsert = async () => {
    const prdr = await axios.post('/api/productionwork/work/prdrmax');
    console.log(prdr.data);

    // // 예시: 필요한 값은 상황에 맞게 수정
    // const payload = {
    //     prdr_code: '', // 실적코드 (규칙에 맞게 생성하거나 백엔드에서 생성)
    //     note: '',
    //     work_order_code: work.value.code,
    //     emp_code: 'EMP-001',
    //     prod_code: work.value.prod_code,
    //     ord_qtt: currentProcess.value?.지시량 || 0
    // };
    // console.log('[DEBUG] prdrInsert payload는 프로젝트에 맞게 채워야 함', payload);

    // // 실제 사용 시 아래 주석 해제하고 payload 맞추기
    // const res = await axios.post('/api/productionwork/work/prdrinsert', payload);
    // console.log('prdrInsert result', res.data);
};

// 설비 상태 변경 (사용 중 / 사용 가능)
const updateEquipmentStat = async (stat) => {
    if (!selectedEq.value) return;
    await axios.put(`/api/productionwork/work/availableequipmentupdate/${selectedEq.value}`, {
        stat
    });
};

// 공정 진행률 DB 업데이트
const updateProcessRate = async () => {
    if (!currentProcess.value) return;
    await axios.put('/api/productionwork/work/process/rate', {
        rate: currentRate.value,
        prdr_d_code: currentProcess.value.prdr_d_code
    });
};

// 공정 완료 DB 처리
const completeProcessOnDB = async () => {
    if (!currentProcess.value) return;
    await axios.put('/api/productionwork/work/process/end', {
        end_date: new Date(),
        prdr_d_code: currentProcess.value.prdr_d_code
    });
};

// 1초마다 10%씩 진행시키는 타이머 시작
const startRateTimer = () => {
    // 이미 돌고 있으면 중복 방지
    if (rateTimer) clearInterval(rateTimer);

    isRunning.value = true;
    currentRate.value = 0;

    rateTimer = setInterval(async () => {
        currentRate.value += 10;
        if (currentRate.value > 100) currentRate.value = 100;

        // 진행률 DB 반영
        await updateProcessRate();

        if (currentRate.value >= 100) {
            // 현재 공정 완료
            clearInterval(rateTimer);
            rateTimer = null;
            await completeCurrentProcess();
        }
    }, 1000);
};

// 현재 공정 완료 처리 후 다음 공정으로 넘어가기
const completeCurrentProcess = async () => {
    // DB에서 이 공정을 완료 상태로
    await completeProcessOnDB();

    // 다음 공정이 남아있으면 인덱스 증가 + 다음 공정 진행
    if (currentProcessIndex.value < details.value.length - 1) {
        currentProcessIndex.value += 1;
        startRateTimer();
    } else {
        // 모든 공정 완료
        isRunning.value = false;
        isFinishedAll.value = true;
        workEndTime.value = new Date();
        alert('모든 공정이 완료되었습니다. 이제 작업 종료 버튼을 눌러주세요.');
    }
};

// 작업 시작 버튼
const startWork = async () => {
    if (!work.value) {
        alert('작업 정보가 없습니다.');
        return;
    }
    if (!details.value.length) {
        alert('공정 정보가 없습니다.');
        return;
    }
    if (!selectedEq.value) {
        alert('사용할 설비를 선택해 주세요.');
        return;
    }

    if (isRunning.value) {
        alert('이미 작업이 진행 중입니다.');
        return;
    }

    workStartTime.value = new Date();
    isFinishedAll.value = false;
    currentProcessIndex.value = 0;
    currentRate.value = 0;

    // 1) 실적 등록
    await callPrdrInsert();

    // 2) 설비 상태: 사용 중 (w2)
    await updateEquipmentStat('w2');

    // 3) 첫 공정 진행 시작
    startRateTimer();
};

// 작업 종료 버튼
const endWork = async () => {
    if (!isFinishedAll.value) {
        alert('최종 공정 완료 후 작업 종료가 가능합니다.');
        return;
    }

    workEndTime.value = new Date();

    // 생산량, 진행도 등은 실제 비즈니스 룰에 맞게 계산
    const finalQty = details.value[details.value.length - 1]?.생산량 || 0;

    // prdrEnd 호출
    await axios.put(`/api/productionwork/work/prdrend/${work.value.prdrcode}`, {
        end_date: workEndTime.value,
        total_time: totalSeconds.value, // 단위(초/분)는 백엔드 설계에 맞게
        qtt: finalQty,
        rate: 100,
        stat: 'b3' // 생산 완료
    });

    // 설비 상태: 사용 가능(w1)로 변경
    await updateEquipmentStat('w1');

    alert('작업이 종료되었습니다.');
};

// 언마운트 시 타이머 정리
onBeforeUnmount(() => {
    if (rateTimer) clearInterval(rateTimer);
});
</script>

<template>
    <div class="p-4 space-y-4">
        <!-- 기본 정보 -->
        <BasicInfo :work="work" :detail="details" />

        <!-- 생산 정보 (현재 공정 + 진행률 같이 보여줌) -->
        <ProductionInfo :work="work" :detail="details" :currentIndex="currentProcessIndex" :currentRate="currentRate" />

        <!-- 사용 가능 설비 -->
        <AvailableEquipment :selectedEq="selectedEq" @select-eq="handleSelectEquipment" />

        <div class="button-area">
            <button class="btn btn-black">작업 종료</button>
            <button class="btn btn-yellow">작업 시작</button>
        </div>
    </div>
</template>

<style scoped>
.button-area {
    display: flex;
    justify-content: center; /* 가로 중앙 */
    align-items: center; /* 세로 중앙 */
    gap: 15px; /* 버튼 간격 */
    margin-top: 20px;
}
.btn {
    border: none;
    border-radius: 2px;
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
}

.btn-black {
    background: #727272;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-yellow {
    background: #d6a022;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}
</style>
