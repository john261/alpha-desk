'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

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
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&q=80&fit=crop',
  // Automobil & OEM — Autofabrik/Produktion
  'Automobil & OEM':
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=80&fit=crop',
  'Automobil':
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=80&fit=crop',
  // Autovermietung & Mobilität — Fahrzeugflotte/Parkhaus
  'Autovermietung & Mobilität':
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&fit=crop',
  // Versicherung — Schirm/Schutz
  'Versicherung':
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80&fit=crop',
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
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80&fit=crop',
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
    'https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=700&q=80&fit=crop',
  'NATO & Verteidigung':
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80&fit=crop',
  'Handelskrieg & Zölle':
    'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=700&q=80&fit=crop',
  'Rohstoff-Geopolitik':
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&q=80&fit=crop',
  'Währungskrisen':
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=700&q=80&fit=crop',
  'Sanktionen & Embargos':
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&q=80&fit=crop',
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
  ['mobil',        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&fit=crop'],
  ['mietwagen',    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&fit=crop'],
  ['autovermiet',  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80&fit=crop'],
  ['automobil',    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=80&fit=crop'],
  ['fahrzeug',     'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=80&fit=crop'],
  ['technolog',    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=80&fit=crop'],
  ['software',     'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=80&fit=crop'],
  ['halbleiter',   'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=700&q=80&fit=crop'],
  ['versicherung', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80&fit=crop'],
  ['insurance',    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80&fit=crop'],
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
  ['ruestung',     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80&fit=crop'],
  ['defense',      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80&fit=crop'],
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

  if (category === 'crypto') {
    return '' // handled via getCryptoBrand
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
  crypto: '#f97316',
}
const CAT_LABELS: Record<string, string> = {
  equity: 'Equity',
  geo:    'Geopolitik',
  crypto: 'Digital Assets',
}

// ─── Crypto Brand Colors & Logos ─────────────────────────────────────────────
const CRYPTO_BRAND: Record<string, { gradient: string; logo: string }> = {
  'Bitcoin (BTC)':        { gradient: 'linear-gradient(135deg,#1a0a00 0%,#3d1f00 40%,#7a3d00 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/btc.png' },
  'Ethereum (ETH)':       { gradient: 'linear-gradient(135deg,#0d0d2b 0%,#1a1a4e 40%,#2d2d8f 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/eth.png' },
  'Tether (USDT)':        { gradient: 'linear-gradient(135deg,#001a12 0%,#003d2b 40%,#006644 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdt.png' },
  'BNB (BNB)':            { gradient: 'linear-gradient(135deg,#1a1400 0%,#3d3000 40%,#7a5f00 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/bnb.png' },
  'Solana (SOL)':         { gradient: 'linear-gradient(135deg,#0d0020 0%,#1e0040 40%,#6600cc 70%,#00c97a 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/sol.png' },
  'XRP (XRP)':            { gradient: 'linear-gradient(135deg,#001a2b 0%,#003d66 40%,#0077b3 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/xrp.png' },
  'USD Coin (USDC)':      { gradient: 'linear-gradient(135deg,#001226 0%,#002b59 40%,#004fa3 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdc.png' },
  'Dogecoin (DOGE)':      { gradient: 'linear-gradient(135deg,#1a1200 0%,#3d2b00 40%,#8a6200 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/doge.png' },
  'Cardano (ADA)':        { gradient: 'linear-gradient(135deg,#000d26 0%,#001a59 40%,#0033ad 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/ada.png' },
  'TRON (TRX)':           { gradient: 'linear-gradient(135deg,#1a0000 0%,#400000 40%,#8f0000 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/trx.png' },
  'Avalanche (AVAX)':     { gradient: 'linear-gradient(135deg,#1a0000 0%,#400000 40%,#cc1a1a 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/avax.png' },
  'Polkadot (DOT)':       { gradient: 'linear-gradient(135deg,#1a0020 0%,#3d004d 40%,#8f0066 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/dot.png' },
  'Chainlink (LINK)':     { gradient: 'linear-gradient(135deg,#000d26 0%,#001566 40%,#1a3dcc 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/link.png' },
  'Polygon (POL)':        { gradient: 'linear-gradient(135deg,#0d0020 0%,#250059 40%,#6633cc 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/matic.png' },
  'Litecoin (LTC)':       { gradient: 'linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 40%,#4a4a4a 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/ltc.png' },
  'Shiba Inu (SHIB)':     { gradient: 'linear-gradient(135deg,#1a0800 0%,#3d1a00 40%,#cc5200 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/shib.png' },
  'Uniswap (UNI)':        { gradient: 'linear-gradient(135deg,#1a0013 0%,#400030 40%,#cc007a 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/uni.png' },
  'Stellar (XLM)':        { gradient: 'linear-gradient(135deg,#001626 0%,#003359 40%,#0088cc 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/xlm.png' },
  'Cosmos (ATOM)':        { gradient: 'linear-gradient(135deg,#050810 0%,#0e1228 40%,#2e3148 100%)', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/atom.png' },
  'Sui (SUI)':            { gradient: 'linear-gradient(135deg,#001226 0%,#002b59 40%,#1a66cc 100%)', logo: 'https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png' },
  // Themenbereiche
  'Layer 1 Protokolle':   { gradient: 'linear-gradient(135deg,#0a0a1a 0%,#1a1a3d 100%)', logo: '' },
  'Layer 2 & Scaling':    { gradient: 'linear-gradient(135deg,#0a1a1a 0%,#1a3d3d 100%)', logo: '' },
  'DeFi & DEX':           { gradient: 'linear-gradient(135deg,#0a1a0a 0%,#1a3d1a 100%)', logo: '' },
  'NFT & Gaming':         { gradient: 'linear-gradient(135deg,#1a0a1a 0%,#3d1a3d 100%)', logo: '' },
  'Stablecoins':          { gradient: 'linear-gradient(135deg,#0a1a0a 0%,#1a4d2e 100%)', logo: '' },
  'Krypto-Regulierung':   { gradient: 'linear-gradient(135deg,#1a1a0a 0%,#3d3d00 100%)', logo: '' },
  'Institutional Adoption':{ gradient:'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%)', logo: '' },
  'Mining & Infrastruktur':{ gradient:'linear-gradient(135deg,#1a0a00 0%,#3d2000 100%)', logo: '' },
  'Web3 & Metaverse':     { gradient: 'linear-gradient(135deg,#0d001a 0%,#2d0059 100%)', logo: '' },
  'Altcoins & Small Caps':{ gradient: 'linear-gradient(135deg,#0a0a1a 0%,#1a1a4d 100%)', logo: '' },
  'Sonstiges':            { gradient: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%)', logo: '' },
}

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Chart hook (range-aware) ─────────────────────────────────────────────────
type Range = '1D' | '3M' | '6M' | '1Y'
const RANGE_PARAMS: Record<Range, { interval: string; range: string }> = {
  '1D': { interval: '5m',  range: '1d'  },
  '3M': { interval: '1wk', range: '3mo' },
  '6M': { interval: '1wk', range: '6mo' },
  '1Y': { interval: '1mo', range: '1y'  },
}

function useChartData(ticker: string, category: string, range: Range) {
  const [points, setPoints]       = useState<{ v: number }[] | null>(null)
  const [trend, setTrend]         = useState<'up' | 'down' | 'flat'>('flat')
  const [loading, setLoading]     = useState(true)
  const [dayChange, setDayChange] = useState<number | null>(null)

  useEffect(() => {
    if (!ticker || category === 'geo') { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setPoints(null)
    setDayChange(null)
    const { interval, range: r } = RANGE_PARAMS[range]
    fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&interval=${interval}&range=${r}`)
      .then(res => res.json())
      .then(d => {
        if (cancelled) return
        if (d.prevClose != null && d.currentPrice != null && d.prevClose > 0) {
          setDayChange(((d.currentPrice - d.prevClose) / d.prevClose) * 100)
        }
        if (range === '1D' || !Array.isArray(d.prices) || d.prices.length < 2) return
        const pts = (d.prices as number[]).map((v: number) => ({ v }))
        const first = pts[0].v, last = pts[pts.length - 1].v
        setPoints(pts)
        setTrend(last > first * 1.002 ? 'up' : last < first * 0.998 ? 'down' : 'flat')
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [ticker, category, range])

  return { points, trend, loading, dayChange }
}

// ─── Mini Chart Component ────────────────────────────────────────────────────
function MiniChart({ ticker, category }: { ticker: string; category: string }) {
  const [range, setRange] = useState<Range>('6M')
  const { points, trend, loading, dayChange } = useChartData(ticker, category, range)

  if (category === 'geo') return null

  // Wenn Daten fehlen (und nicht 1D): ausblenden
  if (!loading && !points && range !== '1D') return null

  const COLORS = {
    up:   { stroke: '#22c55e', glow: 'rgba(34,197,94,0.18)' },
    down: { stroke: '#f87171', glow: 'rgba(248,113,113,0.14)' },
    flat: { stroke: '#c9a227', glow: 'rgba(201,162,39,0.14)' },
  }

  // Für 1D: Farbe anhand dayChange bestimmen
  const dayTrend = dayChange == null ? 'flat' : dayChange > 0.2 ? 'up' : dayChange < -0.2 ? 'down' : 'flat'
  const col = range === '1D' ? COLORS[dayTrend] : COLORS[trend]

  const pct = points && points.length >= 2
    ? (((points[points.length - 1].v - points[0].v) / points[0].v) * 100).toFixed(1)
    : null
  const isUp = Number(pct) >= 0

  // Bei 1D: nur Tabs + Tagesperformance-Badge, keine Chartlinie
  const showChart = range !== '1D'

  return (
    <div style={{
      background: '#111e33',
      borderTop: '2px solid #1e2e48',
      borderBottom: '1px solid #1a2a42',
      position: 'relative',
      height: showChart ? 120 : 44,
      overflow: 'hidden',
      transition: 'height 0.25s ease',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 55% at 50% 100%, ${col.glow}, transparent)`,
        pointerEvents: 'none', transition: 'background 0.4s ease',
      }} />

      {/* Top row: range tabs left, pct right */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px 0',
      }}>
        {/* Range toggle */}
        <div style={{ display: 'flex', gap: 2 }}>
          {(['1D', '3M', '6M', '1Y'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 7, letterSpacing: 1.5,
                padding: '2px 7px',
                border: 'none', cursor: 'pointer',
                borderRadius: 2,
                background: range === r ? col.stroke : 'rgba(255,255,255,0.06)',
                color: range === r ? '#0b1525' : 'rgba(255,255,255,0.28)',
                fontWeight: range === r ? 700 : 400,
                transition: 'all 0.18s ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Performance: bei 1D → Tages-Badge, sonst Periodenperformance */}
        {loading ? (
          <div style={{
            width: 48, height: 10, borderRadius: 3,
            background: 'linear-gradient(90deg, #1a2a42 25%, #243550 50%, #1a2a42 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s ease infinite',
          }} />
        ) : range === '1D' && dayChange != null ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 7, letterSpacing: 2, color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
            }}>HEUTE</div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, letterSpacing: 0.5,
              color: col.stroke, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 3,
              background: `${col.stroke}18`,
              border: `1px solid ${col.stroke}40`,
              padding: '2px 7px',
              borderRadius: 2,
            }}>
              <span style={{ fontSize: 8 }}>{dayChange >= 0 ? '▲' : '▼'}</span>
              {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
            </div>
          </div>
        ) : pct !== null ? (
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11, letterSpacing: 0.5,
            color: col.stroke, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 3,
            transition: 'color 0.3s ease',
          }}>
            <span style={{ fontSize: 8 }}>{isUp ? '▲' : '▼'}</span>
            {isUp ? '+' : ''}{pct}%
          </div>
        ) : null}
      </div>

      {/* Chart oder Skeleton – nur wenn nicht 1D */}
      {showChart && (
        loading ? (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 85, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '88%', height: 2, borderRadius: 2,
              background: 'linear-gradient(90deg, #1a2a42 25%, #243550 50%, #1a2a42 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease infinite',
            }} />
          </div>
        ) : points ? (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90 }}>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={points} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`cg-${ticker}-${range}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={col.stroke} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={col.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={col.stroke}
                  strokeWidth={2}
                  fill={`url(#cg-${ticker}-${range})`}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={600}
                  animationEasing="ease-out"
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div style={{
                        background: '#0c1628',
                        border: `1px solid ${col.stroke}55`,
                        padding: '4px 9px',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9, color: col.stroke, letterSpacing: 1,
                        boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
                      }}>
                        €{fmt(payload[0].value as number)}
                      </div>
                    )
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : null
      )}
    </div>
  )
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
        {cat === 'crypto' ? (
          <div style={{
            width: '100%', height: '100%',
            background: CRYPTO_BRAND[a.sector ?? '']?.gradient ?? 'linear-gradient(135deg,#0a0a1a 0%,#1a1a3d 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {/* subtle hex grid pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            {CRYPTO_BRAND[a.sector ?? '']?.logo ? (
              <img
                src={CRYPTO_BRAND[a.sector ?? '']?.logo}
                alt={a.sector ?? ''}
                style={{ width: 80, height: 80, objectFit: 'contain', filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.25))', position: 'relative', zIndex: 1 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <span style={{ fontSize: 48, opacity: 0.4, position: 'relative', zIndex: 1 }}>⬡</span>
            )}
          </div>
        ) : !imgError ? (
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
        {isOpen && (cat === 'equity' || cat === 'crypto') && (
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

      {/* ── Chart (klar getrennt vom Bild) ──────────────────────── */}
      <MiniChart ticker={a.ticker} category={cat} />

      {(cat === 'equity' || cat === 'crypto') && (displayPrice || a.price_target) && (
        <div className="ac-prices">
          {/* Kurs → Ziel flow */}
          <div className="ac-price-flow">
            {displayPrice != null && (
              <div className="ac-price-cell">
                <div className="ac-price-label">
                  <span className="ac-price-dot" style={{
                    background: isOpen ? '#22c55e' : '#94a3b8',
                    animation: isOpen ? 'livePulse 2s ease infinite' : 'none',
                  }} />
                  KURS{loading && <span className="ac-loading"> ↻</span>}
                </div>
                <div className="ac-price-val">
                  {error ? '–' : `€${fmt(displayPrice)}`}
                </div>
              </div>
            )}

            {displayPrice != null && a.price_target && (
              <span className="ac-price-arrow">→</span>
            )}

            {a.price_target && (
              <div className="ac-price-cell">
                <div className="ac-price-label">ZIEL</div>
                <div className="ac-price-val gold">€{fmt(a.price_target)}</div>
              </div>
            )}
          </div>

          {/* Upside — prominent rechts */}
          {displayUpside != null && (
            <>
              <div className="ac-price-separator" />
              <div className="ac-upside-block">
                <div className={`ac-upside-val ${displayUpside >= 0 ? 'up' : 'dn'}`}>
                  {displayUpside >= 0 ? '+' : ''}{displayUpside.toFixed(1)}%
                </div>
                <div className="ac-upside-lbl">UPSIDE</div>
              </div>
            </>
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
              <span>↗</span> VIEW FULL REPORT
            </a>
          ) : (
            <button className="ac-btn ac-btn-ghost" disabled>
              <span>◷</span> COMING SOON
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
  const [activeTab, setActiveTab] = useState<'all' | 'equity' | 'geo' | 'crypto'>('all')

  const counts = {
    all:    analyses.length,
    equity: analyses.filter(a => (a.category ?? 'equity') === 'equity').length,
    geo:    analyses.filter(a => (a.category ?? 'equity') === 'geo').length,
    crypto: analyses.filter(a => (a.category ?? 'equity') === 'crypto').length,
  }

  const filtered = activeTab === 'all'
    ? analyses
    : analyses.filter(a => (a.category ?? 'equity') === activeTab)

  const TABS: { key: 'all' | 'equity' | 'geo' | 'crypto'; label: string; color: string }[] = [
    { key: 'all',    label: 'ALL',              color: '#94a3b8' },
    { key: 'equity', label: 'EQUITY RESEARCH',  color: '#c9a227' },
    { key: 'geo',    label: 'MACRO / GEOPOLITICS', color: '#38bdf8' },
    { key: 'crypto', label: 'DIGITAL ASSETS',   color: '#f97316' },
  ]

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
        @keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .ac-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1200px) {
          .ac-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 860px) {
          .ac-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
          display: flex;
          align-items: stretch;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          padding: 10px 16px;
          gap: 0;
        }
        .ac-price-flow {
          display: flex; align-items: center; gap: 8px; flex: 1;
        }
        .ac-price-cell { padding: 0; border-right: none; }
        .ac-price-label {
          font-size: 8px; letter-spacing: 2px; color: #94a3b8;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 4px; margin-bottom: 3px;
          font-family: 'DM Mono', monospace;
        }
        .ac-price-dot  { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .ac-loading    { font-size: 8px; color: #94a3b8; }
        .ac-price-val  {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 600; color: #0f172a; line-height: 1;
        }
        .ac-price-val.gold { color: #c9a227; }
        .ac-price-arrow {
          font-size: 17px; color: #c9a227; flex-shrink: 0; margin: 0 6px;
          align-self: flex-end; padding-bottom: 1px; font-weight: 600;
        }
        .ac-price-separator { width: 1px; background: #e2e8f0; margin: 0 12px; align-self: stretch; flex-shrink: 0; }
        .ac-upside-block {
          display: flex; flex-direction: column; justify-content: center;
          padding-left: 12px;
        }
        .ac-upside-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px; font-weight: 700; line-height: 1; letter-spacing: -0.02em;
        }
        .ac-upside-val.up { color: #15803d; }
        .ac-upside-val.dn { color: #b91c1c; }
        .ac-upside-lbl {
          font-size: 7px; letter-spacing: 2px; color: #94a3b8;
          text-transform: uppercase; font-family: 'DM Mono', monospace; margin-top: 2px;
        }

        .ac-body { padding:12px 16px 14px; display:flex; flex-direction:column; flex:1; }

        .ac-checks { list-style:none; margin:0 0 10px; padding:0; display:flex; flex-direction:column; gap:7px; flex:1; }
        .ac-check-item {
          display:flex; align-items:flex-start; gap:10px;
          font-size:10px; color:#334155; line-height:1.5;
          font-family:'DM Mono',monospace;
        }
        .ac-check-icon { font-size:11px; font-weight:700; flex-shrink:0; margin-top:1px; }

        .ac-divider { height:1px; background:#f1f5f9; margin-bottom:10px; }

        .ac-footer { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
        .ac-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 20px; background:#0a1628; color:#c9a227;
          font-family:'DM Mono',monospace; font-size:9px;
          letter-spacing:3px; text-transform:uppercase;
          text-decoration:none; border:1px solid rgba(201,162,39,0.35); cursor:pointer; font-weight:700;
          transition:background .2s, color .2s, transform .15s, box-shadow .2s;
        }
        .ac-btn:hover { background:#c9a227; color:#0a1628; transform:translateY(-2px); box-shadow: 0 6px 20px rgba(201,162,39,0.25); border-color:#c9a227; }
        .ac-btn-ghost { background:#f8fafc; color:#cbd5e1; border:1px solid #e2e8f0; cursor:default; font-weight:500; }
        .ac-btn-ghost:hover { background:#f8fafc; color:#cbd5e1; transform:none; box-shadow:none; border-color:#e2e8f0; }

        .ac-meta      { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .ac-meta-tag  {
          font-size:8px; letter-spacing:1px; color:#94a3b8;
          padding:3px 7px; background:#f1f5f9; border:1px solid #e2e8f0;
          text-transform:uppercase; font-family:'DM Mono',monospace;
        }
        .ac-meta-date { font-size:8px; color:#cbd5e1; letter-spacing:1px; font-family:'DM Mono',monospace; }

        /* Filter Tabs */
        .ac-tabs {
          display: flex; gap: 6px; margin-bottom: 28px;
          padding-bottom: 0;
        }
        .ac-tab {
          font-family: 'DM Mono', monospace;
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          background: #f1f5f9; border: 1px solid #e2e8f0;
          color: #94a3b8; padding: 9px 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex; align-items: center; gap: 7px;
        }
        .ac-tab:hover {
          background: #e8edf5;
          color: #475569;
          border-color: #cbd5e1;
        }
        .ac-tab-active {
          background: var(--tab-color, #94a3b8) !important;
          border-color: var(--tab-color, #94a3b8) !important;
          color: #fff !important;
        }
        .ac-tab-active .ac-tab-count { opacity: 0.75; }
        .ac-tab-count {
          font-size: 8px; opacity: 0.55; letter-spacing: 1px;
        }

        @media (max-width:640px) {
          .ac-grid { grid-template-columns:1fr !important; gap:14px; }
          .ac-prices { grid-template-columns:1fr 1fr; }
          .ac-price-cell:nth-child(3) { grid-column:1/-1; border-top:1px solid #f1f5f9; border-right:none; }
          .ac-footer { flex-direction:column; align-items:flex-start; }
          .ac-tabs { gap: 0; }
          .ac-tab { padding: 10px 14px; font-size: 8px; }
        }
      `}</style>

      {/* ── Filter Tabs ── */}
      <div className="ac-tabs" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={"ac-tab" + (activeTab === t.key ? " ac-tab-active" : "")}
              style={{
                '--tab-color': t.color,
              } as React.CSSProperties}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className="ac-tab-count">({counts[t.key]})</span>
            </button>
          ))}
        </div>
        <a
          href="https://finanzbot.streamlit.app"
          target="_blank"
          rel="noopener noreferrer"
          className="ac-btn"
        >
          <span>📊</span> AKTIEN ANALYSIEREN
        </a>
      </div>

      <div className="ac-grid">
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '60px 0',
            color: '#475569', fontFamily: "'DM Mono',monospace",
            fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
          }}>
            Keine Reports in dieser Kategorie
          </div>
        ) : (
          filtered.map((a, i) => (
            <AnalysisCard key={a.id} a={a} idx={i} />
          ))
        )}
      </div>
    </>
  )
}