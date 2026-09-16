"use client";

import { brand, formEmail } from "@/lib/content";
import AskForm from "@/components/AskForm";

// /ask hero experience — a full-bleed image hero (facility backdrop, darkened +
// orange-tinted for legibility) with an editorial left column (headline, lead,
// a topics icon-grid, contact) and a glassy enquiry panel on the right. Uses the
// real site chrome (Nav/Footer from PageShell) and the Powerline identity
// (near-black, orange, Montserrat/Poppins). Background image applied via inline
// style (styled-jsx can drop url()/data: backgrounds); everything else is pure
// CSS gradients.
const TOPICS = [
  { t: "Electrical products & solution selection", d: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>) },
  { t: "Technical specifications, ratings & standards", d: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>) },
  { t: "LV & MV systems", d: (<path d="M13 2 3 14h9l-1 8 10-12h-9z" />) },
  { t: "Transformers & compact substations", d: (<><rect x="3" y="4" width="18" height="7" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 7.5h.01M7 16.5h.01" /></>) },
  { t: "Power factor correction & electrical applications", d: (<path d="M22 12h-4l-3 9L9 3l-3 9H2" />) },
  { t: "Existing installations & troubleshooting", d: (<path d="M14.7 6.3a4 4 0 0 0-5.34 5.34L3 18v3h3l6.36-6.36a4 4 0 0 0 5.34-5.34l-2.9 2.9-2.14-2.14z" />) },
  { t: "Value engineering & project optimization", d: (<><path d="M22 7 13.5 15.5l-4-4L2 19" /><path d="M16 7h6v6" /></>) },
  { t: "General electrical industry questions", d: (<><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></>) },
];

export default function AskExperience() {
  return (
    <section className="axp">
      <div className="axp-media" aria-hidden="true">
        <div className="axp-photo" style={{ backgroundImage: "url(/img/facility-1.webp)" }} />
        <div className="axp-scrim" />
      </div>

      <span className="axp-side axp-side-l" aria-hidden="true">Powering progress together</span>
      <span className="axp-side axp-side-r" aria-hidden="true">Knowledge · Experience · Real solutions</span>

      <div className="axp-grid">
        {/* LEFT — the pitch */}
        <div className="axp-intro">
          <span className="eyebrow">Real questions. Expert answers.</span>
          <h1 className="axp-h">
            Have a question about power or electrical engineering? <em>Ask us.</em>
          </h1>
          <p className="axp-lead">
            Whether you&rsquo;re selecting equipment, reviewing a specification, comparing technical
            options, working through a project challenge, or simply looking for a clearer answer —
            Ask Powerline connects you with practical industry knowledge and engineering expertise.
          </p>
          <p className="axp-lead2">
            Ask us — our team will help you understand the options, technical considerations,
            standards, and next steps.
          </p>

          <span className="axp-topics-label">Topics we can help with</span>
          <ul className="axp-topics">
            {TOPICS.map((it) => (
              <li key={it.t}>
                <span className="ic" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {it.d}
                  </svg>
                </span>
                <span className="lbl">{it.t}</span>
              </li>
            ))}
          </ul>

          <div className="axp-contact">
            <span className="axp-ct-label">Prefer to talk?</span>
            <div className="axp-ct-items">
              <a className="axp-ct-item" href={`tel:${brand.phone}`} aria-label={`Call Powerline on ${brand.phoneDisplay}`}>
                <span className="axp-ct-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="axp-ct-text">
                  <span className="axp-ct-kicker">Call us</span>
                  <span className="axp-ct-value">{brand.phoneDisplay}</span>
                </span>
              </a>
              <a className="axp-ct-item" href={`mailto:${formEmail}`} aria-label={`Email Powerline at ${formEmail}`}>
                <span className="axp-ct-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span className="axp-ct-text">
                  <span className="axp-ct-kicker">Email us</span>
                  <span className="axp-ct-value">{formEmail}</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT — the form panel */}
        <div className="axp-panel">
          <div className="axp-panel-head">
            <span className="axp-badge">Ask Powerline</span>
            <h2>What would you like to know?</h2>
            <p className="axp-panel-sub">
              Have a technical question, project challenge, or industry topic you want to understand
              better? Send it to our team.
            </p>
          </div>
          <AskForm />
        </div>
      </div>

      <style jsx>{`
        .axp {
          position: relative;
          isolation: isolate;
          min-height: 100svh;
          padding: clamp(7rem, 12vh, 9.5rem) 0 clamp(3.5rem, 8vh, 6rem);
          background: var(--bg);
          overflow: hidden;
        }

        /* Backdrop: facility photo + layered scrim (fades to solid --bg lower
           down so the long form sits on a clean dark ground). */
        .axp-media { position: absolute; inset: 0; z-index: 0; overflow: hidden; }
        .axp-photo { position: absolute; inset: 0; background-size: cover; background-position: center 26%; }
        .axp-scrim {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(5, 5, 6, 0.5) 0%, rgba(5, 5, 6, 0.35) 24%, rgba(5, 5, 6, 0.62) 58%, var(--bg) 90%),
            linear-gradient(100deg, rgba(5, 5, 6, 0.94) 0%, rgba(5, 5, 6, 0.64) 32%, rgba(5, 5, 6, 0.28) 50%, rgba(5, 5, 6, 0.5) 68%, rgba(5, 5, 6, 0.9) 100%),
            radial-gradient(55% 45% at 22% 18%, rgba(232, 114, 42, 0.16), transparent 70%);
        }

        /* Decorative vertical side labels (very wide screens only) */
        .axp-side {
          position: absolute; z-index: 1;
          writing-mode: vertical-rl; text-orientation: mixed;
          font-family: var(--font-body); font-size: 0.66rem; font-weight: 600;
          letter-spacing: 0.26em; text-transform: uppercase; color: var(--text-faint);
          display: flex; align-items: center; gap: 0.9rem;
        }
        .axp-side::before { content: ""; width: 1px; height: 3rem; background: var(--orange); box-shadow: 0 0 8px var(--orange); }
        .axp-side-l { left: 1.4rem; bottom: clamp(3rem, 10vh, 7rem); }
        .axp-side-r { right: 1.4rem; top: clamp(8rem, 16vh, 11rem); }
        @media (max-width: 1440px) { .axp-side { display: none; } }

        .axp-grid {
          position: relative; z-index: 1;
          width: 100%; max-width: 82rem; margin-inline: auto;
          padding-inline: var(--pad);
          display: grid;
          grid-template-columns: 1fr minmax(0, 31rem);
          gap: clamp(2rem, 4vw, 4.5rem);
          align-items: start;
        }

        /* LEFT */
        .axp-intro { max-width: 40rem; }
        .axp-h {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: clamp(2.1rem, 4.6vw, 3.7rem); line-height: 0.98; letter-spacing: -0.015em;
          color: #fff; margin: 1.1rem 0 0;
        }
        .axp-h em { font-style: normal; color: var(--orange); text-shadow: 0 0 30px rgba(232, 114, 42, 0.4); }
        .axp-lead {
          margin: 1.4rem 0 0; color: var(--text-dim); font-weight: 300;
          font-size: clamp(1rem, 1.15vw, 1.08rem); line-height: 1.65; max-width: 42ch;
        }
        .axp-lead2 { margin: 0.9rem 0 0; color: var(--text); font-weight: 400; font-size: 0.98rem; line-height: 1.6; max-width: 42ch; }

        .axp-topics-label {
          display: block; margin: clamp(1.8rem, 3.5vh, 2.6rem) 0 1.1rem;
          font-family: var(--font-body); font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase; color: var(--text-faint);
        }
        .axp-topics {
          list-style: none; margin: 0; padding: 0;
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.5rem;
        }
        .axp-topics li { display: flex; gap: 0.75rem; align-items: flex-start; }
        .axp-topics .ic {
          flex: none; width: 2.15rem; height: 2.15rem; display: grid; place-items: center;
          border-radius: 9px; background: rgba(232, 114, 42, 0.1);
          border: 1px solid rgba(232, 114, 42, 0.28); color: var(--orange);
        }
        .axp-topics .ic svg { width: 1.05rem; height: 1.05rem; }
        .axp-topics .lbl { font-size: 0.9rem; line-height: 1.35; color: var(--text); padding-top: 0.15rem; }

        /* Contact */
        .axp-contact { margin-top: clamp(1.8rem, 3.5vh, 2.6rem); }
        .axp-ct-label {
          display: block; font-family: var(--font-body); font-size: 0.7rem; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-faint); margin-bottom: 0.9rem;
        }
        .axp-ct-items { display: flex; flex-wrap: wrap; gap: 0.75rem 1.75rem; }
        .axp-ct-item {
          display: inline-flex; align-items: center; gap: 0.85rem; min-height: 44px;
          padding: 0.3rem 0.3rem 0.3rem 0; border-radius: 12px; -webkit-tap-highlight-color: transparent;
        }
        .axp-ct-icon {
          flex: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 11px;
          background: rgba(255, 255, 255, 0.04); border: 1px solid var(--line); color: var(--text);
          transition: color 0.25s var(--ease), border-color 0.25s var(--ease), background 0.25s var(--ease), box-shadow 0.3s var(--ease);
        }
        .axp-ct-icon svg { width: 20px; height: 20px; }
        .axp-ct-text { display: flex; flex-direction: column; gap: 0.18rem; line-height: 1.1; }
        .axp-ct-kicker {
          font-family: var(--font-body); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text-faint); transition: color 0.25s var(--ease);
        }
        .axp-ct-value {
          font-family: var(--font-head); font-weight: 700; font-size: 1.02rem; letter-spacing: 0.01em;
          color: #fff; white-space: nowrap; transition: color 0.25s var(--ease);
        }
        .axp-ct-item:hover .axp-ct-icon, .axp-ct-item:focus-visible .axp-ct-icon {
          color: var(--orange-bright); border-color: rgba(232, 114, 42, 0.55);
          background: rgba(232, 114, 42, 0.1); box-shadow: 0 0 18px rgba(232, 114, 42, 0.25);
        }
        .axp-ct-item:hover .axp-ct-value, .axp-ct-item:focus-visible .axp-ct-value { color: var(--orange); }
        .axp-ct-item:hover .axp-ct-kicker, .axp-ct-item:focus-visible .axp-ct-kicker { color: var(--text-dim); }
        .axp-ct-item:focus-visible { outline: 2px solid var(--orange); outline-offset: 4px; }
        .axp-ct-item:active .axp-ct-icon { transform: scale(0.94); }

        /* RIGHT — glassy panel */
        .axp-panel {
          position: relative;
          background: linear-gradient(180deg, rgba(16, 16, 21, 0.9), rgba(9, 9, 12, 0.92));
          -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: clamp(1.6rem, 2.6vw, 2.4rem);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }
        .axp-panel::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--orange-deep), var(--orange), var(--orange-bright));
          box-shadow: 0 0 16px rgba(232, 114, 42, 0.4);
        }
        .axp-panel-head { margin-bottom: 1.5rem; }
        .axp-badge {
          font-family: var(--font-body); font-weight: 600; font-size: 0.66rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--orange);
        }
        .axp-panel-head h2 {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.35rem, 2.2vw, 1.8rem); color: #fff; margin: 0.5rem 0 0; line-height: 1.05;
        }
        .axp-panel-sub { margin: 0.7rem 0 0; font-size: 0.9rem; line-height: 1.55; color: var(--text-dim); max-width: 46ch; }

        @media (max-width: 960px) {
          .axp { min-height: 0; padding: clamp(6rem, 16vw, 7.5rem) 0 clamp(3rem, 10vw, 4.5rem); }
          .axp-grid { grid-template-columns: 1fr; gap: clamp(2.2rem, 7vw, 3rem); }
          .axp-intro { max-width: 100%; }
        }
        @media (max-width: 540px) {
          .axp-topics { grid-template-columns: 1fr; gap: 0.85rem; }
        }
      `}</style>
    </section>
  );
}
