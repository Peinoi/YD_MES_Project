<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

// ------------------------------------------------------------------
// [State] 검색 조건
// ------------------------------------------------------------------
const search = ref({
    startDate: null,
    endDate: null,
    type: 'ALL', // 전체/입고/출고
    keyword: '', // 자재명/코드
    status: null // 처리상태
});

// 입출고 구분 옵션
const typeOptions = ref([
    { label: '전체', value: 'ALL' },
    { label: '입고', value: 'IN' },
    { label: '출고', value: 'OUT' }
]);

// 상태 옵션
const statusOptions = ref([
    { label: '전체', value: null },
    { label: '완료', value: 'COMPLETED' },
    { label: '대기', value: 'PENDING' },
    { label: '취소', value: 'CANCELLED' }
]);

// ------------------------------------------------------------------
// [Data] 데이터 관리 (Mock)
// ------------------------------------------------------------------
const allData = [
    {
        id: 1,
        procDate: '2025-05-29',
        type: 'IN',
        matCode: 'RM-001',
        matName: '밀가루 1등급',
        reqQty: 400,
        procQty: 400,
        unit: '포',
        manager: '김자재',
        status: 'COMPLETED',
        remark: '정기 입고'
    },
    {
        id: 2,
        procDate: '2025-05-29',
        type: 'OUT',
        matCode: 'RM-001',
        matName: '밀가루 1등급',
        reqQty: 100,
        procQty: 100,
        unit: '포',
        manager: '이생산',
        status: 'COMPLETED',
        remark: '라인 A 투입'
    },
    {
        id: 3,
        procDate: '2025-05-30',
        type: 'IN',
        matCode: 'MAT-003',
        matName: '예담라면포장지',
        reqQty: 500,
        procQty: 500,
        unit: 'BOX',
        manager: '박관리',
        status: 'COMPLETED',
        remark: ''
    },
    {
        id: 4,
        procDate: '2025-05-30',
        type: 'OUT',
        matCode: 'MAT-005',
        matName: '건조파',
        reqQty: 50,
        procQty: 0,
        unit: 'kg',
        manager: '최반장',
        status: 'PENDING',
        remark: '재고 부족 대기'
    }
];

const historyList = ref([...allData]);
const selectedHistory = ref([]);

// ------------------------------------------------------------------
// [Functions] 검색 및 기능
// ------------------------------------------------------------------
const onSearch = () => {
    let filtered = allData;

    // 1. 날짜 필터
    if (search.value.startDate && search.value.endDate) {
        const start = new Date(search.value.startDate).setHours(0, 0, 0, 0);
        const end = new Date(search.value.endDate).setHours(23, 59, 59, 999);

        filtered = filtered.filter((item) => {
            const itemDate = new Date(item.procDate).getTime();
            return itemDate >= start && itemDate <= end;
        });
    }

    // 2. 구분 필터
    if (search.value.type && search.value.type !== 'ALL') {
        filtered = filtered.filter((item) => item.type === search.value.type);
    }

    // 3. 자재 검색
    if (search.value.keyword && search.value.keyword.trim() !== '') {
        const kw = search.value.keyword.toLowerCase();
        filtered = filtered.filter((item) => item.matCode.toLowerCase().includes(kw) || item.matName.toLowerCase().includes(kw));
    }

    // 4. 상태 필터
    if (search.value.status) {
        filtered = filtered.filter((item) => item.status === search.value.status);
    }

    historyList.value = filtered;

    if (filtered.length === 0) {
        toast.add({ severity: 'warn', summary: '결과 없음', detail: '조건에 맞는 데이터가 없습니다.', life: 3000 });
    } else {
        toast.add({ severity: 'success', summary: '조회 성공', detail: `${filtered.length}건이 조회되었습니다.`, life: 3000 });
    }
};

const onReset = () => {
    search.value = {
        startDate: null,
        endDate: null,
        type: 'ALL',
        keyword: '',
        status: null
    };
    historyList.value = [...allData];
};

