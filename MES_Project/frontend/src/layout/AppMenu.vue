<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: '페이지',
        items: [
            {
                label: '기준정보',
                icon: 'pi pi-fw pi-cog',
                to: '/',
                items: [
                    { label: '제품 및 BOM 등록', to: '/baseinfo/bom' },
                    { label: '라인 정보', to: '' },
                    { label: '공정 흐름도 등록', to: '/process' }
                ]
            },
            {
                label: '주문',
                icon: 'pi pi-fw pi-shopping-cart',
                to: '',
                items: [
                    {
                        label: '주문조회',
                        to: '/order/list'
                    },
                    {
                        label: '주문관리',
                        to: '/order/management'
                    },
                    {
                        label: '출고관리',
                        to: '/ForwardingManagement'
                    },
                    {
                        label: '출고조회',
                        to: '/ForwardingCheck'
                    }
                ]
            },
            {
                label: '생산',
                icon: 'pi pi-fw pi-wrench',
                to: '',
                items: [
                    {
                        label: '주문',
                        to: '/uikit/table'
                    },
                    {
                        label: '작업 진행',
                        to: '/Production/work'
                    },
                    {
                        label: '작업지시서목록',
                        to: '/production/productionPlan'
                    }
                ]
            },
            {
                label: '품질',
                icon: 'pi pi-fw pi-check-circle',
                to: '',
                items: [
                    {
                        label: '주문',
                        to: '/uikit/formlayout'
                    },
                    {
                        label: '품질 기준정보',
                        to: '/quality/criteria'
                    },
                    {
                        label: '품질검사 지시관리',
                        to: '/quality/instructions-management'
                    }
                ]
            },
            {
                label: '자재',
                icon: 'pi pi-fw pi-box',
                to: '',
                items: [
                    {
                        label: '자재 재고',
                        to: ''
                    },
                    {
                        label: '발주서 관리',
                        to: '/po'
                    },
                    {
                        label: '발주서 목록',
                        to: '/poList'
                    },
                    {
                        label: '입고등록',
                        to: { name: 'InboundRegistration' }
                    },
                    {
                        label: '입출고내역',
                        to: 'InOutHistory'
                    },
                    {
                        label: '재고목록',
                        to: 'StockList'
                    }
                ]
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
