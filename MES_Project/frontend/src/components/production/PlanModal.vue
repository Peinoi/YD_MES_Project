<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';

// props와 emit 정의
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'select']);

// 모달 내부 상태
const searchInput = ref('');
const selectedPlanNo = ref(''); // 현재 선택된 계획의 '계획번호'

// API에서 불러왔다고 가정한 임시 데이터
const planList = ref([
    { 선택: true, 계획번호: 'PLN20250601', 계획명: '20250601계획', 계획일자: '2025.05.05', 납기일자: '2025.05.25', 상태: '계획' },
    { 선택: false, 계획번호: 'PLN20250602', 계획명: '20250602계획', 계획일자: '2025.05.06', 납기일자: '2025.05.26', 상태: '계획' },
    { 선택: false, 계획번호: 'PLN20250701', 계획명: '20250701계획', 계획일자: '2025.06.01', 납기일자: '2025.06.21', 상태: '진행' },
    { 선택: false, 계획번호: 'PLN20250702', 계획명: '20250702계획', 계획일자: '2025.06.02', 납기일자: '2025.06.22', 상태: '계획' },
    { 선택: false, 계획번호: 'PLN20250703', 계획명: '20250707계획', 계획일자: '2025.06.03', 납기일자: '2025.06.23', 상태: '계획' }
]);

// 검색 기능 구현 (계획번호 또는 상태로 검색)
const filteredPlanList = computed(() => {
    const search = searchInput.value.toLowerCase();
    if (!search) return planList.value;

    return planList.value.filter((plan) => plan.계획번호.toLowerCase().includes(search) || plan.상태.toLowerCase().includes(search));
});

// 검색 버튼 클릭 핸들러
const handleSearch = () => {
    // 실제 API 호출 로직이 있다면 여기에 추가
    console.log('검색 실행:', searchInput.value);
    // filteredPlanList가 자동으로 업데이트됨
};

// 행 선택 핸들러
const selectRow = (plan) => {
    selectedPlanNo.value = plan.계획번호;
};

// 확인 버튼 핸들러
const handleConfirm = () => {
    const selectedPlan = planList.value.find((p) => p.계획번호 === selectedPlanNo.value);
    emit('select', selectedPlan); // 선택된 계획 객체를 부모로 전달
};

// 취소 버튼 핸들러
const handleCancel = () => {
    emit('select', null); // 선택된 것 없이 닫기
    emit('close');
};
</script>

<template>
    <div v-if="props.show" class="modal-backdrop">
        <div class="modal-container">
            <div class="search-area flex mb-3 p-3 border-b border-gray-200">
                <input type="text" v-model="searchInput" placeholder="계획번호 또는 상태를 입력해주세요." class="search-input" @keyup.enter="handleSearch" />
                <button @click="handleSearch" class="search-btn bg-blue-600 hover:bg-blue-700 text-white">검색</button>
            </div>

            <div class="data-table-wrapper overflow-y-auto mb-4">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th class="select-col">선택</th>
                            <th>계획번호</th>
                            <th>계획명</th>
                            <th>계획일자</th>
                            <th>납기일자</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="plan in filteredPlanList" :key="plan.계획번호" :class="{ 'row-selected': plan.계획번호 === selectedPlanNo }" @click="selectRow(plan)">
                            <td class="select-col">
                                <input type="checkbox" :checked="plan.계획번호 === selectedPlanNo" @change="selectRow(plan)" class="h-4 w-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500" />
                            </td>
                            <td>{{ plan.계획번호 }}</td>
                            <td>{{ plan.계획명 }}</td>
                            <td>{{ plan.계획일자 }}</td>
                            <td>{{ plan.납기일자 }}</td>
                            <td>{{ plan.상태 }}</td>
                        </tr>
                        <tr v-if="filteredPlanList.length === 0">
                            <td colspan="6" class="text-center py-4 text-gray-500">검색 결과가 없습니다.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="button-footer flex justify-center space-x-3 pt-3 border-t border-gray-200">
                <button @click="handleCancel" class="btn-footer cancel-btn bg-gray-700 hover:bg-gray-800 text-white">취소</button>
                <button @click="handleConfirm" class="btn-footer confirm-btn bg-yellow-500 hover:bg-yellow-600 text-white">확인</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 모달 백드롭 스타일 */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 다른 요소 위에 표시 */
}

/* 모달 컨테이너 스타일 */
.modal-container {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 700px; /* 이미지와 유사한 너비 */
    padding: 20px;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}

/* 검색 영역 스타일 */
.search-area {
    padding-bottom: 8px !important;
}

.search-input {
    flex-grow: 1;
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-right: 8px;
    font-size: 15px;
    transition: border-color 0.2s;
}
.search-input:focus {
    outline: none;
    border-color: #3b82f6;
}

.search-btn {
    padding: 8px 18px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 15px;
    min-width: 80px;
}

/* 테이블 컨테이너 */
.data-table-wrapper {
    flex-grow: 1; /* 테이블이 공간을 차지하도록 함 */
    /* 테이블 헤더/바디 스타일 */
    border: 1px solid #f0f0f0;
    border-radius: 4px;
}

.data-table th,
.data-table td {
    padding: 10px 12px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
}

.data-table thead {
    background-color: #f7f7f7; /* 헤더 배경색 */
    font-weight: 600;
    color: #444;
}

.data-table th {
    /* 테이블 헤더의 구분선 */
    border-right: 1px solid #e0e0e0;
}
.data-table th:last-child {
    border-right: none;
}

.data-table tbody tr {
    cursor: pointer;
    transition: background-color 0.1s;
}

.data-table tbody tr:hover {
    background-color: #f9f9f9;
}

.data-table .row-selected {
    background-color: #ffeccf; /* 선택된 행 배경색 (이미지의 노란색과 유사하게) */
    font-weight: 500;
}

.select-col {
    width: 60px;
}

/* 하단 버튼 스타일 */
.btn-footer {
    padding: 10px 30px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    min-width: 100px;
    transition: background-color 0.2s;
}

.confirm-btn {
    /* 이미지의 노란색 버튼과 유사하게 */
    color: #333;
}
</style>
