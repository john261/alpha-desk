'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  const supabase = createClient()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [attempts, setAttempts]     = useState(0)
  const [locked, setLocked]         = useState(false)
  const [lockUntil, setLockUntil]   = useState(0)
  const [secs, setSecs]             = useState(0)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/admin')
    })
  }, [])

  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000)
      if (remaining <= 0) { setLocked(false); setAttempts(0); setError('') }
      else setSecs(remaining)
    }, 500)
    return () => clearInterval(id)
  }, [locked, lockUntil])

  const handleLogin = async () => {
    if (locked || loading) return
    if (!email.trim() || !password.trim()) { setError('E-Mail und Passwort eingeben.'); return }
    if (attempts >= 5) {
      const until = Date.now() + 60000
      setLocked(true); setLockUntil(until); setSecs(60)
      setError('Zu viele Versuche. 60 Sekunden gesperrt.'); return
    }
    setLoading(true); setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (authError) {
      const next = attempts + 1; setAttempts(next)
      if (next >= 5) {
        const until = Date.now() + 60000
        setLocked(true); setLockUntil(until); setSecs(60)
        setError('Zu viele Versuche. 60 Sekunden gesperrt.')
      } else {
        setError(`Falsche Anmeldedaten. Noch ${5 - next} Versuch${5 - next !== 1 ? 'e' : ''}.`)
      }
    } else {
      router.replace(redirectTo)
    }
    setLoading(false)
  }

  // Floating ticker symbols for background
  const tickers = ['AAPL','MSFT','GOOGL','AMZN','NVDA','TSLA','META','BRK','JPM','V','MA','UNH','XOM','JNJ','WMT','PG','DAX','SAP','ALV','MUV2','SIE','BMW','VOW','DTE','RWE','BAS','BAY','MRK','DB','ADS']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html, body { height:100%; }
        body { font-family:'DM Mono',monospace; overflow:hidden; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineIn   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes floatUp  { 0%{transform:translateY(110vh) rotate(var(--r))} 100%{transform:translateY(-10vh) rotate(var(--r))} }
        @keyframes pulse    { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }

        /* ── BACKGROUND ── */
        .bg {
          position:fixed; inset:0;
          background: linear-gradient(135deg, #0a1628 0%, #0d2040 35%, #1a1a2e 65%, #0a1628 100%);
        }

        /* Grid overlay */
        .bg-grid {
          position:fixed; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(201,162,39,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,162,39,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Radial glow */
        .bg-glow {
          position:fixed; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,162,39,0.06) 0%, transparent 70%);
        }

        /* Floating tickers */
        .ticker-pool { position:fixed; inset:0; pointer-events:none; overflow:hidden; }
        .ticker-item {
          position:absolute; bottom:-40px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:3px;
          color:rgba(201,162,39,0.12); white-space:nowrap;
          animation: floatUp linear infinite;
        }

        /* Chart lines decoration */
        .chart-lines {
          position:fixed; bottom:0; left:0; right:0; height:180px; pointer-events:none;
          opacity:.08;
        }

        /* ── CARD ── */
        .card-wrap {
          position:relative; z-index:10;
          min-height:100vh; display:flex; align-items:center; justify-content:center;
          padding:24px;
        }

        .card {
          width:100%; max-width:460px;
          background: rgba(255,255,255,0.97);
          box-shadow:
            0 0 0 1px rgba(201,162,39,0.2),
            0 32px 80px rgba(0,0,0,0.4),
            0 0 120px rgba(201,162,39,0.06);
          padding: 52px 48px 44px;
          animation: fadeUp .5s ease both;
          position:relative; overflow:hidden;
        }

        /* Gold accent top bar */
        .card::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background: linear-gradient(90deg, #c9a227, #f0d870, #c9a227);
          background-size:200% auto;
          animation: shimmer 3s linear infinite;
        }

        /* Corner decoration */
        .card::after {
          content:'';
          position:absolute; bottom:0; right:0;
          width:120px; height:120px;
          background: radial-gradient(circle at bottom right, rgba(201,162,39,0.06), transparent 70%);
          pointer-events:none;
        }

        /* ── LOGO ── */
        .logo { margin-bottom:36px; }
        .logo-text { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:700; color:#0a1628; letter-spacing:-1px; line-height:1; }
        .logo-text span { color:#c9a227; }
        .logo-line {
          width:40px; height:2px; margin-top:10px;
          background:linear-gradient(90deg,#c9a227,#f0d870);
          transform-origin:left;
          animation: lineIn .6s .4s ease both;
        }
        .logo-sub { font-size:7px; letter-spacing:5px; color:#94a3b8; text-transform:uppercase; margin-top:6px; }

        /* ── EYEBROW ── */
        .eyebrow { font-size:8px; letter-spacing:4px; color:#94a3b8; text-transform:uppercase; margin-bottom:28px; }

        /* ── INPUTS ── */
        .field { margin-bottom:18px; }
        .field-label { display:block; font-size:8px; letter-spacing:3px; color:#94a3b8; text-transform:uppercase; margin-bottom:8px; }
        .field-input {
          width:100%; padding:13px 16px;
          background:#f8fafc; border:1px solid #e2e8f0;
          color:#0f172a; font-family:'DM Mono',monospace; font-size:13px;
          outline:none; transition:border-color .2s, background .2s, box-shadow .2s;
        }
        .field-input:focus {
          border-color:#c9a227; background:#fffdf5;
          box-shadow:0 0 0 3px rgba(201,162,39,0.08);
        }
        .field-input:disabled { opacity:.4; cursor:not-allowed; }
        .field-input:-webkit-autofill {
          -webkit-box-shadow:0 0 0 100px #f8fafc inset !important;
          -webkit-text-fill-color:#0f172a !important;
        }

        /* ── ERROR ── */
        .error-box {
          padding:10px 14px; margin-bottom:18px;
          font-size:10px; line-height:1.6; letter-spacing:.5px;
          border-left:3px solid;
        }
        .error-warn { color:#92400e; background:#fffbeb; border-color:#f59e0b; }
        .error-lock { color:#991b1b; background:#fef2f2; border-color:#ef4444; }

        /* ── BUTTON ── */
        .submit-btn {
          width:100%; padding:16px;
          font-family:'DM Mono',monospace; font-size:10px; letter-spacing:4px; font-weight:500;
          text-transform:uppercase; border:none; cursor:pointer;
          transition:all .25s; position:relative; overflow:hidden;
        }
        .submit-btn.active {
          background:#0a1628; color:#fff;
          box-shadow:0 4px 20px rgba(10,22,40,0.3);
        }
        .submit-btn.active:hover {
          background:#c9a227; color:#0a1628;
          box-shadow:0 6px 28px rgba(201,162,39,0.35);
        }
        .submit-btn.inactive { background:#f1f5f9; color:#94a3b8; cursor:not-allowed; }

        /* ── FOOTER NOTE ── */
        .foot-note { margin-top:32px; font-size:8px; letter-spacing:2px; color:#cbd5e1; text-align:center; line-height:1.8; text-transform:uppercase; }

        /* Stats decoration */
        .stats-row { display:flex; gap:1px; margin-top:28px; }
        .stat-mini { flex:1; padding:10px 12px; background:#f8fafc; border:1px solid #f1f5f9; text-align:center; }
        .stat-mini-num { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; color:#0a1628; line-height:1; }
        .stat-mini-lbl { font-size:7px; letter-spacing:2px; color:#cbd5e1; text-transform:uppercase; margin-top:3px; }

        @media (max-width:520px) {
          .card { padding:36px 24px 32px; }
          .logo-text { font-size:28px; }
          .stats-row { display:none; }
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="bg" />
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* Floating tickers */}
      <div className="ticker-pool">
        {tickers.map((t, i) => (
          <div key={t} className="ticker-item" style={{
            left: `${(i / tickers.length) * 100}%`,
            animationDuration: `${12 + (i % 7) * 3}s`,
            animationDelay: `${(i % 9) * -2}s`,
            ['--r' as any]: `${(i % 3) - 1}deg`,
          }}>
            {t} {i % 2 === 0 ? '▲' : '▼'} {(Math.random() * 5).toFixed(2)}%
          </div>
        ))}
      </div>

      {/* Chart SVG background decoration */}
      <svg className="chart-lines" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <polyline points="0,140 120,110 240,125 360,80 480,95 600,60 720,75 840,40 960,55 1080,30 1200,45 1320,20 1440,35"
          fill="none" stroke="#c9a227" strokeWidth="2"/>
        <polyline points="0,160 120,145 240,155 360,120 480,135 600,100 720,115 840,80 960,95 1080,70 1200,85 1320,60 1440,75"
          fill="none" stroke="#4ade80" strokeWidth="1.5"/>
        <polyline points="0,170 120,165 240,168 360,155 480,160 600,148 720,152 840,140 960,145 1080,132 1200,138 1320,125 1440,130"
          fill="none" stroke="#60a5fa" strokeWidth="1"/>
      </svg>

      {/* CARD */}
      <div className="card-wrap">
        <div className="card" style={{ opacity: mounted ? 1 : 0 }}>

          {/* Logo */}
          <div className="logo">
            <div className="logo-text">Alpha<span>Desk</span></div>
            <div className="logo-line" />
            <div className="logo-sub">Institutional Research Platform</div>
          </div>

          <div className="eyebrow">Admin · Restricted Access</div>

          {/* Email */}
          <div className="field">
            <label className="field-label">E-Mail</label>
            <input
              className="field-input"
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={locked} autoComplete="email"
              placeholder="admin@example.com"
            />
          </div>

          {/* Password */}
          <div className="field" style={{ marginBottom: 24 }}>
            <label className="field-label">Passwort</label>
            <input
              className="field-input"
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={locked} autoComplete="current-password"
              placeholder="••••••••••••"
              style={{ letterSpacing: 3 }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className={`error-box ${locked ? 'error-lock' : 'error-warn'}`}>
              {locked ? `🔒 ${error} (${secs}s)` : `⚠ ${error}`}
            </div>
          )}

          {/* Button */}
          <button
            className={`submit-btn ${loading || locked ? 'inactive' : 'active'}`}
            onClick={handleLogin}
            disabled={loading || locked}
          >
            {loading ? 'Wird geprüft …' : locked ? `Gesperrt (${secs}s)` : 'Einloggen →'}
          </button>

          {/* Mini stats decoration */}
          <div className="stats-row">
            {[
              { num: '24/7', lbl: 'Live Data' },
              { num: 'SSL', lbl: 'Encrypted' },
              { num: '2FA', lbl: 'Protected' },
            ].map(s => (
              <div key={s.lbl} className="stat-mini">
                <div className="stat-mini-num">{s.num}</div>
                <div className="stat-mini-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="foot-note">
            Geschützt durch Supabase Auth<br />
            Alle Versuche werden protokolliert
          </div>
        </div>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}