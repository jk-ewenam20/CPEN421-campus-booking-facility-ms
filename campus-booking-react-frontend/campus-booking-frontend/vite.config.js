import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Skip the proxy and serve index.html for browser navigation requests (Accept: text/html).
// This prevents page refreshes on /bookings, /facilities, etc. from hitting the backend API.
function spaBypass(req) {
  if (req.headers.accept?.includes('text/html')) return '/index.html';
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth':       { target: 'http://localhost:8080', changeOrigin: true, bypass: spaBypass },
      '/bookings':   { target: 'http://localhost:8080', changeOrigin: true, bypass: spaBypass },
      '/facilities': { target: 'http://localhost:8080', changeOrigin: true, bypass: spaBypass },
      '/users':      { target: 'http://localhost:8080', changeOrigin: true, bypass: spaBypass },
    }
  }
})
