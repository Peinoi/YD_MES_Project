<script setup>
import { onMounted, ref, computed } from 'vue';
import SearchModal from './SearchModal.vue'; // SearchModal 컴포넌트 임포트
import { useQualityStore } from '@/stores/qualityStore';

const qualityStore = useQualityStore();

// 1. tableData를 스토어의 qcrList를 바라보는 computed 속성으로 변경합니다.
const tableData = computed(() => qualityStore.qcrList); // 검사항목 테이블 데이터
const employeeManagerList = computed(() => qualityStore.getEmployeeManagers); // 지시자 목록 (getter 사용)

// 폼 데이터 상태 관리
const formState = ref({
    qio_code: '', // 검사지시코드
    insp_date: '', // 지시일자
    emp_code: '', // 지시자 코드
    emp_name: '', // 지시자
    target_type: '', // 검사대상 (자재/제품)
    item_code: '', // 품목코드
    item_name: '', // 품목이름
    item_quantity: null // 검사수량
});

// 지시자 필드의 읽기 전용 상태
const isInstructorReadOnly = ref(false);

// 모달 관련 상태
const isModalVisible = ref(false);
const modalTitle = ref('');
const modalData = ref([]);
const modalColumns = ref([]);
const modalType = ref(''); // 어떤 종류의 모달이 열렸는지 추적

// 모달 열기 함수
const openModal = async (type) => {
    modalType.value = type; // 모달 타입 저장
    if (type === 'inspection') {
        modalTitle.value = '검사지시 불러오기';
        // 스토어에 qioList 데이터가 없으면 가져옵니다.
        if (!qualityStore.qioList.length) {
            await qualityStore.fetchQIOList(); // fetchQIOList 액션이 스토어에 구현되어 있어야 합니다.
        }
        modalData.value = qualityStore.qioList;
        modalColumns.value = [
            { field: 'qio_code', header: '검사지시코드' },
            { field: 'insp_date', header: '지시일자' },
            { field: 'emp_name', header: '지시자' }
        ];
        // TODO: dataKey prop 추가 필요
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
        // TODO: dataKey prop 추가 필요
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
        // TODO: dataKey prop 추가 필요
    }
    isModalVisible.value = true;
};
// 모달에서 데이터 선택 시 처리할 함수
const handleModalConfirm = async (selectedItem) => {
    if (!selectedItem) return;
    console.log('나이거골랐어용 이거에용', selectedItem);
    if (modalType.value === 'inspection') {
        formState.value.qio_code = selectedItem.qio_code;
        formState.value.insp_date = selectedItem.insp_date;
        formState.value.emp_name = selectedItem.emp_name;
        formState.value.emp_code = ''; // 불러오기 시에는 코드가 없으므로 초기화
        isInstructorReadOnly.value = true; // 지시자 필드를 읽기 전용으로 설정

        const { qio_code, prdr_code, mpr_d_code } = selectedItem;
        await qualityStore.loadInspectionDetails({ qio_code, prdr_code, mpr_d_code });

        if ((selectedItem.prdr_code != null && selectedItem.mpr_d_code == null) || (selectedItem.prdr_code == null && selectedItem.mpr_d_code != null)) {
            if (selectedItem.mpr_d_code != null) {
                formState.value.target_type = '자재';
                formState.value.item_code = qualityStore.selectedQIO[0][0].mpr_d_code;
                formState.value.item_name = qualityStore.selectedQIO[0][0].mat_name;
                formState.value.item_quantity = qualityStore.selectedQIO[0][0].req_qtt;
            } else if (selectedItem.prdr_code != null) {
                formState.value.target_type = '제품';
                formState.value.item_code = qualityStore.selectedQIO[0][0].prdr_code;
                formState.value.item_name = qualityStore.selectedQIO[0][0].prod_name;
                formState.value.item_quantity = qualityStore.selectedQIO[0][0].production_qtt;
            }
        }

        selectedProducts.value = [];
        qualityStore.selectedQIO[1].forEach((item) => {
            selectedProducts.value.push({
                qcr_code: item.qcr_code,
                inspection_item: item.inspection_item,
                range_top: item.range_top,
                range_bot: item.range_bot,
                note: item.note
            });
        });
    } else if (modalType.value === 'stock') {
        formState.value.target_type = '자재';
        formState.value.item_code = selectedItem.mpr_d_code;
        formState.value.item_name = selectedItem.mat_name;
        formState.value.item_quantity = selectedItem.req_qtt;
    } else if (modalType.value === 'production') {
        formState.value.target_type = '제품';
        formState.value.item_code = selectedItem.prdr_code;
        formState.value.item_name = selectedItem.prod_name;
        formState.value.item_quantity = selectedItem.production_qtt;
    }
};

