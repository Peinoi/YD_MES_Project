<!-- src/views/release/ForwardingCheck.vue -->
<script setup>
import { reactive, ref, computed } from 'vue';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';
import axios from 'axios';

/* ===========================
 *  검색 폼 & 결과 리스트
 * =========================== */

const searchForm = reactive({
    releaseNo: '',
    productName: '',
    qtyFrom: '',
    qtyTo: '',
    dateFrom: '',
    dateTo: '',
    manager: '',
    client: ''
});

// 실제 검색 결과 (백엔드 연동 전이라 가짜 데이터/또는 나중에 세팅)
const rows = ref([]);

/* ===========================
 *  전체 체크박스
 * =========================== */
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

/* ===========================
 *  필터링 (프런트 필터)
 * =========================== */
const filteredRows = computed(() => {
    return rows.value.filter((r) => {
        // 출고번호
        if (searchForm.releaseNo && !String(r.releaseNo).toLowerCase().includes(searchForm.releaseNo.toLowerCase())) return false;

        // 제품명
        if (searchForm.productName && !String(r.productName).toLowerCase().includes(searchForm.productName.toLowerCase())) return false;

        // 수량 범위
        if (searchForm.qtyFrom && r.qty < Number(searchForm.qtyFrom)) return false;
        if (searchForm.qtyTo && r.qty > Number(searchForm.qtyTo)) return false;

        // 출고일자 범위 (r.date 는 'YYYY-MM-DD' 가정)
        if (searchForm.dateFrom && r.date < searchForm.dateFrom) return false;
        if (searchForm.dateTo && r.date > searchForm.dateTo) return false;

        // 출고담당자 / 거래처
        if (searchForm.manager && !String(r.manager).toLowerCase().includes(searchForm.manager.toLowerCase())) return false;
        if (searchForm.client && !String(r.client).toLowerCase().includes(searchForm.client.toLowerCase())) return false;

        return true;
    });
});

const resultCount = computed(() => filteredRows.value.length);

/* ===========================
 *  공통: 초기화 / 조회 / 엑셀
 * =========================== */

const resetForm = () => {
    searchForm.releaseNo = '';
    searchForm.productName = '';
    searchForm.qtyFrom = '';
    searchForm.qtyTo = '';
    searchForm.dateFrom = '';
    searchForm.dateTo = '';
    searchForm.manager = '';
    searchForm.client = '';
};

const doSearch = () => {
    // 나중에 실제 API 검색 붙이면 여기서 호출
    console.log('조회 클릭', { ...searchForm });
};

const downloadExcel = () => {
    // 나중에 실제 엑셀 다운로드 로직 연결
    console.log('엑셀 다운로드 클릭');
};

/* ===========================
 *  출고번호 모달 (출고요청 목록)
 *  - ForwardingManagement 의 출고 모달 재사용 느낌
 * =========================== */

const showReleaseModal = ref(false);
const releaseKeyword = ref('');
const releaseRows = ref([]);

const releaseColumns = [
    { field: 'releaseCode', label: '출고번호' },
    { field: 'releaseDate', label: '출고일자' },
    { field: 'orderCode', label: '주문번호' },
    { field: 'client', label: '거래처' },
    { field: 'status', label: '상태' },
    { field: 'totalQty', label: '총 출고수량' }
];

const formatDate = (d) => {
    if (!d) return '';
    return String(d).split('T')[0];
};

const fetchReleaseList = async (keyword = '') => {
    try {
        const res = await axios.get('/api/release/fwd', {
            params: { keyword }
        });

        console.log('[ForwardingCheck] 출고 목록 조회 응답:', res.data);

        const raw = res.data?.data;

        if (!raw) {
            releaseRows.value = [];
        } else if (Array.isArray(raw)) {
            releaseRows.value = raw.map((r) => ({
                ...r,
                releaseDate: formatDate(r.releaseDate)
            }));
        } else {
            releaseRows.value = [
                {
                    ...raw,
                    releaseDate: formatDate(raw.releaseDate)
                }
            ];
        }
    } catch (err) {
        console.error('[ForwardingCheck] 출고 목록 조회 실패:', err);
        releaseRows.value = [];
    }
};

