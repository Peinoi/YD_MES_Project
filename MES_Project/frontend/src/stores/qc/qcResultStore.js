import { defineStore } from 'pinia';

export const useQcResultStore = defineStore('qcResult', {
    state: () => ({
        // 004
        // 리스트
        qcList: [],

        searchResultList: [
            { key: '전체', value: null },
            { key: '합격', value: 'g2' },
            { key: '불합격', value: 'g1' }
        ],

        searchCriteria: {
            qcrCode: null,
            prodCode: '',
            prodName: '',
            checkMethod: '',
            result: null,
            note: '',
            startDate: null
        },

        // 005
        // 기본정보
        basic: {},

        // 지시정보
        instruction: {},

        modal: {
            showModal: false,
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
        // 004
        criteriaReset() {
            this.searchCriteria = {};
        },

        openModal() {
            this.modal.showModal = true;
        },

        // 005
        closeModal() {
            this.modal.showModal = false;
        },

        reset() {
            this.$reset();
        }
    }
});
