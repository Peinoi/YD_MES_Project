<script setup>
import { onMounted, ref, computed } from 'vue';
import SearchModal from './SearchModal.vue'; // SearchModal 컴포넌트 임포트
import { useQualityStore } from '@/stores/qualityStore';

const qualityStore = useQualityStore();

// 1. tableData를 스토어의 qcrList를 바라보는 computed 속성으로 변경합니다.
const tableData = computed(() => qualityStore.qcrList);

// 모달 관련 상태
const isModalVisible = ref(false);
const modalTitle = ref('');
const modalData = ref([]);
const modalColumns = ref([]);

// 모달 열기 함수
const openModal = async (type) => {
    if (type === 'inspection') {
        modalTitle.value = '검사지시 불러오기';
        // 스토어에 qioList 데이터가 없으면 가져옵니다.
        if (!qualityStore.qioList.length) {
            await qualityStore.fetchQIOList(); // fetchQIOList 액션이 스토어에 구현되어 있어야 합니다.
        }
        modalData.value = qualityStore.qioList;
        modalColumns.value = [
            { field: 'qio_code', header: '검사지시코드' },
            { field: 'order_date', header: '지시일자' },
            { field: 'user_name', header: '지시자' }
        ];
    } else if (type === 'stock') {
        modalTitle.value = '자재목록 불러오기';
        // 스토어에 mpr_dList 데이터가 없으면 가져옵니다.
        if (!qualityStore.mpr_dList.length) {
            await qualityStore.fetchMpr_dList();
        }
        modalData.value = qualityStore.mpr_dList;
        modalColumns.value = [
            { field: 'mpr_d_code', header: '자재 코드' },
            { field: 'mat_name', header: '자재 명' },
            { field: 'req_qtt', header: '발주수량' }
        ];
    } else if (type === 'production') {
        modalTitle.value = '생산실적 불러오기';
        // 스토어에 prdrList 데이터가 없으면 가져옵니다.
        if (!qualityStore.prdrList.length) {
            await qualityStore.fetchPrdrList();
        }
        modalData.value = qualityStore.prdrList;
        modalColumns.value = [
            { field: 'prdr_code', header: '제품 코드' },
            { field: 'prod_name', header: '제품 명' },
            { field: 'production_qtt', header: '수량' }
        ];
    }
    isModalVisible.value = true;
};

// 모달에서 데이터 선택 시 처리할 함수
const handleModalConfirm = (selectedItem) => {
    console.log('선택된 항목:', selectedItem);
    // TODO: 선택된 항목으로 폼 채우기 또는 다른 로직 수행
};

// 선택된 행들을 저장할 반응형 변수
const selectedProducts = ref();

// DataTable의 컬럼 정의
const columns = [
    { field: 'inspection_item', header: '검사항목', readOnly: true }, //, readOnly: true = itemCode를 읽기 전용으로 설정
    { field: 'range_top', header: '기준값(상한)', numeric: true, readOnly: true },
    { field: 'range_bot', header: '기준값(하한)', numeric: true, readOnly: true },
    { field: 'note', header: '단위', readOnly: true }
];

// 셀 편집 완료 시 호출될 함수
const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;
    // InputNumber가 빈 문자열을 null로 반환할 수 있으므로 처리
    data[field] = newValue === null ? 0 : newValue;
};

// 숫자 형식(천 단위 구분 기호)으로 변환하는 함수
const formatNumber = (value) => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('ko-KR');
};

// 컬럼의 field에 따라 동적으로 body 스타일을 반환하는 함수
const getBodyStyle = (field) => {
    if (field === 'inspection_item') {
        return { textAlign: 'left' };
    }
    // 'note'와 숫자 컬럼들은 오른쪽 정렬
    if (field === 'note' || field === 'range_top' || field === 'range_bot') {
        return { textAlign: 'right' };
    }
    return { textAlign: 'center' }; // 기본값 (예: 체크박스 컬럼)
};

// 2. onMounted (또는 onBeforeMount) 훅에서 데이터 로딩을 '요청'만 합니다.
onMounted(() => {
    // 스토어에 데이터가 없으면 fetchQCRList 액션을 호출. === if(!qualityStore.hasQCRData) { qualityStore.fetchQCRList(); }
    !qualityStore.hasQCRData && qualityStore.fetchQCRList();
});
</script>

<template>
    <div class="card flex flex-col gap-2">
        <!-- 기본정보 섹션 (생략) -->
        <div class="flex justify-between items-center">
            <div class="font-semibold text-xl">기본정보</div>
            <div class="flex gap-2">
                <Button label="삭제" :fluid="false"></Button>
                <Button label="초기화" :fluid="false"></Button>
                <Button label="저장" :fluid="false"></Button>
                <Button label="검사지시 불러오기" @click="openModal('inspection')" :fluid="false"></Button>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사지시코드</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" :readonly="true" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">지시일자</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" :readonly="true" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">지시자</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" />
                </div>
            </div>
        </div>
        <div class="flex justify-between items-center">
            <div class="font-semibold text-xl">기본정보</div>
            <div class="flex gap-2">
                <Button label="재고목록 불러오기" @click="openModal('stock')" :fluid="false"></Button>
                <Button label="생산실적 불러오기" @click="openModal('production')" :fluid="false"></Button>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사대상</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">품목코드</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">품목이름</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사수량</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" class="w-full" />
                </div>
            </div>
        </div>
        <!-- 검사항목 섹션 -->
        <div class="flex justify-between items-center flex-shrink-0">
            <div class="font-semibold text-xl">검사항목</div>
        </div>

        <DataTable
            class="w-full flex-grow min-h-0"
            style="max-height: 30vh"
            v-model:selection="selectedProducts"
            :value="tableData"
            editMode="cell"
            dataKey="inspection_item"
            :scrollable="true"
            scrollHeight="flex"
            @cell-edit-complete="onCellEditComplete"
            :pt="{ column: { bodycell: ({ state }) => ({ class: [{ 'p-0': state['d_editing'] }] }) } }"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem" headerClass="text-center" :bodyStyle="{ textAlign: 'center' }"> </Column>
            <Column v-for="col of columns" :key="col.field" :field="col.field" :readOnly="col.readOnly" style="width: 25%" :bodyStyle="getBodyStyle(col.field)">
                <template #header>
                    <div class="text-center w-full font-semibold text-base">{{ col.header }}</div>
                </template>
                <template #body="{ data, field, column }">
                    <span v-if="column.props.field === 'range_top' || column.props.field === 'range_bot'">
                        {{ formatNumber(data[field]) }}
                    </span>
                    <span v-else>{{ data[field] }}</span>
                </template>
                <template #editor="{ data, field }">
                    <template v-if="col.readOnly">
                        {{ data[field] }}
                    </template>
                    <template v-else>
                        <!-- inputStyle로 내부 텍스트 정렬, pt로 패딩 및 테두리 제거하여 UI 일관성 확보 -->
                        <InputNumber v-model="data[field]" autofocus :useGrouping="true" class="w-full" :inputStyle="{ textAlign: 'right' }" :pt="{ input: { root: 'w-full h-full p-2 border-0 shadow-none' } }" />
                    </template>
                </template>
            </Column>
        </DataTable>

        <!-- SearchModal 컴포넌트 추가 -->
        <SearchModal v-model:visible="isModalVisible" :header="modalTitle" :data="modalData" :columns="modalColumns" @onConfirm="handleModalConfirm" />
    </div>
</template>

<style scoped></style>
