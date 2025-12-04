<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: '' },
    columns: { type: Array, default: () => [] },
    rows: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'id' }
});

const emit = defineEmits(['update:modelValue', 'search', 'confirm', 'cancel']);

const keyword = ref('');
const selectedKey = ref(null);

const close = () => emit('update:modelValue', false);
const onSearch = () => emit('search', keyword.value);

const onSelectRow = (row) => {
    selectedKey.value = row[props.rowKey];
};

const onCancel = () => {
    emit('cancel');
    close();
};

const onConfirm = () => {
    emit('confirm', selectedKey.value ? props.rows.find((r) => r[props.rowKey] === selectedKey.value) : null);
    close();
};
</script>

<template>
    <div v-if="modelValue" class="ssm-backdrop">
        <div class="ssm-modal">
            <!-- 검색 영역 -->
            <div class="ssm-search-row">
                <input v-model="keyword" type="text" class="ssm-search-input" :placeholder="searchPlaceholder" @keyup.enter="onSearch" />
                <button class="ssm-btn ssm-btn-blue" @click="onSearch">검색</button>
            </div>

            <!-- 테이블 -->
            <div class="ssm-table-wrap">
                <table class="ssm-table">
                    <thead>
                        <tr>
                            <th style="width: 50px" class="ssm-center">선택</th>
                            <th v-for="col in columns" :key="col.field">
                                {{ col.label }}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-if="!rows.length">
                            <td :colspan="columns.length + 1" class="ssm-empty">데이터가 없습니다.</td>
                        </tr>

                        <tr v-for="row in props.rows" :key="row[props.rowKey]" class="ssm-row" @click="onSelectRow(row)">
                            <td class="ssm-center">
                                <input type="checkbox" :checked="row[props.rowKey] === selectedKey" @change="onSelectRow(row)" />
                            </td>
                            <td v-for="col in columns" :key="col.field">
                                <slot :name="`cell-${col.field}`" :row="row" :value="row[col.field]">
                                    {{ row[col.field] }}
                                </slot>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 하단 -->
            <div class="ssm-footer">
                <button class="ssm-btn ssm-btn-gray" @click="onCancel">취소</button>
                <button class="ssm-btn ssm-btn-yellow" @click="onConfirm">확인</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 전체 글자 크기 통일 */
* {
    font-size: 14px;
}

/* 배경 */
.ssm-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

/* 모달 박스 */
.ssm-modal {
    background: #ffffff;
    border-radius: 8px;
    min-width: 850px;
    max-width: 1100px;
    max-height: 80vh;
    padding: 1.5rem 1.8rem 1.2rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
}

/* 검색 영역 */
.ssm-search-row {
    display: flex;
    gap: 0.7rem;
    margin-bottom: 1rem;
}

.ssm-search-input {
    flex: 1;
    border-radius: 6px;
    border: 1px solid #d0d7e2;
    padding: 10px; /* 🔥 Forwarding 페이지와 동일 크기 */
    font-size: 14px;
}

.ssm-search-input:focus {
    border-color: #f2b300;
}

/* 버튼 공통 (Forward 페이지와 통일) */
.ssm-btn {
    border: none;
    padding: 10px 20px; /* 🔥 동일 크기 */
    border-radius: 6px; /* 🔥 동일 */
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
}

.ssm-btn-blue {
    background: #4ea3ff;
    color: white;
}

.ssm-btn-gray {
    background: #555555;
    color: white;
}

.ssm-btn-yellow {
    background: #ffc94a;
    color: white;
}

/* 테이블 */
.ssm-table-wrap {
    flex: 1;
    overflow: auto;
    border: 1px solid #e0e4f0;
    border-radius: 6px;
}

.ssm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px; /* 🔥 통일 */
}

.ssm-table th,
.ssm-table td {
    padding: 10px; /* 🔥 Forward 테이블과 동일 패딩 */
    border-bottom: 1px solid #e0e4f0;
    text-align: center;
}

.ssm-row:hover {
    background: #f5f5f5;
}

.ssm-center {
    text-align: center;
}

.ssm-empty {
    padding: 1rem;
    text-align: center;
    color: #777;
}

/* 하단 버튼 */
.ssm-footer {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}
</style>
