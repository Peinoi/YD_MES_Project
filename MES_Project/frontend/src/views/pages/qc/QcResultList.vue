<script setup>
import { ref } from 'vue';
import { getQcList } from '../../../service/qc/qcService';

// QC용 컴포넌트
import QcListSearch from '@/components/qc/004/QcListSearch.vue';
import QcListTable from '@/components/qc/004/QcListTable.vue';

// 검색조건
const searchCriteria = ref({});

const allRows = ref([]);

const qcListSearch = async (criteria) => {
    const result = await getQcList(criteria);
    allRows.value = result.data;
};

const searchReset = () => {
    searchCriteria.value = {};
};
</script>

<template>
    <h3>품질결과목록 조회</h3>
    <div class="qc-page">
        <QcListSearch @search="qcListSearch" @reset="searchReset" />
        <QcListTable :rows="allRows" />
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
