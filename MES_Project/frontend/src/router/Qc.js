export default [
    {
        path: '/qc/list',
        name: 'qcResultList',
        component: () => import('@/views/pages/qc/QcResultList.vue')
    },
    {
        path: '/qc/manage',
        name: 'QcResultManage',
        component: () => import('@/views/pages/qc/QcResultManage.vue')
    }
];
