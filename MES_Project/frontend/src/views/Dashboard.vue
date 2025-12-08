<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import Tag from 'primevue/tag';
import Divider from 'primevue/divider';
import axios from 'axios';

const dailyTarget = ref(0);
const currentOutput = ref(0);
const achievementRate = ref(0);

const productionChartData = ref({});
const ramenChartData = ref({});
const oeeChartData = ref({});
const equipments = ref([]);
const alarms = ref([]); // 알림(발주서)
const unitMap = {
    h1: 'kg',
    h2: 't',
    h3: 'L',
    h4: 'ea',
    h5: 'box',
    h6: 'g',
    h7: 'mm',
    h8: '%',
    h9: 'cm',
    ha: 'N',
    hb: 'mg',
    hc: 'ml',
    hd: 'mg/g'
};
function getOrderSeverity(deadlineStr) {
    if (!deadlineStr) return 'info'; // 날짜 정보가 없으면 기본값

    // 1. 오늘 날짜를 "시, 분, 초" 없이 정규화 (오늘 00:00:00으로 설정)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. 납기일도 "시, 분, 초" 없이 정규화
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);

    // 3. 오늘과 납기일의 차이를 일(Day) 단위로 계산
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        // 납기 지남 (Overdue): 빨간색
        return 'danger';
    } else if (diffDays <= 3) {
        // 납기 3일 이내 (Due Soon): 주황색
        return 'warning';
    } else {
        // 정상 (Normal): 파란색
        return 'info';
    }
}
const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%'
};

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true }
    }
};
//날짜포맷
function formatDate(d) {
    return d ? d.split('T')[0] : '';
}

// -------------------------
// 1) 생산 데이터
// -------------------------

async function loadProduction() {
    const res = await axios.get('api/dashboard/production');
    dailyTarget.value = res.data.dailyTarget;
    currentOutput.value = res.data.currentOutput;

    achievementRate.value = Math.round((currentOutput.value / dailyTarget.value) * 100);

    productionChartData.value = {
        labels: ['달성량', '미달성'],
        datasets: [
            {
                data: [achievementRate.value, 100 - achievementRate.value],
                backgroundColor: ['#4f46e5', '#e5e7eb'],
                borderWidth: 0
            }
        ]
    };
}

// -------------------------
// 2) 라면 차트
// -------------------------
async function loadRamen() {
    const res = await axios.get('api/dashboard/ramen');
    ramenChartData.value = {
        labels: res.data.names,
        datasets: [
            {
                label: '생산량(EA)',
                data: res.data.values,
                backgroundColor: '#fbbf24',
                borderRadius: 6,
                barThickness: 22
            }
        ]
    };
}

// -------------------------
// 3) 설비 + OEE
// -------------------------
const totalOpTime = ref('00:00:00');

async function loadEquipments() {
    const res = await axios.get('api/dashboard/equipments');
    equipments.value = res.data;

    // 전체 / 가동 설비 수
    const total = res.data.length;
    const running = res.data.filter((e) => e.down_time === '00:00:00').length;
    const runningRate = Math.round((running / total) * 100);

    // ---- 총 가동시간 계산 ----
    let totalSec = 0;
    res.data.forEach((e) => {
        totalSec += convertStrToSec(e.op_time);
    });
    totalOpTime.value = secToHms(totalSec);

    // ---- 도넛 차트 설정 ----
    oeeChartData.value = {
        labels: ['가동', '정지'],
        datasets: [
            {
                data: [runningRate, 100 - runningRate],
                backgroundColor: ['#4f46e5', '#e5e7eb'],
                borderWidth: 0
            }
        ]
    };
}

function convertStrToSec(time) {
    if (!time) return 0;
    const t = time.split(':');
    return Number(t[0]) * 3600 + Number(t[1]) * 60 + Number(t[2]);
}

