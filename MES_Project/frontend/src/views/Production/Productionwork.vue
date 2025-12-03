<script setup>
import { onBeforeMount, ref, computed } from 'vue';

const processes = ref([
    { id: 1, name: '반죽', progress: 100, equipment: 'EQ001 - 배합기', startTime: '25.05.30 -12:00', endTime: '25.05.30 -18:00', instructed: 10000, defect: 100, produced: 9900, statusColor: 'green' },
    { id: 2, name: '숙성', progress: 80, equipment: 'EQ003 - 숙성기', startTime: '14:00', endTime: '19:00', instructed: 9900, defect: 200, produced: 7800, statusColor: 'green' },
    { id: 1, name: '반죽', progress: 100, equipment: 'EQ001 - 배합기', startTime: '25.05.30 -12:00', endTime: '25.05.30 -18:00', instructed: 10000, defect: 100, produced: 9900, statusColor: 'green' }
]);

/**
 * 진행률 텍스트 (e.g., '100%' 또는 '대기중')를 계산하는 함수
 */
const getProgressText = (process) => {
    return process.progress === 0 && process.displayStatus ? process.displayStatus : `${process.progress}%`;
};

/**
 * 데이터 포맷팅 (숫자 + '개')
 */
const formatQuantity = (value) => {
    return value ? `${value}(개)` : '';
};
</script>

<template>
    <div id="container" class="p-4 md:p-8">
        <!-- 상단 정보 영역 (기존 유지) -->
        <div class="md:w-1/2 mb-6">
            <div class="card flex flex-col gap-2 p-4 border border-gray-200 rounded-lg shadow-sm">
                <h2 class="text-xl font-semibold mb-2 text-gray-700">작업 지시 정보</h2>
                <div class="flex flex-col gap-2">
                    <label for="name1" class="text-sm font-medium text-gray-500">작업지시코드</label>
                    <InputText id="name1" type="text" readonly="true" value="WO-20250530-001" class="p-2 border rounded-md bg-gray-50" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="email1" class="text-sm font-medium text-gray-500">제품명</label>
                    <InputText id="email1" type="text" readonly="true" value="맛있는 과자 A" class="p-2 border rounded-md bg-gray-50" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="age1" class="text-sm font-medium text-gray-500">라인</label>
                    <InputText id="age1" type="text" readonly="true" value="Line A-01" class="p-2 border rounded-md bg-gray-50" />
                </div>
            </div>
        </div>

        <!-- 생산 공정 진행 상태 리스트 (이미지 기반 재구성) -->
        <div class="process-list-container shadow-xl rounded-lg overflow-hidden border border-gray-200">
            <!-- 헤더 (Grid Layout) -->
            <div class="process-header bg-gray-800 text-white font-bold p-3">
                <div class="header-item">공정명</div>
                <div class="header-item">진행률</div>
                <div class="header-item">설비</div>
                <div class="header-item text-center">시작일시</div>
                <div class="header-item text-center">종료일시</div>
                <div class="header-item text-right">지시량</div>
                <div class="header-item text-right">불량</div>
                <div class="header-item text-right">생산량</div>
            </div>

            <!-- 프로세스 카드 (v-for 루프) -->
            <div v-for="process in processes" :key="process.id" :class="['process-card', { 'bg-gray-50': process.progress < 100, 'bg-green-50': process.progress === 100 }]">
                <!-- 1. 공정명 (Name) -->
                <div class="process-name font-bold" :class="`text-${process.statusColor}-700`">
                    {{ process.name }}
                </div>

                <!-- 2. 진행률 (Progress Bar) -->
                <div class="progress-cell">
                    <div class="progress-wrap" :class="`track-${process.statusColor}`">
                        <div class="progress-bar" :style="{ width: `${process.progress}%` }" :class="`bg-${process.statusColor}-500`"></div>
                        <span class="progress-text font-semibold" :class="`text-${process.statusColor}-700`">
                            {{ getProgressText(process) }}
                        </span>
                    </div>
                </div>

                <!-- 3. 설비 (Equipment) -->
                <div class="process-equipment">
                    <button class="equipment-btn" v-if="process.equipment">{{ process.equipment }}</button>
                    <span v-else>-</span>
                </div>

                <!-- 4. 시작일시 (Start Time) -->
                <div class="process-detail text-center text-sm">
                    <span class="block">{{ process.startTime.split(' ')[0] }}</span>
                    <span class="block text-gray-500">{{ process.startTime.split(' ')[1] }}</span>
                </div>

                <!-- 5. 종료일시 (End Time) -->
                <div class="process-detail text-center text-sm">
                    <span class="block">{{ process.endTime.split(' ')[0] }}</span>
                    <span class="block text-gray-500">{{ process.endTime.split(' ')[1] }}</span>
                </div>

                <!-- 6. 지시량 (Instructed) -->
                <div class="process-detail text-right text-gray-600 font-medium">
                    {{ formatQuantity(process.instructed) }}
                </div>

                <!-- 7. 불량 (Defect) -->
                <div class="process-detail text-right text-red-500 font-medium">
                    {{ formatQuantity(process.defect) }}
                </div>

                <!-- 8. 생산량 (Produced) -->
                <div class="process-detail text-right text-blue-600 font-bold">
                    {{ formatQuantity(process.produced) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
/* 🎨 Tailwind CSS 사용을 전제로 커스텀 스타일 정의 */

/* CSS Grid를 이용한 공통 레이아웃 정의 */
$grid-layout: 1fr 2fr 1.5fr 1fr 1fr 1fr 1fr 1fr;

.process-header,
.process-card {
    display: grid;
    /* 이미지에 맞게 8개의 컬럼 비율 조정 */
    grid-template-columns: $grid-layout;
    align-items: center;
    padding: 12px 16px;
    gap: 8px; /* 컬럼 간 간격 */
}

/* 헤더 스타일 */
.process-header {
    font-size: 0.9rem;
    position: sticky; /* 헤더 고정 (스크롤 시) */
    top: 0;
    z-index: 10;
}

/* 개별 카드 스타일 */
.process-card {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
        background-color: #f7f7f7;
    }

    &:last-child {
        border-bottom: none;
    }
}

/* 진행률 셀 내부 스타일 */
.progress-cell {
    padding: 0 10px;
}

.progress-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 18px; /* 전체 진행률 랩퍼 높이 */
}

