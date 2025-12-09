<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import SearchSelectModal from '@/views/order/SearchSelectModal.vue';

// 모달 ON/OFF
const showOrderModal = ref(false);
const showProductModal = ref(false);
const showClientModal = ref(false);
const showManagerModal = ref(false);

// 모달 검색 결과
const orderSearchList = ref([]);
const productSearchList = ref([]);
const clientSearchList = ref([]);
const managerSearchList = ref([]);

const currentProductIndex = ref(-1);

// 날짜 포맷 함수 0000.00.00
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
}

// 모달 검색 이벤트
const fetchOrderSearch = async (keyword = '') => {
    try {
        const res = await axios.get('/api/order/search', { params: { keyword } });
        if (res.data && res.data.code === 'S200') {
            const fullList = (res.data.data || []).map((row) => ({
                ...row,
                ord_date: formatDate(row.ord_date) // ← 여기서 포맷 변경!
            }));

            if (keyword && fullList.length) {
                orderSearchList.value = fullList.filter((row) => row.ord_code?.includes(keyword) || row.ord_name?.includes(keyword) || row.client_name?.includes(keyword));
            } else {
                orderSearchList.value = fullList;
            }
        }
    } catch (e) {
        console.error('fetchOrderSearch', e);
    }
};

// 거래처 검색
const fetchClientSearch = async (keyword = '') => {
    try {
        const res = await axios.get('/api/order/client/search', { params: { keyword } });
        clientSearchList.value = res.data.code === 'S200' ? res.data.data : [];
    } catch (e) {
        console.error('fetchClientSearch', e);
        clientSearchList.value = [];
    }
};

// 담당자 검색
const fetchManagerSearch = async (keyword = '') => {
    try {
        const res = await axios.get('/api/order/manager/search', { params: { keyword } });
        managerSearchList.value = res.data.code === 'S200' ? res.data.data : [];
    } catch (e) {
        console.error('fetchManagerSearch', e);
        managerSearchList.value = [];
    }
};

// 거래처 선택 이벤트
const onClientSelect = (row) => {
    if (!row || !row.client_code) return;

    order.client_code = row.client_code;
    order.client_name = row.client_name;

    showClientModal.value = false;
};

// 담당자 선택
const onManagerSelect = (row) => {
    if (!row || !row.emp_code) return;

    order.mcode = row.emp_code;
    order.client_contact = row.emp_name;

    showManagerModal.value = false;
};

const fetchProductSearch = async (keyword = '') => {
    try {
        // 엔드포인트 수정: /api/order/product/search
        const res = await axios.get('/api/order/product/search', { params: { keyword } });
        if (res.data && res.data.code === 'S200') {
            // API 결과에서 필요한 필드를 직접 사용하고 저장합니다.
            // unit, spec 등의 상세 정보를 선택 시 바로 반영하기 위해 전체 객체를 저장합니다.
            productSearchList.value = (res.data.data || []).map((p) => ({
                prod_code: p.prod_code,
                prod_name: p.prod_name,

                // 코드값 (DB 저장용)
                unit: p.unit,
                spec: p.spec,
                com_value: p.com_value,

                // 화면 표시용
                unit_name: p.unit_name, // 상세 테이블에 반영
                spec_name: p.spec_name, // 상세 테이블에 반영
                com_value_name: p.com_value_name // 모달 컬럼에 필요
            }));
        } else {
            productSearchList.value = [];
        }
    } catch (e) {
        console.error('fetchProductSearch', e);
        productSearchList.value = [];
    }
};

const onProductSelect = (row) => {
    const idx = currentProductIndex.value;
    if (idx === -1 || !row || !row.prod_code) return;

    const p = products.value[idx];

    p.prod_code = row.prod_code || '';
    p.prod_name = row.prod_name || '';

    // DB에 들어갈 코드값
    p.unit = row.unit || '';
    p.spec = row.spec || '';
    p.type = row.com_value || '';

    // 화면 표시용 이름 저장하고 싶으면 별도 필드
    p.unit_name = row.unit_name; // 화면에는 "ea" 표시
    p.spec_name = row.spec_name;
    p.type_name = row.com_value_name;

    // 선택 상태 초기화
    p._selected = false;

    // 모달 닫기 및 인덱스 초기화
    showProductModal.value = false;
    currentProductIndex.value = -1;
};

