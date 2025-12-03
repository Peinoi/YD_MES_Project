<!-- src/views/release/ForwardingManagement.vue -->
<script setup>
import { reactive, ref } from 'vue';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const showOrderModal = ref(false);
const showReleaseModal = ref(false); // 출고 모달

// 🔹 주문 검색 모달 컬럼
const orderColumns = [
    { field: 'orderNo', label: '주문번호' },
    { field: 'orderDate', label: '주문일자' },
    { field: 'orderName', label: '주문명' },
    { field: 'client', label: '거래처' },
    { field: 'dueDate', label: '납기일' },
    { field: 'priority', label: '우선순위' }
];

// 백엔드에서 채워질 주문 리스트
const orderRows = ref([]);
const orderKeyword = ref('');

// 주문 모달 열기
const openOrderModal = () => {
    showOrderModal.value = true;
    // TODO: 주문 초기 목록 로딩 API 호출 (옵션)
    // e.g. fetchOrderList('');
};

// 주문 검색
const handleSearchOrder = (keyword) => {
    orderKeyword.value = keyword;
    console.log('[Forwarding] 주문 검색 키워드:', keyword);

    // TODO: 백엔드 연동
    // api.get('/orders', { params: { keyword } }).then(res => {
    //   orderRows.value = res.data;
    // });
};

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

// 출고 모달 열기
const openReleaseModal = () => {
    showReleaseModal.value = true;
    // TODO: 출고 초기 목록 로딩 API 호출 (옵션)
};

// 출고 검색
const handleSearchRelease = (keyword) => {
    releaseKeyword.value = keyword;
    console.log('[Forwarding] 출고 검색 키워드:', keyword);

    // TODO: 백엔드 연동
    // api.get('/releases', { params: { keyword } }).then(res => {
    //   releaseRows.value = res.data;
    // });
};

// 🔹 기본정보
const basicInfo = reactive({
    releaseCode: '',
    orderCode: '',
    releaseDate: '',
    orderDate: '',
    client: '',
    registrant: 'EMP-10001',
    remark: ''
});

// 주문 선택 시
const handleConfirmOrder = (row) => {
    if (!row) return;

    console.log('[Forwarding] 주문 선택:', row);

    basicInfo.orderCode = row.orderNo;
    basicInfo.orderDate = row.orderDate;
    basicInfo.client = row.client;

    // TODO: 여기서 주문 상세(제품 목록) 조회 API 호출 후 products 채우기
    // api.get(`/orders/${row.orderNo}`).then(res => {
    //   products.value = res.data.items.map(item => ({
    //     productCode: item.productCode,
    //     name: item.productName,
    //     type: item.type,
    //     spec: item.spec,
    //     unit: item.unit,
    //     orderQty: item.orderQty,
    //     releaseQty: 0,                       // 최초 출고수량은 0
    //     stockQty: item.currentStock,
    //     dueDate: item.dueDate
    //   }));
    // });
};

// 출고 선택 시 (기존 출고 불러오기)
const handleConfirmRelease = (row) => {
    if (!row) return;

    console.log('[Forwarding] 출고 선택:', row);

    basicInfo.releaseCode = row.releaseCode;
    basicInfo.releaseDate = row.releaseDate;
    basicInfo.orderCode = row.orderCode;
    basicInfo.client = row.client;

    // TODO: 여기서 출고 상세(제품별 출고수량) 조회 API 호출 후 products 채우기
    // api.get(`/releases/${row.releaseCode}`).then(res => {
    //   const header = res.data.header;
    //   const lines = res.data.lines;
    //
    //   basicInfo.releaseDate = header.releaseDate;
    //   basicInfo.orderCode = header.orderCode;
    //   basicInfo.client = header.client;
    //   basicInfo.remark = header.remark;
    //
    //   products.value = lines.map(item => ({
    //     productCode: item.productCode,
    //     name: item.productName,
    //     type: item.type,
    //     spec: item.spec,
    //     unit: item.unit,
    //     orderQty: item.orderQty,
    //     releaseQty: item.releaseQty,
    //     stockQty: item.currentStock,
    //     dueDate: item.dueDate
    //   }));
    // });
};

const handleCancelOrder = () => {
    console.log('주문 선택 모달 취소');
};

const handleCancelRelease = () => {
    console.log('출고 선택 모달 취소');
};

// 🔹 제품 리스트 (주문/출고 선택 시 API 결과로 채움)
const products = ref([]);

