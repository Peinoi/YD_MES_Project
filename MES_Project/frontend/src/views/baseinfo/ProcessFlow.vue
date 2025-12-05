<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
// PrimeVue 컴포넌트는 전역 등록되어 있다고 가정 (Sakai 템플릿 기본 구조)

// -------------------------------
// Mock 데이터 (API 연동 시 교체)
// -------------------------------
// 조회 필드
const searchForm = ref({
    processCode: '',
    processName: '',
    itemCode: '',
    itemName: '',
    regDate: null
});

// 공정 흐름도
const processList = ref([]);
const selectedProcess = ref(null);

// 흐름도 상세
const subProcessData = ref([]);
const selectedSubProcess = ref([]);

// 공정순서에 따라 데이터를 자동 정렬
const subProcessList = computed(() => {
    return [...subProcessData.value].sort((a, b) => a.no - b.no);
});

// 공형분류
const processStructureOptions = [
    { label: '비정형', value: 'p1' },
    { label: '정형', value: 'p2' }
];

// 기준정보 초기화
const onResetDetailForm = () => ({
    id: null,
    processCode: '',
    processName: '',
    itemCode: '',
    itemName: '',
    processStructure: '',
    reg: '',
    regDate: '',
    remark: ''
});

// 기준정보
const detailForm = ref(onResetDetailForm());

// -------------------------------
// 모달 데이터
// -------------------------------
const showProcessModal1 = ref(false); // 흐름도 코드/명 모달 호출
const processModalList1 = ref([]); // 모달 데이터

const showProcessModal2 = ref(false); // 제품 코드/명 모달 호출
const processModalList2 = ref([]); // 모달 데이터

const selectedProcessModal1 = ref([]);
const selectedProcessModal2 = ref([]);

// // -------------------------------
// // 이벤트 핸들러
// // -------------------------------

// Datatalbe 선택
const rowClass = (rowData) => {
    return selectedProcess.value && rowData.id === selectedProcess.value.id ? 'selected-row' : '';
};

// 흐름도 코드/명 모달호출
const openProcessModal1 = async () => {
    try {
        const response = await axios.get('/api/process/list');
        processModalList1.value = response.data;
        showProcessModal1.value = true;
    } catch (error) {
        console.error('데이터 조회 모달 실패', error.message);
    }
};
// 제품 코드/명 모달호출
const openProcessModal2 = async () => {
    try {
        const response = await axios.get('/api/process/list');
        processModalList2.value = response.data;
        showProcessModal2.value = true;
    } catch (error) {
        console.error('데이터 조회 모달 실패', error.message);
    }
};

// 공정 코드를 클릭하면 해당 값 볼 수 있는 모달 호출
// const openProcessDetail = async () =>

