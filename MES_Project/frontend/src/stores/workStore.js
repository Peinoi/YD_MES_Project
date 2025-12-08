import { defineStore } from 'pinia';

export const useWorkStore = defineStore('workStore', {
    state: () => ({
        selectedWork: null, // TaskProgressList에서 선택한 row
        irregularData: null // IrregularWork에서 사용할 데이터
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

        // 비정형 작업용 데이터 저장 (Productionwork에서 IrregularWork로 이동할 때 사용)
        // data: { work, details }
        setIrregularData(data) {
            this.irregularData = data;
            localStorage.setItem('irregularData', JSON.stringify(data));
        },

        // 비정형 작업용 데이터 복원
        restoreIrregularData() {
            const saved = localStorage.getItem('irregularData');
            if (saved) {
                this.irregularData = JSON.parse(saved);
            }
        },

        resetIrregularData() {
            this.irregularData = null;
            localStorage.removeItem('irregularData');
        }
    }
});
