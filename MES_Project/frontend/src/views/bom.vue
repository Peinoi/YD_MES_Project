<script setup>
import { ref } from 'vue';
// PrimeVue 컴포넌트는 전역 등록되어 있다고 가정 (Sakai 템플릿 기본 구조)

const searchForm = ref({
    itemCode: '',
    itemName: '',
    startDate: null,
    endDate: null,
    useYn: null // null = 전체
});

const useYnOptions = [
    { label: '전체', value: null },
    { label: '사용', value: 'Y' },
    { label: '미사용', value: 'N' }
];

const itemTypeOptions = [
    { label: '완제품', value: 'FG' },
    { label: '반제품', value: 'SG' },
    { label: '원자재', value: 'RM' },
    { label: '부자재', value: 'SUB' }
];

// -------------------------------
// Mock 데이터 (API 연동 시 교체)
// -------------------------------
const bomList = ref([
    {
        id: 1,
        itemCode: 'WH001',
        itemName: '신라면',
        shelfLife: '90일',
        status: '활성',
        regDate: '2025-05-05',
        useYn: 'Y'
    },
    {
        id: 2,
        itemCode: 'WH002',
        itemName: '안성탕면',
        shelfLife: '90일',
        status: '활성',
        regDate: '2025-05-25',
        useYn: 'Y'
    },
    {
        id: 3,
        itemCode: 'WH005',
        itemName: '꼬꼬면',
        shelfLife: '180일',
        status: '비활성',
        regDate: '2025-05-10',
        useYn: 'N'
    }
]);

const selectedBom = ref(null);

const subMaterialList = ref([
    {
        id: 1,
        materialCode: 'RM001',
        materialName: '밀가루',
        materialType: '원자재',
        qty: 100,
        unit: 'g',
        lossRate: '0.5%'
    },
    {
        id: 2,
        materialCode: 'RM002',
        materialName: '스프',
        materialType: '반제품',
        qty: 20,
        unit: 'g',
        lossRate: '0.0%'
    },
    {
        id: 3,
        materialCode: 'RM003',
        materialName: '비닐포장지',
        materialType: '부자재',
        qty: 1,
        unit: 'EA',
        lossRate: '0.0%'
    }
]);

const selectedSubMaterials = ref([]);

const detailForm = ref({
    id: null,
    bomCode: '',
    itemName: '',
    itemType: null,
    spec: '',
    useYn: 'Y',
    shelfLife: null,
    regDate: null,
    remark: ''
});

// -------------------------------
// 이벤트 핸들러
// -------------------------------
const onResetSearch = () => {
    searchForm.value = {
        itemCode: '',
        itemName: '',
        startDate: null,
        endDate: null,
        useYn: null
    };
};

const onSearch = () => {
    // TODO: 검색 API 연동
    console.log('검색 조건', searchForm.value);
};

const onSelectBom = (e) => {
    const row = e.data;
    selectedBom.value = row;

    // TODO: 선택한 품목 기준으로 상세/하위자재 조회 API 연동
    detailForm.value = {
        id: row.id,
        bomCode: row.itemCode,
        itemName: row.itemName,
        itemType: 'FG',
        spec: '',
        useYn: row.useYn,
        shelfLife: 180,
        regDate: new Date(row.regDate),
        remark: ''
    };
};

const onDeleteBom = () => {
    if (!selectedBom.value) return;
    // TODO: 삭제 API 연동
    bomList.value = bomList.value.filter((b) => b.id !== selectedBom.value.id);
    selectedBom.value = null;
    detailForm.value = {
        id: null,
        bomCode: '',
        itemName: '',
        itemType: null,
        spec: '',
        useYn: 'Y',
        shelfLife: null,
        regDate: null,
        remark: ''
    };
};

const onDownloadExcel = () => {
    // TODO: 엑셀 다운로드 API 호출
    console.log('엑셀 다운로드');
};