// 주문 기본 정보
const order = reactive({
    ord_code: '',
    ord_name: '',
    ord_date: new Date().toISOString().slice(0, 10),
    client_name: '',
    client_code: '',
    client_contact: '',
    mcode: '',
    note: '',
    readonly: false
});

const clientList = ref([]);
const managerList = ref([]);

// 모달에서 선택한 결과 받기
const onOrderSelect = async (row) => {
    if (!row || !row.ord_code) return;

    // 주문 기본 정보
    order.ord_code = row.ord_code || '';
    order.ord_name = row.ord_name || '';

    order.client_code = row.client_code || '';
    order.client_name = row.client_name || '';

    order.note = row.note || '';
    order.readonly = true;

    order.client_contact = row.emp_name || '';
    order.mcode = row.mcode || '';

    // 제품 정보
    try {
        const res = await axios.get('/api/order/production', { params: { ord_code: row.ord_code } });

        if (res.data && res.data.code === 'S200') {
            const selectedOrderProducts = res.data.data || [];
            let nextId = 1; // 제품 ID 초기화

            products.value = selectedOrderProducts.map((p) => ({
                id: nextId++,
                prod_name: p.prod_name || '',
                type: p.com_value || '',
                type_name: p.com_value_name || '',
                spec: p.spec || '',
                spec_name: p.spec_name || '',
                unit: p.unit || '',
                unit_name: p.unit_name || '',
                ord_amount: p.ord_amount || 0,
                prod_price: p.prod_price || 0,
                delivery_date: p.delivery_date ? p.delivery_date.slice(0, 10) : '',
                ord_priority: p.ord_priority || '',
                total_price: p.total_price || 0,
                prod_code: p.prod_code || '', // 제품 저장을 위해 필요
                ord_d_code: p.ord_d_code || '', // 상세 수정을 위해 필요
                _selected: false,
                get total() {
                    return (Number(this.ord_amount) || 0) * (Number(this.prod_price) || 0);
                }
            }));

            // 제품이 없는 경우 빈 행 추가
            if (products.value.length === 0) {
                products.value.push(createEmptyProduct(nextId));
            }
        } else {
            // API 호출은 성공했으나 데이터가 없는 경우 (예: 주문은 있으나 제품 정보가 없을 때)
            products.value = [createEmptyProduct(nextProductId++)];
            console.warn('주문 제품 정보가 없습니다.', row.ord_code);
        }
    } catch (e) {
        console.error('fetchOrderProduction failed', e);
        alert('주문 제품 정보를 불러오는데 실패했습니다.');
        products.value = [createEmptyProduct(nextProductId++)]; // 에러 시 빈 행으로 초기화
    }
};

// 제품 목록: 기본 4행
const products = ref([createEmptyProduct(1), createEmptyProduct(2), createEmptyProduct(3), createEmptyProduct(4)]);
let nextProductId = 5;

function createEmptyProduct(id) {
    return {
        id,
        prod_name: '',
        type: '',
        type_name: '',
        spec: '',
        spec_name: '',
        unit: '',
        unit_name: '',
        ord_amount: 0,
        prod_price: 0,
        delivery_date: '',
        ord_priority: '',
        total_price: 0,
        prod_code: '', // 제품 코드
        ord_d_code: '', // 주문 상세 코드
        _selected: false,
        get total() {
            return (Number(this.ord_amount) || 0) * (Number(this.prod_price) || 0);
        }
    };
}

const totalSum = computed(() => products.value.reduce((acc, p) => acc + Number(p.ord_amount || 0) * Number(p.prod_price || 0), 0));

// 초기 데이터
const fetchClientList = async () => {
    try {
        const res = await axios.get('/api/order/client/list');
        if (res.data && res.data.code === 'S200') clientList.value = res.data.data || [];
    } catch (e) {
        console.error('fetchClientList', e);
    }
};

const fetchManagerList = async () => {
    try {
        const res = await axios.get('/api/order/manager/list');
        if (res.data && res.data.code === 'S200') managerList.value = res.data.data || [];
    } catch (e) {
        console.error('fetchManagerList', e);
    }
};

watch(showOrderModal, (val) => {
    if (val) {
        fetchOrderSearch(''); // 빈 문자열 전달하면 전체 목록
        // 체크박스 초기화
        orderSearchList.value = orderSearchList.value.map((row) => ({ ...row, _selected: false }));
    }
});

