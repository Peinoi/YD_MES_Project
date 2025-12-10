<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
// 💡 분리된 모달 컴포넌트 임포트
import UnitSelectModal from '@/views/UnitSelectModal.vue';
import ProdTypeSelectModal from '@/views/ProdTypeSelectModal.vue';
import IsUsedSelectModal from '@/views/IsUsedSelectModal.vue';
import SpecSelectModal from '@/views/SpecSelectorModal.vue';
import ComValueSelectModal from '@/views/ComValueSelectModal.vue';
import EmployeeSelectModal from '@/views/EmployeeSelectModal.vue';
const showEmpModal = ref(false);
const toast = useToast();
const employees = ref([]);
const form = ref({
    prod_code: '',
    prod_name: '',
    prod_type: '',
    is_used: '',
    unit: '',
    edate: 180,
    spec: '',
    regdate: new Date(),
    note: '',
    com_value: '',
    reg: ''
});

// ------------------------------------
// 💡 모달 상태 및 데이터 정의
// ------------------------------------

// 💡 1. 규격 모달 상태 추가
const showSpecModal = ref(false);

// 💡 2. 규격 데이터 정의 (Categories)
const specOptions = ref([
    {
        key: 'O',
        name: 'O 규격',
        options: [
            { label: 'O1 (20)', value: 'o1' },
            { label: 'O2 (40)', value: 'o2' }
        ]
    },
    {
        key: 'X',
        name: 'X 규격',
        options: [
            { label: 'X1 (16)', value: 'x1' },
            { label: 'X2 (8)', value: 'x2' }
        ]
    },
    {
        key: 'Y',
        name: 'Y 규격',
        options: [
            { label: 'Y1 (12)', value: 'y1' },
            { label: 'Y2 (6)', value: 'y2' }
        ]
    },
    {
        key: 'Z',
        name: 'Z 규격(중량)',
        options: [
            { label: 'Z1 (120g)', value: 'z1' },
            { label: 'Z2 (110g)', value: 'z2' },
            { label: 'Z3 (65g)', value: 'z3' },
            { label: 'Z4 (25g)', value: 'z4' },
            { label: 'Z5 (20g)', value: 'z5' },
            { label: 'Z6 (15g)', value: 'z6' }
        ]
    }
]);
// 💡 1. 단품 종류 목록 (데이터) 추가
const comValueOptions = [
    { label: '봉지라면', value: 'j1' },
    { label: '컵라면(대)', value: 'j2' },
    { label: '컵라면(소)', value: 'j3' }
];

// ------------------------------------
// 💡 핸들러: 규격 모달 결과 처리
// ------------------------------------

// 현재 form.spec 문자열을 모달에 전달할 수 있도록 배열로 변환하는 computed 속성
const currentSpecArray = computed(() => {
    return form.value.spec ? form.value.spec.split(' / ').map((s) => s.trim()) : [];
});

// 모달에서 선택된 코드 배열을 받아 form.spec 문자열로 저장
function handleSpecSelect(selectedCodes) {
    // 💡 선택된 코드 (value) 배열을 슬래시 구분자로 결합하여 저장
    form.value.spec = selectedCodes.join(' / ');
}

// 1. 제품 유형 목록 (데이터)
const productTypeOptions = [
    { label: '완제품', value: 'i1' },
    { label: '반제품', value: 'i2' },
    { label: '부자재', value: 'i3' },
    { label: '원자재', value: 'i4' }
];
// 2. 사용 여부 목록 (데이터)
const isUsedOptions = [
    { label: '사용중', value: 'f2' },
    { label: '미사용', value: 'f1' }
];
// 3. 단위 목록 (데이터)
const unitOptions = [
    { label: 'kg', value: 'h1' },
    { label: 't', value: 'h2' },
    { label: 'L', value: 'h3' },
    { label: 'ea', value: 'h4' },
    { label: 'box', value: 'h5' },
    { label: 'g', value: 'h6' },
    { label: 'mm', value: 'h7' },
    { label: '%', value: 'h8' },
    { label: 'cm', value: 'h9' },
    { label: 'N', value: 'ha' },
    { label: 'mg', value: 'hb' },
    { label: 'ml', value: 'hc' },
    { label: 'mg/g', value: 'hd' }
];

// 💡 4. 모달 상태
const showUnitModal = ref(false);
const showProdTypeModal = ref(false);
const showIsUsedModal = ref(false);
const showComValueModal = ref(false);
// ------------------------------------
// 💡 유틸리티: 코드 -> 레이블 매핑 (InputText 표시용)
// ------------------------------------

const unitLabelMap = computed(() => {
    return unitOptions.reduce((map, item) => {
        map[item.value] = item.label;
        return map;
    }, {});
});

const prodTypeLabelMap = computed(() => {
    return productTypeOptions.reduce((map, item) => {
        map[item.value] = item.label;
        return map;
    }, {});
});

const isUsedLabelMap = computed(() => {
    return isUsedOptions.reduce((map, item) => {
        map[item.value] = item.label;
        return map;
    }, {});
});
const comValueLabelMap = computed(() => {
    return comValueOptions.reduce((map, item) => {
        map[item.value] = item.label;
        return map;
    }, {});
});

// ------------------------------------
// 💡 핸들러: 모달에서 선택된 값 적용
// ------------------------------------

function handleUnitSelect(unitData) {
    form.value.unit = unitData.value;
}

