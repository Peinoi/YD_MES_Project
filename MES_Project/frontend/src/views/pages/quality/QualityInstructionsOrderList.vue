<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQualityStore } from '@/stores/qualityStore';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import SearchModal from './SearchModal.vue'; // SearchModal로 변경

const router = useRouter();
const qualityStore = useQualityStore();

// --- 1. 상태 및 필터 ---
const filters = ref({
    qio_code: '',
    prod_name: '', // item_name으로 필터링하기 위해 유지
    insp_date_start: '',
    insp_date_end: ''
});

const allList = computed(() =>
    qualityStore.qualityInstructionsOrderList.map((item) => ({
        ...item,
        checked: false
    }))
);
const tableRows = ref([]);
const allChecked = ref(false);

// --- 2. 모달 상태 및 설정 ---
const isModalVisible = ref(false);
const modalType = ref('');
const modalTitle = ref('');
const modalColumns = ref([]);
const modalRows = ref([]);

// --- 3. 이벤트 핸들러 ---

// 날짜 포맷 함수
const formatDate = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date; // 이미 문자열이면 그대로 반환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 조회 버튼 클릭
const onSearch = () => {
    const f = filters.value;
    const startDate = formatDate(f.insp_date_start);
    const endDate = formatDate(f.insp_date_end);

    tableRows.value = allList.value.filter((row) => {
        const isQioMatch = !f.qio_code || row.qio_code.includes(f.qio_code);
        const isProdMatch = !f.prod_name || (row.item_name && row.item_name.includes(f.prod_name));
        const isDateMatch = (!startDate || row.insp_date >= startDate) && (!endDate || row.insp_date <= endDate);
        return isQioMatch && isProdMatch && isDateMatch;
    });
};

// 초기화 버튼 클릭
const onReset = () => {
    filters.value = {
        qio_code: '',
        prod_name: '',
        insp_date_start: '',
        insp_date_end: ''
    };
    tableRows.value = [...allList.value];
    allChecked.value = false;
    tableRows.value.forEach((row) => (row.checked = false));
};

// 모달 열기
const openModal = (type) => {
    modalType.value = type;
    isModalVisible.value = true;
    modalRows.value = [];

    switch (type) {
        case 'qio':
            modalTitle.value = '지시코드 선택';
            modalColumns.value = [
                { field: 'qio_code', header: '지시코드' },
                { field: 'insp_date', header: '지시일자' }
            ];
            modalRows.value = allList.value; // 전체 목록 전달
            break;
        case 'product':
            modalTitle.value = '제품명 선택';
            modalColumns.value = [{ field: 'prod_name', header: '제품명' }];
            const itemNames = [...new Set(allList.value.map((item) => item.item_name).filter(Boolean))];
            modalRows.value = itemNames.map((name) => ({ prod_name: name }));
            break;
    }
};

// 모달에서 항목 선택
const handleModalConfirm = (selectedItem) => {
    if (!selectedItem) {
        // SearchModal은 선택하지 않고 확인을 누르면 null을 반환할 수 있음
        return;
    }
    switch (modalType.value) {
        case 'qio':
            filters.value.qio_code = selectedItem.qio_code;
            break;
        case 'product':
            filters.value.prod_name = selectedItem.prod_name;
            break;
    }
    isModalVisible.value = false;
};

// 전체 선택/해제
const toggleAll = () => {
    tableRows.value.forEach((row) => {
        row.checked = allChecked.value;
    });
};

// 개별 체크박스 변경 시 전체 선택 체크박스 상태 업데이트
const updateAllCheckedState = () => {
    if (tableRows.value.length === 0) {
        allChecked.value = false;
        return;
    }
    allChecked.value = tableRows.value.every((row) => row.checked);
};

