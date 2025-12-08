<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
// PrimeVue 컴포넌트는 전역 등록되어 있다고 가정 (Sakai 템플릿 기본 구조)

// -------------------------------
// Mock 데이터 (API 연동 시 교체)
// -------------------------------
// 조회 필드
const searchForm = ref({
    lineCode: '',
    lineName: '',
    useYn: '',
    regDate: null
});

// 라인 흐름도
const lineList = ref([]);
const selectedLine = ref(null);

// 라인 공정 및 설비 구성 영역
const subLineData = ref([]);
const selectedSubLine = ref([]);

// 공정순서에 따라 데이터를 자동 정렬
const subLineList = computed(() => {
    return [...subLineData.value].sort((a, b) => a.lineSeq - b.lineSeq);
});

// 라인정보 초기화
const onResetDetailForm = () => ({
    id: null,
    lineCode: '',
    lineName: '',
    lineType: '',
    processCount: '',
    mdept: '',
    useYn: '',
    regDate: '',
    remark: ''
});

// 라인정보
const detailForm = ref(onResetDetailForm());

// -------------------------------
// 모달 데이터
// -------------------------------
const showLineModal1 = ref(false); // 흐름도 코드/명 모달 호출
const lineModalList1 = ref([]); // 모달 데이터
const selectedLineModal1 = ref([]);

// // -------------------------------
// // 이벤트 핸들러
// // -------------------------------

const rowClass = (rowData) => {
    return selectedLine.value && rowData.id === selectedLine.value.id ? 'selected-row' : '';
};
// 흐름도 코드/명 모달호출
const openLineModal1 = async () => {
    try {
        const response = await axios.get('/api/process/line');
        lineModalList1.value = response.data;
        showLineModal1.value = true;
    } catch (error) {
        console.error('데이터 조회 모달 실패', error.message);
    }
};
// 라인 코드/명 값 전달
const selectLineFromModal1 = (event) => {
    const row = event.data;
    searchForm.value.lineCode = row.lineCode;
    searchForm.value.lineName = row.lineName;

    selectedLineModal1.value = null; // 모달 닫기
    showLineModal1.value = false; //
};
// 초기화
const onResetSearch = () => {
    searchForm.value = {
        lineCode: null,
        lineName: null,
        useYn: null,
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
        const response = await axios.get('/api/process/line', { params: queryParams });
        lineList.value = response.data;
        console.log('조회 성공:', response.data);
        selectedLine.value = null;
        detailForm.value = onResetDetailForm();
        subLineData.value = [];
    } catch (error) {
        console.error('공정 흐름도 목록 조회 실패', error.message);
        lineList.value = [];
        detailForm.value = onResetDetailForm();
    }
};

const onSelectLine = async () => {
    const row = selectedLine.value;

    if (!row) {
        detailForm.value = onResetDetailForm();
        subLineData.value = [];
        return;
    }
    detailForm.value = { ...row };

    try {
        const response = await axios.get('/api/process/linedetail', {
            params: { lineCode: row.lineCode }
        });
        subLineData.value = response.data;
    } catch (error) {
        console.error('라인 상세정보 조회 실패', error.message);
        subLineData.value = [];
    }
};

const onDeleteLine = () => {
    if (!selectedLine.value) return;
    // TODO: 삭제 API 연동
    lineList.value = lineList.value.filter((b) => b.id !== selectedLine.value.id);
    selectedLine.value = null;
    detailForm.value = onResetDetailForm();
    subLineData.value = [];
};

const onAddSubLine = () => {
    const maxId = subLineData.value.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const nextId = maxId + 1;
    const maxlineSeq = subLineData.value.reduce((max, item) => Math.max(max, Number(item.lineSeq) || 0), 0);
    subLineData.value.push({
        id: nextId,
        lineSeq: maxlineSeq + 1,
        poCode: '',
        poName: '',
        machine: ''
    });
};

const onDeleteSubLine = () => {
    const ids = new Set(selectedSubLine.value.map((m) => m.id));
    subLineData.value = subLineData.value.filter((m) => !ids.has(m.id));
    selectedSubLine.value = [];
};

// 공정순서 변화 시 데이터 업데이트
const updateSeq = (row, e) => {
    const value = Number(e.value);
    row.lineSeq = value;
    // 정렬되도록 데이터 변경
    subLineData.value = [...subLineData.value].sort((a, b) => Number(a.lineSeq) - Number(b.lineSeq));
};

const onCreate = () => {
    // TODO: 등록 API 연동
    console.log('등록', detailForm.value, subLineData.value);
};

