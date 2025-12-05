<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '@/stores/qc/qcResultStore';

const qcStore = useQcResultStore();
const { resultItems } = storeToRefs(qcStore);

function valueCheck(row) {
    const value = Number(row.value);
    const top = Number(row.rangeTop);
    const bottom = Number(row.rangeBot);

    if (isNaN(value)) {
        row.result = '';
        return;
    }

    if (value >= bottom && value <= top) {
        row.result = '합격';
    } else {
        row.result = '불합격';
    }
}
</script>

<template>
    <div v-if="resultItems.length == 0" class="no-result">조회된 결과가 없습니다.</div>
    <DataTable v-else :value="resultItems" showGridlines size="small" tableStyle="table-layout: fixed">
        <Column field="checkMethod" header="검사항목" style="width: 20%" />
        <Column field="rangeTop" header="기준값(상)" style="width: 10%" />
        <Column field="rangeBot" header="기준값(하)" style="width: 10%" />
        <Column field="unit" header="단위" style="width: 5%" />

        <Column field="value" header="검사값" style="width: 10%">
            <template #body="{ data }">
                <InputText v-model="data.value" @input="valueCheck(data)" />
            </template>
        </Column>

        <Column field="result" header="판정" style="width: 6%">
            <template #body="{ data }">
                <InputText v-model="data.result" readonly :style="{ backgroundColor: data.result == '합격' ? '#d4f7d4' : data.result == '불합격' ? '#ffd6d6' : 'white' }" />
            </template>
        </Column>

        <Column field="note" header="비고" style="width: 35%">
            <template #body="{ data }">
                <InputText v-model="data.note" />
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
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
