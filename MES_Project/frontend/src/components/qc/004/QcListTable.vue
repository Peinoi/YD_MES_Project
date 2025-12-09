<script setup>
import * as XLSX from 'xlsx';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';
import { useQcAppService } from '../../../service/qc/qcAppService';

const qcService = useQcAppService();
const qcStore = useQcResultStore();
const { qcList } = storeToRefs(qcStore);

const selectedRows = ref([]);

function downloadSelectedExcel() {
    if (!selectedRows.value.length) {
        alert('선택된 항목이 없습니다.');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedRows.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '선택항목');
    XLSX.writeFile(workbook, '선택_품질검사결과.xlsx');
}

function downloadExcel() {
    if (!qcList.value.length) {
        alert('다운로드할 데이터가 없습니다.');
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(qcList.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '검사결과');
    XLSX.writeFile(workbook, '전체_품질검사결과.xlsx');
}
</script>

<template>
    <div class="card p-3 w-full">
        <div class="table-header">
            <span class="font-bold">검색 결과 {{ qcList.length }}건</span>
            <div>
                <Button label="선택항목 다운로드" icon="pi pi-download" class="p-button-success" @click="downloadSelectedExcel" />
                <Button label="전체 엑셀 다운로드" icon="pi pi-file-excel" class="p-button-success" @click="downloadExcel" />
            </div>
        </div>
        <div v-if="qcList.length === 0" class="no-result">조회된 결과가 없습니다.</div>
        <DataTable :value="qcList" v-model:selection="selectedRows" dataKey="qirCode" paginator :rows="10" showGridlines size="small">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="qcrCode" header="검사유형" sortable />

            <Column field="prodCode" header="제품코드" sortable />

            <Column field="prodName" header="품목명" sortable />

            <Column field="checkMethod" header="검사항목" sortable />

            <Column field="unit" header="단위" sortable />

            <Column field="result" header="결과" sortable>
                <template #body="slotProps">
                    <span v-html="qcService.resultBody(slotProps.data.result)"></span>
                </template>
            </Column>

            <Column field="startDate" header="검사일" sortable>
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
