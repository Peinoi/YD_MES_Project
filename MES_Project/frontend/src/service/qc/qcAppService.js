import { qcService } from './qcService';
import { useQcResultStore } from '../../stores/qc/qcResultStore';
import { dateTime, kstFormat } from '../../components/qc/utils/dateFormat';

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
    async function getSearchList() {
        const result = await qcService.getSearchList();
        store.modal.resultRows = result.data.map((item) => ({
            qcrCode: item.qcrCode,
            checkMethod: item.checkMethod
        }));
        return { ok: true };
    }

    function selectedQcrCode() {
        store.searchCriteria.qcrCode = store.modal.selectedRow.qcrCode;
        store.searchCriteria.checkMethod = store.modal.selectedRow.checkMethod;
        store.closeModal();
    }

    async function getQcList() {
        const qcrCode = store.searchCriteria.qcrCode == '전체' ? null : store.searchCriteria.qcrCode;
        const checkMethod = store.searchCriteria.checkMethod == '전체' ? null : store.searchCriteria.checkMethod;
        const startDate = kstFormat(store.searchCriteria.startDate);
        const params = [qcrCode, store.searchCriteria.prodCode, store.searchCriteria.prodName, checkMethod, store.searchCriteria.result, startDate];
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

    async function deleteResult() {
        if (store.basic.qirCode == null) {
            return { ok: false, message: '검사결과를 확인해주세요.' };
        }
        const result = await qcService.deleteResult({ qirCode: store.basic.qirCode });
        if (!result.data.ok) {
            throw new Error('품질검사결과 삭제 중 오류 발생');
        }
        // store.reset();
        return { ok: true, message: '품질검사결과 삭제 완료' };
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

    function resultBody(result) {
        if (result == 'g2') {
            return `<span class="text-green-600 font-bold">합격</span>`;
        } else {
            return `<span class="text-red-600 font-bold">불합격</span>`;
        }
    }

    const funcList = {
        getSearchList,
        getQcList,
        loadPendingList,
        loadInstruction,
        saveResult,
        deleteResult
    };

    const wrapperFuncs = Object.keys(funcList).reduce((acc, key) => {
        const func = funcList[key];
        acc[key] = errHandle(func);
        return acc;
    }, {});

    return {
        ...wrapperFuncs,
        criteriaReset: store.criteriaReset,
        selectedQcrCode,
        selectedQirCode,
        textClean,
        enterJudge,
        resultBody,
        reset: store.reset,
        closeModal: store.closeModal
    };
}
