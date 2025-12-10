<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const showMateModal = ref(false);
const showEmpModal = ref(false);

//등록일자
const reqDate = ref(getToday());
//납기일자
const deadLine = ref('');
//요청번호
const Code = ref('');
//요청부서
const deptName = ref('');
// 선택 행 기억
const activeMateRow = ref(null);

// 자재 선택 모달 컬럼
const mateColumns = [
    { field: 'matCode', label: '자재코드' },
    { field: 'matName', label: '자재명' },
    { field: 'curInven', label: '현재고' },
    { field: 'insInven', label: '부족수량' },
    { field: 'clientName', label: '공급업체' }
];

//작성자 선택 모달 컬럼
const empColumns = [
    { field: 'empCode', label: '사원번호' },
    { field: 'empName', label: '사원명' },
    { field: 'deptName', label: '부서명' }
];

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

const mateRows = ref([]);
const empRows = ref([]);

//자재 모달 목록 불러오기
const fetchMateList = async (keyword = '') => {
    const res = await axios.get('/api/poder/mate', {
        params: {
            keyword: keyword || null
        }
    });

    mateRows.value = res.data.data || [];
};

//사원 목록 불러오기
const fetchEmpList = async (keyword = '') => {
    const res = await axios.get('/api/poder/emp/list', {
        params: {
            keyword: keyword || null
        }
    });

    empRows.value = res.data.data || [];
};

//자재 모달
const openMateModal = async (row) => {
    activeMateRow.value = row;
    await fetchMateList();
    showMateModal.value = true;
};

//작성자 모달
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

// 헤더 필드
const writerCode = ref('');
const writerName = ref('');

// 자재 리스트
const materials = ref([createRow(), createRow(), createRow()]);

const allChecked = ref(false);

const fetchNextCode = async () => {
    const res = await axios.get('/api/poder/mpr/next-code');
    if (res.data.success) {
        Code.value = res.data.code; // PRQ0001
    }
};

