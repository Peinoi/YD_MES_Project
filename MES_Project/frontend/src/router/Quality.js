export default [
    {
        path: '/quality/criteria',
        name: 'criteria',
        component: () => import('@/views/pages/quality/QualityCriteria.vue')
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
