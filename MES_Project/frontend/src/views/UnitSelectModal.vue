<script setup>
import { defineProps, defineEmits } from 'vue';
// PrimeVue 컴포넌트 임포트 (전역 등록되어 있다면 생략 가능)

// ------------------------------------
// 💡 Props: 부모로부터 상태와 데이터를 받음
// ------------------------------------
const props = defineProps({
    // Dialog의 visible 상태를 제어하기 위한 v-model 호환 속성
    modelValue: {
        type: Boolean,
        required: true
    },
    // 표시할 단위 목록 데이터
    unitOptions: {
        type: Array,
        required: true
    }
});

// ------------------------------------
// 💡 Emits: 부모에게 이벤트와 데이터를 전달
// ------------------------------------
const emit = defineEmits(['update:modelValue', 'select']);

// ------------------------------------
// 💡 이벤트 핸들러
// ------------------------------------

// 모달 닫기: v-model을 업데이트하여 부모 컴포넌트의 상태를 변경
const close = () => {
    emit('update:modelValue', false);
};

// 단위 선택 및 데이터 전달
const selectUnit = (event) => {
    emit('select', event.data); // 선택된 row 객체 전체를 부모에게 전달
    close(); // 선택 후 모달 닫기
};
</script>

<template>
    <Dialog :visible="modelValue" header="단위 선택" modal class="p-dialog-md" @update:visible="close">
        <DataTable :value="unitOptions" selectionMode="single" @rowSelect="selectUnit" :rows="8" :paginator="true" dataKey="value">
            <Column field="label" header="단위명"></Column>
            <Column field="value" header="코드"></Column>
        </DataTable>
    </Dialog>
</template>
