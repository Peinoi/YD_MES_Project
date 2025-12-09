<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import DefaultInfo from '../../components/production/DefaultInfo.vue';
import WorkInstructions from '../../components/production/WorkInstructions.vue';
import NonStandardProcess from '../../components/production/NonStandardProcess.vue';

const API_URL = '/api/production/plan';
const route = useRoute();

const searchCriteria = ref({});
const allRows = ref([]);
const isLoading = ref(false);

// 🔹 DefaultInfo에서 받은 데이터
const otherDataFromChild = ref(null);

// 🔥 DefaultInfo로 보낼 기본 정보 데이터
const defaultInfoData = ref({
    workOrderNo: '',
    productionPlanNo: '',
    planDate: ''
});

// WorkInstructions로 보낼 데이터
const workOrderData = ref({
    productName: '',
    instructionQuantity: '',
    startDate: '',
    expectedCompletion: '',
    instructionStatus: '',
    lineType: '',
    lineCode: ''
});

// 🔥 모든 데이터 초기화 함수
const resetAllData = () => {
    console.log('🔄 데이터 초기화 시작');

    defaultInfoData.value = {
        workOrderNo: '',
        productionPlanNo: '',
        planDate: ''
    };

    workOrderData.value = {
        productName: '',
        instructionQuantity: '',
        startDate: '',
        expectedCompletion: '',
        instructionStatus: '',
        lineType: '',
        lineCode: ''
    };

    otherDataFromChild.value = null;

    console.log('✅ 데이터 초기화 완료');
};

// 🔥 datetime-local input 형식으로 변환 (YYYY-MM-DDTHH:mm)
const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 🔥 날짜만 추출 (YYYY-MM-DD)
const formatDateOnly = (dateStr) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// 🔥 query에서 넘어온 데이터를 workOrderData와 defaultInfoData에 자동 매핑
const loadDetailFromQuery = () => {
    // 🔥 먼저 모든 데이터 초기화
    resetAllData();

    // 🔥 Base64 디코딩 (query.d 사용)
    const encodedData = route.query.d;

    // 🔥 query.d가 없으면 초기화만 하고 종료 (등록 페이지)
    if (!encodedData) {
        console.log('✅ query.d가 없음 - 등록 모드 (빈 값)');
        return;
    }

    // 🔥 query.d가 있으면 데이터 로드 (조회 모드)
    try {
        // Base64 -> JSON 문자열 -> 객체
        const jsonString = decodeURIComponent(atob(encodedData));
        const parsedData = JSON.parse(jsonString);

        console.log('🔥 받은 원본 데이터:', parsedData);

        // 🔥 WorkInstructions용 데이터 매핑
        const mappedWorkOrderData = {
            productName: parsedData['제품명'] || parsedData.prod_name || '',
            instructionQuantity: String(parsedData['지시수량'] || parsedData.wko_qtt || ''),
            startDate: formatDateTimeLocal(parsedData['작업시작일시'] || parsedData.start_date),
            expectedCompletion: formatDateTimeLocal(parsedData['예상완료일시'] || parsedData.end_date),
            instructionStatus: parsedData['상태'] || parsedData.stat || '',
            lineCode: parsedData['작업라인코드'] || parsedData.line_code || '',
            lineType: parsedData['작업라인코드'] || parsedData.line_code ? '정형' : '비정형'
        };

        // 🔥 DefaultInfo용 데이터 매핑
        const mappedDefaultInfoData = {
            workOrderNo: parsedData['작업지시번호'] || parsedData.wko_code || '',
            productionPlanNo: parsedData['계획번호'] || parsedData.prdp_code || '',
            planDate: formatDateOnly(parsedData['계획일자'] || parsedData.prdp_date)
        };

        // 🔥 즉시 데이터에 할당
        workOrderData.value = mappedWorkOrderData;
        defaultInfoData.value = mappedDefaultInfoData;

        console.log('✅ 자동 매핑된 workOrderData:', workOrderData.value);
        console.log('✅ 자동 매핑된 defaultInfoData:', defaultInfoData.value);
    } catch (error) {
        console.error('❌ query 데이터 파싱 실패:', error);
        console.error('❌ 원본 인코딩 데이터:', encodedData);
        // 파싱 실패 시에도 초기화 상태 유지
    }
};

