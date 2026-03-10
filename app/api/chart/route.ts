// app/api/chart/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  if (!ticker) return NextResponse.json({ error: 'missing ticker' }, { status: 400 })

  // Automatisch .DE anhängen wenn kein Exchange-Suffix vorhanden
  const yahooTicker = ticker.includes('.') ? ticker : `${ticker}.DE`

  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}` +
      `?interval=1wk&range=6mo`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Yahoo returned ${res.status}` }, { status: 502 })
    }

    const json = await res.json()
    const closes: number[] | undefined =
      json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close

    if (!closes || closes.length < 2) {
      return NextResponse.json({ error: 'no data' }, { status: 404 })
    }

    const prices = closes.filter((v): v is number => v != null)

    return NextResponse.json({ prices }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}