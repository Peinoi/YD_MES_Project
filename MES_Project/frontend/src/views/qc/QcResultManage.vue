<script setup>
import QcResultBasicInfo from '../../components/qc/005/QcResultBasicInfo.vue';
import QcResultInstructionInfo from '../../components/qc/005/QcResultInstructionInfo.vue';
import QcResultItemTable from '../../components/qc/005/QcResultTable.vue';
import QcSelectModal from '../../components/qc/005/QcSelectModal.vue';
import { useQcAppService } from '../../service/qc/qcAppService';

const qcService = useQcAppService();

// 상단 버튼
const deleted = () => {};

const reset = () => qcService.reset();

const save = async () => {
    const result = await qcService.saveResult();
    if (!result.ok) {
        alert(result.message);
        return;
    }
};

// 검사결과 불러오기
async function clickPendingList() {
    const result = await qcService.loadPendingList();
    if (!result.ok) {
        alert(result.message);
        return;
    }
}

// 검사지시 불러오기
async function clickLoadInstruction() {
    const result = await qcService.loadInstruction();
    if (!result.ok) {
        alert(result.message);
        return;
    }
}
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
                    <Button label="검사결과 불러오기" class="p-button-success" @click="clickPendingList" />
                </div>
            </div>

            <QcResultBasicInfo />
        </div>

        <!-- 지시정보 -->
        <div class="section">
            <div class="section-header">
                <h3>지시정보</h3>

                <div class="top-buttons">
                    <Button label="검사지시 불러오기" class="p-button-success" @click="clickLoadInstruction" />
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
