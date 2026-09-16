"use client";

import { useEffect, useRef, useState } from "react";

// Ask Powerline — the robot "engineering guide".
//
// Same visual character as the home mascot (components/RobotAsk), rebuilt here as
// a PURPOSEFUL, prop-driven guide for the /ask console. It is interactive:
//   • its eyes TRACK THE CURSOR on pointer devices (falls back to the per-step
//     `look` gaze on touch / reduced-motion),
//   • it NODS to acknowledge each time the step (mood/look) changes,
//   • it changes expression per phase (idle | thinking | happy | celebrate).
//
// Deliberately separate from RobotAsk so the home mascot is untouched. Pure
// HTML/CSS + inline SVG (no image) — posing/scaling never degrades quality. The
// whole rig is sized from one CSS var (--rg). Decorative: aria-hidden.
//
// styled-jsx notes: keyframe animations use literal easings (the `animation`
// shorthand drops a var() easing); no data:/url() backgrounds.

export default function RobotGuide({ mood = "idle", look = "center", compact = false }) {
  const leftEye = useRef(null);
  const rightEye = useRef(null);
  const [nodding, setNodding] = useState(false);

  // Eyes follow the cursor (pointer devices only; skipped for reduced-motion /
  // touch, where the CSS `data-look` gaze takes over). Rects are read fresh each
  // frame so it stays correct while the sticky console scrolls.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;

    let raf = 0;
    let last = null;
    const apply = () => {
      raf = 0;
      if (!last) return;
      const eyes = [leftEye.current, rightEye.current];
      const rects = eyes.map((el) => el && el.getBoundingClientRect());
      for (let i = 0; i < eyes.length; i++) {
        const el = eyes[i];
        const r = rects[i];
        if (!el || !r) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const max = r.width * 0.3;
        const a = Math.atan2(last.clientY - cy, last.clientX - cx);
        el.style.transform = `translate(${Math.cos(a) * max}px, ${Math.sin(a) * max}px)`;
      }
    };
    const onMove = (e) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Nod each time the phase changes (a small acknowledgement of progress).
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setNodding(true);
    const t = setTimeout(() => setNodding(false), 540);
    return () => clearTimeout(t);
  }, [mood, look]);

  return (
    <div className={`rg ${compact ? "compact" : ""} ${nodding ? "nodding" : ""}`} data-mood={mood} data-look={look} aria-hidden="true">
      <span className="rig">
        <span className="nodwrap">
          <span className="assembly">
            <span className="band" />
            <span className="cup l" />
            <span className="cup r" />

            <span className="head">
              <span className="screen">
                <span className="scan" />
                <span className="eyes">
                  <span className="eye" ref={leftEye}><span className="ball" /></span>
                  <span className="eye" ref={rightEye}><span className="ball" /></span>
                </span>
                <span className="smile">
                  <svg viewBox="0 0 36 18" fill="none">
                    <path d="M5 6 Q18 16 31 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </span>

            <span className="mic">
              <svg viewBox="0 0 44 40" fill="none">
                <path className="boom" d="M7 5 Q7 26 24 31" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <circle className="tip" cx="27" cy="31.5" r="4" />
              </svg>
            </span>
          </span>
        </span>
      </span>

      <style jsx>{`
        .rg {
          --rg: 7.4rem;
          display: inline-block;
          position: relative;
          color: var(--orange);
        }
        .rg.compact { --rg: 3.9rem; }

        .rig {
          display: block;
          position: relative;
          animation: rgFloat 4.6s ease-in-out infinite;
        }
        @keyframes rgFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(calc(var(--rg) * -0.04)); } }

        /* nod layer — one-shot acknowledgement on phase change */
        .nodwrap { display: block; }
        .rg.nodding .nodwrap { animation: rgNod 0.54s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes rgNod {
          0% { transform: translateY(0) rotate(0); }
          30% { transform: translateY(calc(var(--rg) * -0.075)) rotate(-3deg); }
          58% { transform: translateY(calc(var(--rg) * 0.02)) rotate(1.5deg); }
          100% { transform: translateY(0) rotate(0); }
        }

        .assembly {
          position: relative;
          display: block;
          width: var(--rg);
          height: calc(var(--rg) * 0.9);
          transform-origin: 50% 80%;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .rg[data-mood="thinking"] .assembly { transform: rotate(-5deg); }
        .rg[data-mood="celebrate"] .rig { animation: rgFloat 4.6s ease-in-out infinite, rgPop 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes rgPop { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(calc(var(--rg) * -0.12)) scale(1.05); } 100% { transform: translateY(0) scale(1); } }

        .band {
          position: absolute;
          top: calc(var(--rg) * -0.105);
          left: calc(var(--rg) * -0.105);
          right: calc(var(--rg) * -0.105);
          height: calc(var(--rg) * 0.6);
          border: calc(var(--rg) * 0.08) solid #23232c;
          border-bottom: none;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
          box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.12);
          z-index: 1;
        }
        .cup {
          position: absolute;
          top: calc(var(--rg) * 0.26);
          width: calc(var(--rg) * 0.19);
          height: calc(var(--rg) * 0.37);
          border-radius: calc(var(--rg) * 0.1);
          background: linear-gradient(#2a2a34, #111116);
          border: 1px solid rgba(255, 255, 255, 0.09);
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 4;
        }
        .cup.l { left: calc(var(--rg) * -0.12); }
        .cup.r { right: calc(var(--rg) * -0.12); }
        .cup::after {
          content: "";
          position: absolute;
          inset: calc(var(--rg) * 0.05);
          border-radius: calc(var(--rg) * 0.06);
          background: #0a0a0e;
          box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.85), 0 0 7px rgba(232, 114, 42, 0.35);
        }

        .head {
          position: absolute;
          inset: 0;
          z-index: 3;
          border-radius: calc(var(--rg) * 0.29) calc(var(--rg) * 0.29) calc(var(--rg) * 0.34) calc(var(--rg) * 0.34);
          background: linear-gradient(155deg, #2c2c35 0%, #17171d 55%, #0d0d11 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.14), inset 0 -7px 16px rgba(0, 0, 0, 0.55);
          transition: box-shadow 0.35s var(--ease);
        }
        .rg[data-mood="happy"] .head,
        .rg[data-mood="celebrate"] .head {
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.6), 0 0 40px rgba(232, 114, 42, 0.45), inset 0 2px 3px rgba(255, 255, 255, 0.16), inset 0 -7px 16px rgba(0, 0, 0, 0.55);
        }

        .screen {
          position: absolute;
          inset: calc(var(--rg) * 0.11) calc(var(--rg) * 0.135);
          border-radius: calc(var(--rg) * 0.22);
          overflow: hidden;
          background: radial-gradient(125% 100% at 50% 12%, #16161f, #050507 72%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 3px 12px rgba(0, 0, 0, 0.85);
        }
        .screen::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 46%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent);
          border-radius: calc(var(--rg) * 0.22) calc(var(--rg) * 0.22) 42% 42%;
          pointer-events: none;
        }
        .scan {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          top: 0;
          background: linear-gradient(90deg, transparent, rgba(232, 114, 42, 0.5), transparent);
          opacity: 0.5;
          animation: rgScan 3.8s linear infinite;
        }
        @keyframes rgScan { 0% { top: 8%; opacity: 0; } 20% { opacity: 0.55; } 80% { opacity: 0.55; } 100% { top: 92%; opacity: 0; } }

        .eyes {
          position: absolute;
          top: 30%; left: 0; right: 0;
          display: flex;
          justify-content: center;
          gap: calc(var(--rg) * 0.15);
        }
        .eye {
          position: relative;
          width: calc(var(--rg) * 0.23);
          height: calc(var(--rg) * 0.27);
          transition: transform 0.14s ease-out;
        }
        /* resting gaze per step (used until the cursor first moves / on touch) */
        .rg[data-look="left"] .eye { transform: translateX(calc(var(--rg) * -0.035)); }
        .rg[data-look="right"] .eye { transform: translateX(calc(var(--rg) * 0.035)); }
        .rg[data-look="up"] .eye { transform: translateY(calc(var(--rg) * -0.03)); }
        .rg[data-look="down"] .eye { transform: translateY(calc(var(--rg) * 0.035)); }
        .ball {
          position: absolute;
          inset: 0;
          border-radius: 50% 50% 48% 48% / 56% 56% 44% 44%;
          background: radial-gradient(circle at 38% 30%, var(--orange-bright), var(--orange) 72%);
          box-shadow: 0 0 10px rgba(232, 114, 42, 0.85), 0 0 22px rgba(232, 114, 42, 0.45);
          transform-origin: center;
          animation: rgBlink 5.5s ease-in-out infinite;
        }
        .ball::after {
          content: "";
          position: absolute;
          top: 12%; left: 20%;
          width: 36%; height: 32%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
        }
        @keyframes rgBlink { 0%, 91%, 100% { transform: scaleY(1); } 95.5% { transform: scaleY(0.08); } }
        .rg[data-mood="celebrate"] .ball { animation: none; transform: scaleY(0.62); box-shadow: 0 0 14px rgba(232, 114, 42, 0.95), 0 0 30px rgba(232, 114, 42, 0.6); }

        .smile {
          position: absolute;
          bottom: 16%; left: 0; right: 0;
          display: flex;
          justify-content: center;
          color: var(--orange);
          transition: transform 0.35s var(--ease);
        }
        .smile svg {
          width: calc(var(--rg) * 0.33);
          height: calc(var(--rg) * 0.16);
          filter: drop-shadow(0 0 4px rgba(232, 114, 42, 0.75));
        }
        .rg[data-mood="happy"] .smile,
        .rg[data-mood="celebrate"] .smile { transform: scale(1.12); }
        .rg[data-mood="thinking"] .smile { transform: scaleX(0.7); opacity: 0.8; }

        .mic {
          position: absolute;
          left: calc(var(--rg) * -0.06);
          bottom: calc(var(--rg) * 0.03);
          width: calc(var(--rg) * 0.48);
          height: calc(var(--rg) * 0.44);
          z-index: 5;
        }
        .mic svg { width: 100%; height: 100%; overflow: visible; }
        .mic .boom { color: #26262f; }
        .mic .tip { fill: var(--orange); filter: drop-shadow(0 0 5px rgba(232, 114, 42, 0.9)); }

        @media (prefers-reduced-motion: reduce) {
          .rig, .rg[data-mood="celebrate"] .rig, .rg.nodding .nodwrap { animation: none; }
          .ball { animation: none; }
          .scan { display: none; }
          .eye, .assembly, .smile, .head { transition: none; }
        }
      `}</style>
    </div>
  );
}
