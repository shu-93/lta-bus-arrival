import type { IncomingMessage, ServerResponse } from 'http';

interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  ltaKeyConfigured: boolean;
  version: string;
}

/**
 * Serverless Health Check Endpoint
 * Route: GET /api/health
 */
export default async function handler(
  req: IncomingMessage & { query?: Record<string, string | string[]> },
  res: ServerResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const isLtaKeyPresent = Boolean(
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY
  );

  const payload: HealthResponse = {
    status: 'ok',
    service: 'SG Bus Arrival Serverless Gateway',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: isLtaKeyPresent,
    version: '1.0.0',
  };

  res.statusCode = 200;
  res.end(JSON.stringify(payload, null, 2));
}

// Web standard export for Edge / modern serverless runtimes
export async function GET() {
  const isLtaKeyPresent = Boolean(
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY
  );

  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'SG Bus Arrival Serverless Gateway',
      timestamp: new Date().toISOString(),
      ltaKeyConfigured: isLtaKeyPresent,
      version: '1.0.0',
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
