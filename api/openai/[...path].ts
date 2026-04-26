export const config = { runtime: 'edge' }

/**
 * OpenAI API 프록시 — OPENAI_API_KEY를 서버 측에서 주입
 * /api/openai/* → https://api.openai.com/*
 */
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/openai/, '')
  const targetUrl = `https://api.openai.com${path}${url.search}`

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  const responseBody = await upstream.text()
  return new Response(responseBody, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
