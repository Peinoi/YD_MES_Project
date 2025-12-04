<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['search', 'reset']);

const form = reactive({
    line: '',
    name: '',
    type: null,
    category: null,
    productName: '',
    date: '',
    result: null
});

function onSearch() {
    emit('search', { ...form });
}

function onReset() {
    Object.keys(form).forEach((k) => (form[k] = ''));
    emit('reset');
}
</script>

<template>
    <div class="card p-4 w-full">
        <!-- 3 x 3 Grid -->
        <div class="grid-3col">
            <!-- 1행 -->
            <div class="cell">
                <label>라인</label>
                <InputText class="w-full" v-model="form.line" />
            </div>

            <div class="cell">
                <label>검사명</label>
                <InputText class="w-full" v-model="form.name" />
            </div>

            <div class="cell">
                <label>검사유형</label>
                <Dropdown class="w-full" v-model="form.type" :options="[]" />
            </div>

            <!-- 2행 -->
            <div class="cell">
                <label>검사구분</label>
                <Dropdown class="w-full" v-model="form.category" :options="[]" />
            </div>

            <div class="cell">
                <label>검사일자</label>
                <InputText class="w-full" v-model="form.date" />
            </div>

            <div class="cell">
                <label>제품명</label>
                <InputText class="w-full" v-model="form.productName" />
            </div>

            <!-- 3행 -->
            <div class="cell">
                <label>결과</label>
                <Dropdown class="w-full" v-model="form.result" :options="[]" />
            </div>

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
