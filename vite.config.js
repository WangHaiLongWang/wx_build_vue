import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://api.weixin.qq.com/',
        changeOrigin: true,  //是否跨域
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
