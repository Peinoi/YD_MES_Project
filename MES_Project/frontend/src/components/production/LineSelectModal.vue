<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue';

const props = defineProps({
    modelValue: Boolean,
    rows: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue', 'select']);
const visible = ref(false);

// 부모 → 모달 반영
watch(
    () => props.modelValue,
    (v) => (visible.value = v)
);

// 모달 → 부모 반영
watch(visible, (v) => emit('update:modelValue', v));

// 중복 제거
const uniqueRows = computed(() => {
    const seen = new Set();
    return props.rows.filter((r) => {
        if (!r.line_code) return false;
        if (seen.has(r.line_code)) return false;
        seen.add(r.line_code);
        return true;
    });
});

const handleRowClick = (event) => {
    emit('select', event.data);
    visible.value = false;
};

const cancel = () => (visible.value = false);
</script>

<template>
    <Dialog v-model:visible="visible" modal header="라인 선택" :style="{ width: '30vw' }">
        <DataTable :value="uniqueRows" paginator :rows="10" @row-click="handleRowClick" class="line-table">
            <Column field="line_code" header="라인코드" style="text-align: center; width: 100%" />
        </DataTable>
        <template #footer>
            <Button label="취소" severity="secondary" @click="cancel" />
        </template>
    </Dialog>
</template>

<style scoped>
.line-table :deep(.p-datatable-table) {
    table-layout: auto !important;
    width: 100% !important;
}
.line-table :deep(td),
.line-table :deep(th) {
    text-align: center !important;
}
</style>
