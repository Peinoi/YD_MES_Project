import axios from 'axios';
import * as humps from 'humps';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000
});

api.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = humps.camelizeKeys(response.data);
        }
        return response;
    },
    (err) => {
        const message = err.response?.data?.message || err.message;
        throw new Error(message || '네트워크 통신 중 오류가 발생했습니다.');
    }
);

api.interceptors.request.use((config) => {
    if (config.data && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = humps.decamelizeKeys(config.data);
    }

    if (config.params && config.method === 'get') {
        config.params = humps.decamelizeKeys(config.params);
    }

    return config;
});

export default api;
