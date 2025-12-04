<script setup>
import { ref } from 'vue';

// 폼 데이터 정의
const workOrderData = ref({
    productName: '신라면',
    instructionQuantity: '70000',
    startDate: '2025-06-20T09:00', // datetime-local 포맷으로 변경
    expectedCompletion: '2025-06-29T09:00', // datetime-local 포맷으로 변경
    instructionStatus: '',
    lineType: '', // 선택값으로 변경
    lineCode: ''
});

// 지시 상태 옵션
const statusOptions = ref([
    { label: '선택 안함', value: '' },
    { label: '대기', value: 'WAIT' },
    { label: '진행 중', value: 'RUN' },
    { label: '완료', value: 'DONE' }
]);

// 라인 유형 옵션 추가
const lineTypeOptions = ref([
    { label: '선택 안함', value: '' },
    { label: '라인', value: 'LINE' },
    { label: '비라인', value: 'NON_LINE' }
]);

// 라인 코드 옵션
const lineCodeOptions = ref([
    { label: '선택 안함', value: '' },
    { label: 'LINE-A01', value: 'A01' },
    { label: 'LINE-B02', value: 'B02' }
]);

// const handleSaveInstruction = () => {
//     console.log('작업 지시사항 저장:', workOrderData.value);
// };
</script>

<template>
    <div class="work-instruction-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">작업지시사항</h5>
        </div>

        <div class="form-grid grid grid-cols-2 bg-white border-t-4 border-red-500">
            <!-- 제품명 -->
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">제품명</label>
                <div class="input-col">
                    <input type="text" v-model="workOrderData.productName" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 지시수량 -->
            <div class="grid-row border-b border-gray-200">
                <label class="label-col">지시수량</label>
                <div class="input-col">
                    <input type="text" v-model="workOrderData.instructionQuantity" class="input-field-style-compact text-right" />
                    <span class="text-sm text-gray-500 ml-2">(개)</span>
                </div>
            </div>

            <!-- 작업 시작일시 -->
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">작업시작일시</label>
                <div class="input-col">
                    <input type="datetime-local" v-model="workOrderData.startDate" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 예상 완료일시 -->
            <div class="grid-row border-b border-gray-200">
                <label class="label-col">예상 완료일시</label>
                <div class="input-col">
                    <input type="datetime-local" v-model="workOrderData.expectedCompletion" class="input-field-style-compact" />
                </div>
            </div>

            <!-- 지시 상태 -->
            <div class="grid-row border-b border-r border-gray-200">
                <label class="label-col">지시 상태</label>
                <div class="input-col">
                    <select v-model="workOrderData.instructionStatus" class="input-field-style-compact select-field">
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- ⭐ 라인 유형: select 로 변경됨 -->
            <div class="grid-row border-b border-gray-200">
                <label class="label-col">라인 유형</label>
                <div class="input-col">
                    <select v-model="workOrderData.lineType" class="input-field-style-compact select-field">
                        <option v-for="option in lineTypeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- 라인 코드 -->
            <div class="grid-row border-r border-gray-200">
                <label class="label-col">라인 코드</label>
                <div class="input-col">
                    <select v-model="workOrderData.lineCode" class="input-field-style-compact select-field">
                        <option v-for="option in lineCodeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
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
/* 📌 이전 '기본 정보' 컴포넌트의 컴팩트 스타일을 기준으로 작성되었습니다. */

.work-instruction-card {
    background-color: #ffffff;
    border-radius: 7px;
    width: 100%;
    /* 하단 마진 및 윤곽 테두리 적용 */
    margin-bottom: 24px;
    border: 1px solid #e0e0e0;
}

/* 버튼 공통 스타일 (이전 컴포넌트의 축소된 스타일) */
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

/* 상단 노란색 선 대신 이미지의 빨간색 선 스타일을 따라 border-red-500 사용 */
.form-grid.border-t-4.border-yellow-500 {
    border-top-color: #ef4444; /* Tailwind red-500 */
}

/* 각 행 스타일 (2열로 나누어짐): 최소 높이 축소 */
.grid-row {
    display: grid;
    grid-template-columns: 130px 1fr; /* 레이블 너비 통일 */
    min-height: 45px; /* 최소 높이 통일 */
}

/* 레이블 컬럼 스타일 */
.label-col {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    padding: 0 12px;
    border-right: 1px solid #e5e7eb; /* 경계선 추가 */
}

/* 입력 필드 컬럼 스타일: 패딩 축소 */
.input-col {
    display: flex;
    align-items: center;
    padding: 6px 12px;
}

/* 읽기 전용 필드 배경색 (라인 유형) */
.input-col.input-readonly-bg {
    background-color: #f7f9fc; /* 연한 회색 배경 */
}

/* ⭐ 입력 필드 및 Select 공통 스타일: 축소된 전용 클래스 */
.input-field-style-compact {
    width: 100%;
    font-size: 15px;
    border: 1px solid #d1d5db;
    padding: 4px 8px;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.2s;
    /* text-right는 템플릿에서 직접 적용 */
}

.input-field-style-compact:focus {
    outline: none;
    border-color: #3b82f6;
}

/* Select 필드 스타일 조정 (화살표 유지 및 배경 제거) */
.select-field {
    appearance: none; /* 기본 OS 스타일 제거 시 */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center; /* 우측 8px에 위치 */
    padding-right: 25px !important; /* 화살표 공간 확보 */
}

/* 읽기 전용 필드 스타일 (유지) */
.input-col input[readonly] {
    padding: 0;
    color: #4b5563;
}
</style>
