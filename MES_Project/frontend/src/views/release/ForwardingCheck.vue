<!-- src/views/release/ForwardingCheck.vue -->
<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';
import axios from 'axios';

// 공통코드: 제품유형 맵
const typeMap = ref({});
const unitMap = ref({});
const specMap = ref({});

/* ===========================
 *  검색 폼 & 결과 리스트
 * =========================== */

const searchForm = reactive({
    releaseNo: '',
    productName: '',
    productCode: '',
    qtyFrom: '',
    qtyTo: '',
    dateFrom: '',
    dateTo: '',
    manager: '',
    client: ''
});

// 실제 검색 결과 (원본: 출고번호 + 제품별 라인)
const rows = ref([]);

// 출고번호별 체크 상태
const checkedMap = reactive({});

/* 🔹 출고번호 기준 그룹핑
 *  - 같은 releaseNo끼리 묶어서 qty 합계
 *  - 제품명: "첫 제품명 외 N개" 형태
 */
const groupedFilteredRows = computed(() => {
    const map = new Map();

    for (const r of rows.value) {
        const key = r.releaseNo;
        const qty = Number(r.qty) || 0;

        if (!map.has(key)) {
            map.set(key, {
                ...r,
                qty, // 합계 시작
                productCount: 1,
                firstProductName: r.productName
            });
        } else {
            const agg = map.get(key);
            agg.qty += qty;
            agg.productCount += 1;
        }
    }

    return Array.from(map.values()).map((row) => ({
        ...row,
        displayProductName: row.productCount > 1 ? `${row.firstProductName} 외 ${row.productCount - 1}개` : row.firstProductName
    }));
});

/* 🔹 선택된 출고(출고번호 단위) */
const selectedRows = computed(() => groupedFilteredRows.value.filter((r) => checkedMap[r.releaseNo]));

/* 🔹 전체 체크박스 (출고번호 단위) */
const allChecked = computed({
    get() {
        const list = groupedFilteredRows.value;
        if (!list.length) return false;
        return list.every((r) => !!checkedMap[r.releaseNo]);
    },
    set(val) {
        groupedFilteredRows.value.forEach((r) => {
            checkedMap[r.releaseNo] = val;
        });
    }
});

/* 🔹 결과 건수도 그룹 기준으로 */
const resultCount = computed(() => groupedFilteredRows.value.length);

/* ===========================
 *  공통: 초기화 / 조회 / 엑셀
 * =========================== */

const resetForm = () => {
    searchForm.releaseNo = '';
    searchForm.productName = '';
    searchForm.productCode = '';
    searchForm.qtyFrom = '';
    searchForm.qtyTo = '';
    searchForm.dateFrom = '';
    searchForm.dateTo = '';
    searchForm.manager = '';
    searchForm.client = '';

    // 체크박스 초기화
    Object.keys(checkedMap).forEach((k) => delete checkedMap[k]);

    // 전부 빈칸인 상태로 다시 조회 (전체조회)
    doSearch();
};

const doSearch = async () => {
    try {
        const res = await axios.get('/api/release/fwd/check', {
            params: { ...searchForm }
        });

        const list = Array.isArray(res.data?.data) ? res.data.data : [];

        rows.value = list.map((row, idx) => ({
            id: idx,
            ...row // releaseNo, productName, qty, date, manager, client, status
        }));

        // 기존 체크 상태 초기화
        Object.keys(checkedMap).forEach((k) => delete checkedMap[k]);

        console.log('[ForwardingCheck] 검색 결과:', rows.value);
    } catch (err) {
        console.error('[ForwardingCheck] 조회 실패:', err);
        alert('출고요청 조회 중 오류가 발생했습니다.');
    }
};

