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
            },
            {
                path: 'productionwork',
                name: 'Productionwork',
                component: () => import('@/views/production/Productionwork.vue')
            },
            {
                path: 'workperformance',
                name: 'WorkPerformance',
                component: () => import('@/views/production/WorkPerformance.vue')
            },
            {
                path: 'taskprogresslist',
                name: 'TaskProgressList',
                component: () => import('@/views/production/TaskProgressList.vue')
            },
            {
                path: 'irregularworkprogress',
                name: 'IrregularWorkProgress',
                component: () => import('@/views/production/IrregularWorkProgress.vue')
            }
        ]
    }
    // {
    //     path: '/production',
    //     children: [
    //         {
    //             path: 'productionplan',
    //             name: 'productionPlan',
    //             component: () => import('@/views/Production/productionPlan.vue')
    //         },
    //         {
    //             path: 'productionplandetail',
    //             name: 'productionPlanDetail',
    //             component: () => import('@/views/Production/productionPlanDetail.vue')
    //         }
    //     ]
    // }
];

export default productionRouter;
