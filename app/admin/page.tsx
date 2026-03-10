'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Analysis, Rating } from '@/lib/supabase/types'

const RATINGS: Rating[] = ['BUY', 'HOLD', 'SELL', 'WATCH']
const BADGE: Record<Rating, { color: string; bg: string }> = {
  BUY:   { color: '#4ec994', bg: 'rgba(78,201,148,0.08)' },
  SELL:  { color: '#e05555', bg: 'rgba(224,85,85,0.08)' },
  HOLD:  { color: '#a8a8f0', bg: 'rgba(168,168,240,0.08)' },
  WATCH: { color: '#c9a84c', bg: 'rgba(201,168,76,0.12)' },
}

const CATEGORIES = [
  { value: 'equity', label: 'Equity Research',    icon: '◈', desc: 'Einzelaktien · Fundamentalanalyse' },
  { value: 'geo',    label: 'Geopolitik & Märkte', icon: '◉', desc: 'Weltpolitik · Makro · Marktauswirkungen' },
  { value: 'crypto', label: 'Digital Assets',      icon: '⬡', desc: 'Krypto · Blockchain · Web3' },
]
const CATEGORY_COLORS: Record<string, string> = {
  equity: '#c9a227',
  geo:    '#38bdf8',
  crypto: '#f97316',
}

const SECTORS = [
  { value: 'Technologie',                label: 'Technologie' },
  { value: 'Software & IT',              label: 'Software & IT' },
  { value: 'Halbleiter',                 label: 'Halbleiter' },
  { value: 'Automobil & OEM',            label: 'Automobil & OEM' },
  { value: 'Autovermietung & Mobilität', label: 'Autovermietung & Mobilität' },
  { value: 'Versicherung',               label: 'Versicherung' },
  { value: 'Banken & Finanzen',          label: 'Banken & Finanzen' },
  { value: 'Immobilien',                 label: 'Immobilien' },
  { value: 'Energie & Utilities',        label: 'Energie & Utilities' },
  { value: 'Erneuerbare Energien',       label: 'Erneuerbare Energien' },
  { value: 'Pharma & Biotech',           label: 'Pharma & Biotech' },
  { value: 'Medizintechnik',             label: 'Medizintechnik' },
  { value: 'Konsumgüter & Handel',       label: 'Konsumgüter & Handel' },
  { value: 'Lebensmittel & Getränke',    label: 'Lebensmittel & Getränke' },
  { value: 'Industrie & Maschinenbau',   label: 'Industrie & Maschinenbau' },
  { value: 'Chemie & Werkstoffe',        label: 'Chemie & Werkstoffe' },
  { value: 'Telekommunikation',          label: 'Telekommunikation' },
  { value: 'Medien & Entertainment',     label: 'Medien & Entertainment' },
  { value: 'Transport & Logistik',       label: 'Transport & Logistik' },
  { value: 'Luft- & Raumfahrt',          label: 'Luft- & Raumfahrt' },
  { value: 'Rüstung & Defense',          label: 'Rüstung & Defense' },
  { value: 'Rohstoffe & Bergbau',        label: 'Rohstoffe & Bergbau' },
  { value: 'E-Commerce & Plattformen',   label: 'E-Commerce & Plattformen' },
  { value: 'Luxury & Fashion',           label: 'Luxury & Fashion' },
  { value: 'Gaming & Esports',           label: 'Gaming & Esports' },
  { value: 'Künstliche Intelligenz',     label: 'Künstliche Intelligenz' },
  { value: 'Krypto & Blockchain',        label: 'Krypto & Blockchain' },
  { value: 'Agrar & Forst',             label: 'Agrar & Forst' },
  { value: 'Sonstiges',                  label: 'Sonstiges' },
]

const GEO_TOPICS = [
  'USA & Fed-Politik', 'Europa & EZB', 'China & Asien', 'Naher Osten',
  'Russland & Ukraine', 'NATO & Verteidigung', 'Handelskrieg & Zölle',
  'Rohstoff-Geopolitik', 'Währungskrisen', 'Sanktionen & Embargos',
  'Globale Lieferketten', 'Energiesicherheit', 'Sonstiges',
]

