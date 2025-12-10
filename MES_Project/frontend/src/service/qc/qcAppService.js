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
    async function loadQioNullList() {
        const result = await qcService.getQioNullList();
        store.modal.resultRows = result.data;
        store.modal.selectedRow = null;
        store.modal.showModal = true;
        store.basic.value = '';
        store.isReset = false;
        return { ok: true };
    }

    async function selectedQioCode() {
        store.selectedQio = store.modal.selectedRow;
        store.instruction = { ...store.selectedQio };
        store.instruction.qirEmpCode = 'EMP-10011';
        store.instruction.startDate = dateTime();

        const result = await qcService.getQirList(store.selectedQio.qioCode);
        store.resultItems = result.data;

        store.closeModal();
    }

    async function saveResult() {
        const items = store.resultItems;

        if (items.length === 0) {
            return { ok: false, message: '항목이 없습니다.' };
        }

        const hasEmpty = items.some((i) => !i.value || !i.result);
        if (hasEmpty) {
            return { ok: false, message: '모든 검사값을 입력해주세요.' };
        }

        const payload = items.map((i) => ({
            qir_code: i.qirCode,
            qio_code: i.qioCode,
            start_date: store.instruction.startDate,
            end_date: dateTime(),
            result: i.result === '합격' ? 'g2' : 'g1',
            note: i.note == null ? '' : '',
            qir_emp_code: store.instruction.qirEmpCode,
            type: i.type,
            prod_code: i.prdrCode,
            insp_vol: i.inspVol
        }));
        const result = await qcService.saveResult(payload);

        if (!result.data.ok) {
            return { ok: false, message: '저장 중 오류가 발생하였습니다.' };
        }

        store.reset();
        return { ok: true, message: '정상적으로 저장되었습니다.' };
    }

    async function deleteResult() {
        if (store.basic.qirCode == null) {
            return { ok: false, message: '검사결과를 확인해주세요.' };
        }
        const result = await qcService.deleteResult({ qirCode: store.basic.qirCode });
        if (result.data.affectedRows == 0) {
            throw new Error('품질검사결과 삭제 중 오류 발생');
        }
        store.reset();
        return { ok: true, message: '정상적으로 삭제되었습니다.' };
    }

    function textClean(row) {
        // 숫자와 .만 남김
        row.value = row.value.replace(/[^0-9.]/g, '');

        // 소수점이 2개 이상이면 첫 번째만 남겨두기
        const parts = row.value.split('.');
        if (parts.length > 2) {
            row.value = parts[0] + '.' + parts.slice(1).join('');
        }
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
        loadQioNullList,
        selectedQioCode,
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
        textClean,
        enterJudge,
        resultBody,
        reset: store.reset,
        closeModal: store.closeModal
    };
}
