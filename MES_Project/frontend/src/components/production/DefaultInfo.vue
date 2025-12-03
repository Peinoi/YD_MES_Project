<script setup>
import { ref } from 'vue';
// 스크립트 로직은 변화 없으므로 유지
const formData = ref({
    workOrderNo: 'JSS0001',
    productionPlanNo: '',
    planDate: '2025.06.19'
});

const handleDelete = () => {
    console.log('삭제 버튼 클릭');
};

const handleReset = () => {
    console.log('초기화 버튼 클릭');
    formData.value.productionPlanNo = '';
};

const handleSave = () => {
    console.log('저장 버튼 클릭', formData.value);
};

const handleLoadPlan = () => {
    console.log('생산계획 불러오기 버튼 클릭');
};
</script>

<template>
    <div class="basic-info-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">기본 정보</h5>
            <div class="button-group flex space-x-2">
                <button class="btn-action bg-red-600 hover:bg-red-700 text-white" @click="handleDelete">삭제</button>
                <button class="btn-action bg-gray-600 hover:bg-gray-700 text-white" @click="handleReset">초기화</button>

                <button class="btn-action bg-blue-500 hover:bg-blue-600 text-white" @click="handleSave">저장</button>

                <button class="btn-action bg-green-500 hover:bg-green-600 text-white" @click="handleLoadPlan">생산계획 불러오기</button>
            </div>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-yellow-500">
            <div class="grid-row contents-center border-b border-r border-gray-200">
                <label class="label-col">작업지시번호</label>
                <div class="input-col bg-gray-100 text-gray-500">
                    <input type="text" :value="formData.workOrderNo" readonly class="w-full text-base bg-transparent border-none focus:outline-none" />
                </div>
            </div>

            <div class="grid-row contents-center border-b border-gray-200">
                <label class="label-col">생산계획번호</label>
                <div class="input-col">
                    <input type="text" v-model="formData.productionPlanNo" class="input-field-style-compact" />
                </div>
            </div>

            <div class="grid-row border-r border-gray-200">
                <label class="label-col">계획일자</label>
                <div class="input-col">
                    <input type="text" v-model="formData.planDate" class="input-field-style-compact" />
                </div>
            </div>

            <div class="grid-row border-gray-200">
                <label class="label-col bg-white"></label>
                <div class="input-col bg-white"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Tailwind CSS utility classes를 주로 사용하지만, 구조적인 CSS는 여기에 정의 */

.basic-info-card {
    background-color: #ffffff;
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    width: 100%;

    /* ⭐ 추가: 하단 마진 추가 (예: mb-6 = 1.5rem = 24px) */
    margin-bottom: 24px;
}

/* ⭐ 버튼 공통 스타일: 패딩과 폰트 크기 추가 축소 */
.btn-action {
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    transition: background-color 0.2s;
    min-width: 75px;
}

/* 폼 그리드 레이아웃 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border-collapse: collapse;
}

/* 각 행 스타일 (2열로 나누어짐): 최소 높이 축소 */
.grid-row {
    display: grid;
    grid-template-columns: 130px 1fr;
    min-height: 45px;
}

/* 레이블 컬럼 스타일: 폰트 크기 축소 */
.label-col {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    padding: 0 12px;
}

/* 입력 필드 컬럼 스타일: 패딩 축소 */
.input-col {
    display: flex;
    align-items: center;
    padding: 6px 12px;
}

/* ⭐ 입력 필드 내부 스타일: 축소된 전용 클래스 사용 */
.input-field-style-compact {
    width: 100%;
    font-size: 15px;
    border: 1px solid #d1d5db;
    padding: 4px 8px;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.input-field-style-compact:focus {
    outline: none;
    border-color: #3b82f6;
}

/* 첫 번째 행의 작업지시번호 (자동생성) 필드 스타일 (유지) */
.input-col input[readonly] {
    padding: 0;
    color: #4b5563;
}
</style>
