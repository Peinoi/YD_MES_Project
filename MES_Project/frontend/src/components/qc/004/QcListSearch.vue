<script setup>
import { storeToRefs } from 'pinia';
import { useQcResultStore } from '../../../stores/qc/qcResultStore';
import { useQcAppService } from '../../../service/qc/qcAppService';
import { onMounted } from 'vue';

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

onMounted(async () => {
    const result = await qcService.getSearchList();
    if (!result.ok) {
        alert(result.message);
        return;
    }
});
</script>

<template>
    <div class="card p-4 w-full">
        <div class="grid-3col">
            <div class="cell">
                <label>검사유형</label>
                <InputText class="w-full" v-model="searchCriteria.qcrCode" @click="qcStore.openModal" readonly />
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
                <InputText class="w-full" v-model="searchCriteria.checkMethod" placeholder="검사유형을 선택하시면 자동으로 기입됩니다." readonly />
            </div>

            <div class="cell">
                <label>결과</label>
                <Dropdown class="w-full" v-model="searchCriteria.result" :options="qcStore.searchResultList" optionLabel="key" optionValue="value" />
            </div>

            <div class="cell">
                <label>검사일</label>
                <Calendar class="w-full" v-model="searchCriteria.startDate" dateFormat="yy-mm-dd" showIcon inputStyle="width: 100%" />
            </div>

            <div class="cell"></div>
            <div class="cell"></div>

            <!-- 버튼 -->
            <div class="cell btn-cell">
                <Button label="초기화" class="p-button-secondary mr-2" @click="qcService.criteriaReset" />
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
