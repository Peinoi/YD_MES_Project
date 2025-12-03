<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputNumber from 'primevue/inputnumber';

// --데이터--
const search = ref({ flowCode: '', flowName: '', productCode: '', productName: '', startDate: null, endDate: null });
const list = ref([
    { flowCode: 'PROD-0001', flowName: '전처리 공정', productCode: 'SODA', productName: '탄산수', regDate: '2023-11-01', remark: '비고1' },
    { flowCode: 'PROD-0002', flowName: '후처리 공정', productCode: 'MILK', productName: '우유', regDate: '2023-11-05', remark: '비고2' },
    { flowCode: 'PROD-0002', flowName: '후처리 공정', productCode: 'MILK', productName: '우유', regDate: '2023-11-05', remark: '비고2' },
    { flowCode: 'PROD-0002', flowName: '후처리 공정', productCode: 'MILK', productName: '우유', regDate: '2023-11-05', remark: '비고2' },
    { flowCode: 'PROD-0002', flowName: '후처리 공정', productCode: 'MILK', productName: '우유', regDate: '2023-11-05', remark: '비고2' }
]);
const selectedRow = ref(null);

const detail = ref({
    flowCode: '',
    flowName: '',
    productCode: '',
    productName: '',
    reg: 'EMP-10001',
    regDate: '2025.06.24',
    processType: '제조',
    remark: ''
});

const processFlowList = ref([
    { seq: 1, processCode: 'PO-001', processName: '배합', equipmentType: '믹서' },
    { seq: 2, processCode: 'PO-002', processName: '열처리', equipmentType: '보일러' },
    { seq: 2, processCode: 'PO-002', processName: '열처리', equipmentType: '보일러' },
    { seq: 2, processCode: 'PO-002', processName: '열처리', equipmentType: '보일러' },
    { seq: 2, processCode: 'PO-002', processName: '열처리', equipmentType: '보일러' }
]);
const selectedFlowRows = ref([]);

// --함수--
const resetSearch = () => {
    search.value = { flowCode: '', flowName: '', productCode: '', productName: '', startDate: null, endDate: null };
};
const searchData = () => {
    console.log('조회 실행:', search.value);
};
const fillDetail = (event) => {
    const row = event.data;
    detail.value = { flowCode: row.flowCode, flowName: row.flowName, productCode: row.productCode, productName: row.productName, reg: 'EMP-10001', regDate: row.regDate, processType: '제조', remark: row.remark };
};
</script>

