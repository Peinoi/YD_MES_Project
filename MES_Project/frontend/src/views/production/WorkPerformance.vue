<script setup>
// WorkPerformanceSearch.vue
import { ref, computed, onBeforeMount } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
// 1. 분리된 컴포넌트 임포트 (경로는 실제 파일 구조에 맞게 수정 필요)
import SearchForm from '../../components/production/WorkPerformanceSearch.vue';
import SearchTable from '../../components/production/WorkPerformanceTable.vue';
let performanceList = ref([]);

const getPerformanceList = async () => {
    let result = await axios.get(`/api/productionwork/work/performance`).catch((err) => console.log('작업진행도 리스트' + err));
    const res = result.data.data.result;
    performanceList.value = JSON.parse(JSON.stringify(res));
    console.log(performanceList.value);
};

// 2. 검색 이벤트 핸들러: 검색 조건을 받아와 필터링 로직 실행
const handleSearch = (form) => {
    console.log('🔍 검색 요청 수신:', form);
    searchCriteria.value = form; // 새로운 검색 조건 저장

    // 실제로는 이 곳에서 API 호출을 수행하고, 결과를 allRows에 업데이트해야 합니다.
};
// 로직에서 searchForm을 제거하고, 검색 조건을 관리할 ref만 남김
const searchCriteria = ref({});
// 3. 초기화 이벤트 핸들러
const handleReset = () => {
    console.log('🔄 초기화 요청 수신');
    searchCriteria.value = {}; // 검색 조건 초기화
    // allRows.value = fetchAllData(); // 전체 데이터 재로딩 (필요하다면)
};

const downloadExcel = () => {
    // 체크된 행만 선택
    const selected = filteredRows.value.filter((row) => row.checked);

    if (!selected.length) {
        alert('다운로드할 행을 선택해 주세요.');
        return;
    }

    // Excel 변환 데이터 구성
    const data = selected.map((row) => ({
        실적번호: row.code,
        생산일자: getDateString(row.cr_date),
        제품명: row.name,
        작업지시번호: row.order_num,
        양품수량: row.qtt,
        불량수량: row.notqtt,
        LOT번호: row.lotnum,
        라인번호: row.linecode,
        상태: row.stat
    }));

    // 워크시트/워크북 생성
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '생산실적');

    // 파일명: 생산실적_20250625.xlsx
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `생산실적_${today}.xlsx`);
};

// 📌 4. 필터링 로직 수정 (새로운 필드명 반영)
const filteredRows = computed(() => {
    const s = searchCriteria.value;

    return performanceList.value.filter((r) => {
        const rowDate = getDateString(r.cr_date); // "YYYY-MM-DD" 형식 문자열
        const start = s.startDate;
        const end = s.endDate;
        // 날짜 필터링: 문자열 비교로 안전하게 수행
        if (start && rowDate < start) return false;
        if (end && rowDate > end) return false; // 2025-06-25 > 2025-06-24 -> true, 제외됨

        if (s.name && !r.name.includes(s.name)) return false;
        if (s.linecode && !r.linecode.includes(s.linecode)) return false;
        if (s.stat && r.stat !== s.stat) return false;
        if (s.order_num && !r.order_num.includes(s.order_num)) return false;
        if (s.lotnum && !r.lotnum.includes(s.lotnum)) return false;

        return true;
    });
});

const getDateString = (str) => {
    if (!str) return '';

    // Date 객체 생성: UTC 문자열을 기준으로 로컬 시간대 Date 객체를 생성합니다.
    const date = new Date(str);

    // 로컬 시간대(KST)를 기준으로 YYYY-MM-DD 형식의 문자열을 생성합니다.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

onBeforeMount(() => {
    getPerformanceList();
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
