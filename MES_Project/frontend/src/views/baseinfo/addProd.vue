<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
// 💡 분리된 모달 컴포넌트 임포트
import UnitSelectModal from '@/views/UnitSelectModal.vue';
import ProdTypeSelectModal from '@/views/ProdTypeSelectModal.vue';
import IsUsedSelectModal from '@/views/IsUsedSelectModal.vue';

const toast = useToast();

const form = ref({
    prod_code: '',
    prod_name: '',
    prod_type: '',
    is_used: 'f2',
    unit: '',
    edate: 180,
    spec: '',
    regdate: new Date(),
    note: '',
    com_value: '',
    reg: ''
});

// ------------------------------------
// 💡 데이터 및 모달 상태 정의
// ------------------------------------

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
        toast.add({ severity: 'success', summary: '완료', detail: '제품이 등록되었습니다.' });
    } catch (e) {
        console.error('등록 오류:', e.response?.data || e);
        toast.add({ severity: 'error', summary: '오류', detail: '등록 실패' });
    }
}
</script>

<template>
    <div class="page-wrapper">
        <Toast />
        <div class="form-grid">
            <div class="form-card">
                <h3 class="section-title">기본 정보</h3>

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
                    <InputText :value="prodTypeLabelMap[form.prod_type] || ''" class="input" placeholder="제품 유형 선택" readonly @click="showProdTypeModal = true" />
                </div>

                <div class="form-item">
                    <label>사용 여부</label>
                    <InputText :value="isUsedLabelMap[form.is_used] || ''" class="input" placeholder="사용 여부 선택" readonly @click="showIsUsedModal = true" />
                </div>

                <div class="form-item">
                    <label>단위</label>
                    <InputText :value="unitLabelMap[form.unit] || ''" class="input" placeholder="단위 선택" readonly @click="showUnitModal = true" />
                </div>

                <div class="form-item">
                    <label>유통기한 (일)</label>
                    <InputNumber v-model="form.edate" :min="0" class="input" />
                </div>
            </div>

            <div class="form-card">
                <h3 class="section-title">상세 정보</h3>

                <div class="form-item">
                    <label>규격</label>
                    <InputText v-model="form.spec" class="input" placeholder="예) z1 / x1 / o1 ..." />
                </div>

                <div class="form-item">
                    <label>등록일</label>
                    <Calendar v-model="form.regdate" dateFormat="yy-mm-dd" class="input" />
                </div>

                <div class="form-item">
                    <label>비고</label>
                    <Textarea v-model="form.note" rows="3" class="input" />
                </div>

                <div class="form-item">
                    <label>등록자</label>
                    <InputText v-model="form.reg" placeholder="EMP-00000" class="input" />
                </div>

                <div class="form-item">
                    <label>기업 코드</label>
                    <InputText v-model="form.com_value" placeholder="j1 / j2" class="input" />
                </div>
            </div>
        </div>

        <UnitSelectModal v-model="showUnitModal" :unitOptions="unitOptions" @select="handleUnitSelect" />
        <ProdTypeSelectModal v-model="showProdTypeModal" :typeOptions="productTypeOptions" @select="handleProdTypeSelect" />
        <IsUsedSelectModal v-model="showIsUsedModal" :usedOptions="isUsedOptions" @select="handleIsUsedSelect" />

        <div class="footer-fixed">
            <Button label="제품 등록" severity="primary" @click="save" class="save-btn" />
        </div>
    </div>
</template>

<style scoped>
.page-wrapper {
    padding: 1.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-card {
    background: #ffffff;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px #00000008;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.form-item {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
}

.form-item label {
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 0.3rem;
}

.input {
    width: 100%;
    /* 💡 수정: 모달이 잘 보이도록 포인터 추가 */
    cursor: pointer;
}

.footer-fixed {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 1rem 0;
    text-align: right;
    border-top: 1px solid #e5e7eb;
}

.save-btn {
    width: 160px;
    height: 42px;
    font-size: 1rem;
}
</style>