const onAddSubMaterial = () => {
    const nextId = (subMaterialList.value[subMaterialList.value.length - 1]?.id || 0) + 1;
    subMaterialList.value.push({
        id: nextId,
        materialCode: '',
        materialName: '',
        materialType: '',
        qty: null,
        unit: '',
        lossRate: ''
    });
};

const onDeleteSubMaterial = () => {
    const ids = new Set(selectedSubMaterials.value.map((m) => m.id));
    subMaterialList.value = subMaterialList.value.filter((m) => !ids.has(m.id));
    selectedSubMaterials.value = [];
};

const onCreate = () => {
    // TODO: 등록 API 연동
    console.log('등록', detailForm.value, subMaterialList.value);
};

const onUpdate = () => {
    // TODO: 수정 API 연동
    console.log('수정', detailForm.value, subMaterialList.value);
};
</script>
<!-- src/views/mes/BomManageView.vue -->
<template>
    <div class="p-fluid bom-page">
        <!-- 상단 헤더(화면ID, 화면명 등)는 공통 레이아웃에서 처리한다고 보고 생략 -->
        <!-- 검색 영역 -->
        <div class="card search-panel">
            <div class="search-row">
                <div class="field">
                    <label for="itemCode">품목코드</label>
                    <InputText id="itemCode" v-model="searchForm.itemCode" placeholder="품목코드 입력" />
                </div>

                <div class="field">
                    <label for="itemName">품목명</label>
                    <InputText id="itemName" v-model="searchForm.itemName" placeholder="품목명 입력" />
                </div>

                <div class="field date-range-field flex flex-column">
                    <label class="mb-1">등록일자</label>

                    <div class="align-items-center gap-2">
                        <Calendar v-model="searchForm.startDate" dateFormat="yy-mm-dd" :showIcon="true" style="width: 80px" />
                        <span>~</span>
                        <Calendar v-model="searchForm.endDate" dateFormat="yy-mm-dd" :showIcon="true" style="width: 80px" />
                    </div>
                </div>

                <div class="field">
                    <label for="useYn">사용여부</label>
                    <Dropdown id="useYn" v-model="searchForm.useYn" :options="useYnOptions" optionLabel="label" optionValue="value" placeholder="전체" />
                </div>
            </div>
            <div class="field button-group">
                <Button label="초기화" class="p-button-secondary" @click="onResetSearch" />
                <Button label="조회" class="p-button-warning" @click="onSearch" />
            </div>
        </div>
        <div class="card bom-card">
            <div class="content-layout">
                <!-- 좌측: 품목 목록 + 하위자재 영역 -->
                <div class="left-pane">
                    <!-- 검색 결과 헤더 -->
                    <div class="list-header">
                        <div>검색 결과 {{ bomList.length }}건</div>
                        <div class="list-header-buttons">
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="!selectedBom" @click="onDeleteBom" />
                            <Button label="엑셀 다운로드" class="p-button-success p-button-sm" @click="onDownloadExcel" />
                        </div>
                    </div>

                    <!-- 품목 목록 그리드 -->
                    <DataTable :value="bomList" dataKey="id" v-model:selection="selectedBom" selectionMode="single" @rowSelect="onSelectBom" scrollable scrollHeight="220px" class="p-datatable-sm bom-list-table">
                        <Column selectionMode="single" headerStyle="width:3rem"></Column>
                        <Column field="itemCode" header="품목코드" style="width: 120px"></Column>
                        <Column field="itemName" header="품목명"></Column>
                        <Column field="shelfLife" header="유통기한" style="width: 90px"></Column>
                        <Column field="status" header="상태" style="width: 80px">
                            <template #body="{ data }">
                                <span :class="['status-tag', data.status === '활성' ? 'status-active' : 'status-inactive']">
                                    {{ data.status }}
                                </span>
                            </template>
                        </Column>
                        <Column field="regDate" header="등록일자" style="width: 120px"></Column>
                    </DataTable>

                    <!-- 하위 자재 구성 영역 -->
                    <div class="sub-material-header">
                        <span>하위 자재 구성 영역</span>
                        <div class="sub-material-buttons">
                            <Button label="하위 자재 추가" class="p-button-outlined p-button-sm" @click="onAddSubMaterial" />
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="!selectedSubMaterials.length" @click="onDeleteSubMaterial" />
                        </div>
                    </div>

                    <DataTable :value="subMaterialList" dataKey="id" v-model:selection="selectedSubMaterials" selectionMode="multiple" class="p-datatable-sm sub-material-table">
                        <Column selectionMode="multiple" headerStyle="width:3rem"></Column>
                        <Column field="materialCode" header="자재코드" style="width: 120px"></Column>
                        <Column field="materialName" header="자재명"></Column>
                        <Column field="materialType" header="자재유형" style="width: 100px"></Column>
                        <Column field="qty" header="소요수량" style="width: 90px"></Column>
                        <Column field="unit" header="단위" style="width: 70px"></Column>
                        <Column field="lossRate" header="로스율" style="width: 90px"></Column>
                    </DataTable>

                    <div class="hint-text">제품유형을 먼저 선택하고 품목명을 선택하는게 합리적일듯?</div>
                </div>

                <!-- 우측: 상세/등록/수정 영역 -->
                <div class="right-pane">
                    <div class="right-header">
                        <div class="flex-gap"></div>
                        <div class="right-header-buttons">
                            <Button label="등록" class="p-button-success p-button-sm" @click="onCreate" />
                            <Button label="수정" class="p-button-primary p-button-sm" :disabled="!detailForm.id" @click="onUpdate" />
                        </div>
                    </div>

                    <div class="detail-form">
                        <div class="form-grid">
                            <div class="field">
                                <label>등록코드</label>
                                <InputText v-model="detailForm.bomCode" placeholder="자동입력" disabled />
                            </div>

                            <div class="field">
                                <label>품목명</label>
                                <InputText v-model="detailForm.itemName" placeholder="반제품 부터 완제품" />
                            </div>

                            <div class="field">
                                <label>품목유형</label>
                                <Dropdown v-model="detailForm.itemType" :options="itemTypeOptions" optionLabel="label" optionValue="value" placeholder="선택" />
                            </div>

                            <div class="field">
                                <label>규격</label>
                                <InputText v-model="detailForm.spec" placeholder="부자재 빼고, 반제품, 원자재 무게(g)" />
                            </div>

                            <div class="field">
                                <label>사용여부</label>
                                <Dropdown v-model="detailForm.useYn" :options="useYnOptions" optionLabel="label" optionValue="value" placeholder="선택" />
                            </div>

                            <div class="field">
                                <label>유통기한</label>
                                <div class="p-inputgroup">
                                    <InputNumber v-model="detailForm.shelfLife" :min="0" inputId="shelfLife" />
                                    <span class="p-inputgroup-addon">일</span>
                                </div>
                            </div>

                            <div class="field">
                                <label>등록일자</label>
                                <Calendar v-model="detailForm.regDate" dateFormat="yy-mm-dd" :showIcon="true" :disabled="true" placeholder="regdate 부터 180일" />
                            </div>

                            <div class="field full-width">
                                <label>비고</label>
                                <Textarea v-model="detailForm.remark" :rows="4" autoResize placeholder="특이사항이 있는 경우 입력합니다." />
                            </div>
                        </div>
                    </div>

                    <div class="warning-text">제품추가가 안해도 됨</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bom-page {
    padding: 1rem;
}

.bom-card {
    padding: 1.5rem;
}

/* 검색 영역 */
.search-panel {
    margin-bottom: 1rem;
}

.search-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
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
    justify-content: end;
}

/* 메인 레이아웃 */
.content-layout {
    display: grid;
    grid-template-columns: 2.1fr 1.7fr;
    gap: 1.5rem;
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

.sub-material-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.sub-material-buttons {
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
</style>
