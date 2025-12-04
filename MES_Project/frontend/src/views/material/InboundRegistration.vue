<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// [상태] 입력 폼 데이터
const form = ref({
    matCode: '',
    matName: '',
    category: '',
    unit: '',
    client: '',
    manager: '',
    inQty: null, // 숫자형으로 초기화
    inboundDate: null
});

// [상태] 입고 대기 목록 데이터 (Mock Data)
// ★ 중요: 수량(inQty)은 반드시 숫자(Number)여야 정렬이 올바르게 작동합니다.
const inboundList = ref([
    {
        matCode: 'MAT-003',
        matName: '예담라면포장지',
        category: '부자재',
        unit: 'BOX',
        client: '대한포장',
        manager: '이담당',
        inQty: 500, // 문자열 '500' -> 숫자 500 변경
        inboundDate: '2025-05-29'
    },
    {
        matCode: 'RM-001',
        matName: '밀가루 1등급',
        category: '원자재',
        unit: '포',
        client: '예담제분',
        manager: '김자재',
        inQty: 400, // 문자열 '400' -> 숫자 400 변경
        inboundDate: '2025-05-29'
    }
]);

// [기능] 목록에 추가
const addToList = () => {
    if (!form.value.matCode || !form.value.inQty) {
        alert('자재코드와 수량은 필수입니다.');
        return;
    }
    inboundList.value.push({
        ...form.value,
        inboundDate: form.value.inboundDate ? form.value.inboundDate.toISOString().split('T')[0] : ''
    });
    resetForm();
};

// [기능] 입력 초기화
const resetForm = () => {
    form.value = {
        matCode: '',
        matName: '',
        category: '',
        unit: '',
        client: '',
        manager: '',
        inQty: null,
        inboundDate: null
    };
};

// [기능] 행 삭제
const removeItem = (index) => {
    inboundList.value.splice(index, 1);
};

// [기능] 최종 등록
const submitRegistration = () => {
    if (inboundList.value.length === 0) {
        alert('등록할 품목이 없습니다.');
        return;
    }
    console.log('최종 등록 데이터:', inboundList.value);
    alert('입고 등록이 완료되었습니다.');
};

// [기능] 취소
const cancelRegistration = () => {
    if (confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
        inboundList.value = [];
        resetForm();
    }
};
</script>

