import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Yahan se changes start ho rahe hain
  build: {
    chunkSizeWarningLimit: 1600, // Warning limit ko 1.6MB tak badha diya hai
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Isse har library ka apna alag chunk banega, bundle size balance karne ke liye
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
})