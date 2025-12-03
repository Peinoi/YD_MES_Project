import AppLayout from '@/layout/AppLayout.vue';

const productionRouter = [
    {
        path: '/production',
        component: AppLayout,
        children: [
            {
                path: 'productionplan',
                name: 'productionPlan',
                component: () => import('@/views/production/productionPlan.vue')
            }
        ]
    }
];

export default productionRouter;
