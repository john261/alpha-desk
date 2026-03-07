// app/agb/page.tsx
// ⚠️ PLATZHALTER ersetzen: [VORNAME NACHNAME], [STRASSE NR], [PLZ STADT], [EMAIL]

export default function AgbPage() {
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
        p, li { font-size:13px; line-height:2; color:#475569; margin-bottom:8px; }
        ul { padding-left:20px; margin-bottom:16px; }
        a { color:#c9a227; text-decoration:none; }
        a:hover { text-decoration:underline; }
        .placeholder { background:#fef3c7; padding:2px 6px; border-radius:2px; color:#92400e; font-weight:500; }
        .divider { height:1px; background:#e2e8f0; margin:32px 0; }
        .warning-box { background:#fff7ed; border:1px solid #fed7aa; padding:20px 24px; margin:16px 0; }
        .footer { background:#0a1628; border-top:3px solid #c9a227; margin-top:80px; }
        .footer-inner { max-width:1200px; margin:0 auto; padding:24px 32px; display:flex; justify-content:space-between; align-items:center; }
        .footer-copy { font-size:8px; color:#334155; letter-spacing:1px; text-transform:uppercase; }
        .footer-links { display:flex; gap:24px; }
        .footer-link { font-size:8px; letter-spacing:2px; color:#334155; text-transform:uppercase; text-decoration:none; transition:color .2s; }
        .footer-link:hover { color:#c9a227; }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">Alpha<span>Desk</span></a>
          <a href="/" className="back">← Zurück</a>
        </div>
      </nav>

      <div className="wrap">
        <div className="eyebrow">Rechtliches</div>
        <h1>Allgemeine Nutzungsbedingungen</h1>

        <div className="warning-box">
          <p style={{ color:'#9a3412', fontWeight:500 }}>
            ⚠️ Wichtiger Hinweis: AlphaDesk ist keine lizenzierte Anlageberatung.
            Alle Inhalte dienen ausschließlich zu Informationszwecken und stellen keine
            Finanzberatung dar.
          </p>
        </div>

        <h2>§ 1 Geltungsbereich</h2>
        <p>
          Diese Nutzungsbedingungen gelten für die Nutzung der Website AlphaDesk
          (nachfolgend „Plattform"), betrieben von:
        </p>
        <p>
          <span className="placeholder">Stephan Gilger</span><br />
          <span className="placeholder">Stoeberlstr. 93</span><br />
          <span className="placeholder">80686 München</span>
        </p>

        <div className="divider" />

        <h2>§ 2 Leistungsbeschreibung</h2>
        <p>
          AlphaDesk stellt kostenlos und öffentlich zugänglich Aktienanalysen,
          Research-Berichte und Kursinformationen bereit. Die Plattform richtet sich
          an informierte Privatanleger und erhebt keinen Anspruch auf Vollständigkeit
          oder Aktualität der veröffentlichten Inhalte.
        </p>

        <div className="divider" />

        <h2>§ 3 Kein Anlageberatungsvertrag</h2>
        <p>
          Die auf dieser Plattform veröffentlichten Inhalte begründen keinen
          Anlageberatungsvertrag. Die Nutzung der Plattform ersetzt keine individuelle
          Beratung durch einen zugelassenen Finanzberater oder eine Bank.
        </p>
        <ul>
          <li>Alle Analysen sind Meinungen des Betreibers, keine Tatsachenbehauptungen</li>
          <li>Kursziele sind Schätzungen ohne Garantie</li>
          <li>Vergangene Entwicklungen garantieren keine zukünftigen Ergebnisse</li>
          <li>Investitionen können zum Totalverlust führen</li>
        </ul>

        <div className="divider" />

        <h2>§ 4 Haftungsausschluss</h2>
        <p>
          Der Betreiber haftet nicht für Verluste oder Schäden, die durch die Nutzung
          der auf dieser Plattform bereitgestellten Informationen entstehen. Dies gilt
          insbesondere für:
        </p>
        <ul>
          <li>Investitionsentscheidungen auf Basis der veröffentlichten Analysen</li>
          <li>Fehlerhafte oder veraltete Kursdaten</li>
          <li>Technische Ausfälle der Plattform</li>
          <li>Verluste durch Wertpapierinvestitionen</li>
        </ul>

        <div className="divider" />

        <h2>§ 5 Urheberrecht</h2>
        <p>
          Alle auf dieser Plattform veröffentlichten Analysen, Texte und Berichte
          sind urheberrechtlich geschützt. Eine Vervielfältigung, Verbreitung oder
          öffentliche Wiedergabe — auch auszugsweise — ist ohne ausdrückliche
          schriftliche Genehmigung des Betreibers nicht gestattet.
        </p>

        <div className="divider" />

        <h2>§ 6 Verfügbarkeit</h2>
        <p>
          Der Betreiber bemüht sich um eine kontinuierliche Verfügbarkeit der Plattform,
          übernimmt jedoch keine Garantie für ununterbrochenen Betrieb. Wartungsarbeiten
          oder technische Störungen können zu vorübergehenden Einschränkungen führen.
        </p>

        <div className="divider" />

        <h2>§ 7 Änderungen</h2>
        <p>
          Der Betreiber behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern.
          Die jeweils aktuelle Version ist auf dieser Seite abrufbar.
        </p>

        <div className="divider" />

        <h2>§ 8 Anwendbares Recht</h2>
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist,
          soweit gesetzlich zulässig, <span className="placeholder">[PLZ STADT]</span>.
        </p>

        <div className="divider" />

        <h2>§ 9 Kontakt</h2>
        <p>
          Bei Fragen zu diesen Nutzungsbedingungen wenden Sie sich an:{' '}
          <a href="mailto:"><span className="placeholder">Stephangilger@web.de</span></a>
        </p>

        <p style={{ marginTop: 32, fontSize: 11, color: '#94a3b8' }}>
          Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-copy">© {new Date().getFullYear()} AlphaDesk</div>
          <div className="footer-links">
            <a href="/impressum" className="footer-link">Impressum</a>
            <a href="/datenschutz" className="footer-link">Datenschutz</a>
            <a href="/agb" className="footer-link">AGB</a>
          </div>
        </div>
      </footer>
    </>
  )
}