function handleProdTypeSelect(typeData) {
    form.value.prod_type = typeData.value;
}

function handleIsUsedSelect(usedData) {
    form.value.is_used = usedData.value;
}
function handleEmpSelect(emp) {
    form.value.reg = emp.emp_code;
    form.value.reg_name = emp.emp_name;
}
function handleComValueSelect(comValueData) {
    form.value.com_value = comValueData.value;
}

//사원불러오는모달호출
onMounted(async () => {
    const res = await axios.get('/api/add-product/employee');
    employees.value = res.data;
});

// 페이지 로드시 제품코드 자동생성
onMounted(async () => {
    try {
        const res = await axios.get('/api/add-product/next-code');
        form.value.prod_code = res.data.code;
    } catch (err) {
        console.error('초기 로딩 실패', err);
    }
});

// 저장
async function save() {
    try {
        await axios.post('/api/add-product', form.value);
        toast.add({ life: 3000, severity: 'success', summary: '완료', detail: '제품이 등록되었습니다.' });
    } catch (e) {
        console.error('등록 오류:', e.response?.data || e);
        toast.add({ life: 3000, severity: 'error', summary: '오류', detail: '등록 실패' });
    }
}
</script>

<template>
    <div class="page-wrapper">
        <Toast />

        <div class="form-panel">
            <h2 style="margin-bottom: 0.5rem">제품 등록</h2>
            <p style="color: #777; margin-bottom: 2rem">제품 정보를 입력해 주세요.</p>

            <!-- 기본 정보 -->
            <h3 class="section-title">기본 정보</h3>
            <div class="form-grid">
                <div class="form-item">
                    <label>제품코드</label>
                    <InputText v-model="form.prod_code" disabled class="input" />
                </div>

                <div class="form-item">
                    <label>제품명</label>
                    <InputText v-model="form.prod_name" class="input" placeholder="예) 신라면 20EA BOX" />
                </div>

                <div class="form-item">
                    <label>제품 유형</label>
                    <InputText :value="prodTypeLabelMap[form.prod_type]" readonly class="input" placeholder="선택" @click="showProdTypeModal = true" />
                </div>

                <div class="form-item">
                    <label>사용 여부</label>
                    <InputText :value="isUsedLabelMap[form.is_used]" readonly class="input" placeholder="선택" @click="showIsUsedModal = true" />
                </div>

                <div class="form-item">
                    <label>단위</label>
                    <InputText :value="unitLabelMap[form.unit]" readonly class="input" placeholder="선택" @click="showUnitModal = true" />
                </div>

                <div class="form-item">
                    <label>유통기한 (일)</label>
                    <InputNumber v-model="form.edate" :min="0" class="input" />
                </div>
            </div>

            <!-- 상세 정보 -->
            <h3 class="section-title" style="margin-top: 2.5rem">상세 정보</h3>
            <div class="form-grid">
                <div class="form-item">
                    <label>규격</label>
                    <InputText v-model="form.spec" readonly class="input" placeholder="선택" @click="showSpecModal = true" />
                </div>

                <div class="form-item">
                    <label>등록일</label>
                    <Calendar v-model="form.regdate" dateFormat="yy-mm-dd" class="input" />
                </div>

                <div class="form-item">
                    <label>단품 종류</label>
                    <InputText :value="comValueLabelMap[form.com_value]" readonly class="input" placeholder="선택" @click="showComValueModal = true" />
                </div>

                <div class="form-item">
                    <label>등록자</label>
                    <InputText :value="form.reg_name" readonly class="input" placeholder="선택" @click="showEmpModal = true" />
                </div>

                <div class="form-item" style="grid-column: 1 / 3">
                    <label>비고</label>
                    <Textarea v-model="form.note" rows="3" class="textarea" placeholder="특이사항 입력" />
                </div>
            </div>
            <div class="footer">
                <Button label="제품 등록" severity="primary" @click="save" class="save-btn" />
            </div>
        </div>

        <UnitSelectModal v-model="showUnitModal" :unitOptions="unitOptions" @select="handleUnitSelect" />
        <ProdTypeSelectModal v-model="showProdTypeModal" :typeOptions="productTypeOptions" @select="handleProdTypeSelect" />
        <IsUsedSelectModal v-model="showIsUsedModal" :usedOptions="isUsedOptions" @select="handleIsUsedSelect" />
        <ComValueSelectModal v-model="showComValueModal" :comValueOptions="comValueOptions" @select="handleComValueSelect" />
        <SpecSelectModal v-model="showSpecModal" :specOptions="specOptions" :currentSelection="currentSpecArray" @select="handleSpecSelect" />
        <EmployeeSelectModal v-model="showEmpModal" :employees="employees" @select="handleEmpSelect" />
    </div>
</template>

<style scoped>
.page-wrapper {
    padding: 2rem;
    background: #f7f9fc;
}

.form-panel {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    max-width: 1100px;
    margin: 0 auto;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    color: #222;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.2rem 3rem;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-item label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
}

.input {
    height: 44px;
    border-radius: 10px;
}

.textarea {
    border-radius: 12px;
}

.footer {
    bottom: 0;
    background: #ffffffcc;
    backdrop-filter: blur(6px);
    padding: 1rem 0;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: center;
}

.save-btn {
    width: 220px;
    height: 48px;
    font-size: 1.05rem;
    font-weight: 600;
    border-radius: 10px;
}
</style>
