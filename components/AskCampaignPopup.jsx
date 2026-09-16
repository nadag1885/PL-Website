"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { track } from "@/lib/analytics";
import { registerAskTransition } from "@/lib/askTransition";

// "Ask Powerline" campaign popup — a lightweight, session-once takeover shown
// once the visitor scrolls into the page (an engagement signal, not a timer).
// Additive campaign layer, mounted globally in the root layout. Not shown on
// /ask or /contact, dismissed for the session via sessionStorage, accessible
// (focus trap, Escape, restore focus, aria-modal), and reduced-motion aware.
// Centred editorial composition; mobile = bottom sheet.
//
// The CTA runs a branded curtain transition to /ask: a dark+orange panel sweeps
// up to cover the screen, the route swaps underneath it, then it wipes away to
// reveal the page. The curtain lives here (this component is persistent in the
// root layout), so it survives the route change. CSS transitions only — no
// keyframe shorthand (styled-jsx drops `animation:` with var()); reduced-motion
// skips the curtain entirely.
const KEY = "pl_ask_popup_seen";
const SUPPRESS = ["/ask", "/contact"];
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
const SCROLL_TRIGGER_PX = 120;
const OPEN_DELAY_MS = 2000; // after the first scroll, wait this long, then open
const NAV = "/ask";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function AskCampaignPopup() {
  const [open, setOpen] = useState(false);
  const [curtain, setCurtain] = useState("off"); // off | in | cover | reveal
  const panelRef = useRef(null);
  const restoreRef = useRef(null);
  const busyRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const markSeen = () => {
    try { sessionStorage.setItem(KEY, "1"); } catch { /* private mode */ }
  };
  const close = useCallback(() => {
    track("ask_popup_close", {});
    markSeen();
    setOpen(false);
  }, []);

  // The branded curtain transition to /ask. Extracted so it can be triggered
  // both by the popup CTA and externally (the home-page robot) via the shared
  // registry. Guarded against re-entry; reduced-motion navigates immediately.
  const runCurtainTransition = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const reduce = typeof window !== "undefined" &&
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOpen(false);
      router.push(NAV);
      busyRef.current = false;
      return;
    }

    // Curtain: sweep up to cover → swap route underneath → wipe away to reveal.
    setCurtain("in");
    await wait(40);         // paint the off-screen start state so the sweep animates
    setCurtain("cover");
    await wait(720);        // cover fade+sweep (0.65s) settles
    setOpen(false);         // remove the dialog while it's hidden behind the curtain
    router.push(NAV);
    await wait(440);        // hold on the brand while /ask mounts + settles → jank-free reveal
    setCurtain("reveal");
    await wait(840);        // reveal dissolve+wipe (0.75s) settles
    setCurtain("off");
    busyRef.current = false;
  }, [router]);

  const cta = useCallback(() => {
    track("ask_popup_cta", {});
    markSeen();
    runCurtainTransition();
  }, [runCurtainTransition]);

  // Expose the transition so the robot (or anything else) can run it.
  useEffect(() => registerAskTransition(runCurtainTransition), [runCurtainTransition]);

  // Trigger: once the visitor scrolls past a small threshold, wait 2s, then
  // open — once per session, off the suppressed pages. Reads the site's Lenis
  // scroll position when available and falls back to native scroll; listens on
  // scroll + wheel + touchmove + Lenis so it arms regardless of which drives it.
  useEffect(() => {
    if (SUPPRESS.includes(pathname)) return;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch { /* no-op */ }
    if (seen) return;

    let armed = false;
    let timer;
    const getY = () => {
      const l = window.__lenis;
      if (l && typeof l.scroll === "number") return l.scroll;
      if (l && typeof l.animatedScroll === "number") return l.animatedScroll;
      return window.scrollY || window.pageYOffset || 0;
    };
    const arm = () => {
      if (armed) return;
      armed = true;
      detach();
      timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS); // 2s after the scroll
    };
    const maybe = () => { if (!armed && getY() > SCROLL_TRIGGER_PX) arm(); };

    const opts = { passive: true };
    const lenis = window.__lenis;
    function detach() {
      window.removeEventListener("scroll", maybe, opts);
      window.removeEventListener("wheel", maybe, opts);
      window.removeEventListener("touchmove", maybe, opts);
      if (lenis && typeof lenis.off === "function") lenis.off("scroll", maybe);
    }
    window.addEventListener("scroll", maybe, opts);
    window.addEventListener("wheel", maybe, opts);
    window.addEventListener("touchmove", maybe, opts);
    if (lenis && typeof lenis.on === "function") lenis.on("scroll", maybe);
    maybe(); // in case the page is restored/loaded already scrolled

    return () => { detach(); clearTimeout(timer); };
  }, [pathname]);

  // Open behaviours: analytics, scroll lock, initial focus, focus trap, restore.
  useEffect(() => {
    if (!open) return;
    track("ask_popup_view", {});
    restoreRef.current = document.activeElement;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const panel = panelRef.current;
    (panel?.querySelector("[data-close]") || panel)?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      const r = restoreRef.current;
      if (r && typeof r.focus === "function") r.focus();
    };
  }, [open, close]);

  if (!open && curtain === "off") return null;

  const curtainCls = curtain === "cover" ? "cover" : curtain === "reveal" ? "reveal" : "";

  return (
    <>
      {open && (
        <div className="ov" role="presentation" onMouseDown={close}>
          <div
            className="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="askpop-title"
            aria-describedby="askpop-body"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="x" data-close type="button" aria-label="Close" onClick={close}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <span className="badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </span>

            <span className="kicker">Ask Powerline</span>
            <h2 id="askpop-title">Have a technical question?</h2>
            <p className="tagline">Ask the people who work with it every day.</p>
            <p id="askpop-body" className="body">Products. Specifications. Standards. Real project challenges.</p>
            <p className="body b2">Practical engineering answers. No sales request required.</p>

            <button className="btn btn-primary cta" type="button" onClick={cta}>
              Ask your question &rarr;
            </button>
          </div>
        </div>
      )}

      {curtain !== "off" && (
        <div className={`curtain ${curtainCls}`} aria-hidden="true">
          <div className="c-inner">
            <span className="c-word">Ask Powerline</span>
            <span className="c-beam" />
          </div>
        </div>
      )}

      <style jsx>{`
        .ov {
          position: fixed; inset: 0; z-index: var(--z-overlay, 9999);
          display: flex; align-items: center; justify-content: center;
          padding: clamp(1rem, 3vw, 2rem);
          background: rgba(3, 3, 4, 0.6);
          -webkit-backdrop-filter: blur(5px);
          backdrop-filter: blur(5px);
          animation: ovIn 0.28s var(--ease);
        }
        @keyframes ovIn { from { opacity: 0; } to { opacity: 1; } }

        .panel {
          position: relative;
          width: min(30rem, 100%);
          text-align: center;
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(232, 114, 42, 0.16), transparent 60%),
            var(--bg-3);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: clamp(1.7rem, 4vw, 2.2rem) clamp(1.5rem, 4vw, 2.4rem) clamp(1.4rem, 4vw, 1.8rem);
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.7);
          animation: panIn 0.4s var(--ease);
        }
        @keyframes panIn { from { opacity: 0; transform: translateY(14px) scale(0.985); } to { opacity: 1; transform: none; } }
        .panel::before {
          content: "";
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: clamp(90px, 30%, 140px); height: 3px; border-radius: 0 0 4px 4px;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          box-shadow: 0 0 18px rgba(232, 114, 42, 0.5);
        }

        .x {
          position: absolute; top: 0.8rem; right: 0.8rem; width: 44px; height: 44px;
          display: grid; place-items: center; border-radius: 50%;
          background: rgba(255, 255, 255, 0.04); border: 1px solid var(--line); color: var(--text-dim);
          cursor: pointer;
          transition: color 0.25s var(--ease), border-color 0.25s var(--ease), background 0.25s var(--ease), transform 0.35s var(--ease);
        }
        .x:hover { color: var(--orange); border-color: rgba(232, 114, 42, 0.5); background: rgba(232, 114, 42, 0.08); transform: rotate(90deg); }
        .x:focus-visible { outline: 2px solid var(--orange); outline-offset: 2px; }

        .badge {
          width: 54px; height: 54px; margin: 0 auto 0.9rem;
          display: grid; place-items: center; border-radius: 50%;
          background: rgba(232, 114, 42, 0.12);
          border: 1px solid rgba(232, 114, 42, 0.32);
          color: var(--orange);
          box-shadow: 0 0 28px rgba(232, 114, 42, 0.22);
        }
        .badge svg { width: 28px; height: 28px; }

        .kicker {
          display: block;
          font-family: var(--font-body); font-weight: 600;
          font-size: 0.72rem; letter-spacing: 0.26em; text-indent: 0.26em; text-transform: uppercase;
          color: var(--orange);
        }
        h2 {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.5rem, 4.8vw, 1.95rem); line-height: 1.06; letter-spacing: -0.005em;
          color: #fff; margin: 0.7rem auto 0; max-width: 16ch;
        }
        h2 em { font-style: normal; color: var(--orange); text-shadow: 0 0 22px rgba(232, 114, 42, 0.35); }
        .tagline {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: clamp(0.98rem, 2.6vw, 1.18rem); line-height: 1.14; letter-spacing: 0.005em;
          color: var(--orange); margin: 0.55rem auto 0; max-width: 22ch;
          text-shadow: 0 0 20px rgba(232, 114, 42, 0.3);
        }

        .body { color: var(--text-dim); font-size: 0.95rem; line-height: 1.62; margin: 0.85rem auto 0; max-width: 38ch; }
        .body.b2 { margin-top: 0.7rem; color: var(--text); font-weight: 600; font-size: 0.9rem; }

        .cta { margin: 1.35rem auto 0.2rem; min-height: 48px; }

        /* Branded route-transition curtain (CTA → /ask) */
        /* Dissolve + sweep: the curtain fades in as it rises (soft start) and
           fades out as it wipes off (soft end), on a gentle ease-in-out. The
           reveal's fade is delayed a touch so /ask isn't exposed early. */
        .curtain {
          position: fixed; inset: 0; z-index: 100000;
          display: grid; place-items: center;
          background:
            radial-gradient(75% 60% at 50% 42%, rgba(232, 114, 42, 0.2), transparent 70%),
            var(--bg);
          opacity: 0;
          transform: translateY(100%) translateZ(0);
          transition: transform 0.65s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.5s cubic-bezier(0.65, 0, 0.35, 1);
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
        .curtain.cover { opacity: 1; transform: translateY(0) translateZ(0); }
        .curtain.reveal {
          opacity: 0; transform: translateY(-100%) translateZ(0);
          transition: transform 0.75s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.55s cubic-bezier(0.65, 0, 0.35, 1) 0.18s;
        }
        .c-inner {
          text-align: center;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.12s, transform 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.12s;
        }
        .curtain.cover .c-inner { opacity: 1; transform: none; }
        .curtain.reveal .c-inner { opacity: 0; transform: translateY(-12px); transition: opacity 0.3s ease, transform 0.3s ease; }
        .c-word {
          display: block;
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.06em; font-size: clamp(1.7rem, 5vw, 2.8rem); color: #fff;
        }
        .c-beam {
          display: block; width: 0; height: 2px; margin: 1.1rem auto 0;
          background: linear-gradient(90deg, transparent, var(--orange), transparent);
          box-shadow: 0 0 18px rgba(232, 114, 42, 0.7);
          transition: width 0.8s cubic-bezier(0.65, 0, 0.35, 1) 0.16s;
        }
        .curtain.cover .c-beam { width: min(220px, 60vw); }

        @media (max-width: 600px) {
          .ov { align-items: flex-end; padding: 0; }
          .panel {
            width: 100%; border-radius: 20px 20px 0 0; border-bottom: 0;
            padding: 2.2rem 1.4rem calc(1.8rem + env(safe-area-inset-bottom));
            animation: sheetIn 0.4s var(--ease);
          }
          .cta { width: 100%; }
        }
        @keyframes sheetIn { from { transform: translateY(100%); } to { transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .ov, .panel { animation: none; }
          .x { transition: color 0.2s, border-color 0.2s, background 0.2s; }
          .x:hover { transform: none; }
          .curtain, .c-inner, .c-beam { transition: none; }
        }
      `}</style>
    </>
  );
}
