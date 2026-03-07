import { createClient } from '@/lib/supabase/server'

const RATING = {
  BUY:   { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: '▲' },
  HOLD:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a', icon: '●' },
  SELL:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: '▼' },
  WATCH: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', icon: '◎' },
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
        .nav { background:#0a1628; border-bottom:3px solid #c9a227; position:sticky; top:0; z-index:100; }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 32px; height:60px; display:flex; align-items:center; justify-content:space-between; }
        .nav-logo { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#fff; letter-spacing:-0.5px; line-height:1; }
        .nav-logo span { color:#c9a227; }
        .nav-tagline { font-size:7px; letter-spacing:4px; color:#475569; text-transform:uppercase; margin-top:3px; }
        .nav-admin { font-size:8px; letter-spacing:3px; color:#475569; text-transform:uppercase; text-decoration:none; padding:7px 14px; border:1px solid #1e293b; transition:all .2s; }
        .nav-admin:hover { color:#c9a227; border-color:#c9a227; background:rgba(201,162,39,0.05); }

        /* HERO */
        .hero { background:linear-gradient(160deg,#0a1628 0%,#0f2240 60%,#0a1628 100%); padding:32px 32px 0; border-bottom:1px solid rgba(201,162,39,0.15); }
        .hero-inner { max-width:1200px; margin:0 auto; }
        .hero-eyebrow { font-size:7px; letter-spacing:6px; color:#c9a227; text-transform:uppercase; margin-bottom:10px; opacity:.8; }
        .hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4.5vw,46px); font-weight:400; color:#f8fafc; line-height:1.05; margin-bottom:4px; }
        .hero-title em { color:#c9a227; font-style:italic; }
        .hero-desc { font-size:9px; color:#475569; letter-spacing:3px; text-transform:uppercase; margin-bottom:20px; }
        .hero-line { width:40px; height:2px; background:linear-gradient(90deg,#c9a227,#f0d870); margin-bottom:20px; }

        /* KPI */
        .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.06); margin:0 0 0; }
        .kpi-card { background:#0d1f38; padding:18px 22px 20px; transition:background .2s; cursor:default; position:relative; overflow:hidden; }
        .kpi-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; transform:scaleX(0); transform-origin:left; transition:transform .3s; }
        .kpi-card:hover { background:#112440; }
        .kpi-card:hover::after { transform:scaleX(1); }
        .kpi-card-0::after { background:#94a3b8; }
        .kpi-card-1::after { background:#22c55e; }
        .kpi-card-2::after { background:#f59e0b; }
        .kpi-card-3::after { background:#ef4444; }
        .kpi-num { font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:600; line-height:1; margin-bottom:6px; }
        .kpi-label { font-size:11px; color:#64748b; letter-spacing:1px; }
        .kpi-dot { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:6px; vertical-align:middle; position:relative; top:-1px; }

        /* MAIN */
        .main { max-width:1200px; margin:0 auto; padding:32px 32px 80px; }

        .section-bar { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:20px; }
        .section-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:#0f172a; }
        .section-count { font-size:9px; letter-spacing:2px; color:#c9a227; text-transform:uppercase; }
        .section-line { height:2px; background:linear-gradient(90deg,#e2e8f0,transparent); margin-bottom:24px; }

        /* CARDS */
        .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
        .card { background:#fff; border:1px solid #e2e8f0; overflow:hidden; animation:fadeUp .4s ease both; transition:box-shadow .25s,transform .25s,border-color .25s; }
        .card:hover { box-shadow:0 16px 48px rgba(0,0,0,0.1); transform:translateY(-4px); border-color:#c9a227; }
        .card-body { padding:22px 22px 16px; }
        .card-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
        .card-ticker { font-size:13px; letter-spacing:4px; font-weight:500; color:#0f172a; text-transform:uppercase; }
        .card-sector { font-size:8px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; margin-top:3px; }
        .card-badge { padding:5px 12px; font-size:8px; letter-spacing:3px; font-weight:500; text-transform:uppercase; display:flex; align-items:center; gap:5px; flex-shrink:0; }
        .card-title { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; color:#0f172a; line-height:1.3; margin-bottom:10px; }
        .card-desc { font-size:11px; color:#94a3b8; line-height:1.8; margin-bottom:0; }

        /* PRICE BLOCK */
        .price-block { display:grid; grid-template-columns:repeat(3,1fr); background:#f8fafc; border-top:1px solid #f1f5f9; }
        .price-cell { padding:14px 18px; border-right:1px solid #f1f5f9; }
        .price-cell:last-child { border-right:none; }
        .price-value { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:600; color:#0f172a; line-height:1; margin-bottom:4px; }
        .price-value.gold { color:#c9a227; }
        .price-value.up   { color:#16a34a; }
        .price-value.dn   { color:#dc2626; }
        .price-label { font-size:8px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; }

        /* CARD FOOTER */
        .card-footer { padding:14px 22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid #f1f5f9; background:#fafafa; }
        .open-btn { display:inline-flex; align-items:center; gap:8px; padding:11px 22px; background:#0a1628; color:#fff; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:3px; text-transform:uppercase; text-decoration:none; font-weight:500; transition:all .2s; box-shadow:0 2px 10px rgba(0,0,0,0.15); }
        .open-btn:hover { background:#c9a227; color:#0a1628; box-shadow:0 4px 20px rgba(201,162,39,0.35); transform:translateY(-1px); }
        .card-meta { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .meta-tag { font-size:8px; letter-spacing:1px; color:#94a3b8; padding:4px 8px; background:#f1f5f9; border:1px solid #e2e8f0; text-transform:uppercase; }
        .meta-date { font-size:9px; color:#cbd5e1; letter-spacing:1px; }

        /* FOOTER */
        .footer { background:#0a1628; border-top:3px solid #c9a227; }
        .footer-inner { max-width:1200px; margin:0 auto; padding:32px 32px; display:grid; grid-template-columns:1fr auto; align-items:start; gap:40px; }
        .footer-logo { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:700; color:#fff; margin-bottom:6px; }
        .footer-logo span { color:#c9a227; }
        .footer-claim { font-size:8px; letter-spacing:3px; color:#334155; text-transform:uppercase; margin-bottom:12px; }
        .footer-copy { font-size:8px; color:#1e293b; letter-spacing:2px; text-transform:uppercase; }
        .footer-links { display:flex; flex-direction:column; gap:8px; align-items:flex-end; }
        .footer-link { font-size:8px; letter-spacing:2px; color:#334155; text-transform:uppercase; text-decoration:none; transition:color .2s; }
        .footer-link:hover { color:#c9a227; }

        /* RESPONSIVE */
        @media (max-width:900px) {
          .kpi-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:640px) {
          .nav-inner  { padding:0 16px; }
          .nav-tagline { display:none; }
          .hero       { padding:24px 16px 0; }
          .hero-title { font-size:26px; }
          .kpi-num    { font-size:32px; }
          .kpi-card   { padding:14px 16px 16px; }
          .main       { padding:24px 16px 60px; }
          .cards-grid { grid-template-columns:1fr; gap:12px; }
          .price-block { grid-template-columns:1fr 1fr; }
          .price-cell:nth-child(3) { grid-column:1/-1; border-top:1px solid #f1f5f9; border-right:none; }
          .card-footer { flex-direction:column; align-items:flex-start; }
          .footer-inner { grid-template-columns:1fr; gap:20px; padding:24px 16px; }
          .footer-links { align-items:flex-start; flex-direction:row; flex-wrap:wrap; gap:12px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div>
            <div className="nav-logo">Alpha<span>Desk</span></div>
            <div className="nav-tagline">Institutional Research Platform</div>
          </div>
          <a href="/login" className="nav-admin">Admin ↗</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Institutional Equity Research</div>
          <h1 className="hero-title">
            Equity Analysis &{' '}
            <em>Market Intelligence</em>
          </h1>
          <div className="hero-desc">Professional research · Independent analysis</div>
          <div className="hero-line" />

          <div className="kpi-grid">
            {[
              { num: total,     label: 'Total Reports', color: '#94a3b8', dot: '#94a3b8', cls: 'kpi-card-0' },
              { num: buyCount,  label: 'Buy Ratings',   color: '#4ade80', dot: '#22c55e', cls: 'kpi-card-1' },
              { num: holdCount, label: 'Hold Ratings',  color: '#fbbf24', dot: '#f59e0b', cls: 'kpi-card-2' },
              { num: sellCount, label: 'Sell Ratings',  color: '#f87171', dot: '#ef4444', cls: 'kpi-card-3' },
            ].map(k => (
              <div key={k.label} className={`kpi-card ${k.cls}`}>
                <div className="kpi-num" style={{ color: k.color }}>{k.num}</div>
                <div className="kpi-label">
                  <span className="kpi-dot" style={{ background: k.dot }} />
                  {k.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="main">
        <div className="section-bar">
          <div className="section-title">Published Reports</div>
          <div className="section-count">{total} available</div>
        </div>
        <div className="section-line" />

        {!analyses || analyses.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#cbd5e1', fontSize:11, letterSpacing:3, textTransform:'uppercase' }}>
            Keine Analysen verfügbar
          </div>
        ) : (
          <div className="cards-grid">
            {analyses.map((a, i) => {
              const rc = RATING[a.rating as keyof typeof RATING] ?? RATING.WATCH
              const pdfUrl = getPdfUrl(a.pdf_path)
              const upside = a.current_price && a.price_target
                ? (((a.price_target - a.current_price) / a.current_price) * 100).toFixed(1)
                : null

              return (
                <article key={a.id} className="card" style={{ animationDelay:`${i*0.05}s` }}>
                  <div className="card-body">
                    <div className="card-header">
                      <div>
                        <div className="card-ticker">{a.ticker}</div>
                        {a.sector && <div className="card-sector">{a.sector}</div>}
                      </div>
                      <div className="card-badge" style={{ background:rc.bg, color:rc.text, border:`1px solid ${rc.border}` }}>
                        <span>{rc.icon}</span>{a.rating}
                      </div>
                    </div>
                    <div className="card-title">{a.title}</div>
                    {a.description && <div className="card-desc">{a.description}</div>}
                  </div>

                  {(a.current_price || a.price_target) && (
                    <div className="price-block">
                      {a.current_price && (
                        <div className="price-cell">
                          <div className="price-value">${Number(a.current_price).toLocaleString('en-US')}</div>
                          <div className="price-label">Current Price</div>
                        </div>
                      )}
                      {a.price_target && (
                        <div className="price-cell">
                          <div className="price-value gold">${Number(a.price_target).toLocaleString('en-US')}</div>
                          <div className="price-label">Price Target</div>
                        </div>
                      )}
                      {upside && (
                        <div className="price-cell">
                          <div className={`price-value ${Number(upside) >= 0 ? 'up' : 'dn'}`}>
                            {Number(upside) >= 0 ? '+' : ''}{upside}%
                          </div>
                          <div className="price-label">Upside</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="card-footer">
                    {pdfUrl ? (
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="open-btn">
                        ↓ Open Report
                      </a>
                    ) : <div />}
                    <div className="card-meta">
                      {a.analyst && <span className="meta-tag">{a.analyst}</span>}
                      <span className="meta-date">
                        {new Date(a.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
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
          <div>
            <div className="footer-logo">Alpha<span>Desk</span></div>
            <div className="footer-claim">Independent Institutional Research</div>
            <div className="footer-copy">© {new Date().getFullYear()} · All rights reserved</div>
          </div>
          <div className="footer-links">
            <a href="/" className="footer-link">Reports</a>
            <a href="/login" className="footer-link">Admin</a>
          </div>
        </div>
      </footer>
    </>
  )
}