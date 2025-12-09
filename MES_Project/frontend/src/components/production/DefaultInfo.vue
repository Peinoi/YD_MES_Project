<script setup>
import { ref, defineProps, computed, onMounted, defineEmits, watch } from 'vue';
import PlanModal from './PlanModal.vue';
import axios from 'axios';

// -------------------------------------
// 📌 props 정의
// -------------------------------------
const props = defineProps({
    planData: {
        type: Array,
        default: () => []
    },
    workOrderData: {
        type: Object,
        default: () => ({})
    },
    // 🔥 부모에서 받을 defaultInfoData 추가
    defaultInfoData: {
        type: Object,
        default: () => ({
            workOrderNo: '',
            productionPlanNo: '', // PK 제외
            planDate: ''
        })
    }
});

// -------------------------------------
// 📌 자식에게 전달할 formData
// -------------------------------------
const formData = ref({
    productionPlanNo: '', // PK 제외, 데이터 필드로만 사용
    workOrderNo: '', // 🔥 유일한 PK
    planDate: '',
    dueDate: '',
    planName: '',
    status: '',
    lineType: ''
});

// PlanModal에서 가져오는 기타 정보 저장
const otherDataStore = ref({});

// -------------------------------------
// 📌 자동 번호 생성 함수 (작업지시번호만 남김)
// -------------------------------------
const generateWorkOrderNo = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const prefix = `WKO-${yyyy}${mm}${dd}-`;

    // props.planData를 사용하여 다음 순번을 찾음
    // DB 조회 데이터의 필드명이 '작업지시번호'라고 가정
    const todayList = props.planData.filter((row) => row.작업지시번호 && row.작업지시번호.startsWith(prefix));

    if (todayList.length === 0) return `${prefix}001`;

    const lastNumber = todayList.map((row) => Number(row.작업지시번호.split('-')[2])).sort((a, b) => b - a)[0];

    return `${prefix}${String(lastNumber + 1).padStart(3, '0')}`;
};

// generateProductionPlanNo 함수 삭제 (PK 제외)

const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// -------------------------------------
// 📌 최초 로드시 자동 값 세팅
// -------------------------------------
onMounted(() => {
    // PK는 처음부터 세팅하지 않고 빈 값으로 유지
    if (!formData.value.planDate) formData.value.planDate = getToday();
});

// 🔥 부모에서 받은 defaultInfoData를 formData에 반영 (조회 모드 처리)
watch(
    () => props.defaultInfoData,
    (newVal) => {
        console.log('🔥 DefaultInfo - defaultInfoData 받음:', newVal);

        // 🔥 workOrderNo가 비어 있으면 (등록 모드)
        const isRegistrationMode = !newVal.workOrderNo;

        if (isRegistrationMode) {
            console.log('✅ 등록 모드 - 빈 값으로 유지');
            formData.value.workOrderNo = '';
            formData.value.productionPlanNo = ''; // 생산계획번호도 빈 값으로 유지
            formData.value.planDate = getToday();
        } else {
            console.log('✅ 조회 모드 - 받은 데이터 사용');
            // 쿼리에서 값이 들어오면 사용 (조회 모드)
            if (newVal.workOrderNo) {
                formData.value.workOrderNo = newVal.workOrderNo;
            }
            if (newVal.productionPlanNo) {
                formData.value.productionPlanNo = newVal.productionPlanNo;
            }
            if (newVal.planDate) {
                formData.value.planDate = newVal.planDate;
            }
        }

        console.log('✅ formData 업데이트 완료:', formData.value);
    },
    { deep: true, immediate: true }
);

// -------------------------------------
// 📌 부모 → DefaultInfo 자동 업데이트 (workOrderData)
// -------------------------------------
watch(
    () => props.workOrderData,
    (newVal) => {
        if (!newVal) return;

        console.log('부모1(DefaultInfo)에서 받은 workOrderData:', newVal);

        formData.value.planName = newVal.planName || '';
        formData.value.dueDate = newVal.expectedCompletion?.slice(0, 10) || '';
        formData.value.status = newVal.instructionStatus || '';
        formData.value.lineType = newVal.lineCode ? '정형' : '비정형';

        // otherDataStore에 부모 데이터 저장
        otherDataStore.value = {
            instructionQuantity: newVal.instructionQuantity,
            startDate: newVal.startDate || null,
            expectedCompletion: newVal.expectedCompletion || null,
            instructionStatus: newVal.instructionStatus,
            lineCode: newVal.lineCode,
            prodCode: newVal.prodCode // ⭐ 여기가 반드시 있어야 함
        };
    },
    { deep: true, immediate: true }
);

// -------------------------------------
// 📌 PlanModal 연동 (PK를 채우는 유일한 방법 1)
// -------------------------------------
const showPlanModal = ref(false);
const emit = defineEmits(['updateOtherData']);

const handlePlanSelected = (payload) => {
    if (!payload) return;

    const selected = payload.selectedData;

    formData.value.productionPlanNo = selected.prdp_code;
    formData.value.workOrderNo = selected.wko_code;
    formData.value.planDate = selected.prdp_date;

    otherDataStore.value = payload.otherData;

    emit('updateOtherData', otherDataStore.value);

    showPlanModal.value = false;
};

