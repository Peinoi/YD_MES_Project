<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const header = ref(null);
const items = ref([]);
const history = ref([]);
const loading = ref(false);
const errorMessage = ref('');

const unitOptions = {
    h1: 'kg',
    h2: 't',
    h3: 'L',
    h4: 'ea',
    h5: 'box',
    h6: 'g',
    h7: 'mm',
    h8: '%',
    h9: 'cm',
    ha: 'N'
};

function getUnitLabel(code) {
    return unitOptions[code] || code;
}

// 날짜 YYYY-MM-DD
function formatDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.toString().slice(0, 10);
}

// 숫자 천단위 콤마
function formatNumber(num) {
    if (num === null || num === undefined) return '';
    const n = Number(num);
    if (Number.isNaN(n)) return num;
    return n.toLocaleString();
}

async function fetchDetail() {
    const mprCode = route.params.mprCode;

    if (!mprCode) {
        errorMessage.value = '요청번호가 없습니다.';
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        const res = await axios.get(`/api/poder/mpr/detail/${mprCode}`);
        const data = res.data?.data;

        if (!data) {
            errorMessage.value = '요청서를 찾을 수 없습니다.';
            return;
        }

        header.value = data.header || null;
        items.value = data.items || [];
        history.value = data.history || [];
    } catch (err) {
        console.error(err);
        errorMessage.value = '요청서 상세 조회 중 오류가 발생했습니다.';
    } finally {
        loading.value = false;
    }
}

function goBack() {
    router.back();
}

onMounted(fetchDetail);
</script>

<template>
    <div class="inbound-container">
        <section class="detail-section">
            <!-- 상단 버튼 / 타이틀 -->
            <div class="detail-header">
                <button type="button" class="btn-outline" @click="goBack">← 목록으로</button>
            </div>

            <!-- 에러/로딩 -->
            <p v-if="loading" class="state-text">불러오는 중입니다...</p>
            <p v-else-if="errorMessage" class="state-text state-text--error">
                {{ errorMessage }}
            </p>

            <template v-else>
                <div class="card-block">
                    <div class="section-title-bar">
                        <span class="section-title">요청기본정보</span>
                    </div>

                    <table class="info-table">
                        <colgroup>
                            <col style="width: 15%" />
                            <col style="width: 35%" />
                            <col style="width: 15%" />
                            <col style="width: 35%" />
                        </colgroup>
                        <tbody>
                            <tr>
                                <th>요청번호</th>
                                <td>{{ header?.mprCode || '-' }}</td>
                                <th>요청일자</th>
                                <td>{{ formatDate(header?.reqDate) }}</td>
                            </tr>
                            <tr>
                                <th>요청자</th>
                                <td>{{ header?.requesterName || '-' }}</td>
                                <th>요청부서</th>
                                <td>{{ header?.deptName || '-' }}</td>
                            </tr>
                            <tr>
                                <th>현재상태</th>
                                <td colspan="3" v-if="history && history.length">
                                    {{ history[history.length - 1].statusName || '요청완료' }}
                                </td>

                                <td colspan="3" v-else>요청완료</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="card-block">
                    <div class="section-title-bar">
                        <span class="section-title">요청 자재 상세</span>
                    </div>

                    <table class="detail-table">
                        <thead>
                            <tr>
                                <th>제품명</th>
                                <th>자재코드</th>
                                <th class="text-right">수량</th>
                                <th>단위</th>
                                <th>공급업체</th>
                                <th>비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in items" :key="idx">
                                <td>{{ row.productName || row.matName || '-' }}</td>
                                <td>{{ row.matCode }}</td>
                                <td class="text-right">
                                    {{ formatNumber(row.reqQtt) }}
                                </td>
                                <td>{{ getUnitLabel(row.unit) }}</td>
                                <td>{{ row.clientName }}</td>
                                <td>{{ row.note }}</td>
                            </tr>
                            <tr v-if="!items.length">
                                <td colspan="6" class="empty-cell">등록된 자재 내역이 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="card-block">
                    <div class="section-title-bar">
                        <span class="section-title">상태 변경 이력</span>
                    </div>

                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>변경일시</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{ formatDate(header?.reqDate) }}</td>
                                <td>요청완료</td>
                            </tr>
                            <tr v-for="(row, idx) in history" :key="idx">
                                <td>{{ formatDate(row.changeDate) }}</td>
                                <td>{{ row.statusName }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </section>
    </div>
</template>

<style scoped>
.inbound-container {
    font-family: 'Pretendard', 'Inter', sans-serif;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    height: calc(100vh - 11.5rem);
}
.detail-section {
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
}

.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
}

.btn-outline {
    padding: 6px 14px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
}

.btn-outline:hover {
    background: #f6f6f6;
}

.state-text {
    margin-top: 12px;
    font-size: 14px;
    color: #666;
}

.state-text--error {
    color: #d64545;
}

/* 공통 카드 */
.card-block {
    background: #fff;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    padding: 0;
    margin-bottom: 18px;
    overflow: hidden;
}

/* 섹션 제목 바 (노란 선 느낌) */
.section-title-bar {
    padding: 10px 16px;
    border-bottom: 2px solid #f4b321;
    background: #fffaf0;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #444;
}

/* 기본정보 테이블 */
.info-table {
    width: 100%;
    border-collapse: collapse;
}

.info-table th,
.info-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
}

.info-table th {
    background: #fafafa;
    text-align: left;
    color: #555;
    font-weight: 600;
}

/* 자재 상세/이력 테이블 공통 */
.detail-table,
.history-table {
    width: 100%;
    border-collapse: collapse;
}

.detail-table th,
.detail-table td,
.history-table th,
.history-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
}

.detail-table thead th,
.history-table thead th {
    background: #faf7e8;
    text-align: left;
    color: #555;
    font-weight: 600;
}

.text-right {
    text-align: right;
}

.empty-cell {
    text-align: center;
    color: #888;
    padding: 14px 0;
}
</style>
