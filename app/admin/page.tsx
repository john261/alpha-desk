'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Analysis, Rating } from '@/lib/supabase/types'

const RATINGS: Rating[] = ['BUY', 'HOLD', 'SELL', 'WATCH']
const BADGE: Record<Rating, { color: string; bg: string }> = {
  BUY:   { color: '#4ec994', bg: 'rgba(78,201,148,0.08)' },
  SELL:  { color: '#e05555', bg: 'rgba(224,85,85,0.08)' },
  HOLD:  { color: '#a8a8f0', bg: 'rgba(168,168,240,0.08)' },
  WATCH: { color: '#c9a84c', bg: 'rgba(201,168,76,0.12)' },
}

// ── Nur 2 Kategorien ─────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    value: 'equity',
    label: 'Equity Research',
    icon: '◈',
    desc: 'Einzelaktien · Fundamentalanalyse',
  },
  {
    value: 'geo',
    label: 'Geopolitik & Märkte',
    icon: '◉',
    desc: 'Weltpolitik · Makro · Marktauswirkungen',
  },
]
const CATEGORY_COLORS: Record<string, string> = {
  equity: '#c9a227',
  geo:    '#38bdf8',
}

// ── Sektoren mit exakten Werten (für Dropdown + Bild-Mapping) ───────────────
const SECTORS = [
  { value: 'Technologie',                  label: 'Technologie' },
  { value: 'Software & IT',                label: 'Software & IT' },
  { value: 'Halbleiter',                   label: 'Halbleiter' },
  { value: 'Automobil & OEM',              label: 'Automobil & OEM' },
  { value: 'Autovermietung & Mobilität',   label: 'Autovermietung & Mobilität' },
  { value: 'Versicherung',                 label: 'Versicherung' },
  { value: 'Banken & Finanzen',            label: 'Banken & Finanzen' },
  { value: 'Immobilien',                   label: 'Immobilien' },
  { value: 'Energie & Utilities',          label: 'Energie & Utilities' },
  { value: 'Erneuerbare Energien',         label: 'Erneuerbare Energien' },
  { value: 'Pharma & Biotech',             label: 'Pharma & Biotech' },
  { value: 'Medizintechnik',               label: 'Medizintechnik' },
  { value: 'Konsumgüter & Handel',         label: 'Konsumgüter & Handel' },
  { value: 'Lebensmittel & Getränke',      label: 'Lebensmittel & Getränke' },
  { value: 'Industrie & Maschinenbau',     label: 'Industrie & Maschinenbau' },
  { value: 'Chemie & Werkstoffe',          label: 'Chemie & Werkstoffe' },
  { value: 'Telekommunikation',            label: 'Telekommunikation' },
  { value: 'Medien & Entertainment',       label: 'Medien & Entertainment' },
  { value: 'Transport & Logistik',         label: 'Transport & Logistik' },
  { value: 'Luft- & Raumfahrt',            label: 'Luft- & Raumfahrt' },
  { value: 'Rüstung & Defense',            label: 'Rüstung & Defense' },
  { value: 'Rohstoffe & Bergbau',          label: 'Rohstoffe & Bergbau' },
  { value: 'E-Commerce & Plattformen',     label: 'E-Commerce & Plattformen' },
  { value: 'Luxury & Fashion',             label: 'Luxury & Fashion' },
  { value: 'Gaming & Esports',             label: 'Gaming & Esports' },
  { value: 'Künstliche Intelligenz',       label: 'Künstliche Intelligenz' },
  { value: 'Krypto & Blockchain',          label: 'Krypto & Blockchain' },
  { value: 'Agrar & Forst',               label: 'Agrar & Forst' },
  { value: 'Sonstiges',                    label: 'Sonstiges' },
]

// Geo-Topics (für Kategorie "geo" statt Sektoren)
const GEO_TOPICS = [
  'USA & Fed-Politik',
  'Europa & EZB',
  'China & Asien',
  'Naher Osten',
  'Russland & Ukraine',
  'NATO & Verteidigung',
  'Handelskrieg & Zölle',
  'Rohstoff-Geopolitik',
  'Währungskrisen',
  'Sanktionen & Embargos',
  'Globale Lieferketten',
  'Energiesicherheit',
  'Sonstiges',
]

