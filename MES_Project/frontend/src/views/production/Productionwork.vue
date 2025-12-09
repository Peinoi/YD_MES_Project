<script setup>
// Productionwork.vue (조회 전용 화면)
import { onBeforeMount, ref, computed } from 'vue';
import axios from 'axios';
import { useWorkStore } from '@/stores/workStore.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const workStore = useWorkStore();

const workInfo = computed(() => workStore.selectedWork);
let workList = ref([]);

// ------------------------------
// 공정 목록 조회
// ------------------------------
const getWorkList = async () => {
    if (!workInfo.value) return;

    const wko = workInfo.value.code;
    const prod = workInfo.value.prod_code;

    const result = await axios.get(`/api/productionwork/work/process/${wko}/${prod}`);
    workList.value = result.data.data.result;
    console.log('📡 [getWorkList] 조회 요청:', wko, prod);
    console.log('📡 조회 결과:', workList.value);
};

// ------------------------------
// 페이지 이동
// ------------------------------
const goIrregularWork = () => {
    workStore.setIrregularData({
        work: workInfo.value,
        details: workList.value
    });
    router.push('/Production/IrregularWorkProgress');
};

const goList = () => router.push('/Production/TaskProgressList');
// ------------------------------
// 🔄 로컬 타이머로 진행률 반영
// ------------------------------
let localTimer = null;

const startLocalTimer = () => {
    if (!workStore.isWorkRunning) {
        console.log('⛔ 타이머 시작 조건 불충족 (isWorkRunning = false)');
        return;
    }

    console.log('⏱ [startLocalTimer] 실행됨');
    console.log('▶ 현재 저장된 공정 index:', workStore.currentProcessIndex);

    if (localTimer) clearInterval(localTimer);

    localTimer = setInterval(() => {
        const idx = workStore.currentProcessIndex;

        // 공정 수 초과 → 종료
        if (idx >= workList.value.length) {
            console.log('🏁 모든 공정 종료 → 타이머 stop');
            stopLocalTimer();
            return;
        }

        const process = workList.value[idx];
        if (!process) {
            console.log('⚠ 공정 데이터 없음. 타이머 중지');
            stopLocalTimer();
            return;
        }

        // 100% 도달 → 다음 공정으로 이동
        if (process['진행률'] >= 100) {
            console.log(`✔ 공정 ${idx} 완료 → 다음 공정 이동`);
            workStore.setCurrentProcessIndex(idx + 1);
            return;
        }

        // 증가
        process['진행률'] += 10;
        if (process['진행률'] > 100) process['진행률'] = 100;

        console.log(`🔼 진행률 증가중... ${process['진행률']}%`);
    }, 1000);
};

const stopLocalTimer = () => {
    if (localTimer) clearInterval(localTimer);
    localTimer = null;
};

// ------------------------------
// 페이지 진입 시 1회 로드시 조회
// ------------------------------
onBeforeMount(async () => {
    workStore.restoreSelectedWork();
    await getWorkList();

    console.log('🟢 [Productionwork Mounted] 페이지 로드됨');
    console.log('selectedWork:', workInfo.value);

    // 🔥 IrregularWorkProgress에서 작업 시작 후 돌아왔을 때 자동 실행
    startLocalTimer();
});

/* --------------------------------------
🔹 UI 표시 함수
-------------------------------------- */
const getProgressText = (p) => (p['진행률'] === 0 ? '대기중' : `${p['진행률']}%`);
const formatQuantity = (v) => (v ? `${v}(개)` : '');

