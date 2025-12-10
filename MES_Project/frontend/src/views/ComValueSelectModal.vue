<script setup>
import { defineProps, defineEmits } from 'vue';
// PrimeVue 컴포넌트 (Dialog, DataTable, Column)는 전역 등록 가정

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    // 단품 종류 목록 데이터
    comValueOptions: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'select']);

const close = () => {
    emit('update:modelValue', false);
};

// 단품 종류 선택 및 데이터 전달
const selectComValue = (event) => {
    emit('select', event.data);
    close();
};
</script>

<template>
    <Dialog :visible="modelValue" header="단품 종류 선택" modal class="p-dialog-sm" @update:visible="close">
        <DataTable :value="comValueOptions" selectionMode="single" @rowSelect="selectComValue" :rows="8" :paginator="true" dataKey="value">
            <Column field="label" header="종류명"></Column>
            <Column field="value" header="코드"></Column>
        </DataTable>
    </Dialog>
</template>
