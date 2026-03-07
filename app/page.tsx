import { createClient } from '@/lib/supabase/server'

const RATING_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  BUY:   { bg: '#f0faf5', text: '#1a8a54', border: '#b8e8d0' },
  HOLD:  { bg: '#fffbf0', text: '#9a6e00', border: '#f0d880' },
  SELL:  { bg: '#fff5f5', text: '#c0392b', border: '#f5c0bc' },
  WATCH: { bg: '#f5f5f5', text: '#666',    border: '#ddd'    },
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  function getPdfUrl(path: string) {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${supabaseUrl}/storage/v1/object/public/analyses-pdfs/${path}`
  }

  const buyCount  = analyses?.filter(a => a.rating === 'BUY').length  ?? 0
  const holdCount = analyses?.filter(a => a.rating === 'HOLD').length ?? 0
  const sellCount = analyses?.filter(a => a.rating === 'SELL').length ?? 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body {
          background: #f8f6f2;
          color: #1a1a1a;
          font-family: 'DM Mono', monospace;
          -webkit-font-smoothing: antialiased;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f0ede8; }
        ::-webkit-scrollbar-thumb { background: #d4c89a; border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .nav-link {
          font-size: 9px; letter-spacing: 3px; color: #999;
          text-transform: uppercase; text-decoration: none;
          padding: 7px 14px; border: 1px solid #e0dbd0;
          transition: all .2s;
        }
        .nav-link:hover { color: #b8962e; border-color: #d4c070; background: #fffdf5; }

        .stat-box {
          flex: 1 1 120px;
          background: #fff;
          border: 1px solid #e8e3d8;
          padding: 20px 24px;
          transition: box-shadow .2s;
        }
        .stat-box:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }

        .card {
          background: #fff;
          border: 1px solid #e8e3d8;
          padding: 28px;
          transition: box-shadow .25s, transform .25s, border-color .25s;
          animation: fadeUp .4s ease both;
          position: relative;
        }
        .card:hover {
          box-shadow: 0 8px 40px rgba(0,0,0,0.08);
          transform: translateY(-2px);
          border-color: #d4c070;
        }

        .pdf-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px;
          background: #fffbf0;
          border: 1px solid #d4c070;
          color: #9a7820;
          font-family: 'DM Mono', monospace;
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          text-decoration: none;
          transition: all .2s;
        }
        .pdf-btn:hover { background: #fff8e0; border-color: #b8962e; color: #7a5c10; }

        .tag {
          font-size: 8px; letter-spacing: 2px; color: #999;
          border: 1px solid #e8e3d8; padding: 4px 10px;
          text-transform: uppercase; background: #faf9f6;
        }

        .price-box {
          padding: 16px 20px;
          background: #faf9f6;
          border: 1px solid #ede8de;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .nav-inner { padding: 0 20px !important; }
          .hero-inner { padding: 48px 20px 36px !important; }
          .main-inner { padding: 28px 16px !important; }
          .stats-row  { gap: 2px !important; }
          .stat-box   { padding: 16px !important; }
          .grid       { grid-template-columns: 1fr !important; gap: 12px !important; }
          .card       { padding: 20px !important; }
          .footer-inner { padding: 24px 20px !important; flex-direction: column !important; gap: 8px !important; text-align: center !important; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 28px !important; }
          .price-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e8e3d8', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#1a1a1a', letterSpacing: -0.5 }}>
              Alpha Desk
            </div>
            <div style={{ width: 1, height: 16, background: '#e0dbd0' }} />
            <div style={{ fontSize: 8, letterSpacing: 4, color: '#bbb', textTransform: 'uppercase' }}>
              Research
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 8, letterSpacing: 2, color: '#ccc', textTransform: 'uppercase' }}>
              {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <a href="/login" className="nav-link">Admin</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: '#fff', borderBottom: '1px solid #e8e3d8' }}>
        <div className="hero-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 48px 48px' }}>
          <div style={{ fontSize: 8, letterSpacing: 6, color: '#bbb', textTransform: 'uppercase', marginBottom: 20 }}>
            — Institutional Equity Research
          </div>
          <h1 className="hero-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.05, marginBottom: 8 }}>
            Equity Analysis &{' '}
            <em style={{ color: '#b8962e', fontStyle: 'italic' }}>Market Intelligence</em>
          </h1>
          <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg,#d4c070,#f0e090)', marginTop: 24, marginBottom: 36 }} />

          {/* Stats */}
          <div className="stats-row" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Reports', value: analyses?.length ?? 0, color: '#1a1a1a' },
              { label: 'Buy',           value: buyCount,              color: '#1a8a54'  },
              { label: 'Hold',          value: holdCount,             color: '#9a6e00'  },
              { label: 'Sell',          value: sellCount,             color: '#c0392b'  },
            ].map(s => (
              <div key={s.label} className="stat-box">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 400, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 8, letterSpacing: 3, color: '#aaa', textTransform: 'uppercase', marginTop: 6 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <main className="main-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px 80px' }}>
        <div style={{ fontSize: 8, letterSpacing: 4, color: '#bbb', textTransform: 'uppercase', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #ede8de' }}>
          {analyses?.length ?? 0} Published Report{analyses?.length !== 1 ? 's' : ''}
        </div>

        {!analyses || analyses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#ccc', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
            Keine Analysen verfügbar
          </div>
        ) : (
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {analyses.map((a, i) => {
              const rc = RATING_COLOR[a.rating] ?? RATING_COLOR.WATCH
              const pdfUrl = getPdfUrl(a.pdf_path)
              const upside = a.current_price && a.price_target
                ? (((a.price_target - a.current_price) / a.current_price) * 100).toFixed(1)
                : null

              return (
                <div key={a.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>

                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 3, height: 28, background: rc.text, borderRadius: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 14, letterSpacing: 3, color: '#1a1a1a', fontWeight: 500, textTransform: 'uppercase' }}>
                          {a.ticker}
                        </div>
                        {a.sector && (
                          <div style={{ fontSize: 8, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', marginTop: 2 }}>
                            {a.sector}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{
                      padding: '5px 14px', fontSize: 9, letterSpacing: 3, fontWeight: 500,
                      background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`,
                      textTransform: 'uppercase',
                    }}>
                      {a.rating}
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 12 }}>
                    {a.title}
                  </div>

                  {/* Description */}
                  {a.description && (
                    <div style={{ fontSize: 11, color: '#888', lineHeight: 1.8, marginBottom: 20 }}>
                      {a.description}
                    </div>
                  )}

                  {/* Prices */}
                  {(a.current_price || a.price_target) && (
                    <div className="price-grid" style={{ display: 'grid', gridTemplateColumns: upside ? '1fr 1fr 1fr' : '1fr 1fr', gap: 4, marginBottom: 20 }}>
                      {a.current_price && (
                        <div className="price-box">
                          <div style={{ fontSize: 8, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', marginBottom: 6 }}>Kurs</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#1a1a1a', fontWeight: 400 }}>
                            ${Number(a.current_price).toLocaleString('de-DE')}
                          </div>
                        </div>
                      )}
                      {a.price_target && (
                        <div className="price-box">
                          <div style={{ fontSize: 8, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', marginBottom: 6 }}>Kursziel</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#b8962e', fontWeight: 400 }}>
                            ${Number(a.price_target).toLocaleString('de-DE')}
                          </div>
                        </div>
                      )}
                      {upside && (
                        <div className="price-box">
                          <div style={{ fontSize: 8, letterSpacing: 2, color: '#bbb', textTransform: 'uppercase', marginBottom: 6 }}>Upside</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: Number(upside) >= 0 ? '#1a8a54' : '#c0392b' }}>
                            {Number(upside) >= 0 ? '+' : ''}{upside}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f0ece4', flexWrap: 'wrap', gap: 10 }}>
                    {pdfUrl ? (
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-btn">
                        <span>↓</span> Report öffnen
                      </a>
                    ) : <div />}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {a.analyst && <span className="tag">{a.analyst}</span>}
                      <span style={{ fontSize: 9, color: '#ccc', letterSpacing: 1 }}>
                        {new Date(a.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e8e3d8' }}>
        <div className="footer-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#1a1a1a', fontWeight: 600 }}>Alpha Desk</div>
            <div style={{ fontSize: 8, letterSpacing: 2, color: '#ccc', textTransform: 'uppercase' }}>
              © {new Date().getFullYear()}
            </div>
          </div>
          <div style={{ fontSize: 8, letterSpacing: 2, color: '#ccc', textTransform: 'uppercase' }}>
            Institutional Research Platform
          </div>
        </div>
      </footer>
    </>
  )
}