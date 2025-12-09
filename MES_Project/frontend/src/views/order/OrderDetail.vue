<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

/* ===========================
 * 라우터 파라미터 / 기본 상태
 * =========================== */
const route = useRoute();
const router = useRouter();

const order = ref({});
const detailList = ref([]);
const loading = ref(false); // 로딩 상태 추가

/* ===========================
 * 유틸리티 함수
 * =========================== */
// 날짜 포맷 함수 (YYYY-MM-DD -> YYYY.MM.DD)
function formatDate(dateStr) {
    if (!dateStr) return '';
    // YYYY-MM-DDTHH:mm:ss 형태에서 T 이후를 제거하고 .으로 대체
    return String(dateStr).split('T')[0].replace(/-/g, '.');
}

// 금액/수량 포맷 함수 (천단위 구분자)
function formatNumber(n) {
    if (n === null || n === undefined || n === '') return 0;
    const num = Number(n);
    if (isNaN(num)) return n;
    return num.toLocaleString();
}

// 목록으로 돌아가기
function goBack() {
    router.push('/order/list');
}

/* ===========================
 * 데이터 조회
 * =========================== */
onMounted(async () => {
    loading.value = true;
    const ordCode = route.params.ordCode;

    try {
        // 기존 로직 유지
        const res = await axios.get(`/api/order/${ordCode}`);
        const list = res.data.data;

        if (list && list.length > 0) {
            order.value = list[0]; // 헤더 정보
            detailList.value = list; // 상세 품목 리스트
        } else {
            order.value = {};
            detailList.value = [];
        }
    } catch (error) {
        console.error('주문 상세 조회 실패:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="forward-detail-page">
        <div class="detail-header">
            <button class="btn btn-black" @click="goBack">← 주문목록으로</button>

            <div class="detail-title-wrap">
                <h2 class="detail-title">주문 상세</h2>
                <p class="detail-sub" v-if="order.ord_code">주문번호 {{ order.ord_code }}</p>
            </div>
        </div>

        <section v-if="loading" class="detail-body">
            <div class="loading-box">데이터를 불러오는 중입니다...</div>
        </section>

        <section v-else class="detail-body">
            <div class="top-info-grid">
                <section class="detail-card full-width">
                    <h3 class="section-title">주문 정보</h3>

                    <div class="info-grid two-columns">
                        <div class="info-row">
                            <span class="info-label">주문번호</span>
                            <span class="info-value">{{ order.ord_code }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">주문명</span>
                            <span class="info-value">{{ order.ord_name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">주문일자</span>
                            <span class="info-value">{{ formatDate(order.ord_date) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">상태</span>
                            <span class="info-value">{{ order.ord_stat_name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">거래처</span>
                            <span class="info-value">{{ order.client_name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">거래처 담당자</span>
                            <span class="info-value">{{ order.emp_name }}</span>
                        </div>
                    </div>

                    <div class="remark-block inside-remark">
                        <h4 class="remark-title">비고</h4>
                        <div class="remark-box">
                            {{ order.note || '비고 사항이 없습니다.' }}
                        </div>
                    </div>
                </section>
            </div>

            <section class="detail-card detail-products-card">
                <div class="products-header">
                    <h3 class="section-title">제품 정보</h3>
                    <div class="products-summary">총 제품 {{ detailList.length }}건</div>
                </div>

                <div class="table-wrap">
                    <table class="detail-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>주문상세코드</th>
                                <th>제품명</th>
                                <th>유형</th>
                                <th>규격</th>
                                <th>단위</th>
                                <th>수량</th>
                                <th>단가</th>
                                <th>총액</th>
                                <th>납기일</th>
                                <th>우선순위</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-if="!detailList.length">
                                <td colspan="11" class="empty-row">상세 품목 내역이 없습니다.</td>
                            </tr>

                            <tr v-for="(item, index) in detailList" :key="item.ord_d_code">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.ord_d_code }}</td>
                                <td class="text-left">{{ item.prod_name }}</td>
                                <td>{{ item.com_value_name }}</td>
                                <td>{{ item.spec_name }}</td>
                                <td>{{ item.unit_name }}</td>
                                <td class="text-right">{{ formatNumber(item.ord_amount) }}</td>
                                <td class="text-right">{{ formatNumber(item.prod_price) }}<span class="unit-won">원</span></td>

                                <td class="text-right">{{ formatNumber(item.total_price) }}<span class="unit-won">원</span></td>

                                <td>{{ formatDate(item.delivery_date) }}</td>
                                <td>{{ item.ord_priority }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    </div>
</template>

<style scoped>
/* ---------------------------------------------------------------------- */
/* 폰트 및 박스 모델 초기화 (기존 디자인 CSS에서 가져옴) */
/* ---------------------------------------------------------------------- */
* {
    font-size: 14px;
    box-sizing: border-box;
}

/* ---------------------------------------------------------------------- */
/* ▶ 페이지 레이아웃 (Flexbox 기반 높이 계산) */
/* ---------------------------------------------------------------------- */
.forward-detail-page {
    padding: 2rem;
    background: #f5f6fa;
    height: 100%; /* 페이지 전체 높이 사용 */
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow: hidden; /* ✅ 페이지 전체 스크롤 제거 */
}

/* 상단 헤더 */
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0; /* 헤더 영역은 고정 높이 */
}

.detail-title-wrap {
    text-align: right;
}

.detail-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.detail-sub {
    margin: 0;
    font-size: 12px;
    color: #6b7280;
}

/* 버튼 */
.btn {
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    font-weight: 500;
}

.btn-black {
    background: #111827;
    color: white;
}

/* 본문 영역 */
.detail-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    flex: 1; /* ✅ 남은 높이 전부 사용 */
    min-height: 0; /* 내부 스크롤용 필수 */
    overflow-y: auto; /* 만약 카드/테이블 높이가 페이지를 초과하면 여기서 스크롤 처리 */
    overflow-x: hidden;
    padding-right: 0.5rem; /* 스크롤바 공간 확보 */
}

.loading-box {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
}

/* 상단 정보 카드 (주문 정보) */
.top-info-grid {
    /* 주문 상세에서는 1열만 사용하며, 나중에 2열 정보가 필요할 경우 수정 가능하도록 클래스 유지 */
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
    flex-shrink: 0;
}

/* 카드 */
.detail-card {
    background: #fff;
    padding: 1.25rem;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 타이틀 */
.section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

/* 정보 그리드 */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem 1rem;
}

.info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-label {
    font-size: 12px;
    width: 90px; /* 라벨 너비 조정 */
    color: #6b7280;
    font-weight: 500;
    flex-shrink: 0;
}

.info-value {
    font-size: 14px;
    font-weight: 500;
    word-break: break-all;
}

/* 비고 */
.inside-remark {
    margin-top: 1.25rem;
    border-top: 1px dashed #e5e7eb;
    padding-top: 1.25rem;
}

.remark-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.remark-box {
    background: #f9fafb;
    border-radius: 4px;
    padding: 0.75rem;
    min-height: 80px;
    white-space: pre-wrap;
    font-size: 13px;
    color: #111827;
}

/* ---------------------------------------------------------------------- */
/* 🔑 ▶ 상세 품목 테이블 영역 (스크롤) */
/* ---------------------------------------------------------------------- */
.detail-products-card {
    flex: 1; /* ✅ 남은 높이 모두 차지하도록 */
    display: flex;
    flex-direction: column;
    min-height: 0; /* 내부 .table-wrap 스크롤 위해 필수 */
}

.products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-shrink: 0;
}

.products-summary {
    font-size: 12px;
    color: #6b7280;
}

/* 테이블 래퍼: 여기서 스크롤 처리 */
.table-wrap {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto; /* ✅ 내용 많으면 여기서만 스크롤 */
    min-height: 0;
}

.detail-table {
    width: 100%;
    min-width: 1200px; /* 테이블 최소 너비 지정 */
    table-layout: fixed;
    border-collapse: collapse;
}

.detail-table th,
.detail-table td {
    border: 1px solid #e5e7eb;
    padding: 12px 14px;
    text-align: center;
    font-size: 13px; /* 테이블 셀 폰트 크기 조정 */
}

.detail-table th {
    background: #f3f4f6;
    font-weight: 600;
    white-space: nowrap;
}

.detail-table td {
    background: #fff;
    white-space: nowrap;
}

.detail-table th:nth-child(1) {
    width: 50px;
} /* No */
.detail-table th:nth-child(2) {
    width: 140px;
} /* 주문상세코드 */
.detail-table th:nth-child(3) {
    width: 180px;
} /* 제품명 */
.detail-table th:nth-child(4) {
    width: 100px;
} /* 유형 */
.detail-table th:nth-child(5) {
    width: 80px;
} /* 규격 */
.detail-table th:nth-child(6) {
    width: 60px;
} /* 단위 */
.detail-table th:nth-child(7) {
    width: 80px;
} /* 수량 */
.detail-table th:nth-child(8) {
    width: 100px;
} /* 단가 */
.detail-table th:nth-child(9) {
    width: 110px;
} /* 총액 */
.detail-table th:nth-child(10) {
    width: 110px;
} /* 납기일 */
.detail-table th:nth-child(11) {
    width: 80px;
} /* 우선순위 */

.text-left {
    text-align: left;
}

.text-right {
    text-align: right;
}

.empty-row {
    text-align: center;
    color: #888;
    padding: 20px;
}

.unit-won {
    margin-left: 2px;
}

/* ---------------------------------------------------------------------- */
/* 반응형 */
/* ---------------------------------------------------------------------- */
@media (max-width: 900px) {
    .forward-detail-page {
        padding: 1rem;
    }

    .info-grid {
        /* 화면이 좁아지면 1열로 변경 */
        grid-template-columns: 1fr;
    }

    .detail-body {
        overflow-y: auto; /* 모바일에서 전체 스크롤 허용 */
    }
}
</style>
