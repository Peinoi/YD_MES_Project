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
const selectedProcessCode = ref('PP001'); // 현재 선택된 공정의 '공정코드' (초기값 설정)

// 이미지에 기반한 임시 데이터
const processList = ref([
    { processCode: 'PP001', processName: 'A공정', processType: '라인', status: '사용중' },
    { processCode: 'PP002', processName: 'B공정', processType: '라인', status: '사용가능' },
    { processCode: 'PP003', processName: 'C공정', processType: '라인', status: '사용가능' },
    { processCode: 'PP004', processName: 'D공정', processType: '비정형', status: '사용가능' },
    { processCode: 'PP005', processName: 'E공정', processType: '비정형', status: '사용중' }
]);

// 검색 기능 구현 (공정 유형 또는 상태로 검색)
const filteredProcessList = computed(() => {
    const search = searchInput.value.toLowerCase();
    if (!search) return processList.value;

    return processList.value.filter((process) => process.processType.toLowerCase().includes(search) || process.status.toLowerCase().includes(search));
});

// 검색 버튼 클릭 핸들러
const handleSearch = () => {
    console.log('공정 검색 실행:', searchInput.value);
    // filteredProcessList가 자동으로 업데이트됨
};

// 행 선택 핸들러
const selectRow = (process) => {
    selectedProcessCode.value = process.processCode;
};

// 확인 버튼 핸들러
const handleConfirm = () => {
    const selectedProcess = processList.value.find((p) => p.processCode === selectedProcessCode.value);
    emit('select', selectedProcess); // 선택된 공정 객체를 부모로 전달
    // emit('close'); // 부모의 select 핸들러에서 닫을 수도 있음
};

// 취소 버튼 핸들러
const handleCancel = () => {
    emit('close');
};
</script>

<template>
    <div v-if="props.show" class="modal-backdrop">
        <div class="modal-container">
            <div class="search-area flex mb-3 p-3 border-b border-gray-200">
                <input type="text" v-model="searchInput" placeholder="공정 유형 또는 상태를 입력해주세요." class="search-input" @keyup.enter="handleSearch" />
                <button @click="handleSearch" class="search-btn bg-blue-600 hover:bg-blue-700 text-white">검색</button>
            </div>

            <div class="data-table-wrapper overflow-y-auto mb-4">
                <table class="data-table w-full">
                    <thead>
                        <tr>
                            <th class="select-col">선택</th>
                            <th>공정코드</th>
                            <th>공정명</th>
                            <th>공정유형</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="process in filteredProcessList" :key="process.processCode" :class="{ 'row-selected': process.processCode === selectedProcessCode }" @click="selectRow(process)">
                            <td class="select-col">
                                <input type="checkbox" :checked="process.processCode === selectedProcessCode" @change="selectRow(process)" class="h-4 w-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500" />
                            </td>
                            <td>{{ process.processCode }}</td>
                            <td>{{ process.processName }}</td>
                            <td>{{ process.processType }}</td>
                            <td>{{ process.status }}</td>
                        </tr>
                        <tr v-if="filteredProcessList.length === 0">
                            <td colspan="5" class="text-center py-4 text-gray-500">검색 결과가 없습니다.</td>
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
/* ⭐ 이전 PlanModal의 스타일을 재활용하여 일관성을 유지합니다. */

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
    z-index: 1000;
}

/* 모달 컨테이너 스타일 */
.modal-container {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 650px;
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
    flex-grow: 1;
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
    background-color: #f7f7f7;
    font-weight: 600;
    color: #444;
}

.data-table th {
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
    background-color: #ffeccf;
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
    color: #333;
}
</style>
