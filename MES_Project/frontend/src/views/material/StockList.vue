<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const filters = ref({ keyword: '', type: 'ALL', status: 'ALL' });

const typeOptions = [
    { label: '전체분류', value: 'ALL' },
    { label: '원자재', value: '원자재' },
    { label: '부자재', value: '부자재' },
    { label: '포장재', value: '포장재' }
];

const statusOptions = [
    { label: '전체상태', value: 'ALL' },
    { label: '정상', value: '정상' },
    { label: '부족', value: '부족' },
    { label: '과다', value: '과다' },
    { label: '발주 필요', value: '발주 필요' }
];

const allMaterialList = [
    { code: 'MAT-001', name: '밀가루', category: '원자재', stock: '15,500kg', status: '정상' },
    { code: 'MAT-002', name: '소프트 분말', category: '부자재', stock: '1,200kg', status: '부족' },
    { code: 'MAT-003', name: '포장지', category: '포장재', stock: '85,000매', status: '과다' },
    { code: 'MAT-004', name: '식용유', category: '원자재', stock: '350L', status: '발주 필요' },
    { code: 'MAT-005', name: '전분', category: '원자재', stock: '8,900kg', status: '정상' }
];

const materialList = ref([...allMaterialList]);
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
    let filtered = [...allMaterialList];

    // 1. 키워드 필터 (자재명, 자재코드)
    const keyword = filters.value.keyword.trim().toLowerCase();
    if (keyword) {
        filtered = filtered.filter((item) => item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword));
    }

    // 2. 분류 필터
    if (filters.value.type !== 'ALL') {
        filtered = filtered.filter((item) => item.category === filters.value.type);
    }

    // 3. 재고 상태 필터
    if (filters.value.status !== 'ALL') {
        filtered = filtered.filter((item) => item.status === filters.value.status);
    }

    materialList.value = filtered;

    if (filtered.length === 0) {
        toast.add({ severity: 'warn', summary: '검색 결과 없음', detail: '조건에 맞는 자재가 없습니다.', life: 3000 });
    } else {
        toast.add({ severity: 'success', summary: '조회 성공', detail: `${filtered.length}건이 조회되었습니다.`, life: 3000 });
    }
};

const resetFilters = () => {
    filters.value = { keyword: '', type: 'ALL', status: 'ALL' };
    materialList.value = [...allMaterialList];
    selected.value = null; // 선택된 항목도 초기화
};

// 재고 상태 라벨 가져오기 (원래 statusColor 함수가 라벨 역할을 겸했으므로 그대로 사용)
const getStatusLabel = (status) => status;

