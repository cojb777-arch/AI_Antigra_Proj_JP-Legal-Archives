import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages / Cloudflare Pages どちらのサブディレクトリでも確実に動く相対パス設定
  base: './',
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
