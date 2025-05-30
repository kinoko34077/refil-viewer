// vite.config.js（worker設定不要に簡素化）
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined // ←これがないとWorkerが分離されない場合あり
      }
    }
  }
})