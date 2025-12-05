<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import DefaultInfo from '../../components/production/DefaultInfo.vue';
import WorkInstructions from '../../components/production/WorkInstructions.vue';
import NonStandardProcess from '../../components/production/NonStandardProcess.vue';

const API_URL = '/api/production/plan';
const searchCriteria = ref({});
const allRows = ref([]);
const isLoading = ref(false);

// 🔹 DefaultInfo에서 받은 데이터
const otherDataFromChild = ref(null);

// WorkInstructions로 보낼 데이터
const workOrderData = ref({
    productName: '',
    instructionQuantity: '',
    startDate: '',
    expectedCompletion: '',
    instructionStatus: '',
    lineType: '',
    lineCode: ''
});

// 🔹 DefaultInfo에서 선택된 값 watch로 WorkInstructions에 반영
watch(otherDataFromChild, (newData) => {
    if (!newData) return;

    workOrderData.value.productName = newData.productName || '';
    workOrderData.value.instructionQuantity = newData.quantity || '';
    // datetime-local input은 'YYYY-MM-DDTHH:mm' 형식
    workOrderData.value.startDate = newData.startDateTime ? newData.startDateTime.slice(0, 16) : '';
    workOrderData.value.expectedCompletion = newData.dueDate ? newData.dueDate.slice(0, 16) : '';
    workOrderData.value.instructionStatus = newData.status || '';
    workOrderData.value.lineType = ''; // 필요 시 매핑
    workOrderData.value.lineCode = newData.lineCode || '';
});

// API 호출
const fetchWorkData = async (params = {}) => {
    isLoading.value = true;
    try {
        const response = await axios.get(API_URL, { params });
        allRows.value = response.data.data || [];
    } catch (error) {
        console.error('❌ 작업 데이터 로드 실패:', error);
        alert('데이터 로드 실패');
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => fetchWorkData());

// 검색/초기화
const handleSearch = (form) => {
    searchCriteria.value = form;
    fetchWorkData(form);
};

const handleReset = () => {
    searchCriteria.value = {};
    fetchWorkData();
};

const downloadExcel = () => {
    console.log('엑셀 다운로드:', searchCriteria.value);
};

// 🔹 DefaultInfo에서 선택된 값을 받는 이벤트
const handleOtherData = (data) => {
    otherDataFromChild.value = data;
    console.log('부모에서 받은 otherData:', data);
};

const filteredRows = computed(() => allRows.value);
</script>

<template>
    <div class="forward-check-page">
        <!-- DefaultInfo: 이벤트 바인딩 -->
        <DefaultInfo :plan-data="filteredRows" @updateOtherData="handleOtherData" @search="handleSearch" @reset="handleReset" />

        <!-- WorkInstructions: 부모가 받은 otherDataFromChild -> workOrderData로 매핑되어 전달 -->
        <WorkInstructions :work-order-data="workOrderData" />

        <div v-if="isLoading" class="p-4 text-center text-lg text-blue-500 font-semibold">데이터 로드 중...</div>

        <NonStandardProcess v-else :rows="[]" @download="downloadExcel" />
    </div>
</template>

<style scoped>
.forward-check-page {
    padding: 1.5rem;
    background: #f5f6fa;
    width: 100%;
    box-sizing: border-box;
}
</style>