<template>
    <div class="inbound-container">
        <div class="header-section">
            <h2 class="page-title">자재 입고 등록</h2>
            <div class="breadcrumb">자재 관리 > 입고 등록</div>
        </div>

        <div class="content-card mb-4">
            <div class="card-header">
                <h3 class="card-title"><i class="pi pi-pencil mr-2 text-primary"></i>입고 정보 입력</h3>
                <span class="text-sm text-gray-500">* 필수 입력 항목</span>
            </div>

            <div class="form-grid">
                <div class="field-group">
                    <label class="field-label">자재코드 <span class="required">*</span></label>
                    <div class="flex w-full">
                        <InputText v-model="form.matCode" placeholder="코드 검색" class="flex-1 border-r-0 rounded-r-none" />
                        <Button icon="pi pi-search" severity="secondary" text class="rounded-l-none border-l-0" />
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">자재명</label>
                    <InputText v-model="form.matName" placeholder="자동 입력" readonly class="bg-gray-50 w-full" />
                </div>

                <div class="field-group">
                    <label class="field-label">자재분류</label>
                    <InputText v-model="form.category" placeholder="분류" readonly class="bg-gray-50 w-full" />
                </div>

                <div class="field-group">
                    <label class="field-label">단위</label>
                    <InputText v-model="form.unit" placeholder="Unit" readonly class="bg-gray-50 w-full" />
                </div>

                <div class="col-span-full divider"></div>

                <div class="field-group">
                    <label class="field-label">공급업체 <span class="required">*</span></label>
                    <div class="flex w-full">
                        <InputText v-model="form.client" placeholder="업체 검색" class="flex-1 border-r-0 rounded-r-none" />
                        <Button icon="pi pi-search" severity="secondary" text class="rounded-l-none border-l-0" />
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">담당자</label>
                    <div class="flex w-full">
                        <InputText v-model="form.manager" placeholder="담당자 검색" class="flex-1 border-r-0 rounded-r-none" />
                        <Button icon="pi pi-search" severity="secondary" text class="rounded-l-none border-l-0" />
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">입고수량 <span class="required">*</span></label>
                    <InputNumber v-model="form.inQty" placeholder="수량 입력" class="w-full" :min="0" />
                </div>

                <div class="field-group">
                    <label class="field-label">입고일자 <span class="required">*</span></label>
                    <Calendar v-model="form.inboundDate" showIcon dateFormat="yy-mm-dd" placeholder="YYYY-MM-DD" class="w-full" />
                </div>
            </div>

            <div class="form-actions center-actions">
                <Button label="추가" icon="pi pi-plus" severity="info" @click="addToList" class="mr-2" />
                <Button label="초기화" icon="pi pi-refresh" severity="secondary" @click="resetForm" />
            </div>
        </div>

        <div class="content-card">
            <div class="card-header">
                <h3 class="card-title">
                    <i class="pi pi-list mr-2 text-primary"></i>입고 대기 목록
                    <span class="ml-2 text-sm font-normal text-gray-500">(총 {{ inboundList.length }}건)</span>
                </h3>
            </div>

            <DataTable :value="inboundList" showGridlines stripedRows responsiveLayout="scroll" class="text-sm" removableSort scrollable scrollHeight="100px">
                <template #empty>
                    <div class="text-center p-4 text-gray-500">추가된 입고 품목이 없습니다.</div>
                </template>

                <Column header="No." headerClass="center-header" bodyClass="text-center" style="width: 3rem">
                    <template #body="slotProps">
                        {{ slotProps.index + 1 }}
                    </template>
                </Column>

                <Column field="matCode" header="자재코드" sortable headerClass="center-header" bodyClass="text-center" style="min-width: 100px"></Column>
                <Column field="matName" header="자재명" sortable headerClass="center-header" bodyClass="text-center" style="min-width: 150px"></Column>
                <Column field="category" header="분류" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="unit" header="단위" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="client" header="공급업체" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="manager" header="담당자" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="inQty" header="입고수량" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="inboundDate" header="입고일자" sortable headerClass="center-header" bodyClass="text-center"></Column>

                <Column header="삭제" headerClass="center-header" bodyClass="text-center" style="width: 6rem">
                    <template #body="{ index }">
                        <Button label="삭제" class="p-button-danger p-button-sm p-button-text" @click="removeItem(index)" />
                    </template>
                </Column>
            </DataTable>

            <div class="final-actions center-actions">
                <Button label="등록" icon="pi pi-check" severity="success" class="mr-2 px-5" @click="submitRegistration" />
                <Button label="취소" icon="pi pi-times" severity="secondary" class="px-5" @click="cancelRegistration" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 기본 레이아웃 스타일 */
.inbound-container {
    font-family: 'Pretendard', 'Inter', sans-serif;
    background-color: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    height: calc(100vh - 8rem);
    overflow-y: auto;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.page-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
    margin: 0;
}

.breadcrumb {
    color: #6b7280;
    font-size: 0.9rem;
}

.content-card {
    background: white;
    border-radius: 12px;
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03);
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
}

.card-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: #374151;
    margin: 0;
    display: flex;
    align-items: center;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 0.75rem;
    column-gap: 1.5rem;
}

@media (min-width: 1024px) {
    .form-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    .col-span-full {
        grid-column: 1 / -1;
    }
}

@media (min-width: 768px) and (max-width: 1023px) {
    .form-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.field-group {
    display: flex;
    flex-direction: column;
}

.field-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.5rem;
}

.required {
    color: #ef4444;
}

:deep(.bg-gray-50) {
    background-color: #f9fafb;
}

/* PrimeVue Input 100% 채우기 */
:deep(.p-inputtext),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    width: 100%;
}

.form-actions {
    display: flex;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
}

.final-actions {
    display: flex;
    margin-top: 2rem;
}

.center-actions {
    justify-content: center;
}

.mr-2 {
    margin-right: 0.5rem;
}
.text-primary {
    color: var(--primary-color);
}

/* 테이블 내용 중앙 정렬 */
:deep(.text-center) {
    text-align: center !important;
}

:deep(.p-datatable-tbody > tr > td) {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
}
</style>

<style>
/* PrimeVue 4 헤더 컨텐츠 클래스명 대응 */
.center-header .p-column-header-content,
.center-header .p-datatable-column-header-content {
    justify-content: center !important;
}
</style>
