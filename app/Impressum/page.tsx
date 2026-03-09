// app/impressum/page.tsx
// ⚠️ PLATZHALTER ersetzen: [VORNAME NACHNAME], [STRASSE NR], [PLZ STADT], [EMAIL]

import Link from 'next/link'

export default function ImpressumPage() {
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
        a { color:#c9a227; text-decoration:none; }
        a:hover { text-decoration:underline; }
        .placeholder { background:#fef3c7; padding:2px 6px; border-radius:2px; color:#92400e; font-weight:500; }
        .divider { height:1px; background:#e2e8f0; margin:32px 0; }
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
        <h1>Impressum</h1>

        {/* ── Disclaimer-Box ── */}
        <div className="disclaimer-box">
          <p>
            <strong>⚠ Wichtiger Hinweis</strong>
            AlphaDesk ist ein rein privates Unterhaltungsprojekt. Sämtliche Inhalte —
            einschließlich aller Analysen, Kursziele, Ratings und Einschätzungen — dienen
            ausschließlich der Unterhaltung und persönlichen Meinungsäußerung des Betreibers.
            Es handelt sich um keinerlei Finanz-, Anlage- oder Investmentberatung.
            Der Betreiber ist kein lizenzierter Finanzberater und übernimmt keinerlei Haftung
            für Entscheidungen, die auf Basis dieser Inhalte getroffen werden.
          </p>
        </div>

        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          <span className="placeholder">[VORNAME NACHNAME]</span><br />
          <span className="placeholder">[STRASSE NR]</span><br />
          <span className="placeholder">[PLZ STADT]</span>
        </p>

        <div className="divider" />

        <h2>Kontakt</h2>
        <p>E-Mail: <a href="mailto:"><span className="placeholder">[EMAIL]</span></a></p>

        <div className="divider" />

        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>
          <span className="placeholder">[VORNAME NACHNAME]</span><br />
          <span className="placeholder">[STRASSE NR]</span><br />
          <span className="placeholder">[PLZ STADT]</span>
        </p>

        <div className="divider" />

        <h2>Haftungsausschluss</h2>
        <p>
          Alle auf dieser Website veröffentlichten Inhalte — insbesondere Analysen, Ratings,
          Kursziele und Marktkommentare — dienen <strong>ausschließlich der Unterhaltung</strong> und
          stellen die persönliche Meinung des Betreibers dar. Sie begründen keinerlei Anlageberatung,
          Anlageempfehlung oder Aufforderung zum Kauf oder Verkauf von Wertpapieren oder
          sonstigen Finanzinstrumenten. Der Betreiber übernimmt keine Haftung für Verluste,
          die aus der Nutzung dieser Inhalte entstehen.
        </p>
        <p>
          Investitionsentscheidungen sollten ausschließlich auf Basis einer professionellen,
          individuellen Beratung durch einen zugelassenen Finanzberater getroffen werden.
        </p>

        <div className="divider" />

        <h2>Urheberrecht</h2>
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem
          deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>

        <div className="divider" />

        <h2>Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
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