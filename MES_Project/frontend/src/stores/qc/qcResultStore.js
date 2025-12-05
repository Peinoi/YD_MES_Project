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
            inspVol: '',
            checkMethod: '',
            rangeTop: '',
            rangeBot: '',
            unit: ''
        },

        modal: {
            resultSelectVisible: false,
            resultRows: [],
            selectedRow: null
        },

        // 테이블 행 갯수
        resultItems: [],

        // 모달에서 선택한 코드
        selectedQir: '',

        // 초기화 유무
        isReset: true
    }),

    actions: {
        async loadPendingList() {
            try {
                if (!this.isReset) {
                    alert('새로운 결과를 불러오기 전 초기화를 진행해주세요.');
                    return;
                }
                const res = await getPendingList();
                this.modal.resultRows = res.data;
                // 모달 열기
                this.modal.selectedRow = null;
                this.modal.resultSelectVisible = true;

                this.isReset = false;
            } catch (err) {
                console.error('loadResultList() 오류:', err);
            }
        },

        async loadInstruction() {
            if (this.basic.qirCode == '') {
                alert('검사결과 선택해주세요.');
                return;
            }
            const result = await getInstruction(this.selectedQir);
            if (result.data.length == 0) {
                alert('등록된 검사지시가 없습니다.');
                return;
            }
            this.basic = result.data[0];
            this.basic.qirEmpCode = 'seung02';
            this.instruction = result.data[0];
            this.resultItems = result.data;
        },

        async saveResult() {
            const payload = {
                basic: this.basic,
                instruction: this.instruction,
                items: this.resultItems
            };
            await saveQcResult(payload);
        },

        closeModal() {
            this.modal.resultSelectVisible = false;
        },

        selectedQirCode() {
            this.selectedQir = this.modal.selectedRow?.qirCode;
            this.basic.qirCode = this.selectedQir;
            this.basic.qirEmpCode = 'seung01';
            this.closeModal();
        },

        reset() {
            this.$reset();
        }
    }
});
