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
    console.log('🔥 클릭한 row:', row);

    // original이 있으면 original 사용, 없으면 row 자체 사용
    const dataToSend = row.original || row;

    console.log('🔥 전달할 데이터:', dataToSend);

    // 🔥 Base64 인코딩으로 URL 안전하게 전달
    const base64Data = btoa(encodeURIComponent(JSON.stringify(dataToSend)));

    router.push({
        name: 'productionPlanDetail',
        params: { id: row.workOrderNo || row['작업지시번호'] },
        query: {
            d: base64Data // 🔥 짧은 키 이름 + Base64 인코딩
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

                    <tr v-for="row in props.rows" :key="row.id || row['작업지시번호']" @click="goDetail(row)" class="clickable-row">
                        <td>
                            <input v-model="row.checked" type="checkbox" @click.stop />
                        </td>
                        <td>{{ row.workOrderNo || row['작업지시번호'] }}</td>
                        <td>{{ row.productName || row['제품명'] }}</td>
                        <td>{{ row.lineCode || row['작업라인코드'] || '-' }}</td>
                        <td>{{ row.processType || '정형' }}</td>
                        <td>{{ row.startTime || row['작업시작일시'] }}</td>
                        <td>{{ row.statusLabel || row['상태'] }}</td>
                        <td>{{ row.plannedCompletion || row['예상완료일시'] }}</td>
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

    /* 🔥 스크롤 추가 */
    max-height: 480px; /* 10개 정도 보이는 높이 */
    overflow-y: auto;

    /* Optional: 스크롤바 디자인 깔끔하게 */
    scrollbar-width: thin;
    scrollbar-color: #c1c5d0 #f1f1f5;
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
