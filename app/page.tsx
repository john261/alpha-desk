'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/admin'
  const supabase = createClient()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [attempts, setAttempts]   = useState(0)
  const [locked, setLocked]       = useState(false)
  const [lockUntil, setLockUntil] = useState(0)
  const [secs, setSecs]           = useState(0)

  useEffect(() => {
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
    if (!email.trim() || !password.trim()) { setError('Bitte E-Mail und Passwort eingeben.'); return }
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #141414; font-family: 'DM Mono', monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #1e1e1e inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #f5c842;
        }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#141414',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          padding: '56px 48px',
          animation: 'fadeUp .45s ease',
        }}>

          {/* Logo */}
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32, fontWeight: 900, color: '#fff',
              letterSpacing: -1, marginBottom: 10,
            }}>Alpha Desk</div>
            <div style={{ width: 40, height: 3, background: '#f5c842', borderRadius: 1 }} />
          </div>

          <div style={{ fontSize: 10, letterSpacing: 4, color: '#555', textTransform: 'uppercase', marginBottom: 32 }}>
            Admin Login
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', fontSize: 10, letterSpacing: 3,
              color: '#888', textTransform: 'uppercase', marginBottom: 10,
            }}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={locked}
              autoComplete="email"
              placeholder="admin@example.com"
              style={{
                width: '100%',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 2,
                color: '#fff',
                padding: '13px 16px',
                fontSize: 13,
                fontFamily: "'DM Mono', monospace",
                outline: 'none',
                opacity: locked ? .4 : 1,
                transition: 'border-color .2s',
              }}
              onFocus={e => !locked && (e.currentTarget.style.borderColor = '#f5c842')}
              onBlur={e => (e.currentTarget.style.borderColor = '#333')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 32 }}>
            <label style={{
              display: 'block', fontSize: 10, letterSpacing: 3,
              color: '#888', textTransform: 'uppercase', marginBottom: 10,
            }}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              disabled={locked}
              autoComplete="current-password"
              placeholder="••••••••••••"
              style={{
                width: '100%',
                background: '#222',
                border: '1px solid #333',
                borderRadius: 2,
                color: '#fff',
                padding: '13px 16px',
                fontSize: 13,
                fontFamily: "'DM Mono', monospace",
                outline: 'none',
                opacity: locked ? .4 : 1,
                transition: 'border-color .2s',
                letterSpacing: 3,
              }}
              onFocus={e => !locked && (e.currentTarget.style.borderColor = '#f5c842')}
              onBlur={e => (e.currentTarget.style.borderColor = '#333')}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              fontSize: 11, color: locked ? '#ff6b6b' : '#ffaa44',
              background: locked ? 'rgba(255,107,107,0.08)' : 'rgba(255,170,68,0.08)',
              border: `1px solid ${locked ? 'rgba(255,107,107,0.25)' : 'rgba(255,170,68,0.25)'}`,
              padding: '10px 14px', marginBottom: 20, lineHeight: 1.5,
              borderRadius: 2,
            }}>
              {locked ? `🔒 ${error} (${secs}s)` : `⚠ ${error}`}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading || locked}
            style={{
              width: '100%',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, letterSpacing: 4, textTransform: 'uppercase',
              background: loading || locked ? '#2a2a2a' : '#f5c842',
              border: 'none',
              color: loading || locked ? '#555' : '#000',
              padding: '16px',
              cursor: locked || loading ? 'not-allowed' : 'pointer',
              transition: 'all .2s',
              fontWeight: 500,
              borderRadius: 2,
            }}
            onMouseEnter={e => { if (!locked && !loading) (e.currentTarget.style.background = '#ffd84d') }}
            onMouseLeave={e => { if (!locked && !loading) (e.currentTarget.style.background = '#f5c842') }}
          >
            {loading ? 'Wird geprüft…' : locked ? `Gesperrt (${secs}s)` : 'Einloggen →'}
          </button>

          {/* Footer note */}
          <div style={{
            marginTop: 36, fontSize: 9, letterSpacing: 2, color: '#333',
            textAlign: 'center', lineHeight: 1.8, textTransform: 'uppercase',
          }}>
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