/* 진행률 바 (Track) 스타일 */
.track-green {
    background-color: #d1e7dd; /* 연한 녹색 배경 */
    border-radius: 4px;
    flex-grow: 1;
    overflow: hidden;
}

.track-yellow {
    background-color: #fff3cd; /* 연한 노란색 배경 */
    border-radius: 4px;
    flex-grow: 1;
    overflow: hidden;
}

.track-gray {
    background-color: #f0f0f0; /* 연한 회색 배경 (대기중) */
    border-radius: 4px;
    flex-grow: 1;
    overflow: hidden;
}

/* 진행률 Bar (Fill) 스타일 */
.progress-bar {
    height: 18px;
    border-radius: 4px;
    transition: width 0.4s ease-out; /* 부드러운 애니메이션 효과 */
}

/* 진행률 텍스트 스타일 */
.progress-text {
    min-width: 40px; /* 텍스트 공간 확보 */
    font-size: 0.85rem;
}

/* 설비 버튼 스타일 */
.equipment-btn {
    background-color: gray;
    border-radius: 5px;
    color: white;
    padding: 10px;
    font-weight: bold;
}

/* 항목별 정렬 */
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

/* 모바일 반응형 (Grid 칼럼 숨기기/변경) */
@media (max-width: 768px) {
    .process-header,
    .process-card {
        /* 모바일에서는 일부 항목만 표시 */
        grid-template-columns: 1.5fr 2fr 1.5fr 1fr;
    }

    /* 모바일에서 숨길 항목 */
    .header-item:nth-child(4),
    .header-item:nth-child(5),
    .header-item:nth-child(6),
    .header-item:nth-child(7),
    .process-detail:nth-child(4),
    .process-detail:nth-child(5),
    .process-detail:nth-child(6),
    .process-detail:nth-child(7) {
        display: none;
    }
}
</style>