// 엑셀 다운로드
const downloadExcel = async () => {
    // 1) 체크된 출고번호 기준 (출고번호 단위)
    const target = selectedRows.value.length ? selectedRows.value : [];

    if (!target.length) {
        alert('엑셀로 내보낼 출고내역을 선택해주세요.');
        return;
    }

    try {
        // 2) 각 출고번호별 상세 조회
        const allDetails = await Promise.all(
            target.map(async (row) => {
                const releaseNo = row.releaseNo;

                const res = await axios.get(`/api/release/fwd/${releaseNo}`);
                if (res.data?.status !== 'success' || !res.data.data) {
                    console.warn('[Excel] 상세 없음:', releaseNo);
                    return [];
                }

                const { header: h, lines } = res.data.data;

                // 총 주문/출고수량 (상태 계산용)
                const totalOrder = (lines || []).reduce((sum, l) => sum + (l.orderQty || 0), 0);
                const totalRelease = (lines || []).reduce((sum, l) => sum + (l.releaseQty || 0), 0);
                const remaining = Math.max(0, totalOrder - totalRelease);
                const status = remaining <= 0 ? '출고완료' : '요청';

                // 이 출고요청의 각 제품 라인을 엑셀용 레코드로 변환
                return (lines || []).map((line) => {
                    const stockBase = line.stockQty ?? line.currentStock ?? 0;
                    const notReleased = (line.orderQty || 0) - (line.releaseQty || 0);

                    return {
                        // 🔹 출고 헤더 영역
                        releaseNo: h.releaseCode,
                        releaseDate: formatDate(h.releaseDate),
                        manager: h.registrantName || h.registrantCode || row.manager,
                        client: h.client || row.client,
                        status,

                        // 🔹 제품 상세 영역
                        productCode: line.productCode,
                        productName: line.productName,
                        typeName: typeMap.value[line.type] ?? line.type,
                        specName: specMap.value[line.spec] ?? line.spec,
                        unitName: unitMap.value[line.unit] ?? line.unit,
                        orderQty: line.orderQty || 0,
                        releaseQty: line.releaseQty || 0,
                        notReleasedQty: Math.max(0, notReleased),
                        stockAfter: Math.max(0, stockBase - (line.releaseQty || 0)),
                        dueDate: line.dueDate ? formatDate(line.dueDate) : ''
                    };
                });
            })
        );

        // 3) 평탄화(flat)
        const flat = allDetails.flat();

        if (!flat.length) {
            alert('엑셀로 내보낼 상세 데이터가 없습니다.');
            return;
        }

        // 4) 헤더 정의
        const headers = ['출고번호', '출고일자', '출고담당자', '거래처', '상태', '제품코드', '제품명', '유형', '규격', '단위', '주문수량', '출고수량', '미출고수량', '출고 후 재고', '납기일'];

        // 5) 실제 데이터 행
        const dataRows = flat.map((r) => [
            r.releaseNo || '',
            r.releaseDate || '',
            r.manager || '',
            r.client || '',
            r.status || '',
            r.productCode || '',
            r.productName || '',
            r.typeName || '',
            r.specName || '',
            r.unitName || '',
            r.orderQty,
            r.releaseQty,
            r.notReleasedQty,
            r.stockAfter,
            r.dueDate || ''
        ]);

        // 6) CSV 문자열 만들기 (엑셀에서 바로 열 수 있음)
        const escapeCell = (value) => {
            const s = value == null ? '' : String(value);
            if (s.includes('"') || s.includes(',') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };

        const csvContent = [headers, ...dataRows].map((row) => row.map(escapeCell).join(',')).join('\r\n');

        // 7) Blob 만들고 다운로드 트리거
        const blob = new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        a.href = url;
        a.download = `출고요청상세_${today}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('[ForwardingCheck] 엑셀 다운로드 실패:', err);
        alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
};

/* ===========================
 *  출고번호 모달 (출고요청 목록)
 * =========================== */

const showReleaseModal = ref(false);
const releaseKeyword = ref('');
const releaseRows = ref([]);

const releaseColumns = [
    { field: 'releaseCode', label: '출고번호' },
    { field: 'releaseDate', label: '출고일자' },
    { field: 'orderCode', label: '주문번호' },
    { field: 'client', label: '거래처' },
    { field: 'orderQty', label: '주문수량' },
    { field: 'totalQty', label: '총 출고수량' },
    { field: 'status', label: '상태' }
];

const formatDate = (d) => {
    if (!d) return '';
    return String(d).split('T')[0];
};

const fetchReleaseList = async (keyword = '') => {
    try {
        const res = await axios.get('/api/release/fwd/all', {
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
 * =========================== */

const showProductModal = ref(false);
const productKeyword = ref('');
const productRows = ref([]);

const productColumns = [
    { field: 'productCode', label: '제품코드' },
    { field: 'productName', label: '제품명' },
    { field: 'productTypeName', label: '제품유형' }
];

const fetchProductList = async (keyword = '') => {
    try {
        const res = await axios.get('/api/release/fwd/products', {
            params: { keyword }
        });
        console.log('[ForwardingCheck] 제품 목록 응답:', res.data);

        const raw = res.data?.data;
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

        // 공통코드 맵을 사용해서 한글명 필드 추가
        productRows.value = list.map((r) => ({
            ...r,
            // productType(코드) -> typeMap[코드] (한글 note)
            productTypeName: typeMap.value[r.productType] ?? r.productType
        }));
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
    searchForm.productCode = row.productCode;
    showProductModal.value = false;
};

const handleCancelProduct = () => {
    showProductModal.value = false;
};

/* ===========================
 *  거래처 모달
 * =========================== */

const showClientModal = ref(false);
const clientKeyword = ref('');
const clientRows = ref([]);

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

// 공통 코드 조회
const fetchCommonCodes = async () => {
    try {
        const res = await axios.get('/api/release/fwd/codes');
        console.log('[ForwardingCheck] 공통코드 응답:', res.data);

        if (res.data?.status === 'success' && res.data.data) {
            const { unitMap: u, specMap: s, typeMap: t } = res.data.data;
            typeMap.value = t || {};
            unitMap.value = u || {};
            specMap.value = s || {};
        } else {
            typeMap.value = {};
            unitMap.value = {};
            specMap.value = {};
        }
    } catch (err) {
        console.error('[ForwardingCheck] 공통코드 조회 실패:', err);
        typeMap.value = {};
        unitMap.value = {};
        specMap.value = {};
    }
};

// 📅 날짜 인풋 클릭 시 바로 달력 열기
const openDatePicker = (event) => {
    const input = event.target;
    if (input && typeof input.showPicker === 'function') {
        input.showPicker();
    } else {
        input.focus();
    }
};

onMounted(() => {
    fetchCommonCodes();
    doSearch();
});
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
        <!-- ✅ form 으로 변경 + submit 으로 조회 -->
        <form class="search-card" @submit.prevent="doSearch">
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
                        <input v-model="searchForm.dateFrom" type="date" class="input" @click="openDatePicker" />
                        <span class="range-dash">~</span>
                        <input v-model="searchForm.dateTo" type="date" class="input" @click="openDatePicker" />
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
                <button type="button" class="btn btn-black" @click="resetForm">초기화</button>
                <button type="submit" class="btn btn-yellow">조회</button>
            </div>
        </form>

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
                        <tr v-if="!groupedFilteredRows.length">
                            <td colspan="8" class="empty">검색 결과가 없습니다.</td>
                        </tr>

                        <tr
                            v-for="row in groupedFilteredRows"
                            :key="row.releaseNo"
                            class="clickable-row"
                            @click="
                                $router.push({
                                    name: 'ForwardingDetail',
                                    params: { releaseCode: row.releaseNo }
                                })
                            "
                        >
                            <td>
                                <input type="checkbox" v-model="checkedMap[row.releaseNo]" @click.stop />
                            </td>
                            <td>{{ row.releaseNo }}</td>
                            <td>{{ row.displayProductName }}</td>
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
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    flex: 1;
    min-height: 0;
}

/* 🔍 검색 카드 */
.search-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1.25rem 1.5rem 1rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    margin-bottom: 1.25rem;
    flex-shrink: 0;
}

.search-card h3 {
    margin: 0 0 0.8rem;
    font-size: 16px;
    font-weight: 600;
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem 1.25rem;
}

.field {
    display: flex;
    flex-direction: column;
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

/* 🔹 인풋 – 모달/ForwardingManagement 와 맞춤 */
.input {
    border: 1px solid #d0d7e2;
    border-radius: 4px;
    padding: 10px; /* ✅ 10px 통일 */
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
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
    font-size: 12px;
    color: #666;
}

.search-actions {
    margin-top: 0.8rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

/* 🔹 버튼 – SearchSelectModal / ForwardingManagement 와 맞춤 */
.btn {
    border: none;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
}

.btn-black {
    background: #000;
    color: white;
}

.btn-yellow {
    background: #ffc94a;
    color: #000;
}

.btn-excel {
    padding: 8px 18px;
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

    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 14px;
}

.result-count {
    font-weight: 600;
}

/* 📌 테이블 래퍼 – 여기만 스크롤 */
.table-wrap {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
}

/* 🔹 테이블 – SearchSelectModal 테이블 스타일과 맞추기 */
.result-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.result-table thead {
    background: #f9f9fb;
    position: sticky;
    top: 0;
    z-index: 10;
}

.result-table th,
.result-table td {
    padding: 10px; /* ✅ 모달 테이블과 동일 패딩 */
    border: 1px solid #e0e4f0;
}

.result-table th {
    text-align: left;
    font-weight: 600;
}

/* 기본 값은 중앙 정렬 */
.result-table th,
.result-table td {
    text-align: center;
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
    width: 130px;
}

/* 행 클릭 가능 표시 */
.clickable-row {
    cursor: pointer;
}

.clickable-row:hover {
    background: #f5f7ff;
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
