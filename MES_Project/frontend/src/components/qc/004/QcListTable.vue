<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';
import { useQcAppService } from '../../../service/qc/qcAppService';

const qcService = useQcAppService();
const qcStore = useQcResultStore();
const { qcList } = storeToRefs(qcStore);
</script>

<template>
    <div class="card p-3 w-full">
        <div class="table-header">
            <span class="font-bold">검색 결과 {{ qcList.length }}건</span>

            <Button label="엑셀 다운로드" icon="pi pi-file-excel" class="p-button-success" />
        </div>
        <div v-if="qcList.length === 0" class="no-result">조회된 결과가 없습니다.</div>
        <DataTable v-else :value="qcList" dataKey="id" paginator :rows="10" showGridlines size="small">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="qcrCode" header="검사유형" />
            <Column field="prodCode" header="제품코드" />
            <Column field="prodName" header="품목명" />
            <Column field="checkMethod" header="검사항목" />
            <Column field="unit" header="단위" />
            <Column field="result" header="결과">
                <template #body="slotProps">
                    <span v-html="qcService.resultBody(slotProps.data.result)"></span>
                </template>
            </Column>
            <Column field="startDate" header="검사일">
                <template #body="slotProps">
                    {{ slotProps.data.startDate }}
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
