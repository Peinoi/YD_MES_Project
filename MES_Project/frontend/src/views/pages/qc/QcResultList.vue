<script setup>
import { ref, computed } from 'vue';

// QC용 컴포넌트
import QcResultSearch from '@/components/qc/QcResultSearch.vue';
import QcResultTable from '@/components/qc/QcResultTable.vue';

// 검색조건
const searchCriteria = ref({});

// 더미 또는 API 데이터
const allRows = ref([]);

const handleSearch = (form) => {
    searchCriteria.value = form;
};

const handleReset = () => {
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
    <div class="qc-page">
        <QcResultSearch @search="handleSearch" @reset="handleReset" />
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
