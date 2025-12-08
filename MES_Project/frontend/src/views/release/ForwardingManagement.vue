<!-- src/views/release/ForwardingManagement.vue -->
<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';
import axios from 'axios';

// 공통 코드 맵
const unitMap = ref({});
const specMap = ref({});
const typeMap = ref({});

// 🔹 등록자(직원) 목록
const employees = ref([]);

// 모달들
const showOrderModal = ref(false);
const showReleaseModal = ref(false); // 출고 모달
const showEmpModal = ref(false); // 직원 선택 모달

// 직원 검색 키워드
const empKeyword = ref('');

const formatDate = (d) => {
    if (!d) return '';
    // Date 객체든 문자열이든 "2025-06-24T..." 형태를 잘라서 날짜만
    return String(d).split('T')[0];
};

/* ===========================
 *  주문 모달 (검색용)
 * =========================== */

// 🔹 주문 검색 모달 컬럼
const orderColumns = [
    { field: 'orderNo', label: '주문번호' },
    { field: 'orderDate', label: '주문일자' },
    { field: 'orderName', label: '주문명' },
    { field: 'client', label: '거래처' },
    { field: 'remainingQty', label: '미출고수량' }
];

// 백엔드에서 채워질 주문 리스트
const orderRows = ref([]);
const orderKeyword = ref('');

// 주문 목록 조회 API
const fetchOrderList = async (keyword = '') => {
    const res = await axios.get('/api/release/fwd/orders', {
        params: { keyword }
    });

    console.log('[Forwarding] 주문 목록 응답:', res.data);

    const raw = res.data?.data;

    if (!raw) {
        orderRows.value = [];
    } else if (Array.isArray(raw)) {
        orderRows.value = raw;
    } else {
        orderRows.value = [raw];
    }
};

// 주문 모달 열기
const openOrderModal = () => {
    fetchOrderList(); // 초기 목록
    showOrderModal.value = true;
};

// 주문 검색
const handleSearchOrder = (keyword) => {
    orderKeyword.value = keyword;
    fetchOrderList(keyword);
};

/* ===========================
 *  출고 모달 (검색용)
 * =========================== */

// 🔹 출고 검색 모달 컬럼 (헤더 중심)
const releaseColumns = [
    { field: 'releaseCode', label: '출고번호' },
    { field: 'releaseDate', label: '출고일자' },
    { field: 'orderCode', label: '주문번호' },
    { field: 'client', label: '거래처' },
    { field: 'status', label: '상태' },
    { field: 'totalQty', label: '총 출고수량' }
];

// 백엔드에서 채워질 출고 리스트
const releaseRows = ref([]);
const releaseKeyword = ref('');

// 오늘 날짜 (YYYY-MM-DD) 포맷
const getToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// 출고 목록 조회 API
const fetchReleaseList = async (keyword = '') => {
    try {
        const res = await axios.get('/api/release/fwd', {
            params: { keyword }
        });

        console.log('[Forwarding] 출고 목록 조회 응답:', res.data);

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
        console.error('[Forwarding] 출고 목록 조회 실패:', err);
        releaseRows.value = [];
    }
};

// 출고 모달 열기
const openReleaseModal = () => {
    fetchReleaseList('');
    showReleaseModal.value = true;
};

// 출고 검색
const handleSearchRelease = (keyword) => {
    releaseKeyword.value = keyword;
    fetchReleaseList(keyword);
};

/* ===========================
 *  기본 정보 + 제품 리스트
 * =========================== */

// 🔹 기본정보
const basicInfo = reactive({
    releaseCode: '',
    orderCode: '',
    releaseDate: getToday(),
    orderDate: '',
    client: '',
    registrant: '', // 사원코드(emp_code)
    remark: ''
});

// 🔹 담당자(등록자) 표시용 computed (코드 -> 이름)
const registrantName = computed(() => {
    if (!basicInfo.registrant) return '';
    const emp = employees.value.find((e) => e.empCode === basicInfo.registrant);
    return emp?.empName || basicInfo.registrant;
});