type FormData = {
  ticker: string; title: string; description: string
  rating: Rating; sector: string; analyst: string
  current_price: string; price_target: string
  category: string
}

const EMPTY_FORM: FormData = {
  ticker: '', title: '', description: '', rating: 'BUY',
  sector: SECTORS[0].value, analyst: '', current_price: '', price_target: '',
  category: 'equity',
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [analyses, setAnalyses]   = useState<Analysis[]>([])
  const [form, setForm]           = useState<FormData>(EMPTY_FORM)
  const [pdfFile, setPdfFile]     = useState<File | null>(null)
  const [drag, setDrag]           = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [tab, setTab]             = useState<'upload' | 'manage'>('upload')
  const [userEmail, setUserEmail] = useState('')

  const [editId, setEditId]                   = useState<string | null>(null)
  const [existingPdfPath, setExistingPdfPath] = useState<string | null>(null)
  const [existingPdfName, setExistingPdfName] = useState<string | null>(null)
  const [replacePdf, setReplacePdf]           = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      setUserEmail(user.email || '')
    })
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    const { data } = await (supabase as any)
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAnalyses(data as Analysis[])
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'application/pdf') { showToast('ONLY PDF FILES ACCEPTED', false); return }
    if (file.size > 50 * 1024 * 1024)   { showToast('FILE TOO LARGE (MAX 50MB)', false); return }
    setPdfFile(file)
  }, [])

  function startEdit(a: Analysis) {
    setEditId(a.id)
    setExistingPdfPath(a.pdf_path ?? null)
    setExistingPdfName(a.pdf_name ?? null)
    setReplacePdf(false)
    setPdfFile(null)
    const cat = (a as any).category ?? 'equity'
    setForm({
      ticker:        a.ticker,
      title:         a.title,
      description:   a.description ?? '',
      rating:        a.rating,
      sector:        a.sector ?? SECTORS[0].value,
      analyst:       a.analyst ?? '',
      current_price: a.current_price != null ? String(a.current_price) : '',
      price_target:  a.price_target  != null ? String(a.price_target)  : '',
      category:      cat,
    })
    setTab('upload')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditId(null)
    setExistingPdfPath(null)
    setExistingPdfName(null)
    setReplacePdf(false)
    setPdfFile(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave(publish: boolean) {
    if (!form.ticker.trim() || !form.title.trim()) {
      showToast('TICKER & TITLE ARE REQUIRED', false); return
    }
    setSaving(true)

    let pdf_path = existingPdfPath
    let pdf_name = existingPdfName

    if (pdfFile && (!editId || replacePdf)) {
      if (editId && existingPdfPath) {
        await supabase.storage.from('analyses-pdfs').remove([existingPdfPath])
      }
      const ext  = pdfFile.name.split('.').pop()
      const path = `${Date.now()}_${form.ticker.toUpperCase()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('analyses-pdfs')
        .upload(path, pdfFile, { cacheControl: '3600', upsert: false })
      if (uploadError) {
        showToast(`UPLOAD FAILED: ${uploadError.message}`, false)
        setSaving(false); return
      }
      pdf_path = path
      pdf_name = pdfFile.name
    }

    const payload = {
      ticker:        form.ticker.toUpperCase().trim(),
      title:         form.title.trim(),
      description:   form.description.trim() || null,
      rating:        form.rating,
      sector:        form.sector || null,
      analyst:       form.analyst.trim() || null,
      current_price: form.current_price ? parseFloat(form.current_price) : null,
      price_target:  form.price_target  ? parseFloat(form.price_target)  : null,
      category:      form.category,
      pdf_path,
      pdf_name,
      published:     publish,
    }

    let error: any = null

    if (editId) {
      ;({ error } = await (supabase as any)
        .from('analyses').update(payload).eq('id', editId))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      ;({ error } = await (supabase as any)
        .from('analyses').insert({ ...payload, author_id: user?.id ?? null }))
    }

    if (error) {
      showToast(`ERROR: ${error.message}`, false)
    } else {
      showToast(
        editId
          ? (publish ? '✓ CHANGES PUBLISHED' : '✓ DRAFT UPDATED')
          : (publish ? '✓ ANALYSIS PUBLISHED LIVE' : '✓ SAVED AS DRAFT')
      )
      cancelEdit()
      loadAnalyses()
      setTab('manage')
    }
    setSaving(false)
  }

  async function togglePublish(a: Analysis) {
    const { error } = await (supabase as any)
      .from('analyses').update({ published: !a.published }).eq('id', a.id)
    if (!error) {
      setAnalyses(prev => prev.map(x => x.id === a.id ? { ...x, published: !x.published } : x))
      showToast(!a.published ? '✓ PUBLISHED' : '✓ SET TO DRAFT')
    }
  }

  async function deleteAnalysis(a: Analysis) {
    if (!confirm(`Delete "${a.title}"? This cannot be undone.`)) return
    if (a.pdf_path) {
      await supabase.storage.from('analyses-pdfs').remove([a.pdf_path])
    }
    const { error } = await (supabase as any).from('analyses').delete().eq('id', a.id)
    if (!error) {
      setAnalyses(prev => prev.filter(x => x.id !== a.id))
      if (editId === a.id) cancelEdit()
      showToast('✓ DELETED')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const F = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: 'DM Mono, monospace', fontSize: 12,
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '14px 16px', outline: 'none',
  }

  const activeCat = CATEGORIES.find(c => c.value === form.category) ?? CATEGORIES[0]
  const catColor  = CATEGORY_COLORS[form.category] ?? '#c9a227'
  const isEquity  = form.category === 'equity'

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none }
        .row-hover:hover { background: rgba(255,255,255,0.03) !important; }
        .focus-gold:focus { border-color: var(--gold) !important; }
        .btn-edit:hover { border-color: var(--gold) !important; color: var(--gold) !important; }
        .cat-btn { transition: all .2s ease; }
        .cat-btn:hover { opacity: 1 !important; }
        select option { background: #0d1220; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 0 }} />
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.025, zIndex: 0,
        backgroundImage: 'linear-gradient(var(--gold) 1px,transparent 1px),linear-gradient(90deg,var(--gold) 1px,transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', animation: 'fadeIn 0.4s ease' }}>

        {/* ── NAV ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 48px', borderBottom: '1px solid var(--border)',
          background: 'rgba(8,13,26,0.97)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 4, color: 'var(--gold)' }}>
              ALPHA DESK
            </div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', border: '1px solid var(--border)', padding: '4px 10px' }}>
              ADMIN CONSOLE
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 1 }}>{userEmail}</span>
            <a href="/" style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-dim)', textDecoration: 'none', padding: '6px 14px', border: '1px solid var(--border)', textTransform: 'uppercase' }}>
              ← SITE
            </a>
            <button onClick={logout} style={{
              fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 2,
              background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
              padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.25s'
            }}
              onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--red)'; (e.target as any).style.color = 'var(--red)' }}
              onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
            >LOGOUT</button>
          </div>
        </nav>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '64px 48px' }}>

          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 30, height: 1, background: 'var(--gold)' }} />
              ADMIN PANEL
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, lineHeight: 0.95 }}>
              Manage <em style={{ fontStyle: 'italic', color: 'var(--gold2)' }}>Research</em>
            </h1>
          </div>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 48, borderBottom: '1px solid var(--border)' }}>
            {(['upload', 'manage'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); if (t === 'manage') cancelEdit() }} style={{
                fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: 3,
                background: 'transparent', border: 'none',
                borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
                color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
                padding: '14px 28px', cursor: 'pointer', textTransform: 'uppercase', marginBottom: -1, transition: 'all 0.25s'
              }}>
                {t === 'upload'
                  ? (editId ? '✎ EDIT ANALYSIS' : '+ NEW ANALYSIS')
                  : `MANAGE (${analyses.length})`}
              </button>
            ))}
          </div>

          {/* ── UPLOAD / EDIT FORM ── */}
          {tab === 'upload' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>

              {/* Edit mode banner */}
              {editId && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', marginBottom: 32,
                  border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.06)',
                }}>
                  <span style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>
                    ✎ EDITING — {form.ticker}
                  </span>
                  <button onClick={() => { cancelEdit(); setTab('manage') }} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                    padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase',
                  }}
                    onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--red)'; (e.target as any).style.color = 'var(--red)' }}
                    onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
                  >✕ CANCEL</button>
                </div>
              )}

              {/* ── KATEGORIE-AUSWAHL (2 Kategorien) ── */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Report Kategorie
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {CATEGORIES.map(cat => {
                    const active = form.category === cat.value
                    const color  = CATEGORY_COLORS[cat.value]
                    return (
                      <button
                        key={cat.value}
                        className="cat-btn"
                        onClick={() => setForm(f => ({
                          ...f,
                          category: cat.value,
                          sector: cat.value === 'equity' ? SECTORS[0].value : GEO_TOPICS[0],
                        }))}
                        style={{
                          fontFamily: 'DM Mono, monospace',
                          padding: '18px 20px', border: `1px solid ${active ? color : 'var(--border)'}`,
                          background: active ? `${color}12` : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                          opacity: active ? 1 : 0.55,
                        }}
                      >
                        <div style={{ fontSize: 18, marginBottom: 8, color }}>{cat.icon}</div>
                        <div style={{ fontSize: 11, letterSpacing: 2, color: active ? color : 'var(--text)', textTransform: 'uppercase', marginBottom: 4 }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: 8, letterSpacing: 1, color: 'var(--text-dim)' }}>
                          {cat.desc}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* PDF drop zone */}
              {editId && existingPdfName && !replacePdf ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
                  padding: '24px 28px', marginBottom: 40,
                }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8 }}>
                      CURRENT PDF
                    </div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 300 }}>
                      {existingPdfName}
                    </div>
                  </div>
                  <button onClick={() => setReplacePdf(true)} style={{
                    fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                    background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                    padding: '10px 18px', cursor: 'pointer', textTransform: 'uppercase',
                  }}
                    onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--gold)'; (e.target as any).style.color = 'var(--gold)' }}
                    onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
                  >↑ REPLACE PDF</button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDrag(true) }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
                  style={{
                    border: `2px dashed ${drag ? catColor : 'var(--border)'}`,
                    background: drag ? `${catColor}10` : 'rgba(255,255,255,0.02)',
                    padding: '56px 40px', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.3s', marginBottom: 40,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 14, color: catColor, opacity: drag ? 1 : 0.7 }}>
                    {activeCat.icon}
                  </div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 300, marginBottom: 8 }}>
                    {pdfFile ? pdfFile.name : 'Drop PDF here or click to browse'}
                  </div>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {pdfFile
                      ? `${(pdfFile.size / 1024 / 1024).toFixed(2)} MB — PDF READY`
                      : 'PDF format · Max 50MB'}
                  </div>
                  {editId && replacePdf && (
                    <button
                      onClick={e => { e.stopPropagation(); setReplacePdf(false); setPdfFile(null) }}
                      style={{
                        marginTop: 16, fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                        background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                        padding: '6px 14px', cursor: 'pointer', textTransform: 'uppercase',
                      }}
                    >✕ KEEP EXISTING PDF</button>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
              )}

              {/* Form fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                {/* Ticker + Rating */}
                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>
                    {isEquity ? 'Ticker Symbol *' : 'Kürzel / ID *'}
                  </label>
                  <input
                    value={form.ticker}
                    onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                    className="focus-gold"
                    placeholder={isEquity ? 'AAPL' : 'GEO-001'}
                    style={inputStyle}
                  />
                </div>

                {isEquity && (
                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Rating</label>
                  <select {...F('rating')} className="focus-gold" style={{ ...inputStyle, cursor: 'pointer' }}>
                    {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                )}

                {/* Title */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Report Title *</label>
                  <input {...F('title')} className="focus-gold"
                    placeholder={isEquity ? 'e.g. AAPL — Structural Rerating Incoming' : 'e.g. Zollkrieg 2025 — Auswirkungen auf europäische Märkte'}
                    style={inputStyle} />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Short Description</label>
                  <textarea {...F('description')} className="focus-gold"
                    placeholder={isEquity
                      ? 'Brief overview of the investment thesis...'
                      : 'Kurze Zusammenfassung der geopolitischen Situation und Marktrelevanz...'}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }} />
                </div>

                {/* Sektor Dropdown (Equity) oder Geo-Topic Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>
                    {isEquity ? 'Sektor' : 'Themenbereich'}
                  </label>
                  <select {...F('sector')} className="focus-gold" style={{ ...inputStyle, cursor: 'pointer' }}>
                    {isEquity
                      ? SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)
                      : GEO_TOPICS.map(t => <option key={t} value={t}>{t}</option>)
                    }
                  </select>
                </div>

                {/* Analyst */}
                <div>
                  <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Analyst</label>
                  <input {...F('analyst')} className="focus-gold" placeholder="G. Stephan" style={inputStyle} />
                </div>

                {/* Preis-Felder nur für Equity */}
                {isEquity && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Current Price</label>
                      <input {...F('current_price')} className="focus-gold" placeholder="189.42" type="number" step="0.01" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, letterSpacing: 3, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 10 }}>Price Target</label>
                      <input {...F('price_target')} className="focus-gold" placeholder="220.00" type="number" step="0.01" style={inputStyle} />
                    </div>
                  </>
                )}
              </div>

              {/* Save buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button onClick={() => handleSave(false)} disabled={saving} style={{
                  fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: 3,
                  background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                  padding: '16px 32px', cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
                }}>
                  {editId ? 'SAVE AS DRAFT' : 'SAVE DRAFT'}
                </button>
                <button onClick={() => handleSave(true)} disabled={saving} style={{
                  flex: 1, fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: 3,
                  background: saving ? `${catColor}66` : catColor,
                  border: 'none', color: 'var(--bg)',
                  padding: '16px 40px', cursor: saving ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase', transition: 'all 0.3s',
                }}>
                  {saving ? 'SAVING...' : editId ? 'UPDATE & PUBLISH →' : 'PUBLISH NOW →'}
                </button>
              </div>
            </div>
          )}

          {/* ── MANAGE TAB ── */}
          {tab === 'manage' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {analyses.length === 0 ? (
                <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 20 }}>◈</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 300 }}>No analyses yet</div>
                </div>
              ) : (
                <div style={{ border: '1px solid var(--border)' }}>
                  {analyses.map((a, i) => {
                    const b   = BADGE[a.rating] || BADGE.WATCH
                    const cat = (a as any).category ?? 'equity'
                    const cc  = CATEGORY_COLORS[cat] ?? '#c9a227'
                    return (
                      <div key={a.id} className="row-hover" style={{
                        display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px',
                        borderBottom: i < analyses.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.2s',
                      }}>
                        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--gold)', letterSpacing: 2, minWidth: 80 }}>
                          {a.ticker}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {new Date(a.created_at).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' })}
                            {' · '}
                            <span style={{ color: b.color }}>{a.rating}</span>
                            {' · '}
                            <span style={{ color: cc, fontSize: 9, letterSpacing: 1, padding: '1px 6px', border: `1px solid ${cc}44` }}>
                              {CATEGORIES.find(c => c.value === cat)?.label ?? cat}
                            </span>
                            {a.sector && <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>· {a.sector}</span>}
                            {a.pdf_path ? ' · PDF ✓' : ' · No PDF'}
                          </div>
                        </div>

                        <button className="btn-edit" onClick={() => startEdit(a)} style={{
                          fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                          padding: '6px 14px', border: '1px solid var(--border)',
                          color: 'var(--text-dim)', background: 'transparent',
                          cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                        }}>EDIT</button>

                        <button onClick={() => togglePublish(a)} style={{
                          fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 2,
                          padding: '6px 14px', border: `1px solid ${a.published ? 'var(--green)' : 'var(--border)'}`,
                          color: a.published ? 'var(--green)' : 'var(--text-dim)',
                          background: a.published ? 'rgba(78,201,148,0.08)' : 'transparent',
                          cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                        }}>
                          {a.published ? 'LIVE' : 'DRAFT'}
                        </button>

                        <button onClick={() => deleteAnalysis(a)} style={{
                          fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: 1,
                          background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                          padding: '6px 12px', cursor: 'pointer',
                        }}
                          onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--red)'; (e.target as any).style.color = 'var(--red)' }}
                          onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--text-dim)' }}
                        >DEL</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 40, right: 40, zIndex: 300,
          background: 'var(--bg2)', border: `1px solid ${toast.ok ? 'var(--gold)' : 'var(--red)'}`,
          padding: '16px 28px', fontSize: 11, letterSpacing: 2,
          color: toast.ok ? 'var(--gold)' : 'var(--red)',
          animation: 'toastIn 0.3s ease', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}