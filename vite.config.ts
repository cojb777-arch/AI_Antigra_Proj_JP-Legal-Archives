import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api/egov': {
        target: 'https://laws.e-gov.go.jp/api/2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/egov/, ''),
        headers: {
          'Accept': 'application/json, text/xml, application/xml, */*'
        }
      }
    }
  }
});
