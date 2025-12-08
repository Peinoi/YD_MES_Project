<script setup>
import { reactive, defineEmits } from 'vue';

const props = defineProps({
    lineOptions: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['search', 'reset']);

const initialForm = {
    startDate: '',
    endDate: '',
    status: '',
    lineCode: '',
    productName: '',
    workOrderNo: '',
    processType: ''
};

const searchForm = reactive({ ...initialForm });

const doSearch = () => {
    emit('search', {
        startDate: searchForm.startDate,
        endDate: searchForm.endDate,
        status: searchForm.status,
        lineCode: searchForm.lineCode,
        productName: searchForm.productName,
        workOrderNo: searchForm.workOrderNo,
        processType: searchForm.processType
    });
};

const resetForm = () => {
    Object.assign(searchForm, initialForm);
    emit('reset');
};
</script>

<template>
    <section class="search-card">
        <div class="search-grid">
            <!-- 기간 -->
            <div class="field field-range">
                <label>기간</label>
                <div class="range-row">
                    <input v-model="searchForm.startDate" type="date" class="input" />
                    <span class="range-dash">~</span>
                    <input v-model="searchForm.endDate" type="date" class="input" />
                </div>
            </div>

            <!-- 상태 -->
            <div class="field">
                <label>상태</label>
                <select v-model="searchForm.status" class="input">
                    <option value="">전체</option>
                    <option value="v1">진행중</option>
                    <option value="v2">작업완료</option>
                    <option value="v3">작업보류</option>
                    <option value="v4">작업대기</option>
                </select>
            </div>

            <!-- 라인 -->
            <div class="field">
                <label>라인</label>
                <select v-model="searchForm.lineCode" class="input">
                    <option value="">전체</option>
                    <option v-for="opt in props.lineOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </select>
            </div>

            <!-- 제품명 -->
            <div class="field">
                <label>제품명</label>
                <input v-model="searchForm.productName" type="text" class="input" />
            </div>

            <!-- 작업지시번호 -->
            <div class="field">
                <label>작업지시번호</label>
                <input v-model="searchForm.workOrderNo" type="text" class="input" placeholder="작업지시번호 입력" />
            </div>

            <!-- 공정유형 -->
            <div class="field">
                <label>공정유형</label>
                <select v-model="searchForm.processType" class="input">
                    <option value="">전체</option>
                    <option value="정형">정형</option>
                    <option value="비정형">비정형</option>
                </select>
            </div>
        </div>

        <div class="search-actions">
            <button class="btn btn-black" @click="resetForm">초기화</button>
            <button class="btn btn-yellow" @click="doSearch">조회</button>
        </div>
    </section>
</template>
<style scoped>
/*
    스타일은 기존과 동일하게 유지됩니다.
*/
/* 검색 카드 */
.search-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1.25rem 1.5rem 1rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    margin-bottom: 1.25rem;
}

.search-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem 1.25rem;
}

.field {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
}

.field-range .range-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.field label {
    margin-bottom: 0.2rem;
    color: #333;
}

.input {
    border: 1px solid #d0d7e2;
    border-radius: 4px;
    padding: 0.35rem 0.5rem;
    font-size: 0.85rem;
    outline: none;
    width: 100%;
}

.input:focus {
    border-color: #f2b300;
}

.range-dash {
    font-size: 0.8rem;
    color: #666;
}

.search-actions {
    margin-top: 0.8rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

/* 버튼 공통 */
.btn {
    border: none;
    border-radius: 4px;
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
}

.btn-black {
    background: #000;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
}

.btn-yellow {
    background: #ffc94a;
    color: #333;
    padding: 8px 14px;
    border-radius: 6px;
}

/* 반응형 */
@media (max-width: 1024px) {
    .search-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .search-grid {
        grid-template-columns: 1fr;
    }
}
</style>
