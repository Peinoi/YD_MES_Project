<script setup>
import QcListSearch from '@/components/qc/004/QcListSearch.vue';
import QcListTable from '@/components/qc/004/QcListTable.vue';
import { useQcAppService } from '../../service/qc/qcAppService';
import QcSelectModal from '../../components/qc/004/QcSelectModal.vue';
import { onMounted } from 'vue';

const qcService = useQcAppService();

const searchQcList = async () => {
    const result = await qcService.getQcList();
    if (!result.ok) {
        alert(result.message);
        return;
    }
};

onMounted(() => {
    qcService.reset();
});
</script>

<template>
    <h3>품질결과목록 조회</h3>
    <div class="qc-page">
        <QcListSearch @search="searchQcList" @reset="qcService.criteriaReset()" />
        <QcListTable />
    </div>
    <QcSelectModal />
</template>

<style scoped>
.qc-page {
    padding: 1.5rem;
    background: #f5f6fa;
    width: 100%;
    box-sizing: border-box;
}
</style>