// -------------------------------------
// 📌 format plan date
// -------------------------------------
const formattedPlanDate = computed(() => {
    if (!formData.value.planDate) return '';
    const date = new Date(formData.value.planDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
});

const formatDateOnly = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// -------------------------------------
// 📌 버튼
// -------------------------------------
const handleDelete = () => console.log('삭제');
const handleReset = () => {
    console.log('🔥 초기화 버튼 클릭');

    // 등록 모드 판단
    const isRegistrationMode = !props.defaultInfoData?.workOrderNo;

    // 초기화용 새 객체 생성
    formData.value = {
        productionPlanNo: '',
        workOrderNo: '',
        planDate: getToday(),
        dueDate: '',
        planName: '',
        status: '',
        lineType: ''
    };

    otherDataStore.value = {};

    if (!isRegistrationMode) {
        // 조회 모드면 defaultInfoData 기준으로 값 채움
        formData.value.workOrderNo = props.defaultInfoData.workOrderNo || '';
        formData.value.productionPlanNo = props.defaultInfoData.productionPlanNo || '';
        formData.value.planDate = props.defaultInfoData.planDate || getToday();
    }

    // 부모에게 초기화 신호 전달
    emit('updateOtherData', otherDataStore.value);
};

// -------------------------------------
// 📌 저장 (저장 시 PK가 비어있으면 자동 생성 및 등록/수정 분기 처리)
// -------------------------------------
const handleSave = async () => {
    let wkoCode = formData.value.workOrderNo;
    let exists = false; // DB 존재 여부 플래그

    // 1. 등록 모드 (PK가 비어있는 경우) : 작업지시번호만 자동 생성
    if (!wkoCode) {
        console.log('🔥 등록 모드: 작업지시번호 자동 생성 시작');
        wkoCode = generateWorkOrderNo();

        // 화면에도 생성된 번호 반영
        formData.value.workOrderNo = wkoCode;
        // productionPlanNo는 그대로 유지하거나 (PlanModal을 통해 들어온 값), 비어있다면 빈 값으로 유지됨
    } else {
        // 2. 조회 모드 (PK가 채워져 있는 경우) : DB 존재 여부 확인
        console.log(`🔍 조회 모드: PK(${wkoCode}) 존재 여부 확인`);
        try {
            const checkResponse = await axios.get('/api/production/check', {
                params: { workOrderNo: wkoCode }
            });
            exists = checkResponse.data.exists;
        } catch (err) {
            console.error('PK 확인 중 오류 발생:', err);
            alert('데이터 존재 여부 확인 중 오류가 발생했습니다.');
            return;
        }
    }

    // 3. Payload 구성 (생성/조회된 PK 사용)
    try {
        const payload = {
            wko_qtt: otherDataStore.value?.instructionQuantity || formData.value.quantity,
            start_date: otherDataStore.value?.startDate || null,
            end_date: formatDateOnly(otherDataStore.value?.expectedCompletion) || null,
            stat: otherDataStore.value?.instructionStatus || formData.value.status,
            line_code: otherDataStore.value?.lineCode || null,

            // ⭐ 필수 추가
            prod_code: otherDataStore.value?.prodCode || formData.value.prodCode || null,

            wko_code: wkoCode
        };
        // 4. 저장/수정 실행
        if (exists) {
            // PK가 DB에 존재하면 수정 (UPDATE)
            const updateResponse = await axios.put(`/api/production/update`, payload);
            console.log('🔄 UPDATE 성공:', updateResponse.data);
            alert(`[${wkoCode}]이/가 수정되었습니다!`);
        } else {
            // PK가 DB에 존재하지 않거나 새로 생성된 경우 등록 (INSERT)
            // (TODO: INSERT API로 변경 필요)
            const insertResponse = await axios.post(`/api/production/insert`, payload);
            console.log('✨ INSERT 성공:', insertResponse.data);
            alert(`[${wkoCode}]이/가 등록되었습니다!`);
        }
    } catch (err) {
        console.error('저장 중 오류 발생:', err);
        alert('저장 과정에서 오류가 발생했습니다.');
    }
};

const handleLoadPlan = () => (showPlanModal.value = true);
</script>

<template>
    <div class="basic-info-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">기본 정보</h5>
            <div class="button-group flex space-x-2">
                <button class="btn-action bg-red-600 text-white" @click="handleDelete">삭제</button>
                <button class="btn-action bg-gray-600 text-white" @click="handleReset">초기화</button>
                <button class="btn-action bg-blue-500 text-white" @click="handleSave">저장</button>
                <button class="btn-action bg-green-500 text-white" @click="handleLoadPlan">생산계획 불러오기</button>
            </div>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-yellow-500">
            <div class="grid-row border-b border-r">
                <label class="label-col">작업지시번호</label>
                <div class="input-col">
                    <input type="text" v-model="formData.workOrderNo" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row border-b">
                <label class="label-col">생산계획번호</label>
                <div class="input-col">
                    <input type="text" v-model="formData.productionPlanNo" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row border-r">
                <label class="label-col">계획일자</label>
                <div class="input-col">
                    <input type="text" :value="formattedPlanDate" readonly class="input-readonly" />
                </div>
            </div>
        </div>
    </div>

    <PlanModal :show="showPlanModal" :plan-list="props.planData" @close="showPlanModal = false" @select="handlePlanSelected" />
</template>

<style scoped>
.basic-info-card {
    background-color: #fff;
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}
.btn-action {
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    min-width: 75px;
}
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}
.grid-row {
    display: grid;
    grid-template-columns: 130px 1fr;
    min-height: 45px;
}
.label-col {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    font-weight: 600;
}
.input-col {
    display: flex;
    align-items: center;
    padding: 6px 12px;
}
.input-readonly {
    width: 100%;
    border: 1px solid #d1d5db;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #f9f9f9;
}
</style>
