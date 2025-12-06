// /src/stores/workStore.js
import { defineStore } from 'pinia';

export const useWorkStore = defineStore('workStore', {
    state: () => ({
        selectedWork: null
    }),

    actions: {
        // 작업지시 선택 저장
        setSelectedWork(work) {
            this.selectedWork = work;
            localStorage.setItem('selectedWork', JSON.stringify(work));
        },

        // 새로고침 시 복원
        restoreSelectedWork() {
            const saved = localStorage.getItem('selectedWork');
            if (saved) {
                this.selectedWork = JSON.parse(saved);
            }
        },

        // 초기화
        resetSelectedWork() {
            this.selectedWork = null;
            localStorage.removeItem('selectedWork');
        }
    }
});
