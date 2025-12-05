<script setup>
import { reactive, watch, defineProps } from 'vue';

// 🔹 부모에서 전달된 props 정의
const props = defineProps({
    workOrderData: {
        type: Object,
        default: () => ({
            productName: '',
            instructionQuantity: '',
            startDate: '',
            expectedCompletion: '',
            instructionStatus: '',
            lineType: '',
            lineCode: ''
        })
    },
    labels: {
        type: Object,
        default: () => ({
            header: '작업지시사항',
            productName: '제품명',
            instructionQuantity: '지시수량',
            startDate: '작업시작일시',
            expectedCompletion: '예상 완료일시',
            instructionStatus: '지시 상태',
            lineType: '라인 유형',
            lineCode: '라인 코드'
        })
    },
    statusOptions: {
        type: Array,
        default: () => [
            { label: '진행중', value: 'v1' },
            { label: '작업완료', value: 'v2' },
            { label: '작업보류', value: 'v3' },
            { label: '작업대기', value: 'v4' }
        ]
    }
});

// 🔹 props를 내부 reactive로 복사 (v-model용)
const localWorkOrder = reactive({ ...props.workOrderData });

// 🔹 부모 데이터 변경 시 localWorkOrder 자동 업데이트
watch(
    () => props.workOrderData,
    (newVal) => {
        Object.assign(localWorkOrder, newVal);
        console.log('props 변경됨:', newVal);
        localWorkOrder.lineType = newVal.lineCode && newVal.lineCode.trim() !== '' ? '정형' : '비정형';
    },
    { deep: true, immediate: true }
);
</script>

<template>
    <div class="work-instruction-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">{{ labels.header }}</h5>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-red-500">
            <!-- 제품명 -->
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">{{ labels.productName }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.productName" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 지시수량 -->
            <div class="grid-row border-b border-gray-200">
                <label class="label-col">{{ labels.instructionQuantity }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.instructionQuantity" class="input-field-style-compact text-right" />
                    <span class="text-sm text-gray-500 ml-2">(개)</span>
                </div>
            </div>

            <!-- 작업 시작일시 -->
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">{{ labels.startDate }}</label>
                <div class="input-col">
                    <input type="datetime-local" v-model="localWorkOrder.startDate" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 예상 완료일시 -->
            <div class="grid-row border-b border-gray-200">
                <label class="label-col">{{ labels.expectedCompletion }}</label>
                <div class="input-col">
                    <input type="datetime-local" v-model="localWorkOrder.expectedCompletion" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 지시 상태 -->
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">{{ labels.instructionStatus }}</label>
                <div class="input-col">
                    <select v-model="localWorkOrder.instructionStatus" class="input-field-style-compact select-field">
                        <option value="">선택 안함</option>
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- 라인 유형 (input 유지) -->
            <div class="grid-row border-b border-gray-200">
                <label class="label-col">{{ labels.lineType }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.lineType" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 라인 코드 (INPUT으로 변경) -->
            <div class="grid-row border-r border-gray-200">
                <label class="label-col">{{ labels.lineCode }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.lineCode" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 빈칸 유지 -->
            <div class="grid-row border-gray-200">
                <label class="label-col bg-white"></label>
                <div class="input-col bg-white"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.work-instruction-card {
    background-color: #ffffff;
    border-radius: 7px;
    width: 100%;
    margin-bottom: 24px;
    border: 1px solid #e0e0e0;
}
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border-collapse: collapse;
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
    font-size: 14px;
    font-weight: 600;
    color: #333;
    padding: 0 12px;
    border-right: 1px solid #e5e7eb;
}
.input-col {
    display: flex;
    align-items: center;
    padding: 6px 12px;
}
.input-field-style-compact {
    width: 100%;
    font-size: 15px;
    border: 1px solid #d1d5db;
    padding: 4px 8px;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.2s;
}
.input-field-style-compact:focus {
    outline: none;
    border-color: #3b82f6;
}
.select-field {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    padding-right: 25px !important;
}
</style>