// 제품 리스트 (주문/출고 선택 시 API 결과로 채움)
const products = ref([]);

/**
 * 주문 상세 조회 API
 * GET /api/release/fwd/orders/:orderNo
 * 응답: { status: 'success', data: { header, items } }
 */
const fetchOrderDetail = async (orderNo) => {
    if (!orderNo) return;

    try {
        const res = await axios.get(`/api/release/fwd/orders/${orderNo}`);

        if (res.data?.status !== 'success' || !res.data.data) {
            console.warn('[Forwarding] 주문 상세 없음');
            return;
        }

        const { header, items } = res.data.data;
        console.log('[Forwarding] 주문 상세 응답:', header, items);

        // 헤더 정보 채우기 (alias 기준)
        basicInfo.orderCode = header.orderNo;
        basicInfo.orderDate = formatDate(header.orderDate);
        basicInfo.client = header.client;

        // 제품 리스트 세팅
        products.value = (items || []).map((item) => ({
            productCode: item.productCode,
            name: item.productName,
            type: item.type,
            spec: item.spec,
            unit: item.unit,
            orderQty: item.orderQty,
            // 처음 출고수량은 0으로
            releaseQty: 0,
            stockQty: item.stockQty ?? item.currentStock ?? 0,
            dueDate: item.dueDate ? formatDate(item.dueDate) : '',
            notReleasedQty: item.notReleasedQty ?? null
        }));
    } catch (err) {
        console.error('[Forwarding] 주문 상세 조회 실패:', err);
    }
};

/**
 * 출고 상세 조회 API
 * GET /api/release/fwd/:releaseCode
 * 응답: { status: 'success', data: { header, lines } }
 */
const fetchReleaseDetail = async (releaseCode) => {
    if (!releaseCode) return;

    try {
        const res = await axios.get(`/api/release/fwd/${releaseCode}`);

        if (res.data?.status !== 'success' || !res.data.data) {
            console.warn('[Forwarding] 출고 상세 없음');
            return;
        }

        const { header, lines } = res.data.data;
        console.log('[Forwarding] 출고 상세 응답:', header, lines);

        // 헤더 정보 세팅
        basicInfo.releaseCode = header.releaseCode;
        basicInfo.releaseDate = formatDate(header.releaseDate);
        basicInfo.orderCode = header.orderCode;
        basicInfo.orderDate = header.orderDate ? formatDate(header.orderDate) : '';
        basicInfo.client = header.client;
        basicInfo.remark = header.remark ?? '';

        // 담당자 코드 세팅 (화면에는 registrantName으로 이름 표시됨)
        basicInfo.registrant = header.registrantCode || '';

        // 라인 정보 세팅
        products.value = (lines || []).map((item) => ({
            productCode: item.productCode,
            name: item.productName,
            type: item.type,
            spec: item.spec,
            unit: item.unit,
            orderQty: item.orderQty,
            releaseQty: item.releaseQty,
            stockQty: item.stockQty ?? item.currentStock ?? 0,
            dueDate: item.dueDate ? formatDate(item.dueDate) : ''
        }));
    } catch (err) {
        console.error('[Forwarding] 출고 상세 조회 실패:', err);
    }
};

// 🔹 등록자(직원) 목록 조회
const fetchEmployees = async () => {
    try {
        const res = await axios.get('/api/release/fwd/employees');
        console.log('[Forwarding] 직원 목록 응답:', res.data);

        if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
            employees.value = res.data.data; // [{ empCode, empName }, ...]
        } else {
            employees.value = [];
        }
    } catch (err) {
        console.error('[Forwarding] 직원 목록 조회 실패:', err);
        employees.value = [];
    }
};

/* ===========================
 *  직원 모달 관련
 * =========================== */

// 직원 리스트 + 검색어로 필터링
const employeeRows = computed(() => {
    if (!empKeyword.value) return employees.value;
    const kw = empKeyword.value.toLowerCase();
    return employees.value.filter((e) => (e.empCode && e.empCode.toLowerCase().includes(kw)) || (e.empName && e.empName.toLowerCase().includes(kw)));
});

