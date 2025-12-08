<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const orderList = ref([]);
const clientList = ref([]);
const statList = ref([]);
const selectedOrders = ref([]);

// 검색조건
const search = ref({
    ord_code: '',
    ord_name: '',
    client_name: '',
    ord_amount_from: '',
    ord_amount_to: '',
    ord_date_from: '',
    ord_date_to: '',
    delivery_date_from: '',
    delivery_date_to: '',
    ord_stat_name: ''
});

// 날짜 함수 ex) 0000.00.00
const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return d;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
};

// 수량 , + 개 추가 함수
const formatNumber = (n) => {
    if (n === null || n === undefined || n === '') return '';
    const num = Number(n);
    if (isNaN(num)) return n;
    return num.toLocaleString() + '개';
};

// 주문 목록 조회
const fetchOrderList = async () => {
    try {
        const query = new URLSearchParams(search.value).toString();
        const res = await axios.get(`/api/order/list?${query}`);
        if (res.data && res.data.code === 'S200') {
            orderList.value = res.data.data || [];
        } else {
            orderList.value = res.data?.data || [];
        }
    } catch (err) {
        console.error('fetchOrderList', err);
    }
};

// 거래처 목록 조회
const fetchClientList = async () => {
    try {
        const res = await axios.get(`/api/order/client/list`);
        if (res.data && res.data.code === 'S200') {
            clientList.value = res.data.data || [];
        }
    } catch (err) {
        console.error('fetchClientList', err);
    }
};

// 상태 목록 조회
const fetchStatList = async () => {
    try {
        const res = await axios.get(`/api/order/stat/list`);
        if (res.data && res.data.code === 'S200') {
            statList.value = res.data.data || [];
        }
    } catch (err) {
        console.error('fetchStatList', err);
    }
};

const resetSearch = () => {
    search.value = {
        ord_code: '',
        ord_name: '',
        client_name: '',
        ord_amount_from: '',
        ord_amount_to: '',
        ord_date_from: '',
        ord_date_to: '',
        delivery_date_from: '',
        delivery_date_to: '',
        ord_stat_name: ''
    };
    fetchOrderList();
};

// 엑셀 다운로드
const downloadExcel = () => {
    const data = selectedOrders.value.length > 0 ? selectedOrders.value : orderList.value;

    if (!data || data.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '주문목록');

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(workbook, `주문목록_${date}.xlsx`);
};

onMounted(() => {
    fetchOrderList();
    fetchClientList();
    fetchStatList();
});
</script>

