import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    //host: '0.0.0.0', //NUEVO
    port: 5173,
    //port: 4000,
    //strictPort: true
    open: true
  }
})