// src/api/inbound.js
import api from './api'; // 설정된 axios 인스턴스 import

export default {
    // 1. 입고 등록 (POST)
    // 백엔드: router.post("/register", ...)
    registerInbound(data) {
        return api.post('/inbound/register', data);
    },

    // 2. 자재 목록 조회 (GET)
    // 백엔드: router.get("/materials", ...)
    getMaterialList() {
        return api.get('/inbound/materials');
    },

    // 3. 공급업체 목록 조회 (GET)
    // 백엔드: router.get("/clients", ...)
    getClientList() {
        return api.get('/inbound/clients');
    },

    // 4. 담당자 목록 조회 (GET)
    // 백엔드: router.get("/managers", ...)
    getEmpList() {
        return api.get('/inbound/managers');
    }
};
