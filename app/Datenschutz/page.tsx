// app/datenschutz/page.tsx
// ⚠️ PLATZHALTER ersetzen: [VORNAME NACHNAME], [STRASSE NR], [PLZ STADT], [EMAIL]

import Link from 'next/link'

export default function DatenschutzPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background:#f1f5f9; color:#0f172a; font-family:'DM Mono',monospace; -webkit-font-smoothing:antialiased; }
        .nav { background:#0a1628; border-bottom:3px solid #c9a227; }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 32px; height:60px; display:flex; align-items:center; justify-content:space-between; }
        .nav-logo { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:#fff; text-decoration:none; }
        .nav-logo span { color:#c9a227; }
        .back { font-size:8px; letter-spacing:3px; color:#475569; text-transform:uppercase; text-decoration:none; padding:7px 14px; border:1px solid #1e293b; transition:all .2s; }
        .back:hover { color:#c9a227; border-color:#c9a227; }
        .wrap { max-width:800px; margin:0 auto; padding:64px 32px 80px; }
        .eyebrow { font-size:8px; letter-spacing:4px; color:#c9a227; text-transform:uppercase; margin-bottom:12px; }
        h1 { font-family:'Cormorant Garamond',serif; font-size:42px; font-weight:400; margin-bottom:48px; }
        h2 { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:600; margin:36px 0 12px; color:#0f172a; }
        h3 { font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#64748b; margin:24px 0 8px; }
        p, li { font-size:13px; line-height:2; color:#475569; margin-bottom:8px; }
        ul { padding-left:20px; margin-bottom:16px; }
        a { color:#c9a227; text-decoration:none; }
        a:hover { text-decoration:underline; }
        .placeholder { background:#fef3c7; padding:2px 6px; border-radius:2px; color:#92400e; font-weight:500; }
        .divider { height:1px; background:#e2e8f0; margin:32px 0; }
        .info-box { background:#fff; border:1px solid #e2e8f0; padding:20px 24px; margin:16px 0; }
        .disclaimer-box {
          background:#fff3cd; border:2px solid #f0a500; border-left:6px solid #f0a500;
          padding:20px 24px; margin:0 0 40px; border-radius:2px;
        }
        .disclaimer-box p { color:#7a4f00; font-size:13px; line-height:1.9; margin:0; }
        .disclaimer-box strong { color:#5a3700; display:block; margin-bottom:6px; letter-spacing:1px; font-size:11px; text-transform:uppercase; }
        .footer { background:#0a1628; border-top:3px solid #c9a227; margin-top:80px; }
        .footer-inner { max-width:1200px; margin:0 auto; padding:24px 32px; display:flex; justify-content:space-between; align-items:center; }
        .footer-copy { font-size:8px; color:#334155; letter-spacing:1px; text-transform:uppercase; }
        .footer-links { display:flex; gap:24px; }
        .footer-link { font-size:8px; letter-spacing:2px; color:#475569; text-transform:uppercase; text-decoration:none; transition:color .2s; }
        .footer-link:hover { color:#c9a227; }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">Alpha<span>Desk</span></Link>
          <Link href="/" className="back">← Zurück</Link>
        </div>
      </nav>

      <div className="wrap">
        <div className="eyebrow">Rechtliches</div>
        <h1>Datenschutzerklärung</h1>

        {/* ── Disclaimer-Box ── */}
        <div className="disclaimer-box">
          <p>
            <strong>⚠ Wichtiger Hinweis</strong>
            AlphaDesk ist ein rein privates Unterhaltungsprojekt. Sämtliche Inhalte —
            einschließlich aller Analysen, Kursziele, Ratings und Marktkommentare — dienen
            ausschließlich der Unterhaltung und persönlichen Meinungsäußerung des Betreibers.
            Es handelt sich um keinerlei Finanz-, Anlage- oder Investmentberatung.
            Keine Investitionsentscheidung sollte auf Basis dieser Inhalte getroffen werden.
          </p>
        </div>

        <h2>1. Verantwortlicher</h2>
        <div className="info-box">
          <p>
            <span className="placeholder">[VORNAME NACHNAME]</span><br />
            <span className="placeholder">[STRASSE NR]</span><br />
            <span className="placeholder">[PLZ STADT]</span><br />
            E-Mail: <span className="placeholder">[EMAIL]</span>
          </p>
        </div>

        <div className="divider" />

        <h2>2. Erhebung und Speicherung personenbezogener Daten</h2>
        <p>
          Diese Website ist eine rein informative Unterhaltungsplattform für Marktkommentare
          und Meinungen. Es findet keine Registrierung oder Nutzerkonten für Besucher statt.
        </p>

        <h3>Beim Besuch der Website</h3>
        <p>Beim Aufrufen der Website werden durch den Hosting-Anbieter (Vercel) automatisch folgende
        Informationen in Server-Logfiles gespeichert:</p>
        <ul>
          <li>IP-Adresse des anfragenden Rechners</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>Verwendeter Browser und Betriebssystem</li>
        </ul>
        <p>
          Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit anderen
          Datenquellen zusammengeführt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <div className="divider" />

        <h2>3. Hosting — Vercel</h2>
        <p>
          Diese Website wird gehostet bei Vercel Inc., 340 Pine Street, Suite 701, San Francisco,
          CA 94104, USA. Vercel verarbeitet Zugriffsdaten gemäß seiner Datenschutzrichtlinie.
          Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>
        </p>

        <div className="divider" />

        <h2>4. Datenbank — Supabase</h2>
        <p>
          Die Website nutzt Supabase (Supabase Inc., San Francisco, USA) als Datenbank-Backend
          zur Speicherung und Verwaltung der veröffentlichten Inhalte. Es werden ausschließlich
          redaktionelle Inhalte (Texte, Ticker-Daten) gespeichert — keine personenbezogenen
          Besucherdaten. Weitere Informationen: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>
        </p>

        <div className="divider" />

        <h2>5. Externe Kursdaten — Yahoo Finance</h2>
        <p>
          Zur Anzeige aktueller Kursdaten werden Informationen von Yahoo Finance (Yahoo Inc., USA)
          serverseitig abgerufen. Es werden dabei keine personenbezogenen Daten der Besucher
          an Yahoo übermittelt. Die angezeigten Kurse dienen rein der Unterhaltung und
          Veranschaulichung — sie stellen keine Handelsgrundlage dar.
        </p>

        <div className="divider" />

        <h2>6. Google Fonts</h2>
        <p>
          Diese Website nutzt Google Fonts (Google Ireland Limited, Gordon House, Barrow Street,
          Dublin 4, Irland). Beim Laden der Seite wird eine Verbindung zu Google-Servern hergestellt,
          dabei kann die IP-Adresse des Besuchers übertragen werden.
          Weitere Informationen: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
        </p>

        <div className="divider" />

        <h2>7. Cookies</h2>
        <p>
          Diese Website verwendet keine Tracking-Cookies oder Analyse-Tools.
          Es werden ausschließlich technisch notwendige Session-Cookies für den Admin-Bereich verwendet,
          die nach dem Schließen des Browsers gelöscht werden.
        </p>

        <div className="divider" />

        <h2>8. Ihre Rechte</h2>
        <p>Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
        <ul>
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
          <a href="mailto:"><span className="placeholder">[EMAIL]</span></a>
        </p>
        <p>
          Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
        </p>

        <div className="divider" />

        <h2>9. Haftungsausschluss Kapitalmarkt</h2>
        <p>
          Alle auf dieser Website veröffentlichten Inhalte — insbesondere Marktkommentare,
          Meinungen, Ratings und Kursziele — dienen <strong>ausschließlich der Unterhaltung</strong> und
          der persönlichen Meinungsäußerung des Betreibers. Sie begründen keinerlei
          Anlageberatung, Anlageempfehlung oder Aufforderung zum Kauf oder Verkauf von
          Wertpapieren oder sonstigen Finanzinstrumenten. Der Betreiber ist kein lizenzierter
          Finanzberater und übernimmt keinerlei Haftung für Entscheidungen, die auf Basis
          dieser Inhalte getroffen werden. Investitionen in Wertpapiere sind mit Risiken
          verbunden, bis hin zum Totalverlust des eingesetzten Kapitals.
        </p>

        <p style={{ marginTop: 32, fontSize: 11, color: '#94a3b8' }}>
          Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-copy">© {new Date().getFullYear()} AlphaDesk</div>
          <div className="footer-links">
            <Link href="/impressum" className="footer-link">Impressum</Link>
            <Link href="/datenschutz" className="footer-link">Datenschutz</Link>
            <Link href="/agb" className="footer-link">AGB</Link>
          </div>
        </div>
      </footer>
    </>
  )
}