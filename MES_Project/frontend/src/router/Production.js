const productionRouter = [
    {
        path: '/production',
        children: [
            {
                path: 'productionplan',
                name: 'productionPlan',
                component: () => import('@/views/production/productionPlan.vue')
            },
            {
                path: 'productionplandetail',
                name: 'productionPlanDetail',
                component: () => import('@/views/production/productionPlanDetail.vue')
            }
        ]
    }
];

export default productionRouter;
