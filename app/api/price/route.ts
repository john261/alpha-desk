// app/api/price/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  if (!ticker) {
    return NextResponse.json({ error: 'Missing ticker' }, { status: 400 })
  }

  try {
    // Yahoo Finance v8 quote endpoint
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1m&range=1d`

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 60 }, // cache for 60 seconds
    })

    if (!res.ok) {
      // Fallback: try v7 quoteSummary
      return await fallbackQuote(ticker)
    }

    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta

    if (!meta) {
      return await fallbackQuote(ticker)
    }

    // regularMarketPrice is always the most current price
    const price       = meta.regularMarketPrice      ?? null
    const marketState = meta.marketState             ?? null   // 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
    const currency    = meta.currency                ?? 'EUR'
    const prevClose   = meta.chartPreviousClose      ?? meta.previousClose ?? null
    const change      = price != null && prevClose != null ? price - prevClose : null
    const changePct   = change != null && prevClose ? (change / prevClose) * 100 : null

    return NextResponse.json(
      { price, marketState, currency, prevClose, change, changePct },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Fetch failed' }, { status: 500 })
  }
}

// ── Fallback: Yahoo Finance v7 quoteSummary ─────────────────────────────────
async function fallbackQuote(ticker: string): Promise<NextResponse> {
  try {
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    })

    if (!res.ok) throw new Error(`Yahoo v7 error: ${res.status}`)

    const json        = await res.json()
    const quote       = json?.quoteResponse?.result?.[0]

    if (!quote) return NextResponse.json({ error: 'No data' }, { status: 404 })

    const price       = quote.regularMarketPrice     ?? null
    const marketState = quote.marketState            ?? null
    const currency    = quote.currency               ?? 'EUR'
    const prevClose   = quote.regularMarketPreviousClose ?? null
    const change      = quote.regularMarketChange    ?? null
    const changePct   = quote.regularMarketChangePercent ?? null

    return NextResponse.json(
      { price, marketState, currency, prevClose, change, changePct },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Fallback failed' }, { status: 500 })
  }
}