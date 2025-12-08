<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

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

// 제품유형 매핑
const productTypeOptions = [
    { label: '완제품', value: 'i1' },
    { label: '반제품', value: 'i2' },
    { label: '부자재', value: 'i3' },
    { label: '원자재', value: 'i4' }
];

// 단위 목록 (unitMap 기반)
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
        toast.add({ severity: 'error', summary: '오류', detail: '등록 실패' });
    }
}
</script>

<template>
    <div class="page-wrapper">
        <div class="form-grid">
            <!-- ▣ 좌측: 기본 정보 -->
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
                    <Dropdown v-model="form.prod_type" :options="productTypeOptions" optionLabel="label" optionValue="value" placeholder="선택" class="input" />
                </div>

                <div class="form-item">
                    <label>사용 여부</label>
                    <Dropdown
                        v-model="form.is_used"
                        :options="[
                            { label: '사용중', value: 'f2' },
                            { label: '미사용', value: 'f1' }
                        ]"
                        class="input"
                    />
                </div>

                <div class="form-item">
                    <label>단위</label>
                    <Dropdown v-model="form.unit" :options="unitOptions" optionLabel="label" optionValue="value" :editable="false" />
                </div>

                <div class="form-item">
                    <label>유통기한 (일)</label>
                    <InputNumber v-model="form.edate" :min="0" class="input" />
                </div>
            </div>

            <!-- ▣ 우측: 상세 정보 -->
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

        <!-- ===== 저장 버튼 ===== -->
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
