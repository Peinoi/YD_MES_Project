<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
    visible: Boolean
});

const emit = defineEmits(['update:visible', 'select']);

const list = ref([]);
const selected = ref([]);

const typeMap = {
    i1: '완제품',
    i2: '반제품',
    i3: '부자재',
    i4: '원자재',
    t1: '원자재',
    t2: '부자재'
};

onMounted(async () => {
    const res = await axios.get('/api/baseinfo/bom/mat');
    list.value = res.data;
    console.log(res.data);
});

const close = () => emit('update:visible', false);

const confirm = () => {
    emit('select', selected.value);
    close();
};
</script>

<template>
    <Dialog :visible="props.visible" @update:visible="(value) => emit('update:visible', value)" modal header="하위 자재 추가" style="width: 60vw">
        <DataTable :value="list" v-model:selection="selected" selectionMode="multiple" dataKey="mat_code" scrollable scrollHeight="50vh">
            <Column selectionMode="multiple" headerStyle="width:3rem" />
            <Column field="mat_code" header="코드" />
            <Column field="mat_name" header="자재명" />
            <Column header="유형">
                <template #body="{ data }">
                    {{ typeMap[data.prod_type] }}
                </template>
            </Column>
        </DataTable>

        <template #footer>
            <Button label="취소" class="p-button-secondary" @click="close" />
            <Button label="추가" class="p-button-primary" @click="confirm" />
        </template>
    </Dialog>
</template>
