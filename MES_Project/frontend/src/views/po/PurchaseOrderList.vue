<script setup>
import { ref } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const showClientModal = ref(false);
const showPOModal = ref(false);

const filters = ref({
    orderNo: '',
    materialType: '',
    reqDateFrom: '',
    reqDateTo: '',
    vendor: '',
    qtyFrom: null,
    qtyTo: null,
    dueDateFrom: '',
    dueDateTo: '',
    status: ''
});

const typeOptions = {
    t1: '원자재',
    t2: '부자재'
};
//발주서 모달 컬럼
const orderColumns = [
    { field: 'purchaseCode', label: '발주서 번호' },
    { field: 'purchaseDate', label: '발주제안일' },
    { field: 'matName', label: '자재명' }
];

// 클라이언트 불러오기 모달 컬럼
const clientColumns = [
    { field: 'clientCode', label: '공급업체 번호' },
    { field: 'clientName', label: '공급업체명' },
    { field: 'clientTypeLabel', label: '거래처유형' }
];

// 상태 옵션
const statusOption = ref([
    { label: '전체', value: null },
    { label: '요청완료', value: 'c1' },
    { label: '입고완료', value: 'c2' }
]);

// 유형 옵션
const typeOption = ref([
    { label: '전체', value: null },
    { label: '원자재', value: 't1' },
    { label: '부자재', value: 't2' }
]);

const clientTypeOptions = {
    l1: '납품업체',
    l2: '공급업체'
};

const statusOptions = {
    c1: '요청완료',
    c2: '입고완료'
};

// 전체 발주 목록
const allList = ref([]);
// 공급업체 모달 데이터
const clientRows = ref([]);
//발주서 모달 데이터
const orderRows = ref([]);

// 실제 테이블에 보여줄 데이터
const tableRows = ref([...allList.value]);

const allChecked = ref(false);

//공급업체 목록 불러오기
const fetchClientList = async () => {
    const res = await axios.get('/api/poder/client');

    const rows = res.data.data || [];

    clientRows.value = rows.map((row) => ({
        ...row,
        clientTypeLabel: clientTypeOptions[row.clientType] || row.clientType
    }));
};

//발주목록 불러오기 메인
const fetchOrderList = async (keyword = '') => {
    const res = await axios.get('/api/poder/list', {
        params: {
            purchaseCode: keyword || null
        }
    });

    const rows = res.data.data || [];

    allList.value = rows.map((row) => ({
        ...row,
        purchaseDate: row.purchaseDate ? String(row.purchaseDate).slice(0, 10) : '',
        deadLine: row.deadLine ? String(row.deadLine).slice(0, 10) : '',
        regDate: row.regDate ? String(row.regDate).slice(0, 10) : ''
    }));
    tableRows.value = [...allList.value];
    allChecked.value = false;
};
//발주서 불러오기 모달!
const fetchOrderSelectList = async (keyword = '') => {
    const res = await axios.get('/api/poder', {
        params: {
            purchaseCode: keyword || null
        }
    });

    const rows = res.data.data || [];

    orderRows.value = rows.map((row) => ({
        purchaseCode: row.purchaseCode,
        purchaseDate: row.purchaseDate ? String(row.purchaseDate).slice(0, 10) : '',
        matName: row.matName || ''
    }));
};

// 필터 적용 함수 / 조회 눌러 적용
function applyFilter() {
    const f = filters.value;

    tableRows.value = allList.value.filter((row) => {
        if (f.orderNo && row.purchaseCode !== f.orderNo) return false;

        if (f.materialType && row.type !== f.materialType) return false;

        if (f.vendor && !row.clientName.includes(f.vendor.trim())) return false;

        if (f.status && row.stat !== f.status) return false;

        if (f.qtyFrom != null && f.qtyFrom !== '' && row.req_qtt < f.qtyFrom) return false;
        if (f.qtyTo != null && f.qtyTo !== '' && row.req_qtt > f.qtyTo) return false;

        if (f.reqDateFrom && row.purchaseDate && row.purchaseDate < f.reqDateFrom) return false;
        if (f.reqDateTo && row.purchaseDate && row.purchaseDate > f.reqDateTo) return false;

        if (f.dueDateFrom && row.deadLine && row.deadLine < f.dueDateFrom) return false;
        if (f.dueDateTo && row.deadLine && row.deadLine > f.dueDateTo) return false;

        return true;
    });

    allChecked.value = tableRows.value.length > 0 && tableRows.value.every((r) => r.checked);
}

// 조회 버튼
function onSearch() {
    applyFilter();
}

// 초기화 버튼
function onReset() {
    filters.value = {
        orderNo: '',
        materialType: '',
        reqDateFrom: '',
        reqDateTo: '',
        vendor: '',
        qtyFrom: null,
        qtyTo: null,
        dueDateFrom: '',
        dueDateTo: '',
        status: ''
    };

    tableRows.value = [...allList.value];
    allChecked.value = false;
}

// 전체선택 체크박스
function toggleAll() {
    tableRows.value.forEach((row) => {
        row.checked = allChecked.value;
    });
}

