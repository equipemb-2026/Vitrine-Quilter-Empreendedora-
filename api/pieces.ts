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
 * Consulta exclusivamente o endpoint /exec do Google Apps Script
 * e repassa o resultado real para a vitrine na Vercel.
 */
export default async function handler(req: VercelReq | any, res: VercelRes | any) {
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

  const appsScriptUrl = process.env.APPS_SCRIPT_WEB_APP_URL?.trim();

  // Se APPS_SCRIPT_WEB_APP_URL não estiver configurada, retorna HTTP 500
  if (!appsScriptUrl) {
    return res.status(500).json({
      success: false,
      error: 'APPS_SCRIPT_WEB_APP_URL não configurada',
    });
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status >= 400 && response.status < 600 ? response.status : 502).json({
        success: false,
        error: `Erro ao consultar Google Apps Script: HTTP ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();

    if (data && data.success === false && data.error) {
      return res.status(502).json({
        success: false,
        error: typeof data.error === 'string' ? data.error : JSON.stringify(data.error),
      });
    }

    // Retorna ao frontend exatamente o contrato do Apps Script
    return res.status(200).json(data);
  } catch (error: any) {
    const errorMessage = error?.message || 'Falha ao conectar com o Google Apps Script';
    return res.status(502).json({
      success: false,
      error: errorMessage,
    });
  }
}
