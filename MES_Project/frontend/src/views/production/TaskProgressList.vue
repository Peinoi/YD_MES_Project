<script setup>
// TaskProgressList.vue
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
// 1. 분리된 컴포넌트 임포트 (경로는 실제 파일 구조에 맞게 수정 필요)
import SearchForm from '../../components/production/TaskProgressListSearch.vue';
import SearchTable from '../../components/production/TaskProgressListTable.vue';
let taskList = ref([]);

const getTaskList = async () => {
    let result = await axios.get(`/api/productionwork/work/task`).catch((err) => console.log('작업진행도 리스트' + err));
    const res = result.data.data.result;
    //작업 완료는 표시 안함
    const filterList = JSON.parse(JSON.stringify(res)).filter((item) => {
        return item.stat == 'v4' ? false : true;
    });
    taskList.value = filterList;
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
    // 체크된 행만 찾기
    const selected = filteredRows.value.filter((row) => row.checked);

    if (!selected.length) {
        alert('다운로드할 행을 선택해 주세요.');
        return;
    }

    // Excel로 변환할 데이터 구성
    const data = selected.map((row) => ({
        작업지시번호: row.code,
        제품명: row.name,
        라인번호: row.line,
        시작일자: toDateOnly(row.start),
        종료일자: toDateOnly(row.end),
        상태: formatStat(row.stat)
    }));

    // 시트 생성
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '작업진행목록');

    // 파일명: 작업진행목록_20250625.xlsx
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `작업진행목록_${today}.xlsx`);
};

const formatStat = (stat) => {
    let value = '';
    switch (stat) {
        case 'v1':
            value = '진행중';
            break;
        case 'v2':
            value = '작업완료';
            break;
        case 'v3':
            value = '작업보류';
            break;
        case 'v4':
            value = '작업대기';
    }
    return value;
};
// 📌 4. 필터링 로직 수정 (새로운 필드명 반영)
const filteredRows = computed(() => {
    const s = searchCriteria.value;

    return taskList.value.filter((r) => {
        if (s.code && !r.code.includes(s.code)) return false;
        if (s.name && !r.name.includes(s.name)) return false;
        if (s.line && !r.line.includes(s.line)) return false;

        // 날짜 기준
        const rowDateOnly = toDateOnly(r.start);
        if (s.start && toDateOnly(r.start) !== s.start) return false;

        if (s.stat && r.stat !== s.stat) return false;
        console.log(rowDateOnly);
        return true;
    });
});

// 날짜에서 'YYYY-MM-DD'만 추출하는 함수
const toDateOnly = (dateString) => {
    if (!dateString) return '';

    const d = new Date(dateString);
    if (isNaN(d)) return '';

    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    return local;
};

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