function secToHms(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// -------------------------
// 4) 발주서 알림 복원
// -------------------------
async function loadOrders() {
    const res = await axios.get('api/dashboard/order');
    alarms.value = res.data;
    console.log('발주서 알림 >>> ', res.data);
}

// -------------------------
// ⭐ 반드시 호출해야 함!!!
// -------------------------
onMounted(async () => {
    await Promise.all([
        loadProduction(),
        loadRamen(),
        loadEquipments(),
        loadOrders() // ← 반드시 추가해야 함
    ]);
});
</script>

<template>
    <div class="dashboard-grid">
        <!-- 1. 실시간 생산 현황 -->
        <Card class="dash-card">
            <template #title>실시간 생산 현황</template>
            <template #content>
                <div class="top-info">
                    <div>금일 생산 목표: {{ dailyTarget }} EA</div>
                    <div>현재 생산량: {{ currentOutput }} EA</div>
                </div>

                <div class="chart-box">
                    <Chart type="doughnut" :data="productionChartData" :options="doughnutOptions" />
                    <div class="chart-center">{{ achievementRate }}%</div>
                </div>
            </template>
        </Card>

        <!-- 2. 라면 종류별 생산량 -->
        <Card class="dash-card">
            <template #title>라면 종류별 생산량</template>
            <template #content>
                <div class="bar-chart-box">
                    <Chart type="bar" :data="ramenChartData" :options="barOptions" />
                </div>
            </template>
        </Card>

        <!-- 3. 설비 상태 / OEE -->
        <Card class="dash-card">
            <template #title>설비 가동 현황</template>
            <template #content>
                <div class="equip-list">
                    <div v-for="(eq, i) in equipments" :key="i" class="equip-row">
                        <span>{{ eq.po_name }}</span>
                        <Tag :severity="eq.down_time === '00:00:00' ? 'success' : 'danger'" :value="eq.down_time === '00:00:00' ? '가동' : '고장'" />
                    </div>
                </div>

                <Divider />

                <div class="chart-box small">
                    <Chart type="doughnut" :data="oeeChartData" :options="doughnutOptions" />
                    <div class="chart-center small">가동률</div>
                </div>
                <div class="total-op-time" align="center">총 가동시간: {{ totalOpTime }}</div>
            </template>
        </Card>

        <!-- 4. 알림(발주서) -->
        <Card class="dash-card">
            <template #title>발주리스트</template>
            <template #content>
                <div class="alarm-list order-card">
                    <div v-for="(a, i) in alarms" :key="i" class="order-item" :class="[getOrderSeverity(a.deadline) === 'danger' ? 'status-danger' : getOrderSeverity(a.deadline) === 'warning' ? 'status-warning' : 'status-info']">
                        <div class="order-icon">
                            <i class="pi pi-calendar"></i>
                        </div>

                        <div class="order-content">
                            <div class="order-title">{{ a.code }}</div>
                            <div class="order-sub">요청수량: **{{ a.qty }} {{ unitMap[a.unit] }}** | 자재: {{ a.material }} | 납기: {{ formatDate(a.deadline) }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
<style scoped>
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}

.dash-card {
    min-height: 280px;
}

.top-info {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 1rem;
}

.chart-box {
    position: relative;
    height: 180px;
}

.chart-box.small {
    height: 150px;
}

.chart-center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 700;
    pointer-events: none;
}

.chart-center.small {
    font-size: 1rem;
}

.bar-chart-box {
    height: 200px;
}

.equip-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    font-size: 0.85rem;
}

.equip-row {
    display: flex;
    justify-content: space-between;
}

.alarm-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 0.85rem;
}

.alarm-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.alarm-dot {
    width: 0.65rem;
    height: 0.65rem;
}

.alarm-type {
    font-weight: 700;
}
.order-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.order-item {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    transition: 0.15s ease;
}

/* ⚠️ 호버 색상 수정: 납기일 임박이나 지연 상태에서는 밝기만 조절하여 기본 호버 색상을 피함 */
.order-item:hover {
    /* filter: brightness(0.95); 이나, 기존 코드의 #eef2ff 를 유지 */
    background: #eef2ff;
    border-color: #c7d2fe;
}

.order-icon {
    /* ⚠️ 기본 색상 제거 (아래 동적 클래스에서 설정) */
    /* background: #e0e7ff; */
    /* color: #4338ca; */
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
}

.order-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.order-title {
    font-weight: 600;
    font-size: 0.9rem;
}

.order-sub {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.3;
}

/* ---------------------------------- */
/* 💡 발주 리스트 동적 상태 스타일 (요청에 맞게 수정) */
/* ---------------------------------- */

/* 1. 납기 많이 남음: 초록색 (status-info) */
.order-item.status-info {
    background: #ecfdf5; /* 연한 초록색 배경 */
    border-color: #10b981; /* 초록색 테두리 */
}
.order-item.status-info .order-icon {
    background: #10b981; /* 아이콘 배경색 */
    color: #ffffff; /* 아이콘 색상 (흰색) */
}

/* 2. 납기 3일 이내: 빨간색 (status-warning) */
.order-item.status-warning {
    background: #fdecea; /* 연한 빨간색 배경 */
    border-color: #ef4444; /* 빨간색 테두리 */
}
.order-item.status-warning .order-icon {
    background: #ef4444; /* 아이콘 배경색 */
    color: #ffffff; /* 아이콘 색상 (흰색) */
}

/* 3. 납기 지남: 평범한 색/회색 (status-danger) */
.order-item.status-danger {
    background: #f5f5f5; /* 연한 회색 배경 */
    border-color: #d4d4d4; /* 회색 테두리 */
}
.order-item.status-danger .order-icon {
    background: #d4d4d4; /* 아이콘 배경색 */
    color: #525252; /* 아이콘 색상 (어두운 회색) */
}

@media (max-width: 1024px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}
</style>
