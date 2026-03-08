'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Analysis } from '@/lib/supabase/types'
import AnalysisCardsGrid from '@/components/AnalysisCardsGrid'

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

      if (!data) { setLoading(false); return }

      const withUrls = await Promise.all(
        (data as Analysis[]).map(async (a) => {
          if (!a.pdf_path) return { ...a, pdfUrl: null }
          const { data: signed } = await supabase.storage
            .from('analyses-pdfs')
            .createSignedUrl(a.pdf_path, 60 * 60)
          return { ...a, pdfUrl: signed?.signedUrl ?? null }
        })
      )

      setAnalyses(withUrls as any)
      setLoading(false)
    }
    load()
  }, [])

  const buyCount  = analyses.filter(a => a.rating === 'BUY').length
  const holdCount = analyses.filter(a => a.rating === 'HOLD').length
  const sellCount = analyses.filter(a => a.rating === 'SELL').length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Mono:wght@300;400&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ebebeb; color: #1a1a2e; font-family: 'Lato', sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        /* ── Force 3 columns ── */
        .ac-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 1024px) {
          .ac-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .ac-grid { grid-template-columns: 1fr !important; }
        }

        .nav-admin {
          font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px;
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.5); padding: 6px 16px;
          text-transform: uppercase; text-decoration: none; transition: all 0.2s;
        }
        .nav-admin:hover { border-color: #c9a227; color: #c9a227; }

        .footer-link {
          font-size: 8px; letter-spacing: 2px; color: rgba(255,255,255,0.3);
          text-transform: uppercase; text-decoration: none; transition: color 0.2s;
        }
        .footer-link:hover { color: #c9a227; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: 'linear-gradient(175deg,#0c1428 0%,#131d35 100%)', borderBottom: '2px solid #c9a227' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 400, color: '#fff', letterSpacing: 3 }}>
            Alpha<span style={{ color: '#c9a227' }}>Desk</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="/admin" className="nav-admin">ADMIN</a>
          </div>
        </div>

        {/* Sub nav */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 48px' }}>
          <span style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
            RESEARCH ANALYSEN
          </span>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '26px 48px 28px', animation: 'fadeUp 0.55s ease' }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: 'rgba(201,162,39,0.75)', marginBottom: 10, textTransform: 'uppercase' }}>
            INSTITUTIONAL  EQUITY  RESEARCH
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 46, color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
            Equity Analysis &amp;&nbsp;<em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Market Intelligence</em>
          </h1>
          <div style={{ width: 56, height: 2, background: '#c9a227', margin: '0 auto 10px' }} />
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
            PROFESSIONAL RESEARCH · INDEPENDENT ANALYSIS
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.18)' }}>
          {[
            { n: loading ? '—' : String(buyCount),   label: 'Buy Ratings',  dot: '#4ec994' },
            { n: loading ? '—' : String(holdCount),  label: 'Hold Ratings', dot: '#c9a84c' },
            { n: loading ? '—' : String(sellCount),  label: 'Sell Ratings', dot: '#e05555' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '20px 48px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300, color: '#e8e6e0', lineHeight: 1 }}>{s.n}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, display: 'inline-block', marginBottom: 3 }} />
              </div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 48px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 400 }}>
            Published Reports
          </h2>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 2, color: '#999', textTransform: 'uppercase' }}>
            ({analyses.length} AVAILABLE)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#aaa', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3 }}>
            LOADING...
          </div>
        ) : (
          <AnalysisCardsGrid analyses={analyses as any} />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0c1428', borderTop: '2px solid #c9a227' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: 'rgba(255,255,255,0.22)', letterSpacing: 3 }}>
            Alpha<span style={{ color: '#c9a227' }}>Desk</span>
          </div>
          <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', textAlign: 'center' }}>
            FOR INFORMATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="/impressum"   className="footer-link">Impressum</a>
            <a href="/datenschutz" className="footer-link">Datenschutz</a>
            <a href="/agb"         className="footer-link">AGB</a>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', padding: '12px 48px' }}>
          <span style={{ fontSize: 8, letterSpacing: 1, color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
            © {new Date().getFullYear()} AlphaDesk
          </span>
        </div>
      </footer>
    </>
  )
}