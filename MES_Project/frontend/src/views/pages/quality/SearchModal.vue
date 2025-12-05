<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    initialSearchValue: {
        type: String,
        default: ''
    },
    header: {
        type: String,
        default: '조회'
    },
    data: {
        type: Array,
        default: () => []
    },
    columns: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:visible', 'onConfirm']);

const searchValue = ref('');
const selectedRow = ref(null);
const loading = ref(false);

// 모달이 표시될 때 초기 검색값으로 설정
watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            searchValue.value = props.initialSearchValue;
            selectedRow.value = null; // 모달 열릴 때 선택 초기화
        }
    }
);

// 검색어에 따라 props.data를 필터링하는 computed 속성
const filteredData = computed(() => {
    if (!searchValue.value) {
        return props.data;
    }
    return props.data.filter((item) =>
        // 모든 컬럼의 값을 문자열로 변환하여 검색어가 포함되어 있는지 확인
        Object.values(item).some((val) => String(val).toLowerCase().includes(searchValue.value.toLowerCase()))
    );
});

// 검색 버튼 클릭 시 (실제 검색은 computed 속성이 처리하므로 특별한 동작 없음)
const handleSearch = () => {};

// 확인 버튼 클릭 시
const confirmSelection = () => {
    if (selectedRow.value) {
        emit('onConfirm', selectedRow.value);
        closeModal();
    } else {
        // 선택된 항목이 없을 경우 사용자에게 알림 (예: Toast 메시지)
        console.warn('선택된 항목이 없습니다.');
        alert('테이블에서 항목을 선택해주세요.');
    }
};

// 모달 닫기
const closeModal = () => {
    emit('update:visible', false);
};
</script>

<template>
    <Dialog :visible="props.visible" @update:visible="closeModal" modal :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '100vw' }" :draggable="false" :closable="false" :dismissableMask="true">
        <template #header> </template>
        <div class="flex flex-col gap-4">
            <!-- 검색 입력 필드 -->
            <div class="flex gap-2">
                <InputText v-model="searchValue" placeholder="검색어를 입력하세요" class="flex-grow" @keyup.enter="() => {}" />
                <Button label="조회" @click="handleSearch" icon="pi pi-search" />
            </div>

            <!-- 결과 표시 데이터 테이블 -->
            <DataTable
                :value="filteredData"
                v-model:selection="selectedRow"
                selectionMode="single"
                :dataKey="columns.length > 0 ? columns[0].field : 'id'"
                :loading="loading"
                responsiveLayout="scroll"
                scrollable
                scrollHeight="400px"
                @row-select="() => {}"
                @row-unselect="() => {}"
                @rowDblclick="confirmSelection"
            >
                <Column selectionMode="single" headerStyle="width: 3rem"></Column>
                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"></Column>
            </DataTable>
        </div>

        <template #footer>
            <Button label="취소" icon="pi pi-times" @click="closeModal" class="p-button-text" />
            <Button label="확인" icon="pi pi-check" @click="confirmSelection" />
        </template>
    </Dialog>
</template>

<style scoped>
.flex-grow {
    flex-grow: 1;
}
</style>