// 숫자 포맷
function formatNumber(v) {
    if (v == null || v === '') return '';
    return v.toLocaleString();
}

function getTypeLabel(code) {
    return typeOptions[code] || code;
}

function getStatusLabel(code) {
    return statusOptions[code] || code;
}

function downloadExcel() {
    // 체크된 행만
    const selected = tableRows.value.filter((row) => row.checked);

    if (!selected.length) {
        alert('다운로드할 행을 선택해 주세요.');
        return;
    }

    const data = selected.map((row) => ({
        발주서번호: row.purchaseCode,
        발주제안일: row.purchaseDate,
        자재유형: getTypeLabel(row.type),
        자재명: row.matName,
        공급업체: row.clientName,
        필요수량: row.req_qtt,
        입고납기일: row.deadLine,
        발주상태: row.stat,
        작성자: row.mcode,
        등록일자: row.regDate
    }));

    // 워크시트/워크북 생성
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '발주목록');

    // 파일 다운로드
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `발주목록_${today}.xlsx`);
}

// 공급업체 모달 열기
const openClientModal = async () => {
    await fetchClientList();
    showClientModal.value = true;
};

//발주서 모달 열기
const openOrderSelectModal = async () => {
    await fetchOrderSelectList();
    showPOModal.value = true;
};

// 공급업체 모달 검색
const handleClientSearch = async (keyword) => {
    await fetchClientList(keyword);
};

// 공급업체 모달 선택
const handleConfirmClient = (row) => {
    if (!row) {
        alert('공급업체를 선택해 주세요.');
        return;
    }

    filters.value.vendor = row.clientName || '';

    showClientModal.value = false;
};

// 공급업체 모달 닫기
const handleCancelClient = () => {
    showClientModal.value = false;
};
//발주 모달 닫기
const handleCancelOrderSelect = () => {
    showPOModal.value = false;
};

// 발주 모달에서 검색
const handleOrderSearch = async (keyword) => {
    await fetchOrderSelectList(keyword);
};

//발주서 모달 선택
const handleConfirmOrderSelect = (row) => {
    if (!row || !row.purchaseCode) {
        alert('발주서를 선택해 주세요.');
        return;
    }

    filters.value.orderNo = row.purchaseCode;

    showPOModal.value = false;
};

// 초기 데이터 로드
fetchOrderList().then(() => {
    tableRows.value = [...allList.value];
});
</script>

