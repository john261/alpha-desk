import { NextRequest, NextResponse } from 'next/server'

const CACHE = new Map<string, { price: number; marketState: string; ts: number }>()
const TTL = 55_000

function toYahoo(ticker: string) {
  if (/\.[A-Z]{1,4}$/.test(ticker)) return ticker
  return `${ticker}.DE`
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase()?.trim()
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })

  const hit = CACHE.get(ticker)
  if (hit && Date.now() - hit.ts < TTL) {
    return NextResponse.json({ ticker, price: hit.price, marketState: hit.marketState, cached: true })
  }

  const yahoo = toYahoo(ticker)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1m&range=1d`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) return NextResponse.json({ error: `Yahoo: ${res.status}` }, { status: 502 })

    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return NextResponse.json({ error: 'Keine Daten' }, { status: 404 })

    const price: number       = meta.regularMarketPrice ?? meta.previousClose
    const currency: string    = meta.currency   ?? 'EUR'
    const marketState: string = meta.marketState ?? 'CLOSED'

    CACHE.set(ticker, { price, marketState, ts: Date.now() })

    return NextResponse.json({ ticker, yahooTicker: yahoo, price, currency, marketState })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}