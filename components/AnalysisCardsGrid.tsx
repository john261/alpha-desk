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
  category?: string | null
}

// ─── Realtime price hook ──────────────────────────────────────────────────────
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

// ─── Exaktes Sektor → Bild Mapping ───────────────────────────────────────────
// Jeder Sektor aus dem Dropdown bekommt sein eigenes, visuell einzigartiges Bild.
const SECTOR_IMAGE_MAP: Record<string, string> = {
  // Technologie — blaue Platine/Circuit
  'Technologie':
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&fit=crop',
  // Software & IT — Code auf Monitor
  'Software & IT':
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80&fit=crop',
  // Halbleiter — Chip Nahaufnahme
  'Halbleiter':
    'https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=700&q=80&fit=crop',
  // Automobil & OEM — Autofabrik/Produktion
  'Automobil & OEM':
    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=700&q=80&fit=crop',
  // Autovermietung & Mobilität — Fahrzeugflotte/Parkhaus
  'Autovermietung & Mobilität':
    'https://images.unsplash.com/photo-1609520778382-0f2afc1ebb26?w=700&q=80&fit=crop',
  // Versicherung — Schirm/Schutz
  'Versicherung':
    'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=700&q=80&fit=crop',
  // Banken & Finanzen — Frankfurter Skyline/Bankenviertel
  'Banken & Finanzen':
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop',
  // Immobilien — modernes Gebäude
  'Immobilien':
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&fit=crop',
  // Energie & Utilities — Kraftwerk/Turbinen
  'Energie & Utilities':
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=700&q=80&fit=crop',
  // Erneuerbare Energien — Windräder
  'Erneuerbare Energien':
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=80&fit=crop',
  // Pharma & Biotech — Labor/Reagenzgläser blau
  'Pharma & Biotech':
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80&fit=crop',
  // Medizintechnik — MRT/med. Gerät
  'Medizintechnik':
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80&fit=crop',
  // Konsumgüter & Handel — Supermarkt/Regal
  'Konsumgüter & Handel':
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80&fit=crop',
  // Lebensmittel & Getränke — Markt/frische Produkte
  'Lebensmittel & Getränke':
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&fit=crop',
  // Industrie & Maschinenbau — Fabrikhalle
  'Industrie & Maschinenbau':
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop',
  // Chemie & Werkstoffe — Reagenzgläser orange/warm
  'Chemie & Werkstoffe':
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&q=80&fit=crop',
  // Telekommunikation — Antennen/Masten
  'Telekommunikation':
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&q=80&fit=crop',
  // Medien & Entertainment — Kamera/Studio
  'Medien & Entertainment':
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=80&fit=crop',
  // Transport & Logistik — Containerschiff/Hafen
  'Transport & Logistik':
    'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop',
  // Luft- & Raumfahrt — Flugzeug/Cockpit
  'Luft- & Raumfahrt':
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&q=80&fit=crop',
  // Rüstung & Defense — Militär/Defense
  'Rüstung & Defense':
    'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=700&q=80&fit=crop',
  // Rohstoffe & Bergbau — Bergwerk/Mine
  'Rohstoffe & Bergbau':
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop',
  // E-Commerce & Plattformen — Online Shopping/Pakete
  'E-Commerce & Plattformen':
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80&fit=crop',
  // Luxury & Fashion — Luxusgüter
  'Luxury & Fashion':
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80&fit=crop',
  // Gaming & Esports — Controller/Screen
  'Gaming & Esports':
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80&fit=crop',
  // Künstliche Intelligenz — KI/Neural Network
  'Künstliche Intelligenz':
    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=80&fit=crop',
  // Krypto & Blockchain — Bitcoin/Digital
  'Krypto & Blockchain':
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=700&q=80&fit=crop',
  // Agrar & Forst — Felder/Landwirtschaft
  'Agrar & Forst':
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80&fit=crop',
  // Sonstiges — Allgemein/Markt
  'Sonstiges':
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80&fit=crop',
}

