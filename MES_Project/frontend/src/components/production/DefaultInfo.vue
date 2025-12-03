<template>
    <div class="basic-info-card p-4">
        <div class="header-section flex justify-between items-center mb-4 pb-2 border-b-2 border-b-gray-300">
            <h2 class="text-xl font-semibold text-gray-800">기본 정보</h2>
            <div class="button-group flex space-x-2">
                <button class="btn-action bg-red-600 hover:bg-red-700 text-white" @click="handleDelete">삭제</button>
                <button class="btn-action bg-gray-600 hover:bg-gray-700 text-white" @click="handleReset">초기화</button>
                <button class="btn-action bg-green-500 hover:bg-green-600 text-white" @click="handleSave">샐진작업</button>
            </div>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-yellow-500 shadow-md">
            <div class="grid-row contents-center border-b border-r border-gray-200">
                <label class="label-col">작업지시번호</label>
                <div class="input-col bg-gray-100 text-gray-500">
                    <input type="text" :value="formData.workOrderNo" readonly class="w-full bg-transparent border-none focus:outline-none" />
                    <span class="text-xs text-gray-500 ml-2">(자동생성)</span>
                </div>
            </div>

            <div class="grid-row contents-center border-b border-gray-200">
                <label class="label-col">생산계획번호</label>
                <div class="input-col">
                    <input type="text" v-model="formData.productionPlanNo" class="w-full border border-gray-300 p-1 rounded focus:border-blue-500" />
                </div>
            </div>

            <div class="grid-row border-r border-gray-200">
                <label class="label-col">계획일자</label>
                <div class="input-col">
                    <input type="text" v-model="formData.planDate" class="w-full border border-gray-300 p-1 rounded focus:border-blue-500" />
                </div>
            </div>

            <div class="grid-row border-gray-200">
                <label class="label-col bg-white"></label>
                <div class="input-col bg-white"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// 폼 데이터 상태 관리
const formData = ref({
    workOrderNo: 'JSS0001', // 이미지에서 자동생성된 값
    productionPlanNo: '',
    planDate: '2025.06.19' // 이미지의 예시 날짜
});

// 버튼 핸들러 (실제 로직은 여기에 구현)
const handleDelete = () => {
    console.log('삭제 버튼 클릭');
    // 여기에 삭제 API 호출 로직 추가
};

const handleReset = () => {
    console.log('초기화 버튼 클릭');
    // 폼 초기화 로직 추가
    formData.value.productionPlanNo = '';
};

const handleSave = () => {
    console.log('샐진작업 버튼 클릭', formData.value);
    // 여기에 저장/전송 API 호출 로직 추가
};
</script>

<style scoped>
/* Tailwind CSS utility classes를 주로 사용하지만, 구조적인 CSS는 여기에 정의 */

.basic-info-card {
    /* 카드 배경 및 그림자 */
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    max-width: 800px; /* 적당한 최대 너비 설정 */
    margin: 0 auto; /* 중앙 정렬 */
}

/* 버튼 공통 스타일 */
.btn-action {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.2s;
    min-width: 80px;
}

/* 폼 그리드 레이아웃 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2개의 섹션 */
    border-collapse: collapse; /* 셀 경계 통합 */
}

/* 각 행 스타일 (2열로 나누어짐) */
.grid-row {
    display: grid;
    grid-template-columns: 120px 1fr; /* 레이블: 120px, 입력 필드: 나머지 */
    min-height: 40px; /* 최소 높이 */
}

/* 레이블 컬럼 스타일 */
.label-col {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0; /* 레이블 배경색 */
    font-size: 14px;
    font-weight: 500;
    color: #333;
    padding: 0 10px;
}

/* 입력 필드 컬럼 스타일 */
.input-col {
    display: flex;
    align-items: center;
    padding: 5px 10px;
}

/* 첫 번째 행의 작업지시번호 (자동생성) 필드 스타일 */
.input-col input[readonly] {
    padding: 0;
    /* 읽기 전용 필드의 텍스트 색상을 약간 연하게 조정 */
    color: #4b5563;
}
</style>