// 직원 모달 컬럼
const empColumns = [
    { field: 'empCode', label: '사원코드' },
    { field: 'empName', label: '이름' }
];

// 직원 모달 열기
const openEmpModal = () => {
    if (!employees.value.length) {
        fetchEmployees();
    }
    showEmpModal.value = true;
};

// 직원 검색
const handleSearchEmp = (keyword) => {
    empKeyword.value = (keyword || '').trim();
};

// 직원 선택 확인
const handleConfirmEmp = (row) => {
    if (!row) return;
    basicInfo.registrant = row.empCode; // 내부 값은 사원코드 유지
    showEmpModal.value = false;
};

// 직원 모달 취소
const handleCancelEmp = () => {
    showEmpModal.value = false;
};

// 페이지 진입 시 직원 목록 + 공통코드 먼저 가져오기
onMounted(() => {
    fetchEmployees();
    fetchCommonCodes();
});

/* ===========================
 *  모달 Confirm / Cancel
 * =========================== */

// 주문 선택 시
const handleConfirmOrder = async (row) => {
    if (!row) return;

    console.log('[Forwarding] 주문 선택:', row);

    // 일단 기본 정보 세팅 (목록 값 기준)
    basicInfo.orderCode = row.orderNo;
    basicInfo.orderDate = row.orderDate;
    basicInfo.client = row.client;

    onReset();

    // 실제 주문 상세 가져와서 제품 리스트 세팅
    await fetchOrderDetail(row.orderNo);

    // 주문 모달 닫기
    showOrderModal.value = false;
};

// 출고 선택 시 (기존 출고 불러오기)
const handleConfirmRelease = async (row) => {
    if (!row) return;

    console.log('[Forwarding] 출고 선택:', row);

    // 기본정보에 최소 값 셋팅
    basicInfo.releaseCode = row.releaseCode;
    basicInfo.releaseDate = row.releaseDate;
    basicInfo.orderCode = row.orderCode;
    basicInfo.client = row.client;

    onReset();

    // 실제 출고 상세 가져와서 화면 복원
    await fetchReleaseDetail(row.releaseCode);

    // 출고 모달 닫기
    showReleaseModal.value = false;
};

const handleCancelOrder = () => {
    console.log('주문 선택 모달 취소');
    showOrderModal.value = false;
};

const handleCancelRelease = () => {
    console.log('출고 선택 모달 취소');
    showReleaseModal.value = false;
};

/* ===========================
 *  출고 수량 보정 + 버튼 액션
 * =========================== */

// 출고수량 보정 (음수/과다 방지)
const clampReleaseQty = (item) => {
    let qty = Number(item.releaseQty);

    // 숫자 아니거나 음수면 0으로
    if (isNaN(qty) || qty < 0) {
        qty = 0;
    }

    // 이 라인에서 출고할 수 있는 최대 수량
    const max = maxReleaseQty(item);

    if (qty > max) {
        qty = max;
    }

    item.releaseQty = qty;
};

// "출고 전 재고" 기준 가져오기
const getBaseStock = (item) => {
    const stock = item.baseStockQty ?? item.stockQty ?? 0;
    return Number(stock) || 0;
};

// 이 라인에서 최대로 출고할 수 있는 수량(미출고, 재고 둘 다 고려)
const maxReleaseQty = (item) => {
    const notReleasedBase = item.notReleasedQty ?? item.orderQty ?? 0; // 주문/미출고 기준
    const stockBase = getBaseStock(item); // 재고 기준

    // 둘 중 더 작은 값이 "출고 가능 최대 수량"
    return Math.max(0, Math.min(notReleasedBase, stockBase));
};

