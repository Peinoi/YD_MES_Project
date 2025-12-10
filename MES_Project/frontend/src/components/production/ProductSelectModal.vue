<script setup>
import { ref, watch } from 'vue';
import SearchSelectModal from '@/views/order/SearchSelectModal.vue';
import axios from 'axios';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    currentIndex: { type: Number, default: -1 }
});

const emit = defineEmits(['update:modelValue', 'select']);

const visible = ref(props.modelValue); // 로컬 ref 사용

const productSearchList = ref([]);

const fetchProductSearch = async (keyword = '') => {
    try {
        const res = await axios.get('/api/order/product/search', { params: { keyword } });
        if (res.data?.code === 'S200') {
            productSearchList.value = (res.data.data || []).map((p) => ({
                prod_code: p.prod_code,
                prod_name: p.prod_name,
                unit: p.unit,
                spec: p.spec,
                com_value: p.com_value,
                unit_name: p.unit_name,
                spec_name: p.spec_name,
                com_value_name: p.com_value_name,
                _selected: false
            }));
        } else {
            productSearchList.value = [];
        }
    } catch (err) {
        console.error('fetchProductSearch', err);
        productSearchList.value = [];
    }
};

const onConfirm = (row) => {
    emit('select', { row, index: props.currentIndex });
    visible.value = false;
    emit('update:modelValue', false);
};

const onCancel = () => {
    visible.value = false;
    emit('update:modelValue', false);
};

watch(
    () => props.modelValue,
    (val) => {
        visible.value = val;
        if (val) fetchProductSearch('');
    }
);
</script>

<template>
    <SearchSelectModal
        v-model="visible"
        searchPlaceholder="제품명 또는 제품코드를 입력해주세요."
        :columns="[
            { field: 'prod_code', label: '제품코드' },
            { field: 'prod_name', label: '제품명' },
            { field: 'com_value_name', label: '제품유형' }
        ]"
        :rows="productSearchList"
        rowKey="prod_code"
        @search="fetchProductSearch"
        @confirm="onConfirm"
        @cancel="onCancel"
    />
</template>
