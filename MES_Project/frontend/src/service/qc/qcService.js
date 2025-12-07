import api from '../../api/qc/qcApi';

export const qcService = {
    // 004
    getQcList: (criteria) => api.post(`/qc/list`, criteria),

    // 005
    getPendingList: () => api.get(`/qc/pending-list`),
    getInstruction: (qirCode) => api.get(`/qc/Instruction/${qirCode}`),
    saveResult: (data) => api.put(`/qc/save`, data)
};
