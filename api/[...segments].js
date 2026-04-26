/**
 * API 프록시 — Notion·OpenAI 요청을 서버에서 중계하여 키 노출 방지
 * /api/notion/*  → https://api.notion.com/*
 * /api/openai/*  → https://api.openai.com/*
 */
export default async function handler(req, res) {
  const raw = req.query.segments
  const segments = Array.isArray(raw) ? raw : [raw].filter(Boolean)
  const fullPath = '/' + segments.join('/')

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : JSON.stringify(req.body)

  try {
    if (fullPath.startsWith('/notion/')) {
      const notionPath = fullPath.slice('/notion'.length)
      const upstream = await fetch(`https://api.notion.com${notionPath}`, {
        method: req.method,
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN ?? ''}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body,
      })
      const data = await upstream.json()
      return res.status(upstream.status).json(data)
    }

    if (fullPath.startsWith('/openai/')) {
      const openaiPath = fullPath.slice('/openai'.length)
      const upstream = await fetch(`https://api.openai.com${openaiPath}`, {
        method: req.method,
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
          'Content-Type': 'application/json',
        },
        body,
      })
      const data = await upstream.json()
      return res.status(upstream.status).json(data)
    }

    res.status(404).json({ error: 'Not found' })
  } catch {
    res.status(502).json({ error: 'Proxy error' })
  }
}
