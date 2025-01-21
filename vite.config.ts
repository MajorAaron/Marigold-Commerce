import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: 'meetmarigoldmoments.com',
    port: 5173,
    https: {
      key: './certs/localhost+1-key.pem',
      cert: './certs/localhost+1.pem'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy': `
        default-src 'self' https://api-us.signals.ngxint.com https://*.supabase.co;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mmx-us-signals-js.s3.us-east-1.amazonaws.com;
        style-src 'self' 'unsafe-inline';
        connect-src 'self' https://api-us.signals.ngxint.com https://*.supabase.co wss://*.supabase.co;
        frame-src 'self' https://*.supabase.co;
        img-src 'self' data: https://*.unsplash.com https://images.unsplash.com https://*.supabase.co https://cache.agilebits.com https://*.amazonaws.com blob:;
        media-src 'self' https://*.amazonaws.com;
        font-src 'self' data:;
      `.replace(/\s+/g, ' ').trim()
    },
    proxy: {
      '/api-us.signals.ngxint.com': {
        target: 'https://api-us.signals.ngxint.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-us.signals.ngxint.com/, '')
      }
    }
  }
})