// 화면 상태를 초기화하는 함수
const resetForm = () => {
    formState.value = {
        qio_code: '',
        insp_date: formatDate(new Date()), // 지시일자는 오늘 날짜로 설정
        emp_code: '',
        emp_name: '',
        target_type: '',
        item_code: '',
        item_name: '',
        item_quantity: null
    };
    // 지시자 필드 읽기 전용 상태 해제
    isInstructorReadOnly.value = false;
    // 데이터 테이블에서 선택된 항목들 초기화
    selectedProducts.value = null;
};

// 선택된 행들을 저장할 반응형 변수
const selectedProducts = ref([]);

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

// 날짜를 'YYYY-MM-DD' 형식으로 포맷하는 함수
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 2. onMounted (또는 onBeforeMount) 훅에서 데이터 로딩을 '요청'만 합니다.
onMounted(() => {
    // 스토어에 데이터가 없으면 fetchQCRList 액션을 호출. === if(!qualityStore.hasQCRData) { qualityStore.fetchQCRList(); }
    !qualityStore.hasQCRData && qualityStore.fetchQCRList();
    !qualityStore.hasEmployeeManager && qualityStore.fetchQualityEmployeeList();
    formState.value.insp_date = formatDate(new Date()); // 지시일자를 오늘 날짜로 설정
});

const seveQualityInspectionOrder = async () => {
    // 1. 유효성 검사
    if (!selectedProducts.value || selectedProducts.value.length === 0) {
        alert('검사항목을 선택해주세요.');
        return;
    }

    if (!formState.value.emp_code) {
        alert('지시자를 선택해주세요.');
        return;
    }

    if (!formState.value.target_type || !formState.value.item_code) {
        alert('검사대상을 선택해주세요.');
        return;
    }

    if (!formState.value.qio_code) {
        const saveData = {
            insp_date: formState.value.insp_date, // ✅
            emp_code: formState.value.emp_code, // ✅ Dropdown에서 선택된 emp_code 사용
            insp_vol: formState.value.item_quantity, // ✅
            prdr_code: formState.value.target_type === '제품' ? formState.value.item_code : null, // ✅ 조건부
            mpr_d_code: formState.value.target_type === '자재' ? formState.value.item_code : null, // ✅ 조건부
            qcr_codes: selectedProducts.value.map((item) => item.qcr_code) // ✅ 배열
        };
        formState.value.qio_code = await qualityStore.saveQIO(saveData); // Pinia 스토어의 saveQIO 액션 호출
    }
};
</script>

<template>
    <div class="card flex flex-col gap-2">
        <!-- 기본정보 섹션 (생략) -->
        <div class="flex justify-between items-center">
            <div class="font-semibold text-xl">기본정보</div>
            <div class="flex gap-2">
                <Button label="삭제"></Button>
                <Button label="초기화" @click="resetForm"></Button>
                <Button label="저장" @click="seveQualityInspectionOrder"></Button>
                <Button label="검사지시 불러오기" @click="openModal('inspection')"></Button>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사지시코드</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" v-model="formState.qio_code" class="w-full" :readonly="true" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">지시일자</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" v-model="formState.insp_date" class="w-full" :readonly="true" />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">지시자</label>
                <div class="col-span-12 md:col-span-8">
                    <!-- '검사지시 불러오기'로 emp_name만 있을 경우 InputText로 표시 -->
                    <InputText v-if="isInstructorReadOnly" v-model="formState.emp_name" class="w-full" :readonly="true" />
                    <!-- 직접 선택할 경우 Dropdown으로 emp_code를 모델에 바인딩 -->
                    <Dropdown v-else v-model="formState.emp_code" :options="employeeManagerList" optionLabel="emp_name" optionValue="emp_code" placeholder="지시자 선택" class="w-full" />
                </div>
            </div>
        </div>
        <div class="flex justify-between items-center mt-4">
            <div class="font-semibold text-xl">기본정보</div>
            <div class="flex gap-2">
                <Button label="재고목록 불러오기" @click="openModal('stock')"></Button>
                <Button label="생산실적 불러오기" @click="openModal('production')"></Button>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사대상</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" v-model="formState.target_type" class="w-full" readonly />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">품목코드</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" v-model="formState.item_code" class="w-full" readonly />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">품목이름</label>
                <div class="col-span-12 md:col-span-8">
                    <InputText type="text" v-model="formState.item_name" class="w-full" readonly />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사수량</label>
                <div class="col-span-12 md:col-span-8">
                    <InputNumber v-model="formState.item_quantity" class="w-full" :readonly="true" />
                </div>
            </div>
        </div>
        <!-- 검사항목 섹션 -->
        <div class="flex justify-between items-center flex-shrink-0 mt-4">
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
