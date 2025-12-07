<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';
import { useQcAppService } from '../../../service/qc/qcAppService';

const qcService = useQcAppService();
const qcStore = useQcResultStore();
const { searchCriteria } = storeToRefs(qcStore);

const searchQcList = async () => {
    const result = await qcService.getQcList();
    if (!result.ok) {
        alert(result.message);
        return;
    }
};

const searchReset = () => {
    qcService.criteriaReset();
};

const qcrCodeList = [
    { key: '전체', value: null },
    { key: 'QCR-PROD-001', value: 'QCR-PROD-001' },
    { key: 'QCR-PROD-002', value: 'QCR-PROD-002' },
    { key: 'QCR-PROD-003', value: 'QCR-PROD-003' }
];
const resultList = [
    { key: '전체', value: null },
    { key: '합격', value: 'g2' },
    { key: '불합격', value: 'g1' }
];
</script>

<template>
    <div class="card p-4 w-full">
        <!-- 3 x 3 -->
        <div class="grid-3col">
            <div class="cell">
                <label>검사유형</label>
                <Dropdown class="w-full" v-model="searchCriteria.qcrCore" :options="qcrCodeList" optionLabel="key" optionValue="value" />
            </div>

            <div class="cell">
                <label>제품코드</label>
                <InputText class="w-full" v-model="searchCriteria.prodCode" />
            </div>

            <div class="cell">
                <label>품목명</label>
                <InputText class="w-full" v-model="searchCriteria.prodName" />
            </div>

            <div class="cell">
                <label>검사항목</label>
                <InputText class="w-full" v-model="searchCriteria.qcrCode" />
            </div>

            <div class="cell">
                <label>결과</label>
                <Dropdown class="w-full" v-model="searchCriteria.result" :options="resultList" optionLabel="key" optionValue="value" />
            </div>

            <div class="cell">
                <label>검사일</label>
                <Calendar class="w-full" v-model="searchCriteria.startDate" dateFormat="yy-mm-dd" showIcon inputStyle="width: 100%" />
            </div>

            <div class="cell"></div>
            <div class="cell"></div>

            <!-- 버튼 -->
            <div class="cell btn-cell">
                <Button label="초기화" class="p-button-secondary mr-2" @click="searchReset" />
                <Button label="조회" class="p-button-warning" @click="searchQcList" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.grid-3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.cell {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.btn-cell {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 0.5rem;
}
</style>
