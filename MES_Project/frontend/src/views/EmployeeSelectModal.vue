<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, required: true }, // 모달 show/hide
    employees: { type: Array, required: true } // [{emp_code, emp_name, emp_job_id}, ...]
});

const emit = defineEmits(['update:modelValue', 'select']);

// 단일 선택 모델
const selectedEmp = ref('');

// m1 (관리자)만 필터링

const filteredEmployees = computed(() => {
    return props.employees.filter((emp) => emp.emp_job_id?.toLowerCase() === 'm1');
});
// 닫기
function close() {
    emit('update:modelValue', false);
}

// 선택 완료
function confirm() {
    const emp = filteredEmployees.value.find((e) => e.emp_code === selectedEmp.value);
    if (emp) {
        emit('select', emp); // 선택된 직원 객체 반환
    }
    close();
}
</script>

<template>
    <Dialog :visible="modelValue" modal header="등록자 선택" class="p-dialog-md" @update:visible="close">
        <div class="employee-list">
            <div v-for="emp in filteredEmployees" :key="emp.emp_code" class="employee-row">
                <RadioButton v-model="selectedEmp" :value="emp.emp_code" :inputId="emp.emp_code" />
                <label :for="emp.emp_code"> {{ emp.emp_name }} ({{ emp.emp_code }}) </label>
            </div>

            <div v-if="filteredEmployees.length === 0" class="empty-msg">표시할 직원이 없습니다. (emp_job_id = m1)</div>
        </div>

        <template #footer>
            <Button label="선택 완료" icon="pi pi-check" :disabled="!selectedEmp" @click="confirm" />
        </template>
    </Dialog>
</template>

<style scoped>
.employee-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    padding: 0.5rem 0;
}

.employee-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.95rem;
}

.empty-msg {
    padding: 1rem;
    text-align: center;
    color: #888;
}
</style>