const onDelete = async () => {
    console.log('삭제 클릭');

    if (!basicInfo.releaseCode) {
        console.warn('삭제할 출고코드가 없습니다.');
        return;
    }

    if (!confirm('현재 출고요청을 삭제하시겠습니다?')) {
        return;
    }

    try {
        const res = await axios.delete(`/api/release/fwd/${basicInfo.releaseCode}`);
        console.log('[Forwarding] 삭제 결과:', res.data);
        alert('출고요청이 삭제되었습니다.');
        onReset();
    } catch (err) {
        console.error('[Forwarding] 삭제 실패:', err);
        alert('출고요청 삭제 중 오류가 발생했습니다.');
    }
};

const onReset = () => {
    basicInfo.releaseCode = '';
    basicInfo.orderCode = '';
    basicInfo.releaseDate = getToday();
    basicInfo.orderDate = '';
    basicInfo.client = '';
    // basicInfo.registrant 는 유지 (담당자는 계속 동일하게 쓸 수 있게)
    basicInfo.remark = '';
    products.value = [];
    console.log('초기화 클릭');
};

const onSave = async () => {
    // 필수값 체크
    if (!basicInfo.orderCode) {
        alert('주문을 선택해주세요.');
        return;
    }

    if (!basicInfo.releaseDate) {
        alert('출고일자를 입력해주세요.');
        return;
    }

    if (!basicInfo.orderDate) {
        alert('주문일자를 확인해주세요.');
        return;
    }

    if (!basicInfo.client) {
        alert('거래처 정보가 없습니다.');
        return;
    }

    if (!basicInfo.registrant) {
        alert('등록자를 선택해주세요.');
        return;
    }

    // 🔹 주문을 선택했는데 products 비어있으면 비정상
    if (!products.value.length) {
        alert('제품 정보가 없습니다. 주문을 다시 선택해주세요.');
        return;
    }

    // 🔹 출고수량이 모두 0이면 저장할 수 없게
    const totalRelease = products.value.reduce((sum, item) => sum + (item.releaseQty || 0), 0);
    if (totalRelease <= 0) {
        alert('출고수량을 입력해주세요.');
        return;
    }

    const payload = {
        header: { ...basicInfo },
        lines: products.value
    };

    try {
        if (!basicInfo.releaseCode) {
            // 신규: 출고요청 등록
            const res = await axios.post('/api/release/fwd', payload);
            console.log('[Forwarding] 저장 결과:', res.data);
            alert('출고요청이 등록되었습니다.');
            onReset();
        } else {
            const res = await axios.put(`/api/release/fwd/${basicInfo.releaseCode}`, payload);
            console.log('[Forwarding] 수정 결과:', res.data);
            alert('출고요청이 수정되었습니다.');
            onReset();
        }
    } catch (err) {
        console.error('[Forwarding] 저장 실패:', err);
    }
};

// 공통 코드 조회
const fetchCommonCodes = async () => {
    try {
        const res = await axios.get('/api/release/fwd/codes');
        console.log('[Forwarding] 공통코드 응답:', res.data);

        if (res.data?.status === 'success' && res.data.data) {
            const { unitMap: u, specMap: s, typeMap: t } = res.data.data;
            console.log('[Forwarding] unitMap:', u);
            console.log('[Forwarding] specMap:', s);
            console.log('[Forwarding] typeMap:', t);
            unitMap.value = u || {};
            specMap.value = s || {};
            typeMap.value = t || {};
        } else {
            unitMap.value = {};
            specMap.value = {};
            typeMap.value = {};
        }
    } catch (err) {
        console.error('[Forwarding] 공통코드 조회 실패:', err);
        unitMap.value = {};
        specMap.value = {};
        typeMap.value = {};
    }
};
</script>

