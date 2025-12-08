<script setup>
// Productionwork.vue
import { onBeforeMount, ref, computed } from 'vue';
import axios from 'axios';
import { useWorkStore } from '@/stores/workStore.js';
import { useRouter } from 'vue-router';
const router = useRouter();
const workStore = useWorkStore();
const workInfo = computed(() => workStore.selectedWork);
let workList = ref([]);
const getWorkList = async () => {
    if (!workInfo.value || !workInfo.value.prdrcode) {
        console.error('필요한 작업 코드(prdrcode)가 없습니다:', workInfo.value);
        return;
    }

    const result = await axios.get(`/api/work/list/${workInfo.value.prdrcode}`);
    workList.value = result.data.data.result;
};
const goList = () => {
    router.push('TaskProgressList');
};

const goIrregularWork = () => {
    router.push('IrregularWorkProgress');
};

const getProgressText = (process) => {
    // 진행률이 0이면 '대기중'을 표시
    if (process['진행률'] === 0) {
        return '대기중';
    }
    // 0이 아니면 진행률에 '%'를 붙여 표시
    return `${process['진행률']}%`;
};
/*
 데이터 포맷팅 (숫자 + '개')
 */
const formatQuantity = (value) => {
    return value ? `${value}(개)` : '';
};
const formatDate = (dateString) => {
    if (!dateString) return '';

    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');

    return `${y}-${m}-${day} ${hh}:${mm}`;
};
onBeforeMount(() => {
    workStore.restoreSelectedWork(); // 새로고침 대응
    getWorkList();
});
</script>
<template>
    <div id="container" class="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div class="md:w-1/2 mb-6">
            <div class="card flex flex-col gap-2 p-4 border border-gray-200 rounded-lg shadow-md bg-white">
                <h2 class="text-xl font-semibold mb-2 text-gray-700">작업 지시 정보</h2>
                <button class="btn-action bg-blue-500 text-white" @click="goList()">작업 진행 목록</button>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label for="code" class="text-xs font-medium text-gray-500">작업지시코드</label>
                        <InputText id="code" type="text" readonly="true" :value="`${workInfo.code}`" class="p-2 border rounded-md bg-gray-50 text-sm" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label for="name" class="text-xs font-medium text-gray-500">제품명</label>
                        <InputText id="name" type="text" readonly="true" :value="`${workInfo.name}`" class="p-2 border rounded-md bg-gray-50 text-sm" />
                    </div>
                    <div class="flex flex-col gap-1 col-span-2">
                        <label for="line" class="text-xs font-medium text-gray-500">라인</label>
                        <InputText id="line" type="text" readonly="true" :value="`${workInfo.line}`" class="p-2 border rounded-md bg-gray-50 text-sm" />
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div class="process-header bg-[#3a3535] text-white font-bold text-sm">
                <div class="header-item">공정명</div>
                <div class="header-item">진행률</div>
                <div class="header-item">설비</div>
                <div class="header-item">시작일시</div>
                <div class="header-item">종료일시</div>
                <div class="header-item text-right">지시량</div>
                <div class="header-item text-right">불량</div>
                <div class="header-item text-right">생산량</div>
            </div>

            <div v-for="process in workList" :key="process.prdr_d_code" class="process-card text-gray-800 text-sm">
                <div class="process-detail font-medium">{{ process['공정명'] }}</div>

                <div class="process-detail progress-cell">
                    <div class="progress-wrap">
                        <div :class="['progress-track', { 'track-green': process['진행률'] === 100 }, { 'track-yellow': process['진행률'] > 0 && process['진행률'] < 100 }, { 'track-gray': process['진행률'] === 0 }]">
                            <div
                                class="progress-bar"
                                :class="{ 'bg-green-500': process['진행률'] === 100, 'bg-yellow-500': process['진행률'] > 0 && process['진행률'] < 100 }"
                                :style="{ width: process['진행률'] > 0 ? process['진행률'] + '%' : '0%' }"
                            ></div>
                        </div>
                        <span class="progress-text font-bold" :class="{ 'text-gray-500': process['진행률'] === 0 }">
                            {{ getProgressText(process) }}
                        </span>
                    </div>
                </div>
                <div id="eq-box" @click="goIrregularWork()" class="process-detail text-gray-600 font-light">{{ process['설비코드'] }} - {{ process['설비'] }}</div>

                <div class="process-detail text-center">{{ formatDate(process['시작일시'] || '') }}</div>

                <div class="process-detail text-center">{{ formatDate(process['종료일시'] || '') }}</div>

                <div class="process-detail text-right">{{ formatQuantity(process['지시량']) }}</div>

                <div class="process-detail text-right text-red-600">{{ formatQuantity(process['불량']) }}</div>

                <div class="process-detail text-right font-medium text-blue-600">{{ formatQuantity(process['생산량']) }}</div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
