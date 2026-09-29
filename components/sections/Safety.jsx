"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { safety } from "@/lib/content";

export default function Safety() {
  const root = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(".sf-img img", {
        yPercent: 18,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="safety" ref={root}>
      <div className="sf-img">
        <Image src={safety.img} alt="Powerline facility — safety first" fill sizes="100vw" style={{ objectFit: "cover" }} />
        <div className="veil" />
      </div>
      <div className="container sf-content">
        <span className="eyebrow">Safety &amp; Quality</span>
        <h2 className="sf-title">
          We never forget
          <br />
          about <span>safety</span>
        </h2>
        <p>{safety.body}</p>
      </div>
      <style jsx>{`
        .safety {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .sf-img {
          position: absolute;
          inset: -10% 0;
          z-index: 0;
        }
        /* next/image (fill) defaults to height:100%; the parallax needs the photo
           taller than its frame, so force 120% (styled-jsx can't scope its <img>). */
        .sf-img :global(img) {
          height: 120% !important;
          will-change: transform;
        }
        .veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(
              90deg,
              rgba(5, 5, 6, 0.92),
              rgba(5, 5, 6, 0.55) 70%,
              rgba(5, 5, 6, 0.3)
            ),
            linear-gradient(0deg, var(--bg), transparent 50%);
        }
        .sf-content {
          position: relative;
          z-index: 2;
        }
        .sf-title {
          font-size: clamp(2rem, 5.5vw, 4.2rem);
          text-transform: uppercase;
          margin: 1.2rem 0 1.5rem;
        }
        .sf-title span {
          color: var(--orange);
        }
        .sf-content p {
          max-width: 56ch;
          color: var(--text-dim);
          font-size: 1.08rem;
        }
      `}</style>
    </section>
  );
}