onMounted(() => {
    fetchClientList();
    fetchManagerList();
});

// 제품 추가/삭제
function addProduct() {
    products.value.push(createEmptyProduct(nextProductId++));
}

const removedProductIds = ref([]);

function removeSelectedProducts() {
    // 삭제 대상 필터링
    const toRemove = products.value.filter((p) => p._selected && p.ord_d_code);
    // ord_d_code만 removedProductIds에 저장
    removedProductIds.value.push(...toRemove.map((p) => p.ord_d_code));
    // 화면에서 선택 제품 제거
    products.value = products.value.filter((p) => !p._selected);
    // 최소 1행 남기기
    if (products.value.length === 0) products.value.push(createEmptyProduct(nextProductId++));
}
function toggleSelectAll(ev) {
    const checked = ev.target.checked;
    products.value.forEach((p) => (p._selected = checked));
}

const allSelected = computed(() => products.value.length > 0 && products.value.every((p) => p._selected));

function recalcRow(idx) {
    const p = products.value[idx];
    p.ord_amount = Number(p.ord_amount) || 0;
    p.prod_price = Number(p.prod_price) || 0;
}

function resetForm() {
    order.ord_code = '';
    order.ord_name = '';
    order.client_name = '';
    order.client_code = '';
    order.client_contact = '';
    order.mcode = '';
    order.note = '';
    order.readonly = false;
    products.value = [createEmptyProduct(nextProductId++), createEmptyProduct(nextProductId++), createEmptyProduct(nextProductId++), createEmptyProduct(nextProductId++)];
}

// 거래처 모달 열기
function openClientSearch() {
    fetchClientSearch('').then(() => {
        // 모달 열기 전에 선택 상태 초기화
        clientSearchList.value = clientSearchList.value.map((row) => ({ ...row, _selected: false }));
        showClientModal.value = true;
    });
}

// 담당자 모달 열기
function openManagerSearch() {
    fetchManagerSearch('').then(() => {
        // 모달 열기 전에 선택 상태 초기화
        managerSearchList.value = managerSearchList.value.map((row) => ({ ...row, _selected: false }));
        showManagerModal.value = true;
    });
}

async function saveOrder() {
    try {
        // 백엔드 필수 값 검증 (프론트에서도 1차 검증)
        const missingOrderFields = [];
        if (!order.ord_name) missingOrderFields.push('주문명');
        if (!order.ord_date) missingOrderFields.push('주문일자');
        if (!order.client_code) missingOrderFields.push('거래처');
        if (!order.mcode) missingOrderFields.push('담당자');

        if (missingOrderFields.length > 0) {
            alert(`❌ 주문 기본 정보가 누락되었습니다.\n누락 항목: ${missingOrderFields.join(', ')}`);
            return;
        }

        // 입력된 제품만 필터링 (빈 행 제외)
        const filledProducts = products.value.filter((p) => p.prod_name || p.ord_amount || p.prod_price || p.delivery_date);

        // 최소 1개 제품 체크
        if (filledProducts.length === 0) {
            alert('❌ 최소 1개의 제품은 입력해야 합니다.');
            return;
        }

        // 필수 컬럼 체크
        for (const p of filledProducts) {
            const missingFields = [];
            if (!p.unit) missingFields.push('단위');
            if (!p.ord_amount) missingFields.push('수량');
            if (!p.prod_price) missingFields.push('단가');
            if (!p.delivery_date) missingFields.push('납기일');
            if (!p.prod_code) missingFields.push('제품 코드');

            if (missingFields.length > 0) {
                alert(`❌ 제품 "${p.prod_name || '(이름 없음)'}"의 필수 정보가 누락되었습니다.\n누락 항목: ${missingFields.join(', ')}`);
                return;
            }
        }

        // payload 구성
        const orderDetailList = filledProducts.map((p) => ({
            ord_d_code: p.ord_d_code,
            unit: p.unit,
            spec: p.spec,
            ord_amount: p.ord_amount,
            prod_price: p.prod_price,
            delivery_date: p.delivery_date,
            ord_priority: p.ord_priority || 0,
            total_price: p.total,
            prod_code: p.prod_code
        }));

        const payload = {
            order: {
                ord_code: order.ord_code,
                ord_name: order.ord_name,
                ord_date: order.ord_date,
                ord_stat: 'a1',
                note: order.note,
                mcode: order.mcode,
                client_code: order.client_code
            },
            orderDetailList, // 화면에 남은 제품
            removedProductIds: removedProductIds.value // 삭제된 제품 코드
        };

        console.log('저장 payload', payload);

        const res = await axios.post('/api/order', payload);

        if (res.data.code === 'S200') {
            alert('저장되었습니다.');
            resetForm();
        } else {
            alert('저장 실패');
        }
    } catch (err) {
        console.error('saveOrder failed', err);
        alert('주문 저장 중 오류가 발생했습니다. 콘솔을 확인하세요.');
    }
}

