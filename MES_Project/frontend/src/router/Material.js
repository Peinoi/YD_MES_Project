export default [
    {
        path: '/po',
        name: 'purchaseOrder',
        component: () => import('@/views/po/PurchaseOrder.vue')
    },
    {
        path: '/poList',
        name: 'purchaseOrderList',
        component: () => import('@/views/po/PurchaseOrderList.vue')
    },
    //입고등록
    {
        path: '/inbound-registration',
        name: 'InboundRegistration',
        component: () => import('@/views/material/InboundRegistration.vue')
    },
    //입출고내역
    {
        path: '/inout-history',
        name: 'InOutHistory',
        component: () => import('@/views/material/InOutHistory.vue')
    },
    //재고목록
    {
        path: '/stock-list',
        name: 'StockList',
        component: () => import('@/views/material/StockList.vue')
    }
];
