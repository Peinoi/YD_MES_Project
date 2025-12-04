<script setup>
import { yymmddFormat } from '../utils/dateFormat';

defineProps({
    rows: Array,
    loading: Boolean
});

function resultBody(result) {
    if (result === 'g2') {
        return `<span class="text-green-600 font-bold">합격</span>`;
    } else {
        return `<span class="text-red-600 font-bold">불합격</span>`;
    }
}
</script>

<template>
    <div class="card p-3 w-full">
        <div class="table-header">
            <span class="font-bold">검색 결과 {{ rows.length }}건</span>

            <Button label="엑셀 다운로드" icon="pi pi-file-excel" class="p-button-success" />
        </div>
        <div v-if="rows.length === 0" class="no-result">조회된 결과가 없습니다.</div>
        <DataTable v-else :value="rows" :loading="loading" dataKey="id" showGridlines size="small">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="qcr_code" header="검사유형" />
            <Column field="prod_code" header="제품코드" />
            <Column field="prod_name" header="품목명" />
            <Column field="check_method" header="검사항목" />
            <Column field="unit" header="단위" />
            <Column field="result" header="결과">
                <template #body="slotProps">
                    <span v-html="resultBody(slotProps.data.result)"></span>
                </template>
            </Column>
            <Column field="start_date" header="검사일">
                <template #body="slotProps">
                    {{ yymmddFormat(slotProps.data.start_date) }}
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style>
.no-result {
    padding: 1rem;
    text-align: center;
    color: #666;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1rem;
}
</style>
