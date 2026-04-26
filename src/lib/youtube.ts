/** YouTube 영상 메타데이터 */
export interface YoutubeMetadata {
  title: string
  channel: string
  thumbnail: string
}

/** YouTube URL에서 video ID 추출 */
export function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    // youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1) || null
    }
    // youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v')
    }
  } catch {
    // 잘못된 URL
  }
  return null
}

/** 유효한 YouTube URL인지 검사 */
export function isValidYoutubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}

/**
 * YouTube oEmbed API로 영상 메타데이터 수집
 * API 키 불필요, CORS 허용
 */
export async function fetchMetadata(videoId: string): Promise<YoutubeMetadata> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`

  const res = await fetch(oEmbedUrl)
  if (!res.ok) throw new Error(`oEmbed 요청 실패: ${res.status}`)

  const data = (await res.json()) as {
    title: string
    author_name: string
    thumbnail_url: string
  }

  return {
    title: data.title,
    channel: data.author_name,
    thumbnail: data.thumbnail_url,
  }
}

/**
 * 영상 자막 텍스트 수집 (클라이언트 사이드 stub)
 * yt-dlp는 서버 사이드 전용이므로 빈 문자열 반환 — 영상 설명으로 fallback 처리
 */
export async function fetchSubtitles(_videoId: string): Promise<string> {
  return ''
}
