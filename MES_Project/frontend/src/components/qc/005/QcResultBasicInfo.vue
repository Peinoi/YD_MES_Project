<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';

const qcStore = useQcResultStore();
const { basic } = storeToRefs(qcStore);
</script>

<template>
    <div class="grid-4col">
        <div class="cell">
            <label>결과코드</label>
            <InputText v-model="basic.qirCode" readonly />
        </div>

        <div class="cell">
            <label>검사자</label>
            <InputText v-model="basic.qirEmpCode" readonly />
        </div>

        <div class="cell">
            <label>시작일시</label>
            <InputText v-model="basic.startDate" readonly />
        </div>

        <div class="cell">
            <label>불량수량</label>
            <InputText v-model="basic.defectQty" />
        </div>

        <div></div>

        <div></div>

        <div></div>

        <div class="cell">
            <label>비고</label>
            <InputText v-model="basic.note" readonly />
        </div>
    </div>
</template>

<style scoped>
.grid-4col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.cell label {
    font-weight: 600;
    margin-bottom: 0.3rem;
    display: block;
}

.cell :deep(.p-inputtext) {
    width: 100%;
}
</style>
