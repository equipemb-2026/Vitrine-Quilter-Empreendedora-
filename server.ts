import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { MOCK_PIECES } from './src/data/mockPieces.ts';
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
 * Retorna as peças aprovadas da vitrine.
 * Se APPS_SCRIPT_WEB_APP_URL estiver configurada, busca do Apps Script com cache.
 * Caso contrário, utiliza os dados mockados de demonstração.
 */
app.get('/api/pieces', async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL?.trim();

  // Verifica cache se válido e não for refresh forçado
  if (!forceRefresh && cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL_MS)) {
    return res.json(cachedData.data);
  }

  // Se a URL do Apps Script não estiver configurada, retorna dados de demonstração
  if (!appsScriptUrl) {
    const mockResponse: ApiPiecesResponse = {
      success: true,
      pieces: sanitizePieces(MOCK_PIECES),
      isMock: true,
      total: MOCK_PIECES.length,
    };
    return res.json(mockResponse);
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
    const sanitizedPieces = sanitizePieces(jsonResult.pieces || []);

    const finalResponse: ApiPiecesResponse = {
      success: true,
      pieces: sanitizedPieces,
      isMock: false,
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

    // Se temos cache antigo, entrega o cache com aviso
    if (cachedData) {
      return res.json({
        ...cachedData.data,
        warning: 'Dados servidos a partir do cache temporário devido à lentidão externa.',
      });
    }

    // Fallback gracioso para dados de demonstração em caso de indisponibilidade
    return res.json({
      success: true,
      pieces: sanitizePieces(MOCK_PIECES),
      isMock: true,
      total: MOCK_PIECES.length,
      warning: 'Não foi possível conectar ao Google Apps Script no momento. Exibindo dados de demonstração.',
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
