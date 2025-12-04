<script setup>
defineProps({
    rows: {
        type: Array,
        required: true
    }
});
</script>

<template>
    <DataTable :value="rows" showGridlines size="small">
        <!-- 선택 체크박스 -->
        <Column header="">
            <template #body="slotProps">
                <Checkbox v-model="slotProps.data.selected" />
            </template>
        </Column>

        <Column field="item" header="검사항목" />
        <Column field="top" header="기준값(상)" />
        <Column field="bottom" header="기준값(하)" />
        <Column field="unit" header="단위" />

        <Column field="value" header="검사값">
            <template #body="slotProps">
                <InputText v-model="slotProps.data.value" />
            </template>
        </Column>

        <Column field="judge" header="판정">
            <template #body="slotProps">
                <InputText v-model="slotProps.data.judge" readonly />
            </template>
        </Column>

        <Column field="note" header="비고">
            <template #body="slotProps">
                <InputText v-model="slotProps.data.note" />
            </template>
        </Column>
    </DataTable>
</template>
