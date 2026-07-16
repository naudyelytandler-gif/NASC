import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento, o navegador nao consegue chamar a API do PNCP diretamente
// por causa da politica de CORS. Por isso usamos um proxy: toda chamada para
// "/api/pncp/..." e encaminhada pelo servidor do Vite para o PNCP.
//
// Em producao, esse mesmo papel deve ser feito por um backend proprio
// (ex.: uma Edge Function do Supabase) — nunca expondo nada sensivel, ja que a
// API do PNCP e publica e nao exige credenciais.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/pncp': {
        target: 'https://pncp.gov.br/api/consulta',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pncp/, ''),
      },
    },
  },
})
