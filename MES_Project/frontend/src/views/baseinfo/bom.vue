<script setup>
import { ref } from 'vue';
import BomProductModal from '../BomProductModal.vue';
import SubMaterialModal from '../BomMatModal.vue';
import axios from 'axios';
// import BomProductModal from '@/views/BomProductModal.vue';
// PrimeVue 컴포넌트는 전역 등록되어 있다고 가정 (Sakai 템플릿 기본 구조)

const isModalVisible = ref(false);
const isSubMaterialModal = ref(false);
const searchForm = ref({
    itemCode: '',
    itemName: '',
    startDate: null,
    endDate: null,
    useYn: null // null = 전체
});
// const addSubMaterials = (items) => {
//     items.forEach((item) => {
//         subMaterialList.value.push({
//             materialCode: item.mat_code,
//             materialName: item.mat_name,
//             materialType: item.prod_type,
//             unit: item.unit,
//             qty: 0,
//             lossRate: 0
//         });
//     });
// };

const onSelectSubMaterial = (materials) => {
    const existingCodes = new Set(subMaterialList.value.map((item) => item.materialCode));

    materials.forEach((m) => {
        // 이미 존재하면 추가하지 않음
        if (existingCodes.has(m.mat_code)) {
            return;
        }

        subMaterialList.value.push({
            id: subMaterialList.value.length + 1,
            materialCode: m.mat_code,
            materialName: m.mat_name,
            materialType: m.prod_type,
            qty: m.req_qtt ?? 0,
            unit: m.unit,
            lossRate: m.loss_rate ?? 0
        });
    });
};

const typeMap = {
    i1: '완제품',
    i2: '반제품',
    i3: '부자재',
    i4: '원자재',
    t1: '원자재',
    t2: '부자재'
};
const useYnMap = {
    f2: '사용중',
    f1: '미사용'
};
const unitMap = {
    h1: 'kg',
    h2: 't',
    h3: 'L',
    h4: 'ea',
    h5: 'box',
    h6: 'g',
    h7: 'mm',
    h8: '%',
    h9: 'cm',
    ha: 'N',
    hb: 'mg',
    hc: 'ml',
    hd: 'mg/g'
};

const openProductModal = () => {
    isModalVisible.value = true;
};

const onProductSelect = (selectedProduct) => {
    ((searchForm.value.itemCode = selectedProduct.prod_code), (searchForm.value.itemName = selectedProduct.prod_name));
};
const useYnOptions = [
    { label: '사용', value: 'Y' },
    { label: '미사용', value: 'N' }
];

const itemTypeOptions = [
    { label: '완제품', value: 'i1' },
    { label: '반제품', value: 'i2' },
    { label: '부자재', value: 'i3' },
    { label: '원자재', value: 'i4' }
];
// -------------------------------
// Mock 데이터 (API 연동 시 교체)
// -------------------------------
const bomList = ref([]);

const selectedBom = ref(null);

const subMaterialList = ref([]);

const selectedSubMaterials = ref([]);