<template>
    <div class="inbound-container">
        <section class="p-2 mx-auto filter-section">
            <!--  검색 영역 -->
            <div class="card-block filter-block">
                <h3 class="section-title">발주 검색</h3>
                <div class="filter-grid">
                    <!-- 1행 -->
                    <div class="form-item">
                        <label>발주서번호</label>
                        <InputText v-model="filters.orderNo" readonly placeholder="발주서 선택" @click="openOrderSelectModal" />
                    </div>

                    <div class="form-item">
                        <label>자재유형</label>
                        <Dropdown v-model="filters.materialType" :options="typeOption" optionLabel="label" optionValue="value" placeholder="전체" showClear class="dropdown-input" />
                    </div>

                    <div class="form-item form-range">
                        <label>발주제안일</label>
                        <div class="range-row">
                            <Calendar v-model="filters.reqDateFrom" showIcon dateFormat="yy-mm-dd" placeholder="연도-월-일" class="calendar-input" />
                            <span class="range-dash">~</span>
                            <Calendar v-model="filters.reqDateTo" showIcon dateFormat="yy-mm-dd" placeholder="연도-월-일" class="calendar-input" />
                        </div>
                    </div>

                    <!-- 2행 -->
                    <div class="form-item">
                        <label>공급업체</label>
                        <InputText v-model="filters.vendor" readonly placeholder="공급업체 선택" @click="openClientModal" />
                    </div>

                    <div class="form-item form-range">
                        <label>필요수량</label>
                        <div class="range-row">
                            <InputNumber v-model="filters.qtyFrom" placeholder="최소" class="input-number" :min="0" />
                            <span class="range-dash">~</span>
                            <InputNumber v-model="filters.qtyTo" placeholder="최대" class="input-number" :min="0" />
                        </div>
                    </div>

                    <div class="form-item form-range">
                        <label>입고납기일</label>
                        <div class="range-row">
                            <Calendar v-model="filters.dueDateFrom" showIcon dateFormat="yy-mm-dd" placeholder="연도-월-일" class="calendar-input" />
                            <span class="range-dash">~</span>
                            <Calendar v-model="filters.dueDateTo" showIcon dateFormat="yy-mm-dd" placeholder="연도-월-일" class="calendar-input" />
                        </div>
                    </div>

                    <!-- 3행 -->
                    <div class="form-item">
                        <label>발주상태</label>
                        <Dropdown v-model="filters.status" :options="statusOption" optionLabel="label" optionValue="value" placeholder="전체" showClear class="dropdown-input" />
                    </div>

                    <div class="form-item form-actions">
                        <button class="btn-black" @click="onReset">초기화</button>
                        <button class="btn-yellow" @click="onSearch">조회</button>
                    </div>
                </div>
            </div>

            <!--  검색 결과 + 엑셀 다운로드 -->
            <div class="result-block mt-6">
                <div class="result-header">
                    <h3 class="section-title">발주 목록</h3>

                    <div class="result-info">
                        검색 결과 <span class="highlight">{{ tableRows.length }}</span
                        >건
                    </div>
                    <Button label="엑셀 다운로드" icon="pi pi-file-excel" class="btn-excel" @click="downloadExcel" />
                </div>
                <div class="table-scroll">
                    <table class="nice-table">
                        <thead>
                            <tr>
                                <th style="width: 40px">
                                    <input type="checkbox" v-model="allChecked" @change="toggleAll" />
                                </th>
                                <th>발주서번호</th>
                                <th>발주제안일</th>
                                <th>자재유형</th>
                                <th>자재명</th>
                                <th>공급업체</th>
                                <th>필요수량</th>
                                <th>입고납기일</th>
                                <th>발주상태</th>
                                <th>작성자</th>
                                <th>등록일자</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="row in tableRows" :key="row.id">
                                <td>
                                    <input type="checkbox" v-model="row.checked" />
                                </td>
                                <td>{{ row.purchaseCode }}</td>
                                <td>{{ row.purchaseDate }}</td>
                                <td>{{ getTypeLabel(row.type) }}</td>
                                <td>{{ row.matName }}</td>
                                <td>{{ row.clientName }}</td>
                                <td class="text-right">
                                    {{ formatNumber(row.req_qtt) }}
                                </td>
                                <td>{{ row.deadLine }}</td>
                                <td>{{ getStatusLabel(row.stat) }}</td>
                                <td>{{ row.mcode }}</td>
                                <td>{{ row.regDate }}</td>
                            </tr>

                            <tr v-if="!tableRows.length">
                                <td colspan="11" class="empty-cell">조회 결과가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <SearchSelectModal
            v-model="showClientModal"
            :columns="clientColumns"
            :rows="clientRows"
            row-key="clientCode"
            search-placeholder="공급업체명을 입력하세요."
            @search="handleClientSearch"
            @confirm="handleConfirmClient"
            @cancel="handleCancelClient"
        />

        <SearchSelectModal
            v-model="showPOModal"
            :columns="orderColumns"
            :rows="orderRows"
            row-key="purchaseCode"
            search-placeholder="발주서번호를 입력해주세요."
            @confirm="handleConfirmOrderSelect"
            @cancel="handleCancelOrderSelect"
            @search="handleOrderSearch"
        />
    </div>
</template>

<style scoped>
.inbound-container {
    font-family: 'Pretendard', 'Inter', sans-serif;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    height: calc(100vh - 11.5rem);
}

.filter-section {
    max-width: 100%;
    overflow-x: hidden;
}

.card-block {
    padding: 20px;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 18px;
    color: #444;
    display: inline-block;
}

.filter-block {
    border: 1px solid #e0e0e0;
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px 24px;
}

.form-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.form-item label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #444;
}

.input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
}

:deep(.p-inputtext) {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    box-sizing: border-box;
}
.range-row .calendar-input {
    flex: 1 1 0;
    min-width: 0;
}

:deep(.dropdown-input.p-select) {
    width: 100%;
    height: 40px;
    border-radius: 6px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: 0;
}

:deep(.dropdown-input .p-select-label) {
    flex: 1;
    padding: 0 12px;
    font-size: 14px;
    line-height: 40px;
    border: none;
}

:deep(.dropdown-input .p-select-dropdown) {
    width: 32px;
    height: 100%;
    border-left: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.p-inputnumber .p-inputtext) {
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
}

.form-range .range-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.range-dash {
    font-size: 14px;
    color: #777;
}

.form-actions {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center;
    gap: 8px;
}

.btn-black {
    background: #000;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-yellow {
    background: #ffc94a;
    padding: 8px 14px;
    border-radius: 6px;
}

/* 결과 영역 */
.result-block {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px 20px 20px;
    background: #fff;
    height: auto;
}

.result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.result-info {
    font-size: 14px;
}

.highlight {
    font-weight: 700;
    color: #f7a600;
}

.btn-excel {
    padding: 7px 16px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #6cbf5a;
    cursor: pointer;
}

/* 테이블 */
.nice-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.nice-table th,
.nice-table td {
    padding: 8px 10px;
    font-size: 14px;
    border-bottom: 1px solid #eee;
}

.nice-table th {
    background: #faf7e8;
    text-align: left;
}

.text-right {
    text-align: right;
}

.empty-cell {
    text-align: center;
    color: #888;
    padding: 20px 0;
}

.table-scroll {
    max-height: 315px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 6px;
}

.table-scroll thead th {
    position: sticky;
    top: 0;
    background: #faf7e8;
    z-index: 2;
    border-top: 2px solid #f4b321;
    box-shadow: 0 2px 0 #eee;
}
</style>
