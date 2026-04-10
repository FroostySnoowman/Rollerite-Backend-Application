/**
 * @typedef {{ DB: D1Database }} Env
 */

const MAX_TITLE = 500

/**
 * @param {Request} request
 * @param {Env} env
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const origin = request.headers.get('Origin')

    if (request.method === 'OPTIONS') {
      return handleOptions(request, env, origin)
    }

    if (!path.startsWith('/api/todos')) {
      return json({ error: 'Not found' }, 404, request, env, origin)
    }

    const corsHeaders = cors(request, env, origin)

    try {
      if (request.method === 'GET' && path === '/api/todos') {
        const { results } = await env.DB.prepare(
          'SELECT id, title, created_at, updated_at FROM todos ORDER BY created_at ASC',
        ).all()
        return new Response(JSON.stringify(results ?? []), {
          status: 200,
          headers: { 'content-type': 'application/json', ...corsHeaders },
        })
      }

      if (request.method === 'POST' && path === '/api/todos') {
        const body = await readJson(request)
        const title = normalizeTitle(body?.title)
        if (!title) {
          return json({ error: 'title is required' }, 400, request, env, origin)
        }
        const id = crypto.randomUUID()
        const now = Date.now()
        await env.DB.prepare(
          'INSERT INTO todos (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
        )
          .bind(id, title, now, now)
          .run()
        const row = await env.DB.prepare(
          'SELECT id, title, created_at, updated_at FROM todos WHERE id = ?',
        )
          .bind(id)
          .first()
        return new Response(JSON.stringify(row), {
          status: 201,
          headers: { 'content-type': 'application/json', ...corsHeaders },
        })
      }

      const idMatch = /^\/api\/todos\/([^/]+)$/.exec(path)
      if (!idMatch) {
        return json({ error: 'Not found' }, 404, request, env, origin)
      }
      const id = decodeURIComponent(idMatch[1])

      if (request.method === 'PATCH') {
        const body = await readJson(request)
        const title = normalizeTitle(body?.title)
        if (!title) {
          return json({ error: 'title is required' }, 400, request, env, origin)
        }
        const now = Date.now()
        const result = await env.DB.prepare(
          'UPDATE todos SET title = ?, updated_at = ? WHERE id = ?',
        )
          .bind(title, now, id)
          .run()
        if (!result.meta.changes) {
          return json({ error: 'Not found' }, 404, request, env, origin)
        }
        const row = await env.DB.prepare(
          'SELECT id, title, created_at, updated_at FROM todos WHERE id = ?',
        )
          .bind(id)
          .first()
        return new Response(JSON.stringify(row), {
          status: 200,
          headers: { 'content-type': 'application/json', ...corsHeaders },
        })
      }

      if (request.method === 'DELETE') {
        const result = await env.DB.prepare('DELETE FROM todos WHERE id = ?')
          .bind(id)
          .run()
        if (!result.meta.changes) {
          return json({ error: 'Not found' }, 404, request, env, origin)
        }
        return new Response(null, {
          status: 204,
          headers: { ...corsHeaders },
        })
      }

      return json({ error: 'Method not allowed' }, 405, request, env, origin)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Server error'
      return json({ error: message }, 500, request, env, origin)
    }
  },
}

/**
 * @param {Request} request
 * @param {Env} env
 * @param {string | null} origin
 */
function handleOptions(request, env, origin) {
  const headers = cors(request, env, origin)
  return new Response(null, { status: 204, headers })
}

/**
 * @param {Request} request
 * @param {Env} env
 * @param {string | null} origin
 */
function cors(request, env, origin) {
  const allowed = parseOrigins(env.FRONTEND_ORIGIN)
  const reqOrigin = origin || ''
  const allow =
    allowed.includes(reqOrigin) ||
    (reqOrigin.startsWith('http://localhost:') &&
      (reqOrigin.includes(':5173') || reqOrigin.includes(':4173')))
  const value = allow ? reqOrigin : allowed[0] || '*'
  const headers = {
    'access-control-allow-origin': value,
    'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': request.headers.get('access-control-request-headers') || 'content-type',
    'access-control-max-age': '86400',
  }
  if (value !== '*') {
    headers['vary'] = 'Origin'
  }
  return headers
}

/**
 * @param {string | undefined} raw
 */
function parseOrigins(raw) {
  if (!raw || typeof raw !== 'string') return ['http://localhost:5173']
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * @param {Request} request
 */
async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

/**
 * @param {unknown} value
 */
function normalizeTitle(value) {
  if (typeof value !== 'string') return ''
  const t = value.trim()
  if (!t) return ''
  return t.length > MAX_TITLE ? t.slice(0, MAX_TITLE) : t
}

/**
 * @param {unknown} data
 * @param {number} status
 * @param {Request} request
 * @param {Env} env
 * @param {string | null} origin
 */
function json(data, status, request, env, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      ...cors(request, env, origin),
    },
  })
}
