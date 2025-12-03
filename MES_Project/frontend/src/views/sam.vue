<!-- src/views/release/ForwardingManagement.vue -->
<script setup>
import { reactive, ref } from 'vue';

const basicInfo = reactive({
    releaseCode: '',
    orderCode: '',
    releaseDate: '',
    orderDate: '',
    client: '',
    registrant: 'EMP-10001',
    remark: ''
});

// 제품 리스트 (지금은 비워두고, 나중에 API 연동 예정)
const products = ref([
    // 예시가 필요하면 이런 식으로:
    // {
    //   name: "제품A",
    //   type: "완제품",
    //   spec: "10kg",
    //   unit: "BOX",
    //   orderQty: 100,
    //   releaseQty: 40,
    //   remainQty: 60,
    //   stockQty: 200,
    //   dueDate: "2025-12-31",
    // },
]);

const onDelete = () => {
    // TODO: 삭제 로직
    console.log('삭제 클릭');
};

const onReset = () => {
    basicInfo.releaseCode = '';
    basicInfo.orderCode = '';
    basicInfo.releaseDate = '';
    basicInfo.orderDate = '';
    basicInfo.client = '';
    basicInfo.remark = '';
    // products.value = []; // 필요하면 제품도 초기화
    console.log('초기화 클릭');
};

const onSave = () => {
    // TODO: 저장 로직
    console.log('저장 클릭', { basicInfo, products: products.value });
};

const onLoadOrder = () => {
    // TODO: 주문정보 불러오기 (모달 or 검색)
    console.log('주문정보 불러오기 클릭');
};

const onLoadRelease = () => {
    // TODO: 출고정보 불러오기 (모달 or 검색)
    console.log('출고정보 불러오기 클릭');
};
</script>

<template>
    <div class="forward-page">
        <!-- 상단 타이틀 + 버튼 -->
        <div class="forward-header">
            <h2 class="forward-title">출고 관리</h2>

            <div class="forward-actions">
                <button class="btn btn-red" @click="onDelete">삭제</button>
                <button class="btn btn-black" @click="onReset">초기화</button>
                <button class="btn btn-blue" @click="onSave">저장</button>
                <button class="btn btn-outline-green" @click="onLoadOrder">주문정보 불러오기</button>
                <button class="btn btn-outline-green" @click="onLoadRelease">출고정보 불러오기</button>
            </div>
        </div>

        <!-- 기본정보 영역 -->
        <section class="forward-card">
            <h3 class="section-title">기본정보</h3>

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

        <!-- 제품 영역 -->
        <section class="forward-card">
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
.forward-page {
    padding: 2rem;
}

.forward-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.forward-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
}

.forward-actions {
    display: flex;
    gap: 0.5rem;
}

.btn {
    border: none;
    padding: 0.45rem 0.9rem;
    border-radius: 4px;
    font-size: 0.85rem;
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

.section-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
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
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
    color: #555;
}

.form-input,
.form-textarea {
    border: 1px solid #d0d7e2;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
    outline: none;
}

.form-input:focus,
.form-textarea:focus {
    border-color: #1976d2;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
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
