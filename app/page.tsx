import { createClient } from '@/lib/supabase/server'

const RATING = {
  BUY:   { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', dark: '#15803d', icon: '↑' },
  HOLD:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a', dark: '#b45309', icon: '→' },
  SELL:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', dark: '#b91c1c', icon: '↓' },
  WATCH: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', dark: '#475569', icon: '◎' },
} as const

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

  const total     = analyses?.length ?? 0
  const buyCount  = analyses?.filter(a => a.rating === 'BUY').length  ?? 0
  const holdCount = analyses?.filter(a => a.rating === 'HOLD').length ?? 0
  const sellCount = analyses?.filter(a => a.rating === 'SELL').length ?? 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { background:#f1f5f9; color:#0f172a; font-family:'DM Mono',monospace; -webkit-font-smoothing:antialiased; }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#e2e8f0; }
        ::-webkit-scrollbar-thumb { background:#c9a227; border-radius:2px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* NAV */
        .nav { background:#0f172a; border-bottom:3px solid #c9a227; position:sticky; top:0; z-index:100; }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 32px; height:64px; display:flex; align-items:center; justify-content:space-between; }
        .nav-logo { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:700; color:#fff; letter-spacing:-0.5px; }
        .nav-logo span { color:#c9a227; }
        .nav-sub { font-size:8px; letter-spacing:4px; color:#94a3b8; text-transform:uppercase; margin-top:2px; }
        .nav-admin { font-size:9px; letter-spacing:3px; color:#64748b; text-transform:uppercase; text-decoration:none; padding:8px 16px; border:1px solid #1e293b; transition:all .2s; }
        .nav-admin:hover { color:#c9a227; border-color:#c9a227; }

        /* HERO */
        .hero { background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:40px 32px 36px; border-bottom:1px solid #c9a22730; }
        .hero-inner { max-width:1200px; margin:0 auto; }
        .hero-eyebrow { font-size:8px; letter-spacing:6px; color:#c9a227; text-transform:uppercase; margin-bottom:12px; }
        .hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,5vw,52px); font-weight:400; color:#f8fafc; line-height:1.05; margin-bottom:6px; }
        .hero-title em { color:#c9a227; font-style:italic; }
        .hero-desc { font-size:10px; color:#64748b; letter-spacing:2px; text-transform:uppercase; margin-bottom:28px; }
        .hero-line { width:48px; height:2px; background:linear-gradient(90deg,#c9a227,#f0d870); margin-bottom:28px; }

        /* KPI */
        .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
        .kpi-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); padding:20px 24px; transition:all .2s; cursor:default; }
        .kpi-card:hover { background:rgba(255,255,255,0.08); border-color:rgba(201,162,39,0.3); }
        .kpi-icon { font-size:18px; margin-bottom:10px; }
        .kpi-num { font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:600; line-height:1; margin-bottom:6px; }
        .kpi-label { font-size:8px; letter-spacing:3px; color:#64748b; text-transform:uppercase; }

        /* MAIN */
        .main { max-width:1200px; margin:0 auto; padding:32px 32px 80px; }
        .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #e2e8f0; }
        .section-title { font-size:8px; letter-spacing:4px; color:#94a3b8; text-transform:uppercase; }
        .section-count { font-size:8px; letter-spacing:2px; color:#c9a227; text-transform:uppercase; }

        /* CARDS */
        .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
        .card { background:#fff; border:1px solid #e2e8f0; border-radius:2px; overflow:hidden; animation:fadeUp .4s ease both; transition:box-shadow .25s, transform .25s, border-color .25s; }
        .card:hover { box-shadow:0 12px 40px rgba(0,0,0,0.1); transform:translateY(-3px); border-color:#c9a227; }
        .card-top { padding:24px 24px 0; }
        .card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
        .card-ticker { font-size:13px; letter-spacing:4px; font-weight:500; color:#0f172a; text-transform:uppercase; }
        .card-sector { font-size:8px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; margin-top:3px; }
        .card-badge { padding:5px 14px; font-size:9px; letter-spacing:3px; font-weight:500; text-transform:uppercase; display:flex; align-items:center; gap:5px; }
        .card-title { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; color:#0f172a; line-height:1.3; margin-bottom:10px; }
        .card-desc { font-size:11px; color:#94a3b8; line-height:1.8; margin-bottom:16px; }

        /* PRICE BLOCK */
        .price-block { display:grid; grid-template-columns:repeat(3,1fr); background:#f8fafc; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; }
        .price-cell { padding:14px 16px; border-right:1px solid #e2e8f0; }
        .price-cell:last-child { border-right:none; }
        .price-label { font-size:7px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; margin-bottom:6px; }
        .price-value { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; color:#0f172a; line-height:1; }
        .price-value.gold { color:#c9a227; }
        .price-value.up   { color:#16a34a; }
        .price-value.down { color:#dc2626; }

        /* CARD FOOTER */
        .card-footer { padding:16px 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
        .open-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:#0f172a; color:#fff; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:3px; text-transform:uppercase; text-decoration:none; border:none; transition:all .2s; box-shadow:0 2px 8px rgba(0,0,0,0.15); }
        .open-btn:hover { background:#c9a227; color:#0f172a; box-shadow:0 4px 16px rgba(201,162,39,0.3); }
        .card-meta { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .meta-tag { font-size:8px; letter-spacing:1px; color:#94a3b8; padding:4px 8px; background:#f8fafc; border:1px solid #e2e8f0; text-transform:uppercase; }
        .meta-date { font-size:9px; color:#cbd5e1; letter-spacing:1px; }

        /* EMPTY */
        .empty { text-align:center; padding:80px 0; color:#cbd5e1; font-size:11px; letter-spacing:3px; text-transform:uppercase; }

        /* FOOTER */
        .footer { background:#0f172a; border-top:3px solid #c9a227; }
        .footer-inner { max-width:1200px; margin:0 auto; padding:28px 32px; display:flex; justify-content:space-between; align-items:center; }
        .footer-logo { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700; color:#fff; }
        .footer-logo span { color:#c9a227; }
        .footer-copy { font-size:8px; letter-spacing:2px; color:#334155; text-transform:uppercase; }

        /* RESPONSIVE */
        @media (max-width:900px) {
          .kpi-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:640px) {
          .nav-inner { padding:0 16px; }
          .nav-sub { display:none; }
          .hero { padding:28px 16px 24px; }
          .hero-title { font-size:28px; }
          .kpi-grid { grid-template-columns:repeat(2,1fr); gap:6px; }
          .kpi-num { font-size:32px; }
          .kpi-card { padding:14px 16px; }
          .main { padding:20px 16px 60px; }
          .cards-grid { grid-template-columns:1fr; gap:12px; }
          .price-block { grid-template-columns:1fr 1fr; }
          .price-cell:nth-child(3) { grid-column:1/-1; border-top:1px solid #e2e8f0; border-right:none; }
          .card-footer { flex-direction:column; align-items:flex-start; }
          .footer-inner { flex-direction:column; gap:8px; text-align:center; padding:20px 16px; }
        }
        @media (max-width:400px) {
          .kpi-grid { grid-template-columns:1fr 1fr; }
          .hero-title { font-size:24px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div>
            <div className="nav-logo">Alpha<span>Desk</span></div>
            <div className="nav-sub">Institutional Research Platform</div>
          </div>
          <a href="/login" className="nav-admin">Admin ↗</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">— Institutional Equity Research</div>
          <h1 className="hero-title">
            Equity Analysis &{' '}
            <em>Market Intelligence</em>
          </h1>
          <div className="hero-desc">Professional research · Independent analysis</div>
          <div className="hero-line" />

          {/* KPI */}
          <div className="kpi-grid">
            {[
              { icon: '📊', num: total,     label: 'Total Reports', color: '#f8fafc'  },
              { icon: '📈', num: buyCount,  label: 'Buy Ratings',   color: '#4ade80'  },
              { icon: '➡️', num: holdCount, label: 'Hold Ratings',  color: '#fbbf24'  },
              { icon: '📉', num: sellCount, label: 'Sell Ratings',  color: '#f87171'  },
            ].map(k => (
              <div key={k.label} className="kpi-card">
                <div className="kpi-icon">{k.icon}</div>
                <div className="kpi-num" style={{ color: k.color }}>{k.num}</div>
                <div className="kpi-label">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="main">
        <div className="section-header">
          <div className="section-title">Published Reports</div>
          <div className="section-count">{total} Report{total !== 1 ? 's' : ''} available</div>
        </div>

        {!analyses || analyses.length === 0 ? (
          <div className="empty">Keine Analysen verfügbar</div>
        ) : (
          <div className="cards-grid">
            {analyses.map((a, i) => {
              const rc = RATING[a.rating as keyof typeof RATING] ?? RATING.WATCH
              const pdfUrl = getPdfUrl(a.pdf_path)
              const upside = a.current_price && a.price_target
                ? (((a.price_target - a.current_price) / a.current_price) * 100).toFixed(1)
                : null

              return (
                <article key={a.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="card-top">
                    {/* Header */}
                    <div className="card-header">
                      <div>
                        <div className="card-ticker">{a.ticker}</div>
                        {a.sector && <div className="card-sector">{a.sector}</div>}
                      </div>
                      <div className="card-badge" style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>
                        <span>{rc.icon}</span> {a.rating}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="card-title">{a.title}</div>

                    {/* Description */}
                    {a.description && <div className="card-desc">{a.description}</div>}
                  </div>

                  {/* Prices */}
                  {(a.current_price || a.price_target) && (
                    <div className="price-block">
                      {a.current_price && (
                        <div className="price-cell">
                          <div className="price-label">Current Price</div>
                          <div className="price-value">${Number(a.current_price).toLocaleString('en-US')}</div>
                        </div>
                      )}
                      {a.price_target && (
                        <div className="price-cell">
                          <div className="price-label">Price Target</div>
                          <div className="price-value gold">${Number(a.price_target).toLocaleString('en-US')}</div>
                        </div>
                      )}
                      {upside && (
                        <div className="price-cell">
                          <div className="price-label">Upside</div>
                          <div className={`price-value ${Number(upside) >= 0 ? 'up' : 'down'}`}>
                            {Number(upside) >= 0 ? '+' : ''}{upside}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="card-footer">
                    {pdfUrl ? (
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="open-btn">
                        ↓ Open Report
                      </a>
                    ) : <div />}
                    <div className="card-meta">
                      {a.analyst && <span className="meta-tag">{a.analyst}</span>}
                      <span className="meta-date">
                        {new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">Alpha<span>Desk</span></div>
          <div className="footer-copy">© {new Date().getFullYear()} · Institutional Research Platform · All rights reserved</div>
        </div>
      </footer>
    </>
  )
}