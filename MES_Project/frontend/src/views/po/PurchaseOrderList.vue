<script setup>
import { ref } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const showClientModal = ref(false);

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
    i1: '완제품',
    i2: '반제품',
    i3: '부자재',
    i4: '원자재'
};

// 클라이언트 불러오기 모달 컬럼
const clientColumns = [
    { field: 'clientCode', label: '공급업체 번호' },
    { field: 'clientName', label: '공급업체명' },
    { field: 'clientTypeLabel', label: '거래처유형' }
];

const clientTypeOptions = {
    l1: '납품업체',
    l2: '공급업체'
};

// 전체 발주 목록
const allList = ref([]);
// 공급업체 모달 데이터
const clientRows = ref([]);

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

//발주목록 불러오기
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
};

// 필터 적용 함수 / 조회 눌러 적용
function applyFilter() {
    const f = filters.value;

    tableRows.value = allList.value.filter((row) => {
        if (f.orderNo && !row.purchaseCode.includes(f.orderNo)) return false;

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

// 초기 데이터 로드
fetchOrderList().then(() => {
    tableRows.value = [...allList.value];
});
</script>

<template>
    <section class="p-2 mx-auto filter-section">
        <!--  검색 영역 -->
        <div class="card-block filter-block">
            <h3 class="section-title">발주 검색</h3>
            <div class="filter-grid">
                <!-- 1행 -->
                <div class="form-item">
                    <label>발주서번호</label>
                    <input class="input" v-model="filters.orderNo" />
                </div>

                <div class="form-item">
                    <label>자재유형</label>
                    <select class="input" v-model="filters.materialType">
                        <option value="">전체</option>
                        <option value="i1">완제품</option>
                        <option value="i2">반제품</option>
                        <option value="i3">부자재</option>
                        <option value="i4">원자재</option>
                    </select>
                </div>

                <div class="form-item form-range">
                    <label>발주제안일</label>
                    <div class="range-row">
                        <input type="date" class="input" v-model="filters.reqDateFrom" />
                        <span class="range-dash">~</span>
                        <input type="date" class="input" v-model="filters.reqDateTo" />
                    </div>
                </div>

                <!-- 2행 -->
                <div class="form-item">
                    <label>공급업체</label>
                    <input class="input" v-model="filters.vendor" readonly placeholder="공급업체 선택" @click="openClientModal" />
                </div>

                <div class="form-item form-range">
                    <label>필요수량</label>
                    <div class="range-row">
                        <input type="number" class="input" v-model.number="filters.qtyFrom" placeholder="최소" />
                        <span class="range-dash">~</span>
                        <input type="number" class="input" v-model.number="filters.qtyTo" placeholder="최대" />
                    </div>
                </div>

                <div class="form-item form-range">
                    <label>입고납기일</label>
                    <div class="range-row">
                        <input type="date" class="input" v-model="filters.dueDateFrom" />
                        <span class="range-dash">~</span>
                        <input type="date" class="input" v-model="filters.dueDateTo" />
                    </div>
                </div>

                <!-- 3행 -->
                <div class="form-item">
                    <label>발주상태</label>
                    <select class="input" v-model="filters.status">
                        <option value="">전체</option>
                        <option value="요청완료">요청완료</option>
                        <option value="입고완료">입고완료</option>
                    </select>
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
                <button class="btn-excel" @click="downloadExcel">엑셀 다운로드</button>
            </div>

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
                        <td>{{ row.stat }}</td>
                        <td>{{ row.mcode }}</td>
                        <td>{{ row.regDate }}</td>
                    </tr>

                    <tr v-if="!tableRows.length">
                        <td colspan="11" class="empty-cell">조회 결과가 없습니다.</td>
                    </tr>
                </tbody>
            </table>
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
</template>

<style scoped>
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
    font-size: 13px;
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
    font-size: 13px;
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
    font-size: 13px;
    border-radius: 6px;
    border: 1px solid #6cbf5a;
    background: #f4fff2;
    cursor: pointer;
}

/* 테이블 */
.nice-table {
    width: 100%;
    border-collapse: collapse;
    border-top: 2px solid #f4b321;
}

.nice-table th,
.nice-table td {
    padding: 8px 10px;
    font-size: 13px;
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
</style>
