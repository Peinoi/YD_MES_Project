<script setup>
import QcResultBasicInfo from '../../../components/qc/005/QcResultBasicInfo.vue';
import QcResultInstructionInfo from '../../../components/qc/005/QcResultInstructionInfo.vue';
import QcResultItemTable from '../../../components/qc/005/QcResultTable.vue';
import QcSelectModal from '../../../components/qc/005/QcSelectModal.vue';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';

const qcStore = useQcResultStore();

// TODO: 삭제 API
const deleted = () => {};

const reset = () => qcStore.reset();

const save = () => qcStore.saveResult();

// 검사결과 불러오기
const onLoadPendingList = () => qcStore.loadPendingList();

// 검사지시 불러오기
const onLoadInstruction = () => qcStore.loadInstruction();
</script>

<template>
    <div class="qc-manage-page">
        <!-- 기본정보 -->
        <div class="section">
            <div class="section-header">
                <h3>기본정보</h3>

                <div class="top-buttons">
                    <Button label="삭제" class="p-button-danger" @click="deleted" />
                    <Button label="초기화" class="p-button-secondary" @click="reset" />
                    <Button label="저장" class="p-button-primary" @click="save" />
                    <Button label="검사결과 불러오기" class="p-button-success" @click="onLoadPendingList" />
                </div>
            </div>

            <QcResultBasicInfo />
        </div>

        <!-- 지시정보 -->
        <div class="section">
            <div class="section-header">
                <h3>지시정보</h3>

                <div class="top-buttons">
                    <Button label="검사지시 불러오기" class="p-button-success" @click="onLoadInstruction" />
                </div>
            </div>

            <QcResultInstructionInfo />
        </div>

        <!-- 검사항목 -->
        <div class="section">
            <h3>검사항목</h3>
            <QcResultItemTable />
        </div>
    </div>

    <QcSelectModal />
</template>

<style scoped>
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.top-buttons {
    display: flex;
    gap: 0.5rem;
}

.qc-manage-page {
    padding: 1.5rem;
    background: #f5f6fa;
}

.top-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.section {
    background: #fff;
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 2rem;
    border-radius: 6px;
}

.instruction-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
