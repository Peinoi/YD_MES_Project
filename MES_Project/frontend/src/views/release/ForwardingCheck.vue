<!-- src/views/release/ForwardingCheck.vue -->
<script setup>
import { reactive, ref, computed } from 'vue';

const searchForm = reactive({
    releaseNo: '',
    productName: '',
    qtyFrom: '',
    qtyTo: '',
    dateFrom: '',
    dateTo: '',
    requester: '',
    manager: '',
    client: ''
});

const rows = ref([
    {
        id: 1,
        checked: false,
        releaseNo: 'SH20250501-1',
        productName: '스낵면',
        qty: 20000,
        date: '2025-05-26',
        manager: '한주연',
        client: '이마트',
        status: '부분출고'
    },
    {
        id: 2,
        checked: false,
        releaseNo: 'SH20250501-2',
        productName: '신라면',
        qty: 70000,
        date: '2025-05-26',
        manager: '한주연',
        client: '홈플러스',
        status: '출고완료'
    },
    {
        id: 3,
        checked: false,
        releaseNo: 'SH20250501-3',
        productName: '신라면',
        qty: 60000,
        date: '2025-05-26',
        manager: '한주연',
        client: '이마트',
        status: '출고대기'
    }
    // 필요하면 더미데이터를 추가해서 테스트해도 됨
]);

const allChecked = computed({
    get() {
        return rows.value.length > 0 && rows.value.every((r) => r.checked);
    },
    set(val) {
        rows.value.forEach((r) => {
            r.checked = val;
        });
    }
});

const filteredRows = computed(() => {
    return rows.value.filter((r) => {
        // 출고번호
        if (searchForm.releaseNo && !r.releaseNo.toLowerCase().includes(searchForm.releaseNo.toLowerCase())) return false;

        // 제품명
        if (searchForm.productName && !r.productName.toLowerCase().includes(searchForm.productName.toLowerCase())) return false;

        // 수량 범위
        if (searchForm.qtyFrom && r.qty < Number(searchForm.qtyFrom)) return false;
        if (searchForm.qtyTo && r.qty > Number(searchForm.qtyTo)) return false;

        // 출고일자 범위
        if (searchForm.dateFrom && r.date < searchForm.dateFrom) return false;
        if (searchForm.dateTo && r.date > searchForm.dateTo) return false;

        // 출고입자 / 담당자 / 거래처는 샘플 데이터에 따로 필드가 없어서
        // 여기서는 manager, client만 간단히 매핑
        if (searchForm.manager && !r.manager.toLowerCase().includes(searchForm.manager.toLowerCase())) return false;

        if (searchForm.client && !r.client.toLowerCase().includes(searchForm.client.toLowerCase())) return false;

        return true;
    });
});

const resultCount = computed(() => filteredRows.value.length);

const resetForm = () => {
    searchForm.releaseNo = '';
    searchForm.productName = '';
    searchForm.qtyFrom = '';
    searchForm.qtyTo = '';
    searchForm.dateFrom = '';
    searchForm.dateTo = '';
    searchForm.requester = '';
    searchForm.manager = '';
    searchForm.client = '';
};

const doSearch = () => {
    // 실제 검색은 filteredRows가 반응형으로 처리하므로 여기선 로그만
    console.log('조회 클릭', { ...searchForm });
};

const downloadExcel = () => {
    // 나중에 실제 엑셀 다운로드 로직 연결
    console.log('엑셀 다운로드 클릭');
};
</script>

