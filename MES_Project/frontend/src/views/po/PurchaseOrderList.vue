<script setup>
import { ref } from 'vue';

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

// 전체 목록 (샘플 데이터)
const allList = ref([
    {
        id: 1,
        checked: false,
        orderNo: 'BJ00123',
        requestDate: '2025.05.26',
        materialType: '원자재',
        materialName: '양파',
        vendor: '예담',
        qty: 2000,
        dueDate: '2025.05.26',
        status: '요청완료',
        writer: '한주연',
        regDate: '2025.05.26'
    },
    {
        id: 2,
        checked: false,
        orderNo: 'BJ00123',
        requestDate: '2025.05.26',
        materialType: '부자재',
        materialName: '라면봉지',
        vendor: '예담',
        qty: 3000,
        dueDate: '2025.05.26',
        status: '입고완료',
        writer: '홍길동',
        regDate: '2025.05.26'
    },
    {
        id: 3,
        checked: false,
        orderNo: 'BJ00123',
        requestDate: '2025.05.26',
        materialType: '반제품',
        materialName: '스프용',
        vendor: '라면이 조아',
        qty: 5000,
        dueDate: '2025.05.26',
        status: '요청완료',
        writer: '한주연',
        regDate: '2025.05.26'
    }
]);

// 실제 테이블에 보여줄 데이터
const tableRows = ref([...allList.value]);

const allChecked = ref(false);

// 필터 적용 함수 (조회 버튼에서 호출)
function applyFilter() {
    const f = filters.value;

    tableRows.value = allList.value.filter((row) => {
        if (f.orderNo && !row.orderNo.includes(f.orderNo)) return false;

        if (f.materialType && row.materialType !== f.materialType) return false;

        if (f.vendor && !row.vendor.includes(f.vendor.trim())) return false;

        if (f.status && row.status !== f.status) return false;

        if (f.qtyFrom != null && f.qtyFrom !== '' && row.qty < f.qtyFrom) return false;

        if (f.qtyTo != null && f.qtyTo !== '' && row.qty > f.qtyTo) return false;

        // 날짜 필터 필요하면 여기서 Date로 변환해서 비교

        return true;
    });

    // 전체선택 체크 상태 재조정
    allChecked.value = tableRows.value.length > 0 && tableRows.value.every((r) => r.checked);
}

// 조회 버튼
function onSearch() {
    console.log('검색 조건:', filters.value);
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
</script>

<template>
    <section class="p-2 mx-auto filter-section">
        <!--  검색 영역 -->
        <div class="card-block filter-block">
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
                        <option value="원자재">원자재</option>
                        <option value="부자재">부자재</option>
                        <option value="반제품">반제품</option>
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
                    <input class="input" v-model="filters.vendor" />
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
                <div class="result-info">
                    검색 결과 <span class="highlight">{{ tableRows.length }}</span
                    >건
                </div>
                <button class="btn-excel">엑셀 다운로드</button>
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
                        <td>{{ row.orderNo }}</td>
                        <td>{{ row.requestDate }}</td>
                        <td>{{ row.materialType }}</td>
                        <td>{{ row.materialName }}</td>
                        <td>{{ row.vendor }}</td>
                        <td class="text-right">
                            {{ formatNumber(row.qty) }}
                        </td>
                        <td>{{ row.dueDate }}</td>
                        <td>{{ row.status }}</td>
                        <td>{{ row.writer }}</td>
                        <td>{{ row.regDate }}</td>
                    </tr>

                    <tr v-if="!tableRows.length">
                        <td colspan="11" class="empty-cell">조회 결과가 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
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
    margin-bottom: 12px;
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