// ─── Geopolitik-Kategorie Bilder (nach Themenbereich) ────────────────────────
const GEO_IMAGE_MAP: Record<string, string> = {
  'USA & Fed-Politik':
    'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=700&q=80&fit=crop',
  'Europa & EZB':
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=700&q=80&fit=crop',
  'China & Asien':
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=700&q=80&fit=crop',
  'Naher Osten':
    'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=700&q=80&fit=crop',
  'Russland & Ukraine':
    'https://images.unsplash.com/photo-1580974852861-c381510bc98a?w=700&q=80&fit=crop',
  'NATO & Verteidigung':
    'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=700&q=80&fit=crop',
  'Handelskrieg & Zölle':
    'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop',
  'Rohstoff-Geopolitik':
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop',
  'Währungskrisen':
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=700&q=80&fit=crop',
  'Sanktionen & Embargos':
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=700&q=80&fit=crop',
  'Globale Lieferketten':
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80&fit=crop',
  'Energiesicherheit':
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=700&q=80&fit=crop',
  'Sonstiges':
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=80&fit=crop',
}

// Fallback
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=80&fit=crop'

// Fuzzy Fallback fuer alte Freitext-Sektoren (rueckwaertskompatibel)
const FUZZY_FALLBACK: [string, string][] = [
  ['mobil',        'https://images.unsplash.com/photo-1609520778382-0f2afc1ebb26?w=700&q=80&fit=crop'],
  ['mietwagen',    'https://images.unsplash.com/photo-1609520778382-0f2afc1ebb26?w=700&q=80&fit=crop'],
  ['autovermiet',  'https://images.unsplash.com/photo-1609520778382-0f2afc1ebb26?w=700&q=80&fit=crop'],
  ['automobil',    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=700&q=80&fit=crop'],
  ['fahrzeug',     'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=700&q=80&fit=crop'],
  ['technolog',    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&fit=crop'],
  ['software',     'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80&fit=crop'],
  ['halbleiter',   'https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=700&q=80&fit=crop'],
  ['versicherung', 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=700&q=80&fit=crop'],
  ['insurance',    'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=700&q=80&fit=crop'],
  ['bank',         'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop'],
  ['finanz',       'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80&fit=crop'],
  ['immobil',      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=700&q=80&fit=crop'],
  ['erneuerbar',   'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=80&fit=crop'],
  ['energie',      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=700&q=80&fit=crop'],
  ['pharma',       'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80&fit=crop'],
  ['biotech',      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=700&q=80&fit=crop'],
  ['gesundheit',   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80&fit=crop'],
  ['medizin',      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80&fit=crop'],
  ['konsum',       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80&fit=crop'],
  ['handel',       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80&fit=crop'],
  ['retail',       'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&q=80&fit=crop'],
  ['lebensmittel', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&fit=crop'],
  ['food',         'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80&fit=crop'],
  ['industrie',    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop'],
  ['maschinenbau', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=80&fit=crop'],
  ['chemie',       'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&q=80&fit=crop'],
  ['telekom',      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=700&q=80&fit=crop'],
  ['medien',       'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=80&fit=crop'],
  ['media',        'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&q=80&fit=crop'],
  ['transport',    'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop'],
  ['logistik',     'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop'],
  ['luftfahrt',    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&q=80&fit=crop'],
  ['ruestung',     'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=700&q=80&fit=crop'],
  ['defense',      'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=700&q=80&fit=crop'],
  ['rohstoff',     'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop'],
  ['bergbau',      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop'],
  ['ecommerce',    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80&fit=crop'],
  ['luxury',       'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80&fit=crop'],
  ['fashion',      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80&fit=crop'],
  ['gaming',       'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80&fit=crop'],
  ['krypto',       'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=700&q=80&fit=crop'],
  ['crypto',       'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=700&q=80&fit=crop'],
  ['agrar',        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80&fit=crop'],
]

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
}

function getCardImage(a: Analysis): string {
  const category = a.category ?? 'equity'
  const sector   = a.sector ?? ''

  if (category === 'geo') {
    return GEO_IMAGE_MAP[sector] ?? DEFAULT_IMAGE
  }

  // 1. Exaktes Matching auf Dropdown-Wert (neue Analysen)
  if (SECTOR_IMAGE_MAP[sector]) return SECTOR_IMAGE_MAP[sector]

  // 2. Fuzzy Fallback fuer alte Freitext-Sektoren
  const sNorm = normalize(sector)
  const tNorm = normalize(a.title ?? '')
  for (const [key, url] of FUZZY_FALLBACK) {
    const k = normalize(key)
    if (sNorm.includes(k) || tNorm.includes(k)) return url
  }

  return DEFAULT_IMAGE
}

// ─── Rating config ────────────────────────────────────────────────────────────
const RATING_CFG = {
  BUY:   { bg: '#15803d', text: '#dcfce7', icon: '▲' },
  HOLD:  { bg: '#b45309', text: '#fef3c7', icon: '●' },
  SELL:  { bg: '#dc2626', text: '#fee2e2', icon: '▼' },
  WATCH: { bg: '#334155', text: '#e2e8f0', icon: '◎' },
} as const

// Kategorie-Farben für Badge
const CAT_COLORS: Record<string, string> = {
  equity: '#c9a227',
  geo:    '#38bdf8',
}
const CAT_LABELS: Record<string, string> = {
  equity: 'Equity',
  geo:    'Geopolitik',
}

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Single Card ──────────────────────────────────────────────────────────────
function AnalysisCard({ a, idx }: { a: Analysis; idx: number }) {
  const [imgError, setImgError] = useState(false)

  const { price, upside, marketState, lastUpdated, loading, error } =
    useRealtimePrice(a.ticker, a.price_target)

  const rc     = RATING_CFG[a.rating] ?? RATING_CFG.WATCH
  const isOpen = marketState === 'REGULAR'
  const cat    = a.category ?? 'equity'
  const catColor = CAT_COLORS[cat] ?? '#c9a227'

  const displayPrice  = price ?? a.current_price
  const displayUpside = price != null
    ? upside
    : (a.current_price && a.price_target
        ? ((a.price_target - a.current_price) / a.current_price) * 100
        : null)

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
            src={getCardImage(a)}
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

        {/* Kategorie-Badge oben links */}
        <div className="ac-cat-badge" style={{ color: catColor, borderColor: `${catColor}55`, background: `${catColor}18` }}>
          {CAT_LABELS[cat] ?? cat}
        </div>

        {/* Live-Indikator wenn Markt offen (nur Equity) */}
        {isOpen && cat === 'equity' && (
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

      {/* ── Preis-Leiste (nur Equity mit Preisdaten) ────────────── */}
      {cat === 'equity' && (displayPrice || a.price_target) && (
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

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="ac-body">
        <ul className="ac-checks">
          {checks.slice(0, 3).map((c, i) => (
            <li key={i} className="ac-check-item">
              <span className="ac-check-icon" style={{ color: catColor }}>✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <div className="ac-divider" />

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

        .ac-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 22px;
        }

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

        .ac-badge {
          position: absolute; top: 12px; right: 12px;
          display: flex; align-items: center; gap: 5px;
          padding: 4px 11px;
          font-size: 9px; letter-spacing: 2px;
          text-transform: uppercase; font-weight: 600;
          font-family: 'DM Mono', monospace;
        }

        /* Kategorie-Badge oben links */
        .ac-cat-badge {
          position: absolute; top: 12px; left: 12px;
          font-size: 7px; letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 3px 8px;
          border: 1px solid;
          font-family: 'DM Mono', monospace;
        }

        .ac-live {
          position: absolute; top: 36px; left: 12px;
          display: flex; align-items: center; gap: 6px;
          font-size: 7px; letter-spacing: 3px;
          color: rgba(255,255,255,.55); text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }
        .ac-live-dot {
          width:5px; height:5px; border-radius:50%;
          background:#22c55e; flex-shrink:0;
          animation: livePulse 2s ease infinite;
        }

        .ac-co-wrap { position:absolute; bottom:0; left:0; right:0; padding:14px 18px 13px; }
        .ac-ticker  { font-size:8px; letter-spacing:4px; color:#c9a227; text-transform:uppercase; margin-bottom:5px; opacity:.9; font-family:'DM Mono',monospace; }
        .ac-co {
          font-family:'Cormorant Garamond',serif;
          font-size:20px; font-weight:600; color:#fff;
          line-height:1.2; margin:0 0 4px;
          text-shadow:0 2px 10px rgba(0,0,0,.45);
        }
        .ac-sector-lbl { font-size:7px; letter-spacing:2px; color:rgba(255,255,255,.4); text-transform:uppercase; font-family:'DM Mono',monospace; }

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
          font-family:'DM Mono',monospace;
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

        .ac-body { padding:16px 20px 18px; display:flex; flex-direction:column; flex:1; }

        .ac-checks { list-style:none; margin:0 0 14px; padding:0; display:flex; flex-direction:column; gap:9px; flex:1; }
        .ac-check-item {
          display:flex; align-items:flex-start; gap:10px;
          font-size:10px; color:#334155; line-height:1.5;
          font-family:'DM Mono',monospace;
        }
        .ac-check-icon { font-size:11px; font-weight:700; flex-shrink:0; margin-top:1px; }

        .ac-divider { height:1px; background:#f1f5f9; margin-bottom:14px; }

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