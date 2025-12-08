<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SearchSelectModal from '@/views/order/SearchSelectModal.vue';

const showClientModal = ref(false);

const orderList = ref([]);
const statList = ref([]);
const selectedOrders = ref([]);
const clientSearchList = ref([]);

// 검색조건
const search = ref({
    ord_code: '',
    ord_name: '',
    client_code: '',
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

const fetchClientSearch = async (keyword = '') => {
    try {
        // 백엔드에서 모든 목록을 가져온 후 클라이언트에서 키워드 필터링을 수행하는 로직
        const res = await axios.get('/api/order/client/search', { params: { keyword: '' } });
        const fullList = res.data.code === 'S200' ? res.data.data : [];

        if (keyword && fullList.length) {
            const lowerKeyword = keyword.toLowerCase();
            clientSearchList.value = fullList.filter((row) => {
                const clientCode = String(row.client_code || '').toLowerCase();
                const clientName = String(row.client_name || '').toLowerCase();

                return clientCode.includes(lowerKeyword) || clientName.includes(lowerKeyword);
            });
        } else {
            // 키워드가 없으면 전체 목록 표시
            clientSearchList.value = fullList;
        }
    } catch (e) {
        console.error('fetchClientSearch', e);
        clientSearchList.value = [];
    }
};

const onClientSelect = (row) => {
    if (!row || !row.client_code) return;

    // ⭐️ search 객체에 코드와 이름을 반영
    search.value.client_code = row.client_code;
    search.value.client_name = row.client_name;

    showClientModal.value = false;
};

const openClientSearch = () => {
    // 모달을 열기 전에 초기 목록을 불러오고 모달을 띄웁니다.
    fetchClientSearch('').then(() => {
        showClientModal.value = true;
    });
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
        client_code: '',
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

    const excelData = data.map((item) => ({
        주문번호: item.ord_code,
        주문명: item.ord_name,
        거래처: item.client_name,
        제품명: item.prod_name,
        수량: item.ord_amount, // formatNumber 적용은 Excel 다운로드 후 직접 확인/처리하는 것이 일반적
        주문일자: formatDate(item.ord_date),
        납기일: formatDate(item.delivery_date),
        상태: item.ord_stat_name,
        비고: item.note
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '주문목록');

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(workbook, `주문목록_${date}.xlsx`);
};

onMounted(() => {
    fetchOrderList();
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
                        <div class="input-with-button">
                            <input v-model="search.client_name" type="text" class="input" readonly placeholder="거래처를 선택하세요." @click="openClientSearch" />
                            <button class="btn btn-search" @click="openClientSearch">🔍</button>
                            <button
                                v-if="search.client_code"
                                class="btn btn-clear"
                                @click="
                                    search.client_name = '';
                                    search.client_code = '';
                                "
                            >
                                X
                            </button>
                        </div>
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
                    <DataTable :value="orderList" v-model:selection="selectedOrders" selectionMode="multiple" dataKey="ord_d_code" showGridlines stripedRows class="order-table" scrollable scrollHeight="100%">
                        <Column selectionMode="multiple" style="width: 3rem" />
                        <Column header="No." style="width: 3rem">
                            <template #body="slotProps">{{ slotProps.index + 1 }}</template>
                        </Column>
                        <Column field="ord_code" header="주문번호" sortable />
                        <Column field="ord_name" header="주문명" sortable />
                        <Column header="주문일자">
                            <template #body="{ data }">{{ formatDate(data.ord_date) }}</template>
                        </Column>
                        <Column field="prod_name" header="제품명" sortable />
                        <Column header="수량" sortable>
                            <template #body="{ data }">{{ formatNumber(data.ord_amount) }}</template>
                        </Column>
                        <Column field="client_name" header="거래처" sortable />
                        <Column header="납기일">
                            <template #body="{ data }">{{ formatDate(data.delivery_date) }}</template>
                        </Column>
                        <Column field="ord_stat_name" header="상태" sortable />
                        <Column field="note" header="비고" sortable />
                    </DataTable>
                </div>
            </div>
        </div>
        <SearchSelectModal
            v-model="showClientModal"
            searchPlaceholder="거래처명 또는 거래처 코드를 입력하세요."
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
    /* height: 100vh;를 calc()로 변경하여 padding 만큼 제외하고 높이를 계산 */
    height: calc(100vh - 0px); /* 뷰포트 높이 전체를 사용하되, padding을 제외하기 위해 calc 사용 (padding이 24px이지만, 확실한 동작을 위해 일단 0으로 가정) */
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
    flex-shrink: 0;
}

/* 주문 목록 카드(테이블 카드) - 남은 공간을 모두 채우는 컨테이너 */
.card.table-card {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0; /* Flex Item이 높이 계산을 제대로 하도록 보장 */
    overflow: hidden; /* 자식 요소의 오버플로우가 이 카드를 넘어가지 않게 */
}

/* 카드 헤더 및 검색 영역 스타일은 그대로 유지 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0; /* 헤더는 고정 높이 */
}

/* ------------------------------ */
/* ▶ 검색 영역 (변경 없음) */
/* ------------------------------ */
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
    width: 80px;
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
}

.input {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    box-sizing: border-box;
}

.range-input {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
}

.range-input .input {
    flex: 1;
    width: 100%;
}

.search-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
}

.btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
}

.input-with-button {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 4px;
}

.btn-search {
    background: #e5e7eb;
    color: #374151;
    padding: 8px 10px;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1;
}
.btn-search:hover {
    background: #d1d5db;
}

.btn-clear {
    background: #ff4d4f;
    color: white;
    padding: 8px 10px;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1;
}

/* ------------------------------ */
/* 🔑 ▶ 테이블 스타일 (최종 안정화) */
/* ------------------------------ */

/* 주문 목록 테이블 - 강제 너비 제거 및 안정화 */
.order-table {
    /* 강제 너비 설정 제거. 테이블 내용에 따라 크기 조절 */
    min-width: 100%; /* table-wrapper보다 작아지지 않도록 */
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

/* ✔ 테이블 안에서만 스크롤 생김 (핵심 로직) */
.table-wrapper {
    flex: 1; /* 남은 공간 모두 차지 (세로 확장) */
    min-height: 0; /* Flexbox 높이 계산을 위한 필수 속성 */
    overflow: auto; /* 가로/세로 스크롤을 이 래퍼에서 모두 처리 */
    margin-top: 8px; /* 테이블과 헤더 간의 여백 */
}

/* PrimeVue DataTable 컴포넌트 */
.table-wrapper > .p-datatable {
    height: 100%; /* table-wrapper의 높이를 100% 사용 */
    display: flex;
    flex-direction: column;
}

/* PrimeVue DataTable 내부 스크롤 가능한 영역 (p-datatable-wrapper) */
.table-wrapper > .p-datatable > .p-datatable-wrapper {
    flex: 1; /* 남은 세로 공간을 모두 차지하여 스크롤 영역 확보 */
    min-height: 0;
}

/* 스크롤바 스타일 */
.table-wrapper::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.table-wrapper::-webkit-scrollbar-thumb {
    background: #c7c7c7;
    border-radius: 10px;
}
</style>
