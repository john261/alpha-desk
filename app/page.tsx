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
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (!data) { setLoading(false); return }

      const withUrls = await Promise.all(
        (data as Analysis[]).map(async (a) => {
          if (!a.pdf_path) return { ...a, pdfUrl: null }
          try {
            const res = await fetch(`/api/signed-url?path=${encodeURIComponent(a.pdf_path)}`)
            const json = await res.json()
            return { ...a, pdfUrl: json.url ?? null }
          } catch {
            return { ...a, pdfUrl: null }
          }
        })
      )

      setAnalyses(withUrls)
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

        /* ── Grid ── */
        .ac-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 1024px) {
          .ac-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .ac-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Nav ── */
        .nav-admin {
          font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px;
          background: transparent; border: 1px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.5); padding: 6px 16px;
          text-transform: uppercase; text-decoration: none; transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-admin:hover { border-color: #c9a227; color: #c9a227; }

        .footer-link {
          font-size: 8px; letter-spacing: 2px; color: rgba(255,255,255,0.3);
          text-transform: uppercase; text-decoration: none; transition: color 0.2s;
        }
        .footer-link:hover { color: #c9a227; }

        /* ── Header layout ── */
        .header-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 48px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .header-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          color: #fff;
          letter-spacing: 3px;
        }

        .header-subnav {
          display: flex;
          justify-content: center;
          padding: 8px 48px;
        }
        .header-subnav span {
          font-size: 9px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
        }

        .header-hero {
          text-align: center;
          padding: 26px 48px 28px;
          animation: fadeUp 0.55s ease;
        }
        .header-hero-eyebrow {
          font-size: 9px;
          letter-spacing: 5px;
          color: rgba(201,162,39,0.75);
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .header-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 46px;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .header-hero-divider {
          width: 56px; height: 2px;
          background: #c9a227;
          margin: 0 auto 10px;
        }
        .header-hero-tagline {
          font-size: 10px;
          letter-spacing: 4px;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
        }

        /* ── Stats bar ── */
        .stats-bar {
          display: flex;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,0,0,0.18);
        }
        .stats-item {
          flex: 1;
          padding: 20px 48px;
        }
        .stats-item:not(:last-child) {
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .stats-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px;
          font-weight: 300;
          color: #e8e6e0;
          line-height: 1;
        }
        .stats-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          display: inline-block;
          margin-left: 8px;
          margin-bottom: 3px;
          vertical-align: baseline;
        }
        .stats-label {
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* ── Main ── */
        .main-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 48px 80px;
        }
        .main-heading-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 32px;
        }
        .main-heading-row h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 400;
        }
        .main-heading-row span {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #999;
          text-transform: uppercase;
        }

        /* ── Footer ── */
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          color: rgba(255,255,255,0.22);
          letter-spacing: 3px;
        }
        .footer-disclaimer {
          font-size: 8px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.18);
          text-transform: uppercase;
          text-align: center;
        }
        .footer-links {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .footer-copy {
          border-top: 1px solid rgba(255,255,255,0.06);
          text-align: center;
          padding: 12px 48px;
        }
        .footer-copy span {
          font-size: 8px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.15);
          text-transform: uppercase;
        }

        /* ════════════════════════════════
           MOBILE OVERRIDES (≤ 640px)
        ════════════════════════════════ */
        @media (max-width: 640px) {

          /* Top bar */
          .header-topbar {
            padding: 12px 20px;
          }
          .header-logo {
            font-size: 20px;
            letter-spacing: 2px;
          }

          /* Sub nav */
          .header-subnav {
            padding: 6px 20px;
          }
          .header-subnav span {
            font-size: 7px;
            letter-spacing: 3px;
          }

          /* Hero */
          .header-hero {
            padding: 20px 20px 22px;
          }
          .header-hero-eyebrow {
            font-size: 7px;
            letter-spacing: 3px;
          }
          .header-hero h1 {
            font-size: 30px;
            margin-bottom: 8px;
          }
          .header-hero-tagline {
            font-size: 7px;
            letter-spacing: 2.5px;
          }

          /* Stats bar — stacked on mobile */
          .stats-bar {
            flex-direction: row; /* keep row but shrink padding */
          }
          .stats-item {
            padding: 14px 12px;
          }
          .stats-number {
            font-size: 28px;
          }
          .stats-dot {
            width: 6px; height: 6px;
            margin-left: 5px;
          }
          .stats-label {
            font-size: 7px;
            letter-spacing: 1px;
          }

          /* Main */
          .main-wrap {
            padding: 28px 20px 60px;
          }
          .main-heading-row {
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 20px;
          }
          .main-heading-row h2 {
            font-size: 22px;
          }

          /* Footer */
          .footer-inner {
            padding: 20px 20px;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .footer-disclaimer {
            text-align: left;
          }
          .footer-copy {
            padding: 10px 20px;
          }
        }

        /* ── Tablet (641–1024px) ── */
        @media (min-width: 641px) and (max-width: 1024px) {
          .header-topbar { padding: 14px 28px; }
          .header-subnav { padding: 8px 28px; }
          .header-hero   { padding: 22px 28px 24px; }
          .header-hero h1 { font-size: 38px; }
          .stats-item { padding: 16px 24px; }
          .main-wrap { padding: 36px 28px 72px; }
          .footer-inner { padding: 24px 28px; }
          .footer-copy  { padding: 12px 28px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: 'linear-gradient(175deg,#0c1428 0%,#131d35 100%)', borderBottom: '2px solid #c9a227' }}>

        {/* Top bar */}
        <div className="header-topbar">
          <div className="header-logo">
            Alpha<span style={{ color: '#c9a227' }}>Desk</span>
          </div>
          <a href="/admin" className="nav-admin">ADMIN</a>
        </div>

        {/* Sub nav */}
        <div className="header-subnav">
          <span>RESEARCH ANALYSEN</span>
        </div>

        {/* Hero */}
        <div className="header-hero">
          <div className="header-hero-eyebrow">INSTITUTIONAL EQUITY RESEARCH</div>
          <h1>
            Equity Analysis &amp;&nbsp;<em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Market Intelligence</em>
          </h1>
          <div className="header-hero-divider" />
          <div className="header-hero-tagline">PROFESSIONAL RESEARCH · INDEPENDENT ANALYSIS</div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          {[
            { n: loading ? '—' : String(buyCount),   label: 'Buy Ratings',  dot: '#4ec994' },
            { n: loading ? '—' : String(holdCount),  label: 'Hold Ratings', dot: '#c9a84c' },
            { n: loading ? '—' : String(sellCount),  label: 'Sell Ratings', dot: '#e05555' },
          ].map((s, i) => (
            <div key={i} className="stats-item">
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className="stats-number">{s.n}</span>
                <span className="stats-dot" style={{ background: s.dot }} />
              </div>
              <div className="stats-label">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="main-wrap">
        <div className="main-heading-row">
          <h2>Published Reports</h2>
          <span>({analyses.length} AVAILABLE)</span>
        </div>

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#aaa', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3 }}>
            LOADING...
          </div>
        ) : (
          <AnalysisCardsGrid analyses={analyses} />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0c1428', borderTop: '2px solid #c9a227' }}>
        <div className="footer-inner">
          <div className="footer-logo">
            Alpha<span style={{ color: '#c9a227' }}>Desk</span>
          </div>
          <div className="footer-disclaimer">
            FOR INFORMATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE
          </div>
          <div className="footer-links">
            <a href="/impressum"   className="footer-link">Impressum</a>
            <a href="/datenschutz" className="footer-link">Datenschutz</a>
            <a href="/agb"         className="footer-link">AGB</a>
          </div>
        </div>
        <div className="footer-copy">
          <span>© AlphaDesk</span>
        </div>
      </footer>
    </>
  )
}