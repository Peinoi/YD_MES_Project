<script setup>
import { defineProps, defineEmits } from 'vue';
// PrimeVue 컴포넌트 (Dialog, DataTable, Column)는 전역 등록되어 있다고 가정

// ------------------------------------
// 💡 Props 정의
// ------------------------------------
const props = defineProps({
    // Dialog의 visible 상태 (v-model)
    modelValue: {
        type: Boolean,
        required: true
    },
    // 표시할 사용 여부 목록 데이터 (isUsedOptions)
    usedOptions: {
        type: Array,
        required: true
    }
});

// ------------------------------------
// 💡 Emits 정의
// ------------------------------------
const emit = defineEmits(['update:modelValue', 'select']);

// ------------------------------------
// 💡 이벤트 핸들러
// ------------------------------------

// 모달 닫기
const close = () => {
    emit('update:modelValue', false);
};

// 사용 여부 선택 및 데이터 전달
const selectIsUsed = (event) => {
    // 선택된 row 객체 전체를 부모에게 전달 (value: 'f1', label: '미사용' 등)
    emit('select', event.data);
    close();
};
</script>

<template>
    <Dialog :visible="modelValue" header="사용 여부 선택" modal class="p-dialog-sm" @update:visible="close">
        <DataTable :value="usedOptions" selectionMode="single" @rowSelect="selectIsUsed" :rows="8" :paginator="true" dataKey="value">
            <Column field="label" header="상태"></Column>
            <Column field="value" header="코드"></Column>
        </DataTable>
    </Dialog>
</template>
