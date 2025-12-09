<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useRouter } from 'vue-router';
import SearchSelectModal from '@/components/common/SearchSelectModal.vue'; // 경로가 맞는지 확인 필요

const router = useRouter();

// --- 1. 상태 및 필터 ---
const filters = ref({
    qio_code: '',
    proc_name: '',
    prod_name: '',
    insp_date_start: '',
    insp_date_end: ''
});

const allList = ref([]); // API로 가져온 원본 목록
const tableRows = ref([]); // 화면에 표시될 목록 (필터링 적용)
const allChecked = ref(false); // 전체 선택 체크박스 상태

// --- 2. 모달 상태 및 설정 ---
const isModalVisible = ref(false);
const modalType = ref('');
const modalTitle = ref('');
const modalColumns = ref([]);
const modalRows = ref([]);
const modalSearchPlaceholder = ref('');

// --- 3. API 및 데이터 로직 ---

// 품질 검사 지시 목록 조회
const fetchQIOList = async () => {
    try {
        // TODO: 실제 API 엔드포인트로 수정 필요
        const response = await axios.get('/api/quality/qio/list');
        allList.value = response.data.map((item) => ({
            ...item,
            qio_date: item.qio_date ? item.qio_date.slice(0, 10) : '',
            insp_date: item.insp_date ? item.insp_date.slice(0, 10) : '',
            checked: false
        }));
        tableRows.value = [...allList.value];
    } catch (error) {
        console.error('품질 검사 지시 목록 조회 실패:', error);
        // 목 데이터 사용
        const mockData = [
            { qio_code: 'QIO-20240729-001', qio_date: '2024-07-29', insp_date: '2024-08-05', proc_name: '조립공정', prod_name: '엔진블록', insp_type: '수입검사', status: '지시', checked: false },
            { qio_code: 'QIO-20240729-002', qio_date: '2024-07-29', insp_date: '2024-08-06', proc_name: '도장공정', prod_name: '차체 프레임', insp_type: '공정검사', status: '완료', checked: false }
        ];
        allList.value = mockData;
        tableRows.value = [...allList.value];
    }
};

// 모달에 표시할 데이터 조회
const fetchModalData = async (type, keyword = '') => {
    let url = '';
    const params = { keyword };
    switch (type) {
        case 'qio':
            url = '/api/quality/qio/list'; // 예시 API
            break;
        case 'process':
            url = '/api/process/list'; // 예시 API
            break;
        case 'product':
            url = '/api/product/list'; // 예시 API
            break;
    }
    try {
        const response = await axios.get(url, { params });
        modalRows.value = response.data;
    } catch (error) {
        console.error(`${type} 모달 데이터 조회 실패:`, error);
        modalRows.value = []; // 오류 발생 시 빈 배열로 초기화
    }
};

// --- 4. 이벤트 핸들러 ---

// 조회 버튼 클릭
const onSearch = () => {
    const f = filters.value;
    tableRows.value = allList.value.filter((row) => {
        const isQioMatch = !f.qio_code || row.qio_code.includes(f.qio_code);
        const isProcMatch = !f.proc_name || row.proc_name.includes(f.proc_name);
        const isProdMatch = !f.prod_name || row.prod_name.includes(f.prod_name);
        const isDateMatch = (!f.insp_date_start || row.insp_date >= f.insp_date_start) && (!f.insp_date_end || row.insp_date <= f.insp_date_end);
        return isQioMatch && isProcMatch && isProdMatch && isDateMatch;
    });
};

// 초기화 버튼 클릭
const onReset = () => {
    filters.value = {
        qio_code: '',
        proc_name: '',
        prod_name: '',
        insp_date_start: '',
        insp_date_end: ''
    };
    tableRows.value = [...allList.value];
    allChecked.value = false;
};

