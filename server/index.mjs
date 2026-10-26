import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

// Lê .env local opcional. Em hospedagem, configure os segredos como variáveis de ambiente.
try {
  const localEnv = readFileSync(new URL('./.env', import.meta.url), 'utf8');
  for (const line of localEnv.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1].startsWith('#') || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {
  // Normal quando as variáveis são injetadas pelo provedor.
}

const ADMIN_TOKEN_1 = process.env.ADMIN_TOKEN_1 ?? '';
const ADMIN_TOKEN_2 = process.env.ADMIN_TOKEN_2 ?? '';
const JWT_SECRET = process.env.JWT_SECRET ?? '';
const PORT = Number(process.env.PORT ?? 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*').split(',').map((origin) => origin.trim()).filter(Boolean);
const SESSION_SECONDS = 24 * 60 * 60;
const MAX_BODY_BYTES = 8 * 1024;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 10;
const failures = new Map();

if (
  ADMIN_TOKEN_1.length < 32 ||
  ADMIN_TOKEN_2.length < 32 ||
  ADMIN_TOKEN_1 === ADMIN_TOKEN_2 ||
  JWT_SECRET.length < 32
) {
  console.error('Configure ADMIN_TOKEN_1, ADMIN_TOKEN_2 e JWT_SECRET (ao menos 32 caracteres cada; tokens diferentes).');
  process.exit(1);
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  const allowAll = allowedOrigins.includes('*');
  if (origin && !allowAll && !allowedOrigins.includes(origin)) {
    json(res, 403, { error: 'Origem não permitida.' });
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', allowAll ? '*' : (origin ?? allowedOrigins[0] ?? '*'));
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  return true;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let raw = '';
    let tooLarge = false;
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      if (tooLarge) return reject(new Error('BODY_TOO_LARGE'));
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function safeTokenEqual(candidate, expected) {
  const candidateBytes = Buffer.from(candidate, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  if (candidateBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(candidateBytes, expectedBytes);
}

function isRateLimited(ip) {
  const item = failures.get(ip);
  if (!item) return false;
  if (Date.now() - item.startedAt >= RATE_WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return item.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailure(ip) {
  const now = Date.now();
  const current = failures.get(ip);
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    failures.set(ip, { startedAt: now, count: 1 });
  } else {
    current.count += 1;
  }
}

function createSessionToken(username) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_SECONDS;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    role: 'admin',
    iss: 'seguranca-escolar',
    iat: issuedAt,
    exp: expiresAt,
  })).toString('base64url');
  const unsigned = header + '.' + payload;
  const signature = createHmac('sha256', JWT_SECRET).update(unsigned).digest('base64url');
  return { token: unsigned + '.' + signature, expiresAt: expiresAt * 1000 };
}

function verifySessionToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (header.alg !== 'HS256' || header.typ !== 'JWT' || payload.iss !== 'seguranca-escolar' || payload.role !== 'admin') return null;
  if (typeof payload.sub !== 'string' || typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
  if (payload.exp <= Math.floor(Date.now() / 1000) || payload.iat > Math.floor(Date.now() / 1000) + 60) return null;

  const unsigned = parts[0] + '.' + parts[1];
  const expected = createHmac('sha256', JWT_SECRET).update(unsigned).digest();
  const supplied = Buffer.from(parts[2], 'base64url');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  return { username: payload.sub, issuedAt: payload.iat * 1000, expiresAt: payload.exp * 1000 };
}

const server = createServer(async (req, res) => {
  if (!applyCors(req, res)) return;
  const pathname = (req.url ?? '/').split('?')[0];

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && pathname === '/health') {
    json(res, 200, { status: 'ok', service: 'seguranca-escolar-auth' });
    return;
  }

  if (req.method !== 'POST' || !['/auth/login', '/auth/verify'].includes(pathname)) {
    json(res, 404, { error: 'Rota não encontrada.' });
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch (error) {
    json(res, 400, { error: error instanceof Error && error.message === 'BODY_TOO_LARGE' ? 'Requisição muito grande.' : 'JSON inválido.' });
    return;
  }

  if (pathname === '/auth/verify') {
    const claims = verifySessionToken(body.token);
    if (!claims) {
      json(res, 401, { valid: false, error: 'Sessão inválida ou expirada.' });
      return;
    }
    json(res, 200, { valid: true, username: claims.username, role: 'admin', issuedAt: claims.issuedAt, expiresAt: claims.expiresAt });
    return;
  }

  const ip = req.socket.remoteAddress ?? 'unknown';
  if (isRateLimited(ip)) {
    json(res, 429, { error: 'Muitas tentativas. Tente novamente em 15 minutos.' });
    return;
  }

  const candidate = typeof body.token === 'string' ? body.token.trim() : '';
  const firstMatches = candidate.length > 0 && safeTokenEqual(candidate, ADMIN_TOKEN_1);
  const secondMatches = candidate.length > 0 && safeTokenEqual(candidate, ADMIN_TOKEN_2);

  if (!firstMatches && !secondMatches) {
    recordFailure(ip);
    json(res, 401, { error: 'Token inválido.' });
    return;
  }

  failures.delete(ip);
  const username = firstMatches ? 'administrador-1' : 'administrador-2';
  json(res, 200, { ...createSessionToken(username), username, role: 'admin' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor de autenticação Segurança Escolar ativo na porta ' + PORT + '.');
});
