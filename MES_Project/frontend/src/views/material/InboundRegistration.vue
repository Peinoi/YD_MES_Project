<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import materialApi from '@/api/materialApi'; // 또는 materialApi 등 실제 사용하는 API 모듈
import CommonSearchModal from '@/components/common/CommonSearchModal.vue';

const toast = useToast();

// [상태] 입력 폼 데이터
const form = ref({
    matCode: '',
    matName: '',
    category: '',
    unit: '',
    client: '',
    clientCode: '',
    manager: '',
    managerCode: '',
    inQty: null,
    inboundDate: null
});

// [상태] 모달 제어용 상태 변수
const isModalVisible = ref(false);
const modalConfig = ref({
    title: '',
    api: null,
    columns: [],
    targetType: ''
});

// [추가] 현재 수정 중인 리스트의 행 번호 (null이면 상단 폼 입력 중)
const editingRowIndex = ref(null);

// [상태] 입고 대기 목록 데이터
const inboundList = ref([]);

// 1. 검색 버튼 클릭 시 모달 설정 및 열기 (index 파라미터 추가)
const openSearch = (type, index = null) => {
    modalConfig.value.targetType = type;

    // 리스트에서 호출했다면 index 저장, 상단 폼이면 null
    editingRowIndex.value = index;

    if (type === 'MAT') {
        modalConfig.value.title = '자재 검색';
        modalConfig.value.api = () => materialApi.getMaterialList();
        modalConfig.value.columns = [
            { field: 'matCode', header: '자재코드' },
            { field: 'matName', header: '자재명' },
            { field: 'category', header: '분류' },
            { field: 'unit', header: '단위' }
        ];
    } else if (type === 'CLIENT') {
        modalConfig.value.title = '공급업체 검색';
        modalConfig.value.api = () => materialApi.getClientList();
        modalConfig.value.columns = [
            { field: 'clientCode', header: '업체코드' },
            { field: 'clientName', header: '업체명' },
            { field: 'type', header: '구분' }
        ];
    } else if (type === 'EMP') {
        modalConfig.value.title = '담당자 검색';
        modalConfig.value.api = () => materialApi.getEmpList();
        modalConfig.value.columns = [
            { field: 'empCode', header: '사번' },
            { field: 'empName', header: '성명' },
            { field: 'deptName', header: '부서' }
        ];
    } else if (type === 'ORDER') {
        modalConfig.value.title = '발주정보 불러오기';
        modalConfig.value.api = async () => {
            const response = await materialApi.getOrderList();
            const formattedData = (response.data.data || []).map((row) => ({
                ...row,
                purchaseDate: row.purchaseDate ? String(row.purchaseDate).slice(0, 10) : ''
            }));
            return { data: formattedData };
        };
        modalConfig.value.columns = [
            { field: 'purchaseCode', header: '발주서 번호' },
            { field: 'purchaseDate', header: '발주제안일' },
            { field: 'matName', header: '자재명' }
        ];
    }
    isModalVisible.value = true;
};

