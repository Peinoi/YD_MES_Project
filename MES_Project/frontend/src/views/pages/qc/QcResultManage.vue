<script setup>
import { reactive, ref } from 'vue';

import QcResultBasicInfo from '../../../components/qc/005/QcResultBasicInfo.vue';
import QcResultInstructionInfo from '../../../components/qc/005/QcResultInstructionInfo.vue';
import QcResultItemTable from '../../../components/qc/005/QcResultTable.vue';
import QcSelectModal from '../../../components/common/SearchSelectModal.vue';
import { findResultList } from '../../../api/qc/qcApi';

// 기본정보
const basic = reactive({
    resultCode: '',
    inspector: '',
    startDate: '',
    endDate: '',
    defectQty: '',
    note: ''
});

// 지시정보
const instruction = reactive({
    instrCode: '',
    productName: '',
    processName: '',
    type: '',
    qty: ''
});

// 검사항목
const items = ref([
    {
        id: 1,
        selected: true,
        item: '중량',
        top: 95,
        bottom: 105,
        unit: 'g',
        value: 100,
        judge: '합격',
        note: '1'
    }
]);

// 버튼 이벤트(나중에 API 연결)
const onDelete = () => {
    // TODO: 삭제 API
};

const onReset = () => {
    Object.assign(basic, {
        resultCode: '',
        inspector: '',
        startDate: '',
        endDate: '',
        defectQty: '',
        note: ''
    });

    Object.assign(instruction, {
        instrCode: '',
        productName: '',
        processName: '',
        type: '',
        qty: ''
    });

    items.value = [];
};

const onSave = () => {
    // TODO: 저장 API
    // basic, instruction, items 를 그대로 서버로 보내면 됨
};

const showResultModal = ref(false);

const onLoadResult = async () => {
    // TODO: 검사결과 불러오기
    const result = await findResultList();
    console.log(result);
    showResultModal.value = true;
};

const onLoadInstruction = () => {
    // TODO: 검사지시 불러오기
};
</script>

<template>
    <div class="qc-manage-page">
        <!-- 기본정보 -->
        <div class="section">
            <div class="section-header">
                <h3>기본정보</h3>

                <div class="top-buttons">
                    <Button label="삭제" class="p-button-danger" @click="onDelete" />
                    <Button label="초기화" class="p-button-secondary" @click="onReset" />
                    <Button label="저장" class="p-button-primary" @click="onSave" />
                    <Button label="검사결과 불러오기" class="p-button-success" @click="onLoadResult" />
                </div>
            </div>

            <QcResultBasicInfo v-model:basic="basic" />
        </div>

        <!-- 지시정보 -->
        <div class="section">
            <div class="section-header">
                <h3>지시정보</h3>

                <div class="top-buttons">
                    <Button label="검사지시 불러오기" class="p-button-success" @click="onLoadInstruction" />
                </div>
            </div>

            <QcResultInstructionInfo v-model:instruction="instruction" />
        </div>

        <!-- 검사항목 -->
        <div class="section">
            <h3>검사항목 - 지시정보 기반으로 출력</h3>
            <QcResultItemTable v-model:rows="items" />
        </div>
    </div>

    <QcSelectModal
        v-model="showResultModal"
        :searchPlaceholder="'검사결과 검색'"
        :columns="[{ field: 'resultCode', label: '결과코드' }]"
        :rows="[
            { id: 1, resultCode: 'R0001' },
            { id: 2, resultCode: 'R0002' }
        ]"
    />
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
