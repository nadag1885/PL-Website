"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { powerlineEffect } from "@/lib/content";
import { Reveal } from "@/components/Primitives";

export default function PowerlineEffect() {
  const [pos, setPos] = useState(50);
  const wrap = useRef(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = wrap.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const onDown = (e) => {
    dragging.current = true;
    setFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    setFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
  };
  const onUp = () => (dragging.current = false);

  return (
    <section className="effect">
      <div className="container">
        <Reveal>
          <div className="head sec-head">
            <span className="eyebrow">The Powerline Effect</span>
            <h2 className="section-title">
              Before. <span>After.</span>
            </h2>
            <p>Drag to reveal the transformation we bring to every installation.</p>
          </div>
        </Reveal>

        <Reveal
          className="ba"
          delay={120}
        >
          <div
            className="ba-inner"
            ref={wrap}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
            role="slider"
            aria-label="Before and after comparison"
            aria-valuenow={Math.round(pos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
              if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
            }}
          >
            <Image className="after" src={powerlineEffect.after} alt="After Powerline installation" fill sizes="(max-width: 1280px) 100vw, 1280px" style={{ objectFit: "cover" }} draggable={false} />
            <div className="before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Image src={powerlineEffect.before} alt="Before installation" fill sizes="(max-width: 1280px) 100vw, 1280px" style={{ objectFit: "cover" }} draggable={false} />
              <span className="tag tag-b">Before</span>
            </div>
            <span className="tag tag-a">After</span>
            <div className="handle" style={{ left: `${pos}%` }}>
              <span className="grip">‹ ›</span>
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .effect {
          padding: clamp(3rem, 7vh, 5rem) 0;
          background: var(--bg-2);
        }
        .head {
          margin-bottom: 1.8rem;
          text-align: center;
        }
        .head :global(.eyebrow) {
          justify-content: center;
        }
        .head h2 {
          margin-top: 1rem;
        }
        .head span {
          color: var(--orange);
        }
        .head p {
          color: var(--text-dim);
          margin-top: 1rem;
        }
        .ba-inner {
          position: relative;
          height: min(62vh, 56.25vw);
          aspect-ratio: 16 / 9;
          width: auto;
          max-width: 100%;
          margin: 0 auto;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--line);
          user-select: none;
          cursor: ew-resize;
          touch-action: none;
        }
        .ba-inner img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .before {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .tag {
          position: absolute;
          bottom: 1rem;
          z-index: 5;
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          background: rgba(5, 5, 6, 0.7);
          backdrop-filter: blur(6px);
          color: #fff;
        }
        .tag-b {
          left: 1rem;
        }
        .tag-a {
          right: 1rem;
          color: var(--orange);
        }
        .handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--orange);
          box-shadow: 0 0 18px var(--orange);
          transform: translateX(-1px);
          z-index: 6;
        }
        .grip {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--orange);
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -2px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </section>
  );
}
