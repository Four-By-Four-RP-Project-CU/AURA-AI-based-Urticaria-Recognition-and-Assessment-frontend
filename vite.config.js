import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
// Only proxy requests that carry a JSON/form body (API calls), never browser
// page navigations. Without this, refreshing /analyze sends a GET to FastAPI
// which has no GET /analyze route and returns 405 Method Not Allowed.
const apiBypass = (req) => {
  const accept = req.headers['accept'] || '';
  // If the browser requests HTML it's a page navigation — let Vite handle it.
  if (accept.includes('text/html')) return req.url;
  return null; // proxy it
};

export default defineConfig({
  server: {
    proxy: {
      '/analyze': { target: 'http://localhost:8000', changeOrigin: true, bypass: apiBypass },
      '/report':  { target: 'http://localhost:8000', changeOrigin: true, bypass: apiBypass },
      '/health':  { target: 'http://localhost:8000', changeOrigin: true, bypass: apiBypass },
      '/extract': { target: 'http://localhost:8000', changeOrigin: true, bypass: apiBypass },
    }
  },
  plugins: [react()],
})
