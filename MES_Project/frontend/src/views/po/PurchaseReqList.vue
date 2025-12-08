<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showClientModal = ref(false);
const showMateModal = ref(false);
const showReqModal = ref(false);

// 선택 행 기억
const activeMateRow = ref(null);

const filters = ref({
    mprCode: '',
    matName: '',
    matCode: '',
    reqDate: '',
    vendor: ''
});

// 클라이언트 불러오기 모달 컬럼
const clientColumns = [
    { field: 'clientCode', label: '공급업체 번호' },
    { field: 'clientName', label: '공급업체명' },
    { field: 'clientTypeLabel', label: '거래처유형' }
];

// 자재 선택 모달 컬럼
const mateColumns = [
    { field: 'matCode', label: '자재코드' },
    { field: 'matName', label: '자재명' },
    { field: 'clientName', label: '공급업체' }
];
// 요청 불러오기 모달 컬럼
const ReqColumns = [
    { field: 'mprCode', label: '요청서 번호' },
    { field: 'reqDate', label: '요청일' },
    { field: 'mCode', label: '요청자' },
    { field: 'matName', label: '자재명' }
];

const clientTypeOptions = {
    l1: '납품업체',
    l2: '공급업체'
};

const unitOptions = {
    h1: 'kg',
    h2: 't',
    h3: 'L',
    h4: 'ea',
    h5: 'box',
    h6: 'g',
    h7: 'mm',
    h8: '%',
    h9: 'cm',
    ha: 'N'
};

// 전체 요청 목록
const allList = ref([]);

// 모달 데이터
const mateRows = ref([]);
const clientRows = ref([]);
const reqRows = ref([]);

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

// 자재 모달 목록 불러오기
const fetchMateList = async (keyword = '') => {
    const res = await axios.get('/api/poder/mate', {
        params: {
            keyword: keyword || null
        }
    });

    mateRows.value = res.data.data || [];
};

//요청목록 불러오기
const fetchReqList = async () => {
    const res = await axios.get('/api/poder/mpr/req-items');
    const rows = res.data.data || [];

    allList.value = rows.map((row) => ({
        ...row,
        reqDate: formatNumber(row.reqDate),
        checked: false // 체크박스 상태
    }));

    tableRows.value = [...allList.value];
    allChecked.value = false;
};

//요청 모달 목록 불러오기
const fetchReqModalList = async (keyword = '') => {
    const res = await axios.get('/api/poder/mpr/list', {
        params: {
            mprCode: keyword || null
        }
    });

    const rows = res.data.data || [];

    reqRows.value = rows.map((row) => ({
        ...row,
        // 날짜 문자열 잘라서 YYYY-MM-DD 형태로
        reqDate: row.reqDate ? String(row.reqDate).slice(0, 10) : ''
    }));
};

// 필터 적용 함수 / 조회 눌러 적용
function applyFilter() {
    const f = filters.value;

    const mprCode = f.mprCode?.trim();
    const matName = f.matName?.trim();
    const matCode = f.matCode?.trim();
    const reqDate = f.reqDate?.trim();
    const vendor = f.vendor?.trim();

    tableRows.value = allList.value.filter((row) => {
        if (mprCode && !String(row.mprCode || '').includes(mprCode)) return false;
        if (matName && !String(row.matName || '').includes(matName)) return false;
        if (matCode && !String(row.matCode || '').includes(matCode)) return false;
        if (reqDate && String(row.reqDate || '') !== reqDate) return false;
        if (vendor && !String(row.clientName || '').includes(vendor)) return false;
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
        mprCode: '',
        matName: '',
        matCode: '',
        reqDate: '',
        vendor: ''
    };

    tableRows.value = [...allList.value];
    allChecked.value = false;
}

function getUnitLabel(code) {
    return unitOptions[code] || code;
}

// 숫자 포맷
function formatNumber(dateStr) {
    if (!dateStr) return '';
    return dateStr.toString().slice(0, 10);
}

// 전체선택 체크박스
function toggleAll() {
    tableRows.value.forEach((row) => {
        row.checked = allChecked.value;
    });
}

function goDetail(row) {
    if (!row?.mprCode) return;
    router.push(`/purchaseReqDetail/${row.mprCode}`);
}

// 엑셀 다운로드
function downloadExcel() {
    // 체크된 행만
    const selected = tableRows.value.filter((row) => row.checked);

    if (!selected.length) {
        alert('다운로드할 행을 선택해 주세요.');
        return;
    }

    const data = selected.map((row) => ({
        요청번호: row.mprCode,
        자재명: row.matName,
        자재코드: row.matCode,
        단위: row.unit,
        요청수량: row.reqQtt,
        요청일자: row.reqDate,
        공급업체: row.clientName
    }));

    // 워크시트/워크북 생성
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '요청자재목록');

    // 파일 다운로드
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(wb, `요청자재목록_${today}.xlsx`);
}

// 공급업체 모달 열기
const openClientModal = async () => {
    await fetchClientList();
    showClientModal.value = true;
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

    filters.value.mprCode = '';
    filters.value.matName = '';
    filters.value.matCode = '';
    filters.value.reqDate = '';

    showClientModal.value = false;
};

// 공급업체 모달 닫기
const handleCancelClient = () => {
    showClientModal.value = false;
};

//자재 모달 열기
const openMateModal = async (row) => {
    activeMateRow.value = row;
    await fetchMateList();
    showMateModal.value = true;
};

