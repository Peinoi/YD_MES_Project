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
    // 표시할 제품 유형 목록 데이터 (productTypeOptions)
    typeOptions: {
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

// 제품 유형 선택 및 데이터 전달
const selectProdType = (event) => {
    // 선택된 row 객체 전체를 부모에게 전달 (value: 'i1', label: '완제품' 등)
    emit('select', event.data);
    close();
};
</script>

<template>
    <Dialog :visible="modelValue" header="제품 유형 선택" modal class="p-dialog-md" @update:visible="close">
        <DataTable :value="typeOptions" selectionMode="single" @rowSelect="selectProdType" :rows="8" :paginator="true" dataKey="value">
            <Column field="label" header="유형명"></Column>
            <Column field="value" header="코드"></Column>
        </DataTable>
    </Dialog>
</template>
