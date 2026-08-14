import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import piecesHandler from './api/pieces.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// =========================================================================
// API ENDPOINTS (Delega para a função oficial da Vercel)
// =========================================================================

/**
 * GET /api/pieces
 * Encaminha para o mesmo handler da Vercel Function em /api/pieces.ts
 */
app.all('/api/pieces', (req, res) => {
  return piecesHandler(req, res);
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasAppsScriptUrl: Boolean(process.env.APPS_SCRIPT_WEB_APP_URL),
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// VITE / STATIC SERVING
// =========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vitrine Quilter Empreendedora 2026 rodando em http://localhost:${PORT}`);
  });
}

startServer();
