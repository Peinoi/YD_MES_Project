import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true,
        include: ['humps']
    },
    plugins: [
        vue(),
        tailwindcss(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    // 프록시 설정
    server: {
        proxy: {
            // 예: '/api'로 시작하는 모든 요청을 URL로 전달
            '^/api': {
                target: 'http://localhost:3000', // 실제 백엔드 API 서버 주소
                changeOrigin: true, // cross-origin 요청을 위해 호스트 헤더 변경
                rewrite: (path) => path.replace(/^\/api/, '') // 요청 경로에서 '/api' 제거
            }
        }
    }
});
