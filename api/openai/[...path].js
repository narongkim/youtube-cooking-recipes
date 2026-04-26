/**
 * OpenAI API 프록시 — OPENAI_API_KEY 서버 측 주입
 * /api/openai/v1/* → https://api.openai.com/v1/*
 */
export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path].filter(Boolean)

  const path = '/' + segments.join('/')
  const targetUrl = `https://api.openai.com${path}`

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : JSON.stringify(req.body)

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch (err) {
    res.status(502).json({ error: 'OpenAI proxy error' })
  }
}
