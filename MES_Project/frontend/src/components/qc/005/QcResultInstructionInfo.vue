<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '@/stores/qc/qcResultStore';

// Pinia store 호출
const qcStore = useQcResultStore();
const { instruction } = storeToRefs(qcStore);
</script>

<template>
    <div class="grid-3col">
        <div class="cell">
            <label>지시코드</label>
            <InputText v-model="instruction.qioCode" />
        </div>

        <div class="cell">
            <label>제품명</label>
            <InputText v-model="instruction.prodName" />
        </div>

        <div class="cell">
            <label>검사유형</label>
            <InputText v-model="instruction.qcrCode" />
        </div>

        <div class="cell">
            <label>지시량</label>
            <InputText v-model="instruction.inspVol" />
        </div>
    </div>
</template>

<style scoped>
.grid-3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
