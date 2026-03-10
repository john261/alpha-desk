// app/api/chart/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

async function fetchYahooChart(symbol: string, interval: string, range: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) return null
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) return null

  const closes     = result.indicators?.quote?.[0]?.close ?? []
  const timestamps = result.timestamp ?? []
  const meta       = result.meta ?? {}

  const prices: number[] = []
  for (let i = 0; i < closes.length; i++) {
    if (closes[i] != null) prices.push(closes[i])
  }

  return {
    prices,
    prevClose:    meta.chartPreviousClose ?? meta.previousClose ?? null,
    currentPrice: meta.regularMarketPrice ?? null,
    marketState:  meta.marketState        ?? null,
    currency:     meta.currency           ?? 'EUR',
    symbol,
  }
}

export async function GET(req: NextRequest) {
  const ticker   = req.nextUrl.searchParams.get('ticker')   ?? ''
  const interval = req.nextUrl.searchParams.get('interval') ?? '1wk'
  const range    = req.nextUrl.searchParams.get('range')    ?? '6mo'

  if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })

  // Auto-suffix for German stocks
  const alreadyHasSuffix = ticker.includes('.')
  const candidates = alreadyHasSuffix ? [ticker] : [`${ticker}.DE`, ticker, `${ticker}.F`]

  for (const sym of candidates) {
    const data = await fetchYahooChart(sym, interval, range)
    if (data && data.prices.length > 1) {
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
      })
    }
  }

  return NextResponse.json({ error: `No chart data for ${ticker}` }, { status: 404 })
}