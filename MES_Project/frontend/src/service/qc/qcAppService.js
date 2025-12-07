import { qcService } from './qcService';
import { useQcResultStore } from '../../stores/qc/qcResultStore';
import { dateTime } from '../../components/qc/utils/dateFormat';

export function useQcAppService() {
    const store = useQcResultStore();

    function errHandle(func) {
        return async function (...params) {
            try {
                return await func(...params);
            } catch (err) {
                console.error(err);
                return { ok: false, message: err.message || '오류가 발생하였습니다.' };
            }
        };
    }
    // 004
    async function getQcList() {
        const params = [store.searchCriteria.qcrCode, store.searchCriteria.prodCode, store.searchCriteria.prodName, store.searchCriteria.checkMethod, store.searchCriteria.result, store.searchCriteria.startDate];
        const result = await qcService.getQcList(params);
        store.qcList = [...result.data];
        return { ok: true };
    }

    // 005
    async function loadPendingList() {
        if (!store.isReset) {
            return { ok: false, message: '새로운 결과를 불러오기 전 초기화를 진행해주세요.' };
        }
        const result = await qcService.getPendingList();
        store.modal.resultRows = result.data;
        store.modal.selectedRow = null;
        store.modal.showModal = true;
        store.basic.value = '';
        store.isReset = false;
        return { ok: true };
    }

    function selectedQirCode() {
        store.selectedQir = store.modal.selectedRow?.qirCode;
        store.basic.qirCode = store.selectedQir;
        store.basic.qirEmpCode = 'EMP-10011';
        store.basic.startDate = dateTime();
        store.closeModal();
    }

    async function loadInstruction() {
        if (store.basic.qirCode == '') {
            return { ok: false, message: '검사결과 선택해주세요.' };
        }
        const result = await qcService.getInstruction(store.selectedQir);
        if (result.data.length == 0) {
            return { ok: false, message: '등록된 검사지시가 없습니다.' };
        }
        store.basic.qirEmpCode = 'EMP-10011';
        store.basic.value = '';
        store.instruction = result.data[0];
        store.resultItems = result.data;
        return { ok: true };
    }

    async function saveResult() {
        if (store.isReset || store.basic.value == '') {
            return { ok: false, message: '검사결과를 확인해주세요.' };
        }
        store.basic.endDate = dateTime();
        const result = await qcService.saveResult(store.basic);
        if (result.data.affectedRows == 0) {
            throw new Error('품질검사결과 저장 중 오류 발생');
        }
        store.reset();
        return { ok: true, message: '품질검사결과 저장 완료' };
    }

    function textClean(row) {
        row.value = row.value.replace(/\D/g, '');
    }

    function enterJudge(row) {
        const v = Number(row.value);
        if (isNaN(v)) return (row.result = '');
        row.result = v >= row.rangeBot && v <= row.rangeTop ? '합격' : '불합격';
        store.basic.value = row.value;
        store.basic.result = row.result == '합격' ? 'g2' : 'g1';
    }

    const funcList = {
        getQcList,
        loadPendingList,
        loadInstruction,
        saveResult
    };

    const wrapperFuncs = Object.keys(funcList).reduce((acc, key) => {
        const func = funcList[key];
        acc[key] = errHandle(func);
        return acc;
    }, {});

    return {
        ...wrapperFuncs,
        criteriaReset: store.criteriaReset,
        selectedQirCode,
        textClean,
        enterJudge,
        reset: store.reset,
        closeModal: store.closeModal
    };
}
