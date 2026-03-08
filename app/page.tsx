'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Analysis, Rating } from '@/lib/supabase/types'

const BADGE: Record<string, { color: string; bg: string }> = {
  BUY:   { color: '#fff', bg: '#27ae60' },
  SELL:  { color: '#fff', bg: '#e05555' },
  HOLD:  { color: '#fff', bg: '#c9a227' },
  WATCH: { color: '#fff', bg: '#c9a84c' },
}

const SECTOR_IMAGES: Record<string, string> = {
  'Technologie':               'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  'Software & IT':             'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
  'Halbleiter':                'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  'Automobil & OEM':           'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
  'Autovermietung & Mobilität':'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80',
  'Versicherung':              'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
  'Banken & Finanzen':         'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
  'Immobilien':                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
  'Energie & Utilities':       'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
  'Erneuerbare Energien':      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
  'Pharma & Biotech':          'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
  'Medizintechnik':            'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&q=80',
  'Konsumgüter & Handel':      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
  'Lebensmittel & Getränke':   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
  'Industrie & Maschinenbau':  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
  'Chemie & Werkstoffe':       'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80',
  'Telekommunikation':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'Medien & Entertainment':    'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600&q=80',
  'Transport & Logistik':      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80',
  'Luft- & Raumfahrt':         'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80',
  'Rüstung & Defense':         'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&q=80',
  'Rohstoffe & Bergbau':       'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
  'Luxury & Fashion':          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  'Künstliche Intelligenz':    'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
  'Krypto & Blockchain':       'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=600&q=80',
  'default':                   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
}

function getSectorImage(sector: string | null): string {
  if (!sector) return SECTOR_IMAGES['default']
  return SECTOR_IMAGES[sector] ?? SECTOR_IMAGES['default']
}

