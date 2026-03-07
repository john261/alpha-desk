import { createClient } from '@/lib/supabase/server'

const RATING_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  BUY:   { bg: 'rgba(78,201,148,0.1)',  text: '#4ec994', border: 'rgba(78,201,148,0.3)'  },
  HOLD:  { bg: 'rgba(245,200,66,0.1)',  text: '#f5c842', border: 'rgba(245,200,66,0.3)'  },
  SELL:  { bg: 'rgba(224,85,85,0.1)',   text: '#e05555', border: 'rgba(224,85,85,0.3)'   },
  WATCH: { bg: 'rgba(160,160,160,0.1)', text: '#aaa',    border: 'rgba(160,160,160,0.3)' },
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
    return `${supabaseUrl}/storage/v1/object/public/${path}`
  }

  const buyCount  = analyses?.filter(a => a.rating === 'BUY').length  ?? 0
  const holdCount = analyses?.filter(a => a.rating === 'HOLD').length ?? 0
  const sellCount = analyses?.filter(a => a.rating === 'SELL').length ?? 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior: smooth; }
        body { background:#080808; color:#d4cfc8; font-family:'DM Mono',monospace; -webkit-font-smoothing:antialiased; }

        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0d0d0d; }
        ::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineGrow { from{width:0} to{width:100%} }

        .card {
          background: #0d0d0d;
          border: 1px solid #1c1c1c;
          padding: 36px;
          transition: border-color .25s, transform .25s, box-shadow .25s;
          animation: fadeUp .5s ease both;
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content:'';
          position:absolute; top:0; left:0; right:0;
          height:1px; background: linear-gradient(90deg, transparent, #f5c84230, transparent);
          transform:scaleX(0); transform-origin:left;
          transition: transform .4s ease;
        }
        .card:hover { border-color:#2a2a2a; transform:translateY(-3px); box-shadow:0 20px 60px rgba(0,0,0,.5); }
        .card:hover::before { transform:scaleX(1); }

        .pdf-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 18px;
          background:rgba(245,200,66,0.06);
          border:1px solid rgba(245,200,66,0.2);
          color:#f5c842;
          font-family:'DM Mono',monospace;
          font-size:9px; letter-spacing:3px; text-transform:uppercase;
          text-decoration:none; cursor:pointer;
          transition: background .2s, border-color .2s;
        }
        .pdf-btn:hover { background:rgba(245,200,66,0.12); border-color:rgba(245,200,66,0.4); }

        .stat-card { background:#0d0d0d; border:1px solid #1c1c1c; padding:24px 28px; }
        .divider { width:100%; height:1px; background:linear-gradient(90deg,#1c1c1c,transparent); margin:0; }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(8,8,8,0.92)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid #141414',
        padding:'0 48px', height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:'#fff', letterSpacing:-0.5 }}>
            Alpha Desk
          </div>
          <div style={{ width:1, height:16, background:'#1c1c1c' }} />
          <div style={{ fontSize:8, letterSpacing:4, color:'#333', textTransform:'uppercase' }}>
            Research Portal
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <div style={{ fontSize:8, letterSpacing:3, color:'#2a2a2a', textTransform:'uppercase' }}>
            {new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric' })}
          </div>
          <a href="/login" style={{
            fontSize:8, letterSpacing:3, color:'#2a2a2a',
            textTransform:'uppercase', textDecoration:'none',
            padding:'6px 12px', border:'1px solid #1a1a1a',
            transition:'color .2s, border-color .2s',
          }}
          onMouseEnter={(e: any) => { e.target.style.color='#555'; e.target.style.borderColor='#333' }}
          onMouseLeave={(e: any) => { e.target.style.color='#2a2a2a'; e.target.style.borderColor='#1a1a1a' }}
          >Admin</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'80px 48px 60px', borderBottom:'1px solid #141414' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ fontSize:8, letterSpacing:6, color:'#333', textTransform:'uppercase', marginBottom:24 }}>
            — Institutional Equity Research
          </div>
          <h1 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:'clamp(40px,6vw,72px)', fontWeight:300,
            color:'#fff', lineHeight:1.05, marginBottom:32,
          }}>
            Equity Analysis &<br />
            <em style={{ color:'#f5c842', fontStyle:'italic' }}>Market Intelligence</em>
          </h1>
          <div style={{ height:1, background:'linear-gradient(90deg,#f5c84240,transparent)', marginBottom:32, animation:'lineGrow 1s ease' }} />

          {/* Stats row */}
          <div style={{ display:'flex', gap:1, flexWrap:'wrap' }}>
            {[
              { label:'Total Reports',  value: analyses?.length ?? 0, color:'#d4cfc8' },
              { label:'Buy Ratings',    value: buyCount,              color:'#4ec994'  },
              { label:'Hold Ratings',   value: holdCount,             color:'#f5c842'  },
              { label:'Sell Ratings',   value: sellCount,             color:'#e05555'  },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ flex:'1 1 120px' }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:400, color:s.color, lineHeight:1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize:8, letterSpacing:3, color:'#333', textTransform:'uppercase', marginTop:8 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reports Grid */}
      <main style={{ padding:'48px', maxWidth:1248, margin:'0 auto' }}>
        <div style={{ fontSize:8, letterSpacing:4, color:'#2a2a2a', textTransform:'uppercase', marginBottom:32 }}>
          Published Reports
        </div>

        {!analyses || analyses.length === 0 ? (
          <div style={{ textAlign:'center', padding:'100px 0', color:'#222', fontSize:11, letterSpacing:3, textTransform:'uppercase' }}>
            Keine Analysen verfügbar
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:1 }}>
            {analyses.map((a, i) => {
              const rc = RATING_COLOR[a.rating] ?? RATING_COLOR.WATCH
              const pdfUrl = getPdfUrl(a.pdf_path)
              return (
                <div key={a.id} className="card" style={{ animationDelay:`${i*0.06}s` }}>

                  {/* Header row */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:3, height:24, background:rc.text, borderRadius:1 }} />
                      <div style={{ fontSize:10, letterSpacing:4, color:'#555', textTransform:'uppercase', fontWeight:500 }}>
                        {a.ticker}
                      </div>
                    </div>
                    <div style={{
                      padding:'4px 12px', fontSize:8, letterSpacing:3, fontWeight:500,
                      background:rc.bg, color:rc.text, border:`1px solid ${rc.border}`,
                    }}>
                      {a.rating}
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{
                    fontFamily:"'Cormorant Garamond',serif",
                    fontSize:24, fontWeight:400, color:'#f0ece4',
                    lineHeight:1.25, marginBottom:16,
                  }}>
                    {a.title}
                  </div>

                  {/* Description */}
                  {a.description && (
                    <div style={{ fontSize:11, color:'#3a3a3a', lineHeight:1.8, marginBottom:24 }}>
                      {a.description}
                    </div>
                  )}

                  {/* Meta tags */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                    {a.sector && (
                      <span style={{ fontSize:8, letterSpacing:2, color:'#2a2a2a', border:'1px solid #1c1c1c', padding:'4px 10px', textTransform:'uppercase' }}>
                        {a.sector}
                      </span>
                    )}
                    {a.analyst && (
                      <span style={{ fontSize:8, letterSpacing:2, color:'#2a2a2a', border:'1px solid #1c1c1c', padding:'4px 10px', textTransform:'uppercase' }}>
                        {a.analyst}
                      </span>
                    )}
                  </div>

                  {/* Prices */}
                  {(a.current_price || a.price_target) && (
                    <div style={{
                      display:'grid', gridTemplateColumns:'1fr 1fr',
                      gap:1, marginBottom:28,
                      border:'1px solid #1c1c1c', overflow:'hidden',
                    }}>
                      {a.current_price && (
                        <div style={{ padding:'16px 20px', background:'#0a0a0a' }}>
                          <div style={{ fontSize:8, letterSpacing:3, color:'#2a2a2a', textTransform:'uppercase', marginBottom:8 }}>
                            Aktuell
                          </div>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:'#d4cfc8', fontWeight:400 }}>
                            ${Number(a.current_price).toLocaleString('de-DE')}
                          </div>
                        </div>
                      )}
                      {a.price_target && (
                        <div style={{ padding:'16px 20px', background:'#0a0a0a' }}>
                          <div style={{ fontSize:8, letterSpacing:3, color:'#2a2a2a', textTransform:'uppercase', marginBottom:8 }}>
                            Kursziel
                          </div>
                          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:'#f5c842', fontWeight:400 }}>
                            ${Number(a.price_target).toLocaleString('de-DE')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    {pdfUrl ? (
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-btn">
                        <span style={{ fontSize:12 }}>↓</span> Report öffnen
                      </a>
                    ) : (
                      <div />
                    )}
                    <div style={{ fontSize:9, color:'#222', letterSpacing:1 }}>
                      {new Date(a.created_at).toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop:80, borderTop:'1px solid #141414', padding:'32px 48px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:'#222' }}>Alpha Desk</div>
          <div style={{ fontSize:8, letterSpacing:2, color:'#1a1a1a', textTransform:'uppercase' }}>
            © {new Date().getFullYear()} · All rights reserved
          </div>
        </div>
        <div style={{ fontSize:8, letterSpacing:2, color:'#1a1a1a', textTransform:'uppercase' }}>
          Institutional Research Platform
        </div>
      </footer>
    </>
  )
}