<template>
    <div class="forward-page">
        <!-- 기본정보 영역 -->
        <section class="forward-card">
            <div class="section-header">
                <h3 class="section-title">출고 기본정보</h3>

                <div class="forward-actions">
                    <button class="btn btn-red" @click="onDelete">삭제</button>
                    <button class="btn btn-black" @click="onReset">초기화</button>
                    <button class="btn btn-blue" @click="onSave">저장</button>
                    <button class="btn btn-outline-green" @click="openOrderModal">주문정보 불러오기</button>
                    <button class="btn btn-outline-green" @click="openReleaseModal">출고정보 불러오기</button>
                </div>
            </div>

            <!-- 주문 정보 모달 -->
            <SearchSelectModal
                v-model="showOrderModal"
                :columns="orderColumns"
                :rows="orderRows"
                row-key="orderNo"
                search-placeholder="주문번호 / 주문명 / 거래처를 입력해주세요."
                @search="handleSearchOrder"
                @confirm="handleConfirmOrder"
                @cancel="handleCancelOrder"
            />

            <!-- 출고 정보 모달 -->
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

            <!-- 직원 선택 모달 -->
            <SearchSelectModal v-model="showEmpModal" :columns="empColumns" :rows="employeeRows" row-key="empCode" search-placeholder="사원코드 / 이름을 입력해주세요." @search="handleSearchEmp" @confirm="handleConfirmEmp" @cancel="handleCancelEmp" />

            <div class="form-grid">
                <!-- 출고코드 -->
                <div class="form-field col-2">
                    <label class="form-label">출고코드</label>
                    <input v-model="basicInfo.releaseCode" type="text" class="form-input" placeholder="출고코드(자동생성)" disabled />
                </div>

                <!-- 주문코드 -->
                <div class="form-field col-2">
                    <label class="form-label">주문코드</label>
                    <input v-model="basicInfo.orderCode" type="text" class="form-input" placeholder="주문코드" disabled />
                </div>

                <!-- 출고요청일 -->
                <div class="form-field col-2">
                    <label class="form-label">출고요청일</label>
                    <input v-model="basicInfo.releaseDate" type="date" class="form-input" disabled />
                </div>

                <!-- 주문일자 -->
                <div class="form-field col-2">
                    <label class="form-label">주문일자</label>
                    <input v-model="basicInfo.orderDate" type="date" class="form-input" disabled />
                </div>

                <!-- 거래처 -->
                <div class="form-field col-2">
                    <label class="form-label">거래처</label>
                    <input v-model="basicInfo.client" type="text" class="form-input" placeholder="거래처" disabled />
                </div>

                <!-- 등록자 (인풋 + 모달 오픈) -->
                <div class="form-field col-2">
                    <label class="form-label">등록자</label>
                    <input type="text" class="form-input clickable-input" :value="registrantName" placeholder="등록자를 선택하세요" readonly @click="openEmpModal" />
                </div>

                <!-- 비고 (전체 폭) -->
                <div class="form-field col-4">
                    <label class="form-label">비고</label>
                    <textarea v-model="basicInfo.remark" class="form-textarea" rows="3" placeholder="특이사항 입력"></textarea>
                </div>
            </div>
        </section>

        <!-- 제품 영역 (여기만 스크롤) -->
        <section class="forward-card forward-card-products">
            <h3 class="section-title">제품</h3>

            <div class="table-wrap">
                <table class="forward-table">
                    <thead>
                        <tr>
                            <th>제품명</th>
                            <th>유형</th>
                            <th>규격</th>
                            <th>단위</th>
                            <th>주문수량</th>
                            <th>출고수량</th>
                            <th>미출고수량</th>
                            <th>현 재고</th>
                            <th>납기일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- 아직 데이터 없음 -->
                        <tr v-if="!products.length">
                            <td colspan="9" class="empty-row">주문을 선택하면 제품 목록이 표시됩니다.</td>
                        </tr>

                        <tr v-for="(item, idx) in products" :key="idx">
                            <td>{{ item.name }}</td>
                            <!-- 유형: 코드 -> 한글 note -->
                            <td>{{ typeMap[item.type] ?? item.type }}</td>

                            <!-- 규격 -->
                            <td>{{ specMap[item.spec] ?? item.spec }}</td>

                            <!-- 단위 -->
                            <td>{{ unitMap[item.unit] ?? item.unit }}</td>

                            <!-- 주문수량 -->
                            <td class="num">{{ item.orderQty }}</td>

                            <!-- 출고수량 입력 -->
                            <td class="num">
                                <input type="number" v-model.number="item.releaseQty" min="0" :max="maxReleaseQty(item)" :disabled="maxReleaseQty(item) === 0" class="qty-input" @blur="clampReleaseQty(item)" />
                            </td>

                            <!-- 미출고수량: 주문수량 - 출고수량 -->
                            <td class="num">
                                {{ Math.max(0, ((item.notReleasedQty ?? item.orderQty) || 0) - (item.releaseQty || 0)) }}
                            </td>

                            <!-- 현 재고 (출고 후 예상 재고) -->
                            <td class="num">
                                {{ Math.max(0, ((item.baseStockQty ?? item.stockQty) || 0) - (item.releaseQty || 0)) }}
                            </td>

                            <!-- 납기일 -->
                            <td>{{ item.dueDate }}</td>
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

