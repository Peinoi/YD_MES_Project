<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

/* ===========================
 *  라우터 파라미터 / 기본 상태
 * =========================== */
const route = useRoute();
const router = useRouter();

// /release/forwarding/:releaseCode 이런 식으로 들어온다고 가정
const releaseCode = route.params.releaseCode || '';

const loading = ref(false);
const errorMessage = ref('');

/* ===========================
 *  공통코드 맵 (단위/규격/유형)
 * =========================== */
const unitMap = ref({});
const specMap = ref({});
const typeMap = ref({});

/* ===========================
 *  헤더 + 라인 데이터
 * =========================== */
const header = reactive({
    releaseCode: '',
    releaseDate: '',
    orderCode: '',
    orderDate: '',
    client: '',
    remark: '',
    registrantCode: '',
    registrantName: '',
    status: '',
    orderManagerCode: '',
    orderManagerName: ''
});

const lines = ref([]);

/* ===========================
 *  유틸
 * =========================== */
const formatDate = (d) => {
    if (!d) return '';
    return String(d).split('T')[0];
};

// 합계
const totalOrderQty = computed(() => lines.value.reduce((sum, l) => sum + (l.orderQty || 0), 0));
const totalReleaseQty = computed(() => lines.value.reduce((sum, l) => sum + (l.releaseQty || 0), 0));

// 🔹 미출고수량 = 총 주문수량 - 총 출고수량
const remainingQty = computed(() => Math.max(0, totalOrderQty.value - totalReleaseQty.value));

// 🔹 상태: 미출고수량이 0이면 출고완료, 아니면 요청
const detailStatus = computed(() => (remainingQty.value <= 0 ? '출고완료' : '요청'));

/* ===========================
 *  공통코드 조회
 * =========================== */
const fetchCommonCodes = async () => {
    try {
        const res = await axios.get('/api/release/fwd/codes');
        console.log('[ForwardingDetail] 공통코드 응답:', res.data);

        if (res.data?.status === 'success' && res.data.data) {
            const { unitMap: u, specMap: s, typeMap: t } = res.data.data;
            unitMap.value = u || {};
            specMap.value = s || {};
            typeMap.value = t || {};
        } else {
            unitMap.value = {};
            specMap.value = {};
            typeMap.value = {};
        }
    } catch (err) {
        console.error('[ForwardingDetail] 공통코드 조회 실패:', err);
        unitMap.value = {};
        specMap.value = {};
        typeMap.value = {};
    }
};

/* ===========================
 *  출고요청 상세 조회
 *   GET /api/release/fwd/:releaseCode
 * =========================== */
const fetchDetail = async () => {
    if (!releaseCode) {
        errorMessage.value = '출고번호가 없습니다.';
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        const res = await axios.get(`/api/release/fwd/${releaseCode}`);
        console.log('[ForwardingDetail] 상세 응답:', res.data);

        if (res.data?.status !== 'success' || !res.data.data) {
            errorMessage.value = '출고요청 상세 데이터를 찾을 수 없습니다.';
            return;
        }

        const { header: h, lines: lineRows } = res.data.data;

        header.releaseCode = h.releaseCode;
        header.releaseDate = formatDate(h.releaseDate);
        header.orderCode = h.orderCode;
        header.orderDate = h.orderDate ? formatDate(h.orderDate) : '';
        header.client = h.client;
        header.remark = h.remark ?? '';
        header.registrantCode = h.registrantCode || '';
        header.registrantName = h.registrantName || '';
        header.status = h.status || '';
        header.orderManagerCode = h.orderManagerCode || '';
        header.orderManagerName = h.orderManagerName || '';

        lines.value = (lineRows || []).map((r, idx) => ({
            no: idx + 1,
            productCode: r.productCode,
            productName: r.productName,
            type: r.type, // 공통코드 맵으로 한글변환
            spec: r.spec,
            unit: r.unit,
            orderQty: r.orderQty,
            releaseQty: r.releaseQty,
            notReleasedQty: Math.max(0, (r.orderQty || 0) - (r.releaseQty || 0)),
            stockQty: r.stockQty ?? r.currentStock ?? 0,
            dueDate: r.dueDate ? formatDate(r.dueDate) : ''
        }));
    } catch (err) {
        console.error('[ForwardingDetail] 상세 조회 실패:', err);
        errorMessage.value = '출고요청 상세 조회 중 오류가 발생했습니다.';
    } finally {
        loading.value = false;
    }
};

/* ===========================
 *  액션
 * =========================== */
const goBack = () => {
    router.back();
};

onMounted(async () => {
    await fetchCommonCodes();
    await fetchDetail();
});
</script>

