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
                    { label: '제품 및 BOM 등록', to: '/uikit/formlayout' },
                    { label: '라인 정보', to: '' },
                    { label: '공정 흐름도 등록', to: '' }
                ]
            },
            {
                label: '주문',
                icon: 'pi pi-fw pi-shopping-cart',
                to: '',
                items: [
                    {
                        label: '주문',
                        to: ''
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
                        to: ''
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
                        to: ''
                    }
                ]
            },
            {
                label: '자재',
                icon: 'pi pi-fw pi-box',
                to: '',
                items: [
                    {
                        label: '주문',
                        to: ''
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
