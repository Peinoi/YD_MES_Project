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
        qualityInstructionsOrderList: [],
        prdrList: [], // prdr_tbl: 생산실적 테이블
        mpo_dList: [], // mpo_d_tbl: -- 자재구매요청상세 테이블: 기존사람들이 이걸로만들어서 나도 이걸로해야됨 월요일수정가능성 있음.
        qualityEmployeeList: [], // 품질팀 사원 목록

        // 사용자가 선택한 항목
        selectedQIO: null,

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
        hasQualityInstructionsOrderListData: (state) => state.qualityInstructionsOrderList.length > 0,
        getEmployeeManagers: (state) => state.qualityEmployeeList.filter((item) => item.emp_job_id === 'm1')
    },
    // 3. actions: 상태를 변경하는 동기/비동기 메서드를 정의합니다.
    actions: {
        //--- 데이터 선택 관련 액션 ---
        setSelectedQIO(data) {
            this.selectedQIO = data;
        },

        //--- API 연동 비동기 액션 ---
        async fetchQualityInstructionsOrderList() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('/api/quality/instruction-orders');
                this.qualityInstructionsOrderList = response.data.data;
            } catch (error) {
                this.error = '데이터를 불러오는 데 실패했습니다.';
                console.error('Error fetching QIO list:', error);
            } finally {
                this.loading = false;
            }
        },
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
        async fetchMpo_dList() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('/api/quality/mpo_ds');
                console.log(response.data.data);
                this.mpo_dList = response.data.data; // 여기는 정상입니다.
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
         * 검사지시 상세 정보를 불러와 스토어 상태를 업데이트합니다.
         * @param {object} qioItem - 모달에서 선택된 검사지시 항목
         */
        async loadInspectionDetails(qioItem) {
            this.loading = true;
            this.error = null;
            try {
                const { qio_code, prdr_code, mpo_d_code } = qioItem;

                // 1. 백엔드 API에 GET 요청을 보냅니다.
                const response = await axios.get('/api/quality/qiodetail', {
                    params: { qio_code, prdr_code, mpo_d_code }
                });
                console.log('품질검사 지시 상세정보', response.data.data);
                console.log('받아왔습니다 드디어11111111!', response.data.data[1].length);

                this.selectedQIO = response.data.data;

                // const { qioDetail,mpr_d||prdr, inspectionItems(qir&& qcr list) } = response.data.data;
            } catch (error) {
                this.error = '검사지시 상세 정보를 불러오는 데 실패했습니다.';
                console.error('Error fetching inspection details:', error);
                throw error; // 컴포넌트에서 에러를 인지할 수 있도록 다시 throw
            } finally {
                this.loading = false;
            }
        },
        /**
         * 신규 품질검사 지시(QIO)를 서버에 생성합니다. (POST)
         * @param {object} saveQIO - 생성할 QCR 데이터 객체
         */
        async createQIO(saveQIO) {
            this.loading = true;
            this.error = null;
            console.log(`드가ㅏㅏㅏㅏ자ㅏ`, saveQIO);
            try {
                const response = await axios.post('/api/quality/qio', saveQIO);
                console.log('create QIO response: ', response.data.data);
                // 성공 시, savedQIOCode에 새로 생성된 qio_code값을 추가하여 UI를 즉시 업데이트합니다.
                return response.data.data.qio_code;
            } catch (error) {
                this.error = '데이터 생성에 실패했습니다.';
                console.error('Error creating QIO:', error);
                throw error; // 컴포넌트에서 에러를 추가로 처리할 수 있도록 throw
            } finally {
                this.loading = false;
            }
        },

        /**
         * 기존 품질검사기준(QCR)을 수정합니다. (PUT)
         * @param {object} saveQIO - 수정할 QCR 데이터 객체 (qcr_code 포함)
         */
        async updateQIO(saveQIO) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.put('/api/quality/qio', saveQIO);
                // 성공적으로 수정된 후, 목록을 다시 불러와서 화면에 최신 데이터를 반영합니다.
                await this.fetchQIOList();
                return response;
            } catch (error) {
                this.error = '데이터 수정에 실패했습니다.';
                console.error('Error updating QIO:', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 신규 또는 기존 품질검사기준(QIO)을 저장합니다. (Create/Update)
         * qio_code 존재 여부에 따라 생성 또는 수정을 분기합니다.
         * @param {object} saveQIO - 저장할 QIO 데이터 객체
         */
        async saveQIO(saveQIO) {
            // qcrData에 qcr_code가 있으면 update, 없으면 create 호출
            return saveQIO.qio_code ? this.updateQIO(saveQIO) : this.createQIO(saveQIO);
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