export default function HomePage() {
  const supabase = createClient()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await (supabase as any)
        .from('analyses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (data) setAnalyses(data as Analysis[])
      setLoading(false)
    }
    load()
  }, [])

  async function openPdf(a: Analysis) {
    if (!a.pdf_path) return
    const { data } = await supabase.storage
      .from('analyses-pdfs')
      .createSignedUrl(a.pdf_path, 60 * 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const buyCount  = analyses.filter(a => a.rating === 'BUY').length
  const holdCount = analyses.filter(a => a.rating === 'HOLD').length
  const sellCount = analyses.filter(a => a.rating === 'SELL').length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Mono:wght@300;400&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; color: #1a1a2e; font-family: 'Lato', sans-serif; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .card-wrap {
          background: #fff; border-radius: 2px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          animation: fadeUp 0.5s ease both;
        }
        .card-wrap:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,0,0,0.13); }
        .report-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #1a1a2e; color: #fff;
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px;
          padding: 11px 18px; border: none; cursor: pointer;
          text-transform: uppercase; transition: background 0.2s; width: 100%;
        }
        .report-btn:hover { background: #c9a227; }
        .report-btn-soon {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; color: #bbb;
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px;
          padding: 11px 18px; border: 1px solid #e8e8e8; cursor: default;
          text-transform: uppercase; width: 100%;
        }
        .nav-admin {
          font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px;
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.5); padding: 6px 16px; cursor: pointer;
          text-transform: uppercase; text-decoration: none; transition: all 0.2s;
        }
        .nav-admin:hover { border-color: #c9a227; color: #c9a227; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: 'linear-gradient(180deg,#0f1629 0%,#131d35 100%)', borderBottom: '2px solid #c9a227' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 40px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ width: 100 }} />
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 400, color: '#fff', letterSpacing: 3 }}>
            Alpha<span style={{ color: '#c9a227' }}>Desk</span>
          </div>
          <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>
            <a href="/admin" className="nav-admin">ADMIN</a>
          </div>
        </div>

        {/* Sub nav */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '9px 40px' }}>
          <span style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            RESEARCH ANALYSEN
          </span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '48px 40px 52px', animation: 'fadeUp 0.6s ease' }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: 'rgba(201,162,39,0.75)', marginBottom: 18, textTransform: 'uppercase' }}>
            INSTITUTIONAL  EQUITY  RESEARCH
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 52, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
            Equity Analysis &amp;&nbsp;
            <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Market Intelligence</em>
          </h1>
          <div style={{ width: 56, height: 2, background: '#c9a227', margin: '0 auto 18px' }} />
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
            PROFESSIONAL RESEARCH · INDEPENDENT ANALYSIS
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
          {[
            { n: loading ? '—' : String(analyses.length), label: 'Total Reports',  dot: null       },
            { n: loading ? '—' : String(buyCount),         label: 'Buy Ratings',    dot: '#4ec994'  },
            { n: loading ? '—' : String(holdCount),        label: 'Hold Ratings',   dot: '#c9a84c'  },
            { n: loading ? '—' : String(sellCount),        label: 'Sell Ratings',   dot: '#e05555'  },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '22px 40px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: '#e8e6e0', lineHeight: 1 }}>{s.n}</span>
                {s.dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block', marginBottom: 3 }} />}
              </div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 40px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 400 }}>Published Reports</h2>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 2, color: '#999', textTransform: 'uppercase' }}>
            ({analyses.length} AVAILABLE)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#aaa', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3 }}>LOADING...</div>
        ) : analyses.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#aaa' }}>No reports published yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {analyses.map((a, i) => {
              const badge  = BADGE[a.rating] ?? BADGE.WATCH
              const upside = a.current_price && a.price_target
                ? (((a.price_target - a.current_price) / a.current_price) * 100).toFixed(1)
                : null
              const hasPdf = !!a.pdf_path

              return (
                <div key={a.id} className="card-wrap" style={{ animationDelay: `${i * 0.07}s` }}>

                  {/* Cover */}
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                    <img src={getSectorImage(a.sector ?? null)} alt={a.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(10,15,35,0.88) 0%,rgba(10,15,35,0.05) 55%)' }} />

                    {/* Sector tag */}
                    <div style={{ position: 'absolute', top: 10, left: 10, fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: 2, background: 'rgba(10,15,35,0.72)', color: 'rgba(255,255,255,0.65)', padding: '3px 8px', textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
                      EQUITY
                    </div>

                    {/* Rating badge */}
                    <div style={{ position: 'absolute', top: 10, right: 10, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 1, background: badge.bg, color: badge.color, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 7 }}>▲</span>{a.rating}
                    </div>

                    {/* Title */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, fontWeight: 400, color: '#fff', lineHeight: 1.3, marginBottom: 3 }}>{a.title}</div>
                      {a.sector && <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>{a.sector}</div>}
                    </div>
                  </div>

                  {/* Prices */}
                  <div style={{ padding: '14px 16px 0' }}>
                    {(a.current_price || a.price_target || upside) && (
                      <div style={{ display: 'flex', gap: 20, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f2f2f2' }}>
                        {a.current_price && (
                          <div>
                            <div style={{ fontSize: 8, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>KURS</div>
                            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#1a1a2e' }}>
                              €{a.current_price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        )}
                        {a.price_target && (
                          <div>
                            <div style={{ fontSize: 8, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>ZIEL</div>
                            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#c9a227' }}>
                              €{a.price_target.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        )}
                        {upside && (
                          <div>
                            <div style={{ fontSize: 8, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>UPSIDE</div>
                            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: parseFloat(upside) >= 0 ? '#27ae60' : '#e05555' }}>
                              {parseFloat(upside) >= 0 ? '+' : ''}{upside}%
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bullets */}
                    <div style={{ marginBottom: 14 }}>
                      {[
                        a.price_target
                          ? `${a.rating} Rating · Kursziel €${a.price_target.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
                          : `${a.rating} Rating`,
                        upside ? `Upside-Potenzial: ${parseFloat(upside) >= 0 ? '+' : ''}${upside}%` : null,
                        a.analyst ? `Analyst: ${a.analyst}` : null,
                      ].filter(Boolean).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                          <span style={{ color: '#c9a227', fontSize: 12 }}>✓</span>
                          <span style={{ fontSize: 11, color: '#555' }}>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{ marginBottom: 14 }}>
                      {hasPdf ? (
                        <button onClick={() => openPdf(a)} className="report-btn">↓ REPORT ÖFFNEN</button>
                      ) : (
                        <div className="report-btn-soon">+ BALD VERFÜGBAR</div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '9px 16px', borderTop: '1px solid #f2f2f2', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {a.sector && (
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, letterSpacing: 1, background: '#faf5e8', color: '#c9a227', padding: '2px 7px', textTransform: 'uppercase' }}>
                        {a.sector.length > 14 ? a.sector.slice(0, 14) + '…' : a.sector}
                      </span>
                    )}
                    <span style={{ fontSize: 9, color: '#ccc', marginLeft: 'auto' }}>
                      {new Date(a.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: 9, color: '#ccc' }}>·</span>
                    <span style={{ fontSize: 9, color: '#ccc' }}>
                      {new Date(a.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer style={{ background: '#0f1629', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '28px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginBottom: 6 }}>
          Alpha<span style={{ color: '#c9a227' }}>Desk</span>
        </div>
        <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>
          FOR INFORMATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE
        </div>
      </footer>
    </>
  )
}