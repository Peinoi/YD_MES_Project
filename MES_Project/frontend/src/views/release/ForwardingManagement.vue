<!-- src/views/release/ForwardingManagement.vue -->
<script setup>
import { reactive, ref } from 'vue';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue';

const showOrderModal = ref(false);
const showReleaseModal = ref(false); // 🔹 출고 모달

// 테이블 헤더 정의 (주문)
const orderColumns = [
    { field: 'orderNo', label: '주문번호' },
    { field: 'orderDate', label: '주문일자' },
    { field: 'orderName', label: '주문명' },
    { field: 'client', label: '거래처' },
    { field: 'dueDate', label: '납기일' },
    { field: 'priority', label: '우선순위' }
];

// 🔹 예시 데이터(주문)
const allOrderRows = [
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    },
    {
        orderNo: 'O2025-0001',
        orderDate: '2025-12-01',
        orderName: '라면 정기발주 1차',
        client: '이마트',
        dueDate: '2025-12-10',
        priority: '1'
    },
    {
        orderNo: 'O2025-0002',
        orderDate: '2025-12-02',
        orderName: '컵라면 프로모션',
        client: '홈플러스',
        dueDate: '2025-12-12',
        priority: '2'
    },
    {
        orderNo: 'O2025-0003',
        orderDate: '2025-12-03',
        orderName: '수출용 라면 발주',
        client: '코스트코',
        dueDate: '2025-12-20',
        priority: '3'
    }
];

// 실제로 모달에 보여줄 데이터 (검색 시 이 값이 바뀜)
const orderRows = ref([...allOrderRows]);
const orderKeyword = ref('');

const openOrderModal = () => {
    showOrderModal.value = true;
};

const handleSearchOrder = (keyword) => {
    orderKeyword.value = keyword;
    const k = keyword.trim().toLowerCase();

    if (!k) {
        orderRows.value = [...allOrderRows];
        return;
    }

    orderRows.value = allOrderRows.filter((row) => {
        return row.orderNo.toLowerCase().includes(k) || row.orderName.toLowerCase().includes(k) || row.client.toLowerCase().includes(k);
    });
};

// 🔹 출고 정보 모달용 컬럼 / 데이터
const releaseColumns = [
    { field: 'releaseCode', label: '출고번호' },
    { field: 'releaseProduct', label: '출고제품' },
    { field: 'releaseQuantity', label: '출고수량' },
    { field: 'releaseDate', label: '출고일자' },
    { field: 'releaseManager', label: '출고 담당자' },
    { field: 'client', label: '거래처' },
    { field: 'status', label: '상태' }
];

// 예시 데이터 (나중에 API 연동하면 이 부분만 교체)
const allReleaseRows = [
    {
        releaseCode: 'R2025-0001',
        orderCode: 'O2025-0001',
        client: '이마트',
        releaseDate: '2025-12-05'
    },
    {
        releaseCode: 'R2025-0002',
        orderCode: 'O2025-0002',
        client: '홈플러스',
        releaseDate: '2025-12-06'
    },
    {
        releaseCode: 'R2025-0003',
        orderCode: 'O2025-0003',
        client: '코스트코',
        releaseDate: '2025-12-07'
    }
];

const releaseRows = ref([...allReleaseRows]);
const releaseKeyword = ref('');

// 출고 모달 열기
const openReleaseModal = () => {
    showReleaseModal.value = true;
};

// 출고 검색
const handleSearchRelease = (keyword) => {
    releaseKeyword.value = keyword;
    const k = keyword.trim().toLowerCase();

    if (!k) {
        releaseRows.value = [...allReleaseRows];
        return;
    }

    releaseRows.value = allReleaseRows.filter((row) => {
        return row.releaseCode.toLowerCase().includes(k) || row.orderCode.toLowerCase().includes(k) || row.client.toLowerCase().includes(k);
    });
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

    basicInfo.orderCode = row.orderNo;
    basicInfo.orderDate = row.orderDate;
    basicInfo.client = row.client;
};

// 출고 선택 시 (출고코드 쪽에 꽂기)
const handleConfirmRelease = (row) => {
    if (!row) return;

    basicInfo.releaseCode = row.releaseCode;
    basicInfo.releaseDate = row.releaseDate;
    basicInfo.orderCode = row.orderCode;
    basicInfo.client = row.client;
};

const handleCancelOrder = () => {
    console.log('주문 선택 모달 취소');
};

const handleCancelRelease = () => {
    console.log('출고 선택 모달 취소');
};

// 제품 리스트 (지금은 비워두고, 나중에 API 연동 예정)
const products = ref([]);

const onDelete = () => {
    console.log('삭제 클릭');
};

const onReset = () => {
    basicInfo.releaseCode = '';
    basicInfo.orderCode = '';
    basicInfo.releaseDate = '';
    basicInfo.orderDate = '';
    basicInfo.client = '';
    basicInfo.remark = '';
    console.log('초기화 클릭');
};

const onSave = () => {
    console.log('저장 클릭', { basicInfo, products: products.value });
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

            <!-- 공통 모달 사용 -->
            <SearchSelectModal
                v-model="showOrderModal"
                :columns="orderColumns"
                :rows="orderRows"
                row-key="orderNo"
                search-placeholder="주문번호 또는 주문명 또는 거래처를 입력해주세요."
                @search="handleSearchOrder"
                @confirm="handleConfirmOrder"
                @cancel="handleCancelOrder"
            />

            <!-- ✅ 출고 정보 모달 (같은 컴포넌트, 다른 설정) -->
            <SearchSelectModal
                v-model="showReleaseModal"
                :columns="releaseColumns"
                :rows="releaseRows"
                row-key="releaseCode"
                search-placeholder="출고번호 또는 거래처를 입력해주세요."
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
                            <td colspan="9" class="empty-row">제품을 선택하면 이곳에 목록이 표시됩니다.</td>
                        </tr>

                        <tr v-for="(item, idx) in products" :key="idx">
                            <td>{{ item.name }}</td>
                            <td>{{ item.type }}</td>
                            <td>{{ item.spec }}</td>
                            <td>{{ item.unit }}</td>
                            <td class="num">{{ item.orderQty }}</td>
                            <td class="num">{{ item.releaseQty }}</td>
                            <td class="num">{{ item.remainQty }}</td>
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
