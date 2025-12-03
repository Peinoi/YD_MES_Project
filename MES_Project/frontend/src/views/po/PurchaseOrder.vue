<script setup>
import { ref } from 'vue';
import axios from 'axios';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const purchaseCode = ref('');
const showPOModal = ref(false);
const showMateModal = ref(false);

// 선택 행 기억
const activeMateRow = ref(null);

// 발주 불러오기 모달 컬럼
const orderColumns = [
    { field: 'purchaseCode', label: '발주서 번호' },
    { field: 'purchaseDate', label: '발주제안일' },
    { field: 'matCode', label: '자재명' }
];

// 자재 선택 모달 컬럼
const mateColumns = [
    { field: 'matCode', label: '자재코드' },
    { field: 'matName', label: '자재명' },
    { field: 'saveInven', label: '필요수량' },
    { field: 'curInven', label: '현재고' },
    { field: 'insInven', label: '부족수량' },
    { field: 'clientName', label: '공급업체' }
];

const orderRows = ref([]);
const mateRows = ref([]);

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

const fetchMateList = async (keyword = '') => {
    const res = await axios.get('/api/poder/mate', {
        params: {
            keyword: keyword || null
        }
    });

    mateRows.value = res.data.data || [];
};

//발주정보 모달
const openOrderModal = async () => {
    await fetchOrderList();
    showPOModal.value = true;
};

//자재 모달
const openMateModal = async (row) => {
    activeMateRow.value = row;
    await fetchMateList();
    showMateModal.value = true;
};

