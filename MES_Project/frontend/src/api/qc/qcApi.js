import api from '../api';

export async function findQcList(criteria) {
    try {
        const result = await api.post(`/api/qc/list`, criteria);
        return result.data;
    } catch (err) {
        console.log('에러 발생: ', err);
    }
}
