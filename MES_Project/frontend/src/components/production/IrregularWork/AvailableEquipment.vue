<script setup>
// AvailableEquipment.vue
import axios from 'axios';
import { ref, onBeforeMount } from 'vue';

const props = defineProps({
    selectedEq: {
        type: String,
        default: null
    }
});

const emit = defineEmits(['select-eq']);

let list = ref([]);

const getlist = async () => {
    const result = await axios.get(`/api/productionwork/work/availableequipmentlist`);
    const filterList = result.data.data.result.filter((item) => {
        // w1 : 사용 가능, w2 : 사용 중, w3 : 고장, w4 : 수리중, w5 : 점검중
        // 사용 가능(w1)만 노출
        return item.stat === 'w1';
    });
    list.value = filterList;
};

const selectEq = (eq) => {
    emit('select-eq', eq.eq_code);
};

onBeforeMount(() => {
    getlist();
});
</script>

<template>
    <div class="basic-info-card p-5">
        <div class="header-section flex justify-between items-center mb-5 pb-2 border-b-2 border-b-gray-300">
            <h5 class="text-xl font-bold text-gray-800">사용 가능 설비</h5>
        </div>

        <div class="form-grid">
            <div class="card-Box" v-for="value in list" :key="value.eq_code" :class="{ selected: value.eq_code === props.selectedEq }" @click="selectEq(value)">
                <span class="eq-code">{{ value.eq_code }}</span>
                <span class="eq-name">{{ value.eq_name }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.basic-info-card {
    background-color: #fff;
    border-radius: 7px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 15px;
    padding: 10px 0;
}

.card-Box {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #f59e0b;
    border-radius: 8px;
    padding: 12px 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    font-weight: bolder;
}

.card-Box.selected {
    border-color: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.eq-code {
    font-size: 14px;
    font-weight: 700;
    color: #92400e;
}
.eq-name {
    font-size: 13px;
    font-weight: 500;
    color: #78350f;
}
</style>
