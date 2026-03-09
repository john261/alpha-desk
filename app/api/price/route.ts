// app/api/price/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: 'application/json',
}

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
}

async function tryV8(symbol: string): Promise<any | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) return null
    return {
      price:       meta.regularMarketPrice,
      marketState: meta.marketState ?? null,
      currency:    meta.currency    ?? 'EUR',
      prevClose:   meta.chartPreviousClose ?? meta.previousClose ?? null,
      symbol,
    }
  } catch {
    return null
  }
}

async function tryV7(symbol: string): Promise<any | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const json  = await res.json()
    const quote = json?.quoteResponse?.result?.[0]
    if (!quote?.regularMarketPrice) return null
    return {
      price:       quote.regularMarketPrice,
      marketState: quote.marketState ?? null,
      currency:    quote.currency    ?? 'EUR',
      prevClose:   quote.regularMarketPreviousClose ?? null,
      change:      quote.regularMarketChange        ?? null,
      changePct:   quote.regularMarketChangePercent ?? null,
      symbol,
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })
  }

  // Candidates: exact → with .DE → with .F (Frankfurt)
  const alreadyHasSuffix = ticker.includes('.')
  const candidates = alreadyHasSuffix
    ? [ticker]
    : [ticker, `${ticker}.DE`, `${ticker}.F`]

  for (const sym of candidates) {
    const result = await tryV8(sym)
    if (result) {
      const { price, marketState, currency, prevClose, symbol } = result
      const change    = prevClose ? price - prevClose : null
      const changePct = change && prevClose ? (change / prevClose) * 100 : null
      return NextResponse.json(
        { price, marketState, currency, prevClose, change, changePct, resolvedTicker: symbol },
        { headers: CACHE_HEADERS }
      )
    }
  }

  for (const sym of candidates) {
    const result = await tryV7(sym)
    if (result) {
      return NextResponse.json(
        { ...result, resolvedTicker: result.symbol },
        { headers: CACHE_HEADERS }
      )
    }
  }

  return NextResponse.json(
    { error: `No price data for ${ticker}` },
    { status: 404 }
  )
}