<script setup>
// WorkPerformanceTable.vue
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
    // rows 배열은 이제 다음 필드를 포함해야 합니다:
    // workOrderNo, productName, processName, processType, workDate, startTime, status, plannedCompletion, priority
    rows: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['download']);

// ... (allChecked 및 downloadExcel 로직은 동일)
const allChecked = computed({
    get() {
        return props.rows.length > 0 && props.rows.every((r) => r.checked);
    },
    set(val) {
        props.rows.forEach((r) => {
            r.checked = val;
        });
    }
});

const resultCount = computed(() => props.rows.length);
const formatDate = (dateString) => {
    if (!dateString) return "";

    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${y}-${m}-${day} ${hh}:${mm}`;
};
const downloadExcel = () => {
    emit('download');
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
                        <th>실적번호</th>
                        <th>생산일자</th>
                        <th>제품명</th>
                        <th>작업지시번호</th>
                        <th>양품수량</th>
                        <th>불량수량</th>
                        <th>LOT번호</th>
                        <th>라인번호</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="!props.rows.length">
                        <td colspan="10" class="empty">검색 결과가 없습니다.</td>
                    </tr>

                    <tr v-for="row in props.rows" :key="row.id">
                        <td>
                            <input v-model="row.checked" type="checkbox" />
                        </td>
                        <td>{{ row.code }}</td>
                        <td>{{ formatDate(row.cr_date) }}</td>
                        <td>{{ row.name }}</td>
                        <td>{{ row.order_num }}</td>
                        <td>{{ row.qtt }}</td>
                        <td>{{ row.notqtt }}</td>
                        <td>{{ row.lotnum }}</td>
                        <td>{{ row.linecode }}</td>
                        <td>{{ row.stat }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</template>

<style scoped>
/*
   colspan 변경 외에는 CSS 수정이 필요 없습니다.
*/
/* 결과 카드 */
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

/* 테이블 */
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

.result-table th {
    text-align: left;
}

.text-right {
    text-align: right;
}

.empty {
    text-align: center;
    color: #888;
}

/* 반응형 */
@media (max-width: 640px) {
    .result-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>
