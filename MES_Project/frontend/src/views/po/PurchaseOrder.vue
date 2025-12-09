<script setup>
import { ref } from 'vue';
import axios from 'axios';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const purchaseCode = ref('');
const showPOModal = ref(false);
const showMateModal = ref(false);
const showReqModal = ref(false);
const showEmpModal = ref(false);

// 선택 행 기억
const activeMateRow = ref(null);

// 발주 불러오기 모달 컬럼
const orderColumns = [
    { field: 'purchaseCode', label: '발주서 번호' },
    { field: 'purchaseDate', label: '발주제안일' },
    { field: 'matName', label: '자재명' }
];

// 자재 선택 모달 컬럼
const mateColumns = [
    { field: 'matCode', label: '자재코드' },
    { field: 'matName', label: '자재명' },
    { field: 'curInven', label: '현재고' },
    { field: 'insInven', label: '부족수량' },
    { field: 'clientName', label: '공급업체' }
];

// 요청 불러오기 모달 컬럼
const ReqColumns = [
    { field: 'mprCode', label: '요청서 번호' },
    { field: 'reqDate', label: '요청일' },
    { field: 'mCode', label: '요청자' },
    { field: 'matName', label: '자재명' }
];

//작성자 모달 컬럼
const empColumns = [
    { field: 'empCode', label: '사원번호' },
    { field: 'empName', label: '사원명' },
    { field: 'deptName', label: '부서명' }
];

