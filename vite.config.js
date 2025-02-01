import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 3000, // Optional: set default port to 3000 like CRA
    open: true, // Optional: automatically open browser
  },
  // Optional: Add any other configurations you need
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
