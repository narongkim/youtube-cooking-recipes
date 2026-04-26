/**
 * Notion API 프록시 — vercel.json routes가 path 쿼리로 변환해서 전달
 */
export default async function handler(req, res) {
  const notionPath = req.query.path || '/'

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : JSON.stringify(req.body)

  try {
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
    res.status(upstream.status).json(data)
  } catch {
    res.status(502).json({ error: 'Notion proxy error' })
  }
}