// 흐름도 코드/명 값 전달
const selectProcessFromModal1 = (event) => {
    const row = event.data;
    searchForm.value.processCode = row.processCode;
    searchForm.value.processName = row.processName;

    selectedProcessModal1.value = null; // 모달 닫기
    showProcessModal1.value = false; //
};
// 제품 코드/명 값 전달
const selectProcessFromModal2 = (event) => {
    const row = event.data;
    searchForm.value.itemCode = row.itemCode;
    searchForm.value.itemName = row.itemName;

    selectedProcessModal2.value = null; // 모달 닫기
    showProcessModal2.value = false;
};
// 초기화
const onResetSearch = () => {
    searchForm.value = {
        processCode: null,
        processName: null,
        itemCode: null,
        itemName: null,
        regDate: null
    };
};
// 조회
const onSearch = async () => {
    const params = searchForm.value;
    console.log(params);

    const queryParams = Object.keys(params).reduce((acc, key) => {
        const value = params[key];
        if (value !== null && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {});
    try {
        const response = await axios.get('/api/process/list', { params: queryParams });
        processList.value = response.data;
        console.log('조회 성공:', response.data);
        selectedProcess.value = null;
        detailForm.value = onResetDetailForm();
        subProcessData.value = [];
    } catch (error) {
        console.error('공정 흐름도 목록 조회 실패', error.message);
        processList.value = [];
        detailForm.value = onResetDetailForm();
    }
};

// 공정 흐름도를 선택 시 기준정보에 값이 들어가고 흐름도 상세 조회
const onSelectProcess = async () => {
    const row = selectedProcess.value;

    if (!row) {
        detailForm.value = onResetDetailForm();
        subProcessData.value = [];
        return;
    }
    detailForm.value = { ...row };
    // 흐름도 상세
    try {
        const response = await axios.get('/api/process/detail', {
            params: { processCode: row.processCode }
        });
        subProcessData.value = response.data;
    } catch (error) {
        console.error('흐름도 상세 조회 실패', error.message);
        subProcessData.value = [];
    }
};

const onDeleteProcess = () => {
    if (!selectedProcess.value) return;
    // TODO: 삭제 API 연동
    processList.value = processList.value.filter((b) => b.id !== selectedProcess.value.id);
    selectedProcess.value = null;
    detailForm.value = onResetDetailForm();
    subProcessData.value = [];
};

const onAddSubProcess = () => {
    const maxId = subProcessData.value.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const nextId = maxId + 1;
    const maxNo = subProcessData.value.reduce((max, item) => Math.max(max, Number(item.no) || 0), 0); // poNumber 대신 no 사용
    subProcessData.value.push({
        id: nextId,
        no: maxNo + 1, // 필드명을 no로 통일
        poCode: '',
        poName: '',
        machine: ''
    });
};

const onDeleteSubProcess = () => {
    const ids = new Set(selectedSubProcess.value.map((m) => m.id));
    subProcessData.value = subProcessData.value.filter((m) => !ids.has(m.id));
    selectedSubProcess.value = [];
};

// 공정순서 변화 시 데이터 업데이트
const updateSeq = (row, e) => {
    const value = Number(e.value);
    row.poNumber = value;
    // 정렬되도록 데이터 변경
    subProcessData.value = [...subProcessData.value].sort((a, b) => Number(a.poNumber) - Number(b.poNumber));
};

const onCreate = () => {
    // TODO: 등록 API 연동
    console.log('등록', detailForm.value, subProcessData.value);
};

const onUpdate = () => {
    // TODO: 수정 API 연동
    console.log('수정', detailForm.value, subProcessData.value);
};
</script>
<!-- src/views/ProcessFlow.vue -->
<template>
    <div class="p-fluid process-page">
        <!-- 상단 헤더(화면ID, 화면명 등)는 공통 레이아웃에서 처리한다고 보고 생략 -->
        <!-- 검색 영역 -->
        <div class="card search-panel">
            <div class="search-row">
                <div class="field">
                    <label for="processCode">흐름도코드</label>
                    <InputText id="processCode" v-model="searchForm.processCode" placeholder="흐름도코드 선택" readonly @click="openProcessModal1" />
                </div>

                <div class="field">
                    <label for="processName">흐름도명</label>
                    <InputText id="processName" v-model="searchForm.processName" placeholder="흐름도명 선택" readonly @click="openProcessModal1" />
                </div>

                <div class="field">
                    <label for="itemCode">제품코드</label>
                    <InputText id="itemCode" v-model="searchForm.itemCode" placeholder="제품코드 선택" readonly @click="openProcessModal2" />
                </div>

                <div class="field">
                    <label for="itemName">제품명</label>
                    <InputText id="itemName" v-model="searchForm.itemName" placeholder="제품명 선택" readonly @click="openProcessModal2" />
                </div>

                <div class="field date-range-field flex flex-column">
                    <label class="mb-1">등록일자</label>

                    <div class="align-items-center gap-2">
                        <Calendar v-model="searchForm.regDate" dateFormat="yy-mm-dd" :showIcon="true" class="w-full" />
                    </div>
                </div>
            </div>

            <div class="field button-group">
                <Button label="초기화" class="p-button-secondary" @click="onResetSearch" />
                <Button label="조회" class="p-button-warning" @click="onSearch" />
            </div>
        </div>

        <!-- 흐름도 코드/명 모달 -->
        <Dialog v-model:visible="showProcessModal1" header="흐름도 코드/명 선택" modal>
            <DataTable :value="processModalList1" v-model:selection="selectedProcessModal1" selectionMode="single" @rowSelect="selectProcessFromModal1" :paginator="true" :rows="10">
                <Column field="processCode" header="흐름도코드"></Column>
                <Column field="processName" header="흐름도명"></Column>
            </DataTable>
        </Dialog>

        <!-- 제품 코드/명 모달 -->
        <Dialog v-model:visible="showProcessModal2" header="제품 코드/명 선택" modal>
            <DataTable :value="processModalList2" v-model:selection="selectedProcessModal2" selectionMode="single" @rowSelect="selectProcessFromModal2" :paginator="true" :rows="10">
                <Column field="itemCode" header="제품코드"></Column>
                <Column field="itemName" header="제품명"></Column>
            </DataTable>
        </Dialog>

        <div class="card process-card">
            <div class="content-layout">
                <!-- 좌측: 공정 흐름도 -->
                <div class="left-pane">
                    <!-- 검색 결과 헤더 -->
                    <div class="list-header">
                        <span>공정흐름도</span>
                        <div>검색 결과 {{ processList.length }}건</div>
                        <div class="list-header-buttons">
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="!selectedProcess" @click="onDeleteProcess" />
                        </div>
                    </div>

                    <!-- 공정 흐름도 그리드 -->
                    <DataTable :value="processList" dataKey="id" selectionMode="single" v-model:selection="selectedProcess" @rowSelect="onSelectProcess" scrollable scrollHeight="220px" class="p-datatable-sm process-list-table" :rowClass="rowClass">
                        <Column field="processCode" header="흐름도코드" style="width: 90px"></Column>
                        <Column field="processName" header="흐름도명" style="width: 130px"></Column>
                        <Column field="itemCode" header="제품코드" style="width: 90px"></Column>
                        <Column field="itemName" header="제품명" style="width: 90px"></Column>
                        <Column field="regDate" header="등록일자" style="width: 100px">
                            <template #body="{ data }">{{ data.regDate ? data.regDate.slice(0, 10) : '' }}</template></Column
                        >
                        <Column field="remark" header="비고" style="width: 150px"></Column>
                    </DataTable>

                    <!-- 좌하단: 흐름도 상세 -->
                    <div class="sub-process-header">
                        <span>흐름도 상세</span>
                        <div class="sub-process-buttons">
                            <Button label="행 추가" class="p-button-outlined p-button-sm" @click="onAddSubProcess" />
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="selectedSubProcess.length === 0" @click="onDeleteSubProcess" />
                        </div>
                    </div>

                    <div class="sub-process-wrapper">
                        <DataTable :value="subProcessList" dataKey="id" v-model:selection="selectedSubProcess" selectionMode="single" class="p-datatable-sm sub-process-table">
                            <Column selectionMode="multiple" headerStyle="width:3rem"></Column>
                            <!-- 공정순서: 숫자 입력 -->
                            <Column field="no" header="공정순서" style="width: 60px">
                                <template #body="{ data }">
                                    <InputNumber v-model="data.no" @change="(e) => updateSeq(data, e.value)" :min="1" :useGrouping="false" style="width: 60px" class="p-inputtext-tight" />
                                </template>
                            </Column>
                            <!-- 공정코드 + 돋보기 버튼 -->
                            <Column field="po_code" header="공정코드" style="width: 120px">
                                <template #body="{ data }">
                                    <div class="flex align-items-center gap-2">
                                        <InputText v-model="data.po_code" disabled style="width: 120px" /><Button icon="pi pi-search" class="p-button-text p-button-sm" @click="openProcessDetail(data)" />
                                    </div> </template
                            ></Column>
                            <Column field="po_name" header="공정명" style="width: 100px"> ></Column>
                            <Column field="eq_type_name" header="설비유형" style="width: 120px"> </Column>
                        </DataTable>
                    </div>
                </div>

                <!-- 우측: 기준정보 영역 -->
                <div class="right-pane">
                    <div class="right-header">
                        <div class="flex-gap"></div>
                        <span>기준정보</span>
                        <div class="right-header-buttons">
                            <Button label="등록" class="p-button-success p-button-sm" @click="onCreate" />
                            <Button label="수정" class="p-button-primary p-button-sm" :disabled="!detailForm.id" @click="onUpdate" />
                        </div>
                    </div>

                    <div class="detail-form">
                        <div class="form-grid">
                            <div class="field">
                                <label>제품공정 흐름도 코드</label>
                                <InputText v-model="detailForm.processCode" placeholder="자동입력" disabled />
                            </div>

                            <div class="field">
                                <label>제품 흐름도명</label>
                                <InputText v-model="detailForm.processName" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>제품코드</label>
                                <InputText v-model="detailForm.itemCode" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>제품명</label>
                                <InputText v-model="detailForm.itemName" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>공형분류</label>
                                <Dropdown v-model="detailForm.processStructure" :options="processStructureOptions" optionLabel="label" optionValue="value" placeholder="정형/비정형" />
                            </div>

                            <div class="field">
                                <label>등록자</label>
                                <div class="p-inputgroup">
                                    <InputText v-model="detailForm.reg" placeholder="자동입력" disabled />
                                </div>
                            </div>

                            <div class="field">
                                <label>등록일자</label>
                                <InputText :value="detailForm.regDate ? detailForm.regDate.slice(0, 10) : ''" />
                            </div>

                            <div class="field full-width">
                                <label>비고</label>
                                <Textarea v-model="detailForm.remark" :rows="4" autoResize placeholder="특이사항이 있는 경우 입력합니다." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.process-page {
    padding: 1rem;
}

.process-card {
    padding: 1.5rem;
}

/* 검색 영역 */
.search-panel {
    margin-bottom: 1rem;
}

.search-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1rem;
    align-items: end;
}
.search-row .field {
    display: flex;
    flex-direction: column;
    justify-content: flex-end; /* 내용을 아래쪽으로 밀어서 다른 인풋과 하단 맞춤 */
}

.button-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 20px;
    justify-content: center;
}

