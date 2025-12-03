<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const orderList = ref([]);

// 검색조건
const filters = ref({
    ord_code: '',
    ord_name: '',
    client_name: '',
    ord_amount: '',
    ord_date: '',
    delivery_date: '',
    ord_stat_name: ''
});

// 날짜 포맷팅 함수
const formatDate = (row) => {
    if (!row.ord_date) return '';
    const d = new Date(row.ord_date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 주문 리스트 조회 (검색 포함)
const fetchOrderList = async () => {
    try {
        const query = new URLSearchParams(filters.value).toString();
        const res = await axios.get(`/api/order/list?${query}`);
        if (res.data.code === 'S200') {
            orderList.value = res.data.data;
        }
    } catch (err) {
        console.error(err);
    }
};

// 검색 초기화
const resetSearch = () => {
    filters.value = {
        ord_code: '',
        ord_name: '',
        client_name: '',
        ord_amount: '',
        ord_date: '',
        delivery_date: '',
        ord_stat_name: ''
    };
    fetchOrderList();
};

onMounted(() => {
    fetchOrderList();
});
</script>

<template>
    <div class="p-6">
        <!-- 검색 조건 UI -->
        <div>
            <label>주문번호</label>
            <input v-model="filters.ord_code" type="text" class="input" placeholder="주문번호" />
            <label>주문명</label>
            <input v-model="filters.ord_name" type="text" class="input" placeholder="주문명" />
            <label>거래처</label>
            <input v-model="filters.client_name" type="text" class="input" placeholder="거래처" />
            <input v-model="filters.ord_amount" type="number" class="input" placeholder="수량" />
            <input v-model="filters.ord_date" type="date" class="input" placeholder="주문일자" />
            <input v-model="filters.delivery_date" type="date" class="input" placeholder="납기일" />
            <input v-model="filters.ord_stat_name" type="text" class="input" placeholder="상태" />

            <div class="flex gap-2 col-span-3 justify-end">
                <button class="px-4 py-2 bg-gray-400 rounded text-white" @click="resetSearch">초기화</button>
                <button class="px-4 py-2 bg-blue-500 rounded text-white" @click="fetchOrderList">조회</button>
            </div>
        </div>

        <!-- 주문 조회 테이블 -->
        <DataTable :value="orderList" scrollable scrollHeight="400px">
            <Column field="ord_code" header="주문번호"></Column>
            <Column field="ord_name" header="주문명"></Column>
            <Column field="ord_date" header="주문일자" :body="formatDate"></Column>
            <Column field="prod_name" header="제품명"></Column>
            <Column field="ord_amount" header="수량"></Column>
            <Column field="client_name" header="거래처"></Column>
            <Column field="delivery_date" header="납기일"></Column>
            <Column field="ord_stat_name" header="상태"></Column>
            <Column field="note" header="비고"></Column>
        </DataTable>
    </div>
</template>

<style scoped lang="postcss">
.input {
    @apply w-full px-3 py-2 border rounded;
}
</style>
