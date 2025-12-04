<script setup>
import axios from 'axios';
import { onBeforeMount, ref } from 'vue';
import SearchModal from './SearchModal.vue'; // SearchModal 컴포넌트 임포트

// 모달 관련 상태
const isModalVisible = ref(false);
const modalTitle = ref('');

// 모달 열기 함수
const openModal = (type) => {
    if (type === 'inspection') {
        modalTitle.value = '검사지시 불러오기';
    } else if (type === 'stock') {
        modalTitle.value = '재고목록 불러오기';
    } else if (type === 'production') {
        modalTitle.value = '생산실적 불러오기';
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
const defaultQCRList = ref();
const tableData = ref([]);

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

// 0. 페이지 최초 로드 시 한번만 호출될 품질검사 기준 목록
const qcrList = async () => {
    const response = await axios.get('/api/quality/qcrs');
    // 백엔드 응답 형식 { code: 'Q200', data: [...] } 에서 실제 데이터 배열은 response.data.data 에 있습니다.
    defaultQCRList.value = response.data.data;
    tableData.value = defaultQCRList.value;
    console.log('qcrList code:', response.data.code);
    console.log('qcrList loaded:', tableData.value);
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

// onBeforeMount 훅
onBeforeMount(() => {
    qcrList();
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
        <SearchModal v-model:visible="isModalVisible" :header="modalTitle" @onConfirm="handleModalConfirm" />
    </div>
</template>

<style scoped></style>
