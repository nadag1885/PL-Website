"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import HubIntro from "./HubIntro";

/**
 * SECTION 00 — Opening experience.
 * Black → the Powerline "P" powers up as a hub → five branches grow out of it
 * one-by-one, lighting each value node and revealing its card → the completed
 * network holds, then gently pushes in and fades to reveal the site.
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

    // The network finishes building ≈3.0s. Hold a beat on the complete network,
    // then freeze the P's current loop (.hi-closing), gently push the whole scene
    // in and fade it out. No React state changes until finish(), so the intro can
    // never re-render mid-animation.
    const tl = gsap.timeline({ onComplete: finish });
    tl.call(() => document.querySelector(".hi")?.classList.add("hi-closing"), null, 3.2);
    tl.to(".hi", { scale: 1.06, transformOrigin: "50% 50%", duration: 1.0, ease: "power2.inOut", force3D: true }, 3.2);
    tl.to(root.current, { autoAlpha: 0, duration: 0.9, ease: "power2.out" }, 3.5);

    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hidden) return null;

  return (
    <div className="pre" ref={root}>
      <HubIntro />

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
