export default [
    {
        path: '/baseinfo/process',
        name: 'processFlow',
        component: () => import('@/views/baseinfo/ProcessFlow.vue')
    },
    {
        path: '/baseinfo/bom',
        name: 'bom',
        component: () => import('@/views/baseinfo/bom.vue')
    }
];