// 🔥 route 전체 경로 변경 감지 (path + query 모두)
watch(
    () => route.fullPath,
    (newPath, oldPath) => {
        console.log('🔄 route 변경 감지');
        console.log('  - 이전:', oldPath);
        console.log('  - 현재:', newPath);

        // 페이지가 변경될 때마다 데이터 재로드
        loadDetailFromQuery();
    }
);

// 🔹 DefaultInfo에서 선택된 값 watch로 WorkInstructions에 반영
watch(otherDataFromChild, (newData) => {
    if (!newData) return;

    workOrderData.value = {
        productName: newData.productName || workOrderData.value.productName,
        instructionQuantity: newData.quantity || workOrderData.value.instructionQuantity,
        startDate: newData.startDateTime ? newData.startDateTime.slice(0, 16) : workOrderData.value.startDate,
        expectedCompletion: newData.dueDate ? newData.dueDate.slice(0, 16) : workOrderData.value.expectedCompletion,
        instructionStatus: newData.status || workOrderData.value.instructionStatus,
        lineType: newData.lineCode ? '정형' : '비정형',
        lineCode: newData.lineCode || workOrderData.value.lineCode
    };

    console.log('🔄 otherDataFromChild 업데이트:', workOrderData.value);
});

// API 호출
const fetchWorkData = async (params = {}) => {
    isLoading.value = true;
    try {
        const response = await axios.get(API_URL, { params });
        allRows.value = response.data.data || [];
    } catch (error) {
        console.error('❌ 작업 데이터 로드 실패:', error);
        alert('데이터 로드 실패');
    } finally {
        isLoading.value = false;
    }
};

// 🔥 onMounted에서 query 데이터 먼저 로드
onMounted(() => {
    console.log('📍 onMounted 실행');
    console.log('📍 route.path:', route.path);
    console.log('📍 route.query:', route.loadDetailFromQuery);
    loadDetailFromQuery(); // query 데이터 먼저 로드
    fetchWorkData();
});

// 검색/초기화
const handleSearch = (form) => {
    searchCriteria.value = form;
    fetchWorkData(form);
};

const downloadExcel = () => {
    console.log('엑셀 다운로드:', searchCriteria.value);
};

// 🔹 DefaultInfo에서 선택된 값을 받는 이벤트
const handleOtherData = (data) => {
    otherDataFromChild.value = data;
    console.log('부모에서 받은 otherData:', data);
};

const handleReset = () => {
    searchCriteria.value = {};
    resetAllData(); // 🔥 데이터 초기화
    fetchWorkData();
};

// ✅ 새로운 함수 추가: DefaultInfo의 초기화 이벤트 받기
const handleResetFromChild = () => {
    console.log('👶 자식에서 초기화 신호 받음');

    // workOrderData도 함께 초기화
    workOrderData.value = {
        productName: '',
        instructionQuantity: '',
        startDate: '',
        expectedCompletion: '',
        instructionStatus: '',
        lineType: '',
        lineCode: ''
    };

    // defaultInfoData도 초기화
    defaultInfoData.value = {
        workOrderNo: '',
        productionPlanNo: '',
        planDate: ''
    };

    otherDataFromChild.value = null;

    console.log('✅ 모든 UI 초기화 완료');
};
</script>

<template>
    <div class="forward-check-page">
        <!-- DefaultInfo: defaultInfoData props 추가 -->
        <DefaultInfo :plan-data="allRows" :work-order-data="workOrderData" :default-info-data="defaultInfoData" @updateOtherData="handleOtherData" @search="handleSearch" @reset="handleReset" @resetForm="handleResetFromChild" />

        <!-- WorkInstructions: v-model 방식으로 양방향 바인딩 -->
        <WorkInstructions v-model:work-order-data="workOrderData" />

        <div v-if="isLoading" class="p-4 text-center text-lg text-blue-500 font-semibold">데이터 로드 중...</div>

        <NonStandardProcess v-else :rows="[]" @download="downloadExcel" />
    </div>
</template>

<style scoped>
.forward-check-page {
    padding: 1.5rem;
    background: #f5f6fa;
    width: 100%;
    box-sizing: border-box;
}
</style>
