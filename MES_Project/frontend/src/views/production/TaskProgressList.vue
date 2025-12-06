<script setup>
// TaskProgressListSearch.vue
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';
// 1. 분리된 컴포넌트 임포트 (경로는 실제 파일 구조에 맞게 수정 필요)
import SearchForm from '../../components/production/TaskProgressListSearch.vue';
import SearchTable from '../../components/production/TaskProgressListTable.vue';
let taskList = ref([]);

const getTaskList = async () => {
    let result = await axios.get(`/api/work/task`).catch((err) => console.log('작업진행도 리스트' + err));
    const res = result.data.data.result;
    taskList.value = JSON.parse(JSON.stringify(res));
    console.log(taskList.value);
};

// 로직에서 searchForm을 제거하고, 검색 조건을 관리할 ref만 남김
const searchCriteria = ref({});

// 2. 검색 이벤트 핸들러: 검색 조건을 받아와 필터링 로직 실행
const handleSearch = (form) => {
    console.log('🔍 검색 요청 수신:', form);
    searchCriteria.value = form; // 새로운 검색 조건 저장

    // 실제로는 이 곳에서 API 호출을 수행하고, 결과를 allRows에 업데이트해야 합니다.
};

// 3. 초기화 이벤트 핸들러
const handleReset = () => {
    console.log('🔄 초기화 요청 수신');
    searchCriteria.value = {}; // 검색 조건 초기화
};

const downloadExcel = () => {
    console.log('엑셀 다운로드 클릭, 현재 검색 조건:', searchCriteria.value);
};

// 📌 4. 필터링 로직 수정 (새로운 필드명 반영)
const filteredRows = computed(() => {
    const sForm = searchCriteria.value;
    if (Object.keys(sForm).length === 0 || Object.values(sForm).every((v) => v === '' || v === null)) {
        return taskList.value; // 검색 조건이 없으면 전체 반환
    }

    return taskList.value.filter((r) => {
        // 작업지시번호 (기존 releaseNo)
        if (sForm.workOrderNo && !r.workOrderNo.toLowerCase().includes(sForm.workOrderNo.toLowerCase())) return false;
        // 제품명
        if (sForm.productName && !r.productName.toLowerCase().includes(sForm.productName.toLowerCase())) return false;

        // 공정명 (새로운 필터링 항목)
        if (sForm.processName && !r.processName.toLowerCase().includes(sForm.processName.toLowerCase())) return false;

        // 작업일자 범위 (기존 date)
        if (sForm.dateFrom && r.workDate < sForm.dateFrom) return false;
        if (sForm.dateTo && r.workDate > sForm.dateTo) return false;

        // 상태 (새로운 필터링 항목 - 예시)
        if (sForm.status && r.status !== sForm.status) return false;

        // 담당자/거래처 필터링은 제거하거나 새로운 필드명 (예: manager)으로 대체 필요
        // 현재 더미 데이터에는 manager가 남아있어 임시로 manager 필터링을 유지합니다.
        if (sForm.manager && !r.manager.toLowerCase().includes(sForm.manager.toLowerCase())) return false;

        // 나머지 필터링 로직 (qty, client 등)은 데이터에서 제거되었으므로,
        // searchCriteria에서 관련 항목을 정리해야 합니다.

        return true;
    });
});
onBeforeMount(() => {
    getTaskList();
});
</script>

<template>
    <div class="forward-check-page">
        <SearchForm @search="handleSearch" @reset="handleReset" />

        <SearchTable :rows="filteredRows" @download="downloadExcel" />
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