<template>
    <div class="page-container">
        <div class="card">
            <!-- 검색 조건 -->
            <div class="card search-card">
                <div class="search-grid">
                    <div class="field-group">
                        <label>주문번호</label>
                        <input v-model="search.ord_code" type="text" class="input" />
                    </div>

                    <div class="field-group">
                        <label>주문명</label>
                        <input v-model="search.ord_name" type="text" class="input" />
                    </div>

                    <div class="field-group">
                        <label>주문일자</label>
                        <div class="range-input">
                            <input v-model="search.ord_date_from" type="date" class="input" />
                            <span class="tilde">~</span>
                            <input v-model="search.ord_date_to" type="date" class="input" />
                        </div>
                    </div>

                    <div class="field-group">
                        <label>거래처</label>
                        <select v-model="search.client_name" class="input">
                            <option value=""></option>
                            <option v-for="c in clientList" :value="c.clientName" :key="c.clientCode">
                                {{ c.clientName }}
                            </option>
                        </select>
                    </div>

                    <div class="field-group">
                        <label>수량</label>
                        <div class="range-input">
                            <input v-model="search.ord_amount_from" type="number" class="input" />
                            <span class="tilde">~</span>
                            <input v-model="search.ord_amount_to" type="number" class="input" />
                        </div>
                    </div>

                    <div class="field-group">
                        <label>납기일</label>
                        <div class="range-input">
                            <input v-model="search.delivery_date_from" type="date" class="input" />
                            <span class="tilde">~</span>
                            <input v-model="search.delivery_date_to" type="date" class="input" />
                        </div>
                    </div>

                    <div class="field-group">
                        <label>상태</label>
                        <select v-model="search.ord_stat_name" class="input">
                            <option value=""></option>
                            <option v-for="stat in statList" :key="stat.com_value" :value="stat.note">
                                {{ stat.note }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="search-actions">
                    <button class="btn btn-gray" @click="resetSearch">초기화</button>
                    <button class="btn btn-blue" @click="fetchOrderList">조회</button>
                </div>
            </div>

            <!-- 결과 및 엑셀 -->
            <div class="card mt-6 table-card">
                <div class="card-header">
                    <h3 class="card-title">
                        주문 목록
                        <span class="count-text">(검색 결과 {{ orderList.length }}건)</span>
                    </h3>

                    <div class="right-actions">
                        <button class="btn btn-excel" @click="downloadExcel"><i class="pi pi-file-excel mr-2"></i>엑셀 다운로드</button>
                    </div>
                </div>

                <div class="table-wrapper">
                    <DataTable :value="orderList" v-model:selection="selectedOrders" selectionMode="multiple" dataKey="ord_code" showGridlines stripedRows class="order-table">
                        <Column selectionMode="multiple" style="width: 3rem" />
                        <Column header="No." style="width: 3rem">
                            <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                        </Column>
                        <Column field="ord_code" header="주문번호" sortable />
                        <Column field="ord_name" header="주문명" sortable />
                        <Column header="주문일자">
                            <template #body="{ data }">
                                {{ formatDate(data.ord_date) }}
                            </template>
                        </Column>
                        <Column field="prod_name" header="제품명" sortable />
                        <Column header="수량" sortable>
                            <template #body="{ data }">
                                {{ formatNumber(data.ord_amount) }}
                            </template>
                        </Column>
                        <Column field="client_name" header="거래처" sortable />
                        <Column header="납기일">
                            <template #body="{ data }">
                                {{ formatDate(data.delivery_date) }}
                            </template>
                        </Column>
                        <Column field="ord_stat_name" header="상태" sortable />
                        <Column field="note" header="비고" sortable />

                        <template #empty>
                            <div class="text-center p-4 text-gray-500">등록된 주문이 없습니다.</div>
                        </template>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ------------------------------ */
/* ▶ 페이지 레이아웃 전체 화면 스크롤 제거 */
/* ------------------------------ */
/* 전체 페이지 컨테이너 */
.page-container {
    max-width: 1650px;
    margin: 0 auto;
    padding: 24px;
    background: #f4f6f8;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 전체 스크롤 제거 */
}
/* 기본 카드 */
.card {
    background: white;
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 18px;
    flex-shrink: 0; /* 위 카드들이 아래를 눌러서 overflow 생기는 것 방지 */
}

/* 주문 목록 카드(테이블 카드) */
.card.table-card {
    flex: 1; /* 화면에서 남은 높이를 전부 차지 */
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 결과 카드 자체에서 스크롤 막음 */
}

/* 카드 헤더 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
}

/* 제목 */
.page-title {
    font-size: 1.5rem;
    font-weight: 800;
}
/* ------------------------------ */
/* ▶ 검색 영역 */
/* ------------------------------ */
/* 검색 조건 그리드 */
.search-grid {
    display: grid;
    gap: 12px;
    margin-top: 12px;
    grid-template-columns: repeat(3, 1fr);
}

.field-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.field-group label {
    width: 80px; /* 라벨 너비 맞추기 */
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
}

/* 검색 input */
.input {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    box-sizing: border-box;
}

/* 날짜, 수량 범위 */
.range-input {
    display: flex;
    align-items: center;
    width: 100%; /* 전체 너비 확보 */
    gap: 8px;
}

.range-input .input {
    flex: 1; /* input 두 개가 동일하게 넓게 */
    width: 100%; /* 혹시 모를 겹침 방지 */
}

/* 검색 버튼 */
.search-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
}

/* 버튼 */
.btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
}

/* ------------------------------ */
/* ▶ 테이블 스타일 */
/* ------------------------------ */
/* 주문 목록 테이블 너비 고정 + 폰트 15px */
.order-table {
    width: 1600px !important;
    max-width: 1600px !important;
    min-width: 1600px !important;
    font-size: 15px !important;
    margin: 0 auto;
}

/* PrimeVue 테이블 내부 폰트 15px 유지 */
.p-datatable .p-datatable-thead > tr > th,
.p-datatable .p-datatable-tbody > tr > td {
    font-size: 15px !important;
}

/* 빈 데이터 폰트 */
.p-datatable .p-datatable-empty-message {
    font-size: 15px;
}

/* ✔ 테이블 안에서만 스크롤 생김 */
.table-wrapper {
    flex: 1; /* 남은 공간 모두 테이블에게 줌 */
    overflow-y: auto; /* 테이블 안에서만 스크롤 */
    overflow-x: auto;
}

.table-wrapper::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.table-wrapper::-webkit-scrollbar-thumb {
    background: #c7c7c7;
    border-radius: 10px;
}
</style>
