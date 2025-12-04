<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    basic: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:basic']);

const thisBasic = reactive({
    resultCode: '',
    inspector: '',
    startDate: '',
    endDate: '',
    defectQty: '',
    note: ''
});

watch(
    () => props.basic,
    (val) => {
        if (!val) {
            return;
        }
        Object.assign(thisBasic, val);
    },
    { deep: true, immediate: true }
);

watch(
    thisBasic,
    (val) => {
        emit('update:basic', { ...val });
    },
    { deep: true }
);
</script>

<template>
    <div class="grid-3col">
        <div class="cell">
            <label>결과코드</label>
            <InputText v-model="thisBasic.resultCode" readonly />
        </div>

        <div class="cell">
            <label>검사자</label>
            <InputText v-model="thisBasic.inspector" />
        </div>

        <div class="cell">
            <label>시작일시</label>
            <InputText v-model="thisBasic.startDate" />
        </div>

        <div class="cell">
            <label>종료일시</label>
            <InputText v-model="thisBasic.endDate" />
        </div>

        <div class="cell">
            <label>불량수량</label>
            <InputText v-model="thisBasic.defectQty" />
        </div>

        <div class="cell">
            <label>비고</label>
            <InputText v-model="thisBasic.note" />
        </div>
    </div>
</template>

<style scoped>
.grid-3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.cell label {
    font-weight: 600;
    margin-bottom: 0.3rem;
    display: block;
}

.cell :deep(.p-inputtext) {
    width: 100%;
}
</style>