/* 🎨 Tailwind CSS 사용을 전제로 커스텀 스타일 정의 */

/* CSS Grid를 이용한 공통 레이아웃 정의 */
/* 이미지에 맞게 8개의 컬럼 비율 조정 (공정명 1.2fr, 진행률 2.5fr, 설비 1.5fr, 시간 1fr x 2, 수량 1fr x 3) */
$grid-layout: 1.2fr 2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr;

.process-header,
.process-card {
    display: grid;
    /* 8개의 컬럼 비율 조정 */
    grid-template-columns: $grid-layout;
    align-items: center;
    padding: 12px 16px;
    gap: 8px; /* 컬럼 간 간격 */
}

/* 헤더 스타일 */
.process-header {
    font-size: 0.9rem;
    // 헤더의 배경색을 이미지와 유사하게 어두운 색으로 설정
    background-color: #5d4037; /* 다크 브라운 계열 */
    color: white;
}

/* 개별 카드 스타일 */
.process-card {
    border-bottom: 1px solid #e5e7eb; // border-gray-200
    transition: background-color 0.2s;

    // 첫 번째와 두 번째 공정의 색상을 이미지처럼 다르게 설정 (선택 사항)
    &:nth-child(2) {
        background-color: #fcfcfc;
    }
    &:nth-child(3) {
        background-color: #fdfdfd;
    }

    &:last-child {
        border-bottom: none;
    }
}

/* 셀 내부 상세 항목 스타일 */
.process-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 진행률 셀 내부 스타일 */
.progress-cell {
    padding: 0 5px; /* 양옆 패딩 줄이기 */
}

.progress-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 30px; /* 전체 진행률 랩퍼 높이 */
}

/* 진행률 트랙 (배경) 스타일 */
.progress-track {
    border-radius: 4px;
    flex-grow: 1;
    height: 18px;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 0; // 진행바를 위한 내부 패딩 제거
}

/* 조건 5: 진행률 트랙 배경색 정의 */
.track-green {
    background-color: #d1e7dd; /* 연한 녹색 배경 */
}

.track-yellow {
    background-color: #ffeccf; /* 이미지 숙성 공정의 연한 노란색 배경과 유사 */
}

.track-gray {
    background-color: #e5e7eb; /* 연한 회색 배경 (대기중) */
}

/* 조건 5: 진행률 Bar (Fill) 스타일 */
.progress-bar {
    height: 100%;
    transition: width 0.4s ease-out; /* 부드러운 애니메이션 효과 */
    // Tailwind 클래스(.bg-green-500, .bg-yellow-500)가 우선 적용됨
}

/* 진행률 텍스트 스타일 */
.progress-text {
    min-width: 45px; /* 텍스트 공간 확보 */
    font-size: 0.85rem;
    text-align: right;
}

/* 항목별 정렬 (Header/Detail 공통) */
.header-item:nth-child(4),
.header-item:nth-child(5),
.process-detail:nth-child(4),
.process-detail:nth-child(5) {
    text-align: center;
}

.header-item:nth-child(6),
.header-item:nth-child(7),
.header-item:nth-child(8),
.process-detail:nth-child(6),
.process-detail:nth-child(7),
.process-detail:nth-child(8) {
    text-align: right;
}

#eq-box {
    background-color: rgb(172, 170, 170);
    border-radius: 5px;
    padding: 5px;
    color: black;
    font-weight: bold;
    font-size: 13px;
    text-align: center;
}
button {
    width: 150px;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
}
/* ------------------------------------------------ */
/* 조건 2 & 3: input[type="range"]를 사용하지 않고 div/span으로 진행률 바를 구현했으므로, 
   만약 input[type="range"]를 사용한다면 아래 코드를 추가하여 핸들을 제거할 수 있습니다. 
   현재는 Range 대신 Div를 사용하여 핸들 제거 코드가 불필요합니다.
/* ------------------------------------------------ */
</style>
