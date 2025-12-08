<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
    rows: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['download']);

const allChecked = computed({
    get() {
        return props.rows.length > 0 && props.rows.every((r) => r.checked);
    },
    set(val) {
        props.rows.forEach((r) => (r.checked = val));
    }
});

const resultCount = computed(() => props.rows.length);

const downloadExcel = () => emit('download');

// 🔥 행 클릭 시 상세 페이지로 이동 (전체 원본 데이터 포함)
const goDetail = (row) => {
    if (!row.original) {
        console.warn('row.original 데이터가 없습니다.');
        return;
    }

    router.push({
        name: 'productionPlanDetail',
        params: { id: row.workOrderNo },
        query: {
            data: JSON.stringify(row.original) // 🔥 전체 원본 데이터 전달
        }
    });
};
</script>

<template>
    <section class="result-card">
        <div class="result-header">
            <div class="result-count">검색 결과 {{ resultCount }}건</div>

            <button class="btn btn-excel" @click="downloadExcel">엑셀 다운로드</button>
        </div>

        <div class="table-wrap">
            <table class="result-table">
                <thead>
                    <tr>
                        <th style="width: 40px">
                            <input type="checkbox" v-model="allChecked" />
                        </th>
                        <th>작업지시번호</th>
                        <th>제품명</th>
                        <th>라인코드</th>
                        <th>공정유형</th>
                        <th>시작시간</th>
                        <th>상태</th>
                        <th>완료예정</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="!props.rows.length">
                        <td colspan="8" class="empty">검색 결과가 없습니다.</td>
                    </tr>

                    <tr v-for="row in props.rows" :key="row.id" @click="goDetail(row)" class="clickable-row">
                        <td>
                            <input v-model="row.checked" type="checkbox" @click.stop />
                        </td>
                        <td>{{ row.workOrderNo }}</td>
                        <td>{{ row.productName }}</td>
                        <td>{{ row.lineCode || '-' }}</td>
                        <td>{{ row.processType }}</td>
                        <td>{{ row.startTime }}</td>
                        <td>{{ row.statusLabel }}</td>
                        <td>{{ row.plannedCompletion }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>

<style scoped>
.result-card {
    background: #ffffff;
    border-radius: 6px;
    padding: 1rem 1.5rem 1.25rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
}

.result-count {
    font-weight: 600;
}

.btn-excel {
    padding: 7px 16px;
    font-size: 13px;
    border-radius: 6px;
    border: 1px solid #6cbf5a;
    background: #f4fff2;
    cursor: pointer;
}

.table-wrap {
    width: 100%;
    overflow-x: auto;
}

.result-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.result-table thead {
    background: #f9f9fb;
}

.result-table th,
.result-table td {
    padding: 0.45rem 0.6rem;
    border: 1px solid #e0e4f0;
}

.empty {
    text-align: center;
    color: #888;
}

.clickable-row {
    cursor: pointer;
}
.clickable-row:hover {
    background: #f3f6ff;
}

@media (max-width: 640px) {
    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>
