<script setup>
import { reactive, ref, watch, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import ProductSelectModal from '@/components/production/ProductSelectModal.vue';
import LineSelectModal from '@/components/production/LineSelectModal.vue';

const emit = defineEmits(['update:workOrderData']);

const props = defineProps({
    workOrderData: {
        type: Object,
        default: () => ({
            prodCode: '',
            productName: '',
            instructionQuantity: '',
            startDate: '',
            expectedCompletion: '',
            instructionStatus: 'v4',
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

const localWorkOrder = reactive({ ...props.workOrderData });

/* -------------------------
      제품 선택 모달
------------------------- */
const showProductModal = ref(false);
const openProductModal = () => (showProductModal.value = true);

// ✅ 제품 선택 핸들러 추가
const handleProductSelect = (payload) => {
    if (!payload || !payload.row) return;

    const selectedProduct = payload.row;

    // ✅ 선택된 제품 정보를 localWorkOrder에 할당
    localWorkOrder.prodCode = selectedProduct.prod_code || '';
    localWorkOrder.productName = selectedProduct.prod_name || '';

    console.log('✅ 선택된 제품:', selectedProduct);
    console.log('✅ 업데이트된 localWorkOrder:', localWorkOrder);

    // 모달 닫기
    showProductModal.value = false;
};

/* -------------------------
      라인 선택 모달
------------------------- */
const showLineModal = ref(false);
const lineList = ref([]); // 라인 데이터 저장

const openLineModal = async () => {
    try {
        const res = await axios.get('/api/production/line');
        lineList.value = res.data.data || [];
        showLineModal.value = true;
    } catch (error) {
        console.error('라인 조회 오류:', error);
    }
};

const handleLineSelect = (row) => {
    if (row) {
        localWorkOrder.lineCode = row.line_code;
        localWorkOrder.lineType = row.line_type === '01' ? '정형' : '비정형';
    }
    showLineModal.value = false;
};

/* -------------------------
       lineCode 변경 감시
------------------------- */
watch(
    () => localWorkOrder.lineCode,
    (newLineCode) => {
        localWorkOrder.lineType = newLineCode ? '정형' : '비정형';
        if (!newLineCode) localWorkOrder.instructionStatus = 'v4';
    },
    { immediate: true }
);

// props → localWorkOrder 동기화
watch(
    () => props.workOrderData,
    (newVal) => Object.assign(localWorkOrder, newVal),
    { deep: true, immediate: true }
);

// localWorkOrder → 부모 emit
watch(localWorkOrder, (newVal) => emit('update:workOrderData', { ...newVal }), { deep: true });
</script>

<template>
    <div class="work-instruction-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">{{ labels.header }}</h5>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-red-500">
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">{{ labels.productName }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.productName" @click="openProductModal" readonly class="input-field-style-compact product-select-field" />
                </div>
            </div>

            <div class="grid-row border-b border-gray-200">
                <label class="label-col">{{ labels.instructionQuantity }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.instructionQuantity" class="input-field-style-compact text-right" />
                    <span class="text-sm text-gray-500 ml-2">(개)</span>
                </div>
            </div>

            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">{{ labels.startDate }}</label>
                <div class="input-col">
                    <input type="datetime-local" v-model="localWorkOrder.startDate" class="input-field-style-compact" />
                </div>
            </div>

            <div class="grid-row border-b border-gray-200">
                <label class="label-col">{{ labels.expectedCompletion }}</label>
                <div class="input-col">
                    <input type="datetime-local" v-model="localWorkOrder.expectedCompletion" class="input-field-style-compact" />
                </div>
            </div>

            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">{{ labels.instructionStatus }}</label>
                <div class="input-col">
                    <input type="text" :value="statusOptions.find((opt) => opt.value === localWorkOrder.instructionStatus)?.label || '작업대기'" class="input-field-style-compact read-only-status" readonly />
                </div>
            </div>

            <div class="grid-row border-b border-gray-200">
                <label class="label-col">{{ labels.lineType }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.lineType" class="input-field-style-compact" readonly />
                </div>
            </div>

            <div class="grid-row border-r border-gray-200">
                <label class="label-col">{{ labels.lineCode }}</label>
                <div class="input-col">
                    <input type="text" v-model="localWorkOrder.lineCode" @click="openLineModal" readonly class="input-field-style-compact product-select-field" />
                </div>
            </div>

            <div class="grid-row border-gray-200">
                <label class="label-col bg-white"></label>
                <div class="input-col bg-white"></div>
            </div>
        </div>
    </div>

    <!-- ✅ @select="handleProductSelect" 이벤트 핸들러 추가 -->
    <ProductSelectModal v-model="showProductModal" @select="handleProductSelect" />
    <LineSelectModal v-model="showLineModal" :rows="lineList" @select="handleLineSelect" />
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
.product-select-field {
    cursor: pointer;
    background-color: #f9f9f9;
}
.read-only-status {
    cursor: default;
    background-color: #f0f0f0;
}
</style>
