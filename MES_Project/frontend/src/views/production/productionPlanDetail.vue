<script setup>
import { ref, computed } from 'vue';
// 1. 분리된 컴포넌트 임포트 (경로는 실제 파일 구조에 맞게 수정 필요)
// import SearchForm from '../../components/production/SearchForm.vue';
import NonStandardProcess from '../../components/production/NonStandardProcess.vue';

// 검색 조건을 관리할 ref만 남김
const searchCriteria = ref({});

// 📌 1. 작업지시 관련 필드로 데이터 구조 수정 (유지)
const allRows = ref([
    {
        id: 1,
        checked: false,
        workOrderNo: 'WO20250526-001', // 작업지시번호
        productName: '스낵면', // 제품명
        processName: '포장_A라인', // 공정명
        processType: '조립', // 공정유형
        workDate: '2025-05-26', // 작업일
        startTime: '09:00', // 시작시간
        status: '진행중', // 상태
        plannedCompletion: '2025-05-26 18:00', // 완료예정
        priority: '긴급' // 우선순위
    },
    {
        id: 2,
        checked: false,
        workOrderNo: 'WO20250526-002',
        productName: '신라면',
        processName: '배합_B라인',
        processType: '가공',
        workDate: '2025-05-26',
        startTime: '13:00',
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
        workDate: '2025-05-27',
        startTime: '10:00',
        status: '대기',
        plannedCompletion: '2025-05-27 12:00',
        priority: '낮음'
    }
]);

// 2. 검색 이벤트 핸들러 (유지)
const handleSearch = (form) => {
    console.log('🔍 검색 요청 수신:', form);
    searchCriteria.value = form;
    // 실제로는 이 곳에서 API 호출을 수행해야 합니다.
};

// 3. 초기화 이벤트 핸들러 (유지)
const handleReset = () => {
    console.log('🔄 초기화 요청 수신');
    searchCriteria.value = {};
};

const downloadExcel = () => {
    console.log('엑셀 다운로드 클릭, 현재 검색 조건:', searchCriteria.value);
};

// 📌 4. 필터링 로직 정리
// 더미 데이터(allRows)에 없는 필드(manager) 및 불필요한 주석을 정리했습니다.
const filteredRows = computed(() => {
    const sForm = searchCriteria.value;

    // 검색 조건이 없거나 모두 빈 값이면 전체 반환
    const hasSearchCriteria = Object.keys(sForm).some((key) => sForm[key] !== '' && sForm[key] !== null && sForm[key] !== undefined);
    if (!hasSearchCriteria) {
        return allRows.value;
    }

    return allRows.value.filter((r) => {
        // 작업지시번호
        if (sForm.workOrderNo && !r.workOrderNo.toLowerCase().includes(sForm.workOrderNo.toLowerCase())) return false;

        // 제품명
        if (sForm.productName && !r.productName.toLowerCase().includes(sForm.productName.toLowerCase())) return false;

        // 공정명
        if (sForm.processName && !r.processName.toLowerCase().includes(sForm.processName.toLowerCase())) return false;

        // 작업일자 범위
        if (sForm.dateFrom && r.workDate < sForm.dateFrom) return false;
        if (sForm.dateTo && r.workDate > sForm.dateTo) return false;

        // 상태
        if (sForm.status && r.status !== sForm.status) return false;

        // ⭐ 정리된 코드: 더미 데이터에 없는 'manager', 'qty', 'client' 관련 필터링 로직은 제거되었습니다.

        return true;
    });
});
</script>

<template>
    <div class="forward-check-page">
        <!-- <SearchForm @search="handleSearch" @reset="handleReset" /> -->

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
