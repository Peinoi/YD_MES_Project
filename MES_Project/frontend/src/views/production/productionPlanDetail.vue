<script setup>
import { ref, computed } from 'vue';
import DefaultInfo from '../../components/production/DefaultInfo.vue';
import WorkInstructions from '../../components/production/WorkInstructions.vue';
import NonStandardProcess from '../../components/production/NonStandardProcess.vue';

const searchCriteria = ref({});

// 📌 lineType 추가 + 시작일시 통합
const allRows = ref([
    {
        id: 1,
        checked: false,
        workOrderNo: 'WO20250526-001',
        productName: '스낵면',
        processName: '포장_A라인',
        processType: '조립',
        lineType: '라인', // 추가
        workStartDateTime: '2025-05-26T09:00', // 날짜+시간 통합
        status: '진행중',
        plannedCompletion: '2025-05-26 18:00',
        priority: '긴급'
    },
    {
        id: 2,
        checked: false,
        workOrderNo: 'WO20250526-002',
        productName: '신라면',
        processName: '배합_B라인',
        processType: '가공',
        lineType: '비라인', // 추가
        workStartDateTime: '2025-05-26T13:00',
        status: '완료',
        plannedCompletion: '2025-05-26 17:00',
        priority: '보통'
    },
    {
        id: 3,
        checked: false,
        workOrderNo: 'WO20250527-003',
        productName: '짜파게티',
        processName: '검수',
        processType: '검사',
        lineType: '라인',
        workStartDateTime: '2025-05-27T10:00',
        status: '대기',
        plannedCompletion: '2025-05-27 12:00',
        priority: '낮음'
    }
]);

const handleSearch = (form) => {
    console.log('🔍 검색 요청:', form);
    searchCriteria.value = form;
};

const handleReset = () => {
    console.log('🔄 초기화 요청');
    searchCriteria.value = {};
};

const downloadExcel = () => {
    console.log('엑셀 다운로드 클릭:', searchCriteria.value);
};

const filteredRows = computed(() => {
    const s = searchCriteria.value;

    const hasFilters = Object.keys(s).some((key) => s[key] !== '' && s[key] !== null && s[key] !== undefined);
    if (!hasFilters) return allRows.value;

    return allRows.value.filter((r) => {
        if (s.workOrderNo && !r.workOrderNo.toLowerCase().includes(s.workOrderNo.toLowerCase())) return false;

        if (s.productName && !r.productName.toLowerCase().includes(s.productName.toLowerCase())) return false;

        if (s.processName && !r.processName.toLowerCase().includes(s.processName.toLowerCase())) return false;

        // 📌 라인/비라인 필터 추가
        if (s.lineType && r.lineType !== s.lineType) return false;

        // 📌 시작일시 (datetime-local) 범위 필터
        if (s.startDateFrom && r.workStartDateTime < s.startDateFrom) return false;
        if (s.startDateTo && r.workStartDateTime > s.startDateTo) return false;

        if (s.status && r.status !== s.status) return false;

        return true;
    });
});
</script>

<template>
    <div class="forward-check-page">
        <DefaultInfo @search="handleSearch" @reset="handleReset" />

        <WorkInstructions />

        <NonStandardProcess :rows="filteredRows" @download="downloadExcel" />
    </div>
</template>

<style scoped>
.forward-check-page {
    padding: 1.5rem;
    background: #f5f6fa;
    /* 🚀 너비 확보를 위한 수정 */
    width: 100%;
    box-sizing: border-box;
}

/* 미디어 쿼리는 자식 컴포넌트로 이동함 */
@media (max-width: 640px) {
    .forward-check-page {
        padding: 1rem;
    }
}
</style>
