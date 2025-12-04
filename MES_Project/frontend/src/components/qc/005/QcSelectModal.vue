<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: Boolean,
    rows: { type: Array, default: () => [] }
});

const thisModelValue = {
    modelValue: false
};

console.log(props);

const emit = defineEmits(['update:modelValue', 'confirm']);

const selectedRow = ref(null);

const close = () => emit('update:modelValue', false);

const onConfirm = () => {
    emit('confirm', selectedRow.value);
    close();
};
</script>

<template>
    <Dialog v-model:visible="thisModelValue.modelValue" header="검사결과 선택" modal :draggable="false" :style="{ width: '380px' }">
        <DataTable v-model:selection="selectedRow" :value="rows" selectionMode="single" dataKey="qir_code" style="margin-bottom: 1rem">
            <Column field="qir_code" header="검사결과 코드"></Column>
        </DataTable>

        <div class="flex justify-content-end gap-2">
            <Button label="닫기" severity="secondary" @click="close" />
            <Button label="확인" severity="primary" :disabled="!selectedRow" @click="onConfirm" />
        </div>
    </Dialog>
</template>
