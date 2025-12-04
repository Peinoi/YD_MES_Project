<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx'; // 엑셀 다운로드용

const orderList = ref([]); // 주문 목록
const clientList = ref([]); // 거래처 목록
const statList = ref([]); // 상태 목록

const selectedOrders = ref([]); // 체크박스 선택 목록

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

// 주문 목록 조회
const fetchOrderList = async () => {
    try {
        const query = new URLSearchParams(search.value).toString();
        const res = await axios.get(`/api/order/list?${query}`);
        if (res.data.code === 'S200') {
            orderList.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    }
};

// 거래처 목록 조회
const fetchClientList = async () => {
    try {
        const res = await axios.get(`/api/order/client/list`);
        if (res.data.code === 'S200') {
            clientList.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    }
};

// 상태 목록 조회
const fetchStatList = async () => {
    try {
        const res = await axios.get(`/api/order/stat/list`);
        if (res.data.code === 'S200') {
            statList.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    }
};

// 검색 초기화
const resetSearch = () => {
    search.value = {
        ord_code: '',
        ord_name: '',
        client_name: '',
        ord_amount: '',
        ord_date_from: '',
        ord_date_to: '',
        delivery_date_from: '',
        delivery_date_to: '',
        ord_stat_name: ''
    };
    fetchOrderList();
};

// 엑셀 다운로드 기능
const downloadExcel = () => {
    const data = selectedOrders.value.length > 0 ? selectedOrders.value : orderList.value;

    if (data.length === 0) {
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
    <div class="order-container">
        <!-- Header -->
        <div class="header-section">
            <h2 class="page-title">주문 조회</h2>
        </div>

        <!-- 검색 조건 -->
        <div class="content-card">
            <div class="card-header">
                <h3 class="card-title"><i class="pi pi-search mr-2 text-primary"></i>검색 조건</h3>
            </div>

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
                        <span>~</span>
                        <input v-model="search.ord_date_to" type="date" class="input" />
                    </div>
                </div>

                <div class="field-group">
                    <label>거래처</label>
                    <select v-model="search.client_name" class="input">
                        <option value=""></option>
                        <option v-for="c in clientList" :value="c.client_name" :key="c.client_code">
                            {{ c.client_name }}
                        </option>
                    </select>
                </div>

                <div class="field-group">
                    <label>수량</label>
                    <div class="range-input">
                        <input v-model="search.ord_amount_from" type="number" class="input" />
                        <span>~</span>
                        <input v-model="search.ord_amount_to" type="number" class="input" />
                    </div>
                </div>

                <div class="field-group">
                    <label>납기일</label>
                    <div class="range-input">
                        <input v-model="search.delivery_date_from" type="date" class="input" />
                        <span>~</span>
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
                <button class="btn-gray" @click="resetSearch">초기화</button>
                <button class="btn-blue" @click="fetchOrderList">조회</button>
            </div>
        </div>

        <!-- 주문 목록 -->
        <div class="content-card mt-6">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="pi pi-list mr-2 text-primary"></i>주문 목록
                    <span class="count-text">(검색 결과 {{ orderList.length }}건)</span>
                </h3>

                <button class="btn-excel" @click="downloadExcel"><i class="pi pi-file-excel mr-2"></i>엑셀 다운로드</button>
            </div>

            <DataTable :value="orderList" v-model:selection="selectedOrders" selectionMode="multiple" dataKey="ord_code" showGridlines stripedRows responsiveLayout="scroll" class="text-sm">
                <Column selectionMode="multiple" style="width: 3rem"></Column>

                <Column header="No." headerClass="center-header" bodyClass="text-center" style="width: 3rem">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="ord_code" header="주문번호" sortable class="center-header text-center" />
                <Column field="ord_name" header="주문명" sortable class="center-header text-center" />
                <Column field="ord_date" header="주문일자" sortable class="center-header text-center" />
                <Column field="prod_name" header="제품명" sortable class="center-header text-center" />
                <Column field="ord_amount" header="수량" sortable class="center-header text-center" />
                <Column field="client_name" header="거래처" sortable class="center-header text-center" />
                <Column field="delivery_date" header="납기일" sortable class="center-header text-center" />
                <Column field="ord_stat_name" header="상태" sortable class="center-header text-center" />
                <Column field="note" header="비고" sortable class="center-header text-center" />

                <template #empty>
                    <div class="text-center p-4 text-gray-500">등록된 주문이 없습니다.</div>
                </template>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
.order-container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 2rem;
    background: #f4f6f8;
}

.page-title {
    font-size: 1.8rem;
    font-weight: 800;
}

.content-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid #e5e7eb;
}

.search-grid {
    display: grid;
    gap: 1.2rem;
    margin-top: 1rem;
    grid-template-columns: repeat(4, 1fr);
}

.field-group label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.4rem;
}

.input {
    width: 100%;
    padding: 0.45rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
}

.range-input {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.search-actions {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    margin-top: 1.6rem;
}

.btn-gray {
    background: #9ca3af;
    color: white;
    padding: 0.5rem 1.2rem;
    border-radius: 6px;
    font-size: 0.9rem;
}

.btn-blue {
    background: #2563eb;
    color: white;
    padding: 0.5rem 1.4rem;
    border-radius: 6px;
    font-size: 0.9rem;
}

.btn-excel {
    background: #16a34a;
    color: white;
    padding: 0.45rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
}

.count-text {
    font-size: 0.9rem;
    color: #6b7280;
}

.center-header .p-column-header-content {
    justify-content: center;
}
</style>

<style>
/* PrimeVue 4 헤더 컨텐츠 클래스명 대응 */
.center-header .p-column-header-content,
.center-header .p-datatable-column-header-content {
    justify-content: center !important;
}
</style>