const typeOptions = {
    t1: '원자재',
    t2: '부자재'
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

const statusOptions = {
    c1: '요청완료',
    c2: '입고완료'
};

const orderRows = ref([]);
const mateRows = ref([]);
const reqRows = ref([]);
const empRows = ref([]);

//발주정보 모달 목록 불러오기
const fetchOrderList = async (keyword = '') => {
    const res = await axios.get('/api/poder', {
        params: {
            purchaseCode: keyword || null
        }
    });

    const rows = res.data.data || [];

    orderRows.value = rows.map((row) => ({
        ...row,
        purchaseDate: row.purchaseDate ? String(row.purchaseDate).slice(0, 10) : ''
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

//요청 모달 목록 불러오기
const fetchReqList = async (keyword = '') => {
    const res = await axios.get('/api/poder/mpr/list-for-po', {
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

// 사원 목록 불러오기
const fetchEmpList = async (keyword = '') => {
    const res = await axios.get('/api/poder/emp/list', {
        params: {
            keyword: keyword || null
        }
    });

    empRows.value = res.data.data || [];
};

//발주정보 모달 열기
const openOrderModal = async () => {
    await fetchOrderList();
    showPOModal.value = true;
};

//자재 모달 열기
const openMateModal = async (row) => {
    activeMateRow.value = row;
    await fetchMateList();
    showMateModal.value = true;
};

//요청 모달 열기
const openReqModal = async () => {
    await fetchReqList();
    showReqModal.value = true;
};

const openEmpModal = async () => {
    await fetchEmpList();
    showEmpModal.value = true;
};

// 오늘날짜, 형식변환
function getToday() {
    return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

function toDateOnly(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return value.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    }

    const s = String(value);
    if (s.length >= 10) {
        return s.substring(0, 10);
    }

    return s;
}

// 날짜
const orderDate = ref(getToday()); // regdate
const purchaseDate = ref(getToday()); // purchase_req_date

// 헤더 필드
const writerCode = ref('');
const writerName = ref('');
const note = ref('');
const status = ref('c1');
const reqNo = ref(''); // 자재구매요청서번호

// 자재 리스트
const materials = ref([createRow(), createRow(), createRow()]);

const allChecked = ref(false);

// 자재 행 생성
function createRow() {
    return {
        id: Date.now() + Math.random(), // 고유 ID
        checked: false,
        name: '',
        type: '',
        code: '', // mat_code
        unit: '',
        needQty: '',
        stock: '',
        lackQty: '',
        leadtime: '',
        dueDate: '',
        vendor: '',
        vendorCode: ''
    };
}

function addRow() {
    materials.value.push(createRow());
}

function deleteSelected() {
    materials.value = materials.value.filter((r) => !r.checked);
    allChecked.value = false;
}

function toggleAll() {
    materials.value.forEach((r) => {
        r.checked = allChecked.value;
    });
}

function getTypeLabel(code) {
    return typeOptions[code] || code;
}

function getUnitLabel(code) {
    return unitOptions[code] || code;
}

function getStatusLabel(code) {
    return statusOptions[code] || code;
}
//발주서 저장
const savePo = async () => {
    const today = getToday();

    const header = {
        purchase_code: purchaseCode.value || null,
        purchase_req_date: toDateOnly(purchaseDate.value) || today, // 발주제안일
        stat: status.value,
        regdate: orderDate.value || today, // 시스템 등록일
        note: note.value,
        mcode: writerCode.value,
        mpr_code: reqNo.value || null
    };

    const items = materials.value
        .map((row) => ({
            unit: row.unit,
            needQty: row.needQty,
            dueDate: toDateOnly(row.dueDate),
            vendor: row.vendor,
            vendorCode: row.vendorCode,
            code: row.code
        }))
        .filter((item) => {
            return item.unit || item.needQty || item.dueDate || item.vendor || item.code;
        });

    try {
        const res = await axios.post('/api/poder', { header, items });
        console.log(res.data);
        alert('발주 정보가 저장되었습니다.');
    } catch (err) {
        console.error(err);
        alert('저장 중 오류가 발생했습니다.\n콘솔 로그를 확인해 주세요.');
    }
};

// 발주서 삭제
const deletePo = async () => {
    if (!purchaseCode.value) {
        alert('삭제할 발주서가 없습니다.\n발주정보를 먼저 불러오세요.');
        return;
    }

    if (!confirm(`발주서번호 ${purchaseCode.value} 를 삭제하시겠습니까?`)) {
        return;
    }

    try {
        const res = await axios.delete(`/api/poder/${purchaseCode.value}`);
        console.log(res.data);

        alert('발주서가 삭제되었습니다.');

        // 폼 초기화
        purchaseCode.value = '';
        purchaseDate.value = getToday();
        orderDate.value = getToday();
        status.value = 'c1';
        note.value = '';
        writerCode.value = '';
        writerName.value = '';
        reqNo.value = '';
        materials.value = [createRow(), createRow(), createRow()];
        allChecked.value = false;
    } catch (err) {
        console.error(err);
        alert('삭제 중 오류가 발생했습니다.\n콘솔 로그를 확인해 주세요.');
    }
};

//초기화 버튼
const resetForm = () => {
    if (!confirm('화면을 초기화하시겠습니까?')) return;

    purchaseCode.value = '';
    purchaseDate.value = getToday();
    orderDate.value = getToday();
    status.value = 'c1';
    note.value = '';
    writerCode.value = '';
    writerName.value = '';
    reqNo.value = '';

    // 자재 테이블 초기화
    materials.value = [createRow(), createRow(), createRow()];

    allChecked.value = false;
};

// 발주서 선택
const handleConfirmOrder = async (selectedRow) => {
    // 선택 안 하고 확인 눌렀을 때 방어
    if (!selectedRow || !selectedRow.purchaseCode) {
        alert('발주서를 선택해 주세요.');
        return;
    }

    try {
        // 1) 단건 발주 조회 호출
        const res = await axios.get(`/api/poder/${selectedRow.purchaseCode}`);
        const data = res.data.data;

        // 2) 헤더 세팅 (날짜는 YYYY-MM-DD만 사용)
        purchaseCode.value = data.header.purchase_code;
        purchaseDate.value = data.header.purchase_req_date ? String(data.header.purchase_req_date).slice(0, 10) : getToday();

        orderDate.value = data.header.regdate ? String(data.header.regdate).slice(0, 10) : getToday();

        status.value = data.header.stat || 'c1';
        note.value = data.header.note || '';
        writerCode.value = data.header.mcode || '';
        writerName.value = data.header.mname || data.header.mcode || '';
        reqNo.value = data.header.mpr_code || '';

        // 3) 상세(자재 목록) 매핑
        const items = data.items || [];

        console.log('상세 아이템 목록:', items);

        if (items.length) {
            materials.value = items.map((item) => ({
                id: item.mpo_d_code, // 고유키로 사용
                checked: false,
                name: item.matName || '', // 자재명
                type: item.matType || '', // 자재유형
                code: item.mat_code || '', // 자재코드
                unit: item.unit || item.matUnit || '',
                needQty: item.req_qtt ?? '', // 필요수량
                stock: item.curInven ?? '', // 현재고
                lackQty: item.insInven ?? '', // 부족수량
                dueDate: item.deadline ? String(item.deadline).slice(0, 10) : '',
                vendor: item.clientName || item.client_code || '',
                vendorCode: item.clientCode || null
            }));
        } else {
            // 상세가 0건이면 빈 행 1~3개 만들어서 보여주기
            materials.value = [createRow(), createRow(), createRow()];
        }

        allChecked.value = false;
    } catch (err) {
        console.error(err);
        alert('발주 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
        showPOModal.value = false;
    }
};

// 발주 닫기
const handleCancelOrder = () => {
    showPOModal.value = false;
};

//자재 선택
const handleConfirmMate = (selectedRow) => {
    if (!selectedRow || !activeMateRow.value) {
        alert('자재를 선택해 주세요.');
        return;
    }

    const row = activeMateRow.value;

    // 자재 기본 정보
    row.name = selectedRow.matName || '';
    row.code = selectedRow.matCode || '';

    row.type = selectedRow.matType || '';
    row.unit = selectedRow.unit || '';

    // 수량/재고/부족수량/공급업체
    if (selectedRow.curInven !== undefined) row.stock = selectedRow.curInven;
    if (selectedRow.insInven !== undefined) row.lackQty = selectedRow.insInven;
    if (selectedRow.clientName) row.vendor = selectedRow.clientName;
    row.vendorCode = selectedRow.clientCode || '';

    showMateModal.value = false;
    activeMateRow.value = null;
};

//자재 닫기
const handleCancelMate = () => {
    showMateModal.value = false;
    activeMateRow.value = null;
};

// 요청 선택
const handleConfirmReq = async (selectedRow) => {
    if (!selectedRow || !selectedRow.mprCode) {
        alert('요청서를 선택해 주세요.');
        return;
    }

    try {
        const res = await axios.get(`/api/poder/mpr/${selectedRow.mprCode}`);
        const data = res.data.data;

        reqNo.value = selectedRow.mprCode;

        const items = data.items || [];

        if (items.length) {
            // 요청 자재들을 발주 자재 테이블로 매핑
            materials.value = items.map((item) => ({
                id: item.mpr_d_code || Date.now() + Math.random(),
                checked: false,
                name: item.matName || '',
                type: item.matType || '',
                code: item.mat_code || '',
                unit: item.unit || '',
                needQty: item.req_qtt ?? '', // 요청수량 -> 발주 필요수량
                stock: item.curInven ?? '',
                lackQty: item.insInven ?? '',
                dueDate: item.deadline ? String(item.deadline).slice(0, 10) : '',
                vendor: item.clientName || item.mat_sup || '',
                vendorCode: item.clientCode || null
            }));
        } else {
            materials.value = [createRow(), createRow(), createRow()];
        }

        allChecked.value = false;
    } catch (err) {
        console.error(err);
        alert('자재 구매 요청서를 불러오는 중 오류가 발생했습니다.');
    } finally {
        showReqModal.value = false;
    }
};
// 요청 닫기
const handleCancelReq = () => {
    showReqModal.value = false;
};

//  발주 모달 검색
const handleOrderSearch = async (keyword) => {
    await fetchOrderList(keyword);
};

//  자재 모달 검색
const handleMateSearch = async (keyword) => {
    await fetchMateList(keyword);
};

//  요청 모달 검색
const handleReqSearch = async (keyword) => {
    await fetchReqList(keyword);
};

// 작성자 모달 닫기
const handleCancelEmp = () => {
    showEmpModal.value = false;
};

// 작성자 선택
const handleConfirmEmp = (selectedRow) => {
    if (!selectedRow || !selectedRow.empCode) {
        alert('작성자를 선택해 주세요.');
        return;
    }

    writerCode.value = selectedRow.empCode;
    writerName.value = selectedRow.empName || '';

    showEmpModal.value = false;
};

// 작성자 모달 검색
const handleEmpSearch = async (keyword) => {
    await fetchEmpList(keyword);
};
</script>

<template>
    <div class="inbound-container">
        <section class="p-2 mx-auto">
            <!-- 발주 기본정보 -->
            <div class="card-block">
                <div class="section-header">
                    <h3 class="section-title">발주 기본정보</h3>

                    <div class="btn-row">
                        <button class="btn-red" @click="deletePo">삭제</button>
                        <button class="btn-black" @click="resetForm">초기화</button>
                        <button class="btn-blue" @click="savePo">저장</button>
                        <button class="btn-green" @click="openOrderModal">발주정보 불러오기</button>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-item">
                        <label>발주서번호</label>
                        <InputText v-model="purchaseCode" class="input" disabled />
                    </div>

                    <div class="form-item">
                        <label>발주제안일</label>
                        <Calendar v-model="purchaseDate" :showIcon="true" dateFormat="yy-mm-dd" placeholder="연도-월-일" class="po-header-calendar" />
                    </div>

                    <div class="form-item">
                        <label>작성자</label>
                        <InputText v-model="writerName" class="input" readonly placeholder="작성자 선택" @click="openEmpModal" />
                    </div>

                    <div class="form-item">
                        <label>발주상태</label>
                        <InputText :value="getStatusLabel(status)" class="input" disabled />
                    </div>

                    <div class="form-item">
                        <label>자재구매요청서번호</label>
                        <InputText v-model="reqNo" class="input" disabled />
                    </div>

                    <div class="form-item">
                        <label>비고</label>
                        <InputText v-model="note" class="input" />
                    </div>
                </div>
            </div>

            <!-- 자재 상세목록 -->
            <div class="card-block mt-6">
                <div class="section-header">
                    <h3 class="section-title">자재 상세목록</h3>

                    <div class="btn-row">
                        <button class="btn-blue" @click="addRow">자재추가</button>
                        <button class="btn-red" @click="deleteSelected">자재삭제</button>
                        <button class="btn-green" @click="openReqModal">자재구매요청서 불러오기</button>
                    </div>
                </div>
                <div class="table-scroll">
                    <table class="nice-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" v-model="allChecked" @change="toggleAll" /></th>
                                <th>자재명</th>
                                <th>자재유형</th>
                                <th>자재코드</th>
                                <th>단위</th>
                                <th>필요수량</th>
                                <th>현재고</th>
                                <th>부족수량</th>
                                <th>입고납기일</th>
                                <th>공급업체</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="row in materials" :key="row.id">
                                <td>
                                    <input type="checkbox" v-model="row.checked" />
                                </td>

                                <td>
                                    <InputText class="cell-input" v-model="row.name" readonly placeholder="자재 선택" @click="openMateModal(row)" />
                                </td>

                                <td>
                                    <InputText class="cell-input" :value="getTypeLabel(row.type)" disabled />
                                </td>

                                <td>
                                    <InputText class="cell-input" v-model="row.code" disabled />
                                </td>

                                <td>
                                    <InputText class="cell-input" :value="getUnitLabel(row.unit)" disabled />
                                </td>

                                <td>
                                    <InputText class="cell-input" type="number" v-model.number="row.needQty" :min="0" />
                                </td>

                                <td>
                                    <InputText class="cell-input" type="number" v-model.number="row.stock" disabled />
                                </td>

                                <td>
                                    <InputText class="cell-input" type="number" v-model.number="row.lackQty" disabled />
                                </td>

                                <td>
                                    <Calendar v-model="row.dueDate" dateFormat="yy-mm-dd" class="cell-calendar" showIcon />
                                </td>

                                <td>
                                    <InputText class="cell-input" v-model="row.vendor" disabled />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <SearchSelectModal v-model="showPOModal" :columns="orderColumns" :rows="orderRows" row-key="purchaseCode" search-placeholder="발주서번호를 입력해주세요." @confirm="handleConfirmOrder" @cancel="handleCancelOrder" @search="handleOrderSearch" />

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

        <SearchSelectModal v-model="showEmpModal" :columns="empColumns" :rows="empRows" row-key="empCode" search-placeholder="사원번호 또는 사원명을 입력해주세요." @confirm="handleConfirmEmp" @cancel="handleCancelEmp" @search="handleEmpSearch" />
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

/* 전체 카드 틀 */
.card-block {
    padding: 20px;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

/* 섹션 제목 */
.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #444;
    display: inline-block;
}

/* ----- 기본정보 form ----- */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px 24px;
}

.form-full {
    grid-column: span 2;
}

.form-item label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    display: block;
}

/* 공통 InputText 스타일 */
.input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-size: 14px;
}

.po-header-calendar {
    width: 100%;
}

/* 캘린더 래퍼(전체) */
:deep(.po-header-calendar.p-calendar) {
    width: 100%;
    display: inline-flex;
    align-items: center;
}

/* 인풋 부분 */
:deep(.po-header-calendar .p-inputtext) {
    flex: 1 1 auto;
    height: 40px;
    padding: 0 12px;
    border-radius: 6px 0 0 6px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-size: 14px;
}

/* 아이콘 버튼 부분 */
:deep(.po-header-calendar .p-datepicker-trigger) {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: 0 6px 6px 0;
    border: 1px solid #ccc;
    border-left: 0;
    box-sizing: border-box;
}

/* disabled 스타일 */
:deep(.p-inputtext:disabled),
:deep(.p-inputtext.p-disabled) {
    background-color: hsla(0, 0%, 50%, 0.048);
    color: #555;
    border-color: #ddd;
    opacity: 1;
}

/* 버튼 라인 */
.btn-row {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-red {
    background: #ff6b6b;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-black {
    background: #000;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-blue {
    background: #4ea3ff;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-green {
    background: #4ecb79;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

/* ===== 테이블 ===== */
.table-scroll {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}

.nice-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.nice-table thead {
    background: #faf7e8;
}

.nice-table thead,
.nice-table tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
}

.nice-table tbody {
    display: block;
    max-height: 265px;
    overflow-y: auto;
}

.nice-table th {
    border-bottom: 1px solid #ddd;
    padding: 10px;
    font-size: 14px;
    text-align: left;
}

.nice-table td {
    padding: 6px;
    border-bottom: 1px solid #eee;
}

/* 셀 인풋 공통 */
.cell-input {
    width: 100%;
    height: 34px;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 13px;
}

:deep(.cell-calendar.p-calendar) {
    width: 100%;
    display: flex;
    align-items: center;
}

:deep(.cell-calendar .p-inputtext) {
    width: 100%;
    height: 34px;
    padding: 0 8px;
    border-radius: 4px 0 0 4px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-size: 13px;
}

:deep(.cell-calendar .p-datepicker-trigger) {
    height: 34px;
    border-radius: 0 4px 4px 0;
    border: 1px solid #ccc;
    border-left: 0;
    box-sizing: border-box;
    flex-shrink: 0;
}

/* 1: 체크박스 */
.nice-table th:nth-child(1),
.nice-table td:nth-child(1) {
    width: 4%;
}

/* 2: 자재명 */
.nice-table th:nth-child(2),
.nice-table td:nth-child(2) {
    width: 18%;
}

/* 3: 자재유형 */
.nice-table th:nth-child(3),
.nice-table td:nth-child(3) {
    width: 10%;
}

/* 4: 자재코드 */
.nice-table th:nth-child(4),
.nice-table td:nth-child(4) {
    width: 14%;
}

/* 5: 단위 */
.nice-table th:nth-child(5),
.nice-table td:nth-child(5) {
    width: 5%;
}

/* 6: 필요수량 */
.nice-table th:nth-child(6),
.nice-table td:nth-child(6) {
    width: 10%;
}

/* 7: 현재고 */
.nice-table th:nth-child(7),
.nice-table td:nth-child(7) {
    width: 10%;
}

/* 8: 부족수량 */
.nice-table th:nth-child(8),
.nice-table td:nth-child(8) {
    width: 10%;
}

/* 9: 입고납기일 */
.nice-table th:nth-child(9),
.nice-table td:nth-child(9) {
    width: 10%;
}

/* 10: 공급업체 */
.nice-table th:nth-child(10),
.nice-table td:nth-child(10) {
    width: 9%;
}
</style>