//자재 모달 선택
const handleConfirmMate = (row) => {
    if (!row) {
        alert('자재를 선택해 주세요.');
        return;
    }

    if (activeMateRow.value) {
        activeMateRow.value.matCode = row.matCode;
        activeMateRow.value.matName = row.matName;
        if (row.clientName) {
            activeMateRow.value.clientName = row.clientName;
        }
    } else {
        filters.value.matCode = row.matCode || '';
        filters.value.matName = row.matName || '';
        if (row.clientName) {
            filters.value.vendor = row.clientName;
        }
    }

    showMateModal.value = false;
    activeMateRow.value = null;
};

//자재 닫기
const handleCancelMate = () => {
    showMateModal.value = false;
    activeMateRow.value = null;
};

//  자재 모달 검색
const handleMateSearch = async (keyword) => {
    await fetchMateList(keyword);
};

//요청 모달 열기
const openReqModal = async () => {
    await fetchReqModalList();
    showReqModal.value = true;
};

// 요청 선택
const handleConfirmReq = (selectedRow) => {
    if (!selectedRow || !selectedRow.mprCode) {
        alert('요청서를 선택해 주세요.');
        return;
    }

    filters.value.mprCode = selectedRow.mprCode || '';

    filters.value.matName = '';
    filters.value.matCode = '';
    filters.value.reqDate = '';
    filters.value.vendor = '';

    showReqModal.value = false;
};

// 요청 닫기
const handleCancelReq = () => {
    showReqModal.value = false;
};

//  요청 모달 검색
const handleReqSearch = async (keyword) => {
    await fetchReqModalList(keyword);
};

// 초기 데이터 로드
onMounted(() => {
    fetchReqList();
});
</script>

<template>
    <div class="inbound-container">
        <section class="p-2 mx-auto filter-section">
            <!--  검색 영역 -->
            <div class="card-block filter-block">
                <h3 class="section-title">요청 검색</h3>
                <div class="filter-grid">
                    <!-- 1행 -->
                    <div class="form-item">
                        <label>요청번호</label>
                        <input class="input" v-model="filters.mprCode" readonly placeholder="요청서 선택" @click="openReqModal(row)" />
                    </div>

                    <div class="form-item">
                        <label>자재명</label>
                        <input class="input" v-model="filters.matName" readonly placeholder="자재 선택" @click="openMateModal(row)" />
                    </div>

                    <div class="form-item">
                        <label>자재코드</label>
                        <input class="input" v-model="filters.matCode" readonly placeholder="자재 선택" @click="openMateModal(row)" />
                    </div>

                    <!-- 2행 -->
                    <div class="form-item">
                        <label>요청일자</label>
                        <Calendar v-model="filters.reqDate" dateFormat="yy-mm-dd" placeholder="연도-월-일" class="reqdate-calendar" showIcon />
                    </div>

                    <div class="form-item">
                        <label>거래처</label>
                        <input class="input" v-model="filters.vendor" readonly placeholder="공급업체 선택" @click="openClientModal" />
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
                    <h3 class="section-title">요청 자재 목록</h3>

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
                                <th>요청번호</th>
                                <th>자재명</th>
                                <th>자재코드</th>
                                <th>요청일자</th>
                                <th>요청수량</th>
                                <th>단위</th>
                                <th>공급업체</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="row in tableRows" :key="row.id" @click="goDetail(row)" class="table-row">
                                <td>
                                    <input type="checkbox" v-model="row.checked" @click.stop />
                                </td>
                                <td>{{ row.mprCode }}</td>
                                <td>{{ row.matName }}</td>
                                <td>{{ row.matCode }}</td>
                                <td>{{ row.reqDate }}</td>
                                <td>{{ row.reqQtt }}</td>
                                <td>{{ getUnitLabel(row.unit) }}</td>
                                <td>{{ row.clientName }}</td>
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
            v-model="showMateModal"
            :columns="mateColumns"
            :rows="mateRows"
            row-key="matCode"
            search-placeholder="자재명 또는 자재코드를 입력해주세요."
            @confirm="handleConfirmMate"
            @cancel="handleCancelMate"
            @search="handleMateSearch"
        />
        <SearchSelectModal v-model="showReqModal" :columns="ReqColumns" :rows="reqRows" row-key="mprCode" search-placeholder="자재구매요청번호를 입력해주세요." @confirm="handleConfirmReq" @cancel="handleCancelReq" @search="handleReqSearch" />
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
    gap: 14px 24px;
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
}

/* 요청일자 캘린더 아이콘 붙이기 */
:deep(.reqdate-calendar.p-calendar) {
    width: 100%;
    display: flex;
    align-items: center;
}

:deep(.reqdate-calendar .p-inputtext) {
    flex: 1 1 auto;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 6px 0 0 6px; /* 왼쪽만 둥글게 */
    border: 1px solid #ccc;
    border-right: 0; /* 아이콘 버튼이랑 경계선 공유 */
    box-sizing: border-box;
    font-size: 14px;
}

:deep(.reqdate-calendar .p-datepicker-trigger) {
    height: 40px;
    padding: 0 10px;
    border-radius: 0 6px 6px 0; /* 오른쪽만 둥글게 */
    border: 1px solid #ccc;
    border-left: 0;
    box-sizing: border-box;
    flex-shrink: 0;
}

.range-row .input {
    flex: 1 1 0;
    min-width: 0;
    width: auto; /* 부모 .input 의 width:100% 덮어쓰기 */
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
    max-height: 410px; /* 대략 12행 정도 높이 */
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

.table-row {
    cursor: pointer;
}

.table-row:hover {
    background: #faf6e4;
}
</style>
