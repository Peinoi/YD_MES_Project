<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DefaultInfo from '../../components/production/DefaultInfo.vue';
import WorkInstructions from '../../components/production/WorkInstructions.vue';
import NonStandardProcess from '../../components/production/NonStandardProcess.vue';

// 📌 API 엔드포인트
const API_URL = '/api/production/plan';

const searchCriteria = ref({});
const allRows = ref([]);
const isLoading = ref(false);

// 🔄 데이터 불러오기
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

// 🔍 검색
const handleSearch = (form) => {
    searchCriteria.value = form;
    fetchWorkData(form);
};

// 🔄 초기화
const handleReset = () => {
    searchCriteria.value = {};
    fetchWorkData();
};

// 엑셀
const downloadExcel = () => {
    console.log('엑셀 다운로드:', searchCriteria.value);
};

// 전달용 rows
const filteredRows = computed(() => allRows.value);
</script>

<template>
    <div class="forward-check-page">
        <DefaultInfo @search="handleSearch" @reset="handleReset" :plan-data="filteredRows" />

        <WorkInstructions />

        <div v-if="isLoading" class="p-4 text-center text-lg text-blue-500 font-semibold">데이터 로드 중...</div>

        <NonStandardProcess v-else :rows="filteredRows" @download="downloadExcel" />
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
