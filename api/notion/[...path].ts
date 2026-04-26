/**
 * Notion API 프록시 — NOTION_TOKEN 서버 측 주입
 * /api/notion/v1/* → https://api.notion.com/v1/*
 */
export default async function handler(req: any, res: any) {
  const segments: string[] = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean)

  const path = '/' + segments.join('/')
  const targetUrl = `https://api.notion.com${path}`

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : JSON.stringify(req.body)

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN ?? ''}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body,
    })

    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch (err) {
    res.status(502).json({ error: 'Notion proxy error' })
  }
}