const openReleaseModal = () => {
    fetchReleaseList('');
    showReleaseModal.value = true;
};

const handleSearchRelease = (keyword) => {
    releaseKeyword.value = keyword;
    fetchReleaseList(keyword);
};

const handleConfirmRelease = (row) => {
    if (!row) return;
    // 검색조건에 출고번호 세팅
    searchForm.releaseNo = row.releaseCode;
    showReleaseModal.value = false;
};

const handleCancelRelease = () => {
    showReleaseModal.value = false;
};

/* ===========================
 *  출고담당자 모달 (사원 목록)
 *  - ForwardingManagement 의 직원 모달 재사용
 * =========================== */

const showEmpModal = ref(false);
const employees = ref([]);
const empKeyword = ref('');

const empColumns = [
    { field: 'empCode', label: '사원코드' },
    { field: 'empName', label: '이름' }
];

const fetchEmployees = async () => {
    try {
        const res = await axios.get('/api/release/fwd/employees');
        console.log('[ForwardingCheck] 직원 목록 응답:', res.data);

        if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
            employees.value = res.data.data;
        } else {
            employees.value = [];
        }
    } catch (err) {
        console.error('[ForwardingCheck] 직원 목록 조회 실패:', err);
        employees.value = [];
    }
};

const employeeRows = computed(() => {
    if (!empKeyword.value) return employees.value;
    const kw = empKeyword.value.toLowerCase();
    return employees.value.filter((e) => (e.empCode && e.empCode.toLowerCase().includes(kw)) || (e.empName && e.empName.toLowerCase().includes(kw)));
});

const openEmpModal = () => {
    if (!employees.value.length) {
        fetchEmployees();
    }
    showEmpModal.value = true;
};

const handleSearchEmp = (keyword) => {
    empKeyword.value = (keyword || '').trim();
};

const handleConfirmEmp = (row) => {
    if (!row) return;
    searchForm.manager = row.empName; // 검색조건에는 이름으로 세팅
    showEmpModal.value = false;
};

const handleCancelEmp = () => {
    showEmpModal.value = false;
};

/* ===========================
 *  출고제품 모달
 *  - 아직 백엔드 API 없으니 껍데기만 만들어둠
 *    (나중에 제품검색 API 연결해서 rows 채우면 됨)
 * =========================== */

const showProductModal = ref(false);
const productKeyword = ref('');
const productRows = ref([]);

const productColumns = [
    { field: 'productCode', label: '제품코드' },
    { field: 'productName', label: '제품명' }
    // 필요하면 타입/규격/단위 컬럼 추가
];

const fetchProductList = async (keyword = '') => {
    try {
        const res = await axios.get('/api/release/fwd/products', {
            params: { keyword }
        });
        console.log('[ForwardingCheck] 제품 목록 응답:', res.data);

        const raw = res.data?.data;
        productRows.value = Array.isArray(raw) ? raw : raw ? [raw] : [];
    } catch (err) {
        console.error('[ForwardingCheck] 제품 목록 조회 실패:', err);
        productRows.value = [];
    }
};

const openProductModal = () => {
    fetchProductList('');
    showProductModal.value = true;
};

const handleSearchProduct = (keyword) => {
    productKeyword.value = keyword;
    fetchProductList(keyword);
};

const handleConfirmProduct = (row) => {
    if (!row) return;
    searchForm.productName = row.productName;
    showProductModal.value = false;
};

const handleCancelProduct = () => {
    showProductModal.value = false;
};

/* ===========================
 *  거래처 모달
 *  - client_tbl 기반 조회용 껍데기
 *    (API 만들면 여기 연결)
 * =========================== */

const showClientModal = ref(false);
const clientKeyword = ref('');
const clientRows = ref([]); // TODO: 실제 client 목록 API 연결

const clientColumns = [
    { field: 'clientCode', label: '거래처코드' },
    { field: 'clientName', label: '거래처명' }
];

