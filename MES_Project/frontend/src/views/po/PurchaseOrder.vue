<script setup>
import { ref } from 'vue';
import axios from 'axios';

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
</script>

<template>
    <section class="p-2 mx-auto">
        <!-- 발주 기본정보 -->
        <div class="card-block">
            <div class="section-header">
                <h3 class="section-title">발주 기본정보</h3>

                <div class="btn-row">
                    <button class="btn-red">삭제</button>
                    <button class="btn-black">초기화</button>
                    <button class="btn-blue" @click="savePo()">저장</button>
                    <button class="btn-green">발주정보 불러오기</button>
                </div>
            </div>

            <div class="form-grid">
                <div class="form-item">
                    <label>발주서번호</label>
                    <input type="text" class="input" disabled />
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

                        <td><input class="cell-input" v-model="row.name" /></td>
                        <td><input class="cell-input" v-model="row.type" /></td>
                        <td>
                            <select class="cell-input" v-model="row.code">
                                <option>MAT-1001</option>
                                <option>MAT-1002</option>
                                <option>MAT-1003</option>
                            </select>
                        </td>

                        <td>
                            <select class="cell-input" v-model="row.unit">
                                <option></option>
                                <option>KG</option>
                                <option>EA</option>
                            </select>
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