const formatDate = (str) => {
    if (!str) return '';
    const d = new Date(str);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
</script>

<template>
    <div id="container" class="p-4 md:p-8 bg-gray-50 min-h-screen">
        <!-- 작업 지시 정보 -->
        <div class="md:w-1/2 mb-6">
            <div class="card flex flex-col gap-2 p-4 border border-gray-200 rounded-lg shadow-md bg-white">
                <h2 class="text-xl font-semibold mb-2 text-gray-700">작업 지시 정보</h2>
                <button id="goBtn" class="btn-action bg-blue-500 text-white" @click="goList()">작업 진행 목록</button>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-gray-500">작업지시코드</label>
                        <InputText readonly :value="workInfo.code" class="p-2 border rounded-md bg-gray-50 text-sm" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-gray-500">제품명</label>
                        <InputText readonly :value="workInfo.name" class="p-2 border rounded-md bg-gray-50 text-sm" />
                    </div>

                    <div class="flex flex-col gap-1 col-span-2">
                        <label class="text-xs text-gray-500">라인</label>
                        <InputText readonly :value="workInfo.line" class="p-2 border rounded-md bg-gray-50 text-sm" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 공정 목록 -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div class="process-header bg-[#3a3535] text-white font-bold text-sm">
                <div>공정명</div>
                <div>진행률</div>
                <div>설비</div>
                <div>시작일시</div>
                <div>종료일시</div>
                <div class="text-right">지시량</div>
                <div class="text-right">불량</div>
                <div class="text-right">생산량</div>
            </div>

            <div v-for="(process, index) in workList" :key="process.prdr_d_code" class="process-card text-gray-800 text-sm" @click="index === 0 && goIrregularWork()">
                <div class="process-detail font-medium">{{ process['공정명'] }}</div>

                <!-- 진행률 바 -->
                <div class="process-detail progress-cell">
                    <div class="progress-wrap">
                        <div
                            :class="[
                                'progress-track',
                             {
                                'track-green': process['진행률'] === 100,
                                'track-yellow': process['진행률'] > 0 && process['진행률'] < 100,
                                'track-gray': process['진행률'] === 0
                             }
                            ]"
                            >
                            <div
                                class="progress-bar"
                                :style="{
                                width: process['진행률'] + '%',
                                backgroundColor: process['진행률'] === 100 ? '#4CAF50' : '#facc15'
                                }"
                            ></div>
                            </div>

                        <span class="progress-text font-bold" :class="{ 'text-gray-500': process['진행률'] === 0 }">
                            {{ getProgressText(process) }}
                        </span>
                    </div>
                </div>

                <!-- 설비 -->
                <div
                    id="eq-box"
                    class="process-detail text-gray-600 font-light"
                    :style="{
                        cursor: index === 0 || index === workList.length - 1 ? 'pointer' : 'default',
                        backgroundColor: index === 0 || index === workList.length - 1 ? 'rgb(172,170,170)' : '#f3f4f6'
                    }"
                    @click.stop="(index === 0 || index === workList.length - 1) && goIrregularWork()"
                >
                    {{ process['설비코드'] }} - {{ process['설비'] }}
                </div>

                <div class="process-detail text-center">{{ formatDate(process['시작일시']) }}</div>
                <div class="process-detail text-center">{{ formatDate(process['종료일시']) }}</div>
                <div class="process-detail text-right">{{ formatQuantity(process['지시량']) }}</div>
                <div class="process-detail text-right text-red-600">{{ formatQuantity(process['불량']) }}</div>
                <div class="process-detail text-right font-medium text-blue-600">{{ formatQuantity(process['생산량']) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
$grid-layout: 1.2fr 2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr;

.process-header,
.process-card {
    display: grid;
    grid-template-columns: $grid-layout;
    align-items: center;
    padding: 12px 16px;
    gap: 8px;
}

.process-card {
    border-bottom: 1px solid #e5e7eb;
}

.process-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.progress-cell {
    padding: 0 5px;
}

.progress-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 30px;
}

.progress-track {
    border-radius: 4px;
    flex-grow: 1;
    height: 18px;
    overflow: hidden;
}

.track-green {
    background-color: #d1e7dd;
}

.track-yellow {
    background-color: #ffeccf;
}

.track-gray {
    background-color: #e5e7eb;
}

.progress-bar {
    height: 100%;
    transition: width 0.4s ease-out;
    background-color: #facc15;
}

.progress-text {
    min-width: 45px;
    font-size: 0.85rem;
    text-align: right;
}

#eq-box {
    border-radius: 5px;
    padding: 5px;
    font-weight: bold;
}
#goBtn {
    width: 150px;
    border-radius: 4px;
    cursor: pointer;
    height: 30px;
}
</style>
