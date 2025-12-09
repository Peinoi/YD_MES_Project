import api from '../../api/qc/qcApi';

export const qcService = {
    // 004
    getSearchList: () => api.get(`/qc/list`),
    getQcList: (criteria) => api.post(`/qc/list`, criteria),

    // 005
    getQioNullList: () => api.get(`/qc/pending-list`),
    getQirList: (qioCode) => api.get(`/qc/QirList/${qioCode}`),
    saveResult: (data) => api.put(`/qc/`, data),
    deleteResult: (qirCode) => api.post(`/qc/delete`, qirCode)
};