// 엑셀 다운로드
const downloadExcel = () => {
    const selected = tableRows.value.filter((row) => row.checked);
    if (selected.length === 0) {
        alert('다운로드할 항목을 선택해주세요.');
        return;
    }
    const dataToExport = selected.map((row) => ({
        지시코드: row.qio_code,
        지시일자: row.insp_date,
        검사유형: row.inspection_type,
        제품명: row.item_name,
        상태: row.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '품질검사지시목록');
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(workbook, `품질검사지시목록_${today}.xlsx`);
};

// 행 클릭 시 체크박스 토글
const goDetail = (row) => {
    if (row) {
        row.checked = !row.checked;
        updateAllCheckedState();
    }
};

// --- 라이프사이클 ---
onMounted(async () => {
    await qualityStore.fetchQualityInstructionsOrderList();
    tableRows.value = [...allList.value]; // 초기 데이터 로드
});
</script>

<template>
    <div class="inbound-container">
        <section class="p-2 mx-auto filter-section">
            <div class="card-block filter-block">
                <h3 class="section-title">품질 검사 지시 조회</h3>
                <div class="filter-grid">
                    <!-- 1행 -->
                    <div class="form-item">
                        <label>지시코드</label>
                        <input class="input" v-model="filters.qio_code" readonly placeholder="지시코드 선택" @click="openModal('qio')" />
                    </div>
                    <div class="form-item">
                        <label>제품명</label>
                        <input class="input" v-model="filters.prod_name" readonly placeholder="제품 선택" @click="openModal('product')" />
                    </div>
                    <div class="form-item">
                        <label>지시일자 - 시작일</label>
                        <Calendar v-model="filters.insp_date_start" dateFormat="yy-mm-dd" placeholder="시작일" showIcon class="date-calendar" />
                    </div>
                    <div class="form-item">
                        <label>지시일자 - 종료일</label>
                        <Calendar v-model="filters.insp_date_end" dateFormat="yy-mm-dd" placeholder="종료일" showIcon class="date-calendar" />
                    </div>

                    <!-- Actions -->
                    <div class="form-item form-actions">
                        <button class="btn-black" @click="onReset">전체</button>
                        <button class="btn-yellow" @click="onSearch">조회</button>
                    </div>
                </div>
            </div>

            <div class="result-block mt-6">
                <div class="result-header">
                    <h3 class="section-title">품질 검사 지시 목록</h3>
                    <div class="result-info">
                        검색 결과 <span class="highlight">{{ tableRows.length }}</span
                        >건
                    </div>
                    <button class="btn-excel" @click="downloadExcel">엑셀 다운로드</button>
                </div>
                <div class="table-scroll">
                    <table class="nice-table">
                        <thead>
                            <tr>
                                <th style="width: 40px">
                                    <input type="checkbox" v-model="allChecked" @change="toggleAll" />
                                </th>
                                <th>지시코드</th>
                                <th>지시일자</th>
                                <th>검사유형</th>
                                <th>제품명</th>
                                <th>상태</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="row in tableRows" :key="row.qio_code" class="table-row" @click="goDetail(row)">
                                <td>
                                    <input type="checkbox" v-model="row.checked" @change="updateAllCheckedState" @click.stop />
                                </td>
                                <td>{{ row.qio_code }}</td>
                                <td>{{ row.insp_date }}</td>
                                <td>{{ row.inspection_type }}</td>
                                <td>{{ row.item_name }}</td>
                                <td>{{ row.status }}</td>
                            </tr>

                            <tr v-if="!tableRows.length">
                                <td colspan="6" class="empty-cell">조회 결과가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- SearchModal로 교체 -->
        <SearchModal v-model:visible="isModalVisible" :header="modalTitle" :data="modalRows" :columns="modalColumns" @onConfirm="handleModalConfirm" />
    </div>
</template>

<style scoped>
/* 스타일은 이전과 동일하게 유지 */
.inbound-container {
    font-family: 'Pretendard', 'Inter', sans-serif;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    height: calc(100vh - 11.5rem);
}
.filter-section {
    max-width: 100%;
    overflow-x: hidden;
}

.card-block {
    padding: 20px;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 18px;
    color: #444;
    display: inline-block;
}

.filter-block {
    border: 1px solid #e0e0e0;
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 14px 24px;
}

.form-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.form-item label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #444;
}

.input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.form-actions {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: flex-start;
    gap: 8px;
    margin-top: auto; /* Aligns buttons to the bottom */
}

.btn-black {
    background: #000;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-yellow {
    background: #ffc94a;
    padding: 8px 14px;
    border-radius: 6px;
}

/* 결과 영역 */
.result-block {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 16px 20px 20px;
    background: #fff;
    height: auto;
}

.result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.result-info {
    font-size: 14px;
}

.highlight {
    font-weight: 700;
    color: #f7a600;
}

.btn-excel {
    background: #1d6f42;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
}

/* 날짜 선택 버튼(Calendar) 스타일 복원 */
:deep(.date-calendar.p-calendar) {
    width: 100%;
    display: flex;
    align-items: center;
}

:deep(.date-calendar .p-inputtext) {
    flex: 1 1 auto;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border-radius: 6px 0 0 6px; /* 왼쪽만 둥글게 */
    border: 1px solid #ccc;
    border-right: 0; /* 아이콘 버튼이랑 경계선 공유 */
    box-sizing: border-box;
    font-size: 14px;
}

:deep(.date-calendar .p-datepicker-trigger) {
    height: 40px;
    padding: 0 10px;
    border-radius: 0 6px 6px 0; /* 오른쪽만 둥글게 */
    border: 1px solid #ccc;
    border-left: 0;
    background: #f9f9f9;
    box-sizing: border-box;
    flex-shrink: 0;
    color: #666;
}

/* 테이블 */
.nice-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.nice-table th,
.nice-table td {
    padding: 8px 10px;
    font-size: 14px;
    border-bottom: 1px solid #eee;
}

.nice-table th {
    background: #faf7e8;
    text-align: left;
}

.empty-cell {
    text-align: center;
    color: #888;
    padding: 20px 0;
}

.table-scroll {
    max-height: 210px;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 6px;
}

.table-scroll thead th {
    position: sticky;
    top: 0;
    background: #faf7e8;
    z-index: 2;
    border-top: 2px solid #f4b321;
    box-shadow: 0 2px 0 #eee;
}

.table-row {
    cursor: pointer;
}

.table-row:hover {
    background: #faf6e4;
}
</style>
