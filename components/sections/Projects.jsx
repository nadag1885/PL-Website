"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { projects } from "@/lib/content";
import { Reveal } from "@/components/Primitives";

/**
 * Powerline Projects — an auto-looping strip you can also grab and drag.
 * The track scrolls on its own (JS rAF, not scroll-bound); holding it pauses
 * the drift and follows the pointer left/right, releasing flings it with
 * momentum, then it resumes. The loop is seamless in both directions.
 */
export default function Projects() {
  // Duplicate the set once so the loop is seamless: translating by exactly one
  // base set lands the copy where the original began. Each card owns its
  // trailing gap via margin so the seam has no half-gap jump.
  const loop = [...projects, ...projects];
  const vpRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const vp = vpRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let baseWidth = track.scrollWidth / 2; // two identical halves
    const measure = () => { baseWidth = track.scrollWidth / 2; };
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let offset = 0;
    let dragging = false;
    let hovering = false;
    let lastX = 0;
    let lastMoveT = 0;
    let velocity = 0; // px/s, for fling momentum
    const SPEED = reduce ? 0 : 42; // auto-scroll px/s

    // keep offset within one base set so the loop is seamless either direction
    const wrap = () => {
      if (baseWidth > 0) {
        offset = (((offset % baseWidth) + baseWidth) % baseWidth) - baseWidth;
      }
    };
    const apply = () => {
      track.style.transform = `translate3d(${offset}px,0,0)`;
    };

    let raf;
    let lastT = null;
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (lastT == null) { lastT = t; apply(); return; }
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      if (dragging) return; // pointer drives the position
      if (Math.abs(velocity) > 4) {
        offset += velocity * dt;            // glide after release
        velocity *= Math.pow(0.92, dt * 60); // frame-rate-independent friction
      } else {
        velocity = 0;
        if (!hovering) offset -= SPEED * dt; // gentle auto-drift
      }
      wrap();
      apply();
    };
    raf = requestAnimationFrame(tick);

    const onDown = (e) => {
      dragging = true;
      velocity = 0;
      lastX = e.clientX;
      lastMoveT = performance.now();
      vp.style.cursor = "grabbing";
      if (e.pointerId != null) { try { vp.setPointerCapture(e.pointerId); } catch {} }
    };
    const onMove = (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dts = Math.max(0.001, (now - lastMoveT) / 1000);
      offset += dx;
      velocity = Math.max(-2600, Math.min(2600, dx / dts));
      lastX = e.clientX;
      lastMoveT = now;
      wrap();
      apply();
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      vp.style.cursor = "grab";
      // stale flick → don't fling
      if (performance.now() - lastMoveT > 90) velocity = 0;
      if (e && e.pointerId != null) { try { vp.releasePointerCapture(e.pointerId); } catch {} }
    };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; };

    vp.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    vp.addEventListener("pointerenter", onEnter);
    vp.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vp.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      vp.removeEventListener("pointerenter", onEnter);
      vp.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="projects" className="pj">
      <div className="container">
        <Reveal>
          <div className="pj-head">
            <span className="eyebrow">Powerline Projects</span>
            <h2 className="pj-title">
              Power that built <span className="text-orange">landmarks.</span>
            </h2>
            <p className="pj-lead">
              From hospitals to mega-developments, our boards energise the
              places that shape Egypt.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="pj-marquee" ref={vpRef}>
            <div className="pj-track" ref={trackRef}>
              {loop.map((p, i) => (
                <article className="pj-card" key={i}>
                  <Image
                    className="pj-card-img"
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 900px) 78vw, 25rem"
                    style={{ objectFit: "cover" }}
                    draggable={false}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <span className="pj-card-veil" />
                  <span className="pj-dot" />
                  <span className="pj-type">{p.type}</span>
                  <h3 className="pj-name" dir="auto">{p.name}</h3>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .pj {
          padding: clamp(4rem, 10vh, 7rem) 0;
          background: transparent;
        }
        .pj-head {
          text-align: center;
          margin-bottom: clamp(2rem, 5vh, 3rem);
        }
        .pj-head :global(.eyebrow) {
          justify-content: center;
        }
        .pj-title {
          font-family: var(--font-head);
          font-weight: 800;
          text-transform: uppercase;
          line-height: 1.04;
          font-size: clamp(1.8rem, 4vw, 3rem);
          margin-top: 1rem;
          color: #fff;
        }
        .text-orange {
          color: var(--orange);
        }
        .pj-lead {
          color: var(--text-dim);
          font-size: 1.02rem;
          max-width: 52ch;
          margin: 1.1rem auto 0;
        }

        /* ── the looping strip (JS-driven; grab to drag) ── */
        .pj-marquee {
          overflow: hidden;
          cursor: grab;
          /* horizontal gestures drag the strip; vertical still scrolls the page */
          touch-action: pan-y;
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent,
            #000 6%,
            #000 94%,
            transparent
          );
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 6%,
            #000 94%,
            transparent
          );
        }
        .pj-marquee:active {
          cursor: grabbing;
        }
        .pj-track {
          display: flex;
          width: max-content;
          will-change: transform;
          user-select: none;
        }
        /* next/image can't receive styled-jsx's scope class → target :global(). */
        :global(.pj-card-img) {
          -webkit-user-drag: none;
          user-select: none;
        }

        .pj-card {
          flex: 0 0 auto;
          margin-right: clamp(1.5rem, 3vw, 3rem);
          width: clamp(17.5rem, 30vw, 25rem);
          height: clamp(18.75rem, 42vh, 26.875rem);
          position: relative;
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(160deg, #0d0d0f 0%, #090909 100%);
          padding: clamp(1.6rem, 2.6vw, 2.4rem);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: border-color 0.4s ease, transform 0.5s var(--ease);
        }
        .pj-card:hover {
          border-color: rgba(232, 114, 42, 0.45);
          transform: translateY(-6px);
        }
        /* fill sets position/size/object-fit inline; these add the base zoom +
           layering that styled-jsx scoping can't reach. */
        :global(.pj-card-img) {
          z-index: 0;
          transform: scale(1.04);
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pj-card:hover :global(.pj-card-img) {
          transform: scale(1.1);
        }
        .pj-card-veil {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            180deg,
            rgba(5, 5, 6, 0.2) 0%,
            rgba(5, 5, 6, 0.5) 45%,
            rgba(5, 5, 6, 0.93) 100%
          );
        }
        .pj-dot,
        .pj-type,
        .pj-name {
          position: relative;
          z-index: 2;
        }
        .pj-dot {
          position: absolute;
          top: clamp(1.4rem, 2.4vw, 2.2rem);
          left: clamp(1.4rem, 2.4vw, 2.2rem);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--orange);
          box-shadow: 0 0 14px var(--orange), 0 0 28px rgba(232, 114, 42, 0.5);
        }
        .pj-type {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--orange);
          margin-bottom: 0.5rem;
        }
        .pj-name {
          font-family: var(--font-head);
          font-weight: 800;
          font-size: clamp(1.4rem, 2.4vw, 2.1rem);
          line-height: 1.04;
          text-transform: uppercase;
          color: #fff;
        }

        @media (max-width: 900px) {
          .pj-card {
            width: 78vw;
            max-width: 340px;
            height: 86vw;
            max-height: 380px;
          }
        }
        /* reduced-motion: JS sets auto-scroll speed to 0 (no drift), but the
           strip stays a single row that the user can still grab and drag. */
      `}</style>
    </section>
  );
}
