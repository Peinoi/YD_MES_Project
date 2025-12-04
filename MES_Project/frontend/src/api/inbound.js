// src/api/inbound.js
import api from './api';

export default {
    // 입고 등록 API
    registerInbound(data) {
        // 실제 호출 URL: http://localhost:3000/api/inbound/register
        return api.post('/api/inbound/register', data);
    },

    // (예시) 입고 목록 조회 API가 필요하다면 여기에 추가
    getInboundList(params) {
        return api.get('/api/inbound/list', { params });
    },
    // 자재 목록 조회
    getMaterialList() {
        // 실제 백엔드 연동 시: return api.get('/common/materials');
        // 테스트용 Mock Data 반환 (Promise)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        { matCode: 'MAT-1001', matName: '밀가루(중력분)', category: '원자재', unit: 'kg' },
                        { matCode: 'MAT-1002', matName: '팜유', category: '원자재', unit: 'L' },
                        { matCode: 'MAT-2001', matName: '봉지라면 포장지', category: '부자재', unit: 'ea' }
                    ]
                });
            }, 300);
        });
    },

    // 공급업체 목록 조회
    getClientList() {
        // return api.get('/common/clients?type=l2');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        { clientCode: 'CLIENT-005', clientName: '밀가루공급사', type: '공급업체' },
                        { clientCode: 'CLIENT-006', clientName: '팜유공급사', type: '공급업체' }
                    ]
                });
            }, 300);
        });
    },

    // 담당자 목록 조회
    getEmpList() {
        // return api.get('/common/employees');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        { empCode: 'EMP-10003', empName: '박자재', deptName: '자재팀' },
                        { empCode: 'EMP-10009', empName: '송자재원', deptName: '자재팀' }
                    ]
                });
            }, 300);
        });
    }
};
