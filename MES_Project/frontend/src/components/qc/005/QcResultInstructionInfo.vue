<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    instruction: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:instruction']);

const thisInstruction = reactive({
    instrCode: '',
    productName: '',
    processName: '',
    type: '',
    qty: ''
});

watch(
    () => props.instruction,
    (val) => {
        if (!val) return;
        Object.assign(thisInstruction, val);
    },
    { deep: true, immediate: true }
);

watch(
    thisInstruction,
    (val) => {
        emit('update:instruction', { ...val });
    },
    { deep: true }
);
</script>

<template>
    <div class="grid-3col">
        <div class="cell">
            <label>지시코드</label>
            <InputText v-model="thisInstruction.instrCode" />
        </div>

        <div class="cell">
            <label>제품명</label>
            <InputText v-model="thisInstruction.productName" />
        </div>

        <div class="cell">
            <label>공정명</label>
            <InputText v-model="thisInstruction.processName" />
        </div>

        <div class="cell">
            <label>검사유형</label>
            <InputText v-model="thisInstruction.type" />
        </div>

        <div class="cell">
            <label>지시량</label>
            <InputText v-model="thisInstruction.qty" />
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
