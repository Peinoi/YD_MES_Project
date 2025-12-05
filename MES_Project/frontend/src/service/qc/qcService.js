import api from '../../api/qc/qcApi';

export const getPendingList = () => api.get(`/qc/pending-list`);
export const getInstruction = (qirCode) => {
    return api.get(`/qc/Instruction/${qirCode}`);
};

export const saveQcResult = (data) => api.post(`/qc/save`, data);
