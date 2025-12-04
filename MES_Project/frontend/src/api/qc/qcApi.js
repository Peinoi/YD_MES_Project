import api from '../api';

export async function apiTest() {
    try {
        const result = await api.get(`/api/qc/list`);
        return result.data;
    } catch (err) {
        console.log('에러 발생: ', err);
    }
}
