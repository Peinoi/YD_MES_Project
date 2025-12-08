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
    },
    // 입출고 이력 조회
    getHistoryList(params) {
        // params: { startDate, endDate, type, keyword, status }
        return api.get('/inbound/history', { params });
    },
    // 재고 목록 조회
    getStockList(params) {
        return api.get('/material/stocks', { params });
    },

    // 재고 상세 조회 (단건)
    getStockDetail(code) {
        return api.get(`/material/stocks/${code}`);
    },

    // 5. 발주 목록 조회 (GET)
    getOrderList() {
        return api.get('/poder'); // PurchaseOrder.vue를 참조하여 엔드포인트 수정
    },

    // 6. 발주 상세 조회 (GET)
    getOrderDetail(purchaseCode) {
        return api.get(`/poder/${purchaseCode}`);
    }
};
