<script setup>
import { ref, onMounted, computed } from 'vue';

// FilterMatchMode 직접 정의
const FilterMatchMode = { CONTAINS: 'contains' };

const props = defineProps({
    visible: { type: Boolean, required: true },
    title: { type: String, default: '검색' },
    columns: { type: Array, required: true },
    searchApi: { type: Function, required: true }
});

const emit = defineEmits(['update:visible', 'select']);

const listData = ref([]);
const loading = ref(false);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const searchFields = computed(() => props.columns.map((col) => col.field));

const loadData = async () => {
    loading.value = true;
    try {
        const response = await props.searchApi();
        listData.value = response.data || [];
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        listData.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    listData.value = [];
    filters.value.global.value = null;
    loadData();
});

const onRowSelect = (event) => {
    emit('select', event.data);
    close();
};

const close = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="(val) => emit('update:visible', val)" :header="title" modal :style="{ width: '50vw' }" :draggable="false" dismissableMask>
        <div class="p-2">
            <DataTable :value="listData" :loading="loading" selectionMode="single" @rowSelect="onRowSelect" :paginator="true" :rows="5" class="text-sm" stripedRows showGridlines v-model:filters="filters" :globalFilterFields="searchFields">
                <template #empty>
                    <div class="text-center p-4">데이터가 없습니다.</div>
                </template>

                <template #header>
                    <div class="p-input-icon-left w-full">
                        <InputText v-model="filters['global'].value" placeholder="검색어를 입력하세요" class="w-full" />
                        <i class="pi pi-search" />
                    </div>
                </template>

                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable headerClass="center-header bg-gray-100 font-bold" bodyClass="text-center"></Column>
            </DataTable>
        </div>
    </Dialog>
</template>

<style scoped>
/* 아이콘 래퍼 스타일 수정됨 */
.p-input-icon-left {
    position: relative;
    display: block; /* inline-block -> block 변경 */
    width: 100%; /* 너비 100% 강제 */
}
.p-input-icon-left > i {
    position: absolute;
    top: 50%;
    left: 0.75rem;
    /* margin-top: -0.5rem; */
    transform: translateY(-50%); /* 중앙 정렬 보정 */
    color: #6c757d;
    z-index: 2;
}
.p-input-icon-left > .p-inputtext {
    padding-left: 2.5rem;
    width: 100%; /* 입력창 너비 100% */
}
/* [추가] 테이블 데이터 셀 중앙 정렬 */
:deep(.text-center) {
    text-align: center !important;
}

/* [추가] 테이블 헤더 중앙 정렬 (PrimeVue Flex 구조 대응) */
:deep(.center-header .p-column-header-content) {
    justify-content: center !important;
}
</style>
