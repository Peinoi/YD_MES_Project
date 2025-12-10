// stores/workStore.js
import { defineStore } from 'pinia';

export const useWorkStore = defineStore('workStore', {
    state: () => ({
        selectedWork: null,
        irregularData: null,
        isWorkRunning: false,
        currentProcessIndex: 0,
        processRates: {} // { prdr_d_code: 진행률 }
    }),

    actions: {
        setSelectedWork(work) {
            this.selectedWork = work;
            sessionStorage.setItem('selectedWork', JSON.stringify(work));
        },
        restoreSelectedWork() {
            const saved = sessionStorage.getItem('selectedWork');
            if (saved) this.selectedWork = JSON.parse(saved);
        },

        setIrregularData(data) {
            this.irregularData = data;
            sessionStorage.setItem('irregularData', JSON.stringify(data));
        },
        restoreIrregularData() {
            const saved = sessionStorage.getItem('irregularData');
            if (saved) this.irregularData = JSON.parse(saved);
        },

        // 작업 진행 여부
        setWorkRunning(val) {
            this.isWorkRunning = val;
            sessionStorage.setItem('isWorkRunning', val);
        },
        restoreWorkRunning() {
            const saved = sessionStorage.getItem('isWorkRunning');
            if (saved !== null) this.isWorkRunning = saved === 'true';
        },

        // 현재 공정 인덱스 저장
        setCurrentProcessIndex(idx) {
            this.currentProcessIndex = idx;
            sessionStorage.setItem('currentProcessIndex', idx);
        },
        restoreCurrentProcessIndex() {
            const saved = sessionStorage.getItem('currentProcessIndex');
            if (saved !== null) this.currentProcessIndex = Number(saved);
        },

        // 개별 공정 진행률 저장
        updateProcessRate(code, rate) {
            this.processRates[code] = rate;
            sessionStorage.setItem('processRates', JSON.stringify(this.processRates));
        },
        restoreProcessRates() {
            const saved = sessionStorage.getItem('processRates');
            if (saved) this.processRates = JSON.parse(saved);
        },

        resetProcessRates() {
            this.processRates = {};
            sessionStorage.removeItem('processRates');
        }
    }
});
