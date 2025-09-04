import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: true,
    }),
    tanstackRouter({
      autoCodeSplitting: true,
    }),
    viteReact(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://ezytek1706-003-site1.rtempurl.com/', // Backend API URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
