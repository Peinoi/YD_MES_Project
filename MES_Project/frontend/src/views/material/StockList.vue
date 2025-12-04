<script setup>
import { ref } from 'vue';

// 자동 로더 사용 중 (PrimeVue import 생략)

const filters = ref({ keyword: '', type: 'ALL', status: 'ALL' });

const typeOptions = [
    { label: '전체', value: 'ALL' },
    { label: '원자재', value: '원자재' },
    { label: '부자재', value: '부자재' },
    { label: '포장재', value: '포장재' }
];

const statusOptions = [
    { label: '전체', value: 'ALL' },
    { label: '정상', value: '정상' },
    { label: '부족', value: '부족' },
    { label: '과다', value: '과다' },
    { label: '발주 필요', value: '발주 필요' }
];

const materialList = ref([
    { code: 'MAT-001', name: '밀가루', category: '원자재', stock: '15,500kg', status: '정상' },
    { code: 'MAT-002', name: '소프트 분말', category: '부자재', stock: '1,200kg', status: '부족' },
    { code: 'MAT-003', name: '포장지', category: '포장재', stock: '85,000매', status: '과다' },
    { code: 'MAT-004', name: '식용유', category: '원자재', stock: '350L', status: '발주 필요' },
    { code: 'MAT-005', name: '전분', category: '원자재', stock: '8,900kg', status: '정상' }
]);

const selected = ref(null);

const selectMaterial = (data) => {
    selected.value = {
        ...data,
        unit: 'kg',
        minStock: '5,000kg',
        lastInput: '2025-05-25',
        details: [
            { supplier: '대한제분', amount: '8,000kg', date: '2025-05-25', lot: 'LOT-2025-0525-001' },
            { supplier: '대문제분', amount: '4,500kg', date: '2025-05-20', lot: 'LOT-2025-0520-002' },
            { supplier: '동아밀', amount: '3,000kg', date: '2025-05-15', lot: 'LOT-2025-0515-008' }
        ],
        history: [
            { date: '2025-05-25 14:20', type: '입고', amount: '+2,000kg', supplier: '대한제분', manager: '박민수' },
            { date: '2025-05-24 09:30', type: '출고', amount: '-800kg', supplier: '대문제분', manager: '신대현' },
            { date: '2025-05-23 16:15', type: '출고', amount: '-600kg', supplier: '동아밀', manager: '배유리' }
        ]
    };
};

const search = () => {
    console.log('검색 실행', filters.value);
};

const statusColor = (status) => {
    switch (status) {
        case '정상':
            return 'success';
        case '부족':
            return 'warning';
        case '과다':
            return 'danger';
        case '발주 필요':
            return 'info';
        default:
            return null;
    }
};
</script>

