import type { IncomingMessage, ServerResponse } from 'http';

interface VercelReq extends IncomingMessage {
  method?: string;
  query?: Record<string, string | string[]>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (body: any) => void;
  send: (body: any) => void;
}

/**
 * Vercel Serverless Function: GET /api/pieces
 * 
 * Consulta o endpoint /exec do Google Apps Script com cache CDN de alta performance,
 * medição de tempos server-side e repasse seguro dos dados públicos da vitrine.
 */
export default async function handler(req: VercelReq | any, res: VercelRes | any) {
  const startTime = Date.now();

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Use GET.',
    });
  }

  // Configuração de Cache CDN para otimizar velocidade e economizar chamadas ao Apps Script
  // Permite resposta instantânea da CDN e atualização em segundo plano (SWR)
  const isForceRefresh = req.query?.refresh === 'true' || req.headers['cache-control'] === 'no-cache';
  
  if (isForceRefresh) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    res.setHeader('CDN-Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, max-age=30, stale-while-revalidate=300');
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL?.trim();

  // Se APPS_SCRIPT_WEB_APP_URL não estiver configurada, retorna HTTP 500
  if (!appsScriptUrl) {
    const totalDuration = Date.now() - startTime;
    console.error(`[API /api/pieces] Erro: APPS_SCRIPT_WEB_APP_URL ausente | Total: ${totalDuration}ms`);
    return res.status(500).json({
      success: false,
      error: 'APPS_SCRIPT_WEB_APP_URL não configurada',
    });
  }

  try {
    const appsScriptStart = Date.now();
    
    // Timeout defensivo de 25s para a chamada ao Apps Script (acomoda cold starts)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(appsScriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const appsScriptDuration = Date.now() - appsScriptStart;

    if (!response.ok) {
      const totalDuration = Date.now() - startTime;
      console.warn(`[API /api/pieces] Apps Script HTTP ${response.status} em ${appsScriptDuration}ms | Total API: ${totalDuration}ms`);
      
      return res.status(response.status >= 400 && response.status < 600 ? response.status : 502).json({
        success: false,
        error: `Erro ao consultar Google Apps Script: HTTP ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();
    const totalDuration = Date.now() - startTime;
    const piecesCount = Array.isArray(data?.pieces) ? data.pieces.length : 0;

    // Log server-side seguro de telemetria de performance (sem registrar dados pessoais)
    console.log(`[API /api/pieces] Apps Script: ${appsScriptDuration}ms | Total API: ${totalDuration}ms | Status HTTP: ${response.status} | Pieces: ${piecesCount}`);

    if (data && data.success === false && data.error) {
      return res.status(502).json({
        success: false,
        error: typeof data.error === 'string' ? data.error : JSON.stringify(data.error),
      });
    }

    // Retorna ao frontend os dados sanitizados da vitrine
    return res.status(200).json(data);
  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    const isAbort = error?.name === 'AbortError';
    const errorMessage = isAbort 
      ? 'Tempo limite de resposta do Google Apps Script excedido.' 
      : (error?.message || 'Falha ao conectar com o Google Apps Script');

    console.error(`[API /api/pieces] Falha: ${errorMessage} | Total API: ${totalDuration}ms`);

    return res.status(502).json({
      success: false,
      error: errorMessage,
    });
  }
}

