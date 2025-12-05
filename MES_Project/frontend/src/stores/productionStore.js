import { defineStore } from 'pinia';

export const useProductionPlanStore = defineStore('productionPlan', {
    state: () => ({
        selectedPlan: null // 선택된 생산계획 전체 객체 저장
    }),

    actions: {
        // 🔹 PlanModal에서 선택된 데이터 저장
        setSelectedPlan(planData) {
            this.selectedPlan = planData;
        },

        // 🔹 초기화 (부모1의 초기화 버튼에서 사용)
        resetSelectedPlan() {
            this.selectedPlan = null;
        },

        // 🔹 저장 버튼에서 사용할 데이터 getter
        getSavePayload() {
            return this.selectedPlan;
        }
    }
});
