<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import SearchSelectModal from '@/views/order/SearchSelectModal.vue';

// 모달 ON/OFF
const showOrderModal = ref(false);

// 모달 검색 결과
const orderSearchList = ref([]);

// 모달 검색 이벤트
const fetchOrderSearch = async (keyword = '') => {
    try {
        const res = await axios.get('/api/order/search', { params: { keyword } });
        if (res.data && res.data.code === 'S200') {
            const fullList = res.data.data || [];

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

// 모달에서 선택한 결과 받기
const onOrderSelect = (row) => {
    if (!row) return;

    // 주문 기본 정보
    order.ord_code = row.ord_code || '';
    order.ord_name = row.ord_name || '';
    order.client_name = row.client_name || '';
    order.client_contact = row.emp_name || '';
    order.note = row.note || '';
    order.readonly = true;

    // 제품 정보
    const selectedOrderProducts = orderSearchList.value.filter((p) => p.ord_code === row.ord_code);
    products.value = selectedOrderProducts.map((p) => ({
        id: nextProductId++,
        prod_name: p.prod_name || '',
        type: p.com_value_name || '',
        spec: p.spec_name || '',
        unit: p.unit_name || '',
        amount: p.ord_amount || 0,
        unit_price: p.prod_price || 0,
        delivery_date: p.delivery_date ? p.delivery_date.slice(0, 10) : '',
        priority: p.ord_priority || '',
        _selected: false,
        get total() {
            return (Number(this.amount) || 0) * (Number(this.unit_price) || 0);
        }
    }));
};

// 주문 기본 정보
const order = reactive({
    ord_code: '',
    ord_name: '',
    ord_date: new Date().toISOString().slice(0, 10),
    client_name: '',
    client_contact: '',
    note: '',
    readonly: false
});

const clientList = ref([]);
const managerList = ref([]);

// 제품 목록: 기본 4행
const products = ref([createEmptyProduct(1), createEmptyProduct(2), createEmptyProduct(3), createEmptyProduct(4)]);
let nextProductId = 5;

function createEmptyProduct(id) {
    return {
        id,
        prod_name: '',
        type: '',
        spec: 0,
        unit: '',
        amount: 0,
        unit_price: 0,
        delivery_date: '',
        priority: '',
        _selected: false,
        get total() {
            return (Number(this.amount) || 0) * (Number(this.unit_price) || 0);
        }
    };
}

const totalSum = computed(() => products.value.reduce((acc, p) => acc + Number(p.amount || 0) * Number(p.unit_price || 0), 0));

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

function removeSelectedProducts() {
    products.value = products.value.filter((p) => !p._selected);
    if (products.value.length === 0) products.value.push(createEmptyProduct(nextProductId++));
}

function toggleSelectAll(ev) {
    const checked = ev.target.checked;
    products.value.forEach((p) => (p._selected = checked));
}

const allSelected = computed(() => products.value.length > 0 && products.value.every((p) => p._selected));

function recalcRow(idx) {
    const p = products.value[idx];
    p.amount = Number(p.amount) || 0;
    p.unit_price = Number(p.unit_price) || 0;
}

function resetForm() {
    order.ord_code = '';
    order.ord_name = '';
    order.client_name = '';
    order.client_contact = '';
    order.note = '';
    order.readonly = false;
    products.value = [createEmptyProduct(nextProductId++), createEmptyProduct(nextProductId++), createEmptyProduct(nextProductId++), createEmptyProduct(nextProductId++)];
}

function saveOrder() {
    const payload = {
        order: { ...order },
        products: products.value.map((p) => ({
            prod_name: p.prod_name,
            type: p.type,
            amount: p.amount,
            unit_price: p.unit_price,
            delivery_date: p.delivery_date,
            priority: p.priority
        }))
    };
    console.log('저장 payload', payload);
    // axios.post('/api/order/save', payload) ...
    alert('저장 동작(샘플): 콘솔 확인');
}

function deleteOrder() {
    if (!order.ord_code) {
        alert('삭제할 주문번호가 없습니다.');
        return;
    }
    if (!confirm('정말 삭제하시겠습니까?')) return;
    // axios.delete(`/api/order/${order.ord_code}`) ...
    alert('삭제 동작(샘플)');
}

function openProductSearch(idx) {
    const name = prompt('검색 제품명을 입력하세요');
    if (name) products.value[idx].prod_name = name;
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
                    <button class="btn danger" @click="deleteOrder">삭제</button>
                    <button class="btn ghost" @click="resetForm">초기화</button>
                    <button class="btn" @click="saveOrder">저장</button>
                    <button class="btn outline" @click="showOrderModal = true">주문정보 불러오기</button>
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
                    <select v-model="order.client_name">
                        <option value="">거래처를 선택해주세요.</option>
                        <option v-for="c in clientList" :key="c.client_code" :value="c.client_name">
                            {{ c.client_name }}
                        </option>
                    </select>
                </div>

                <div class="form-row">
                    <label>거래처담당자</label>
                    <select v-model="order.client_contact">
                        <option value=""></option>
                        <option v-for="manager in managerList" :key="manager.emp_code" :value="manager.emp_name">
                            {{ manager.emp_name }}
                        </option>
                    </select>

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
                                <input type="text" :value="p.prod_name.slice(0, 3)" @input="p.prod_name = $event.target.value" />
                                <button class="icon" @click="openProductSearch(idx)" title="제품 검색">🔍</button>
                            </div>
                        </td>
                        <td><input v-model="p.type" type="text" placeholder="분류명" /></td>
                        <td><input v-model="p.spec" type="number" placeholder="규격" /></td>
                        <td><input v-model="p.unit" type="text" placeholder="단위" /></td>
                        <td class="num-cell">
                            <div class="num-wrap">
                                <input v-model.number="p.amount" type="number" min="0" @input="recalcRow(idx)" />
                                <span>개</span>
                            </div>
                        </td>
                        <td class="num-cell">
                            <div class="num-wrap">
                                <input v-model.number="p.unit_price" type="number" min="0" @input="recalcRow(idx)" />
                                <span>원</span>
                            </div>
                        </td>
                        <td><input v-model="p.delivery_date" type="date" /></td>
                        <td>
                            <select v-model.number="p.priority">
                                <option value=""></option>
                                <option v-for="n in 3" :key="n" :value="n - 1">{{ n - 1 }}</option>
                            </select>
                        </td>
                        <td class="right">{{ formatCurrency(p.total) }}</td>
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
                { field: 'ord_date', label: '주문일자' },
                { field: 'ord_name', label: '주문명' },
                { field: 'client_name', label: '거래처' },
                { field: 'delivery_date', label: '납기일' },
                { field: 'ord_priority', label: '우선순위' }
            ]"
            :rows="orderSearchList"
            rowKey="ord_code"
            @search="fetchOrderSearch"
            @confirm="onOrderSelect"
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
    background: #2563eb;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 15px;
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

.btn.danger {
    background: #ef4444;
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
.product-table td.right {
    text-align: right;
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