// 오늘날짜, 형식변환
function getToday() {
    return new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// 날짜
const orderDate = ref(getToday()); // regdate
const purchaseDate = ref(getToday()); // purchase_req_date

// 헤더 필드
const writerCode = ref('EMP-10003');
const note = ref('');
const status = ref('요청완료');

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
        vendor: ''
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

function loadRequest() {
    // 추후 연동할 때 구현
    console.log('구매요청서 불러오기');
}

//발주서 저장
const savePo = async () => {
    const today = getToday();

    const header = {
        purchase_code: null, // 신규 등록
        purchase_req_date: purchaseDate.value || today, // 발주제안일
        stat: status.value,
        regdate: orderDate.value || today, // 시스템 등록일
        note: note.value,
        mcode: writerCode.value
    };

    const items = materials.value
        .map((row) => ({
            unit: row.unit,
            needQty: row.needQty,
            dueDate: row.dueDate,
            vendor: row.vendor,
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
        status.value = '요청완료';
        note.value = '';
        writerCode.value = 'EMP-10003';
        materials.value = [createRow(), createRow(), createRow()];
        allChecked.value = false;
    } catch (err) {
        console.error(err);
        alert('삭제 중 오류가 발생했습니다.\n콘솔 로그를 확인해 주세요.');
    }
};

const resetForm = () => {
    if (!confirm('화면을 초기화하시겠습니까?')) return;

    purchaseCode.value = '';
    purchaseDate.value = getToday();
    orderDate.value = getToday();
    status.value = '요청완료';
    note.value = '';
    writerCode.value = 'EMP-10003';

    // 자재 테이블 초기화
    materials.value = [createRow(), createRow(), createRow()];

    allChecked.value = false;
};

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

        status.value = data.header.stat || '요청완료';
        note.value = data.header.note || '';
        writerCode.value = data.header.mcode || 'EMP-10003';

        // 3) 상세(자재 목록) 매핑
        const items = data.items || [];

        console.log('상세 아이템 목록:', items);

        if (items.length) {
            materials.value = items.map((item) => ({
                id: item.mpo_d_code, // 고유키로 사용
                checked: false,
                name: item.matName || '', // 자재명
                type: item.matType || '', // 자재구분
                code: item.mat_code || '', // 자재코드
                unit: item.unit || item.matUnit || '',
                needQty: item.req_qtt || item.saveInven || '',
                stock: item.curInven ?? '', // 현재고
                lackQty: item.insInven ?? '', // 부족수량
                dueDate: item.deadline ? String(item.deadline).slice(0, 10) : '',
                vendor: item.clientName || item.client_code || ''
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
    if (selectedRow.saveInven !== undefined) row.needQty = selectedRow.saveInven;
    if (selectedRow.curInven !== undefined) row.stock = selectedRow.curInven;
    if (selectedRow.insInven !== undefined) row.lackQty = selectedRow.insInven;
    if (selectedRow.clientName) row.vendor = selectedRow.clientName;

    showMateModal.value = false;
    activeMateRow.value = null;
};

//자재 닫기
const handleCancelMate = () => {
    showMateModal.value = false;
    activeMateRow.value = null;
};
</script>

<template>
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
                    <input type="text" class="input" v-model="purchaseCode" disabled />
                </div>

                <div class="form-item">
                    <label>발주제안일</label>
                    <input type="date" class="input" v-model="purchaseDate" />
                </div>

                <div class="form-item">
                    <label>작성자</label>
                    <select class="input" v-model="writerCode">
                        <option>EMP-10003</option>
                        <option>EMP-10004</option>
                        <option>EMP-10001</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>발주상태</label>
                    <input type="text" class="input" disabled v-model="status" />
                </div>

                <div class="form-item">
                    <label>자재구매요청서번호</label>
                    <input type="text" class="input" disabled />
                </div>

                <div class="form-item">
                    <label>비고</label>
                    <input type="text" class="input" v-model="note" />
                </div>
            </div>
        </div>

        <!-- 자재 상세목록 -->
        <div class="card-block mt-10">
            <div class="section-header">
                <h3 class="section-title">자재 상세목록</h3>

                <div class="btn-row">
                    <button class="btn-blue" @click="addRow">자재추가</button>
                    <button class="btn-red" @click="deleteSelected">자재삭제</button>
                    <button class="btn-green" @click="loadRequest">자재구매요청서 불러오기</button>
                </div>
            </div>

            <table class="nice-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" v-model="allChecked" @change="toggleAll" /></th>
                        <th>자재명</th>
                        <th>자재구분</th>
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
                            <input class="cell-input" v-model="row.name" @click="openMateModal(row)" readonly placeholder="자재 선택" />
                        </td>
                        <td><input class="cell-input" v-model="row.type" /></td>
                        <td>
                            <input class="cell-input" v-model="row.code" />
                        </td>

                        <td>
                            <input class="cell-input" v-model="row.unit" />
                        </td>

                        <td><input class="cell-input" type="number" v-model="row.needQty" /></td>
                        <td><input class="cell-input" type="number" v-model="row.stock" /></td>
                        <td><input class="cell-input" type="number" v-model="row.lackQty" /></td>

                        <td><input class="cell-input" type="date" v-model="row.dueDate" /></td>
                        <td><input class="cell-input" v-model="row.vendor" /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
    <SearchSelectModal v-model="showPOModal" :columns="orderColumns" :rows="orderRows" row-key="purchaseCode" search-placeholder="발주서번호를 입력해주세요." @confirm="handleConfirmOrder" @cancel="handleCancelOrder" />
    <SearchSelectModal v-model="showMateModal" :columns="mateColumns" :rows="mateRows" row-key="matCode" search-placeholder="자재명을 입력해주세요." @confirm="handleConfirmMate" @cancel="handleCancelMate" />
</template>

<style scoped>
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
    margin-bottom: 16px; /* 아래 여백 */
}

/* 섹션 제목 */
.section-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 18px;
    color: #444;
    display: inline-block;
}

/* ----- 기본정보 form ----- */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
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

/* ---------- 테이블 ---------- */
.nice-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ddd;
}

.nice-table th {
    background: #faf7e8;
    border-bottom: 1px solid #ddd;
    padding: 10px;
    font-size: 14px;
}

.nice-table td {
    padding: 6px;
    border-bottom: 1px solid #eee;
}

.cell-input {
    width: 100%;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