<template>
    <div class="forward-check-page">
        <!-- 🔍 검색 조건 영역 -->
        <section class="search-card">
            <h3>출고조회</h3>
            <div class="search-grid">
                <!-- 출고번호 -->
                <div class="field">
                    <label>출고번호</label>
                    <input v-model="searchForm.releaseNo" type="text" class="input" placeholder="출고번호" />
                </div>

                <!-- 출고제품 -->
                <div class="field">
                    <label>출고제품</label>
                    <input v-model="searchForm.productName" type="text" class="input" placeholder="출고제품" />
                </div>

                <!-- 출고수량 범위 -->
                <div class="field field-range">
                    <label>출고수량</label>
                    <div class="range-row">
                        <input v-model="searchForm.qtyFrom" type="number" class="input" placeholder="from" />
                        <span class="range-dash">~</span>
                        <input v-model="searchForm.qtyTo" type="number" class="input" placeholder="to" />
                    </div>
                </div>

                <!-- 출고일자 범위 -->
                <div class="field field-range">
                    <label>출고일자</label>
                    <div class="range-row">
                        <input v-model="searchForm.dateFrom" type="date" class="input" />
                        <span class="range-dash">~</span>
                        <input v-model="searchForm.dateTo" type="date" class="input" />
                    </div>
                </div>

                <!-- 출고입자 -->
                <div class="field">
                    <label>출고입자</label>
                    <input v-model="searchForm.requester" type="text" class="input" placeholder="출고입자" />
                </div>

                <!-- 출고담당자 -->
                <div class="field">
                    <label>출고담당자</label>
                    <input v-model="searchForm.manager" type="text" class="input" placeholder="출고담당자" />
                </div>

                <!-- 거래처 -->
                <div class="field">
                    <label>거래처</label>
                    <input v-model="searchForm.client" type="text" class="input" placeholder="거래처" />
                </div>
            </div>

            <div class="search-actions">
                <button class="btn btn-black" @click="resetForm">초기화</button>
                <button class="btn btn-yellow" @click="doSearch">조회</button>
            </div>
        </section>

        <!-- 📋 결과 영역 -->
        <section class="result-card">
            <div class="result-header">
                <div class="result-count">검색 결과 {{ resultCount }}건</div>

                <button class="btn btn-excel" @click="downloadExcel">엑셀 다운로드</button>
            </div>

            <div class="table-wrap">
                <table class="result-table">
                    <thead>
                        <tr>
                            <th style="width: 40px">
                                <input type="checkbox" v-model="allChecked" />
                            </th>
                            <th>출고번호</th>
                            <th>출고제품</th>
                            <th>출고수량</th>
                            <th>출고일자</th>
                            <th>출고담당자</th>
                            <th>거래처</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!filteredRows.length">
                            <td colspan="8" class="empty">검색 결과가 없습니다.</td>
                        </tr>

                        <tr v-for="row in filteredRows" :key="row.id">
                            <td>
                                <input v-model="row.checked" type="checkbox" />
                            </td>
                            <td>{{ row.releaseNo }}</td>
                            <td>{{ row.productName }}</td>
                            <td class="text-right">{{ row.qty.toLocaleString() }}개</td>
                            <td>{{ row.date.replaceAll('-', '.') }}</td>
                            <td>{{ row.manager }}</td>
                            <td>{{ row.client }}</td>
                            <td>{{ row.status }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<style scoped>
* {
    font-size: 14px;
}

/* 🔹 ForwardingManagement 의 .forward-page 랑 동일 구조 */
.forward-check-page {
    padding: 2rem;
    background: #f5f6fa;
    display: flex;
    flex-direction: column;
    height: 100%; /* ✅ 부모 높이만 따라감 (100vh 강제 X) */
    box-sizing: border-box;
    overflow: hidden; /* ✅ 페이지 자체 스크롤 막기 */
}

/* 🔍 검색 카드 */
.search-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1.25rem 1.5rem 1rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    margin-bottom: 1.25rem;

    flex-shrink: 0; /* ✅ 높이 줄어들지 않게 고정 */
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem 1.25rem;
}

.field {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
}

.field-range .range-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.field label {
    margin-bottom: 0.2rem;
    color: #333;
}

.input {
    border: 1px solid #d0d7e2;
    border-radius: 4px;
    padding: 0.35rem 0.5rem;
    font-size: 0.85rem;
    outline: none;
}

.input:focus {
    border-color: #f2b300;
}

.range-dash {
    font-size: 0.8rem;
    color: #666;
}

.search-actions {
    margin-top: 0.8rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

/* 버튼 */
.btn {
    border: none;
    border-radius: 4px;
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
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

.btn-excel {
    padding: 7px 16px;
    font-size: 13px;
    border-radius: 6px;
    border: 1px solid #6cbf5a;
    background: #f4fff2;
    cursor: pointer;
}

/* 📋 결과 카드 – ForwardingManagement 의 forward-card-products 같은 역할 */
.result-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1rem 1.5rem 1.25rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);

    flex: 1; /* ✅ 남은 높이 전부 차지 */
    min-height: 0; /* ✅ 내부 스크롤 가능하게 */
    display: flex;
    flex-direction: column;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
}

.result-count {
    font-weight: 600;
}

/* 📌 테이블 래퍼 – 여기만 스크롤 */
.table-wrap {
    width: 100%;
    flex: 1; /* ✅ result-card 안에서 남은 높이 채움 */
    overflow-y: auto; /* ✅ 테이블만 세로 스크롤 */
    overflow-x: auto;
}

/* 테이블 */
.result-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.result-table thead {
    background: #f9f9fb;
    position: sticky; /* ✅ 스크롤 시 헤더 고정 (원하면 유지, 싫으면 지워도 됨) */
    top: 0;
    z-index: 10;
}

.result-table th,
.result-table td {
    padding: 0.45rem 0.6rem;
    border: 1px solid #e0e4f0;
}

.result-table th {
    text-align: left;
}

.text-right {
    text-align: right;
}

.empty {
    text-align: center;
    color: #888;
}

/* 반응형 */
@media (max-width: 1024px) {
    .search-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .forward-check-page {
        padding: 1rem;
    }
}

@media (max-width: 640px) {
    .search-grid {
        grid-template-columns: 1fr;
    }

    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>
