<script setup>
import { ref, defineProps, computed } from 'vue';
import PlanModal from './PlanModal.vue';

const props = defineProps({
    planData: {
        type: Array,
        default: () => []
    }
});

// 📌 formData 초기 상태
const formData = ref({
    productionPlanNo: '', // prdp_code
    workOrderNo: '', // wko_code
    planDate: '', // prdp_date
    dueDate: '',
    planName: '',
    status: ''
});

// 모달 상태
const showPlanModal = ref(false);

// 버튼 이벤트
const handleDelete = () => console.log('삭제');
const handleReset = () => {
    Object.keys(formData.value).forEach((key) => (formData.value[key] = ''));
};
const handleSave = () => console.log('저장', formData.value);
const handleLoadPlan = () => (showPlanModal.value = true);

// 📌 날짜만 표시하는 computed
const formattedPlanDate = computed(() => {
    if (!formData.value.planDate) return '';
    const date = new Date(formData.value.planDate);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
});

// PlanModal에서 선택된 데이터 처리
const handlePlanSelected = (d) => {
    if (d) {
        console.log('📌 선택된 계획:', d);
        formData.value.productionPlanNo = d.prdp_code;
        formData.value.workOrderNo = d.wko_code;
        formData.value.planDate = d.prdp_date; // 원본은 그대로 저장
        formData.value.dueDate = d.due_date || '';
        formData.value.planName = d.prdp_name || '';
        formData.value.status = d.stat || '';
    }
    showPlanModal.value = false;
};
</script>

<template>
    <div class="basic-info-card p-5">
        <!-- 헤더 & 버튼 -->
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">기본 정보</h5>
            <div class="button-group flex space-x-2">
                <button class="btn-action bg-red-600 text-white" @click="handleDelete">삭제</button>
                <button class="btn-action bg-gray-600 text-white" @click="handleReset">초기화</button>
                <button class="btn-action bg-blue-500 text-white" @click="handleSave">저장</button>
                <button class="btn-action bg-green-500 text-white" @click="handleLoadPlan">생산계획 불러오기</button>
            </div>
        </div>

        <!-- 폼 -->
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
                    <!-- formattedPlanDate 사용 -->
                    <input type="text" :value="formattedPlanDate" readonly class="input-readonly" />
                </div>
            </div>

            <div class="grid-row"></div>
        </div>
    </div>

    <!-- PlanModal 연결 -->
    <PlanModal :show="showPlanModal" :plan-list="props.planData" @close="showPlanModal = false" @select="handlePlanSelected" />
</template>

<style scoped>
.basic-info-card {
    background-color: #ffffff;
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
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
.basic-info-card {
    background-color: #ffffff;
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px; /* 밑쪽 여백 추가 */
}
</style>
