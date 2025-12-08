<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';
import { useQcAppService } from '../../../service/qc/qcAppService';

const qcService = useQcAppService();
const qcStore = useQcResultStore();
const { modal } = storeToRefs(qcStore);
</script>

<template>
    <Dialog v-model:visible="modal.showModal" header="검사유형 코드 조회" modal :draggable="false" :style="{ width: '380px' }">
        <DataTable v-model:selection="modal.selectedRow" :value="modal.resultRows" selectionMode="single" dataKey="qcrCode" paginator :rows="10" style="margin-bottom: 1rem">
            <Column field="qcrCode" header="검사항목은 자동으로 기입됩니다."></Column>
        </DataTable>

        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="닫기" severity="secondary" @click="qcStore.closeModal()" />
                <Button label="선택" severity="primary" :disabled="!modal.selectedRow" @click="qcService.selectedQcrCode()" />
            </div>
        </template>
    </Dialog>
</template>
