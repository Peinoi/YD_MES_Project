<script setup>
import { useLayout } from '@/layout/composables/layout';

const { toggleMenu } = useLayout();
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="/demo/images/메인로고.png" alt="일반로고" />

                <h3>Noodle Tech</h3>
                <!-- 추후에 로고 및 이름 변경 -->
            </router-link>
        </div>
    </div>
</template>
<style scoped>
.layout-topbar-logo img {
    height: 56px;
    width: auto;
}
</style>