const onUpdate = () => {
    // TODO: 수정 API 연동
    console.log('수정', detailForm.value, subLineData.value);
};
</script>
<template>
    <div class="p-fluid process-page">
        <!-- 상단 헤더(화면ID, 화면명 등)는 공통 레이아웃에서 처리한다고 보고 생략 -->
        <!-- 검색 영역 -->
        <div class="card search-panel">
            <div class="search-row">
                <div class="field">
                    <label for="lineCode">라인코드</label>
                    <InputText id="lineCode" v-model="searchForm.lineCode" placeholder="흐름도코드 선택" readonly @click="openLineModal1" />
                </div>

                <div class="field">
                    <label for="lineName">라인명</label>
                    <InputText id="lineName" v-model="searchForm.lineName" placeholder="흐름도명 선택" readonly @click="openLineModal1" />
                </div>

                <div class="field">
                    <label for="useYn">사용여부</label>
                    <InputText id="useYn" v-model="searchForm.useYn" placeholder="사용여부" readonly />
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

        <!-- 라인 코드/명 모달 -->
        <Dialog v-model:visible="showLineModal1" header="흐름도 코드/명 선택" modal>
            <DataTable :value="lineModalList1" v-model:selection="selectLineFromModal1" selectionMode="single" @rowSelect="selectLineFromModal1" :paginator="true" :rows="10">
                <Column field="lineCode" header="흐름도코드"></Column>
                <Column field="lineName" header="흐름도명"></Column>
            </DataTable>
        </Dialog>

        <div class="card process-card">
            <div class="content-layout">
                <!-- 좌측: 공정 흐름도 -->
                <div class="left-pane">
                    <!-- 검색 결과 헤더 -->
                    <div class="list-header">
                        <span>라인흐름도</span>
                        <div>검색 결과 {{ lineList.length }}건</div>
                        <div class="list-header-buttons">
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="!selectedLine" @click="onDeleteLine" />
                        </div>
                    </div>

                    <!-- 공정 흐름도 그리드 -->
                    <DataTable :value="lineList" dataKey="id" selectionMode="single" :rowClass="rowClass" v-model:selection="selectedLine" @rowSelect="onSelectLine" scrollable scrollHeight="220px" class="p-datatable-sm process-list-table">
                        <Column field="lineCode" header="라인코드" style="width: 90px"></Column>
                        <Column field="lineName" header="라인명" style="width: 130px"></Column>
                        <Column field="lineType" header="라인유형" style="width: 90px"></Column>
                        <Column field="processCount" header="공정수" style="width: 90px"></Column>
                        <Column field="useYn" header="사용여부" style="width: 90px"></Column>
                        <Column field="regDate" header="등록일자" style="width: 100px">
                            <template #body="{ data }">{{ data.regDate ? data.regDate.slice(0, 10) : '' }}</template></Column
                        >
                    </DataTable>

                    <!-- 좌하단: 흐름도 상세 -->
                    <div class="sub-process-header">
                        <span>라인 공정 및 설비 구성 영역</span>
                        <div class="sub-process-buttons">
                            <Button label="행 추가" class="p-button-outlined p-button-sm" @click="onAddSubLine" />
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="selectedSubLine.length === 0" @click="onDeleteSubLine" />
                        </div>
                    </div>

                    <div class="sub-process-wrapper">
                        <DataTable :value="subLineList" dataKey="id" v-model:selection="selectedSubLine" selectionMode="single" class="p-datatable-sm sub-process-table">
                            <Column selectionMode="multiple" headerStyle="width:3rem"></Column>
                            <!-- 공정순서: 숫자 입력 -->
                            <Column field="lineSeq" header="공정순서" style="width: 60px">
                                <template #body="{ data }"><InputNumber v-model="data.lineSeq" @input="(e) => updateSeq(data, Number(e.value))" :min="1" :useGrouping="false" style="width: 60px" class="p-inputtext-tight" /> </template
                            ></Column>
                            <!-- 공정코드 + 돋보기 버튼 -->
                            <Column field="processName" header="공정명" style="width: 120px">
                                <template #body="{ data }">
                                    <div class="flex align-items-center gap-2"><InputText v-model="data.processName" disabled style="width: 120px" /></div> </template
                            ></Column>
                            <Column field="lineDetailCode" header="공정코드" style="width: 100px">
                                <template #body="{ data }"><InputText v-model="data.lineDetailCode" disabled style="width: 100px" /> </template
                            ></Column>
                            <Column field="equipmentCode" header="설비코드" style="width: 120px">
                                <template #body="{ data }"> <InputText v-model="data.equipmentCode" disabled style="width: 120px" /> </template
                            ></Column>
                            <Column field="equipmentName" header="설비명" style="width: 120px">
                                <template #body="{ data }"> <InputText v-model="data.equipmentName" disabled style="width: 100px" /> </template></Column
                            ><Column field="useYn" header="사용여부" style="width: 120px">
                                <template #body="{ data }"> <InputText v-model="data.useYn" disabled style="width: 100px" /> </template
                            ></Column>
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
                                <label>라인 코드</label>
                                <InputText v-model="detailForm.lineCode" placeholder="자동입력" disabled />
                            </div>

                            <div class="field">
                                <label>라인명</label>
                                <InputText v-model="detailForm.lineName" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>라인유형</label>
                                <InputText v-model="detailForm.lineType" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>담당부서</label>
                                <InputText v-model="detailForm.mdept" placeholder="자동입력" />
                            </div>

                            <div class="field">
                                <label>사용여부</label>
                                <Dropdown v-model="detailForm.useYn" placeholder="사용/미사용" />
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
.left-panel {
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
.right-panel {
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
.process-list-table :deep(tr.selected-row) {
    background-color: rgba(204, 229, 255) !important;
    color: inherit !important;
}
</style>
