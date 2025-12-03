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
    {
        path: '/materials/inbound-registration',
        name: 'InboundRegistration',
        component: () => import('@/views/material/InboundRegistration.vue')
    },
    {
        path: '/materials/inout-history',
        name: 'InOutHistory',
        component: () => import('@/views/material/InOutHistory.vue')
    },
    {
        path: '/materials/stock-list',
        name: 'StockList',
        component: () => import('@/views/material/StockList.vue')
    }
];