<template>
    <div class="layout-wrapper p-4">
        <Card class="h-full">
            <template #title>재고 현황</template>
            <template #content>
                <div class="filter-row mb-3">
                    <InputText v-model="filters.keyword" placeholder="자재명, 자재코드 검색..." class="w-40 mr-2" />
                    <Dropdown v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="전체 분류" class="w-32 mr-2" />
                    <Dropdown v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="전체 상태" class="w-32 mr-2" />
                    <Button label="검색" @click="search" />
                </div>

                <DataTable :value="materialList" paginator :rows="5" class="text-sm custom-table" selectionMode="single" rowHover @rowSelect="(e) => selectMaterial(e.data)">
                    <Column field="code" header="자재코드" />
                    <Column field="name" header="자재명" />
                    <Column field="category" header="분류" />
                    <Column field="stock" header="현재 재고" />
                    <Column header="재고 상태">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="statusColor(data.status)" />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <Card v-if="selected" class="h-full">
            <template #title>자재 세부 사항</template>
            <template #content>
                <div class="p-2">
                    <h3 class="section-title border-blue">기본 정보</h3>
                    <div class="info-grid text-sm mb-4">
                        <div><span class="info-label">자재코드:</span> {{ selected.code }}</div>
                        <div><span class="info-label">자재명:</span> {{ selected.name }}</div>
                        <div><span class="info-label">분류:</span> {{ selected.category }}</div>
                        <div><span class="info-label">단위:</span> {{ selected.unit }}</div>
                    </div>

                    <h3 class="section-title border-green">재고 정보</h3>
                    <div class="info-grid text-sm mb-4">
                        <div><span class="info-label">현재 재고:</span> {{ selected.stock }}</div>
                        <div><span class="info-label">안전 재고:</span> {{ selected.minStock }}</div>
                        <div class="flex-center">
                            <span class="info-label mr-1">재고 상태:</span>
                            <Tag :value="selected.status" :severity="statusColor(selected.status)" />
                        </div>
                        <div><span class="info-label">최근 입고일:</span> {{ selected.lastInput }}</div>
                    </div>

                    <h3 class="section-title border-yellow">상세 재고 (공급업체별)</h3>
                    <DataTable :value="selected.details" size="small" class="mb-4 custom-table" rowHover>
                        <Column field="supplier" header="공급업체" />
                        <Column field="amount" header="수량" />
                        <Column field="date" header="입고일" />
                        <Column field="lot" header="LOT번호" />
                    </DataTable>

                    <h3 class="section-title border-red">최근 입출고 이력</h3>
                    <DataTable :value="selected.history" size="small" class="custom-table" rowHover>
                        <Column field="date" header="일시" />
                        <Column field="type" header="구분" />
                        <Column field="amount" header="수량" />
                        <Column field="supplier" header="공급업체" />
                        <Column field="manager" header="담당자" />
                    </DataTable>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
/* 섹션 타이틀 스타일 */
.section-title {
    font-weight: bold;
    font-size: 1.125rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.25rem;
    border-bottom-width: 2px;
    border-bottom-style: solid;
}

/* 색상 정의 */
.border-blue {
    border-bottom-color: #3b82f6;
}
.border-green {
    border-bottom-color: #22c55e;
}
.border-yellow {
    border-bottom-color: #d97706;
}
.border-red {
    border-bottom-color: #ef4444;
}

/* 상세 정보 헤더 볼드 처리 */
.info-label {
    font-weight: bold;
    margin-right: 4px;
    color: #374151;
}

/* ========================================= */
/* 테이블 커스텀 스타일 (헤더 중앙 정렬 수정됨) */
/* ========================================= */

/* 1. 헤더 배경색 및 텍스트 스타일 */
:deep(.custom-table .p-datatable-thead > tr > th) {
    background-color: #f3f4f6 !important;
    color: #374151;
    font-weight: bold;
}

/* 2. 헤더 내용 중앙 정렬 (핵심 수정 부분) */
/* PrimeVue 헤더는 flex 컨테이너이므로 justify-content가 필요합니다. */
/* !important를 사용하여 테마 기본 스타일을 덮어씁니다. */
:deep(.custom-table .p-column-header-content) {
    justify-content: center !important;
}

/* 3. 데이터 셀 중앙 정렬 */
:deep(.custom-table .p-datatable-tbody > tr > td) {
    text-align: center;
}

/* 레이아웃 및 유틸리티 */
.layout-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: start;
}
.filter-row {
    display: flex;
    align-items: center;
}
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}
.flex-center {
    display: flex;
    align-items: center;
}

.mr-1 {
    margin-right: 0.25rem;
}
.mr-2 {
    margin-right: 0.5rem;
}
.mb-3 {
    margin-bottom: 0.75rem;
}
.mb-4 {
    margin-bottom: 1rem;
}
.w-40 {
    width: 10rem;
}
.w-32 {
    width: 8rem;
}
.text-sm {
    font-size: 0.875rem;
}
.h-full {
    height: 100%;
}
.p-2 {
    padding: 0.5rem;
}
</style>
<style>
html,
body {
    height: 100%;
    overflow: hidden;
}
</style>
