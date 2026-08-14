import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { QuilterPiece, ApiPiecesResponse } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Cache em memória para evitar requisições excessivas ao Apps Script
interface CacheEntry {
  data: ApiPiecesResponse;
  timestamp: number;
}

let cachedData: CacheEntry | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos

/**
 * Sanitiza e valida a lista de peças antes de responder ao cliente
 */
function sanitizePieces(rawPieces: any[]): QuilterPiece[] {
  if (!Array.isArray(rawPieces)) return [];

  return rawPieces.map((p, index) => {
    const courses = Array.isArray(p.courses) ? p.courses.filter(Boolean) : [];
    const payments = Array.isArray(p.payments) ? p.payments.filter(Boolean) : [];
    const shipping = Array.isArray(p.shipping) ? p.shipping.filter(Boolean) : [];

    let status = p.status || 'Disponível';
    if (status !== 'Disponível' && status !== 'Reservada' && status !== 'Vendida') {
      status = 'Disponível';
    }

    return {
      id: String(p.id || `QES-${String(index + 1).padStart(4, '0')}`).trim(),
      author: String(p.author || '').trim(),
      title: String(p.title || '').trim(),
      description: String(p.description || '').trim(),
      size: String(p.size || '').trim(),
      price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
      city: String(p.city || '').trim(),
      state: String(p.state || '').trim(),
      cep: p.cep ? String(p.cep).trim() : undefined,
      master: Boolean(p.master),
      courses,
      payments,
      shipping,
      status,
      images: {
        front: String(p.images?.front || p.image || '').trim(),
        back: p.images?.back ? String(p.images.back).trim() : undefined,
        detail: p.images?.detail ? String(p.images.detail).trim() : undefined,
      },
      whatsapp: String(p.whatsapp || '').trim(),
      publishedAt: p.publishedAt ? String(p.publishedAt).trim() : undefined,
    };
  });
}

// =========================================================================
// API ENDPOINTS
// =========================================================================

/**
 * GET /api/pieces
 * Retorna as peças aprovadas da vitrine a partir do Google Apps Script.
 * Se APPS_SCRIPT_WEB_APP_URL não estiver configurada, retorna erro de configuração.
 */
app.get('/api/pieces', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL?.trim();

  // Se a URL do Apps Script não estiver configurada, retorna erro de configuração
  if (!appsScriptUrl) {
    return res.status(500).json({
      success: false,
      pieces: [],
      error: 'A variável de ambiente APPS_SCRIPT_WEB_APP_URL não está configurada no servidor.',
    });
  }

  // Verifica cache se válido e não for refresh forçado
  if (!forceRefresh && cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL_MS)) {
    return res.json(cachedData.data);
  }

  // Consulta o Web App do Google Apps Script
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const response = await fetch(appsScriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro na resposta do Google Apps Script: ${response.status} ${response.statusText}`);
    }

    const jsonResult = await response.json();

    if (jsonResult.success === false && jsonResult.error) {
      throw new Error(jsonResult.error);
    }

    const sanitizedPieces = sanitizePieces(jsonResult.pieces || []);

    const finalResponse: ApiPiecesResponse = {
      success: true,
      pieces: sanitizedPieces,
      total: sanitizedPieces.length,
    };

    // Atualiza cache em memória
    cachedData = {
      data: finalResponse,
      timestamp: Date.now(),
    };

    return res.json(finalResponse);
  } catch (err: any) {
    console.error('Falha ao consultar Google Apps Script:', err.message);

    // Se temos cache anterior, entrega o cache com aviso
    if (cachedData) {
      return res.json({
        ...cachedData.data,
        warning: 'Dados servidos a partir do cache temporário devido à lentidão externa.',
      });
    }

    return res.status(502).json({
      success: false,
      pieces: [],
      error: err.message || 'Não foi possível conectar ao Google Apps Script no momento.',
    });
  }
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