const detailForm = ref({
    id: null,
    prodCode: '',
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

const onSearch = async () => {
    const payload = {
        itemCode: searchForm.value.itemCode,
        itemName: searchForm.value.itemName,
        startDate: searchForm.value.startDate,
        endDate: searchForm.value.endDate,
        useYn: searchForm.value.useYn
    };

    const res = await axios.post('/api/baseinfo/bom/search', payload);
    bomList.value = res.data;
};
const onSelectBom = async (e) => {
    const row = e.data;
    selectedBom.value = row;

    const res = await axios.get(`/api/baseinfo/bom/mat/${row.prod_code}`);

    // 하위 자재 조회
    subMaterialList.value = res.data.map((m, idx) => ({
        id: idx + 1,
        materialCode: m.mat_code,
        materialName: m.mat_name,
        materialType: m.mat_type,
        qty: m.req_qtt,
        unit: m.unit,
        lossRate: m.loss_rate,
        bom_code: m.bom_code // ← 추가
    }));

    // 상세 영역
    detailForm.value = {
        bomCode: res.data[0]?.bom_code ?? '', // ← 핵심
        prodCode: row.prod_code,
        itemName: row.prod_name,
        itemType: row.prod_type?.trim() || null,
        spec: row.spec,
        useYn: row.is_used,
        shelfLife: row.edate ? new Date(row.edate) : null,
        regDate: row.regdate,
        remark: row.note
    };
};

const onDeleteBom = () => {
    if (!selectedBom.value) return;

    bomList.value = bomList.value.filter((b) => b.prod_code !== selectedBom.value.prod_code);

    selectedBom.value = null;

    detailForm.value = {
        id: null,
        prodCode: '',
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

const onDeleteSubMaterial = () => {
    const ids = new Set(selectedSubMaterials.value.map((m) => m.id));
    subMaterialList.value = subMaterialList.value.filter((m) => !ids.has(m.id));
    selectedSubMaterials.value = [];
};

const onCreate = async () => {
    if (!detailForm.value.prodCode) {
        alert('제품을 먼저 선택하세요.');
        return;
    }

    const payload = {
        bom_code: detailForm.value.bomCode,
        materials: subMaterialList.value.map((m) => ({
            mat_code: m.materialCode,
            mat_name: m.materialName,
            mat_type: m.materialType,
            req_qtt: Number(m.qty),
            unit: m.unit,
            loss_rate: Number(m.lossRate)
        }))
    };

    await axios.post('/api/baseinfo/bom/save', payload);
    alert('저장 완료');
};
// const onUpdate = () => {
//     // TODO: 수정 API 연동
//     console.log('수정', detailForm.value, subMaterialList.value);
// };
</script>

<template>
    <div class="p-fluid bom-page">
        <div class="card search-panel">
            <div class="search-row">
                <div class="field">
                    <label for="itemCode">품목코드</label>
                    <InputText id="itemCode" v-model="searchForm.itemCode" placeholder="품목코드 입력" @click="openProductModal" readonly />
                </div>

                <div class="field">
                    <label for="itemName">품목명</label>
                    <InputText id="itemName" v-model="searchForm.itemName" placeholder="품목명 입력" @click="openProductModal" readonly />
                </div>

                <div class="field date-range-field flex flex-column">
                    <label class="mb-1">등록일자</label>

                    <div class="align-items-center gap-2">
                        <Calendar v-model="searchForm.startDate" dateFormat="yy-mm-dd" :showIcon="true" style="width: 200px" />
                        <span> ~ </span>
                        <Calendar v-model="searchForm.endDate" dateFormat="yy-mm-dd" :showIcon="true" style="width: 200px" />
                    </div>
                </div>

                <div class="field">
                    <label for="useYn">사용여부</label>

                    <div class="useyn-radio">
                        <div class="flex align-items-center gap-3">
                            <div class="flex align-items-center gap-1">
                                <RadioButton inputId="useYnYes" name="useYn" value="f2" v-model="searchForm.useYn" />
                                <label for="useYnYes" class="radio-label">사용</label>
                            </div>

                            <div class="flex align-items-center gap-1">
                                <RadioButton inputId="useYnNo" name="useYn" value="f1" v-model="searchForm.useYn" />
                                <label for="useYnNo" class="radio-label">미사용</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="button-group">
                <Button label="초기화" class="p-button-secondary large-search-btn" @click="onResetSearch" />
                <Button label="조회" class="p-button-warning large-search-btn" @click="onSearch" />
            </div>
        </div>

        <div class="content-layout">
            <div class="left-container">
                <div class="card item-list-card">
                    <div class="list-header">
                        <div>검색 결과 {{ bomList.length }}건</div>
                        <div class="list-header-buttons">
                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="!selectedBom" @click="onDeleteBom" />
                            <Button label="엑셀 다운로드" class="p-button-success p-button-sm" @click="onDownloadExcel" />
                        </div>
                    </div>

                    <DataTable :value="bomList" dataKey="prod_code" v-model:selection="selectedBom" selectionMode="single" @rowSelect="onSelectBom" scrollable scrollHeight="flex" class="p-datatable-sm bom-list-table">
                        <Column selectionMode="single" headerStyle="width:3rem"></Column>
                        <Column field="prod_code" header="품목코드" style="width: 120px"></Column>
                        <Column field="prod_name" header="품목명"></Column>
                        <Column field="edate" header="유통기한" style="width: 90px"></Column>
                        <Column field="is_used" header="사용여부" style="width: 80px">
                            <template #body="{ data }">
                                <span :class="['status-tag', data.is_used === 'f2' ? 'status-active' : 'status-inactive']">
                                    {{ data.is_used === 'f2' ? '사용' : '미사용' }}
                                </span>
                            </template>
                        </Column>
                        <Column field="regdate" header="등록일자" style="width: 120px"></Column>
                    </DataTable>
                </div>

                <div class="card sub-material-card">
                    <div class="sub-material-header">
                        <span>하위 자재 구성 영역</span>
                        <div class="sub-material-buttons">
                            <Button label="하위 자재 추가" class="p-button-outlined p-button-sm" @click="isSubMaterialModal = true" />

                            <Button label="삭제" class="p-button-danger p-button-sm" :disabled="!selectedSubMaterials.length" @click="onDeleteSubMaterial" />
                        </div>
                    </div>

                    <DataTable
                        :value="subMaterialList"
                        dataKey="materialCode"
                        v-model:selection="selectedSubMaterials"
                        selectionMode="multiple"
                        scrollable
                        scrollHeight="flex"
                        class="p-datatable-sm sub-material-table"
                        editMode="cell"
                        @cell-edit-complete="onCellEditComplete"
                    >
                        <Column selectionMode="multiple" headerStyle="width:3rem"></Column>

                        <Column field="materialCode" header="자재코드" style="width: 120px" />

                        <Column field="materialName" header="자재명" />

                        <Column field="materialType" header="자재유형" style="width: 100px">
                            <template #body="{ data }">
                                {{ typeMap[data.materialType] }}
                            </template>
                        </Column>

                        <!-- 소요수량 editable -->
                        <Column field="qty" header="소요수량" style="width: 70px">
                            <template #body="{ data }">
                                <InputNumber v-model="data.qty" :min="0" :maxFractionDigits="3" inputStyle="width: 50px; text-align: center;" />
                            </template>
                        </Column>

                        <!-- 단위 editable (Dropdown 제거, InputText 사용) -->
                        <Column field="unit" header="단위" style="width: 70px">
                            <template #body="{ data }">
                                {{ unitMap[data.unit] }}
                            </template>
                        </Column>

                        <!-- 로스율 editable -->
                        <Column header="로스율" style="width: 50px">
                            <template #body="{ data }">
                                <InputNumber v-model="data.lossRate" input-style="width: 50px; text-align: center;" :minFractionDigits="0" :maxFractionDigits="4" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div class="card right-pane-card">
                <div class="right-pane">
                    <div class="right-header">
                        <div class="flex-gap"></div>
                        <div class="right-header-buttons">
                            <Button label="등록" class="p-button-success p-button-sm" @click="onCreate" />
                            <!-- <Button label="수정" class="p-button-primary p-button-sm" :disabled="!detailForm.id" @click="onUpdate" /> -->
                        </div>
                    </div>

                    <div class="detail-form">
                        <div class="form-grid">
                            <div class="field">
                                <label>등록코드</label>
                                <InputText v-model="detailForm.prodCode" placeholder="자동입력" disabled />
                            </div>

                            <div class="field">
                                <label>품목명</label>
                                <InputText v-model="detailForm.itemName" placeholder="반제품 부터 완제품" />
                            </div>

                            <div class="field">
                                <label>품목유형</label>
                                <InputText readonly="true" v-model="typeMap[detailForm.itemType]" :options="itemTypeOptions" optionLabel="label" optionValue="value" placeholder="선택" />
                            </div>

                            <div class="field">
                                <label>사용여부</label>
                                <InputText
                                    readonly="true"
                                    v-model="useYnMap[detailForm.useYn]"
                                    :options="useYnOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="선택"
                                    :class="useYnMap[detailForm.useYn] === '사용중' ? 'use-yes' : 'use-no'"
                                />
                            </div>

                            <div class="field">
                                <label>유통기한</label>
                                <div class="p-inputgroup">
                                    <Calendar v-model="detailForm.shelfLife" :min="0" inputId="shelfLife" />
                                    <span class="p-inputgroup-addon"></span>
                                </div>
                            </div>

                            <div class="field">
                                <label>등록일자</label>
                                <Calendar v-model="detailForm.regDate" dateFormat="yy-mm-dd" :showIcon="true" :disabled="false" placeholder="" />
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
    <BomProductModal v-model:visible="isModalVisible" @select="onProductSelect" />
    <SubMaterialModal v-model:visible="isSubMaterialModal" :selectedCodes="subMaterialList.map((m) => m.materialCode)" @select="onSelectSubMaterial" />
</template>

<style scoped>
.bom-page {
    padding: 1rem;
    height: calc(100vh - 50px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
:deep(.sub-material-table .p-datatable-tbody > tr) {
    height: 50px; /* 원하는 높이 */
}

:deep(.sub-material-table .p-datatable-tbody > tr > td) {
    vertical-align: middle;
}
/* 검색 영역 */
.search-panel {
    margin-bottom: 1rem;

    display: flex;
    flex-direction: column;
}

.search-row {
    display: grid;
    grid-template-columns: repeat(4, 2fr);
    gap: 1rem;
    align-items: center;
    width: 100%;
    height: 100%;
    font-weight: bolder;
    white-space: nowrap; /* 줄바꿈 방지 */
}
.useyn-radio .radio-label {
    font-size: 1.2rem;
    cursor: pointer;
    user-select: none;
}
.search-row .field {
    display: flex;

    flex-direction: column;
    justify-content: flex-end;
}

/* 버튼 그룹 스타일 */
.button-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    justify-content: center;
}

/* 버튼 너비를 넓게 설정 */
.large-search-btn {
    width: 150px;
    max-width: 200px;
}

/* 메인 레이아웃 (좌측 컨테이너 vs 우측 카드) */
.content-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    flex-grow: 1;
    height: 100%;
}
.use-yes {
    background-color: #e6f7e9; /* 옅은 초록 */
    color: #1e8449; /* 진한 초록 글자 */
    font-weight: bold;
}

.use-no {
    background-color: #fdecea; /* 옅은 빨강 */
    color: #c0392b; /* 진한 빨강 글자 */
    font-weight: bold;
}
/* 🎯 추가: 좌측 상/하 분할 컨테이너 */
.left-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem; /* 카드 사이 간격 */
    flex-grow: 1;
    height: 800px;
}

/* 🎯 추가: 좌측 상단 카드 (품목 목록) */
.item-list-card {
    padding: 1.5rem;
    /* 높이를 50% 비율로 설정 */
    flex-grow: 5;
    display: flex;
    flex-direction: column;
    height: 300px;
}

/* 🎯 추가: 좌측 하단 카드 (하위 자재) */
.sub-material-card {
    padding: 1.5rem;
    /* 높이를 50% 비율로 설정 */
    flex-grow: 5;
    display: flex;
    flex-direction: column;
}

/* 우측 카드 (상세 정보) */
.right-pane-card {
    padding: 1.5rem;
    height: 800px; /* content-layout 높이 꽉 채우기 */
    display: flex;
    flex-direction: column;
}

/* --- 좌측 영역 내부 스타일 --- */
.list-header,
.sub-material-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bolder;
    margin-bottom: 0.75rem; /* 헤더 아래 공간 확보 */
}

.sub-material-header {
    margin-top: 0.5rem;
}

.list-header-buttons,
.sub-material-buttons {
    display: flex;
    gap: 0.5rem;
}

/* DataTable이 남은 공간을 채우도록 flex-grow 설정 (PrimeVue scrollHeight="flex" 사용 전제) */
.p-datatable {
    flex-grow: 1;
    height: 200px;
    overflow: auto; /* 내부 스크롤 */
}

.hint-text {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #777;
}

/* --- 우측 영역 내부 스타일 --- */
.right-pane {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex-grow: 1;
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
    height: 500px;
    background: var(--surface-card);
    flex-grow: 1; /* 남은 공간을 상세 폼이 채우도록 설정 */
}
.detail-form .field {
    display: flex;
    flex-direction: column;
}
.detail-form .field label {
    margin-bottom: 0.25rem;
    white-space: nowrap;
}
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.5rem;
    font-weight: bolder;
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