// 출고수량 보정 (음수/과다 방지)
const clampReleaseQty = (item) => {
    if (item.releaseQty == null || isNaN(item.releaseQty)) {
        item.releaseQty = 0;
    }

    if (item.releaseQty < 0) {
        item.releaseQty = 0;
    }

    // 주문수량 이상 입력 방지
    if (item.orderQty != null && item.releaseQty > item.orderQty) {
        item.releaseQty = item.orderQty;
    }

    // 재고보다 많이 출고하려고 하면 재고까지로 보정 (필요 없으면 주석처리)
    if (item.stockQty != null && item.releaseQty > item.stockQty) {
        item.releaseQty = item.stockQty;
    }
};

const onDelete = () => {
    console.log('삭제 클릭 (TODO: 출고전표 삭제 API)');
};

const onReset = () => {
    basicInfo.releaseCode = '';
    basicInfo.orderCode = '';
    basicInfo.releaseDate = '';
    basicInfo.orderDate = '';
    basicInfo.client = '';
    basicInfo.remark = '';
    products.value = [];
    console.log('초기화 클릭');
};

const onSave = () => {
    console.log('저장 클릭 payload:', {
        basicInfo: { ...basicInfo },
        products: products.value
    });

    // TODO: 신규/수정 분기 처리
    // if (!basicInfo.releaseCode) {
    //   api.post('/releases', { header: basicInfo, lines: products.value });
    // } else {
    //   api.put(`/releases/${basicInfo.releaseCode}`, { header: basicInfo, lines: products.value });
    // }
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

            <div class="form-grid">
                <!-- 출고코드 -->
                <div class="form-field col-2">
                    <label class="form-label">출고코드</label>
                    <input v-model="basicInfo.releaseCode" type="text" class="form-input" placeholder="출고코드" />
                </div>

                <!-- 주문코드 -->
                <div class="form-field col-2">
                    <label class="form-label">주문코드</label>
                    <input v-model="basicInfo.orderCode" type="text" class="form-input" placeholder="주문코드" />
                </div>

                <!-- 출고일자 -->
                <div class="form-field col-2">
                    <label class="form-label">출고일자</label>
                    <input v-model="basicInfo.releaseDate" type="date" class="form-input" />
                </div>

                <!-- 주문일자 -->
                <div class="form-field col-2">
                    <label class="form-label">주문일자</label>
                    <input v-model="basicInfo.orderDate" type="date" class="form-input" />
                </div>

                <!-- 거래처 -->
                <div class="form-field col-2">
                    <label class="form-label">거래처</label>
                    <input v-model="basicInfo.client" type="text" class="form-input" placeholder="거래처" />
                </div>

                <!-- 등록자 -->
                <div class="form-field col-2">
                    <label class="form-label">등록자</label>
                    <input v-model="basicInfo.registrant" type="text" class="form-input" readonly />
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
                            <th>남은수량</th>
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
                            <td>{{ item.type }}</td>
                            <td>{{ item.spec }}</td>
                            <td>{{ item.unit }}</td>

                            <!-- 주문수량 -->
                            <td class="num">{{ item.orderQty }}</td>

                            <!-- 출고수량 입력 -->
                            <td class="num">
                                <input type="number" v-model.number="item.releaseQty" min="0" :max="item.orderQty" class="qty-input" @blur="clampReleaseQty(item)" />
                            </td>

                            <!-- 남은수량: 주문수량 - 출고수량 -->
                            <td class="num">
                                {{ (item.orderQty || 0) - (item.releaseQty || 0) }}
                            </td>

                            <!-- 현재 재고 -->
                            <td class="num">{{ item.stockQty }}</td>

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
    height: 100%; /* 상위 레이아웃이 100vh 기준이면 내부에서 잘 맞음 */
    box-sizing: border-box;
    overflow: hidden; /* 페이지 자체 스크롤 없음 */
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

.btn {
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
}

.btn-red {
    background: #ff6b6b;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-black {
    background: #000;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-blue {
    background: #4ea3ff;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-outline-green {
    background: #4ecb79;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
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
    min-height: 0; /* flex 컨테이너에서 자식이 스크롤 되게 하려면 필요 */
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
    padding: 10px;
    font-size: 0.85rem;
    outline: none;
}

.form-input:focus,
.form-textarea:focus {
    border-color: #1976d2;
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

.forward-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.forward-table thead {
    background: #f4f6fb;
}

.forward-table th,
.forward-table td {
    padding: 0.5rem 0.6rem;
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

/* 출고수량 입력 */
.qty-input {
    width: 80px;
    padding: 4px 6px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    text-align: right;
    font-size: 0.8rem;
}

.qty-input:focus {
    outline: none;
    border-color: #1976d2;
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
