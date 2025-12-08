<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';

import SearchForm from '../../components/production/SearchForm.vue';
import SearchTable from '../../components/production/SearchTable.vue';

const searchCriteria = ref({});
const allRows = ref([]);

// 📌 날짜 포맷: YYYY-MM-DD-HH-MM
const formatDate = (str) => {
    if (!str) return '';

    const date = new Date(str);

    const Y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const D = String(date.getDate()).padStart(2, '0');

    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');

    return `${Y}-${M}-${D}-${h}-${m}`;
};

// 🔥 YYYY-MM-DD-HH-MM → timestamp로 변환
const toTimestamp = (str) => {
    if (!str) return null;

    const parts = str.split('-'); // [YYYY, MM, DD, HH, MM]
    if (parts.length < 5) return null;

    const [Y, M, D, h, m] = parts.map(Number);
    return new Date(Y, M - 1, D, h, m).getTime();
};
const lineOptions = computed(() => {
    const codes = allRows.value.map((r) => r.lineCode).filter((code) => code && code.trim() !== '');

    const unique = [...new Set(codes)];

    return unique.map((c) => ({
        label: c + ' 라인',
        value: c
    }));
});

// 📌 데이터 로딩
const loadData = async () => {
    try {
        const response = await axios.get('/api/production/plan');

        if (response.data.success) {
            const rows = response.data.data;

            allRows.value = rows.map((r, idx) => ({
                id: idx + 1,
                checked: false,

                // 📌 UI 표시용 필드
                planNo: r['계획번호'],
                planDate: formatDate(r['계획일자']),
                dueDate: formatDate(r['납기일자']),
                planName: r['계획명'],
                workOrderNo: r['작업지시번호'],
                productName: r['제품명'],
                quantity: r['지시수량'],
                startTime: formatDate(r['작업시작일시']),
                plannedCompletion: formatDate(r['예상완료일시']),
                status: r['상태'],
                lineCode: r['작업라인코드'],
                processType: r['작업라인코드'] ? '정형' : '비정형',
                statusLabel: r['상태'] === 'v1' ? '진행중' : r['상태'] === 'v2' ? '작업완료' : r['상태'] === 'v3' ? '작업보류' : r['상태'] === 'v4' ? '작업대기' : '',
                worker: r['작업자'] || '',
                remarks: r['비고'] || '',

                // 🔥🔥🔥 핵심: 원본 전체 데이터를 그대로 저장
                original: r
            }));
        }
    } catch (error) {
        console.error('❌ 생산 계획 데이터 로딩 실패:', error);
    }
};

onMounted(loadData);

// 🔍 검색 이벤트
const handleSearch = (form) => {
    searchCriteria.value = form;
};

const handleReset = () => {
    searchCriteria.value = {};
};

// 📤 엑셀 다운
const downloadExcel = () => {
    const selected = filteredRows.value.filter((r) => r.checked);

    if (!selected.length) return alert('다운로드할 데이터를 선택해주세요.');

    const excelData = selected.map((row) => ({
        계획번호: row.planNo,
        작업지시번호: row.workOrderNo,
        계획명: row.planName,
        제품명: row.productName,
        지시수량: row.quantity,
        계획일자: row.planDate,
        납기일자: row.dueDate,
        작업시작시간: row.startTime,
        예상완료시간: row.plannedCompletion,
        공정유형: row.processType,
        상태: row.statusLabel,
        라인코드: row.lineCode
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '작업지시');

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `작업지시_${today}.xlsx`);
};

// 🔎 필터링
const filteredRows = computed(() => {
    const s = searchCriteria.value;

    return allRows.value.filter((r) => {
        const planTs = toTimestamp(r.planDate);

        // 🔥 기간 검색
        if (s.startDate) {
            const start = new Date(s.startDate).setHours(0, 0, 0, 0);
            if (planTs < start) return false;
        }
        if (s.endDate) {
            const end = new Date(s.endDate).setHours(23, 59, 59, 999);
            if (planTs > end) return false;
        }

        // 🔥 상태
        if (s.status && r.status !== s.status) return false;

        // 🔥 라인코드
        if (s.lineCode && r.lineCode !== s.lineCode) return false;

        // 🔥 제품명
        if (s.productName && !r.productName.includes(s.productName)) return false;

        // 🔥 작업지시번호 (추가)
        if (s.workOrderNo && !r.workOrderNo?.includes(s.workOrderNo)) return false;

        // 🔥 공정유형 (추가)
        if (s.processType && r.processType !== s.processType) return false;

        return true;
    });
});
</script>

<template>
    <div class="forward-check-page">
        <SearchForm :line-options="lineOptions" @search="handleSearch" @reset="handleReset" />
        <SearchTable :rows="filteredRows" @download="downloadExcel" />
    </div>
</template>

<style scoped>
.forward-check-page {
    padding: 1.5rem;
    background: #f5f6fa;
    width: 100%;
}
</style>
