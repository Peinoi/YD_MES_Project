<script setup>
import { ref, defineProps, defineEmits, computed, watch } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    planList: {
        type: Array,
        default: () => []
    },
    defaultPlan: {
        type: Object,
        default: () => null
    }
});

const emit = defineEmits(['close', 'select']);

// -----------------------------------------
// 상태 옵션 (label/value 매핑)
// -----------------------------------------
const statusOptions = [
    { label: '진행중', value: 'v1' },
    { label: '작업완료', value: 'v2' },
    { label: '작업보류', value: 'v3' },
    { label: '작업대기', value: 'v4' }
];

const getStatusLabel = (v) => {
    const found = statusOptions.find((s) => s.value === v);
    return found ? found.label : v || '';
};

// -----------------------------------------
// 날짜 포맷 함수
// -----------------------------------------
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

// -----------------------------------------
// 검색 & 선택
// -----------------------------------------
const searchInput = ref('');
const selectedPlanNo = ref('');

// 부모가 넘긴 기본 선택값 자동 반영
watch(
    () => props.defaultPlan,
    (v) => {
        if (v?.계획번호) {
            selectedPlanNo.value = v.계획번호;
        }
    },
    { immediate: true }
);

// -----------------------------------------
// 검색 + 상태 라벨 + 날짜 포맷 적용
// -----------------------------------------
const filteredPlanList = computed(() => {
    const s = searchInput.value.toLowerCase();

    return props.planList
        .filter((p) => p.계획번호 && p.계획번호.trim() !== '')
        .map((plan) => ({
            ...plan,
            상태라벨: getStatusLabel(plan.상태),
            계획일자포맷: formatDate(plan.계획일자),
            납기일자포맷: formatDate(plan.납기일자),
            작업시작일시포맷: formatDateTime(plan.작업시작일시),
            예상완료일시포맷: formatDateTime(plan.예상완료일시)
        }))
        .filter((p) => {
            if (!s) return true;
            return p.계획번호.toLowerCase().includes(s) || p.상태라벨.toLowerCase().includes(s);
        });
});

// 검색 버튼
const handleSearch = () => {
    console.log('검색:', searchInput.value);
};

// 행 선택
const selectRow = (plan) => {
    selectedPlanNo.value = plan.계획번호;
};

// 확인 버튼 → 부모로 전달
const handleConfirm = () => {
    const selectedPlan = props.planList.find((p) => p.계획번호 === selectedPlanNo.value);
    if (!selectedPlan) {
        emit('select', null);
        return;
    }

    const selectedData = {
        prdp_code: selectedPlan.계획번호,
        wko_code: selectedPlan.작업지시번호,
        prdp_date: selectedPlan.계획일자
    };

    const otherData = {
        dueDate: selectedPlan.납기일자,
        planName: selectedPlan.계획명,
        productName: selectedPlan.제품명,
        quantity: selectedPlan.지시수량,
        startDateTime: selectedPlan.작업시작일시,
        expectedEndDateTime: selectedPlan.예상완료일시,
        status: selectedPlan.상태,
        lineCode: selectedPlan.작업라인코드
    };

    emit('select', { selectedData, otherData });
};

// 취소
const handleCancel = () => {
    emit('select', null);
    emit('close');
};
</script>

<template>
    <div v-if="props.show" class="modal-backdrop">
        <div class="modal-container">
            <!-- 검색 영역 -->
            <div class="search-area flex mb-3 p-3 border-b border-gray-200">
                <input type="text" v-model="searchInput" placeholder="계획번호 또는 상태를 입력해주세요." class="search-input" @keyup.enter="handleSearch" />
                <button @click="handleSearch" class="search-btn bg-blue-600 hover:bg-blue-700 text-white">검색</button>
            </div>

            <!-- 테이블 -->
            <div class="data-table-wrapper overflow-y-auto mb-4">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th class="select-col">선택</th>
                            <th>계획번호</th>
                            <th>계획명</th>
                            <th>계획일자</th>
                            <th>납기일자</th>
                            <th>작업시작일시</th>
                            <th>예상완료일시</th>
                            <th>상태</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="plan in filteredPlanList" :key="plan.계획번호" :class="{ 'row-selected': plan.계획번호 === selectedPlanNo.value }" @click="selectRow(plan)">
                            <td class="select-col">
                                <input type="checkbox" :checked="plan.계획번호 === selectedPlanNo.value" @click.stop="selectRow(plan)" class="h-4 w-4 text-yellow-500 border-gray-300" />
                            </td>
                            <td>{{ plan.계획번호 }}</td>
                            <td>{{ plan.계획명 }}</td>
                            <td>{{ plan.계획일자포맷 }}</td>
                            <td>{{ plan.납기일자포맷 }}</td>
                            <td>{{ plan.작업시작일시포맷 }}</td>
                            <td>{{ plan.예상완료일시포맷 }}</td>
                            <td>{{ plan.상태라벨 }}</td>
                        </tr>

                        <tr v-if="filteredPlanList.length === 0">
                            <td colspan="8" class="text-center py-4 text-gray-500">검색 결과가 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 버튼 -->
            <div class="button-footer flex justify-center space-x-3 pt-3 border-t border-gray-200">
                <button @click="handleCancel" class="btn-footer bg-gray-700 hover:bg-gray-800 text-white">취소</button>
                <button @click="handleConfirm" class="btn-footer bg-yellow-500 hover:bg-yellow-600 text-white">확인</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}
.modal-container {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 20px;
}
.search-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-right: 8px;
}
.search-btn {
    padding: 8px 18px;
    border-radius: 4px;
    font-weight: 600;
}
.data-table-wrapper {
    flex: 1;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
}
.data-table th,
.data-table td {
    padding: 10px 12px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
}
.row-selected {
    background-color: #ffeac5;
    font-weight: 600;
}
.select-col {
    width: 60px;
}
.btn-footer {
    padding: 10px 30px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
}

.data-table th,
.data-table td {
    padding: 8px 12px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.data-table td.plan-name {
    white-space: normal;
    word-break: break-word;
}
</style>
