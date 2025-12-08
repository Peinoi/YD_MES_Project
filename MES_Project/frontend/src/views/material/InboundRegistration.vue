<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import inboundApi from '@/api/inbound';
import CommonSearchModal from '@/components/common/CommonSearchModal.vue';
const toast = useToast();

// [상태] 입력 폼 데이터
const form = ref({
    matCode: '',
    matName: '',
    category: '',
    unit: '',
    client: '', // 업체명 (표시용)
    clientCode: '', // 업체코드 (저장용)
    manager: '', // 담당자명 (표시용)
    managerCode: '', // 담당자코드 (저장용)
    inQty: null, // 숫자형으로 초기화
    inboundDate: null
});
// [추가] 모달 제어용 상태 변수
const isModalVisible = ref(false);
const modalConfig = ref({
    title: '',
    api: null,
    columns: [],
    targetType: ''
});

// [상태] 입고 대기 목록 데이터
// 실제 운영 시에는 빈 배열 []로 시작하는 것이 일반적입니다.
const inboundList = ref([]);
// 검색 버튼 클릭 시 모달 설정 및 열기
const openSearch = (type) => {
    modalConfig.value.targetType = type;

    if (type === 'MAT') {
        modalConfig.value.title = '자재 검색';
        modalConfig.value.api = () => inboundApi.getMaterialList();
        modalConfig.value.columns = [
            { field: 'matCode', header: '자재코드' },
            { field: 'matName', header: '자재명' },
            { field: 'category', header: '분류' },
            { field: 'unit', header: '단위' }
        ];
    } else if (type === 'CLIENT') {
        modalConfig.value.title = '공급업체 검색';
        modalConfig.value.api = () => inboundApi.getClientList();
        modalConfig.value.columns = [
            { field: 'clientCode', header: '업체코드' },
            { field: 'clientName', header: '업체명' },
            { field: 'type', header: '구분' }
        ];
    } else if (type === 'EMP') {
        modalConfig.value.title = '담당자 검색';
        modalConfig.value.api = () => inboundApi.getEmpList();
        modalConfig.value.columns = [
            { field: 'empCode', header: '사번' },
            { field: 'empName', header: '성명' },
            { field: 'deptName', header: '부서' }
        ];
    } else if (type === 'ORDER') {
        modalConfig.value.title = '발주정보 불러오기';
        // [수정] API 응답 데이터 구조에 맞춰 실제 데이터 배열을 반환하도록 수정
        modalConfig.value.api = async () => {
            const response = await inboundApi.getOrderList();
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

// 모달에서 데이터 선택 시 폼에 반영
const handleSelect = async (data) => {
    const type = modalConfig.value.targetType;

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
        if (!data.purchaseCode) {
            isModalVisible.value = false;
            return;
        }
        try {
            const response = await inboundApi.getOrderDetail(data.purchaseCode);
            const detailData = response.data.data;
            const items = detailData.items || [];

            if (items.length === 0) {
                toast.add({ severity: 'info', summary: '알림', detail: '해당 발주서에 포함된 자재가 없습니다.', life: 3000 });
                isModalVisible.value = false;
                return;
            }

            // [수정] 중복 추가 방지 로직
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
                    manager: '',
                    managerName: '',
                    inQty: item.req_qtt,
                    inboundDate: today
                });
            });

            let toastMessage = `신규 ${newItems.length}개 품목이 추가되었습니다.`;
            if (skippedCount > 0) {
                toastMessage += ` (${skippedCount}개는 이미 존재하여 건너뜁니다.)`;
            }
            toast.add({ severity: 'success', summary: '추가 완료', detail: toastMessage, life: 4000 });
        } catch (error) {
            console.error('발주 상세 정보 조회 실패:', error);
            toast.add({ severity: 'error', summary: '오류', detail: '발주 상세 정보를 불러오는 중 문제가 발생했습니다.', life: 3000 });
        }
    }
    isModalVisible.value = false;
};
// [기능] 목록에 추가
const addToList = () => {
    if (!form.value.matCode || !form.value.inQty || !form.value.clientCode || !form.value.inboundDate) {
        toast.add({ severity: 'warn', summary: '입력 확인', detail: '필수 입력 항목(*)을 모두 채워주세요.', life: 3000 });
        return;
    }
    inboundList.value.push({
        ...form.value,
        // Date 객체를 YYYY-MM-DD 문자열로 변환
        clientName: form.value.client, // 테이블 표시용
        client: form.value.clientCode, // DB 전송용 (백엔드 필드명에 맞춤)
        managerName: form.value.manager, // 테이블 표시용
        manager: form.value.managerCode, // DB 전송용
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
        clientCode: '', // [수정] 초기화 대상 추가
        manager: '',
        managerCode: '', // [수정] 초기화 대상 추가
        inQty: null,
        inboundDate: null
    };
};

// [기능] 행 삭제
const removeItem = (index) => {
    inboundList.value.splice(index, 1);
};

// [기능] 최종 등록 (API 연동 적용됨)
const submitRegistration = async () => {
    // 1. 데이터 검증
    if (inboundList.value.length === 0) {
        toast.add({ severity: 'warn', summary: '확인', detail: '등록할 품목이 없습니다.', life: 3000 });
        return;
    }

    // 2. 사용자 확인
    if (!confirm(`총 ${inboundList.value.length}건을 입고 등록하시겠습니까?`)) return;

    try {
        // 3. API 호출
        // 백엔드에서 기대하는 포맷에 맞춰 데이터 전송 (여기서는 { items: [...] } 형태로 가정)
        const response = await inboundApi.registerInbound({
            items: inboundList.value,
            regDate: new Date() // 필요 시 전송 시점 시간 추가
        });

        // 4. 성공 처리 (HTTP 200 or 201)
        if (response.status === 200 || response.status === 201) {
            toast.add({ severity: 'success', summary: '완료', detail: '입고 등록이 정상적으로 처리되었습니다.', life: 3000 });

            // 데이터 초기화
            inboundList.value = [];
            resetForm();
        }
    } catch (error) {
        // 5. 에러 처리
        console.error('API Error:', error);
        toast.add({ severity: 'error', summary: '오류', detail: '서버 등록 중 문제가 발생했습니다.', life: 3000 });
    }
};

// [기능] 취소
const cancelRegistration = () => {
    if (inboundList.value.length > 0 && !confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
        return;
    }
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
                <Column field="clientName" header="공급업체" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="managerName" header="담당자" sortable headerClass="center-header" bodyClass="text-center"></Column><Column field="inQty" header="입고수량" sortable headerClass="center-header" bodyClass="text-center"></Column>
                <Column field="inboundDate" header="입고일자" sortable headerClass="center-header" bodyClass="text-center"></Column>

                <Column header="삭제" headerClass="center-header" bodyClass="text-center" style="width: 6rem">
                    <template #body="{ index }">
                        <Button label="삭제" class="p-button-danger p-button-sm p-button-text" @click="removeItem(index)" />
                    </template>
                </Column>
            </DataTable>

            <div class="final-actions center-actions">
                <Button label="등록" icon="pi pi-check" severity="info" class="mr-2 px-5" @click="submitRegistration" />
                <Button label="취소" icon="pi pi-times" severity="secondary" class="px-5" @click="cancelRegistration" />
            </div>
        </div>
        <CommonSearchModal v-if="isModalVisible" v-model:visible="isModalVisible" :title="modalConfig.title" :columns="modalConfig.columns" :search-api="modalConfig.api" @select="handleSelect" />
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

/* [수정] btn-green-custom 스타일 */
.btn-green-custom {
    background: #4ecb79;
    color: white;
    padding: 8px 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
</style>

<style>
/* PrimeVue 4 헤더 컨텐츠 클래스명 대응 */
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
