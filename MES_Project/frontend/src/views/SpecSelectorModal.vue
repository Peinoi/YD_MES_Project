<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
// Dialog, Card, RadioButton, Button 은 전역등록 가정

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    // { key, name, options:[{label,value}] } 형태
    specOptions: {
        type: Array,
        required: true
    },
    // 부모에서 들어오는 선택값: 배열 ['x1']
    currentSelection: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue', 'select']);

// ⭐ 단일 선택값 (문자열)
const selectedSpec = ref('');

// 부모 값과 동기화
watch(
    () => props.currentSelection,
    (newVal) => {
        if (Array.isArray(newVal) && newVal.length > 0) {
            selectedSpec.value = newVal[0]; // 단일 선택 유지
        } else {
            selectedSpec.value = '';
        }
    },
    { immediate: true }
);

// 닫기
const close = () => {
    emit('update:modelValue', false);
};

// 선택 완료 → 부모에 단일값 1개짜리 배열로 전달
const confirmSelection = () => {
    emit('select', selectedSpec.value ? [selectedSpec.value] : []);
    close();
};

// 코드 → label 찾기
const getLabel = (code) => {
    for (const cat of props.specOptions) {
        const found = cat.options.find((o) => o.value === code);
        if (found) return found.label;
    }
    return code;
};
</script>

<template>
    <Dialog :visible="modelValue" header="제품 규격 선택 (단일 선택)" modal class="p-dialog-xl" @update:visible="close">
        <div class="p-grid p-fluid p-mt-2">
            <div class="p-col-12 p-md-4" v-for="category in specOptions" :key="category.key">
                <Card class="spec-category-card">
                    <template #title>{{ category.name }}</template>
                    <template #content>
                        <div v-for="option in category.options" :key="option.value" class="p-field-radiobutton">
                            <RadioButton :inputId="option.value" v-model="selectedSpec" :value="option.value" name="specGroup" />
                            <label :for="option.value" class="ml-2">{{ option.label }}</label>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <template #footer>
            <div class="footer-summary">
                선택된 규격:
                <strong>{{ selectedSpec ? getLabel(selectedSpec) : '없음' }}</strong>
            </div>

            <Button label="선택 완료" icon="pi pi-check" @click="confirmSelection" autofocus />
        </template>
    </Dialog>
</template>

<style scoped>
.spec-category-card {
    height: 100%;
}
.spec-category-card :deep(.p-card-content) {
    padding-top: 0;
}
.p-field-radiobutton {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}
.footer-summary {
    margin-right: auto;
    font-size: 0.9rem;
    color: #495057;
    padding: 0.5rem;
    font-weight: 600;
}
</style>
