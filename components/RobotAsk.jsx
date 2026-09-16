"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { runAskTransition } from "@/lib/askTransition";

// Home-page "Ask Powerline" robot mascot — a friendly support agent. Sits
// bottom-right; its big glowing eyes follow the cursor (and blink), it wears a
// headset, and it pops a random enquiry question in a speech bubble as the
// visitor scrolls — until they click it, which takes them to /ask. Built with
// HTML/CSS + inline SVG (no image) and brand colours (glossy dark screen face,
// glowing orange eyes + smile). Coexists with the campaign popup: quiet until the
// popup has been dismissed for the session, then it becomes the ongoing nudge.
// Additive. Keyframe animations use literal easings (styled-jsx drops the
// `animation` shorthand when it contains var()).
const POPUP_KEY = "pl_ask_popup_seen";
const QUESTIONS = [
  "Not sure which panel fits?",
  "Comparing LV and MV options?",
  "Got a specification to check?",
  "Planning a compact substation?",
  "Need an ABB-certified board?",
  "A question about a transformer?",
  "Value-engineering a project?",
  "Reviewing an existing install?",
];

export default function RobotAsk() {
  const router = useRouter();
  const leftEye = useRef(null);
  const rightEye = useRef(null);
  const centers = useRef({ l: null, r: null });
  const cooldownRef = useRef(0);
  const hideRef = useRef(0);
  const lastRef = useRef(-1);
  const busyRef = useRef(false);
  const [bubble, setBubble] = useState(null);

  const go = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    track("robot_ask_click", {});
    setBubble(null);
    // Run the shared branded curtain transition (owned by the popup, mounted
    // globally); fall back to a plain navigation if it isn't registered.
    if (!runAskTransition()) router.push("/ask");
  }, [router]);

  // Eyes follow the cursor: the whole (glowing) eye shifts a few px toward the
  // pointer within the clipped screen. Centres are cached (robot is fixed) and
  // measured at rest after the entrance settles; blink is a separate inner
  // element so it never fights the tracking transform.
  useEffect(() => {
    const measure = () => {
      const eyes = [[leftEye.current, "l"], [rightEye.current, "r"]];
      for (const [eye] of eyes) if (eye) eye.style.transform = ""; // read rest position
      for (const [eye, key] of eyes) {
        if (!eye) continue;
        const r = eye.getBoundingClientRect();
        centers.current[key] = { x: r.left + r.width / 2, y: r.top + r.height / 2, max: r.width * 0.26 };
      }
    };
    const onMove = (e) => {
      const { l, r } = centers.current;
      if (l && leftEye.current) {
        const a = Math.atan2(e.clientY - l.y, e.clientX - l.x);
        leftEye.current.style.transform = `translate(${Math.cos(a) * l.max}px, ${Math.sin(a) * l.max}px)`;
      }
      if (r && rightEye.current) {
        const a = Math.atan2(e.clientY - r.y, e.clientX - r.x);
        rightEye.current.style.transform = `translate(${Math.cos(a) * r.max}px, ${Math.sin(a) * r.max}px)`;
      }
    };
    const settle = setTimeout(measure, 800);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // On scroll, pop a random question — only once the campaign popup has been
  // dismissed (so the two never nudge at once), and never while it's open.
  useEffect(() => {
    const popupSeen = () => {
      try { return sessionStorage.getItem(POPUP_KEY) === "1"; } catch { return false; }
    };
    const onScroll = () => {
      if (busyRef.current) return;
      const now = Date.now();
      if (now < cooldownRef.current) return;
      if (!popupSeen()) return;
      if (document.getElementById("askpop-title")) return; // campaign popup open (its title id)
      let i;
      do { i = Math.floor(Math.random() * QUESTIONS.length); } while (i === lastRef.current && QUESTIONS.length > 1);
      lastRef.current = i;
      const q = QUESTIONS[i];
      setBubble(q);
      track("robot_ask_bubble", { question: q });
      cooldownRef.current = now + 7000;
      clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => setBubble(null), 5000);
    };
    const opts = { passive: true };
    const lenis = typeof window !== "undefined" ? window.__lenis : null;
    window.addEventListener("scroll", onScroll, opts);
    window.addEventListener("wheel", onScroll, opts);
    window.addEventListener("touchmove", onScroll, opts);
    if (lenis && typeof lenis.on === "function") lenis.on("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, opts);
      window.removeEventListener("wheel", onScroll, opts);
      window.removeEventListener("touchmove", onScroll, opts);
      if (lenis && typeof lenis.off === "function") lenis.off("scroll", onScroll);
      clearTimeout(hideRef.current);
    };
  }, []);

  return (
    <div className={`robot${bubble ? " talking" : ""}`}>
      {bubble && (
        <div className="bubble" aria-hidden="true" onClick={go}>
          <p className="q">{bubble}</p>
          <span className="hint">Ask Powerline &rarr;</span>
        </div>
      )}

      <button className="bot" type="button" onClick={go} aria-label="Ask Powerline — open the enquiry page">
        <span className="rig">
          <span className="assembly">
            <span className="band" aria-hidden="true" />
            <span className="cup l" aria-hidden="true" />
            <span className="cup r" aria-hidden="true" />

            <span className="head">
              <span className="screen">
                <span className="eyes">
                  <span className="eye" ref={leftEye}><span className="ball" /></span>
                  <span className="eye" ref={rightEye}><span className="ball" /></span>
                </span>
                <span className="smile">
                  <svg viewBox="0 0 36 18" fill="none" aria-hidden="true">
                    <path d="M5 5 Q18 17 31 5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </span>

            <span className="mic" aria-hidden="true">
              <svg viewBox="0 0 44 40" fill="none">
                <path className="boom" d="M7 5 Q7 26 24 31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <circle className="tip" cx="27" cy="31.5" r="4" />
              </svg>
            </span>
          </span>
        </span>
      </button>

      <style jsx>{`
        .robot {
          position: fixed;
          right: clamp(1rem, 3vw, 2rem);
          bottom: calc(clamp(1rem, 3vw, 2rem) + env(safe-area-inset-bottom));
          z-index: 8000;
          animation: botIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes botIn { from { opacity: 0; transform: translateY(16px) scale(0.9); } to { opacity: 1; transform: none; } }

        .bot {
          display: block; position: relative;
          margin: 0; padding: 0.5rem 0.7rem; border: 0; background: none;
          cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
        }
        .bot:focus-visible { outline: none; }
        .bot:focus-visible .head { outline: 2px solid var(--orange); outline-offset: 4px; }

        .rig { display: block; position: relative; animation: float 4.5s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

        .assembly {
          position: relative; display: block;
          width: 5.2rem; height: 4.7rem;
          transition: transform 0.3s var(--ease);
        }
        .bot:hover .assembly { transform: scale(1.05); }
        .bot:active .assembly { transform: scale(0.96); }

        /* Headset */
        .band {
          position: absolute; top: -0.55rem; left: -0.55rem; right: -0.55rem; height: 3.1rem;
          border: 0.42rem solid #23232c; border-bottom: none;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
          box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.12);
          z-index: 1;
        }
        .cup {
          position: absolute; top: 1.35rem; width: 1rem; height: 1.95rem; border-radius: 0.55rem;
          background: linear-gradient(#2a2a34, #111116);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 4;
        }
        .cup.l { left: -0.62rem; }
        .cup.r { right: -0.62rem; }
        .cup::after {
          content: ""; position: absolute; inset: 0.28rem; border-radius: 0.35rem;
          background: #0a0a0e; box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.85), 0 0 7px rgba(232, 114, 42, 0.35);
        }

        /* Head */
        .head {
          position: absolute; inset: 0; z-index: 3;
          border-radius: 1.5rem 1.5rem 1.75rem 1.75rem;
          background: linear-gradient(155deg, #2c2c35 0%, #17171d 55%, #0d0d11 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.14), inset 0 -7px 16px rgba(0, 0, 0, 0.55);
          transition: box-shadow 0.3s var(--ease);
        }
        .bot:hover .head { box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6), 0 0 36px rgba(232, 114, 42, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.16), inset 0 -7px 16px rgba(0, 0, 0, 0.55); }

        .screen {
          position: absolute; inset: 0.58rem 0.7rem;
          border-radius: 1.15rem; overflow: hidden;
          background: radial-gradient(125% 100% at 50% 12%, #16161f, #050507 72%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 3px 12px rgba(0, 0, 0, 0.85);
        }
        .screen::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 46%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent);
          border-radius: 1.15rem 1.15rem 42% 42%; pointer-events: none;
        }

        .eyes { position: absolute; top: 30%; left: 0; right: 0; display: flex; justify-content: center; gap: 0.78rem; }
        .eye { position: relative; width: 1.2rem; height: 1.42rem; transition: transform 0.09s linear; }
        .ball {
          position: absolute; inset: 0;
          border-radius: 50% 50% 48% 48% / 56% 56% 44% 44%;
          background: radial-gradient(circle at 38% 30%, var(--orange-bright), var(--orange) 72%);
          box-shadow: 0 0 10px rgba(232, 114, 42, 0.85), 0 0 22px rgba(232, 114, 42, 0.45);
          transform-origin: center; animation: blink 5.5s ease-in-out infinite;
        }
        .ball::after {
          content: ""; position: absolute; top: 12%; left: 20%; width: 36%; height: 32%;
          border-radius: 50%; background: rgba(255, 255, 255, 0.92);
        }
        @keyframes blink { 0%, 91%, 100% { transform: scaleY(1); } 95.5% { transform: scaleY(0.08); } }

        .smile { position: absolute; bottom: 17%; left: 0; right: 0; display: flex; justify-content: center; color: var(--orange); }
        .smile svg { width: 1.7rem; height: 0.85rem; filter: drop-shadow(0 0 4px rgba(232, 114, 42, 0.75)); }

        .mic { position: absolute; left: -0.3rem; bottom: 0.15rem; width: 2.5rem; height: 2.3rem; z-index: 5; }
        .mic svg { width: 100%; height: 100%; overflow: visible; }
        .mic .boom { color: #26262f; }
        .mic .tip { fill: var(--orange); filter: drop-shadow(0 0 5px rgba(232, 114, 42, 0.9)); }

        /* Speech bubble */
        .bubble {
          position: absolute; bottom: calc(100% - 0.3rem); right: 0.4rem;
          width: max-content; max-width: min(15rem, 66vw);
          background: var(--bg-3); border: 1px solid var(--line); border-radius: 0.9rem;
          padding: 0.7rem 0.9rem; box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
          transform-origin: bottom right; cursor: pointer;
          animation: pop 0.32s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bubble::after {
          content: ""; position: absolute; bottom: -5px; right: 1.6rem;
          width: 10px; height: 10px; background: var(--bg-3);
          border-right: 1px solid var(--line); border-bottom: 1px solid var(--line);
          transform: rotate(45deg);
        }
        .bubble .q { margin: 0; font-family: var(--font-body); font-size: 0.84rem; line-height: 1.4; color: var(--text); }
        .bubble .hint {
          display: block; margin-top: 0.4rem;
          font-family: var(--font-body); font-weight: 600; font-size: 0.66rem;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--orange);
        }
        @keyframes pop { from { opacity: 0; transform: translateY(6px) scale(0.92); } to { opacity: 1; transform: none; } }

        @media (max-width: 600px) {
          .assembly { width: 4.5rem; height: 4.1rem; }
          .eye { width: 1.05rem; height: 1.24rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .robot, .rig, .ball, .bubble { animation: none; }
          .eye { transition: none; }
        }
      `}</style>
    </div>
  );
}
