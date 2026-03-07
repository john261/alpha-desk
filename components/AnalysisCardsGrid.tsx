'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Analysis = {
  id: string
  ticker: string
  title: string
  description?: string | null
  rating: 'BUY' | 'HOLD' | 'SELL' | 'WATCH'
  sector?: string | null
  analyst?: string | null
  current_price?: number | null
  price_target?: number | null
  created_at: string
  pdfUrl?: string | null
}

function useRealtimePrice(ticker: string, priceTarget: number | null | undefined) {
  const [price, setPrice]             = useState<number | null>(null)
  const [marketState, setMarketState] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const upside = price != null && priceTarget != null && price > 0
    ? ((priceTarget - price) / price) * 100
    : null

  const fetchPrice = useCallback(async () => {
    try {
      const res  = await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}`)
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error ?? 'Fehler'); setLoading(false); return }
      setPrice(data.price)
      setMarketState(data.marketState ?? null)
      setLastUpdated(new Date())
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [ticker])

  useEffect(() => {
    fetchPrice()
    timerRef.current = setInterval(fetchPrice, 60_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchPrice])

  return { price, upside, marketState, lastUpdated, loading, error }
}

const RATING = {
  BUY:   { bg:'#f0fdf4', text:'#15803d', border:'#86efac', icon:'▲' },
  HOLD:  { bg:'#fffbeb', text:'#b45309', border:'#fcd34d', icon:'●' },
  SELL:  { bg:'#fef2f2', text:'#b91c1c', border:'#fca5a5', icon:'▼' },
  WATCH: { bg:'#f8fafc', text:'#475569', border:'#cbd5e1', icon:'◎' },
} as const

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function AnalysisCard({ a, idx }: { a: Analysis; idx: number }) {
  const { price, upside, marketState, lastUpdated, loading, error } =
    useRealtimePrice(a.ticker, a.price_target)

  const rc = RATING[a.rating] ?? RATING.WATCH
  const isOpen = marketState === 'REGULAR'

  const displayPrice  = price ?? a.current_price
  const displayUpside = price != null
    ? upside
    : (a.current_price && a.price_target
        ? ((a.price_target - a.current_price) / a.current_price) * 100
        : null)

  return (
    <article className="card" style={{ animationDelay:`${idx*0.05}s` }}>
      <div className="card-body">
        <div className="card-header">
          <div>
            <div className="card-ticker">{a.ticker}</div>
            {a.sector && <div className="card-sector">{a.sector}</div>}
          </div>
          <div className="card-badge"
            style={{ background:rc.bg, color:rc.text, border:`1px solid ${rc.border}` }}>
            <span>{rc.icon}</span>{a.rating}
          </div>
        </div>
        <div className="card-title">{a.title}</div>
        {a.description && <div className="card-desc">{a.description}</div>}
      </div>

      {(displayPrice || a.price_target) && (
        <div className="price-block">
          <div className="price-cell">
            <div className="price-label" style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
              <span style={{
                display:'inline-block', width:6, height:6, borderRadius:'50%', flexShrink:0,
                background: isOpen ? '#22c55e' : '#94a3b8',
                animation: isOpen ? 'livePulse 2s ease infinite' : 'none',
              }} />
              AKTUELLER KURS
              {loading && <span style={{ fontSize:8, color:'#94a3b8', marginLeft:4 }}>↻</span>}
            </div>
            {error ? (
              <div className="price-value" style={{ fontSize:14, color:'#94a3b8' }}>–</div>
            ) : (
              <div className="price-value">
                {displayPrice != null ? `€${fmt(displayPrice)}` : '–'}
              </div>
            )}
          </div>

          {a.price_target && (
            <div className="price-cell">
              <div className="price-label" style={{ marginBottom:4 }}>KURSZIEL</div>
              <div className="price-value gold">€{fmt(a.price_target)}</div>
            </div>
          )}

          {displayUpside != null && (
            <div className="price-cell">
              <div className="price-label" style={{ marginBottom:4 }}>UPSIDE</div>
              <div className={`price-value ${displayUpside >= 0 ? 'up' : 'dn'}`}>
                {displayUpside >= 0 ? '+' : ''}{displayUpside.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        {a.pdfUrl ? (
          <a href={a.pdfUrl} target="_blank" rel="noopener noreferrer" className="open-btn">
            ↓ Report öffnen
          </a>
        ) : <div />}
        <div className="card-meta">
          {a.analyst && <span className="meta-tag">{a.analyst}</span>}
          <span className="meta-date">
            {new Date(a.created_at).toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric' })}
          </span>
          {lastUpdated && (
            <span className="meta-date" style={{ color:'#c9a227', opacity:0.7 }}>
              ↻ {lastUpdated.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function AnalysisCardsGrid({ analyses }: { analyses: Analysis[] }) {
  return (
    <>
      <style>{`
        @keyframes livePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.35; transform:scale(1.6); }
        }
        .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
        .card { background:#fff; border:1px solid #e2e8f0; overflow:hidden; animation:fadeUp .4s ease both; transition:box-shadow .25s,transform .25s,border-color .25s; }
        .card:hover { box-shadow:0 20px 60px rgba(0,0,0,0.12); transform:translateY(-4px); border-color:#c9a227; }
        .card-body   { padding:22px 22px 16px; }
        .card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
        .card-ticker { font-size:13px; letter-spacing:4px; font-weight:500; color:#0f172a; text-transform:uppercase; }
        .card-sector { font-size:8px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; margin-top:3px; }
        .card-badge  { padding:5px 14px; font-size:9px; letter-spacing:2px; font-weight:600; text-transform:uppercase; display:flex; align-items:center; gap:5px; flex-shrink:0; }
        .card-title  { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; color:#0f172a; line-height:1.3; margin-bottom:10px; }
        .card-desc   { font-size:11px; color:#94a3b8; line-height:1.8; }
        .price-block { display:grid; grid-template-columns:repeat(3,1fr); background:#f8fafc; border-top:1px solid #f1f5f9; }
        .price-cell  { padding:16px 18px; border-right:1px solid #f1f5f9; }
        .price-cell:last-child { border-right:none; }
        .price-value      { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:600; color:#0f172a; line-height:1; }
        .price-value.gold { color:#c9a227; }
        .price-value.up   { color:#15803d; }
        .price-value.dn   { color:#b91c1c; }
        .price-label { font-size:8px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; }
        .card-footer { padding:14px 22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid #f1f5f9; background:#fafafa; }
        .open-btn { display:inline-flex; align-items:center; gap:8px; padding:11px 22px; background:#0a1628; color:#fff; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:3px; text-transform:uppercase; text-decoration:none; font-weight:500; transition:all .2s; }
        .open-btn:hover { background:#c9a227; color:#0a1628; }
        .card-meta  { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .meta-tag   { font-size:8px; letter-spacing:1px; color:#94a3b8; padding:4px 8px; background:#f1f5f9; border:1px solid #e2e8f0; text-transform:uppercase; }
        .meta-date  { font-size:9px; color:#cbd5e1; letter-spacing:1px; }
        @media (max-width:640px) {
          .cards-grid { grid-template-columns:1fr; gap:12px; }
          .price-block { grid-template-columns:1fr 1fr; }
          .price-cell:nth-child(3) { grid-column:1/-1; border-top:1px solid #f1f5f9; border-right:none; }
          .card-footer { flex-direction:column; align-items:flex-start; }
        }
      `}</style>
      <div className="cards-grid">
        {analyses.map((a, i) => (
          <AnalysisCard key={a.id} a={a} idx={i} />
        ))}
      </div>
    </>
  )
}