<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['search', 'reset']);

const form = reactive({
    qcrCore: null,
    prodCode: null,
    prodName: null,
    qcrCode: null,
    result: null,
    startDate: null
});

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

function onSearch() {
    emit('search', { ...form });
}

function onReset() {
    form.value = reactive({
        qcrCore: null,
        prodCode: null,
        prodName: null,
        qcrCode: null,
        result: null,
        startDate: null
    });
    console.log(form.value);
    emit('reset');
}
</script>

<template>
    <div class="card p-4 w-full">
        <!-- 3 x 3 -->
        <div class="grid-3col">
            <div class="cell">
                <label>검사유형</label>
                <Dropdown class="w-full" v-model="form.qcrCore" :options="qcrCodeList" optionLabel="key" optionValue="value" />
            </div>

            <div class="cell">
                <label>제품코드</label>
                <InputText class="w-full" v-model="form.prodCode" />
            </div>

            <div class="cell">
                <label>품목명</label>
                <InputText class="w-full" v-model="form.prodName" />
            </div>

            <div class="cell">
                <label>검사항목</label>
                <InputText class="w-full" v-model="form.qcrCode" />
            </div>

            <div class="cell">
                <label>결과</label>
                <Dropdown class="w-full" v-model="form.result" :options="resultList" optionLabel="key" optionValue="value" />
            </div>

            <div class="cell">
                <label>검사일</label>
                <Calendar class="w-full" v-model="form.startDate" dateFormat="yy-mm-dd" showIcon inputStyle="width: 100%" />
            </div>

            <div class="cell"></div>
            <div class="cell"></div>

            <!-- 버튼: 오른쪽 아래 셀에 위치 -->
            <div class="cell btn-cell">
                <Button label="초기화" class="p-button-secondary mr-2" @click="onReset" />
                <Button label="조회" class="p-button-warning" @click="onSearch" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.grid-3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3개 열 동일 너비 */
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

/* 버튼 셀은 우측 정렬 */
.btn-cell {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 0.5rem;
}
</style>