/* 메인 레이아웃 */
.content-layout {
    display: grid;
    grid-template-columns: 2.1fr 1.7fr;
    gap: 1.5rem;
}
.selected-row {
    background-color: #cce5ff !important; /* 선택된 row 강조 */
}
/* 좌측 영역 */
.left-pane {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-header-buttons {
    display: flex;
    gap: 0.5rem;
}

.sub-process-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.sub-process-buttons {
    display: flex;
    gap: 0.5rem;
}

.hint-text {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #777;
}

/* 우측 영역 */
.right-pane {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.right-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.right-header-buttons {
    display: flex;
    gap: 0.5rem;
}

.detail-form {
    border: 1px solid var(--surface-border);
    border-radius: 4px;
    padding: 1rem;
    background: var(--surface-card);
}
.detail-form .field {
    display: flex;
    flex-direction: column;
}
.detail-form .field label {
    margin-bottom: 0.25rem;
    white-space: nowrap; /* ⚠️ 등록일자 라벨 줄 바꿈 방지 (핵심 해결) */
}
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.5rem;
}

.form-grid .full-width {
    grid-column: 1 / -1;
}

.warning-text {
    margin-top: auto;
    text-align: right;
    font-size: 0.8rem;
    color: #c0392b;
}

/* 상태 표시 */
.status-tag {
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.75rem;
}

.status-active {
    background-color: #e6f7e9;
    color: #1e8449;
}

.status-inactive {
    background-color: #fdecea;
    color: #c0392b;
}

@media (max-width: 1200px) {
    .content-layout {
        grid-template-columns: 1fr;
    }
}
.p-inputtext-tight {
    width: 60px;
}
.p-datatable-sm .pinputnumber {
    width: 100%;
}
.sub-process-table :deep(.p-inputnumber .p-inputnumber-input) {
    width: 60px;
}
.process-list-table :deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
    background-color: var(--surface-card) !important;
    color: var(--text-color) !important;
}
.sub-process-table :deep(.p-datatable .p-datatable-tbody > tr.p-highligt) {
    background-color: var(--surface-card) !important;
    color: var(--text-color) !important;
}
.sub-process-wrapper :deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
    background-color: var(--surface-card) !important;
    color: var(--text-color) !important;
}
.sub-process-wrapper :deep(.p-datatable .p-datatable-tbody > tr:not(.p-highlight):hover),
.process-list-table :deep(.p-datatable .p-datatable-tbody > tr:not(.p-highlight):hover) {
    background: var(--surface-hover);
    color: var(--text-color);
}
</style>
