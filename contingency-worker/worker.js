const REQUIRED_FIELDS = ['nombre', 'email', 'tipoSolicitud', 'mensaje'];
const DEFAULT_TIMEOUT_MS = 8000;

const json = (body, status = 200, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    ...extraHeaders,
  },
});

const getCorsHeaders = (origin, allowedOrigin) => {
  const safeOrigin = allowedOrigin || '*';
  const responseOrigin = safeOrigin === '*' ? '*' : origin;

  return {
    'access-control-allow-origin': responseOrigin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-support-token',
    'access-control-max-age': '86400',
  };
};

const validatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return 'Payload invalido';
  }

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field] || String(payload[field]).trim() === '') {
      return `Campo requerido faltante: ${field}`;
    }
  }

  const email = String(payload.email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email invalido';
  }

  return null;
};

const postWithTimeout = async (url, payload, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const forwardToChannels = async (payload, env) => {
  const timeoutMs = Number(env.WEBHOOK_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const channels = [
    env.PRIMARY_ALERT_WEBHOOK_URL,
    env.SECONDARY_ALERT_WEBHOOK_URL,
  ].filter(Boolean);

  if (!channels.length) {
    throw new Error('No hay webhooks de salida configurados');
  }

  const attempts = await Promise.all(channels.map(async (url) => {
    try {
      const response = await postWithTimeout(url, payload, timeoutMs);
      return {
        ok: response.ok,
        status: response.status,
      };
    } catch {
      return {
        ok: false,
        status: 0,
      };
    }
  }));

  const successCount = attempts.filter((item) => item.ok).length;
  return {
    successCount,
    attempts,
  };
};

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '*';
    const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method !== 'POST') {
      return json({ success: false, error: 'Metodo no permitido' }, 405, corsHeaders);
    }

    const url = new URL(request.url);
    if (url.pathname !== '/' && url.pathname !== '/support-request') {
      return json({ success: false, error: 'Ruta no encontrada' }, 404, corsHeaders);
    }

    const configuredToken = env.SUPPORT_TOKEN || '';
    if (configuredToken) {
      const incomingToken = request.headers.get('x-support-token') || '';
      if (incomingToken !== configuredToken) {
        return json({ success: false, error: 'No autorizado' }, 401, corsHeaders);
      }
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ success: false, error: 'JSON invalido' }, 400, corsHeaders);
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return json({ success: false, error: validationError }, 400, corsHeaders);
    }

    const enrichedPayload = {
      ...payload,
      contingencyRequestId: crypto.randomUUID(),
      contingencyReceivedAt: new Date().toISOString(),
      contingencySourceIp: request.headers.get('cf-connecting-ip') || 'unknown',
    };

    const result = await forwardToChannels(enrichedPayload, env);
    if (result.successCount === 0) {
      return json({ success: false, error: 'No se pudo notificar a ningun canal' }, 502, corsHeaders);
    }

    return json({
      success: true,
      message: 'Solicitud recibida por canal de contingencia',
      deliveredChannels: result.successCount,
    }, 200, corsHeaders);
  },
};
