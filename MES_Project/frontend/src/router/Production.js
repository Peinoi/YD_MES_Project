const productionRouter = [
    {
        path: '/production',
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
