export default [
    {
        path: '/quality/instructions-list',
        name: 'qims',
        component: () => import('@/views/pages/quality/QualityInstructionsOrderList.vue')
    },
    {
        path: '/quality/instructions-management',
        name: 'qim',
        component: () => import('@/views/pages/quality/QualityInstructionsManagement.vue')
    },
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/views/uikit/FileDoc.vue')
    }
];
