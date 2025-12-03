<script setup>
import { ref } from 'vue';

// 선택된 행들을 저장할 반응형 변수
const selectedProducts = ref();

// DataTable에 표시할 데이터 (ref로 감싸 반응형으로 만듭니다)
const tableData = ref([
    {
        itemCode: 'ITEM-001',
        itemName: '제품 A',
        standard: 'SPEC-A',
        unit: 'EA'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    },
    {
        itemCode: 'ITEM-002',
        itemName: '제품 B',
        standard: 'SPEC-B',
        unit: 'BOX'
    }
]);

// DataTable의 컬럼 정의
const columns = [
    { field: 'itemCode', header: '검사항목' }, //, readOnly: true = itemCode를 읽기 전용으로 설정
    { field: 'itemName', header: '기준값(상한)' },
    { field: 'standard', header: '기준값(하한)' },
    { field: 'unit', header: '단위' }
];

// 셀 편집 완료 시 호출될 함수
const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;
    data[field] = newValue;
};

// 통화 형식으로 변환하는 함수
const formatCurrency = (value) => {
    return value.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
};
</script>

<template>
    <!-- 기본 정보 -->
    <div>
        <div class="card flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <div class="font-semibold text-xl">기본정보</div>
                <div class="flex gap-2">
                    <Button label="삭제" :fluid="false"></Button>
                    <Button label="초기화" :fluid="false"></Button>
                    <Button label="저장" :fluid="false"></Button>
                    <Button label="검사지시 불러오기" :fluid="false"></Button>
                </div>
            </div>

            <!-- 모든 기본정보 항목을 담는 단일 Grid 컨테이너 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 검사지시코드 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사지시코드</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructionCode" type="text" class="w-full" :readonly="1" />
                    </div>
                </div>

                <!-- 지시일자 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">지시일자</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructionDate" type="text" class="w-full" />
                    </div>
                </div>

                <!-- 지시자 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">지시자</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructor" type="text" class="w-full" />
                    </div>
                </div>

                <!-- 여기에 새 항목을 추가하면 자동으로 다음 칸으로 들어갑니다. -->
            </div>
        </div>
    </div>
    <!-- 기본 정보 -->
    <div>
        <div class="card flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <div class="font-semibold text-xl">기본정보</div>
                <div class="flex gap-2">
                    <Button label="재고목록 불러오기" :fluid="false"></Button>
                    <Button label="생산실적 불러오기" :fluid="false"></Button>
                </div>
            </div>

            <!-- 모든 기본정보 항목을 담는 단일 Grid 컨테이너 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 검사대상 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사대상</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructionCode" type="text" class="w-full" />
                    </div>
                </div>

                <!-- 품목코드 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">품목코드</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructionDate" type="text" class="w-full" />
                    </div>
                </div>

                <!-- 품목이름 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">품목이름</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructor" type="text" class="w-full" />
                    </div>
                </div>

                <!-- 검사수량 -->
                <div class="grid grid-cols-12 gap-2">
                    <label for="instructionCode" class="font-semibold flex items-center justify-center col-span-12 md:col-span-4">검사수량</label>
                    <div class="col-span-12 md:col-span-8">
                        <InputText id="instructor" type="text" class="w-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 데이터테이블 -->
    <div class="card flex flex-col gap-2 flex-grow" style="max-height: 30vh">
        <div class="flex justify-between items-center flex-shrink-0">
            <div class="font-semibold text-xl">검사항목</div>
        </div>

        <DataTable
            class="w-full flex-grow min-h-0"
            v-model:selection="selectedProducts"
            :value="tableData"
            editMode="cell"
            dataKey="itemCode"
            :scrollable="true"
            scrollHeight="flex"
            @cell-edit-complete="onCellEditComplete"
            :pt="{
                column: {
                    bodycell: ({ state }) => ({
                        class: [{ '!py-0': state['d_editing'] }]
                    })
                }
            }"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" style="width: 25%">
                <template #body="{ data, field }">
                    {{ field === 'price' ? formatCurrency(data[field]) : data[field] }}
                </template>
                <template #editor="{ data, field }">
                    <!-- col.readOnly 플래그를 확인하여 읽기 전용 처리 -->
                    <template v-if="col.readOnly">
                        {{ data[field] }}
                    </template>
                    <template v-else-if="field === 'price'">
                        <InputNumber v-model="data[field]" mode="currency" currency="KRW" locale="ko-KR" autofocus fluid />
                    </template>
                    <template v-else>
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped></style>
