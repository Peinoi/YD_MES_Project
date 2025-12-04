<script setup>
import { ref, computed } from 'vue';
import { apiTest } from '../../../api/qc/qcApi';

// QC용 컴포넌트
import QcResultSearch from '@/components/qc/QcResultSearch.vue';
import QcResultTable from '@/components/qc/QcResultTable.vue';

// 검색조건
const searchCriteria = ref({});

// 더미 또는 API 데이터
const allRows = ref([]);

const qcListSearch = async () => {
    const result = await apiTest();
    allRows.value = result;
    console.log(allRows.value);
};

const searchReset = () => {
    searchCriteria.value = {};
};

// 검색 필터링 (필요 시 확장)
const filteredRows = computed(() => {
    const f = searchCriteria.value;
    if (!f || Object.keys(f).length === 0) return allRows.value;
    return allRows.value.filter((r) => {
        if (f.line && r.line !== f.line) return false;
        if (f.inspectorName && !r.inspectorName.includes(f.inspectorName)) return false;
        if (f.type && r.type !== f.type) return false;
        return true;
    });
});
</script>

<template>
    <h3>품질결과목록 조회</h3>
    <div class="qc-page">
        <QcResultSearch @search="qcListSearch" @reset="searchReset" />
        <QcResultTable :rows="filteredRows" />
    </div>
</template>

<style scoped>
.qc-page {
    padding: 1.5rem;
    background: #f5f6fa;
    width: 100%;
    box-sizing: border-box;
}
</style>