const goToPage = (path) => {
    console.log(`이동: ${path}`);
    toast.add({ severity: 'info', summary: '이동', detail: '페이지 이동', life: 2000 });
};

// ------------------------------------------------------------------
// [Util] UI Helpers
// ------------------------------------------------------------------
const getTypeLabel = (type) => (type === 'IN' ? '입고' : '출고');
const getTypeSeverity = (type) => (type === 'IN' ? 'success' : 'warn');

const getStatusLabel = (status) => {
    const map = { COMPLETED: '완료', PENDING: '대기', CANCELLED: '취소' };
    return map[status] || status;
};
const getStatusSeverity = (status) => {
    switch (status) {
        case 'COMPLETED':
            return 'info';
        case 'PENDING':
            return 'secondary';
        case 'CANCELLED':
            return 'danger';
        default:
            return null;
    }
};
</script>

<template>
    <div class="inbound-container">
        <div class="header-section">
            <h3 class="page-title">자재 입출고 내역 조회</h3>
            <div class="breadcrumb">자재 관리 > 입출고 내역</div>
        </div>

        <div class="content-card mb-4">
            <div class="card-header">
                <h3 class="card-title"><i class="pi pi-search mr-2 text-primary"></i>검색 조건</h3>
            </div>

            <div class="form-grid">
                <div class="field-group">
                    <label class="field-label">구분</label>
                    <SelectButton v-model="search.type" :options="typeOptions" optionLabel="label" optionValue="value" class="w-full" />
                </div>

                <div class="field-group">
                    <label class="field-label">입출고일자</label>
                    <div class="flex gap-2 items-center w-full">
                        <Calendar v-model="search.startDate" showIcon dateFormat="yy-mm-dd" placeholder="시작일" class="w-full flex-1" />
                        <span class="text-gray-500 font-bold mx-1">~</span>
                        <Calendar v-model="search.endDate" showIcon dateFormat="yy-mm-dd" placeholder="종료일" class="w-full flex-1" />
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">자재 검색</label>
                    <InputGroup class="w-full">
                        <InputText v-model="search.keyword" placeholder="코드/명칭" @keydown.enter="onSearch" />
                        <Button icon="pi pi-search" severity="secondary" text @click="onSearch" />
                    </InputGroup>
                </div>

                <div class="field-group">
                    <label class="field-label">처리 상태</label>
                    <Dropdown v-model="search.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="전체" showClear class="w-full" />
                </div>
            </div>

            <div class="form-actions center-actions">
                <Button label="초기화" icon="pi pi-refresh" severity="secondary" @click="onReset" class="mr-2" />
                <Button label="검색" icon="pi pi-search" severity="primary" @click="onSearch" />
            </div>
        </div>

        <div class="content-card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="pi pi-list mr-2 text-primary"></i>입출고 내역
                    <span class="ml-2 text-sm font-normal text-gray-500">(총 {{ historyList.length }}건)</span>
                </h3>

                <div class="flex gap-2">
                    <Button label="입고등록" icon="pi pi-plus" severity="info" size="small" @click="goToPage('/materials/inbound-registration')" />
                    <Button label="출고등록" icon="pi pi-minus" severity="warn" size="small" @click="goToPage('/materials/outbound-registration')" />
                    <Button label="엑셀 다운로드" icon="pi pi-file-excel" severity="success" outlined size="small" />
                </div>
            </div>

            <DataTable
                v-model:selection="selectedHistory"
                :value="historyList"
                showGridlines
                stripedRows
                responsiveLayout="scroll"
                class="text-sm"
                removableSort
                :paginator="true"
                :rows="10"
                dataKey="id"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[10, 20, 50]"
                currentPageReportTemplate="{first} - {last} / {totalRecords}"
            >
                <template #empty>
                    <div class="text-center p-4 text-gray-500">조회된 이력이 없습니다.</div>
                </template>

                <Column selectionMode="multiple" headerClass="center-header" bodyClass="text-center" style="width: 3rem"></Column>

                <Column field="type" header="구분" sortable headerClass="center-header" bodyClass="text-center" style="width: 6rem">
                    <template #body="{ data }">
                        <Tag :value="getTypeLabel(data.type)" :severity="getTypeSeverity(data.type)" rounded />
                    </template>
                </Column>

                <Column field="procDate" header="처리일자" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem"></Column>
                <Column field="matCode" header="자재코드" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem"></Column>
                <Column field="matName" header="자재명" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem"></Column>

                <Column field="reqQty" header="요청수량" sortable headerClass="center-header" bodyClass="text-center" style="width: 7rem">
                    <template #body="{ data }">
                        {{ data.reqQty.toLocaleString() }}
                    </template>
                </Column>

                <Column field="procQty" header="처리수량" sortable headerClass="center-header" bodyClass="text-center" style="width: 7rem">
                    <template #body="{ data }">
                        <span :class="{ 'text-blue-600 font-bold': data.type === 'IN', 'text-orange-500 font-bold': data.type === 'OUT' }">
                            {{ data.procQty.toLocaleString() }}
                        </span>
                    </template>
                </Column>

                <Column field="unit" header="단위" headerClass="center-header" bodyClass="text-center" style="width: 4rem"></Column>

                <Column field="status" header="처리상태" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem">
                    <template #body="{ data }">
                        <div class="status-chip">
                            <span class="status-dot" :class="`status-${data.status.toLowerCase()}`"></span>
                            <span class="status-text">{{ getStatusLabel(data.status) }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="manager" header="담당자" sortable headerClass="center-header" bodyClass="text-center" style="width: 6rem"></Column>
                <Column field="remark" header="비고" headerClass="center-header" bodyClass="text-center" style="width: 6rem"></Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
/* -------------------------------------- */
/* 스타일 정의 */
/* -------------------------------------- */
.inbound-container {
    font-family: 'Pretendard', 'Inter', sans-serif;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    height: calc(100vh - 8rem);
    overflow-y: auto;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
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

.content-card {
    background: white;
    border-radius: 12px;
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03);
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
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

.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    align-items: end; /* 컴포넌트 하단 정렬 */
}

/* PC 화면: 비율 최적화 (0.8fr 2fr 1.2fr 0.8fr) */
@media (min-width: 1024px) {
    .form-grid {
        grid-template-columns: 0.8fr 2fr 1.2fr 0.8fr;
    }
}

@media (min-width: 768px) and (max-width: 1023px) {
    .form-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.field-group {
    display: flex;
    flex-direction: column;
}

.field-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.5rem;
}

:deep(.bg-gray-50) {
    background-color: #f9fafb;
}

:deep(.p-inputtext),
:deep(.p-calendar),
:deep(.p-dropdown),
:deep(.p-selectbutton) {
    width: 100%;
}

.form-actions {
    display: flex;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
}

.center-actions {
    justify-content: center;
}

.mr-2 {
    margin-right: 0.5rem;
}
.text-primary {
    color: var(--primary-color);
}

/* 테이블 내용 중앙 정렬 */
:deep(.text-center) {
    text-align: center !important;
}

:deep(.p-datatable-tbody > tr > td) {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
}

/* 처리상태 점 + 텍스트 스타일 */
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

/* 상태별 색상 */
.status-completed {
    background-color: #16a34a; /* 녹색 */
}

.status-pending {
    background-color: #eab308; /* 노란색 */
}

.status-cancelled {
    background-color: #ef4444; /* 빨간색 */
}

.status-text {
    font-size: 0.85rem;
    color: #374151;
}
</style>

<style>
/* PrimeVue 4 헤더 중앙 정렬 */
.center-header .p-column-header-content,
.center-header .p-datatable-column-header-content {
    justify-content: center !important;
}
html,
body {
    height: 100%;
    overflow: hidden;
}
</style>
