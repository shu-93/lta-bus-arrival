import type { IncomingMessage, ServerResponse } from 'http';

const LTA_BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';

/**
 * Serverless Bus Arrival Proxy Endpoint
 * Route: GET /api/busarriavl?BusStopCode=83139
 *
 * Proxies requests to:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=<BusStopCode>
 * Headers:
 *   AccountKey: <LTA_ACCOUNT_KEY>
 *   accept: application/json
 */
export default async function handler(
  req: IncomingMessage & { query?: Record<string, string | string[]> },
  res: ServerResponse
) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse query parameters from URL if not already parsed
  let busStopCode = '';
  let serviceNo = '';

  try {
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    busStopCode = (parsedUrl.searchParams.get('BusStopCode') || req.query?.BusStopCode || '') as string;
    serviceNo = (parsedUrl.searchParams.get('ServiceNo') || req.query?.ServiceNo || '') as string;
  } catch {
    // fallback
    if (req.query) {
      busStopCode = (req.query.BusStopCode as string) || '';
      serviceNo = (req.query.ServiceNo as string) || '';
    }
  }

  if (!busStopCode) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        error: 'Missing required parameter: BusStopCode',
        example: '/api/busarriavl?BusStopCode=83139',
      })
    );
    return;
  }

  // Retrieve AccountKey from environment or optional request header
  const headerKey = (req.headers['accountkey'] || req.headers['AccountKey']) as string | undefined;
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY ||
    headerKey;

  if (!accountKey) {
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        error: 'LTA AccountKey is not configured',
        message:
          'Please set the LTA_ACCOUNT_KEY environment variable in your deployment environment or .env file.',
        status: 401,
      })
    );
    return;
  }

  try {
    const ltaUrl = new URL(LTA_BASE_URL);
    ltaUrl.searchParams.set('BusStopCode', busStopCode.trim());
    if (serviceNo && serviceNo.trim()) {
      ltaUrl.searchParams.set('ServiceNo', serviceNo.trim());
    }

    const ltaResponse = await fetch(ltaUrl.toString(), {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    const data = await ltaResponse.json();

    res.statusCode = ltaResponse.status;
    res.end(JSON.stringify(data));
  } catch (error: unknown) {
    console.error('Error fetching data from LTA DataMall:', error);
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        error: 'Bad Gateway: Failed to reach LTA DataMall',
        details: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
}

// Web standard export for Edge / modern serverless runtimes
export async function GET(request: Request) {
  const url = new URL(request.url);
  const busStopCode = url.searchParams.get('BusStopCode');
  const serviceNo = url.searchParams.get('ServiceNo');

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, AccountKey, accountkey',
  };

  if (!busStopCode) {
    return new Response(
      JSON.stringify({
        error: 'Missing required parameter: BusStopCode',
        example: '/api/busarriavl?BusStopCode=83139',
      }),
      { status: 400, headers: corsHeaders }
    );
  }

  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    process.env.LTA_API_KEY ||
    process.env.ACCOUNT_KEY ||
    request.headers.get('AccountKey') ||
    request.headers.get('accountkey');

  if (!accountKey) {
    return new Response(
      JSON.stringify({
        error: 'LTA AccountKey is not configured',
        message:
          'Please set the LTA_ACCOUNT_KEY environment variable in your deployment environment or .env file.',
        status: 401,
      }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const ltaUrl = new URL(LTA_BASE_URL);
    ltaUrl.searchParams.set('BusStopCode', busStopCode.trim());
    if (serviceNo && serviceNo.trim()) {
      ltaUrl.searchParams.set('ServiceNo', serviceNo.trim());
    }

    const ltaResponse = await fetch(ltaUrl.toString(), {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    const data = await ltaResponse.json();

    return new Response(JSON.stringify(data), {
      status: ltaResponse.status,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: 'Bad Gateway: Failed to reach LTA DataMall',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 502, headers: corsHeaders }
    );
  }
}