// 주문 삭제
async function deleteOrder() {
    const ord_code = order.ord_code;

    if (!ord_code) {
        alert('삭제할 주문번호가 없습니다.');
        return;
    }
    if (!confirm(`${ord_code} 주문을 삭제하시겠습니까?`)) return;

    try {
        const res = await axios.delete(`/api/order/${ord_code}`);

        if (res.data.code === 'S200') {
            alert(`삭제되었습니다.`);
            // 삭제 후 폼 초기화
            resetForm();
        } else {
            alert(`주문 삭제에 실패했습니다: ${res.data.message || '알 수 없는 오류'}`);
        }
    } catch (err) {
        console.error('deleteOrder failed', err);
        alert('주문 삭제 중 오류가 발생했습니다. 콘솔을 확인하세요.');
    }
}

function openProductSearch(idx) {
    // 1. 현재 선택된 행의 인덱스를 저장
    currentProductIndex.value = idx;

    // 1. 모달 열기 전에 검색 API 호출
    fetchProductSearch('').then(() => {
        // 모달 열기 전에 새로운 배열 생성
        const resetList = productSearchList.value.map((p) => ({ ...p, _selected: false }));
        productSearchList.value = resetList;

        // 모달 열기
        showProductModal.value = true;
    });
}

function formatCurrency(v) {
    const n = Number(v || 0);
    return n.toLocaleString('ko-KR') + ' 원';
}
</script>

