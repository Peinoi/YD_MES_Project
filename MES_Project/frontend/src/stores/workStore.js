// stores/workStore.js
import { defineStore } from 'pinia';

export const useWorkStore = defineStore('work', {
    state: () => ({
        selectedWork: null,
        irregularData: null,
        isWorkRunning: false, // 작업 진행 중 여부
        currentProcessIndex: 0,
        processRates: {}
    }),

    actions: {
        // ------------------------------
        // 작업 지시 선택 저장/복원
        // ------------------------------
        setSelectedWork(work) {
            this.selectedWork = work;
            sessionStorage.setItem('selectedWork', JSON.stringify(work));
        },

        restoreSelectedWork() {
            const saved = sessionStorage.getItem('selectedWork');
            if (saved) this.selectedWork = JSON.parse(saved);
        },

        // ------------------------------
        // 비정형 작업 데이터 저장/복원
        // ------------------------------
        setIrregularData(data) {
            this.irregularData = data;
            sessionStorage.setItem('irregularData', JSON.stringify(data));
        },

        restoreIrregularData() {
            const saved = sessionStorage.getItem('irregularData');
            if (saved) this.irregularData = JSON.parse(saved);
        },

        // ------------------------------
        // 작업 진행 상태 저장/복원 (핵심 수정)
        // ------------------------------
        setWorkRunning(isRunning) {
            this.isWorkRunning = isRunning;
            sessionStorage.setItem('isWorkRunning', JSON.stringify(isRunning));
        },

        restoreWorkRunning() {
            const saved = sessionStorage.getItem('isWorkRunning');
            if (saved !== null) {
                this.isWorkRunning = JSON.parse(saved);
            }
        },

        // ------------------------------
        // 공정 인덱스
        // ------------------------------
        setCurrentProcessIndex(index) {
            this.currentProcessIndex = index;
            sessionStorage.setItem('currentProcessIndex', index);
        },

        restoreCurrentProcessIndex() {
            const saved = sessionStorage.getItem('currentProcessIndex');
            if (saved !== null) {
                this.currentProcessIndex = Number(saved);
            }
        },

        // ------------------------------
        // 공정별 진행률 저장
        // ------------------------------
        updateProcessRate(prdr_d_code, rate) {
            this.processRates[prdr_d_code] = rate;
        },

        // ------------------------------
        // 진행률 초기화 (핵심 포인트: isWorkRunning **초기화 금지**)
        // ------------------------------
        resetProcessRates() {
            this.processRates = {};
            this.currentProcessIndex = 0;
            // ❌ this.isWorkRunning = false; ← 제거!
        }
    }
});