// 2. 모달에서 데이터 선택 시 처리
const handleSelect = async (data) => {
    const type = modalConfig.value.targetType;

    // [CASE 1] 리스트의 특정 행(담당자)을 수정하는 경우
    if (editingRowIndex.value !== null && type === 'EMP') {
        inboundList.value[editingRowIndex.value].manager = data.empCode;
        inboundList.value[editingRowIndex.value].managerName = data.empName;

        // 수정 완료 후 초기화 및 모달 닫기
        editingRowIndex.value = null;
        isModalVisible.value = false;
        return;
    }

    // [CASE 2] 상단 입력 폼(form)을 채우는 경우
    if (type === 'MAT') {
        form.value.matCode = data.matCode;
        form.value.matName = data.matName;
        form.value.category = data.category;
        form.value.unit = data.unit;
    } else if (type === 'CLIENT') {
        form.value.clientCode = data.clientCode;
        form.value.client = data.clientName;
    } else if (type === 'EMP') {
        form.value.managerCode = data.empCode;
        form.value.manager = data.empName;
    } else if (type === 'ORDER') {
        // 발주서 불러오기 로직
        if (!data.purchaseCode) {
            isModalVisible.value = false;
            return;
        }
        try {
            const response = await materialApi.getOrderDetail(data.purchaseCode);
            const detailData = response.data.data;
            const items = detailData.items || [];

            if (items.length === 0) {
                toast.add({ severity: 'info', summary: '알림', detail: '해당 발주서에 포함된 자재가 없습니다.', life: 3000 });
                isModalVisible.value = false;
                return;
            }

            // 중복 체크
            const existingMatCodes = new Set(inboundList.value.map((item) => item.matCode));
            const newItems = items.filter((item) => !existingMatCodes.has(item.mat_code));
            const skippedCount = items.length - newItems.length;

            if (newItems.length === 0) {
                toast.add({ severity: 'info', summary: '알림', detail: '가져온 모든 품목이 이미 목록에 존재합니다.', life: 3000 });
                isModalVisible.value = false;
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            newItems.forEach((item) => {
                inboundList.value.push({
                    matCode: item.mat_code,
                    matName: item.matName,
                    category: item.matType,
                    unit: item.unit,
                    client: item.clientCode,
                    clientName: item.clientName,
                    // 담당자는 비워둠 -> 리스트에서 선택 유도
                    manager: '',
                    managerName: '',
                    inQty: item.req_qtt,
                    inboundDate: today,
                    // 필요 시 발주번호 등 추가 정보 저장
                    qioCode: item.purchaseCode || data.purchaseCode
                });
            });

            let toastMessage = `신규 ${newItems.length}건이 추가되었습니다.`;
            if (skippedCount > 0) {
                toastMessage += ` (${skippedCount}건 중복 제외)`;
            }
            toast.add({ severity: 'success', summary: '추가 완료', detail: toastMessage, life: 4000 });
        } catch (error) {
            console.error('발주 상세 정보 조회 실패:', error);
            toast.add({ severity: 'error', summary: '오류', detail: '발주 상세 정보를 불러오는 중 문제가 발생했습니다.', life: 3000 });
        }
    }

    // 모달 닫기
    isModalVisible.value = false;
};

// [기능] 목록에 추가 (수동 입력)
const addToList = () => {
    if (!form.value.matCode || !form.value.inQty || !form.value.clientCode || !form.value.inboundDate) {
        toast.add({ severity: 'warn', summary: '입력 확인', detail: '필수 입력 항목(*)을 모두 채워주세요.', life: 3000 });
        return;
    }
    // 수동 입력 시에는 담당자도 필수로 체크
    if (!form.value.managerCode) {
        toast.add({ severity: 'warn', summary: '입력 확인', detail: '담당자를 선택해주세요.', life: 3000 });
        return;
    }

    inboundList.value.push({
        ...form.value,
        clientName: form.value.client,
        client: form.value.clientCode,
        managerName: form.value.manager,
        manager: form.value.managerCode,
        inboundDate: form.value.inboundDate ? new Date(form.value.inboundDate).toISOString().split('T')[0] : ''
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
        clientCode: '',
        manager: '',
        managerCode: '',
        inQty: null,
        inboundDate: null
    };
};

// [기능] 행 삭제
const removeItem = (index) => {
    inboundList.value.splice(index, 1);
};

// [기능] 최종 등록
const submitRegistration = async () => {
    if (inboundList.value.length === 0) {
        toast.add({ severity: 'warn', summary: '확인', detail: '등록할 품목이 없습니다.', life: 3000 });
        return;
    }

    // [유효성 검사] 리스트에 담당자가 비어있는 항목이 있는지 확인
    const invalidIndex = inboundList.value.findIndex((item) => !item.manager);
    if (invalidIndex !== -1) {
        toast.add({ severity: 'warn', summary: '담당자 누락', detail: `${invalidIndex + 1}번째 항목의 담당자를 선택해주세요.`, life: 3000 });
        return;
    }

    if (!confirm(`총 ${inboundList.value.length}건을 입고 등록하시겠습니까?`)) return;

    try {
        const response = await materialApi.registerInbound({
            items: inboundList.value,
            regDate: new Date()
        });

        if (response.status === 200 || response.status === 201) {
            toast.add({ severity: 'success', summary: '완료', detail: '입고 등록이 정상적으로 처리되었습니다.', life: 3000 });
            inboundList.value = [];
            resetForm();
        }
    } catch (error) {
        console.error('API Error:', error);
        toast.add({ severity: 'error', summary: '오류', detail: '서버 등록 중 문제가 발생했습니다.', life: 3000 });
    }
};

const cancelRegistration = () => {
    if (inboundList.value.length > 0 && !confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) return;
    inboundList.value = [];
    resetForm();
};
</script>

<template>
    <div class="inbound-container">
        <Toast />

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
                        <InputText v-model="form.matCode" placeholder="자재코드를 검색하세요" class="flex-1 border-r-0 rounded-r-none cursor-pointer" readonly @click="openSearch('MAT')" />
                        <Button icon="pi pi-search" severity="secondary" text class="rounded-l-none border-l-0" @click="openSearch('MAT')" />
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
                        <InputText v-model="form.client" placeholder="공급업체를 검색하세요" class="flex-1 border-r-0 rounded-r-none cursor-pointer" readonly @click="openSearch('CLIENT')" />
                        <Button icon="pi pi-search" severity="secondary" text class="rounded-l-none border-l-0" @click="openSearch('CLIENT')" />
                    </div>
                </div>
                <div class="field-group">
                    <label class="field-label">담당자</label>
                    <div class="flex w-full">
                        <InputText v-model="form.manager" placeholder="담당자를 검색하세요" class="flex-1 border-r-0 rounded-r-none cursor-pointer" readonly @click="openSearch('EMP')" />
                        <Button icon="pi pi-search" severity="secondary" text class="rounded-l-none border-l-0" @click="openSearch('EMP')" />
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
                <button class="btn-green-custom" @click="openSearch('ORDER')">발주정보 불러오기</button>
            </div>

            <DataTable :value="inboundList" showGridlines stripedRows responsiveLayout="scroll" class="text-sm" removableSort scrollable scrollHeight="200px">
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
                <Column field="clientName" header="공급업체" sortable headerClass="center-header" bodyClass="text-center"></Column>

                <Column field="managerName" header="담당자" sortable headerClass="center-header" bodyClass="text-center">
                    <template #body="{ data, index }">
                        <div v-if="data.managerName" class="cursor-pointer text-primary hover:underline font-bold" @click="openSearch('EMP', index)" title="담당자 변경">{{ data.managerName }} <i class="pi pi-pencil text-xs ml-1 opacity-50"></i></div>
                        <Button v-else label="선택" icon="pi pi-user-plus" size="small" severity="warn" outlined @click="openSearch('EMP', index)" />
                    </template>
                </Column>

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

        <CommonSearchModal v-if="isModalVisible" v-model:visible="isModalVisible" :title="modalConfig.title" :columns="modalConfig.columns" :search-api="modalConfig.api" @select="handleSelect" />
    </div>
</template>

<style scoped>
/* 기존 스타일 유지 */
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
:deep(.text-center) {
    text-align: center !important;
}
:deep(.p-datatable-tbody > tr > td) {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;
}
.btn-green-custom {
    background: #4ecb79;
    color: white;
    padding: 8px 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
.cursor-pointer {
    cursor: pointer;
}
.hover\:underline:hover {
    text-decoration: underline;
}
.font-bold {
    font-weight: bold;
}
</style>

<style>
.center-header .p-column-header-content,
.center-header .p-datatable-column-header-content {
    justify-content: center !important;
}
html,
body {
    height: 100%;
    overflow: hidden;
}
</style>