// 모달 열기
const openModal = async (type) => {
    modalType.value = type;
    isModalVisible.value = true;
    modalRows.value = []; // 이전 데이터 초기화

    switch (type) {
        case 'qio':
            modalTitle.value = '지시코드 선택';
            modalColumns.value = [
                { field: 'qio_code', label: '지시코드' },
                { field: 'insp_date', label: '지시일자' }
            ];
            modalSearchPlaceholder.value = '지시코드를 입력하세요.';
            break;
        case 'process':
            modalTitle.value = '공정 선택';
            modalColumns.value = [
                { field: 'proc_code', label: '공정코드' },
                { field: 'proc_name', label: '공정명' }
            ];
            modalSearchPlaceholder.value = '공정명을 입력하세요.';
            break;
        case 'product':
            modalTitle.value = '제품 선택';
            modalColumns.value = [
                { field: 'prod_code', label: '제품코드' },
                { field: 'prod_name', label: '제품명' }
            ];
            modalSearchPlaceholder.value = '제품명을 입력하세요.';
            break;
    }
    await fetchModalData(type);
};

// 모달에서 검색
const handleModalSearch = (keyword) => {
    fetchModalData(modalType.value, keyword);
};

// 모달에서 항목 선택
const handleModalConfirm = (selectedItem) => {
    if (!selectedItem) {
        alert('항목을 선택해주세요.');
        return;
    }
    switch (modalType.value) {
        case 'qio':
            filters.value.qio_code = selectedItem.qio_code;
            break;
        case 'process':
            filters.value.proc_name = selectedItem.proc_name;
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
        공정명: row.proc_name,
        제품명: row.prod_name,
        검사유형: row.insp_type,
        검사예정일: row.insp_date,
        지시일자: row.qio_date,
        상태: row.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '품질검사지시목록');

    // 파일명 생성 (예: 품질검사지시목록_20240730.xlsx)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    XLSX.writeFile(workbook, `품질검사지시목록_${today}.xlsx`);
};

// 상세 페이지로 이동
const goDetail = (row) => {
    if (!row?.qio_code) return;
    // TODO: 상세 페이지 라우트 이름 확인 후 수정
    router.push({ name: 'QualityInstructionsManagement', params: { qio_code: row.qio_code } });
};

// --- 5. 라이프사이클 ---
onMounted(() => {
    fetchQIOList();
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
                        <label>공정명</label>
                        <input class="input" v-model="filters.proc_name" readonly placeholder="공정 선택" @click="openModal('process')" />
                    </div>
                    <div class="form-item">
                        <label>제품명</label>
                        <input class="input" v-model="filters.prod_name" readonly placeholder="제품 선택" @click="openModal('product')" />
                    </div>

                    <!-- 2행 -->
                    <div class="form-item">
                        <label>지시일자 - 시작일</label>
                        <Calendar v-model="filters.insp_date_start" dateFormat="yy-mm-dd" placeholder="시작일" showIcon class="date-calendar" />
                    </div>
                    <div class="form-item">
                        <label>지시일자 - 종료일</label>
                        <Calendar v-model="filters.insp_date_end" dateFormat="yy-mm-dd" placeholder="종료일" showIcon class="date-calendar" />
                    </div>

                    <!-- 3행 -->
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
                                <th>공정명</th>
                                <th>제품명</th>
                                <th>검사유형</th>
                                <th>검사예정일</th>
                                <th>상태</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="row in tableRows" :key="row.id" class="table-row">
                                <td>
                                    <input type="checkbox" v-model="row.checked" @change="updateAllCheckedState" @click.stop />
                                </td>
                                <td>{{ row.qio_code }}</td>
                                <td>{{ row.qio_date }}</td>
                                <td>{{ row.proc_name }}</td>
                                <td>{{ row.prod_name }}</td>
                                <td>{{ row.insp_type }}</td>
                                <td>{{ row.insp_date }}</td>
                                <td>{{ row.status }}</td>
                            </tr>

                            <tr v-if="!tableRows.length">
                                <td colspan="8" class="empty-cell">조회 결과가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <SearchSelectModal
            v-model="isModalVisible"
            :title="modalTitle"
            :columns="modalColumns"
            :rows="modalRows"
            :search-placeholder="modalSearchPlaceholder"
            @search="handleModalSearch"
            @confirm="handleModalConfirm"
            @cancel="isModalVisible = false"
        />
    </div>
</template>

<style scoped>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
    justify-content: center;
    gap: 8px;
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

.text-right {
    text-align: right;
}

.empty-cell {
    text-align: center;
    color: #888;
    padding: 20px 0;
}

.table-scroll {
    max-height: 410px; /* 대략 12행 정도 높이 */
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
