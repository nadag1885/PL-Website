"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import CircuitIntro from "./CircuitIntro";

/**
 * SECTION 00 — Opening experience.
 * Black → the Powerline "P" powers up as the die of a circuit board → orange
 * traces draw outward from the logo and light their pads until the board is
 * complete → the finished board dollies toward the viewer and fades to reveal
 * the site.
 */
export default function Preloader({ onComplete }) {
  const root = useRef(null);
  const [hidden, setHidden] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = window.__lenis;
    lenis?.stop();
    document.documentElement.classList.add("lenis-stopped");

    const finish = () => {
      document.documentElement.classList.remove("lenis-stopped");
      lenis?.start();
      setHidden(true);
      onCompleteRef.current?.();
    };

    if (reduce) {
      finish();
      return;
    }

    // The board finishes drawing ≈1.7s. Hold a beat on the complete board, then
    // freeze every loop (.ci-closing) and dolly the whole board toward the
    // viewer while it fades — nothing restarts (no React state change until
    // finish()), so the intro can never re-render mid-animation.
    const tl = gsap.timeline({ onComplete: finish });
    tl.call(() => document.querySelector(".ci")?.classList.add("ci-closing"), null, 2.4);
    tl.to(
      ".ci-svg",
      { scale: 1.9, transformOrigin: "50% 48%", duration: 1.3, ease: "power2.inOut", force3D: true },
      2.4
    );
    tl.to(root.current, { autoAlpha: 0, duration: 1.0, ease: "power2.out" }, 2.95);

    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    <div className="pre" ref={root}>
      <CircuitIntro />

      <style jsx>{`
        .pre {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #000;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
