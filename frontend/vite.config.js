import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills(),
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],

  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // FIX global is not defined
      },
      plugins: [
        
      ],
    },
  },
})