const CRYPTO_TOPICS = [
  'Bitcoin (BTC)', 'Ethereum (ETH)', 'Layer 1 Protokolle', 'Layer 2 & Scaling',
  'DeFi & DEX', 'NFT & Gaming', 'Stablecoins', 'Krypto-Regulierung',
  'Institutional Adoption', 'Mining & Infrastruktur', 'Web3 & Metaverse',
  'Altcoins & Small Caps', 'Sonstiges',
]

// Top 20 Coins mit Logo-URLs (atomic icons CDN)
const CRYPTO_COINS: { label: string; symbol: string; logo: string }[] = [
  { label: 'Bitcoin',     symbol: 'BTC',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/btc.png' },
  { label: 'Ethereum',    symbol: 'ETH',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/eth.png' },
  { label: 'Tether',      symbol: 'USDT', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdt.png' },
  { label: 'BNB',         symbol: 'BNB',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/bnb.png' },
  { label: 'Solana',      symbol: 'SOL',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/sol.png' },
  { label: 'XRP',         symbol: 'XRP',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/xrp.png' },
  { label: 'USD Coin',    symbol: 'USDC', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/usdc.png' },
  { label: 'Dogecoin',    symbol: 'DOGE', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/doge.png' },
  { label: 'Cardano',     symbol: 'ADA',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/ada.png' },
  { label: 'TRON',        symbol: 'TRX',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/trx.png' },
  { label: 'Avalanche',   symbol: 'AVAX', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/avax.png' },
  { label: 'Polkadot',    symbol: 'DOT',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/dot.png' },
  { label: 'Chainlink',   symbol: 'LINK', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/link.png' },
  { label: 'Polygon',     symbol: 'POL',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/matic.png' },
  { label: 'Litecoin',    symbol: 'LTC',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/ltc.png' },
  { label: 'Shiba Inu',   symbol: 'SHIB', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/shib.png' },
  { label: 'Uniswap',     symbol: 'UNI',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/uni.png' },
  { label: 'Stellar',     symbol: 'XLM',  logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/xlm.png' },
  { label: 'Cosmos',      symbol: 'ATOM', logo: 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/128/color/atom.png' },
  { label: 'Sui',         symbol: 'SUI',  logo: 'https://assets.coingecko.com/coins/images/26375/small/sui-ocean-square.png' },
  // Themen-Kategorien (behalten)
  { label: 'Layer 1 Protokolle',    symbol: 'L1',   logo: '' },
  { label: 'Layer 2 & Scaling',     symbol: 'L2',   logo: '' },
  { label: 'DeFi & DEX',            symbol: 'DEFI', logo: '' },
  { label: 'NFT & Gaming',          symbol: 'NFT',  logo: '' },
  { label: 'Stablecoins',           symbol: 'STBL', logo: '' },
  { label: 'Krypto-Regulierung',    symbol: 'REG',  logo: '' },
  { label: 'Institutional Adoption',symbol: 'INST', logo: '' },
  { label: 'Mining & Infrastruktur',symbol: 'MINE', logo: '' },
  { label: 'Web3 & Metaverse',      symbol: 'WEB3', logo: '' },
  { label: 'Altcoins & Small Caps', symbol: 'ALT',  logo: '' },
  { label: 'Sonstiges',             symbol: '—',    logo: '' },
]

type FormData = {
  ticker: string; title: string; description: string
  rating: Rating; sector: string; analyst: string
  current_price: string; price_target: string; category: string
}

// Extended Analysis type with versioning fields
type VersionedAnalysis = Analysis & {
  version?: number
  archived?: boolean
  parent_id?: string | null
}

const EMPTY_FORM: FormData = {
  ticker: '', title: '', description: '', rating: 'BUY',
  sector: SECTORS[0].value, analyst: '', current_price: '', price_target: '',
  category: 'equity',
}

// ── Manage List with Filter Tabs ──────────────────────────────────────────────
function ManageList({ analyses, onEdit, onToggle, onDelete, onNewVersion, showArchived, onToggleArchived, onRestore }: {
  analyses: Analysis[]
  onEdit: (a: Analysis) => void
  onToggle: (a: Analysis) => void
  onDelete: (a: Analysis) => void
  onNewVersion: (a: Analysis) => void
  showArchived: boolean
  onToggleArchived: () => void
  onRestore: (a: Analysis) => void
}) {
  const [filter, setFilter] = useState<'all' | 'equity' | 'geo' | 'crypto'>('all')

  const active   = analyses.filter(a => !(a as any).archived)
  const archived = analyses.filter(a =>  (a as any).archived)
  const visible  = showArchived ? archived : active

  const counts = {
    all:    visible.length,
    equity: visible.filter(a => ((a as any).category ?? 'equity') === 'equity').length,
    geo:    visible.filter(a => ((a as any).category ?? 'equity') === 'geo').length,
    crypto: visible.filter(a => ((a as any).category ?? 'equity') === 'crypto').length,
  }

  const filtered = filter === 'all'
    ? visible
    : visible.filter(a => ((a as any).category ?? 'equity') === filter)

  const FILTER_TABS = [
    { key: 'all'    as const, label: 'ALLE',            color: 'var(--text-dim)' },
    { key: 'equity' as const, label: 'EQUITY RESEARCH', color: '#c9a227' },
    { key: 'geo'    as const, label: 'GEOPOLITIK',      color: '#38bdf8' },
    { key: 'crypto' as const, label: 'DIGITAL ASSETS',  color: '#f97316' },
  ]

  return (
    <div>
      {/* Archive toggle header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
          {showArchived ? `${archived.length} Archivierte Analysen` : `${active.length} Aktive Analysen`}
        </div>
        <button onClick={onToggleArchived} style={{
          fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
          background: showArchived ? 'rgba(201,162,39,0.1)' : 'transparent',
          border: `1px solid ${showArchived ? 'var(--gold)' : 'var(--border)'}`,
          color: showArchived ? 'var(--gold)' : 'var(--text-dim)',
          padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase',
        }}>
          {showArchived ? '← AKTIVE ANZEIGEN' : `ARCHIV (${archived.length})`}
        </button>
      </div>

      <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {FILTER_TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 2,
            background: 'transparent', border: 'none',
            borderBottom: filter === t.key ? `2px solid ${t.color}` : '2px solid transparent',
            color: filter === t.key ? t.color : 'var(--text-dim)',
            padding: '12px 22px', cursor: 'pointer', textTransform: 'uppercase',
            marginBottom: -1, transition: 'all 0.2s',
          }}>
            {t.label}
            <span style={{ marginLeft: 7, fontSize: 8, opacity: 0.6 }}>({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>
          {showArchived ? 'Keine archivierten Analysen' : 'Keine Reports in dieser Kategorie'}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)' }}>
          {filtered.map((a, i) => {
            const b   = BADGE[a.rating] || BADGE.WATCH
            const cat = (a as any).category ?? 'equity'
            const cc  = CATEGORY_COLORS[cat] ?? '#c9a227'
            const ver = (a as any).version ?? 1
            const isArchived = (a as any).archived
            return (
              <div key={a.id} className="row-hover" style={{
                display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.2s',
                opacity: isArchived ? 0.6 : 1,
              }}>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', letterSpacing: 2, minWidth: 80 }}>
                  {a.ticker}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {new Date(a.created_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {cat === 'equity' && <><span>·</span><span style={{ color: b.color }}>{a.rating}</span></>}
                    <span>·</span>
                    <span style={{ color: cc, fontSize: 9, letterSpacing: 1, padding: '1px 6px', border: `1px solid ${cc}44` }}>
                      {CATEGORIES.find(c => c.value === cat)?.label ?? cat}
                    </span>
                    {ver > 1 && (
                      <span style={{ fontSize: 9, letterSpacing: 1, padding: '1px 6px', border: '1px solid rgba(201,162,39,0.3)', color: 'var(--gold)', background: 'rgba(201,162,39,0.06)' }}>
                        v{ver}
                      </span>
                    )}
                    {isArchived && (
                      <span style={{ fontSize: 9, letterSpacing: 1, padding: '1px 6px', border: '1px solid rgba(148,163,184,0.3)', color: '#94a3b8' }}>
                        ARCHIVIERT
                      </span>
                    )}
                {isArchived && (
                  <button onClick={() => onRestore(a)} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    padding: '6px 14px', border: '1px solid rgba(34,197,94,0.35)',
                    color: '#22c55e', background: 'rgba(34,197,94,0.06)',
                    cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.15)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.06)' }}
                  >
                    ↺ RESTORE
                  </button>
                )}
                    {a.sector && <><span>·</span><span>{a.sector}</span></>}
                    <span>{a.pdf_path ? '· PDF ✓' : '· No PDF'}</span>
                  </div>
                </div>

                {!isArchived && (
                  <button className="btn-edit" onClick={() => onEdit(a)} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    padding: '6px 14px', border: '1px solid var(--border)',
                    color: 'var(--text-dim)', background: 'transparent',
                    cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>EDIT</button>
                )}

                {!isArchived && (
                  <button onClick={() => onNewVersion(a)} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    padding: '6px 14px', border: '1px solid rgba(201,162,39,0.35)',
                    color: 'var(--gold)', background: 'rgba(201,162,39,0.06)',
                    cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.15)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.06)' }}
                  >
                    + VERSION
                  </button>
                )}

                {!isArchived && (
                  <button onClick={() => onToggle(a)} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    padding: '6px 14px', border: `1px solid ${a.published ? 'var(--green)' : 'var(--border)'}`,
                    color: a.published ? 'var(--green)' : 'var(--text-dim)',
                    background: a.published ? 'rgba(78,201,148,0.08)' : 'transparent',
                    cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>
                    {a.published ? 'LIVE' : 'DRAFT'}
                  </button>
                )}

                <button onClick={() => onDelete(a)} style={{
                  fontFamily: 'DM Mono, monospace', fontSize: 9,
                  background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                  padding: '6px 12px', cursor: 'pointer',
                }}
                  onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--red)'; (e.target as any).style.color = 'var(--red)' }}
                  onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
                >DEL</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Custom Crypto Coin Selector ───────────────────────────────────────────────
function CryptoSelect({ value, onChange, borderColor }: {
  value: string
  onChange: (val: string) => void
  borderColor: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = CRYPTO_COINS.find(c => `${c.label} (${c.symbol})` === value || c.label === value) ?? CRYPTO_COINS[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayValue = selected.symbol.length <= 4 && !['L1','L2','DEFI','NFT','STBL','REG','INST','MINE','WEB3','ALT','—'].includes(selected.symbol)
    ? `${selected.label} (${selected.symbol})`
    : selected.label

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'DM Mono, monospace', fontSize: 12,
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? borderColor : 'var(--border)'}`,
          color: 'var(--text)', padding: '12px 16px', cursor: 'pointer',
          textAlign: 'left', transition: 'border-color 0.2s',
        }}
      >
        {selected.logo
          ? <img src={selected.logo} alt={selected.symbol} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          : <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#f97316', flexShrink: 0 }}>⬡</span>
        }
        <span style={{ flex: 1 }}>{displayValue}</span>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: '#0d1220', border: `1px solid ${borderColor}`,
          borderTop: 'none', maxHeight: 320, overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}>
          {/* Coins section */}
          <div style={{ padding: '8px 12px 4px', fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
            Top 20 Coins
          </div>
          {CRYPTO_COINS.filter(c => c.logo).map(coin => {
            const val = `${coin.label} (${coin.symbol})`
            const isActive = displayValue === val
            return (
              <button key={coin.symbol} type="button"
                onClick={() => { onChange(val); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: isActive ? '#f97316' : 'var(--text)', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontSize: 11, textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <img src={coin.logo} alt={coin.symbol} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0 }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <span style={{ flex: 1 }}>{coin.label}</span>
                <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>{coin.symbol}</span>
              </button>
            )
          })}
          {/* Themen section */}
          <div style={{ padding: '8px 12px 4px', fontSize: 8, letterSpacing: 2, color: 'var(--text-dim)', textTransform: 'uppercase', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            Themenbereiche
          </div>
          {CRYPTO_COINS.filter(c => !c.logo).map(coin => {
            const isActive = selected.label === coin.label
            return (
              <button key={coin.symbol} type="button"
                onClick={() => { onChange(coin.label); setOpen(false) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 14px', background: isActive ? 'rgba(249,115,22,0.08)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: isActive ? '#f97316' : 'var(--text)', cursor: 'pointer',
                  fontFamily: 'DM Mono, monospace', fontSize: 11, textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#f97316', flexShrink: 0 }}>⬡</span>
                <span>{coin.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const router   = useRouter()
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [analyses, setAnalyses]   = useState<Analysis[]>([])
  const [form, setForm]           = useState<FormData>(EMPTY_FORM)
  const [pdfFile, setPdfFile]     = useState<File | null>(null)
  const [drag, setDrag]           = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [tab, setTab]             = useState<'upload' | 'manage'>('upload')
  const [userEmail, setUserEmail] = useState('')

  const [editId, setEditId]                   = useState<string | null>(null)
  const [existingPdfPath, setExistingPdfPath] = useState<string | null>(null)
  const [existingPdfName, setExistingPdfName] = useState<string | null>(null)
  const [replacePdf, setReplacePdf]           = useState(false)
  const [versionParentId, setVersionParentId] = useState<string | null>(null)
  const [showArchived, setShowArchived]       = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      setUserEmail(user.email || '')
    })
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    const { data } = await (supabase as any)
      .from('analyses').select('*').order('created_at', { ascending: false })
    if (data) setAnalyses(data as Analysis[])
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') { showToast('ONLY PDF FILES ACCEPTED', false); return }
    if (file.size > 50 * 1024 * 1024)   { showToast('FILE TOO LARGE (MAX 50MB)', false); return }
    setPdfFile(file)
  }, [])

  function startEdit(a: Analysis) {
    setEditId(a.id)
    setExistingPdfPath(a.pdf_path ?? null)
    setExistingPdfName(a.pdf_name ?? null)
    setReplacePdf(false); setPdfFile(null)
    setForm({
      ticker:        a.ticker,
      title:         a.title,
      description:   a.description ?? '',
      rating:        a.rating,
      sector:        a.sector ?? SECTORS[0].value,
      analyst:       a.analyst ?? '',
      current_price: a.current_price != null ? String(a.current_price) : '',
      price_target:  a.price_target  != null ? String(a.price_target)  : '',
      category:      (a as any).category ?? 'equity',
    })
    setTab('upload')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditId(null); setExistingPdfPath(null); setExistingPdfName(null)
    setReplacePdf(false); setPdfFile(null); setForm(EMPTY_FORM)
    setVersionParentId(null)
  }

  function startNewVersion(a: VersionedAnalysis) {
    // Pre-fill form with current analysis data
    setEditId(null) // not editing, creating new
    setVersionParentId(a.id)
    setExistingPdfPath(null); setExistingPdfName(null)
    setReplacePdf(false); setPdfFile(null)
    setForm({
      ticker:        a.ticker,
      title:         a.title,
      description:   a.description ?? '',
      rating:        a.rating,
      sector:        a.sector ?? SECTORS[0].value,
      analyst:       a.analyst ?? '',
      current_price: a.current_price != null ? String(a.current_price) : '',
      price_target:  a.price_target  != null ? String(a.price_target)  : '',
      category:      (a as any).category ?? 'equity',
    })
    setTab('upload')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast('✎ NEUE VERSION — Formular vorausgefüllt. Änderungen vornehmen und publizieren.')
  }

  async function handleSave(publish: boolean) {
    if (!form.ticker.trim() || !form.title.trim()) {
      showToast('TICKER & TITLE ARE REQUIRED', false); return
    }
    setSaving(true)

    let pdf_path = existingPdfPath
    let pdf_name = existingPdfName

    if (pdfFile && (!editId || replacePdf)) {
      if (editId && existingPdfPath) {
        await supabase.storage.from('analyses-pdfs').remove([existingPdfPath])
      }
      const ext  = pdfFile.name.split('.').pop()
      const path = `${Date.now()}_${form.ticker.toUpperCase()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('analyses-pdfs').upload(path, pdfFile, { cacheControl: '3600', upsert: false })
      if (uploadError) { showToast(`UPLOAD FAILED: ${uploadError.message}`, false); setSaving(false); return }
      pdf_path = path; pdf_name = pdfFile.name
    }

    const payload = {
      ticker:        form.ticker.toUpperCase().trim(),
      title:         form.title.trim(),
      description:   form.description.trim() || null,
      rating:        form.category === 'geo' ? ('WATCH' as Rating) : form.rating,
      sector:        form.sector || null,
      analyst:       form.analyst.trim() || null,
      current_price: form.current_price ? parseFloat(form.current_price) : null,
      price_target:  form.price_target  ? parseFloat(form.price_target)  : null,
      category:      form.category,
      pdf_path, pdf_name, published: publish,
    }

    let error: any = null
    if (editId) {
      ;({ error } = await (supabase as any).from('analyses').update(payload).eq('id', editId))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      // Calculate version number
      let version = 1
      let parent_id = versionParentId ?? null
      if (versionParentId) {
        // Find the current version number of parent
        const parent = analyses.find(a => a.id === versionParentId) as VersionedAnalysis | undefined
        version = (parent?.version ?? 1) + 1
      }
      const { error: insertError } = await (supabase as any).from('analyses').insert({
        ...payload, author_id: user?.id ?? null, version, parent_id,
      })
      error = insertError
      // Archive the parent analysis
      if (!insertError && versionParentId) {
        await (supabase as any).from('analyses')
          .update({ archived: true, published: false })
          .eq('id', versionParentId)
        showToast(`✓ VERSION ${version} PUBLIZIERT — Alte Version archiviert`)
        setVersionParentId(null)
        cancelEdit(); loadAnalyses(); setTab('manage')
        setSaving(false); return
      }
    }

    if (error) {
      showToast(`ERROR: ${error.message}`, false)
    } else {
      showToast(editId
        ? (publish ? '✓ CHANGES PUBLISHED' : '✓ DRAFT UPDATED')
        : (publish ? '✓ PUBLISHED LIVE' : '✓ SAVED AS DRAFT'))
      cancelEdit(); loadAnalyses(); setTab('manage')
    }
    setSaving(false)
  }

  async function togglePublish(a: Analysis) {
    const { error } = await (supabase as any)
      .from('analyses').update({ published: !a.published }).eq('id', a.id)
    if (!error) {
      setAnalyses(prev => prev.map(x => x.id === a.id ? { ...x, published: !x.published } : x))
      showToast(!a.published ? '✓ PUBLISHED' : '✓ SET TO DRAFT')
    }
  }

  async function deleteAnalysis(a: Analysis) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return
    if (a.pdf_path) await supabase.storage.from('analyses-pdfs').remove([a.pdf_path])
    const { error } = await (supabase as any).from('analyses').delete().eq('id', a.id)
    if (!error) {
      setAnalyses(prev => prev.filter(x => x.id !== a.id))
      if (editId === a.id) cancelEdit()
      showToast('✓ DELETED')
    }
  }

  async function restoreAnalysis(a: Analysis) {
    const { error } = await (supabase as any)
      .from('analyses')
      .update({ archived: false, published: false })
      .eq('id', a.id)
    if (!error) {
      setAnalyses(prev => prev.map(x => x.id === a.id ? { ...x, archived: false, published: false } : x))
      showToast('✓ WIEDERHERGESTELLT — als Draft gesetzt')
    }
  }

  async function logout() { await supabase.auth.signOut(); router.replace('/') }

  const F = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: 'DM Mono, monospace', fontSize: 12,
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '14px 16px', outline: 'none',
  }

  const isEquity  = form.category === 'equity' || form.category === 'crypto'
  const catColor  = CATEGORY_COLORS[form.category] ?? '#c9a227'
  const activeCat = CATEGORIES.find(c => c.value === form.category) ?? CATEGORIES[0]

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none }
        .row-hover:hover { background: rgba(255,255,255,0.03) !important; }
        .focus-gold:focus { border-color: var(--gold) !important; }
        .btn-edit:hover { border-color: var(--gold) !important; color: var(--gold) !important; }
        .cat-btn { transition: all .2s ease; }
        .cat-btn:hover { opacity: 1 !important; }
        select option { background: #0d1220; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, opacity: 0.025, zIndex: 0, backgroundImage: 'linear-gradient(var(--gold) 1px,transparent 1px),linear-gradient(90deg,var(--gold) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', animation: 'fadeIn 0.4s ease' }}>

        {/* NAV */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--border)', background: 'rgba(8,13,26,0.97)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 4, color: 'var(--gold)' }}>ALPHA DESK</div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', border: '1px solid var(--border)', padding: '4px 10px' }}>ADMIN CONSOLE</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{userEmail}</span>
            <a href="/" style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)', textDecoration: 'none', padding: '6px 14px', border: '1px solid var(--border)', textTransform: 'uppercase' }}>← SITE</a>
            <button onClick={logout} style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 2, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase' }}
              onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--red)'; (e.target as any).style.color = 'var(--red)' }}
              onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
            >LOGOUT</button>
          </div>
        </nav>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 48px' }}>

          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 30, height: 1, background: 'var(--gold)' }} />
              ADMIN PANEL
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, lineHeight: 0.95 }}>
              Manage <em style={{ fontStyle: 'italic', color: 'var(--gold2)' }}>Research</em>
            </h1>
          </div>

          {/* MAIN TABS */}
          <div style={{ display: 'flex', marginBottom: 48, borderBottom: '1px solid var(--border)' }}>
            {(['upload', 'manage'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); if (t === 'manage') cancelEdit() }} style={{
                fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3,
                background: 'transparent', border: 'none',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
                padding: '14px 28px', cursor: 'pointer', textTransform: 'uppercase', marginBottom: -1,
              }}>
                {t === 'upload' ? (editId ? '✎ EDIT ANALYSIS' : '+ NEW ANALYSIS') : `MANAGE (${analyses.length})`}
              </button>
            ))}
          </div>

          {/* UPLOAD / EDIT FORM */}
          {tab === 'upload' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>

              {/* New Version Banner */}
              {versionParentId && (
                <div style={{
                  marginBottom: 28,
                  padding: '16px 24px',
                  border: '1px solid rgba(201,162,39,0.4)',
                  background: 'rgba(201,162,39,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 4 }}>
                      ✎ NEUE VERSION
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1 }}>
                      Formular vorausgefüllt · Änderungen vornehmen · Beim Publizieren wird die alte Version automatisch archiviert
                    </div>
                  </div>
                  <button onClick={cancelEdit} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase',
                  }}>✕ ABBRECHEN</button>
                </div>
              )}

              {editId && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', marginBottom: 32, border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.06)' }}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>✎ EDITING — {form.ticker}</span>
                  <button onClick={() => { cancelEdit(); setTab('manage') }} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase' }}
                    onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--red)'; (e.target as any).style.color = 'var(--red)' }}
                    onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
                  >✕ CANCEL</button>
                </div>
              )}

              {/* Kategorie Auswahl */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>Report Kategorie</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {CATEGORIES.map(cat => {
                    const active = form.category === cat.value
                    const color  = CATEGORY_COLORS[cat.value]
                    return (
                      <button key={cat.value} className="cat-btn"
                        onClick={() => setForm(f => ({ ...f, category: cat.value, sector: cat.value === 'equity' ? SECTORS[0].value : cat.value === 'crypto' ? 'Bitcoin (BTC)' : GEO_TOPICS[0] }))}
                        style={{ fontFamily: 'DM Mono, monospace', padding: '18px 20px', border: `1px solid ${active ? color : 'var(--border)'}`, background: active ? `${color}12` : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', opacity: active ? 1 : 0.55 }}>
                        <div style={{ fontSize: 18, marginBottom: 8, color }}>{cat.icon}</div>
                        <div style={{ fontSize: 11, letterSpacing: 2, color: active ? color : 'var(--text)', textTransform: 'uppercase', marginBottom: 4 }}>{cat.label}</div>
                        <div style={{ fontSize: 8, letterSpacing: 1, color: 'var(--text-dim)' }}>{cat.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* PDF Drop Zone */}
              {editId && existingPdfName && !replacePdf ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', padding: '24px 28px', marginBottom: 40 }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8 }}>CURRENT PDF</div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 300 }}>{existingPdfName}</div>
                  </div>
                  <button onClick={() => setReplacePdf(true)} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '10px 18px', cursor: 'pointer', textTransform: 'uppercase' }}
                    onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--gold)'; (e.target as any).style.color = 'var(--gold)' }}
                    onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
                  >↑ REPLACE PDF</button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
                  style={{ border: `2px dashed ${drag ? catColor : 'var(--border)'}`, background: drag ? `${catColor}10` : 'rgba(255,255,255,0.02)', padding: '56px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', marginBottom: 40 }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14, color: catColor, opacity: drag ? 1 : 0.7 }}>{activeCat.icon}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 300, marginBottom: 8 }}>
                    {pdfFile ? pdfFile.name : 'Drop PDF here or click to browse'}
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB — PDF READY` : 'PDF format · Max 50MB'}
                  </div>
                  {editId && replacePdf && (
                    <button onClick={e => { e.stopPropagation(); setReplacePdf(false); setPdfFile(null) }}
                      style={{ marginTop: 16, fontFamily: 'DM Mono, monospace', fontSize: 9, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase' }}
                    >✕ KEEP EXISTING PDF</button>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
              )}

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>{isEquity ? 'Ticker Symbol *' : 'Kürzel / ID *'}</label>
                  <input value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))} className="focus-gold" placeholder={isEquity ? 'AAPL' : 'GEO-001'} style={inputStyle} />
                </div>

                {isEquity && (
                  <div>
                    <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Rating</label>
                    <select {...F('rating')} className="focus-gold" style={{ ...inputStyle, cursor: 'pointer' }}>
                      {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Report Title *</label>
                  <input {...F('title')} className="focus-gold" placeholder={isEquity ? 'e.g. AAPL — Structural Rerating Incoming' : 'e.g. Zollkrieg 2025 — Auswirkungen auf europäische Märkte'} style={inputStyle} />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Short Description</label>
                  <textarea {...F('description')} className="focus-gold" rows={3} placeholder={isEquity ? 'Brief overview of the investment thesis...' : 'Kurze Zusammenfassung der geopolitischen Situation und Marktrelevanz...'} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>{isEquity ? 'Sektor' : 'Themenbereich'}</label>
                  {form.category === 'crypto' ? (
                    <CryptoSelect
                      value={form.sector}
                      onChange={val => setForm(f => ({ ...f, sector: val }))}
                      borderColor={catColor}
                    />
                  ) : (
                  <select {...F('sector')} className="focus-gold" style={{ ...inputStyle, cursor: 'pointer' }}>
                    {form.category === 'equity'
                      ? SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)
                      : GEO_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Analyst</label>
                  <input {...F('analyst')} className="focus-gold" placeholder="G. Stephan" style={inputStyle} />
                </div>

                {isEquity && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Current Price</label>
                      <input {...F('current_price')} className="focus-gold" placeholder="189.42" type="number" step="0.01" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Price Target</label>
                      <input {...F('price_target')} className="focus-gold" placeholder="220.00" type="number" step="0.01" style={inputStyle} />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button onClick={() => handleSave(false)} disabled={saving} style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: 3, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)', padding: '16px 32px', cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'uppercase' }}>
                  {editId ? 'SAVE AS DRAFT' : 'SAVE DRAFT'}
                </button>
                <button onClick={() => handleSave(true)} disabled={saving} style={{ flex: 1, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: 3, background: saving ? `${catColor}66` : catColor, border: 'none', color: 'var(--bg)', padding: '16px 40px', cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'uppercase', transition: 'all 0.3s' }}>
                  {saving ? 'SAVING...' : editId ? 'UPDATE & PUBLISH →' : 'PUBLISH NOW →'}
                </button>
              </div>
            </div>
          )}

          {/* MANAGE TAB */}
          {tab === 'manage' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {analyses.length === 0 ? (
                <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 20 }}>◈</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 300 }}>No analyses yet</div>
                </div>
              ) : (
                <ManageList
                  analyses={analyses}
                  onEdit={startEdit}
                  onToggle={togglePublish}
                  onDelete={deleteAnalysis}
                  onNewVersion={startNewVersion}
                  showArchived={showArchived}
                  onToggleArchived={() => setShowArchived(s => !s)}
                  onRestore={restoreAnalysis}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 40, right: 40, zIndex: 300, background: 'var(--bg2)', border: `1px solid ${toast.ok ? 'var(--gold)' : 'var(--red)'}`, padding: '16px 28px', fontSize: 11, letterSpacing: 2, color: toast.ok ? 'var(--gold)' : 'var(--red)', animation: 'toastIn 0.3s ease', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}