<template>
    <div class="forward-detail-page">
        <!-- 상단 -->
        <div class="detail-header">
            <button class="btn btn-black" @click="goBack">← 출고조회로</button>

            <div class="detail-title-wrap">
                <h2 class="detail-title">출고요청 상세</h2>
                <p class="detail-sub" v-if="header.releaseCode">출고번호 {{ header.releaseCode }}</p>
            </div>
        </div>

        <!-- 오류 -->
        <section v-if="errorMessage" class="detail-card error-card">
            {{ errorMessage }}
        </section>

        <section v-else class="detail-body">
            <!-- 주문 / 출고 정보 2열 -->
            <div class="top-info-grid">
                <!-- 주문정보 -->
                <section class="detail-card">
                    <h3 class="section-title">주문정보</h3>

                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">주문번호</span>
                            <span class="info-value">{{ header.orderCode }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">주문일자</span>
                            <span class="info-value">{{ header.orderDate }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">거래처</span>
                            <span class="info-value">{{ header.client }}</span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">거래처담당자</span>
                            <span class="info-value">
                                {{ header.orderManagerName || header.orderManagerCode }}
                            </span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">총 주문수량</span>
                            <span class="info-value">{{ totalOrderQty.toLocaleString() }}개</span>
                        </div>
                    </div>

                    <!-- 🔹 주문 비고 -->
                    <div class="remark-block inside-remark">
                        <h4 class="remark-title">주문 비고</h4>
                        <div class="remark-box">
                            {{ header.orderRemark || '주문 비고가 없습니다.' }}
                        </div>
                    </div>
                </section>

                <!-- 출고정보 -->
                <section class="detail-card">
                    <h3 class="section-title">출고요청정보</h3>

                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">출고번호</span>
                            <span class="info-value">{{ header.releaseCode }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">출고요청일</span>
                            <span class="info-value">{{ header.releaseDate }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">등록자</span>
                            <span class="info-value">
                                {{ header.registrantName || header.registrantCode }}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">상태</span>
                            <span class="info-value">
                                {{ detailStatus }}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">총 출고수량</span>
                            <span class="info-value">{{ totalReleaseQty.toLocaleString() }}개</span>
                        </div>
                    </div>

                    <!-- 🔹 출고 비고 -->
                    <div class="remark-block inside-remark">
                        <h4 class="remark-title">출고 비고</h4>
                        <div class="remark-box">
                            {{ header.remark || '출고 비고가 없습니다.' }}
                        </div>
                    </div>
                </section>
            </div>

            <!-- 제품 테이블 -->
            <section class="detail-card detail-products-card">
                <div class="products-header">
                    <h3 class="section-title">제품 내역</h3>
                    <div class="products-summary">제품 {{ lines.length }}건 · 주문 {{ totalOrderQty.toLocaleString() }}개 · 출고 {{ totalReleaseQty.toLocaleString() }}개</div>
                </div>

                <div class="table-wrap">
                    <table class="detail-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>제품코드</th>
                                <th>제품명</th>
                                <th>유형</th>
                                <th>규격</th>
                                <th>단위</th>
                                <th>주문수량</th>
                                <th>출고수량</th>
                                <th>미출고수량</th>
                                <th>출고 후 재고</th>
                                <th>납기일</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-if="!lines.length">
                                <td colspan="10" class="empty-row">제품 내역이 없습니다.</td>
                            </tr>

                            <tr v-for="item in lines" :key="item.no">
                                <td>{{ item.no }}</td>
                                <td>{{ item.productCode }}</td>
                                <td class="text-left">{{ item.productName }}</td>
                                <td>{{ typeMap[item.type] ?? item.type }}</td>
                                <td>{{ specMap[item.spec] ?? item.spec }}</td>
                                <td>{{ unitMap[item.unit] ?? item.unit }}</td>
                                <td class="text-right">{{ item.orderQty }}</td>
                                <td class="text-right">{{ item.releaseQty }}</td>
                                <td class="text-right">
                                    {{ item.notReleasedQty }}
                                </td>
                                <td class="text-right">
                                    {{ Math.max(0, (item.stockQty || 0) - (item.releaseQty || 0)) }}
                                </td>
                                <td>{{ item.dueDate }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>

        <div class="loading-overlay" v-if="loading">조회 중...</div>
    </div>
</template>

<style scoped>
* {
    font-size: 14px;
    box-sizing: border-box;
}

/* 전체 페이지 */
.forward-detail-page {
    padding: 2rem;
    background: #f5f6fa;

    /* 🔹 전체 스크롤 막고, 내부 카드에서만 스크롤 */
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden; /* ✅ 페이지 전체 스크롤 제거 */
}

/* 상단 헤더 */
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    /* 헤더 영역은 고정 영역 */
    flex-shrink: 0;
}

.detail-title {
    font-size: 18px;
    font-weight: 600;
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
}

.btn-black {
    background: #111827;
    color: white;
}

/* 본문 */
.detail-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    /* 🔹 남은 높이 전부 사용 */
    flex: 1;
    min-height: 0; /* ✅ 내부 스크롤용 필수 */
}

/* 상단 2열 카드 */
.top-info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;

    /* 🔹 이 블럭은 내용 높이만큼만 차지하고, 테이블 영역이 스크롤 */
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
    width: 80px;
    color: #6b7280;
}

.info-value {
    font-size: 14px;
    font-weight: 500;
}

/* 카드 내부 비고 */
.inside-remark {
    margin-top: 1.25rem;
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

/* 제품 테이블 카드 */
.detail-products-card {
    background: #fff;
    padding: 1.25rem;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    /* 🔹 남은 높이 모두 차지하도록 */
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; /* ✅ 내부 .table-wrap 스크롤 위해 필수 */
}

.products-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    flex-shrink: 0;
}

/* 🔹 테이블 래퍼: 여기만 세로 스크롤 */
.table-wrap {
    flex: 1;
    overflow-x: auto;
    overflow-y: auto; /* ✅ 내용 많으면 여기서만 스크롤 */
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
}

.detail-table th,
.detail-table td {
    border: 1px solid #e5e7eb;
    padding: 8px 10px;
    text-align: center;
}

.detail-table th {
    background: #f3f4f6;
    font-weight: 600;
}

.text-left {
    text-align: left;
}

.text-right {
    text-align: right;
}

.empty-row {
    text-align: center;
    color: #888;
}

/* 로딩 */
.loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 16px;
}

/* 반응형 */
@media (max-width: 900px) {
    .forward-detail-page {
        padding: 1rem;
    }

    .top-info-grid {
        grid-template-columns: 1fr;
    }
}
</style>
