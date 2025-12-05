<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '@/stores/qc/qcResultStore';

const qcStore = useQcResultStore();
const { resultItems } = storeToRefs(qcStore);
</script>

<template>
    <div v-if="resultItems.length == 0" class="no-result">조회된 결과가 없습니다.</div>
    <DataTable v-else :value="resultItems" showGridlines size="small" tableLayout="fixed">
        <Column field="checkMethod" header="검사항목" style="width: 20%" />
        <Column field="rangeTop" header="기준값(상)" style="width: 10%" />
        <Column field="rangeBot" header="기준값(하)" style="width: 10%" />
        <Column field="unit" header="단위" style="width: 6%" />

        <Column field="value" header="검사값" style="width: 10%">
            <template #body="{ data }">
                <InputText v-model="data.value" />
            </template>
        </Column>

        <Column field="result" header="판정" style="width: 8%">
            <template #body="{ data }">
                <InputText v-model="data.judge" readonly />
            </template>
        </Column>

        <Column field="note" header="비고" style="width: 36%">
            <template #body="{ data }">
                <InputText v-model="data.note" />
            </template>
        </Column>
    </DataTable>
</template>

<style>
.no-result {
    padding: 1rem;
    text-align: center;
    color: #666;
}

:deep(.p-inputtext) {
    width: 100% !important;
    box-sizing: border-box;
}
</style>
