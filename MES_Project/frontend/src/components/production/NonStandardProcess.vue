<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { defineProps, defineEmits, ref } from 'vue';
import ProcessModal from './ProcessModal.vue'; // ⭐ 모달 import

// props 정의
const props = defineProps({
    rows: {
        type: Array,
        required: true
    }
});

// 더미 데이터 (props.rows가 없을 때 사용)
const dummyRows = ref([
    { processName: '열처리 1차', equipmentCode: 'E-101', processType: '정형', status: '진행 중', checked: false },
    { processName: '프레스 성형', equipmentCode: 'E-205', processType: '비정형', status: '대기', checked: false },
    { processName: '표면 연마', equipmentCode: 'E-330', processType: '정형', status: '완료', checked: false },
    { processName: '도장/코팅', equipmentCode: 'E-412', processType: '비정형', status: '에러', checked: false },
    { processName: '최종 검사', equipmentCode: 'E-500', processType: '정형', status: '대기', checked: false }
]);

// 컬럼 정의
const columns = ref([
    { field: 'processName', header: '공정명' },
    { field: 'equipmentCode', header: '설비코드' },
    { field: 'processType', header: '공정유형' },
    { field: 'status', header: '상태' }
]);

// 셀 편집
const onCellEditComplete = (event) => {
    let { data, newValue, field } = event;
    if (typeof newValue === 'string' && newValue.trim().length > 0) {
        data[field] = newValue;
    } else {
        data[field] = newValue;
    }
};

// 선택된 행
const selectedRows = ref([]);

// ⭐ 모달 표시 여부
const isProcessModalVisible = ref(false);

// ⭐ 공정 조회 버튼 → 모달 열기
const handleProcessInquiry = () => {
    console.log('공정 조회 버튼 클릭');
    isProcessModalVisible.value = true;
};

// ⭐ 모달에서 공정 선택 후 결과 받기
const handleProcessSelect = (process) => {
    console.log('모달에서 선택된 공정:', process);

    // 필요 시 선택된 공정을 rows 데이터에 바로 반영할 수도 있음
    // 예: 첫 번째 행에 적용 → selectedRows.value[0] 등등

    isProcessModalVisible.value = false;
};

// 삭제 버튼
const handleSubmit = () => {
    console.log('삭제 버튼 클릭 - 선택된 항목: ', selectedRows.value);
};
</script>

<template>
    <section class="result-card">
        <div class="result-header custom-header">
            <div class="left-section">
                <h3 class="title">공정 우선 순위</h3>
                <span class="info-text">
                    <i class="pi pi-info-circle"></i>
                    비정형일때만 사용
                </span>
            </div>

            <div class="right-section">
                <Button label="공정 조회" icon="pi pi-search" severity="success" @click="handleProcessInquiry" class="p-button-sm btn-inquiry-prime" />
                <Button label="삭제" icon="pi pi-trash" severity="danger" @click="handleSubmit" :disabled="selectedRows.length === 0" class="p-button-sm btn-delete-prime" />
            </div>
        </div>

        <div class="table-wrap">
            <DataTable
                :value="props.rows.length > 0 ? props.rows : dummyRows"
                v-model:selection="selectedRows"
                editMode="cell"
                @cell-edit-complete="onCellEditComplete"
                :pt="{
                    table: { style: 'min-width: 30rem' },
                    column: {
                        bodycell: ({ state }) => ({
                            class: [{ '!p-0': state['d_editing'] }]
                        })
                    }
                }"
                class="result-table-prime text-sm"
            >
                <Column selectionMode="multiple" headerStyle="width: 3rem;"></Column>

                <Column header="No." field="order" style="width: 3rem; text-align: center">
                    <template #body="{ index }"> {{ index + 1 }} </template>
                </Column>

                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" style="width: 20%">
                    <template v-if="col.field !== 'status'" #editor="{ data, field }">
                        <InputText v-model="data[field]" autofocus fluid />
                    </template>
                </Column>
            </DataTable>
        </div>

        <div class="selection-footer p-2 text-right text-xs" v-if="selectedRows.length > 0">선택된 항목: **{{ selectedRows.length }}개**</div>

        <!-- ⭐ 공정 조회 모달 연결 -->
        <ProcessModal :show="isProcessModalVisible" @close="isProcessModalVisible = false" @select="handleProcessSelect" />
    </section>
</template>

<style scoped>
/* 결과 카드 컨테이너 */
.result-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1rem 1.5rem 1.25rem;
    box-shadow: 0 2px 5px rgba(15, 23, 42, 0.1);
}

/* 커스텀 헤더 스타일 */
.custom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.75rem;
    margin-bottom: 0.5rem;
}

.left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.left-section .title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    color: #333;
}

.left-section .info-text {
    font-size: 0.8rem;
    color: #a87900;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

/* 버튼 섹션 */
.right-section {
    display: flex;
    gap: 0.5rem;
}

/* 공정 조회 버튼 (PrimeVue 'success' - 녹색) */
.btn-inquiry-prime {
    /* PrimeVue 기본 스타일 사용 */
}

/* 삭제 버튼 (PrimeVue 'danger' - 빨간색) */
.btn-delete-prime {
    /* PrimeVue 기본 스타일 사용 */
}

/* 테이블 래퍼 */
.table-wrap {
    width: 100%;
    overflow-x: auto;
}

/* PrimeVue 테이블 폰트 및 패딩 조정 */
.result-table-prime.text-sm :deep(.p-datatable-thead > tr > th),
.result-table-prime.text-sm :deep(.p-datatable-tbody > tr > td) {
    font-size: 0.85rem;
    padding: 0.6rem 0.75rem;
}

/* PrimeVue 헤더 배경색 */
.result-table-prime :deep(.p-datatable-thead > tr > th) {
    background-color: #f7f9fc !important;
    color: #495057;
    font-weight: 600;
}

/* 순번 컬럼 폰트 스타일 */
.result-table-prime :deep(.p-datatable-tbody > tr > td:nth-child(2)) {
    color: #6c757d;
}

/* 반응형 */
@media (max-width: 768px) {
    .custom-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
    .right-section {
        width: 100%;
        justify-content: flex-start;
    }
}
</style>
