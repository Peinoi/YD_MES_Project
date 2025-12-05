import { defineStore } from 'pinia';
import { getPendingList, getInstruction, saveQcResult } from '../../service/qc/qcService';
import { dateFormatUtil } from '../../components/qc/utils/dateFormat';

export const useQcResultStore = defineStore('qcResult', {
    state: () => ({
        basic: {},

        instruction: {},

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
                this.basic.value = '';
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
            this.basic.qirEmpCode = 'seung02';
            this.basic.value = '';
            this.instruction = result.data[0];
            this.resultItems = result.data;
        },

        async saveResult() {
            if (this.isReset || this.basic.value == '') {
                alert('검사결과를 확인해주세요.');
                return;
            }
            this.basic.endDate = dateFormatUtil();

            console.log(this.basic);
            // await saveQcResult(payload);
        },

        closeModal() {
            this.modal.resultSelectVisible = false;
        },

        selectedQirCode() {
            this.selectedQir = this.modal.selectedRow?.qirCode;
            this.basic.qirCode = this.selectedQir;
            this.basic.qirEmpCode = 'seung01';
            this.basic.startDate = dateFormatUtil();
            this.closeModal();
        },

        reset() {
            this.$reset();
        },

        textClean(row) {
            row.value = row.value.replace(/\D/g, '');
        },

        enterJudge(row) {
            const v = Number(row.value);
            if (isNaN(v)) return (row.result = '');
            row.result = v >= row.rangeBot && v <= row.rangeTop ? '합격' : '불합격';
            this.basic.value = row.value;
            this.basic.result = row.result == '합격' ? 'g2' : 'g1';
        }
    }
});
