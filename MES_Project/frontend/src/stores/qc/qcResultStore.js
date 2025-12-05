import { defineStore } from 'pinia';
import { getPendingList, getInstruction, saveQcResult } from '../../service/qc/qcService';

export const useQcResultStore = defineStore('qcResult', {
    state: () => ({
        basic: {
            qirCode: '',
            qirEmpCode: '',
            startDate: '',
            endDate: '',
            defectQty: '',
            note: ''
        },

        instruction: {
            qioCode: '',
            prodName: '',
            qcrCode: '',
            inspVol: ''
        },

        modal: {
            resultSelectVisible: false,
            resultRows: [],
            selectedRow: null
        },

        // 테이블 데이터
        resultItems: [],

        // 모달에서 선택된 코드
        selectedQir: ''
    }),

    actions: {
        async loadPendingList() {
            try {
                const res = await getPendingList();
                this.modal.resultRows = res.data;
                // 모달 열기
                this.modal.resultSelectVisible = true;
            } catch (err) {
                console.error('loadResultList() 오류:', err);
            }
        },

        async loadInstruction() {
            const result = await getInstruction(this.selectedQir);
            this.basic = result.data[0];
            this.instruction = result.data[0];
            this.resultItems = result.data[0];
        },

        async saveResult() {
            const payload = {
                basic: this.basic,
                instruction: this.instruction,
                items: this.resultItems
            };
            await saveQcResult(payload);
        },

        openResultModal(rows) {
            this.modal.resultRows = rows;
            this.modal.resultSelectVisible = true;
        },

        closeResultModal() {
            this.modal.resultSelectVisible = false;
        },

        selectedQirCode() {
            this.selectedQir = this.modal.selectedRow?.qirCode;
            this.basic.qirCode = this.selectedQir;
            this.basic.qirEmpCode = 'seung01';
            this.closeResultModal();
        }
    }
});
