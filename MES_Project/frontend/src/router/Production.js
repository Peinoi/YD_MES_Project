const productionRouter = [
    {
        path: '/work',
        name: 'work',
        component: () => import('@/views/Production/Productionwork.vue')
    },
    {
        path: '/production',
        children: [
            {
                path: 'productionplan',
                name: 'productionPlan',
                component: () => import('@/views/Production/productionPlan.vue')
            },
            {
                path: 'productionplandetail',
                name: 'productionPlanDetail',
                component: () => import('@/views/Production/productionPlanDetail.vue')
            }
        ]
    }
];

export default productionRouter;
