<script setup>
import { reactive, defineEmits } from 'vue';

const emit = defineEmits(['search', 'reset']);

// 검색 조건의 초기 상태
const initialForm = {
    startDate: '',
    endDate: '',
    status: '',
    line: '',
    productName: '',
    worker: ''
};

const form = reactive({ ...initialForm });

// '조회' 버튼 클릭 시
const submitForm = () => {
    // 현재 form 데이터를 부모 컴포넌트로 전달 (emit)
    emit('search', { ...form });
};

// '초기화' 버튼 클릭 시
const resetForm = () => {
    // form 객체를 초기 상태로 재설정
    Object.assign(form, initialForm);
    // 부모 컴포넌트에 초기화 알림
    emit('reset');
};
</script>

<template>
    <!-- 기존 .search-form-container 스타일을 Tailwind로 변환 -->
    <div class="p-4 bg-white border border-gray-200 mb-6 rounded-lg shadow-sm">
        <!-- 검색 필드 행 1: 반응형 Grid (모바일: 1열, 태블릿: 2열, 대형: 4열) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <!-- 1. 기간 (Date Range) -->
            <label class="flex items-center gap-3">
                <span class="font-semibold text-gray-700 whitespace-nowrap">1 기간</span>
                <input type="date" v-model="form.startDate" class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full" />
                <span class="text-gray-500">~</span>
                <input type="date" v-model="form.endDate" class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full" />
            </label>

            <!-- 2. 상태 -->
            <label class="flex items-center gap-3">
                <span class="font-semibold text-gray-700 whitespace-nowrap">2 상태</span>
                <select v-model="form.status" class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full bg-white">
                    <option value="">전체</option>
                    <option value="진행중">진행중</option>
                    <option value="대기중">대기</option>
                    <option value="완료">완료</option>
                    <option value="중단">중단</option>
                </select>
            </label>

            <!-- 라인 -->
            <label class="flex items-center gap-3">
                <span class="font-semibold text-gray-700 whitespace-nowrap">라인</span>
                <select v-model="form.line" class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full bg-white">
                    <option value="">전체</option>
                    <option value="A">A라인</option>
                    <option value="B">B라인</option>
                </select>
            </label>

            <!-- 3. 품목명 -->
            <label class="flex items-center gap-3">
                <span class="font-semibold text-gray-700 whitespace-nowrap">3 품목명</span>
                <input type="text" v-model="form.productName" placeholder="품목명 입력" class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full" />
            </label>
        </div>

        <!-- 검색 필드 행 2: 작업자 입력 필드 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <!-- 4. 작업자 -->
            <label class="flex items-center gap-3">
                <span class="font-semibold text-gray-700 whitespace-nowrap">작업자</span>
                <input type="text" v-model="form.worker" placeholder="작업자명 입력" class="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full" />
            </label>

            <!-- 나머지 열은 비워 둡니다. -->
            <div class="hidden sm:block"></div>
            <div class="hidden sm:block"></div>
            <div class="hidden sm:block"></div>
        </div>

        <!-- 버튼 그룹 행: 전체 너비를 사용하고 중앙에 배치 -->
        <div class="flex justify-center gap-3 pt-2 border-t border-gray-100">
            <button @click="resetForm" class="px-4 py-2 rounded-md font-semibold cursor-pointer transition duration-150 bg-gray-300 text-gray-800 hover:bg-gray-400">초기화</button>
            <button @click="submitForm" class="px-4 py-2 rounded-md font-semibold cursor-pointer transition duration-150 bg-blue-500 text-white hover:bg-blue-600 shadow-md">조회</button>
        </div>
    </div>
</template>
