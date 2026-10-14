import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-html-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0]
          if (url === '/admin' || url === '/admin/') {
            res.statusCode = 302
            res.setHeader('Location', '/admin/index.html')
            res.end()
            return
          }
          next()
        })
      },
    },
  ],
  base: '/',
  build: {
    outDir: 'dist',
  },
})
