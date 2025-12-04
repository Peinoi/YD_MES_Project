const productionRouter = [
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
            },
            {
                path: 'productionwork',
                name: 'Productionwork',
                component: () => import('@/views/Production/Productionwork.vue')
            },
            {
                path: 'workperformance',
                name: 'WorkPerformance',
                component: () => import('@/views/Production/WorkPerformance.vue')
            },
            {
                path: 'taskprogresslist',
                name: 'TaskProgressList',
                component: () => import('@/views/Production/TaskProgressList.vue')
            }
        ]
    }
];

export default productionRouter;