const fetchClientList = async (keyword = '') => {
    try {
        const res = await axios.get('/api/release/fwd/clients', {
            params: { keyword }
        });
        console.log('[ForwardingCheck] 거래처 목록 응답:', res.data);

        const raw = res.data?.data;
        clientRows.value = Array.isArray(raw) ? raw : raw ? [raw] : [];
    } catch (err) {
        console.error('[ForwardingCheck] 거래처 목록 조회 실패:', err);
        clientRows.value = [];
    }
};

const openClientModal = () => {
    fetchClientList('');
    showClientModal.value = true;
};

const handleSearchClient = (keyword) => {
    clientKeyword.value = keyword;
    fetchClientList(keyword);
};

const handleConfirmClient = (row) => {
    if (!row) return;
    searchForm.client = row.clientName;
    showClientModal.value = false;
};

const handleCancelClient = () => {
    showClientModal.value = false;
};
</script>

<template>
    <div class="forward-check-page">
        <!-- 🔍 모달들 -->
        <!-- 출고번호 선택 모달 -->
        <SearchSelectModal
            v-model="showReleaseModal"
            :columns="releaseColumns"
            :rows="releaseRows"
            row-key="releaseCode"
            search-placeholder="출고번호 / 주문번호 / 거래처를 입력해주세요."
            @search="handleSearchRelease"
            @confirm="handleConfirmRelease"
            @cancel="handleCancelRelease"
        />

        <!-- 출고제품 선택 모달 -->
        <SearchSelectModal
            v-model="showProductModal"
            :columns="productColumns"
            :rows="productRows"
            row-key="productCode"
            search-placeholder="제품코드 / 제품명을 입력해주세요."
            @search="handleSearchProduct"
            @confirm="handleConfirmProduct"
            @cancel="handleCancelProduct"
        />

        <!-- 출고담당자 선택 모달 -->
        <SearchSelectModal v-model="showEmpModal" :columns="empColumns" :rows="employeeRows" row-key="empCode" search-placeholder="사원코드 / 이름을 입력해주세요." @search="handleSearchEmp" @confirm="handleConfirmEmp" @cancel="handleCancelEmp" />

        <!-- 거래처 선택 모달 -->
        <SearchSelectModal
            v-model="showClientModal"
            :columns="clientColumns"
            :rows="clientRows"
            row-key="clientCode"
            search-placeholder="거래처코드 / 거래처명을 입력해주세요."
            @search="handleSearchClient"
            @confirm="handleConfirmClient"
            @cancel="handleCancelClient"
        />

        <!-- 🔍 검색 조건 영역 -->
        <section class="search-card">
            <h3>출고조회</h3>
            <div class="search-grid">
                <!-- 출고번호 -->
                <div class="field">
                    <label>출고번호</label>
                    <input v-model="searchForm.releaseNo" type="text" class="input clickable" placeholder="출고번호" readonly @click="openReleaseModal" />
                </div>

                <!-- 출고제품 -->
                <div class="field">
                    <label>출고제품</label>
                    <input v-model="searchForm.productName" type="text" class="input clickable" placeholder="출고제품" readonly @click="openProductModal" />
                </div>

                <!-- 출고수량 범위 -->
                <div class="field field-range qty-range">
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

                <!-- 출고담당자 -->
                <div class="field">
                    <label>출고담당자</label>
                    <input v-model="searchForm.manager" type="text" class="input clickable" placeholder="출고담당자" readonly @click="openEmpModal" />
                </div>

                <!-- 거래처 -->
                <div class="field">
                    <label>거래처</label>
                    <input v-model="searchForm.client" type="text" class="input clickable" placeholder="거래처" readonly @click="openClientModal" />
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
    flex: 1; /* ✅ 상위 flex 레이아웃 안에서 남는 높이 차지 */
    min-height: 0; /* ✅ 내부 스크롤 영역이 제대로 계산되도록 */
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

/* 클릭 가능한 인풋 (모달 오픈용) */
.clickable {
    cursor: pointer;
    background-color: #fff;
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
    position: sticky; /* ✅ 스크롤 시 헤더 고정 */
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

/* 출고수량 input 너비 조절 */
.field-range.qty-range .range-row .input {
    width: 125px; /* 🔥 원래보다 좁게 */
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