<template>
    <div class="process-flow-container flex flex-column gap-3">
        <!-- 검색 조회  -->
        <Card class="search-card">
            <template #content>
                <!-- 검색 전용 그리드-->
                <div class="search-grid">
                    <div class="search-field">
                        <label class="field-label">흐름도 코드</label>
                        <InputText v-model="search.flowCode" class="field-input" />
                    </div>

                    <div class="search-field">
                        <label class="field-label">흐름도명</label>
                        <InputText v-model="search.flowName" class="field-input" />
                    </div>

                    <div class="search-field">
                        <label class="field-label">제품코드</label>
                        <InputText v-model="search.productCode" class="field-input" />
                    </div>

                    <div class="search-field">
                        <label class="field-label">제품명</label>
                        <InputText v-model="search.productName" class="field-input" />
                    </div>

                    <div class="search-field">
                        <label class="field-label">등록일자 시작</label>
                        <Calendar v-model="search.startDate" dateFormat="yy-mm-dd" class="field-input" />
                    </div>

                    <div class="search-field">
                        <label class="field-label">등록일자 종료</label>
                        <Calendar v-model="search.endDate" dateFormat="yy-mm-dd" class="field-input" />
                    </div>

                    <!-- 버튼 -->
                    <div class="search-buttons">
                        <Button label="초기화" severity="secondary" @click="resetSearch" class="px-6" />
                        <Button label="조회" severity="primary" @click="searchData" class="px-6" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- 공정흐름도 -->
        <div class="main-data-area flex gap-2">
            <div class="left-panel flex flex-column gap-2">
                <Card class="data-table-card list-card">
                    <template #title>
                        <div class="flex justify-content-between align-items-center px-3 pt-3">
                            <h4 class="m-0">공정흐름도 목록</h4>
                            <Button label="삭제" severity="danger" size="small" />
                        </div>
                    </template>
                    <template #content>
                        <DataTable :value="list" selectionMode="single" v-model:selection="selectedRow" @rowSelect="fillDetail" dataKey="flowCode" class="h-full" scrollable scrollHeight="flex">
                            <Column field="flowCode" header="흐름도코드" />
                            <Column field="flowName" header="흐름도명" />
                            <Column field="productCode" header="제품코드" />
                            <Column field="productName" header="제품명" />
                            <Column field="regDate" header="등록일자" />
                            <Column field="remark" header="비고" />
                        </DataTable>
                    </template>
                </Card>

                <!-- 흐름도 상세 -->
                <Card class="data-table-card detail-card">
                    <template #title>
                        <div class="flex justify-content-between align-items-center px-3 pt-3">
                            <h4 class="m-0">흐름도 상세</h4>
                            <div class="flex gap-2">
                                <Button label="선택 삭제" severity="danger" size="small" />
                                <Button label="추가" icon="pi pi-plus" size="small" />
                            </div>
                        </div>
                    </template>
                    <template #content>
                        <DataTable :value="processFlowList" dataKey="seq" selectionMode="multiple" v-model:selection="selectedFlowRows" class="text-sm h-full" scrollable scrollHeight="flex">
                            <Column selectionMode="multiple" headerStyle="width: 3rem" />
                            <Column header="공정순서" field="seq" headerStyle="width: 8rem">
                                <template #body="slotProps">
                                    <InputNumber v-model="slotProps.data.seq" showButtons mode="decimal" :min="1" :max="99" />
                                </template>
                            </Column>
                            <Column header="공정코드" headerStyle="width: 12rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1 align-items-center">
                                        <InputText v-model="slotProps.data.processCode" class="w-8rem" />
                                        <Button icon="pi pi-search" severity="secondary" size="small" />
                                    </div>
                                </template>
                            </Column>
                            <Column header="공정명">
                                <template #body="slotProps">
                                    <InputText v-model="slotProps.data.processName" />
                                </template>
                            </Column>
                            <Column header="설비유형" headerStyle="width: 12rem">
                                <template #body="slotProps">
                                    <div class="flex gap-1 align-items-center">
                                        <InputText v-model="slotProps.data.equipmentType" class="w-8rem" />
                                        <Button icon="pi pi-search" severity="secondary" size="small" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </div>

            <!-- 기준정보 -->
            <div class="right-panel flex flex-column">
                <Card class="h-full">
                    <template #title>
                        <div class="flex justify-content-between align-items-center px-3 pt-3">
                            <h4 class="m-0">기준정보</h4>
                            <div class="flex gap-2">
                                <Button label="수정" severity="primary" size="small" outlined />
                                <Button label="등록" severity="success" size="small" />
                            </div>
                        </div>
                    </template>
                    <template #content>
                        <div class="p-fluid grid formgrid detail-fields">
                            <div class="field col-12"><label>공정흐름도코드</label><InputText v-model="detail.flowCode" readonly /></div>
                            <div class="field col-12"><label>공정흐름도명</label><InputText v-model="detail.flowName" /></div>
                            <div class="field col-12"><label>제품코드</label><InputText v-model="detail.productCode" /></div>
                            <div class="field col-12"><label>제품명</label><InputText v-model="detail.productName" /></div>
                            <div class="field col-12"><label>공정분류</label><InputText v-model="detail.processType" /></div>
                            <div class="field col-12"><label>등록자</label><InputText v-model="detail.reg" readonly /></div>
                            <div class="field col-12"><label>등록일자</label><InputText v-model="detail.regDate" readonly /></div>
                            <div class="field col-12"><label>비고</label><InputText v-model="detail.remark" /></div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.process-flow-container {
    height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* ===== 검색 카드 스타일 ===== */
.search-card {
    flex: 0 0 auto;
}

/* 검색 전용 그리드: 6열 */
.search-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    padding: 16px;
    align-items: end;
}

/* 필드: label + input */
.search-field {
    display: flex;
    flex-direction: column;
}

.field-label {
    font-size: 0.85rem;
    margin-bottom: 6px;
    color: #333;
}

.field-input {
    width: 100%;
}

/* 버튼 중앙 배치 */
.search-buttons {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    gap: 12px;
    padding-top: 6px;
}

/* 반응형 */
@media (max-width: 1200px) {
    .search-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
@media (max-width: 640px) {
    .search-grid {
        grid-template-columns: repeat(1, 1fr);
    }
    .search-card {
        min-height: auto;
    }
}

/* ===== 메인 영역 ===== */
.main-data-area {
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
}

/* 좌측 2단 */
.left-panel {
    flex: 5;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: hidden;
    height: 100%;
}
.list-card {
    flex: 0 0 260px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* DataTable이 카드 내부에서 꽉 차고 내부에서만 스크롤 */
.list-card .p-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.list-card .p-datatable-wrapper {
    flex: 1;
    overflow-y: auto !important;
}

/* 좌측 하단: 상세 */
.detail-card {
    flex: 0 0 40%;
    overflow: hidden;
}

.detail-card .p-datatable-wrapper {
    max-height: calc(40vh - 60px) !important;
    height: calc(40vh - 60px) !important;
    overflow-y: auto !important;
}

/* 우측: 기준정보 (스크롤 없이 full form) */
.right-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
}

.detail-fields {
    height: auto;
    max-height: calc(100% - 1rem);
    overflow-y: auto;
}

/* 테이블 padding 축소 */
.p-datatable .p-datatable-tbody > tr > td {
    padding: 1rem 1rem;
}

/* 카드 제목 여백 조절 */
.p-card .p-card-title {
    margin-bottom: 0.2rem;
}
</style>
