<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';
import { useQcAppService } from '../../../service/qc/qcAppService';

const qcService = useQcAppService();
const qcStore = useQcResultStore();
const { modal } = storeToRefs(qcStore);

// 닫기
function close() {
    qcStore.closeModal();
}

// 확인
function select() {
    qcService.selectedQirCode();
}
</script>

<template>
    <Dialog v-model:visible="modal.showModal" header="검사결과 선택" modal :draggable="false" :style="{ width: '380px' }">
        <DataTable v-model:selection="modal.selectedRow" :value="modal.resultRows" selectionMode="single" dataKey="qirCode" style="margin-bottom: 1rem">
            <Column field="qirCode" header="검사결과 코드"></Column>
        </DataTable>

        <div class="flex justify-content-end gap-2">
            <Button label="닫기" severity="secondary" @click="close" />
            <Button label="확인" severity="primary" :disabled="!modal.selectedRow" @click="select" />
        </div>
    </Dialog>
</template>
