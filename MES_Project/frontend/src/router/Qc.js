export default [
    {
        path: '/qc/list',
        name: 'qcResultList',
        component: () => import('@/views/qc/QcResultList.vue')
    },
    {
        path: '/qc/manage',
        name: 'QcResultManage',
        component: () => import('@/views/qc/QcResultManage.vue')
    }
];