<template>
    <div class="page-container">
        <section class="card main-card">
            <div class="card-header">
                <h3>주문기본정보</h3>
                <div class="actions">
                    <button type="button" class="btn danger" @click="deleteOrder">삭제</button>
                    <button type="button" class="btn ghost" @click="resetForm">초기화</button>
                    <button type="button" class="btn" @click="saveOrder">저장</button>
                    <button type="button" class="btn outline" @click="showOrderModal = true">주문정보 불러오기</button>
                </div>
            </div>

            <div class="form-grid">
                <div class="form-row">
                    <label>주문번호</label>
                    <input v-model="order.ord_code" type="text" :readonly="order.readonly" />

                    <label>주문명</label>
                    <input v-model="order.ord_name" type="text" />
                </div>

                <div class="form-row">
                    <label>주문일자</label>
                    <input v-model="order.ord_date" type="date" />

                    <label>거래처</label>
                    <div style="display: flex; gap: 6px; flex: 1">
                        <input type="text" v-model="order.client_name" @click="openClientSearch" readonly />
                    </div>
                </div>

                <div class="form-row">
                    <label>거래처담당자</label>
                    <div style="display: flex; gap: 6px; flex: 1">
                        <input type="text" v-model="order.client_contact" @click="openManagerSearch" readonly />
                    </div>

                    <label>비고</label>
                    <input v-model="order.note" type="text" />
                </div>
            </div>
        </section>

        <!-- 제품 테이블 -->
        <section class="card product-card">
            <div class="card-header small">
                <h4>제품</h4>
                <div class="product-actions">
                    <button class="btn small danger" @click="removeSelectedProducts">제품삭제</button>
                    <button class="btn small" @click="addProduct">제품추가</button>
                </div>
            </div>

            <table class="product-table">
                <thead>
                    <tr>
                        <th style="width: 10px"><input type="checkbox" @change="toggleSelectAll($event)" :checked="allSelected" /></th>
                        <th style="width: 40px">제품명</th>
                        <th style="width: 30px">유형</th>
                        <th style="width: 30px">규격</th>
                        <th style="width: 30px">단위</th>
                        <th style="width: 40px">수량</th>
                        <th style="width: 40px">단가</th>
                        <th style="width: 40px">납기일</th>
                        <th style="width: 40px">우선순위</th>
                        <th style="width: 40px">총액</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(p, idx) in products" :key="p.id">
                        <td class="center"><input type="checkbox" v-model="p._selected" /></td>
                        <td>
                            <div class="prod-name">
                                <input type="text" v-model="p.prod_name" @click="openProductSearch(idx)" readonly />
                                <button class="icon" @click="openProductSearch(idx)" title="제품 검색">🔍</button>
                            </div>
                        </td>
                        <td><input v-model="p.type_name" type="text" placeholder="분류명" readonly /></td>
                        <td><input v-model="p.spec_name" type="text" placeholder="규격" readonly /></td>
                        <td><input v-model="p.unit_name" type="text" placeholder="단위" readonly /></td>
                        <td class="num-cell">
                            <div class="num-wrap">
                                <input v-model.number="p.ord_amount" type="number" min="0" @input="recalcRow(idx)" />
                                <span>개</span>
                            </div>
                        </td>
                        <td class="num-cell">
                            <div class="num-wrap">
                                <input v-model.number="p.prod_price" type="number" min="0" @input="recalcRow(idx)" />
                                <span>원</span>
                            </div>
                        </td>
                        <td><input v-model="p.delivery_date" type="date" /></td>
                        <td>
                            <select v-model.number="p.ord_priority">
                                <option value=""></option>
                                <option v-for="n in 3" :key="n" :value="n - 1">{{ n - 1 }}</option>
                            </select>
                        </td>
                        <td class="left">{{ formatCurrency(p.total) }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="product-footer">
                <div class="total-label">전체 주문 총액</div>
                <div class="total-amount">
                    <span class="price">{{ Number(totalSum).toLocaleString() }}</span>
                    <span class="unit">원</span>
                </div>
            </div>
        </section>

        <!-- 주문 조회 모달 (SearchSelectModal 컴포넌트) -->
        <SearchSelectModal
            v-model="showOrderModal"
            searchPlaceholder="주문번호 또는 주문명 또는 거래처를 입력해주세요."
            :columns="[
                { field: 'ord_code', label: '주문번호' },
                { field: 'ord_name', label: '주문명' },
                { field: 'ord_date', label: '주문일자' },
                { field: 'client_name', label: '거래처' }
            ]"
            :rows="orderSearchList"
            rowKey="ord_code"
            @search="fetchOrderSearch"
            @confirm="onOrderSelect"
        />

        <SearchSelectModal
            v-model="showProductModal"
            searchPlaceholder="제품명 또는 제품코드를 입력해주세요."
            :columns="[
                { field: 'prod_code', label: '제품코드' },
                { field: 'prod_name', label: '제품명' },
                { field: 'com_value_name', label: '제품유형' }
            ]"
            :rows="productSearchList"
            rowKey="prod_code"
            @search="fetchProductSearch"
            @confirm="onProductSelect"
        />

        <!-- 거래처 선택 모달 -->
        <SearchSelectModal
            v-model="showClientModal"
            searchPlaceholder="거래처명 또는 거래처 코드를 입력해주세요."
            :columns="[
                { field: 'client_code', label: '거래처 코드' },
                { field: 'client_name', label: '거래처명' },
                { field: 'client_type_name', label: '거래처 유형' },
                { field: 'client_mname', label: '담당자' },
                { field: 'client_pnum', label: '전화번호' }
            ]"
            :rows="clientSearchList"
            rowKey="client_code"
            @search="fetchClientSearch"
            @confirm="onClientSelect"
        />

        <!-- 담당자 선택 모달 -->
        <SearchSelectModal
            v-model="showManagerModal"
            searchPlaceholder="담당자 이름 또는 담당자 코드를 입력해주세요."
            :columns="[
                { field: 'emp_code', label: '사원 코드' },
                { field: 'emp_name', label: '이름' },
                { field: 'emp_pnum', label: '전화번호' },
                { field: 'emp_email', label: '이메일' }
            ]"
            :rows="managerSearchList"
            rowKey="emp_code"
            @search="fetchManagerSearch"
            @confirm="onManagerSelect"
        />
    </div>
</template>

<style scoped>
.page-container {
    padding: 24px;
    max-width: 1650px; /* 테이블을 감쌀 수 있도록 확장 */
    margin: 0 auto;
    font-family: 'Pretendard', 'Inter', sans-serif;
    font-size: 15px;
}