// 재고 상태 severity 가져오기 (태그 색상) - 이 함수는 현재 사용되지 않지만, InOutHistory.vue와 일관성을 위해 유지
const getStatusSeverity = (status) => {
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

// 재고 상태 점 클래스 가져오기
const getStatusDotClass = (status) => {
    switch (status) {
        case '정상':
            return 'status-normal';
        case '부족':
            return 'status-insufficient';
        case '과다':
            return 'status-excess';
        case '발주 필요':
            return 'status-reorder';
        default:
            return 'status-unknown';
    }
};
</script>

<template>
    <div class="inbound-container">
        <div class="header-section">
            <h2 class="page-title">자재 재고 현황</h2>
            <div class="breadcrumb">자재 관리 > 재고 현황</div>
        </div>

        <div class="stock-layout-grid">
            <!-- Left Card -->
            <div class="content-card">
                <div class="card-header">
                    <h3 class="card-title"><i class="pi pi-search mr-2 text-primary"></i>검색 조건</h3>
                </div>

                <div class="filter-row mb-4">
                    <InputText v-model="filters.keyword" placeholder="자재명, 자재코드" class="w-40 mr-2" @keydown.enter="search" />
                    <Dropdown v-model="filters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="분류" class="w-32 mr-2" />
                    <Dropdown v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="상태" class="w-32 mr-2" />
                    <Button label="검색" @click="search" class="mr-2" />
                </div>

                <div class="card-header mt-2">
                    <h3 class="card-title">
                        <i class="pi pi-list mr-2 text-primary"></i>재고 목록
                        <span class="ml-2 text-sm font-normal text-gray-500">(총 {{ materialList.length }}건)</span>
                    </h3>
                </div>

                <DataTable :value="materialList" paginator :rows="10" class="text-sm" selectionMode="single" rowHover @rowSelect="(e) => selectMaterial(e.data)">
                    <template #empty>
                        <div class="p-4 text-center text-gray-500">조회된 재고 목록이 없습니다.</div>
                    </template>
                    <Column field="code" header="자재코드" />
                    <Column field="name" header="자재명" />
                    <Column field="category" header="분류" />
                    <Column field="stock" header="현재 재고" />
                    <Column header="재고 상태">
                        <template #body="{ data }">
                            <div class="status-chip">
                                <span class="status-dot" :class="getStatusDotClass(data.status)"></span>
                                <span class="status-text">{{ getStatusLabel(data.status) }}</span>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Right Card -->
            <div v-if="selected" class="content-card">
                <div class="card-header">
                    <h3 class="card-title"><i class="pi pi-info-circle mr-2 text-primary"></i>자재 세부 정보</h3>
                </div>

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
                            <div class="status-chip">
                                <span class="status-dot" :class="getStatusDotClass(selected.status)"></span>
                                <span class="status-text">{{ getStatusLabel(selected.status) }}</span>
                            </div>
                        </div>
                        <div><span class="info-label">최근 입고일:</span> {{ selected.lastInput }}</div>
                    </div>

                    <h3 class="section-title border-yellow">상세 재고 (공급업체별)</h3>
                    <DataTable :value="selected.details" size="small" class="mb-4 text-sm" rowHover>
                        <Column field="supplier" header="공급업체" />
                        <Column field="amount" header="수량" />
                        <Column field="date" header="입고일" />
                        <Column field="lot" header="LOT번호" />
                    </DataTable>

                    <h3 class="section-title border-red">최근 입출고 이력</h3>
                    <DataTable :value="selected.history" size="small" class="text-sm" rowHover>
                        <Column field="date" header="일시" />
                        <Column field="type" header="구분" />
                        <Column field="amount" header="수량" />
                        <Column field="supplier" header="공급업체" />
                        <Column field="manager" header="담당자" />
                    </DataTable>
                </div>
            </div>
            <div v-else class="content-card flex items-center justify-center">
                <div class="text-center text-gray-500">
                    <i class="pi pi-compass text-4xl mb-3"></i>
                    <p>왼쪽 목록에서 자재를 선택하여<br />세부 정보를 확인하세요.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.inbound-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 8rem); /* Match sidebar height */
    font-family: 'Pretendard', 'Inter', sans-serif;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-shrink: 0; /* Prevent header from shrinking */
}

.page-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
    margin: 0;
}

.breadcrumb {
    color: #6b7280;
    font-size: 0.9rem;
}

.stock-layout-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 1.5rem;
    flex-grow: 1; /* Allow grid to fill remaining space */
    min-height: 0; /* Important for flex children */
}

.content-card {
    background: white;
    border-radius: 12px;
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03);
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    overflow-y: auto; /* Each card scrolls independently */
    min-height: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
}

.card-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #374151;
    margin: 0;
    display: flex;
    align-items: center;
}

.filter-row {
    display: flex;
    align-items: center;
}

.section-title {
    font-weight: bold;
    font-size: 1.125rem;
    margin-top: 1.5rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.25rem;
    border-bottom-width: 2px;
    border-bottom-style: solid;
}

.section-title:first-of-type {
    margin-top: 0;
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

.info-label {
    font-weight: bold;
    margin-right: 4px;
    color: #374151;
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

/* 유틸리티 클래스 */
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
.mt-2 {
    margin-top: 0.5rem;
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
.p-2 {
    padding: 0.5rem;
}
.text-gray-500 {
    color: #6b7280;
}
.text-4xl {
    font-size: 2.25rem;
}

/* DataTable 행 높이 조절 */
:deep(.p-datatable-tbody > tr > td) {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
}

/* 재고상태 점 + 텍스트 스타일 (InOutHistory.vue에서 복사 및 수정) */
.status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}
/* 상태별 색상 (재고 상태에 맞게 매핑) */
.status-normal {
    background-color: #16a34a; /* 녹색 (정상) */
}
.status-insufficient {
    background-color: #eab308; /* 노란색 (부족) */
}
.status-excess {
    background-color: #ef4444; /* 빨간색 (과다) */
}
.status-reorder {
    background-color: #3b82f6; /* 파란색 (발주 필요) */
}
.status-unknown {
    background-color: #6b7280; /* 회색 (기본값/알 수 없음) */
}
.status-text {
    font-size: 0.85rem;
    color: #374151;
}
</style>