// 자재 행 생성
function createRow() {
    return {
        id: Date.now() + Math.random(), // 고유 ID
        checked: false,
        code: '', // mat_code
        name: '',
        needQty: '',
        unit: '',
        vendor: '',
        vendorCode: '',
        note: ''
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

function getUnitLabel(code) {
    return unitOptions[code] || code;
}

//초기화 작업
function clearForm() {
    writerCode.value = '';
    writerName.value = '';
    deadLine.value = '';
    reqDate.value = getToday();

    // 자재 테이블 초기화
    materials.value = [createRow(), createRow(), createRow()];

    allChecked.value = false;
}
// 초기화 버튼
const resetForm = () => {
    if (!confirm('화면을 초기화하시겠습니까?')) return;
    clearForm();
};

//자재 선택
const handleConfirmMate = (selectedRow) => {
    if (!selectedRow || !activeMateRow.value) {
        alert('자재를 선택해 주세요.');
        return;
    }

    const row = activeMateRow.value;

    // 자재 기본 정보
    row.code = selectedRow.matCode || '';
    row.name = selectedRow.matName || '';

    row.unit = selectedRow.unit || '';

    if (selectedRow.clientName) row.vendor = selectedRow.clientName;
    if (selectedRow.clientCode) row.vendorCode = selectedRow.clientCode;

    showMateModal.value = false;
    activeMateRow.value = null;
};

//자재 닫기
const handleCancelMate = () => {
    showMateModal.value = false;
    activeMateRow.value = null;
};

//  자재 모달 검색
const handleSearchMate = async (keyword) => {
    await fetchMateList(keyword);
};

const savePo = async () => {
    const today = getToday();

    const header = {
        mpr_code: Code.value,
        reqdate: reqDate.value || today,
        deadline: toDateOnly(deadLine.value) || null,
        mrp_code: 'MRP-20250624-001', // 임시 나중에 MRP 연동되면 수정
        mcode: writerCode.value
    };

    const items = materials.value
        .map((row) => ({
            mat_code: row.code,
            req_qtt: row.needQty ? Number(row.needQty) : 0,
            unit: row.unit,
            note: row.note || '',
            mat_sup: row.vendorCode || ''
        }))
        .filter((item) => {
            return item.mat_code || item.req_qtt || item.unit || item.mat_sup || item.note;
        });

    if (!items.length) {
        alert('요청 자재를 한 개 이상 입력해 주세요.');
        return;
    }

    try {
        const res = await axios.post('/api/poder/mpr', {
            header,
            items
        });

        console.log(res.data);
        alert('자재 구매 요청이 저장되었습니다.');

        await fetchNextCode();
        clearForm();
    } catch (err) {
        console.error(err);
        alert('저장 중 오류가 발생했습니다.');
    }
};

// 요청부서 변경시 부서명 조회
watch(
    writerCode,
    async (newCode) => {
        if (!newCode) {
            deptName.value = '';
            return;
        }
        try {
            const res = await axios.get('/api/poder/emp/dept', {
                params: { empCode: newCode }
            });
            deptName.value = res.data.deptName || '';
        } catch (e) {
            console.error(e);
            deptName.value = '';
        }
    },
    { immediate: true }
);

//작성자 모달 선택
const handleConfirmEmp = (selectedRow) => {
    if (!selectedRow || !selectedRow.empCode) {
        alert('작성자를 선택해 주세요.');
        return;
    }

    writerCode.value = selectedRow.empCode;
    writerName.value = selectedRow.empName || '';

    showEmpModal.value = false;
};

// 작성자 모달 닫기
const handleCancelEmp = () => {
    showEmpModal.value = false;
};

// 작성자 모달 검색
const handleEmpSearch = async (keyword) => {
    await fetchEmpList(keyword);
};
// 초기 로드
fetchNextCode();
</script>

<template>
    <div class="inbound-container">
        <section class="p-2 mx-auto">
            <!-- 발주 기본정보 -->
            <div class="card-block">
                <div class="section-header">
                    <h3 class="section-title">자재 구매 요청</h3>

                    <div class="btn-row">
                        <button class="btn-black" @click="resetForm">초기화</button>
                        <button class="btn-blue" @click="savePo">저장</button>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-item">
                        <label>요청번호</label>
                        <input type="text" class="input" v-model="Code" disabled />
                    </div>

                    <div class="form-item">
                        <label>작성자</label>
                        <input type="text" class="input" v-model="writerName" readonly placeholder="작성자 선택" @click="openEmpModal" />
                    </div>

                    <div class="form-item">
                        <label>요청부서</label>
                        <input type="text" class="input" v-model="deptName" disabled />
                    </div>

                    <div class="form-item">
                        <label>납기일자</label>
                        <Calendar v-model="deadLine" dateFormat="yy-mm-dd" :showIcon="true" placeholder="연도-월-일" inputClass="input" class="po-header-calendar" />
                    </div>
                    <div class="form-item">
                        <label>등록일자</label>
                        <input type="date" class="input" v-model="reqDate" disabled />
                    </div>
                </div>
            </div>

            <!-- 자재 상세목록 -->
            <div class="card-block mt-6">
                <div class="section-header">
                    <h3 class="section-title">요청 자재</h3>

                    <div class="btn-row">
                        <button class="btn-blue" @click="addRow">자재추가</button>
                        <button class="btn-red" @click="deleteSelected">자재삭제</button>
                    </div>
                </div>

                <div class="table-scroll">
                    <table class="nice-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" v-model="allChecked" @change="toggleAll" /></th>
                                <th>자재코드</th>
                                <th>자재명</th>
                                <th>요청수량</th>
                                <th>단위</th>
                                <th>공급업체</th>
                                <th>비고</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="row in materials" :key="row.id">
                                <td>
                                    <input type="checkbox" v-model="row.checked" />
                                </td>
                                <td>
                                    <input class="cell-input" v-model="row.code" @click="openMateModal(row)" readonly placeholder="자재 선택" />
                                </td>

                                <td>
                                    <input class="cell-input" v-model="row.name" @click="openMateModal(row)" readonly placeholder="자재 선택" />
                                </td>

                                <td><input class="cell-input" type="number" v-model="row.needQty" /></td>

                                <td>
                                    <input class="cell-input" :value="getUnitLabel(row.unit)" disabled />
                                </td>

                                <td><input class="cell-input" v-model="row.vendor" disabled /></td>
                                <td><input class="cell-input" type="text" v-model="row.note" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <SearchSelectModal v-model="showMateModal" :columns="mateColumns" :rows="mateRows" row-key="matCode" search-placeholder="자재명을 입력해주세요." @confirm="handleConfirmMate" @cancel="handleCancelMate" @search="handleSearchMate" />
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
    align-items: center; /* 세로 중앙정렬 */
    margin-bottom: 10px; /* 아래 여백 */
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

.input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.po-header-calendar {
    width: 100%;
}

:deep(.po-header-calendar.p-calendar) {
    display: inline-flex;
    width: 100%;
    align-items: center;
}

:deep(.po-header-calendar .p-inputtext) {
    flex: 1 1 auto;
    height: 40px;
    padding: 0 12px;
    box-sizing: border-box;
}

:deep(.po-header-calendar .p-datepicker-trigger) {
    flex: 0 0 auto;
    height: 40px;
    border-radius: 0 6px 6px 0;
    border-left: 0;
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

/* 테이블 */
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

/* ----- tbody 스크롤 영역 ----- */
.nice-table tbody {
    display: block;
    max-height: 290px;
    overflow-y: auto;
}

/* ----- 공통 셀 스타일 ----- */
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

/* 입력창 */
.cell-input {
    width: 100%;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.nice-table th:nth-child(1),
.nice-table td:nth-child(1) {
    width: 30px; /* 체크박스 */
}

.nice-table th:nth-child(2),
.nice-table td:nth-child(2) {
    width: 120px; /* 자재코드 */
}

.nice-table th:nth-child(3),
.nice-table td:nth-child(3) {
    width: 150px; /* 자재명 */
}

.nice-table th:nth-child(4),
.nice-table td:nth-child(4) {
    width: 110px; /* 요청수량 */
}

.nice-table th:nth-child(5),
.nice-table td:nth-child(5) {
    width: 80px; /* 단위 */
}

.nice-table th:nth-child(6),
.nice-table td:nth-child(6) {
    width: 150px; /* 공급업체 */
}

.nice-table th:nth-child(7),
.nice-table td:nth-child(7) {
    width: auto; /* 비고 */
}
</style>
