export default [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/views/3.vue')
    },
    {
        path: '/ForwardingManagement',
        name: 'ForwardingManagement',
        component: () => import('@/views/release/ForwardingManagement.vue')
    },
    {
        path: '/ForwardingCheck',
        name: 'ForwardingCheck',
        component: () => import('@/views/release/ForwardingCheck.vue')
    },
    {
        path: '/Forwarding/:releaseCode',
        name: 'ForwardingDetail',
        component: () => import('@/views/release/ForwardingDetail.vue')
    },
    {
        path: '/order/list',
        name: 'OrderList',
        component: () => import('@/views/order/OrderList.vue')
    },
    {
        path: '/order/management',
        name: 'OrderManagement',
        component: () => import('@/views/order/OrderManagement.vue')
    }
];
