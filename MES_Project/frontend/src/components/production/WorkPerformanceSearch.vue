<script setup>
// WorkPerformancesSearch.vue
import { reactive, defineEmits } from 'vue';

const emit = defineEmits(['search', 'reset']);

// 검색 조건의 초기 상태에 'remarks' 추가
const initialForm = {
    startDate: '', // 기간 시작일
    endDate: '', // 기간 종료일
    stat: '', // 상태
    linecode: '', // 라인
    name: '', // 제품명
    lotnum: '', // 로트번호
    order_num: '' // 작업지시번호
};

const searchForm = reactive({ ...initialForm });

// '조회' 버튼 클릭 시: 현재 form 데이터를 부모로 전달
const doSearch = () => {
    emit('search', { ...searchForm });
};

// '초기화' 버튼 클릭 시: form 객체를 초기 상태로 재설정하고 부모에게 알림
const resetForm = () => {
    Object.assign(searchForm, initialForm);
    emit('reset');
};
</script>

<template>
    <section class="search-card">
        <div class="search-grid">
            <div class="field field-range">
                <label>기간</label>
                <div class="range-row">
                    <input v-model="searchForm.startDate" type="date" class="input" />
                    <span class="range-dash">~</span>
                    <input v-model="searchForm.endDate" type="date" class="input" />
                </div>
            </div>
            <div class="field">
                <label>제품명</label>
                <input v-model="searchForm.name" type="text" class="input" placeholder="제품명 입력" />
            </div>
            <div class="field">
                <label>라인번호</label>
                <input v-model="searchForm.linecode" type="text" class="input" placeholder="제품명 입력" />
            </div>
            <div class="field">
                <label>상태</label>
                <select v-model="searchForm.stat" class="input">
                    <option value="">전체</option>
                    <option value="대기 중">대기 중</option>
                    <option value="생산 중">생산 중</option>
                    <option value="생산 완료">생산 완료</option>
                    <option value="생산 일시 정지">생산 일시 정지</option>
                    <option value="가동 중지">가동 중지</option>
                </select>
            </div>

            <div class="field">
                <label>작업지시번호</label>
                <input v-model="searchForm.order_num" type="text" class="input" placeholder="제품명 입력" />
            </div>

            <div class="field">
                <label>LOT번호</label>
                <input v-model="searchForm.lotnum" type="text" class="input" placeholder="작업자명 입력" />
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
