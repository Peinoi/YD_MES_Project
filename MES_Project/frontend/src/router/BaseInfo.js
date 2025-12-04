import BomVue from '@/views/bom.vue';
export default [
    {
        path: '/madeinfo/process',
        name: 'processFlow',
        component: () => import('@/views/ProcessFlow.vue')
    },
    {
        path: '/example',
        name: 'example',
        component: () => import('@/views/sam.vue')
    },
    {
        path: '/baseinfo/bom',
        name: 'bom',
        component: BomVue
    }
];
///baseinfo/bom
