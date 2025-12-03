const productionRouter = [
    {
        path: '/',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue')
    },
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
