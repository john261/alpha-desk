import { createClient } from '@/lib/supabase/server'
import AnalysisCardsGrid from '@/components/AnalysisCardsGrid'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  function getPdfUrl(path: string) {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${supabaseUrl}/storage/v1/object/public/analyses-pdfs/${path}`
  }

  const total     = analyses?.length ?? 0
  const buyCount  = analyses?.filter(a => a.rating === 'BUY').length  ?? 0
  const holdCount = analyses?.filter(a => a.rating === 'HOLD').length ?? 0
  const sellCount = analyses?.filter(a => a.rating === 'SELL').length ?? 0

  const kpis = [
    { num: total,     label: 'Total Reports', color: '#94a3b8', dot: '#64748b', cls: 'kpi-c0', trend: '',  accent: '#64748b' },
    { num: buyCount,  label: 'Buy Ratings',   color: '#4ade80', dot: '#22c55e', cls: 'kpi-c1', trend: '▲', accent: '#22c55e' },
    { num: holdCount, label: 'Hold Ratings',  color: '#fbbf24', dot: '#f59e0b', cls: 'kpi-c2', trend: '→', accent: '#f59e0b' },
    { num: sellCount, label: 'Sell Ratings',  color: '#f87171', dot: '#ef4444', cls: 'kpi-c3', trend: '▼', accent: '#ef4444' },
  ]

  const analysesWithPdf = (analyses ?? []).map(a => ({
    ...a,
    pdfUrl: a.pdf_path ? getPdfUrl(a.pdf_path) : null,
  }))

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
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes barGrow { from{width:0} to{width:var(--w)} }
        .nav { background:#0a1628; border-bottom:3px solid #c9a227; position:sticky; top:0; z-index:100; }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 32px; height:60px; display:flex; align-items:center; justify-content:space-between; }
        .nav-logo { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#fff; letter-spacing:-0.5px; line-height:1; }
        .nav-logo span { color:#c9a227; }
        .nav-tagline { font-size:7px; letter-spacing:4px; color:#334155; text-transform:uppercase; margin-top:3px; }
        .nav-admin { font-size:8px; letter-spacing:3px; color:#475569; text-transform:uppercase; text-decoration:none; padding:7px 14px; border:1px solid #1e293b; transition:all .2s; }
        .nav-admin:hover { color:#c9a227; border-color:#c9a227; background:rgba(201,162,39,0.05); }
        .hero { background:linear-gradient(160deg,#0a1628 0%,#0f2240 60%,#0a1628 100%); padding:28px 32px 0; border-bottom:1px solid rgba(201,162,39,0.15); }
        .hero-inner { max-width:1200px; margin:0 auto; text-align:center; }
        .hero-eyebrow { font-size:7px; letter-spacing:6px; color:#c9a227; text-transform:uppercase; margin-bottom:10px; opacity:.8; }
        .hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(26px,4vw,44px); font-weight:400; color:#f8fafc; line-height:1.05; margin-bottom:4px; }
        .hero-title em { color:#c9a227; font-style:italic; }
        .hero-desc { font-size:9px; color:#475569; letter-spacing:3px; text-transform:uppercase; margin-bottom:16px; }
        .hero-line { width:40px; height:2px; background:linear-gradient(90deg,#c9a227,#f0d870); margin:0 auto 20px; }
        .kpi-wrap { display:grid; grid-template-columns:repeat(4,1fr); background:#0d1f38; border:1px solid rgba(255,255,255,0.07); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        .kpi-cell { padding:22px 24px 20px; border-right:1px solid rgba(255,255,255,0.05); transition:background .2s; cursor:default; position:relative; overflow:hidden; }
        .kpi-cell:last-child { border-right:none; }
        .kpi-cell:hover { background:#112440; }
        .kpi-cell::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; transform:scaleX(0); transform-origin:left; transition:transform .35s ease; }
        .kpi-cell:hover::after { transform:scaleX(1); }
        .kpi-c0::after{background:#64748b}.kpi-c1::after{background:#22c55e}.kpi-c2::after{background:#f59e0b}.kpi-c3::after{background:#ef4444}
        .kpi-bar-track { height:2px; background:rgba(255,255,255,0.06); margin-bottom:14px; overflow:hidden; }
        .kpi-bar-fill  { height:100%; border-radius:1px; animation:barGrow .8s ease both; }
        .kpi-num-row { display:flex; align-items:baseline; gap:10px; margin-bottom:8px; }
        .kpi-num   { font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:600; line-height:1; }
        .kpi-trend { font-size:13px; opacity:.6; }
        .kpi-label { font-size:11px; color:#475569; letter-spacing:.5px; display:flex; align-items:center; gap:8px; }
        .kpi-dot   { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        .main { max-width:1200px; margin:0 auto; padding:28px 32px 80px; }
        .section-bar   { display:flex; align-items:baseline; gap:12px; margin-bottom:8px; }
        .section-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:600; color:#0f172a; }
        .section-count { font-size:9px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase; }
        .section-line  { height:2px; background:linear-gradient(90deg,#e2e8f0,transparent); margin-bottom:20px; }
        .footer { background:#0a1628; border-top:3px solid #c9a227; }
        .footer-inner { max-width:1200px; margin:0 auto; padding:32px; display:grid; grid-template-columns:1fr auto; align-items:start; gap:40px; }
        .footer-logo  { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:700; color:#fff; margin-bottom:4px; }
        .footer-logo span { color:#c9a227; }
        .footer-claim { font-size:8px; letter-spacing:3px; color:#334155; text-transform:uppercase; margin-bottom:10px; }
        .footer-copy  { font-size:8px; color:#1e293b; letter-spacing:1px; text-transform:uppercase; }
        .footer-links { display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
        .footer-link  { font-size:8px; letter-spacing:2px; color:#334155; text-transform:uppercase; text-decoration:none; transition:color .2s; }
        .footer-link:hover { color:#c9a227; }
        @media (max-width:900px) {
          .kpi-wrap { grid-template-columns:repeat(2,1fr); }
          .kpi-cell:nth-child(2) { border-right:none; }
          .kpi-cell:nth-child(1),.kpi-cell:nth-child(2) { border-bottom:1px solid rgba(255,255,255,0.05); }
        }
        @media (max-width:640px) {
          .nav-inner { padding:0 16px; } .nav-tagline { display:none; }
          .hero { padding:20px 16px 0; } .hero-title { font-size:24px; }
          .kpi-num { font-size:34px; } .kpi-cell { padding:16px; }
          .main { padding:20px 16px 60px; }
          .footer-inner { grid-template-columns:1fr; gap:20px; padding:24px 16px; }
          .footer-links { align-items:flex-start; flex-direction:row; flex-wrap:wrap; gap:16px; }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <div>
            <div className="nav-logo">Alpha<span>Desk</span></div>
            <div className="nav-tagline">Institutional Research Platform</div>
          </div>
          <a href="/login" className="nav-admin">Admin ↗</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Institutional Equity Research</div>
          <h1 className="hero-title">Equity Analysis &amp; <em>Market Intelligence</em></h1>
          <div className="hero-desc">Professional research · Independent analysis</div>
          <div className="hero-line" />
          <div className="kpi-wrap">
            {kpis.map((k, idx) => {
              const pct = total > 0 ? Math.round((k.num / total) * 100) : (idx === 0 ? 100 : 0)
              const barWidth = idx === 0 ? 100 : pct
              return (
                <div key={k.label} className={`kpi-cell ${k.cls}`}>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill" style={{ width:`${barWidth}%`, background:k.accent, animationDelay:`${idx*0.1}s`, ['--w' as any]:`${barWidth}%` }} />
                  </div>
                  <div className="kpi-num-row">
                    <div className="kpi-num" style={{ color:k.color }}>{k.num}</div>
                    {k.trend && <div className="kpi-trend" style={{ color:k.color }}>{k.trend}</div>}
                  </div>
                  <div className="kpi-label">
                    <span className="kpi-dot" style={{ background:k.dot }} />
                    {k.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <main className="main">
        <div className="section-bar">
          <div className="section-title">Published Reports</div>
          <div className="section-count">({total} available)</div>
        </div>
        <div className="section-line" />
        {analysesWithPdf.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#cbd5e1', fontSize:11, letterSpacing:3, textTransform:'uppercase' }}>
            Keine Analysen verfügbar
          </div>
        ) : (
          <AnalysisCardsGrid analyses={analysesWithPdf} />
        )}
      </main>

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