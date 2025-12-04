<script setup>
import { ref, watch } from 'vue';

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
    }
});

const emit = defineEmits(['update:visible', 'onConfirm']);

const searchValue = ref('');
const tableData = ref([]);
const selectedRow = ref(null);
const loading = ref(false);

// 모달이 표시될 때 초기 검색값으로 설정
watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            searchValue.value = props.initialSearchValue;
            // 모달이 열릴 때 검색을 바로 실행하고 싶다면 아래 주석을 해제하세요.
            handleSearch();
        }
    }
);

// 검색 로직 (현재는 더미 데이터 사용)
const handleSearch = () => {
    loading.value = true;
    console.log(`'${searchValue.value}' 값으로 검색을 수행합니다.`);

    // 이 부분에 실제 API 호출 또는 데이터 조회 로직을 구현해야 합니다.
    const allData = [
        { id: 'P001', name: '사과', spec: '1kg' },
        { id: 'P002', name: '바나나', spec: '1봉지' },
        { id: 'P003', name: '오렌지', spec: '1개' }
    ];
    tableData.value = allData.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(searchValue.value.toLowerCase()))
    ); // 간단한 필터링 예시
    loading.value = false;
};

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
                <InputText v-model="searchValue" placeholder="검색어를 입력하세요" class="flex-grow" @keyup.enter="handleSearch" />
                <Button label="조회" @click="handleSearch" icon="pi pi-search" />
            </div>

            <!-- 결과 표시 데이터 테이블 -->
            <DataTable
                :value="tableData"
                v-model:selection="selectedRow"
                selectionMode="single"
                dataKey="id"
                :loading="loading"
                responsiveLayout="scroll"
                scrollable
                scrollHeight="400px"
                @row-select="() => {}"
                @row-unselect="() => {}"
                @dblclick="confirmSelection"
            >
                <Column selectionMode="single" headerStyle="width: 3rem"></Column>
                <Column field="id" header="ID"></Column>
                <Column field="name" header="이름"></Column>
                <Column field="spec" header="규격"></Column>
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