/* 카드 공통 */
.card {
    background: #ffffff;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid #e6e6e6;
    margin-bottom: 20px;
    font-size: 15px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 15px;
}

.card-header.small {
    padding-bottom: 6px;
    border-bottom: 1px dashed #eee;
}

/* 버튼 */
.btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: 0.2s;
}

.btn.primary {
    background: #2d8cf0;
    color: white;
}

.btn.primary:hover {
    background: #1769c2;
}

.btn.danger {
    background: #ff4d4f;
    color: white;
}

.btn.danger:hover {
    background: #d9363e;
}

.btn.small {
    padding: 6px 8px;
    font-size: 14px;
}

.btn.ghost {
    background: #fff;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn.outline {
    background: #fff;
    color: #2563eb;
    border: 1px solid #c7ddff;
}

.btn-line {
    background: none;
    border: 1px solid #888;
    color: #555;
}

.btn-line:hover {
    background: #f0f0f0;
}

/* 기본 정보 폼 */
.form-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 15px;
}

.form-row {
    display: flex;
    gap: 14px;
    align-items: center;
}

.form-row label {
    width: 120px;
    font-weight: 600;
    color: #374151;
    font-size: 15px;
}

.form-row input[type='text'],
.form-row input[type='date'],
.form-row select {
    flex: 1;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    font-size: 15px;
}

/* ◆◆◆ 제품 테이블 영역 반영 — 1600px & 15px ◆◆◆ */

.product-card {
    max-width: 100%;
    overflow-x: auto; /* ← 가로 스크롤 활성화 */
}

/* 테이블 크기 1600px 고정 */
.product-table {
    width: 100%; /* 고정 */
    table-layout: fixed;
    border-collapse: collapse;
}

/* 헤더/셀 스타일 */
.product-table th,
.product-table td {
    border: 1px solid #e5e7eb;
    padding: 10px;
    font-size: 15px !important;
    white-space: normal; /* 줄바꿈 방지 → 조회 테이블과 동일 */
    overflow: hidden;
    text-overflow: ellipsis; /* 텍스트 넘치면 ... */
}

/* 모든 input/select이 셀을 넘지 못하도록 강제 */
.product-table td input,
.product-table td select {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: 6px 8px !important;
    font-size: 14px !important; /* 폰트도 살짝 축소 */
}

.product-table th {
    background: #f9fafb;
    font-weight: 600;
    text-align: center;
}

/* 체크박스 정렬 */
.product-table td.center {
    text-align: center;
}

/* 숫자·총액 정렬 */
.product-table td.left {
    text-align: left;
}

/* 제품명 row 정렬 */
.prod-name {
    display: flex;
    align-items: center;
    gap: 6px;
}

.prod-name input {
    flex: 1;
}

/* 검색 아이콘 버튼 */
.prod-name .icon {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 3px 6px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 15px;
}

/* 총액 영역 */
.product-footer {
    width: 100%; /* 카드 너비에 맞추기 */
    margin-top: 12px; /* 위에만 여백 */
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding-right: 10px; /* 오른쪽 여백 살짝 추가 (선택 사항) */
    box-sizing: border-box;
}

/* 🔥 전체 주문 총액 텍스트 */
.total-label {
    font-size: 17px; /* 테이블과 동일 */
    font-weight: bold; /* 일반 굵기 */
    color: #000; /* 검정색 */
}

.total-amount .price {
    font-size: 20px; /* 테이블과 동일 */
    font-weight: bold; /* 일반 굵기 */
    color: #f97316; /* 주황색 */
}

.total-amount .unit {
    font-size: 17px; /* 테이블과 동일 */
    font-weight: bold; /* 일반 굵기 */
    color: #000; /* 검정색 */
    margin-left: 3px;
}

/* input + 단위 묶어서 한 줄 유지 */
.num-wrap {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
}

/* 숫자 input은 적절한 너비만 차지 */
.num-wrap input {
    flex: 1; /* 공간 남는 만큼만 사용 */
    min-width: 0; /* 줄바꿈 방지 */
    padding: 6px 8px;
    box-sizing: border-box;
}

/* 단위(개, 원) */
.num-wrap span {
    white-space: nowrap; /* 절대 줄바꿈 안되게 */
    font-size: 15px;
}
</style>