/* 페이지 전체: 세로 flex + 전체 스크롤 막기 */
.forward-page {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.forward-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.forward-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.forward-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

/* 버튼 – 모달 버튼이랑 사이즈 맞춤 */
.btn {
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
}

.btn-red {
    background: #ff6b6b;
    color: white;
}

.btn-black {
    background: #000;
    color: white;
}

.btn-blue {
    background: #4ea3ff;
    color: white;
}

.btn-outline-green {
    background: #4ecb79;
    color: white;
}

.forward-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1.25rem 1.5rem 1.5rem;
    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.06);
    margin-bottom: 1.5rem;
}

/* 제품 카드: 남는 높이 채우고 내부에서만 스크롤 */
.forward-card-products {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 1rem;
    display: inline-block;
}

/* 폼 영역 – 인풋도 모달이랑 느낌 맞춤 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem 1.5rem;
}

.form-field {
    display: flex;
    flex-direction: column;
}

.form-field.col-2 {
    grid-column: span 2;
}

.form-field.col-4 {
    grid-column: span 4;
}

.form-label {
    margin-bottom: 0.2rem;
    color: #555;
}

.form-input,
.form-textarea {
    border: 1px solid #d0d7e2;
    border-radius: 4px;
    padding: 10px; /* 🔹 모달 검색 인풋과 동일 */
    font-size: 14px;
    outline: none;
}

.form-input:focus,
.form-textarea:focus {
    border-color: #1976d2;
}

/* 클릭 가능한 input (등록자) */
.clickable-input {
    cursor: pointer;
    background-color: #fff;
}

.clickable-input:read-only {
    background-color: #fff;
}

/* 기본 테이블 래퍼 */
.table-wrap {
    width: 100%;
    overflow-x: auto;
}

/* 제품 테이블만 세로 스크롤 */
.forward-card-products .table-wrap {
    flex: 1;
    overflow-y: auto;
}

/* 🔹 테이블 스타일 – SearchSelectModal 테이블과 최대한 통일 */
.forward-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px; /* 모달 테이블과 동일 */
}

.forward-table thead {
    background: #f4f6fb;
}

.forward-table th,
.forward-table td {
    padding: 10px; /* 모달 테이블과 동일 */
    border: 1px solid #e0e4f0;
    text-align: left;
}

.forward-table th {
    font-weight: 600;
}

.forward-table .num {
    text-align: right;
}

.empty-row {
    text-align: center;
    color: #888;
}

/* 출고수량 입력 – 테이블 셀 크기에 맞게 */
.qty-input {
    width: 80px;
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    text-align: right;
    font-size: 13px;
}

.qty-input:focus {
    outline: none;
    border-color: #1976d2;
}

/* 기본 값은 중앙 정렬 */
.result-table th,
.result-table td,
.forward-table th,
.forward-table td {
    text-align: center;
}

/* 숫자 전용 클래스는 오른쪽 */
.num,
.text-right {
    text-align: right !important;
}

/* 반응형 - 좁은 화면에서 여백/레이아웃 조정 */
@media (max-width: 960px) {
    .forward-page {
        padding: 1rem;
    }

    .form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .form-field.col-4 {
        grid-column: span 2;
    }

    .forward-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .forward-actions {
        flex-wrap: wrap;
    }
}
</style>
