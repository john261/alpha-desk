'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Realtime price hook (unverändert) ───────────────────────────────────────
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

// ─── Sector → Unsplash image (vollautomatisch aus sector/title) ───────────────
// Jeder Sektor hat ein visuell klar unterscheidbares Bild (EN + DE)
const SECTOR_IMAGES: [string, string][] = [
  // Technologie — blaue Platine
  ['tech',           'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&fit=crop'],
  ['technologi',     'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&fit=crop'],
  ['software',       'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80&fit=crop'],
  // Versicherung — Schirm/Schutz (klar anders)
  ['versicherung',   'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=700&q=80&fit=crop'],
  ['insurance',      'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=700&q=80&fit=crop'],
  // Finanzen / Bank — Skyline
  ['finanz',         'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop'],
  ['finance',        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop'],
  ['bank',           'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop'],
  // Energie — Windräder
  ['energie',        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=80&fit=crop'],
  ['energy',         'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=80&fit=crop'],
  // Gesundheit / Pharma — Labor
  ['gesundheit',     'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80&fit=crop'],
  ['health',         'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80&fit=crop'],
  ['pharma',         'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80&fit=crop'],
  // Automobil — Straße/Auto
  ['automobil',      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=700&q=80&fit=crop'],
  ['fahrzeug',       'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=700&q=80&fit=crop'],
  ['auto',           'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=700&q=80&fit=crop'],
  // Konsumgüter — Supermarkt
  ['konsumg',        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=80&fit=crop'],
  ['consumer',       'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=80&fit=crop'],
  ['retail',         'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=80&fit=crop'],
  ['handel',         'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=80&fit=crop'],
  // Immobilien — Gebäude
  ['immobilien',     'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&fit=crop'],
  ['real estate',    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&fit=crop'],
  // Medien — Kamera
  ['medien',         'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=80&fit=crop'],
  ['media',          'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=80&fit=crop'],
  // Industrie — Fabrik
  ['industrie',      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop'],
  ['industrial',     'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop'],
  // Chemie — Reagenzgläser (orange/warm)
  ['chemie',         'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&q=80&fit=crop'],
  ['chemical',       'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&q=80&fit=crop'],
  // Telekommunikation — Antennen
  ['telekom',        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&q=80&fit=crop'],
  ['telecom',        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&q=80&fit=crop'],
  // Transport / Logistik — Container
  ['transport',      'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop'],
  ['logistik',       'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop'],
  // Lebensmittel
  ['lebensmittel',   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&fit=crop'],
  ['food',           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&fit=crop'],
  // Rohstoffe / Bergbau — Bergwerk
  ['rohstoff',       'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop'],
  ['bergbau',        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop'],
]
const SECTOR_DEFAULT = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80&fit=crop'

function normalizeStr(str: string): string {
  return str.toLowerCase()
    .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ä/g, "a").replace(/ß/g, "ss")
}

function getSectorImage(a: Analysis): string {
  const s = normalizeStr(a.sector ?? '')
  const t = normalizeStr(a.title ?? '')
  for (const [key, url] of SECTOR_IMAGES) {
    const k = normalizeStr(key)
    if (s.includes(k) || t.includes(k)) return url
  }
  return SECTOR_DEFAULT
}

// ─── Rating config ────────────────────────────────────────────────────────────
const RATING_CFG = {
  BUY:   { bg: '#15803d', text: '#dcfce7', icon: '▲' },
  HOLD:  { bg: '#b45309', text: '#fef3c7', icon: '●' },
  SELL:  { bg: '#dc2626', text: '#fee2e2', icon: '▼' },
  WATCH: { bg: '#334155', text: '#e2e8f0', icon: '◎' },
} as const

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Single Card ──────────────────────────────────────────────────────────────
function AnalysisCard({ a, idx }: { a: Analysis; idx: number }) {
  const [imgError, setImgError] = useState(false)

  const { price, upside, marketState, lastUpdated, loading, error } =
    useRealtimePrice(a.ticker, a.price_target)

  const rc = RATING_CFG[a.rating] ?? RATING_CFG.WATCH
  const isOpen = marketState === 'REGULAR'

  const displayPrice  = price ?? a.current_price
  const displayUpside = price != null
    ? upside
    : (a.current_price && a.price_target
        ? ((a.price_target - a.current_price) / a.current_price) * 100
        : null)

  // Checkmarks — automatisch aus vorhandenen Feldern gebaut
  const checks: string[] = []
  if (a.rating && a.price_target)
    checks.push(`${a.rating} Rating · Kursziel €${fmt(a.price_target)}`)
  else if (a.rating)
    checks.push(`${a.rating} Rating`)
  if (displayUpside != null)
    checks.push(`Upside-Potenzial: ${displayUpside >= 0 ? '+' : ''}${displayUpside.toFixed(1)}%`)
  if (a.analyst)
    checks.push(`Analyst: ${a.analyst}`)
  if (a.description)
    checks.push(a.description.slice(0, 72) + (a.description.length > 72 ? '…' : ''))
  if (checks.length === 0)
    checks.push('Vollständige Analyse verfügbar')

  const date = new Date(a.created_at).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <article className="ac-card" style={{ animationDelay: `${idx * 0.07}s` }}>

      {/* ── Bild-Header ─────────────────────────────────────────── */}
      <div className="ac-img-wrap">
        {!imgError ? (
          <img
            src={getSectorImage(a)}
            alt={a.title}
            className="ac-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="ac-img-fallback" />
        )}
        <div className="ac-overlay" />

        {/* Rating-Badge */}
        <div className="ac-badge" style={{ background: rc.bg, color: rc.text }}>
          <span>{rc.icon}</span>
          <span>{a.rating}</span>
        </div>

        {/* Live-Indikator wenn Markt offen */}
        {isOpen && (
          <div className="ac-live">
            <span className="ac-live-dot" />
            <span>LIVE</span>
          </div>
        )}

        {/* Ticker + Titel auf dem Bild */}
        <div className="ac-co-wrap">
          <div className="ac-ticker">{a.ticker}</div>
          <h2 className="ac-co">{a.title}</h2>
          {a.sector && <div className="ac-sector-lbl">{a.sector}</div>}
        </div>
      </div>

      {/* ── Preis-Leiste ────────────────────────────────────────── */}
      {(displayPrice || a.price_target) && (
        <div className="ac-prices">
          <div className="ac-price-cell">
            <div className="ac-price-label">
              <span className="ac-price-dot" style={{
                background: isOpen ? '#22c55e' : '#94a3b8',
                animation:  isOpen ? 'livePulse 2s ease infinite' : 'none',
              }} />
              KURS
              {loading && <span className="ac-loading">↻</span>}
            </div>
            <div className="ac-price-val">
              {error ? '–' : displayPrice != null ? `€${fmt(displayPrice)}` : '–'}
            </div>
          </div>

          {a.price_target && (
            <div className="ac-price-cell">
              <div className="ac-price-label">ZIEL</div>
              <div className="ac-price-val gold">€{fmt(a.price_target)}</div>
            </div>
          )}

          {displayUpside != null && (
            <div className="ac-price-cell">
              <div className="ac-price-label">UPSIDE</div>
              <div className={`ac-price-val ${displayUpside >= 0 ? 'up' : 'dn'}`}>
                {displayUpside >= 0 ? '+' : ''}{displayUpside.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Body: Checkmarks ────────────────────────────────────── */}
      <div className="ac-body">
        <ul className="ac-checks">
          {checks.slice(0, 3).map((c, i) => (
            <li key={i} className="ac-check-item">
              <span className="ac-check-icon">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="ac-divider" />

        {/* Footer */}
        <div className="ac-footer">
          {a.pdfUrl ? (
            <a href={a.pdfUrl} target="_blank" rel="noopener noreferrer" className="ac-btn">
              <span>↓</span> Report öffnen
            </a>
          ) : (
            <button className="ac-btn ac-btn-ghost" disabled>
              <span>○</span> Bald verfügbar
            </button>
          )}

          <div className="ac-meta">
            {a.analyst && <span className="ac-meta-tag">{a.analyst}</span>}
            <span className="ac-meta-date">{date}</span>
            {lastUpdated && (
              <span className="ac-meta-date" style={{ color: '#c9a227', opacity: .7 }}>
                ↻ {lastUpdated.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

    </article>
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────────
export default function AnalysisCardsGrid({ analyses }: { analyses: Analysis[] }) {
  if (!analyses || analyses.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '80px 0',
        color: '#475569', fontFamily: "'DM Mono',monospace",
        fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
      }}>
        Keine Analysen verfügbar
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(1.7)} }

        /* Grid */
        .ac-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 22px;
        }

        /* Card */
        .ac-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          opacity: 0;
          animation: fadeUp .45s ease both;
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .ac-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(201,162,39,0.1);
          border-color: rgba(201,162,39,0.4);
        }

        /* Image header */
        .ac-img-wrap {
          position: relative; height: 186px;
          overflow: hidden; background: #0d1f38; flex-shrink: 0;
        }
        .ac-img { width:100%; height:100%; object-fit:cover; transition:transform .5s ease; }
        .ac-card:hover .ac-img { transform: scale(1.05); }
        .ac-img-fallback {
          width:100%; height:100%;
          background: linear-gradient(135deg, #0d1f38 0%, #1e3a5f 55%, #0a2440 100%);
        }
        .ac-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom,
            rgba(5,14,30,.05) 0%, rgba(5,14,30,.22) 45%,
            rgba(5,14,30,.82) 78%, rgba(5,14,30,.96) 100%);
        }

        /* Badges */
        .ac-badge {
          position: absolute; top: 12px; right: 12px;
          display: flex; align-items: center; gap: 5px;
          padding: 4px 11px;
          font-size: 9px; letter-spacing: 2px;
          text-transform: uppercase; font-weight: 600;
        }
        .ac-live {
          position: absolute; top: 12px; left: 12px;
          display: flex; align-items: center; gap: 6px;
          font-size: 7px; letter-spacing: 3px;
          color: rgba(255,255,255,.55); text-transform: uppercase;
        }
        .ac-live-dot {
          width:5px; height:5px; border-radius:50%;
          background:#22c55e; flex-shrink:0;
          animation: livePulse 2s ease infinite;
        }

        /* Company text on image */
        .ac-co-wrap { position:absolute; bottom:0; left:0; right:0; padding:14px 18px 13px; }
        .ac-ticker  { font-size:8px; letter-spacing:4px; color:#c9a227; text-transform:uppercase; margin-bottom:5px; opacity:.9; }
        .ac-co {
          font-family:'Cormorant Garamond',serif;
          font-size:20px; font-weight:600; color:#fff;
          line-height:1.2; margin:0 0 4px;
          text-shadow:0 2px 10px rgba(0,0,0,.45);
        }
        .ac-sector-lbl { font-size:7px; letter-spacing:2px; color:rgba(255,255,255,.4); text-transform:uppercase; }

        /* Price bar */
        .ac-prices {
          display: grid; grid-template-columns: repeat(3,1fr);
          background:#f8fafc;
          border-top:1px solid #f1f5f9;
          border-bottom:1px solid #f1f5f9;
        }
        .ac-price-cell { padding:13px 16px; border-right:1px solid #f1f5f9; }
        .ac-price-cell:last-child { border-right:none; }
        .ac-price-label {
          font-size:8px; letter-spacing:2px; color:#94a3b8;
          text-transform:uppercase;
          display:flex; align-items:center; gap:5px; margin-bottom:5px;
        }
        .ac-price-dot  { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        .ac-loading    { font-size:8px; color:#94a3b8; }
        .ac-price-val  {
          font-family:'Cormorant Garamond',serif;
          font-size:22px; font-weight:600; color:#0f172a; line-height:1;
        }
        .ac-price-val.gold { color:#c9a227; }
        .ac-price-val.up   { color:#15803d; }
        .ac-price-val.dn   { color:#b91c1c; }

        /* Body */
        .ac-body { padding:16px 20px 18px; display:flex; flex-direction:column; flex:1; }

        /* Checks */
        .ac-checks { list-style:none; margin:0 0 14px; padding:0; display:flex; flex-direction:column; gap:9px; flex:1; }
        .ac-check-item {
          display:flex; align-items:flex-start; gap:10px;
          font-size:10px; color:#334155; line-height:1.5;
          font-family:'DM Mono',monospace;
        }
        .ac-check-icon { color:#c9a227; font-size:11px; font-weight:700; flex-shrink:0; margin-top:1px; }

        /* Divider */
        .ac-divider { height:1px; background:#f1f5f9; margin-bottom:14px; }

        /* Footer */
        .ac-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
        .ac-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 20px; background:#0a1628; color:#c9a227;
          font-family:'DM Mono',monospace; font-size:9px;
          letter-spacing:3px; text-transform:uppercase;
          text-decoration:none; border:none; cursor:pointer; font-weight:500;
          transition:background .2s, color .2s, transform .15s;
        }
        .ac-btn:hover { background:#c9a227; color:#0a1628; transform:translateY(-1px); }
        .ac-btn-ghost { background:#f8fafc; color:#94a3b8; border:1px solid #e2e8f0; cursor:default; }
        .ac-btn-ghost:hover { background:#f8fafc; color:#94a3b8; transform:none; }

        .ac-meta      { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .ac-meta-tag  {
          font-size:8px; letter-spacing:1px; color:#94a3b8;
          padding:3px 7px; background:#f1f5f9; border:1px solid #e2e8f0;
          text-transform:uppercase; font-family:'DM Mono',monospace;
        }
        .ac-meta-date { font-size:8px; color:#cbd5e1; letter-spacing:1px; font-family:'DM Mono',monospace; }

        @media (max-width:640px) {
          .ac-grid { grid-template-columns:1fr; gap:14px; }
          .ac-prices { grid-template-columns:1fr 1fr; }
          .ac-price-cell:nth-child(3) { grid-column:1/-1; border-top:1px solid #f1f5f9; border-right:none; }
          .ac-footer { flex-direction:column; align-items:flex-start; }
        }
      `}</style>

      <div className="ac-grid">
        {analyses.map((a, i) => (
          <AnalysisCard key={a.id} a={a} idx={i} />
        ))}
      </div>
    </>
  )
}