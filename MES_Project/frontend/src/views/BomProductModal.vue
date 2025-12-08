<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import axios from 'axios';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});
const emits = defineEmits(['update:visible', 'select']);
const productList = ref([]);
const selectedProduct = ref(null);
const typeMap = {
    j1: '봉지라면',
    j2: '컵라면(대)',
    j3: '컵라면(소)'
};

const loadProducts = async () => {
    try {
        const res = await axios.get('/api/baseinfo/bom/prodmodal');
        productList.value = res.data.map((item) => ({
            ...item,
            prod_type_label: typeMap[item.com_value] || item.com_value
        }));
    } catch (e) {
        console.error('제품 리스트 조회 실패', e);
        productList.value = []; // 에러 나도 화면은 뜨게
    }
};

watch(
    () => props.visible,
    (v) => {
        if (v) {
            loadProducts();
        }
    }
);

const onConfirm = () => {
    if (!selectedProduct.value) return;
    emits('select', {
        prod_code: selectedProduct.value.prod_code,
        prod_name: selectedProduct.value.prod_name
    });
    emits('update:visible', false);
};

const onCancel = () => {
    emits('update:visible', false);
};
</script>

<template>
    <Dialog :visible="props.visible" @update:visible="(v) => emits('update:visible', v)" modal header="품목 선택" style="width: 60vw">
        <div class="flex gap-2 mb-3"></div>

        <DataTable :value="productList" v-model:selection="selectedProduct" selectionMode="single" dataKey="prod_code" class="p-datatable-sm" scrollable scrollHeight="40vh">
            <Column selectionMode="single" headerStyle="width: 3rem" />
            <Column field="prod_code" header="제품코드" />
            <Column field="prod_name" header="제품명" />
            <Column field="prod_type_label" header="제품유형" />
        </DataTable>

        <template #footer>
            <Button label="취소" class="p-button-secondary" @click="onCancel" />
            <Button label="확인" class="p-button-warning" @click="onConfirm" />
        </template>
    </Dialog>
</template>
