<script setup>
const props = defineProps({
    rows: Array,
    loading: Boolean
});

console.log(props);

function resultBody(row) {
    return row.result === '합격' ? `<span class="text-green-600 font-bold">${row.result}</span>` : `<span class="text-red-600 font-bold">${row.result}</span>`;
}
</script>

<template>
    <div class="card p-3 w-full">
        <div class="table-header">
            <span class="font-bold">검색 결과 {{ rows.length }}건</span>

            <Button label="엑셀 다운로드" icon="pi pi-file-excel" class="p-button-success" />
        </div>

        <DataTable :value="rows" :loading="loading" dataKey="id" showGridlines size="small">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="type" header="검사유형" />
            <Column field="process" header="공정" />
            <Column field="code" header="제품코드" />
            <Column field="name" header="품목명" />
            <Column field="item" header="검사항목" />
            <Column field="criteria" header="기준값" />
            <Column field="unit" header="단위" />
            <Column field="result" header="결과" :body="resultBody" />
            <Column field="date" header="검사일자" />
        </DataTable>
    </div>
</template>

<style scoped>
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1rem;
}
</style>
