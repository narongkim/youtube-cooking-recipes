export const config = { runtime: 'edge' }

/**
 * Notion API 프록시 — NOTION_TOKEN을 서버 측에서 주입
 * /api/notion/* → https://api.notion.com/*
 */
export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/notion/, '')
  const targetUrl = `https://api.notion.com${path}${url.search}`

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN ?? ''}`,
      'Notion-Version': '2022-06-28',
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
