<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import materialApi from '@/api/materialApi'; // API 모듈 Import
import * as XLSX from 'xlsx'; // 엑셀 다운로드 기능
import { formatDate as formatDateDisplay, getHistoryTypeLabel, getHistoryTypeSeverity, getHistoryStatusLabel } from '@/utils/formatters';

const toast = useToast();
const router = useRouter();

// ------------------------------------------------------------------
// [State] 검색 조건 및 데이터
// ------------------------------------------------------------------
const search = ref({
    startDate: null,
    endDate: null,
    type: 'ALL', // 전체/입고/출고
    keyword: '', // 자재명/코드
    status: null // 처리상태
});

const historyList = ref([]); // 조회된 데이터 리스트
const selectedHistory = ref([]); // 체크박스 선택된 데이터
const loading = ref(false); // 로딩 상태

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
// [Functions] 검색 및 기능
// ------------------------------------------------------------------
const onSearch = async () => {
    loading.value = true;
    try {
        // 날짜 포맷 변환 (YYYY-MM-DD) - Timezone 이슈 방지를 위해 문자열 처리 권장
        // 혹은 dayjs/date-fns 같은 라이브러리 사용 권장. 여기선 간편하게 ISO 사용.
        const formatDate = (date) => (date ? new Date(date).toISOString().split('T')[0] : null);

        const params = {
            startDate: formatDate(search.value.startDate),
            endDate: formatDate(search.value.endDate),
            type: search.value.type,
            keyword: search.value.keyword,
            status: search.value.status
        };

        // API 호출
        const response = await materialApi.getHistoryList(params);

        // 응답 데이터 바인딩
        historyList.value = response.data || [];

        // 결과 알림
        if (historyList.value.length === 0) {
            toast.add({ severity: 'warn', summary: '결과 없음', detail: '조건에 맞는 데이터가 없습니다.', life: 3000 });
        } else {
            toast.add({ severity: 'success', summary: '조회 성공', detail: `${historyList.value.length}건이 조회되었습니다.`, life: 3000 });
        }
    } catch (error) {
        console.error('Search Error:', error);
        toast.add({ severity: 'error', summary: '오류', detail: '데이터 조회 중 오류가 발생했습니다.', life: 3000 });
        historyList.value = [];
    } finally {
        loading.value = false;
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
    onSearch(); // 초기화 후 전체 조회 재실행
};

const goToPage = (path) => {
    router.push(path);
};

const exportToExcel = () => {
    if (!historyList.value || historyList.value.length === 0) {
        toast.add({ severity: 'warn', summary: '내보낼 데이터 없음', detail: '테이블에 데이터가 없습니다.', life: 3000 });
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const filename = `자재_입출고_내역_${year}${month}${day}.xlsx`;

    const dataToExport = historyList.value.map((item) => ({
        구분: getHistoryTypeLabel(item.type),
        처리일자: formatDateDisplay(item.procDate),
        자재코드: item.matCode,
        자재명: item.matName,
        요청수량: item.reqQty,
        처리수량: item.procQty,
        단위: item.unit,
        처리상태: getHistoryStatusLabel(item.status),
        담당자: item.manager,
        비고: item.remark
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '입출고내역');

    // 컬럼 너비 자동 조정 (선택 사항)
    const colWidths = Object.keys(dataToExport[0]).map((key) => ({
        wch: Math.max(15, key.length, ...dataToExport.map((row) => (row[key] ? String(row[key]).length : 0)))
    }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, filename);
};

// ------------------------------------------------------------------
// [Lifecycle] 초기 데이터 로드
// ------------------------------------------------------------------
onMounted(() => {
    // 페이지 진입 시 자동으로 전체 조회 (선택사항)
    onSearch();
});
</script>

<template>
    <div class="inbound-container">
        <div class="header-section">
            <h3 class="page-title">자재 입출고 내역 조회</h3>
            <div class="breadcrumb">자재 관리 > 입출고 내역</div>
        </div>

        <!-- 검색 조건 카드 -->
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
                <Button label="검색" icon="pi pi-search" severity="primary" @click="onSearch" :loading="loading" />
            </div>
        </div>

        <!-- 데이터 테이블 카드 -->
        <div class="content-card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="pi pi-list mr-2 text-primary"></i>입출고 내역
                    <span class="ml-2 text-sm font-normal text-gray-500">(총 {{ historyList.length }}건)</span>
                </h3>

                <div class="flex gap-2">
                    <!-- 실제 라우터 경로에 맞게 to 속성이나 click 핸들러 수정 필요 -->
                    <Button label="입고등록" icon="pi pi-plus" severity="info" size="small" @click="goToPage('/inbound-registration')" />
                    <Button label="출고등록" icon="pi pi-minus" severity="warn" size="small" @click="goToPage('/outbound-registration')" />
                    <Button label="엑셀 다운로드" icon="pi pi-file-excel" severity="success" outlined size="small" @click="exportToExcel" />
                </div>
            </div>

            <DataTable
                v-model:selection="selectedHistory"
                :value="historyList"
                :loading="loading"
                showGridlines
                stripedRows
                responsiveLayout="scroll"
                class="text-sm"
                removableSort
                :paginator="true"
                :rows="10"
                dataKey="id"
                scrollHeight="200px"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[10, 20, 50]"
                currentPageReportTemplate="{first} - {last} / {totalRecords}"
            >
                <template #empty>
                    <div class="text-center p-4 text-gray-500">
                        {{ loading ? '데이터를 불러오는 중입니다...' : '조회된 이력이 없습니다.' }}
                    </div>
                </template>

                <Column selectionMode="multiple" headerClass="center-header" bodyClass="text-center" style="width: 3rem"></Column>

                <Column field="type" header="구분" sortable headerClass="center-header" bodyClass="text-center" style="width: 6rem">
                    <template #body="{ data }">
                        <Tag :value="getHistoryTypeLabel(data.type)" :severity="getHistoryTypeSeverity(data.type)" rounded />
                    </template>
                </Column>

                <Column field="procDate" header="처리일자" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem">
                    <template #body="{ data }">
                        {{ formatDateDisplay(data.procDate) }}
                    </template>
                </Column>
                <Column field="matCode" header="자재코드" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem"></Column>
                <Column field="matName" header="자재명" sortable headerClass="center-header" bodyClass="text-center" style="width: 12rem"></Column>

                <Column field="reqQty" header="요청수량" sortable headerClass="center-header" bodyClass="text-center" style="width: 7rem">
                    <template #body="{ data }">
                        {{ data.reqQty?.toLocaleString() }}
                    </template>
                </Column>

                <Column field="procQty" header="처리수량" sortable headerClass="center-header" bodyClass="text-center" style="width: 7rem">
                    <template #body="{ data }">
                        <span :class="{ 'text-blue-600 font-bold': data.type === 'IN', 'text-orange-500 font-bold': data.type === 'OUT' }">
                            {{ data.procQty?.toLocaleString() }}
                        </span>
                    </template>
                </Column>

                <Column field="unit" header="단위" headerClass="center-header" bodyClass="text-center" style="width: 4rem"></Column>

                <Column field="status" header="처리상태" sortable headerClass="center-header" bodyClass="text-center" style="width: 8rem">
                    <template #body="{ data }">
                        <div class="status-chip justify-center">
                            <span class="status-dot" :class="`status-${data.status?.toLowerCase()}`"></span>
                            <span class="status-text">{{ getHistoryStatusLabel(data.status) }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="manager" header="담당자" sortable headerClass="center-header" bodyClass="text-center" style="width: 6rem"></Column>
                <Column field="remark" header="비고" headerClass="center-header" bodyClass="text-center" style="min-width: 10rem"></Column>
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
    align-items: end;
}

/* PC 화면: 비율 최적화 */
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
    background-color: #16a34a;
} /* 녹색 */
.status-pending {
    background-color: #eab308;
} /* 노란색 */
.status-cancelled {
    background-color: #ef4444;
} /* 빨간색 */

.status-text {
    font-size: 0.85rem;
    color: #374151;
}
</style>

<style>
/* PrimeVue 4 헤더 중앙 정렬 전역 설정 */
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
