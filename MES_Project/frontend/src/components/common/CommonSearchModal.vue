<script setup>
import { ref, watch } from 'vue';

// Props 정의
const props = defineProps({
    visible: { type: Boolean, required: true }, // 모달 표시 여부
    title: { type: String, default: '검색' }, // 모달 제목
    columns: { type: Array, required: true }, // 테이블 컬럼 정의 [{field, header}]
    searchApi: { type: Function, required: true } // ★ 실행할 API 함수
});

// Emits 정의
const emit = defineEmits(['update:visible', 'select']);

// 상태
const listData = ref([]);
const loading = ref(false);

// 데이터 로드 함수
const loadData = async () => {
    loading.value = true;
    try {
        // 부모가 넘겨준 API 함수 실행
        const response = await props.searchApi();
        // 백엔드 응답 구조에 따라 data.data 혹은 data 등을 참조
        listData.value = response.data || [];
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        listData.value = [];
    } finally {
        loading.value = false;
    }
};

// 모달이 열릴 때마다 데이터 로드
watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            listData.value = []; // 초기화
            loadData();
        }
    }
);

// 행 선택 시 부모에게 이벤트 전달 후 닫기
const onRowSelect = (event) => {
    emit('select', event.data); // 선택된 행 데이터 전달
    close();
};

const close = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="(val) => emit('update:visible', val)" :header="title" modal :style="{ width: '50vw' }" :draggable="false">
        <div class="p-2">
            <DataTable :value="listData" :loading="loading" selectionMode="single" @rowSelect="onRowSelect" :paginator="true" :rows="5" class="text-sm" stripedRows showGridlines>
                <template #empty>데이터가 없습니다.</template>
                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable headerClass="text-center bg-gray-100 font-bold" bodyClass="text-center"></Column>
            </DataTable>
        </div>

        <template #footer>
            <Button label="닫기" icon="pi pi-times" text @click="close" />
        </template>
    </Dialog>
</template>
