import axios from 'axios';
import { defineStore } from 'pinia';

// 다른 컴포넌트에서 사용할 수 있게 export해주고
// 가져온 defineStore()에 첫번째 파라미터로 다른 컴포넌트에서 쓸 이름 설정해주고 (='quality')
// 두번째 파라미터로 store에 관련된 옵션을 정의해주면 된다.
export const useQualityStore = defineStore('quality', {
    // 1. state: 관리할 상태 값들을 정의합니다.
    state: () => ({
        // API로부터 받아온 원본 데이터 목록
        qcrList: [], // qcr_tbl: 품질검사 기준정보 + 검사항목 + 검사상세항목 합쳐진 테이블
        qioList: [],
        qirList: [],
        prdrList: [], // prdr_tbl: 생산실적 테이블
        mpr_dList: [], // mpr_d_tbl: -- 자재구매요청상세 테이블: 기존사람들이 이걸로만들어서 나도 이걸로해야됨 월요일수정가능성 있음.
        qualityEmployeeList: [], // 품질팀 사원 목록

        // 사용자가 선택한 항목
        selectedQIO: null,
        selectedPrdr: null,
        selectedMpr_d: null,

        // 로딩 및 에러 상태
        loading: false,
        error: null
    }),

    // 2. getters: state를 기반으로 계산된 값을 반환합니다. (예: computed)
    getters: {
        hasQCRData: (state) => state.qcrList.length > 0,
        hasQIOData: (state) => state.qioList.length > 0,
        hasPrdrData: (state) => state.prdrList.length > 0,
        hasEmployeeManager: (state) => state.qualityEmployeeList.length > 0,
        getEmployeeManagers: (state) => state.qualityEmployeeList.filter((item) => item.emp_job_id === 'm1')
    },
    // 3. actions: 상태를 변경하는 동기/비동기 메서드를 정의합니다.
    actions: {
        //--- 데이터 선택 관련 액션 ---
        setSelectedQIO(data) {
            this.selectedQIO = data;
        },
        setSelectedQIR(data) {
            this.selectedQIR = data;
        },
        setSelectedQCR(data) {
            this.selectedQCR = data;
        },

        //--- API 연동 비동기 액션 ---
        async fetchQCRList() {
            this.loading = true;
            this.error = null;
            try {
                // 실제 API 엔드포인트로 수정해야 합니다.
                const response = await axios.get('/api/quality/qcrs');
                console.log(response.data.data);
                this.qcrList = response.data.data; // 받아온 데이터로 state 업데이트
            } catch (error) {
                this.error = '데이터를 불러오는 데 실패했습니다.';
                console.error('Error fetching QCR list:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchQIOList() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('/api/quality/qios');
                console.log(response.data.data);
                this.qioList = response.data.data; // 받아온 데이터로 state 업데이트
            } catch (error) {
                this.error = '데이터를 불러오는 데 실패했습니다.';
                console.error('Error fetching QCR list:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchPrdrList() {
            this.loading = true;
            this.error = null;
            try {
                // 실제 API 엔드포인트로 수정해야 합니다.
                const response = await axios.get('/api/quality/prdrs');
                console.log(response.data.data);
                this.prdrList = response.data.data; // 받아온 데이터로 state 업데이트
            } catch (error) {
                this.error = '데이터를 불러오는 데 실패했습니다.';
                console.error('Error fetching Prdr list:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchMpr_dList() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('/api/quality/mpr_ds');
                console.log(response.data.data);
                this.mpr_dList = response.data.data; // 여기는 정상입니다.
            } catch (error) {
                this.error = '데이터를 불러오는 데 실패했습니다.';
                console.error('Error fetching Mpr_d list:', error);
            } finally {
                this.loading = false;
            }
        },
        async fetchQualityEmployeeList() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('/api/quality/es');
                console.log(response.data.data);
                this.qualityEmployeeList = response.data.data; // 여기는 정상입니다.
            } catch (error) {
                this.error = '데이터를 불러오는 데 실패했습니다.';
                console.error('Error fetching QualityEmployee list:', error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 신규 품질검사기준(QCR)을 서버에 생성합니다. (POST)
         * @param {object} newQcrData - 생성할 QCR 데이터 객체
         */
        async createQCR(newQcrData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.post('/api/quality/qcrs', newQcrData);
                // 성공 시, qcrList에 새로 생성된 항목을 추가하여 UI를 즉시 업데이트합니다.
                this.qcrList.push(response.data.data);
            } catch (error) {
                this.error = '데이터 생성에 실패했습니다.';
                console.error('Error creating QCR:', error);
                throw error; // 컴포넌트에서 에러를 추가로 처리할 수 있도록 throw
            } finally {
                this.loading = false;
            }
        },

        /**
         * 기존 품질검사기준(QCR)을 수정합니다. (PUT)
         * @param {object} qcrToUpdate - 수정할 QCR 데이터 객체 (qcr_code 포함)
         */
        async updateQCR(qcrToUpdate) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.put(`/api/quality/qcrs/${qcrToUpdate.qcr_code}`, qcrToUpdate);
                // 성공 시, qcrList에서 해당 항목을 찾아 업데이트합니다.
                const index = this.qcrList.findIndex((q) => q.qcr_code === qcrToUpdate.qcr_code);
                if (index !== -1) {
                    this.qcrList[index] = response.data.data;
                }
            } catch (error) {
                this.error = '데이터 수정에 실패했습니다.';
                console.error('Error updating QCR:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 신규 또는 기존 품질검사기준(QCR)을 저장합니다. (Create/Update)
         * ID 존재 여부에 따라 생성 또는 수정을 분기합니다.
         * @param {object} qcrData - 저장할 QCR 데이터 객체
         */
        async saveQCR(qcrData) {
            // qcrData에 qcr_code가 있으면 update, 없으면 create 호출
            return qcrData.qcr_code ? this.updateQCR(qcrData) : this.createQCR(qcrData);
        },

        //--- 상태 초기화 액션 ---
        resetState() {
            this.qioList = [];
            this.qirList = [];
            this.qcrList = [];
            this.selectedQIO = null;
            this.selectedQIR = null;
            this.selectedQCR = null;
            this.loading = false;
            this.error = null;
        },

        /**
         * 품질검사기준(QCR)을 삭제합니다. (DELETE)
         * @param {string} qcrCode - 삭제할 QCR의 코드
         */
        async deleteQCR(qcrCode) {
            this.loading = true;
            this.error = null;
            try {
                // 실제 API 엔드포인트로 수정해야 합니다.
                await axios.delete(`/api/quality/qcrs/${qcrCode}`);
                // 성공 시, qcrList에서 해당 항목을 제거하여 UI를 즉시 업데이트합니다.
                const index = this.qcrList.findIndex((q) => q.qcr_code === qcrCode);
                if (index !== -1) {
                    this.qcrList.splice(index, 1);
                }
            } catch (error) {
                this.error = '데이터 삭제에 실패했습니다.';
                console.error('Error deleting QCR:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
