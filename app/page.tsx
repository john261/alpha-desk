import { createClient } from '@/lib/supabase/server'

const RATING_COLOR: Record<string, string> = {
  BUY:   '#4ec994',
  HOLD:  '#f5c842',
  SELL:  '#e05555',
  WATCH: '#888',
}

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; color: #e8e0d0; font-family: 'DM Mono', monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .card { background: #111; border: 1px solid #1e1e1e; padding: 32px; transition: border-color .2s, transform .2s; animation: fadeUp .4s ease both; }
        .card:hover { border-color: #f5c842; transform: translateY(-2px); }
        .badge { display: inline-block; padding: 3px 10px; font-size: 9px; letter-spacing: 3px; font-weight: 500; border-radius: 1px; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}>Alpha Desk</div>
          <div style={{ fontSize: 9, letterSpacing: 4, color: '#444', textTransform: 'uppercase', marginTop: 4 }}>Institutional Research</div>
        </div>
        <div style={{ width: 32, height: 2, background: '#f5c842' }} />
      </header>

      {/* Hero */}
      <div style={{ padding: '64px 48px 48px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: 9, letterSpacing: 5, color: '#555', textTransform: 'uppercase', marginBottom: 20 }}>Research Coverage</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: '#fff', lineHeight: 1.1, maxWidth: 600 }}>
          Equity Analysis &<br /><em style={{ color: '#f5c842' }}>Market Intelligence</em>
        </div>
        <div style={{ marginTop: 20, fontSize: 12, color: '#555', letterSpacing: 1 }}>
          {analyses?.length ?? 0} published report{analyses?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid */}
      <main style={{ padding: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {!analyses || analyses.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: '#333', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
            Keine Analysen verfügbar
          </div>
        ) : analyses.map((a, i) => (
          <div key={a.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: '#555', textTransform: 'uppercase' }}>{a.ticker}</div>
              <span className="badge" style={{ background: `${RATING_COLOR[a.rating]}18`, color: RATING_COLOR[a.rating], border: `1px solid ${RATING_COLOR[a.rating]}40` }}>
                {a.rating}
              </span>
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>
              {a.title}
            </div>

            {a.description && (
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>{a.description}</div>
            )}

            <div style={{ display: 'flex', gap: 20, fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 20 }}>
              {a.sector && <span>{a.sector}</span>}
              {a.analyst && <span>by {a.analyst}</span>}
            </div>

            {(a.current_price || a.price_target) && (
              <div style={{ display: 'flex', gap: 24, padding: '14px 0', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', marginBottom: 20 }}>
                {a.current_price && (
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>Kurs</div>
                    <div style={{ fontSize: 14, color: '#e8e0d0' }}>${a.current_price}</div>
                  </div>
                )}
                {a.price_target && (
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>Kursziel</div>
                    <div style={{ fontSize: 14, color: '#f5c842' }}>${a.price_target}</div>
                  </div>
                )}
              </div>
            )}

            {a.pdf_path && (
              <a href={a.pdf_path} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#f5c842', textDecoration: 'none', marginTop: 4 }}>
                ↓ Report öffnen
              </a>
            )}

            <div style={{ marginTop: 20, fontSize: 9, color: '#333', letterSpacing: 1 }}>
              {new Date(a.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#333', textTransform: 'uppercase' }}>Alpha Desk © {new Date().getFullYear()}</div>
        <a href="/login" style={{ fontSize: 9, letterSpacing: 2, color: '#333', textTransform: 'uppercase', textDecoration: 'none' }}>Admin</a>
      </footer>
    </>
  )
}