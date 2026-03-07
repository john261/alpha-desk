'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked]     = useState(false)
  const [lockUntil, setLockUntil] = useState(0)
  const [time, setTime]         = useState('')
  const [mounted, setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/admin')
    })
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick(); const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!locked) return
    const interval = setInterval(() => {
      if (Date.now() >= lockUntil) { setLocked(false); setAttempts(0) }
    }, 1000)
    return () => clearInterval(interval)
  }, [locked, lockUntil])

  const handleLogin = async () => {
    if (locked || loading) return
    if (!email || !password) { setError('CREDENTIALS REQUIRED'); return }
    if (attempts >= 5) {
      const until = Date.now() + 60000
      setLocked(true); setLockUntil(until)
      setError('ACCESS SUSPENDED · 60S LOCKOUT'); return
    }
    setLoading(true); setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= 5) {
        setLocked(true); setLockUntil(Date.now() + 60000)
        setError('ACCESS SUSPENDED · 60S LOCKOUT')
      } else {
        setError(`AUTHENTICATION FAILED · ${5 - next} ATTEMPT${5 - next !== 1 ? 'S' : ''} REMAINING`)
      }
    } else {
      router.replace(redirectTo)
    }
    setLoading(false)
  }

  const remainingSecs = locked ? Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000)) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background: #050505; font-family: 'DM Mono', monospace; overflow: hidden; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineIn { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes blink  { 0%,100%{opacity:1} 49%{opacity:1} 50%,99%{opacity:0} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #0a0a0a inset !important;
          -webkit-text-fill-color: #e8e8e8 !important;
        }
        .shake { animation: shake .35s ease; }
      `}</style>

      {/* Full-screen grid layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 480px 1fr',
        gridTemplateRows: '1fr', height: '100vh',
        background: '#050505',
      }}>

        {/* Left panel — editorial */}
        <div style={{
          borderRight: '1px solid #0e0e0e',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 52px', overflow: 'hidden', position: 'relative',
        }}>
          {/* Big watermark text */}
          <div style={{
            position: 'absolute', bottom: -40, left: -20,
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(80px, 14vw, 200px)', fontWeight: 900,
            color: '#0a0a0a', lineHeight: 1, pointerEvents: 'none',
            userSelect: 'none', whiteSpace: 'nowrap',
          }}>ALPHA</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, background: '#e8d5a0', borderRadius: '50%', animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: 8, letterSpacing: 4, color: '#252525', textTransform: 'uppercase' }}>Live System</span>
          </div>

          <div>
            <div style={{ fontSize: 9, letterSpacing: 4, color: '#1a1a1a', marginBottom: 16 }}>SYSTEM TIME</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#111', letterSpacing: -1 }}>
              {time}
            </div>
          </div>
        </div>

        {/* Center — login form */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px 52px',
          borderRight: '1px solid #0e0e0e',
          animation: mounted ? 'fadeIn .5s ease' : 'none',
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 60 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900,
              color: '#fff', letterSpacing: -1, marginBottom: 4,
            }}>Alpha Desk</div>
            <div style={{
              height: 2, background: '#e8d5a0', width: 40,
              transformOrigin: 'left', animation: 'lineIn .6s .3s ease both',
            }} />
          </div>

          <div style={{ fontSize: 9, letterSpacing: 4, color: '#222', textTransform: 'uppercase', marginBottom: 36 }}>
            Restricted Access
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: '#2a2a2a', textTransform: 'uppercase', marginBottom: 10 }}>
              Email
            </div>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={locked}
              autoComplete="email"
              style={{
                width: '100%', background: '#0a0a0a',
                border: 'none', borderBottom: '1px solid #1a1a1a',
                color: '#e8e8e8', padding: '14px 0', fontSize: 13,
                fontFamily: "'DM Mono', monospace", outline: 'none',
                letterSpacing: .5, opacity: locked ? .3 : 1, transition: 'border-color .2s',
              }}
              onFocus={e => !locked && (e.target.style.borderColor = '#e8d5a0')}
              onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: '#2a2a2a', textTransform: 'uppercase', marginBottom: 10 }}>
              Password
            </div>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={locked}
              autoComplete="current-password"
              style={{
                width: '100%', background: '#0a0a0a',
                border: 'none', borderBottom: '1px solid #1a1a1a',
                color: '#e8e8e8', padding: '14px 0', fontSize: 13,
                fontFamily: "'DM Mono', monospace", outline: 'none',
                letterSpacing: 2, opacity: locked ? .3 : 1, transition: 'border-color .2s',
              }}
              onFocus={e => !locked && (e.target.style.borderColor = '#e8d5a0')}
              onBlur={e => (e.target.style.borderColor = '#1a1a1a')}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="shake" style={{
              fontSize: 9, letterSpacing: 2, marginBottom: 24,
              color: locked ? '#ff3b3b' : '#664400',
              borderLeft: `2px solid ${locked ? '#ff3b3b' : '#332200'}`,
              paddingLeft: 12, lineHeight: 1.6,
            }}>
              {locked ? `⚠ ${error} (${remainingSecs}s)` : error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading || locked}
            style={{
              width: '100%', fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: 5, textTransform: 'uppercase',
              background: loading || locked ? '#111' : '#fff',
              border: 'none', color: loading || locked ? '#333' : '#000',
              padding: '18px', cursor: locked ? 'not-allowed' : 'pointer',
              transition: 'all .25s',
            }}
            onMouseEnter={e => { if (!locked && !loading) (e.target as any).style.background = '#e8d5a0' }}
            onMouseLeave={e => { if (!locked && !loading) (e.target as any).style.background = '#fff' }}
          >
            {loading ? 'Authenticating...' : locked ? `Locked · ${remainingSecs}s` : 'Access System →'}
          </button>

          {/* Security note */}
          <div style={{
            marginTop: 48, fontSize: 8, letterSpacing: 2, color: '#151515',
            lineHeight: 2, textTransform: 'uppercase',
          }}>
            Protected by Supabase Auth<br />
            All attempts are logged & monitored
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 52px', overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', bottom: -40, right: -20,
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(80px, 14vw, 200px)', fontWeight: 900,
            color: '#0a0a0a', lineHeight: 1, pointerEvents: 'none',
            userSelect: 'none', whiteSpace: 'nowrap',
          }}>DESK</div>

          <div style={{ alignSelf: 'flex-end', fontSize: 8, letterSpacing: 4, color: '#161616', textTransform: 'uppercase' }}>
            v2.0
          </div>

          <div>
            <div style={{ fontSize: 9, letterSpacing: 4, color: '#1a1a1a', marginBottom: 16 }}>Security Level</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 700, color: '#111', letterSpacing: -1 }}>
              ██████
            </div>
          </div>
        </div>
      </div>
    </>
  )
}