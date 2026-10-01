"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoWordmark from "@/components/LogoWordmark";
import { nav, brand } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null); // which drawer group is open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => (document.documentElement.style.overflow = "");
  }, [open]);

  // close on Escape; collapse any open accordion when the drawer closes
  useEffect(() => {
    if (!open) { setExpanded(null); return; }
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""} ${open ? "nav-hidden" : ""}`}>
        <div className="nav-inner">
          <Link href="/" className="brand" aria-label="Powerline home">
            <LogoWordmark animated className="brand-logo" />
          </Link>

          <nav className="links" aria-label="Primary">
            {nav.map((item) => (
              <div key={item.label} className="link-wrap">
                <Link href={item.href} className="link">
                  {item.label}
                </Link>
                {item.children && (
                  <div className="dropdown">
                    {item.children.map((c) => (
                      <div key={c.href} className="drop-item">
                        <Link href={c.href} className="drop-link">
                          {c.label}
                          {c.children && <span className="drop-arrow">›</span>}
                        </Link>
                        {c.children && (
                          <div className="sub-dropdown">
                            {c.children.map((g) => (
                              <Link key={g.href} href={g.href} className="drop-link">
                                {g.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="actions">
            <Link href="/supplier-offerings" className="btn btn-ghost call hide-mobile">
              Become a Supplier
            </Link>
            <Link href="/careers" className="btn btn-ghost call hide-mobile">
              Join Our Team
            </Link>
            <Link href="/contact" className="btn btn-primary cta hide-mobile">
              Sales Request
            </Link>
            <button
              className={`burger ${open ? "open" : ""}`}
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer menu */}
      <div
        className={`overlay ${open ? "show" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <aside
          className="drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dr-head">
            <LogoWordmark className="dr-logo" />
            <button className="dr-close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="dr-nav" aria-label="Mobile">
            {nav.map((item, i) => {
              const isOpen = expanded === item.label;
              return (
                <div key={item.label} className="dr-group" style={{ "--i": i }}>
                  <div className="dr-row">
                    <Link href={item.href} className="dr-link" onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                    {item.children && (
                      <button
                        className={`dr-exp ${isOpen ? "on" : ""}`}
                        aria-label={`Show ${item.label} pages`}
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {item.children && (
                    <div className={`dr-children ${isOpen ? "open" : ""}`}>
                      <div className="dr-children-inner">
                        {item.children.map((c) => (
                          <div key={c.href} className="dr-sub">
                            <Link href={c.href} className="dr-child" onClick={() => setOpen(false)}>
                              {c.label}
                            </Link>
                            {c.children && (
                              <div className="dr-grand">
                                {c.children.map((g) => (
                                  <Link key={g.href} href={g.href} className="dr-gchild" onClick={() => setOpen(false)}>
                                    {g.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="dr-foot">
            <Link href="/supplier-offerings" className="btn btn-ghost dr-cta" onClick={() => setOpen(false)}>
              Become a Supplier
            </Link>
            <Link href="/careers" className="btn btn-ghost dr-cta" onClick={() => setOpen(false)}>
              Join Our Team
            </Link>
            <Link href="/contact" className="btn btn-primary dr-cta" onClick={() => setOpen(false)}>
              Sales Request
            </Link>
            <div className="dr-social">
              <a href={brand.facebook} target="_blank" rel="noreferrer">Facebook</a>
              <a href={brand.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-nav);
          transition: background 0.4s var(--ease), backdrop-filter 0.4s,
            border-color 0.4s, padding 0.4s var(--ease), opacity 0.3s var(--ease),
            visibility 0.3s;
          border-bottom: 1px solid transparent;
          padding: 0.6rem 0;
        }
        .nav.is-scrolled {
          background: rgba(5, 5, 6, 0.72);
          backdrop-filter: blur(14px);
          border-bottom-color: var(--line);
        }
        /* while the mobile drawer is open, hide the fixed header so its logo
           can't overlap the drawer's own logo (the drawer has its own close). */
        .nav.nav-hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .nav-inner {
          max-width: var(--container);
          margin: 0 auto;
          padding: 0 var(--pad);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        /* next/image doesn't receive styled-jsx's scope class, so the logo is
           sized with a :global() selector on its className. */
        :global(.brand-logo) {
          height: 40px;
          width: auto;
          display: block;
          transition: height 0.4s var(--ease);
        }
        .is-scrolled :global(.brand-logo) {
          height: 34px;
        }
        .links {
          display: flex;
          align-items: center;
          gap: clamp(0.35rem, 1.1vw, 1.35rem);
        }
        .link-wrap {
          position: relative;
        }
        .link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 0.4rem;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: var(--text-dim);
          transition: color 0.25s;
        }
        .link:hover {
          color: #fff;
        }
        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 14.375rem;
          padding: 0.5rem;
          background: rgba(12, 12, 14, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid var(--line);
          border-radius: 14px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(8px);
          transition: all 0.28s var(--ease);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }
        .link-wrap:hover .dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(6px);
        }
        /* second-level (products) flyout */
        .drop-item {
          position: relative;
        }
        .drop-item :global(.drop-link) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .drop-arrow {
          color: var(--text-faint);
          font-size: 1.1rem;
          line-height: 1;
        }
        .sub-dropdown {
          position: absolute;
          top: -0.5rem;
          left: 100%;
          margin-left: 0.4rem;
          min-width: 13.4375rem;
          padding: 0.5rem;
          background: rgba(12, 12, 14, 0.97);
          backdrop-filter: blur(16px);
          border: 1px solid var(--line);
          border-radius: 14px;
          opacity: 0;
          visibility: hidden;
          transform: translateX(8px);
          transition: all 0.25s var(--ease);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
        }
        .drop-item:hover .sub-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
        .drop-item:hover > :global(.drop-link),
        .drop-item:hover > :global(.drop-link) .drop-arrow {
          color: var(--orange);
          background: rgba(232, 114, 42, 0.12);
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        :global(.call) {
          padding: 0.7rem 1.2rem;
          font-size: 0.82rem;
          white-space: nowrap;
        }
        :global(.cta) {
          padding: 0.7rem 1.3rem;
          font-size: 0.82rem;
          white-space: nowrap;
        }
        .burger {
          display: none;
          flex-direction: column;
          gap: 5px;
          width: 30px;
          height: 30px;
          justify-content: center;
          align-items: center;
          background: none;
          border: none;
          padding: 0;
        }
        .burger span {
          width: 24px;
          height: 2px;
          background: #fff;
          transition: transform 0.3s var(--ease), opacity 0.3s;
        }
        .burger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .burger.open span:nth-child(2) {
          opacity: 0;
        }
        .burger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* ── mobile drawer ── */
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(3, 3, 4, 0.55);
          backdrop-filter: blur(5px);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.45s var(--ease), visibility 0.45s;
        }
        .overlay.show {
          opacity: 1;
          visibility: visible;
        }
        .drawer {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: min(420px, 87vw);
          display: flex;
          flex-direction: column;
          background: linear-gradient(165deg, #101013 0%, #060607 100%);
          border-left: 1px solid var(--line);
          box-shadow: -34px 0 90px rgba(0, 0, 0, 0.65);
          transform: translateX(102%);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .overlay.show .drawer {
          transform: translateX(0);
        }
        /* orange edge glow on the leading border */
        .drawer::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -1px;
          width: 2px;
          background: linear-gradient(180deg, transparent, var(--orange), transparent);
          opacity: 0.55;
        }
        .dr-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.05rem clamp(1.2rem, 5vw, 1.8rem);
          border-bottom: 1px solid var(--line);
          flex: 0 0 auto;
        }
        :global(.dr-logo) {
          height: 26px;
          width: auto;
          display: block;
        }
        .dr-close {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--line);
          color: #fff;
          cursor: pointer;
          transition: color 0.25s, border-color 0.25s, transform 0.35s var(--ease);
        }
        .dr-close:hover {
          color: var(--orange);
          border-color: rgba(232, 114, 42, 0.5);
          transform: rotate(90deg);
        }
        .dr-nav {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 0.4rem clamp(1.2rem, 5vw, 1.8rem) 1rem;
        }
        .dr-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          /* staggered slide-in when the drawer opens */
          opacity: 0;
          transform: translateX(26px);
          transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);
          transition-delay: calc(var(--i) * 0.05s + 0.14s);
        }
        .overlay.show .dr-group {
          opacity: 1;
          transform: none;
        }
        .dr-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dr-row :global(.dr-link) {
          flex: 1;
          padding: 1rem 0;
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 1.32rem;
          text-transform: uppercase;
          color: #fff;
          letter-spacing: 0.01em;
          transition: color 0.2s;
        }
        .dr-row :global(.dr-link:hover) {
          color: var(--orange);
        }
        .dr-exp {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          background: none;
          border: none;
          color: var(--text-faint);
          cursor: pointer;
          transition: transform 0.3s var(--ease), color 0.2s;
        }
        .dr-exp.on {
          transform: rotate(180deg);
          color: var(--orange);
        }
        /* grid-rows accordion (animates height smoothly) */
        .dr-children {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.38s var(--ease);
        }
        .dr-children.open {
          grid-template-rows: 1fr;
        }
        .dr-children-inner {
          overflow: hidden;
        }
        .dr-sub {
          padding: 0.1rem 0 0.5rem 0.85rem;
          margin-bottom: 0.5rem;
          border-left: 2px solid rgba(232, 114, 42, 0.35);
        }
        .dr-sub :global(.dr-child) {
          display: block;
          padding: 0.4rem 0;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text);
          transition: color 0.2s;
        }
        .dr-sub :global(.dr-child:hover) {
          color: var(--orange);
        }
        .dr-grand {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.35rem;
        }
        .dr-grand :global(.dr-gchild) {
          font-size: 0.76rem;
          color: var(--text-dim);
          padding: 0.25rem 0.6rem;
          border: 1px solid var(--line);
          border-radius: 999px;
          transition: color 0.2s, border-color 0.2s;
        }
        .dr-grand :global(.dr-gchild:hover) {
          color: var(--orange);
          border-color: rgba(232, 114, 42, 0.5);
        }
        .dr-foot {
          flex: 0 0 auto;
          padding: 1.1rem clamp(1.2rem, 5vw, 1.8rem) calc(1.3rem + env(safe-area-inset-bottom));
          border-top: 1px solid var(--line);
          background: rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .dr-foot :global(.dr-cta) {
          width: 100%;
          justify-content: center;
          padding: 0.85rem 1rem;
          font-size: 0.84rem;
        }
        .dr-social {
          display: flex;
          justify-content: center;
          gap: 1.4rem;
          margin-top: 0.3rem;
        }
        .dr-social a {
          font-size: 0.82rem;
          color: var(--text-dim);
          transition: color 0.2s;
        }
        .dr-social a:hover {
          color: var(--orange);
        }

        @media (max-width: 1024px) {
          .links,
          .call,
          .cta {
            display: none;
          }
          .burger {
            display: flex;
          }
        }
        /* Tight desktop widths (small / display-scaled laptops, ~14"): keep the
           FULL nav visible but progressively shrink links, CTA buttons, gaps and
           the logo so 6 links + 3 CTAs stay on one line instead of wrapping.
           (.link/.call/.cta are on <Link> elements, so they must be :global.) */
        @media (min-width: 1025px) and (max-width: 1440px) {
          .nav-inner { gap: 0.6rem; }
          .links { gap: clamp(0.15rem, 0.5vw, 0.6rem); }
          .actions { gap: 0.45rem; }
          :global(.links .link) { font-size: 0.82rem; padding: 0.5rem 0.3rem; }
          :global(.call),
          :global(.cta) { font-size: 0.72rem; padding: 0.55rem 0.85rem; }
          :global(.brand-logo) { height: 46px; }
          .nav.is-scrolled :global(.brand-logo) { height: 38px; }
        }
        @media (min-width: 1025px) and (max-width: 1200px) {
          .links { gap: clamp(0.1rem, 0.35vw, 0.4rem); }
          :global(.links .link) { font-size: 0.78rem; padding: 0.5rem 0.25rem; }
          :global(.call),
          :global(.cta) { font-size: 0.66rem; padding: 0.5rem 0.7rem; }
          :global(.brand-logo) { height: 42px; }
        }
      `}</style>
    </>
  );
}
