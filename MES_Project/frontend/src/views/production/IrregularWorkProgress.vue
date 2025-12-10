<script setup>
// IrregularWorkProgress.vue (수정)
import { ref, computed, onBeforeMount, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { useWorkStore } from '@/stores/workStore.js';
import { useRouter } from 'vue-router';

import BasicInfo from '@/components/production/IrregularWork/BasicInfoBox.vue';
import ProductionInfo from '@/components/production/IrregularWork/ProductionInfo.vue';
import AvailableEquipment from '@/components/production/IrregularWork/AvailableEquipment.vue';

const router = useRouter();
const workStore = useWorkStore();

onBeforeMount(() => {
    workStore.restoreIrregularData();
});

const irregular = computed(() => workStore.irregularData || {});
const work = computed(() => irregular.value.work);
const details = ref(irregular.value.details || []); // ✅ ref로 변경하여 업데이트 가능하도록

const currentProcessIndex = ref(0);
const currentRate = ref(0);
const isRunning = ref(false);
const isFinishedAll = ref(false);
const selectedEq = ref(null);
const selectedEqName = ref(null);
const workStartTime = ref(null);
const workEndTime = ref(null);

let rateTimer = null;

const handleSelectEquipment = (eqCode) => {
    selectedEq.value = eqCode;
};

const currentProcess = computed(() => {
    return details.value[currentProcessIndex.value] || null;
});

const totalSeconds = computed(() => {
    const endTime = workEndTime.value || new Date();
    if (!workStartTime.value) return 0;
    return Math.floor((endTime - workStartTime.value) / 1000);
});

// ✅ 공정 목록 재조회 함수 (prdr_d_code 업데이트)
const refreshProcessList = async () => {
    const wko = work.value.code;
    const prod = work.value.prod_code;
    const result = await axios.get(`/api/productionwork/work/process/${wko}/${prod}`);
    details.value = result.data.data.result;
    console.log('✅ 공정 목록 갱신 완료:', details.value);
};

const callPrdrInsert = async () => {
    const prdr = await axios.get('/api/productionwork/work/prdrmax');
    const prdr_Value = prdr.data.data.result[0]['max(prdr_code)'];
    const [prefix, num] = prdr_Value.split('-');
    const nextNum = Number(num) + 1;
    const code = `${prefix}-${String(nextNum).padStart(3, '0')}`;

    const payload = {
        prdr_code: code,
        note: '',
        work_order_code: work.value.code,
        emp_code: 'EMP-10001',
        prod_code: work.value.prod_code,
        ord_qtt: work.value.wko_qtt
    };

    await axios.post('/api/productionwork/work/prdrinsert', payload);
    work.value.prdrcode = code;
    // 🔥 추가
    const updated = { ...work.value, prdrcode: code };
    workStore.setSelectedWork(updated);

    // 공정 재조회
    await refreshProcessList();

    console.log('🟢 [callPrdrInsert] 실적 코드 생성:', code);
    // ✅ 실적 등록 후 공정 목록 재조회 (prdr_d_code 가져오기)

    console.log('🟢 [callPrdrInsert] 실적 코드 생성:', code);
    console.log('🟢 공정 재조회 완료:', details.value);
};

const updateEquipmentStat = async (stat) => {
    if (!selectedEq.value) return;
    await axios.put(`/api/productionwork/work/availableequipmentupdate/${selectedEq.value}`, {
        stat
    });
};

const startRateTimer = () => {
    if (rateTimer) clearInterval(rateTimer);
    if (!currentProcess.value) return;
    console.log('🟡 [startRateTimer] 실행됨');
    console.log('현재 공정 index:', currentProcessIndex.value);
    console.log('현재 공정 객체:', currentProcess.value);

    isRunning.value = true;
    workStore.setWorkRunning(true);
    workStore.setCurrentProcessIndex(currentProcessIndex.value);

    currentRate.value = currentProcess.value['진행률'] || 0;

    const totalOrderQty = work.value.wko_qtt || 0;

    rateTimer = setInterval(async () => {
        currentRate.value += 10;
        if (currentRate.value > 100) currentRate.value = 100;
        console.log(`⏱ 진행률 증가중... ${currentRate.value}%`);

        const calculatedQty = Math.floor((totalOrderQty * currentRate.value) / 100);

        // 변경: 로컬에서만 증가
        currentProcess.value['진행률'] = currentRate.value;
        currentProcess.value['생산량'] = calculatedQty;
        if (currentRate.value >= 100) {
            clearInterval(rateTimer);
            rateTimer = null;
            await completeCurrentProcess();
        }
    }, 1000);
};

const completeCurrentProcess = async () => {
    if (currentProcessIndex.value < details.value.length - 1) {
        console.log('🟣 [completeCurrentProcess] 호출됨, index:', currentProcessIndex.value);

        currentProcessIndex.value += 1;
        workStore.setCurrentProcessIndex(currentProcessIndex.value);
        startRateTimer();
    } else {
        isRunning.value = false;
        isFinishedAll.value = true;
        workStore.setWorkRunning(false);
        workEndTime.value = new Date();
        alert('모든 공정이 완료되었습니다. 이제 작업 종료 버튼을 눌러주세요.');
    }
};
// IrregularWorkProgress.vue (작업 시작 부분만 최종본)
const startWork = async () => {
    if (!work.value || !details.value.length || !selectedEq.value || isRunning.value) {
        alert('작업 정보가 부족하거나 이미 진행 중입니다.');
        return;
    }

    if (!confirm('작업을 시작하시겠습니까?')) return;
    console.log(' [startWork] 호출됨');
    console.log('작업지시:', work.value);
    console.log('공정 목록(details):', details.value);
    console.log('선택 설비:', selectedEq.value);
    console.log('isRunning:', isRunning.value);

    workStartTime.value = new Date();
    currentProcessIndex.value = 0;

    // 공정 생성 + 실적 생성
    await callPrdrInsert();

    // 설비 상태 변경
    await updateEquipmentStat('w2');

    // 💡 중요: reset은 진행률만 초기화, isRunning은 건들지 않음
    workStore.resetProcessRates();

    // 💡 작업 시작 상태 저장
    workStore.setWorkRunning(true);
    workStore.setCurrentProcessIndex(0);

    // 다음 페이지로 이동 (타이머는 Productionwork.vue에서 작동)
    router.push('/Production/productionwork');
};
const endWork = async () => {
    workEndTime.value = new Date();
    const wkoCode = work.value.code;
    const prdrCode = work.value.prdrcode;
    const finalQty = work.value.wko_qtt || 0;

    try {
        // prdr_tbl 업데이트
        await axios.put(`/api/productionwork/work/prdrend/${prdrCode}`, {
            end_date: workEndTime.value,
            total_time: totalSeconds.value,
            qtt: finalQty,
            rate: 100,
            stat: 'b3'
        });

        // 모든 공정 한번에 완료 처리
        await axios.put('/api/productionwork/work/process/finish', {
            prdr_code: prdrCode,
            qtt: finalQty
        });

        // 설비 상태 복원
        if (selectedEq.value) {
            await updateEquipmentStat('w1');
        }

        // 작업지시 완료 처리
        await axios.put(`/api/productionwork/work/wkoupdate/${wkoCode}`, {
            stat: 'v2'
        });

        alert(`작업이 최종 완료되었습니다. 최종 생산량: ${finalQty}개`);

        workStore.setWorkRunning(false);
        router.push('/Production/WorkPerformance');
    } catch (error) {
        console.error('작업 종료 중 오류:', error);
        alert('작업 종료 처리 중 오류가 발생했습니다. 콘솔 확인하세요.');
    }
};

onBeforeUnmount(() => {
    if (rateTimer) clearInterval(rateTimer);
});
</script>

<template>
    <div class="p-4 space-y-4">
        <BasicInfo :work="work" :detail="details" />

        <ProductionInfo :work="work" :detail="details" :currentIndex="currentProcessIndex" :currentRate="currentRate" />

        <AvailableEquipment :selectedEq="selectedEq" @select-eq="handleSelectEquipment" />

        <div class="button-area">
            <button class="btn btn-black" @click="endWork()">작업 종료</button>
            <button class="btn btn-yellow" @click="startWork()" :disabled="isRunning || isFinishedAll">작업 시작</button>
        </div>
    </div>
</template>

<style scoped>
.button-area {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
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
