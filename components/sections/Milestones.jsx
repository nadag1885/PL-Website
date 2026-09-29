"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { milestones } from "@/lib/content";

const INTERVAL = 3120; // ms each milestone holds before auto-advancing (5200 − 40%)

/**
 * Our Milestones — an AUTO-PLAYING story carousel (no scroll-scrub, no pin).
 *
 * Each milestone holds for INTERVAL then advances on its own. A slim bar counts
 * down to the next one; clicking a year jumps straight to it; hovering the
 * stage (or pressing pause) freezes the countdown. The countdown bar IS the
 * clock — it drives the advance via onAnimationEnd, so pause/resume stays
 * perfectly in sync. It only runs while the section is on screen.
 *
 * Premium touches: a giant ghost year behind the copy, a slow Ken-Burns push on
 * the active photo, and a crossfade+rise between slides. All transform/opacity.
 * prefers-reduced-motion falls back to a static, fully-visible stack.
 */
export default function Milestones() {
  const root = useRef(null);
  const n = milestones.length;

  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [inView, setInView] = useState(false);

  // Auto-play runs the whole time ANY part of the section is on screen — it
  // starts the moment you scroll into Our Milestones and keeps going until the
  // section has scrolled away (i.e. you've reached the next section, Our
  // Network). It is NOT affected by the cursor at all.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frozen = userPaused || !inView;
  const go = (i) => setActive(((i % n) + n) % n);

  if (reduced) {
    // static, no motion: show every milestone in a simple vertical stack
    return (
      <section className="ms" ref={root} id="milestones">
        <div className="container">
          <span className="eyebrow">Our Milestones</span>
          <div className="ms-static">
            {milestones.map((m) => (
              <article className="ms-srow" key={m.year}>
                <div className="ms-stxt">
                  <span className="ms-syear">{m.year}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </div>
                <div className="ms-smedia">
                  <img src={m.img} alt={`${m.year} — ${m.title}`} loading="lazy" />
                </div>
              </article>
            ))}
          </div>
        </div>
        <style jsx>{staticCss}</style>
      </section>
    );
  }

  return (
    <section className="ms" ref={root} id="milestones">
      <div className="container ms-inner">
        {/* header + year rail */}
        <div className="ms-head">
          <div className="ms-head-l">
            <span className="eyebrow">Our Milestones</span>
            <h2 className="ms-title">
              A journey <span className="text-orange">in power.</span>
            </h2>
          </div>

          <div className="ms-rail" role="tablist" aria-label="Milestones timeline">
            {milestones.map((m, i) => (
              <button
                key={m.year}
                role="tab"
                aria-selected={i === active}
                aria-label={`Show ${m.year} — ${m.title}`}
                className={`ms-year ${i === active ? "on" : i < active ? "past" : ""}`}
                onClick={() => go(i)}
              >
                {m.year}
              </button>
            ))}
          </div>
        </div>

        {/* countdown bar — this is the clock that drives the auto-advance */}
        <div className="ms-prog" aria-hidden="true">
          <span
            className="ms-prog-fill"
            key={active}
            style={{
              animationDuration: `${INTERVAL}ms`,
              animationPlayState: frozen ? "paused" : "running",
            }}
            onAnimationEnd={() => go(active + 1)}
          />
        </div>

        {/* stage — crossfading slides */}
        <div className="ms-stage">
          {milestones.map((m, i) => {
            return (
              <article
                className={`ms-slide ${i === active ? "is-active" : ""}`}
                key={m.year}
                aria-hidden={i !== active}
              >
                <span className="ms-ghost">{m.year}</span>
                <div className="ms-txt">
                  <span className="ms-count">
                    {String(i + 1).padStart(2, "0")}
                    <span className="ms-count-tot"> / {String(n).padStart(2, "0")}</span>
                  </span>
                  <span className="ms-yr">{m.year}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </div>
                <div className="ms-media">
                  {/* always load every slide's image (only 9) so jumping to any
                     year never shows a blank — windowed src caused that */}
                  <Image
                    src={m.img}
                    alt={`${m.year} — ${m.title}`}
                    fill
                    sizes="(max-width: 900px) 92vw, 46vw"
                    style={{ objectFit: "cover" }}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                  <span className="ms-frame" />
                </div>
              </article>
            );
          })}

          {/* play / pause — control for touch (not hover-only) */}
          <button
            className="ms-pp"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused ? "Play timeline" : "Pause timeline"}
            aria-pressed={userPaused}
          >
            {userPaused ? (
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .ms {
          position: relative;
          background: var(--bg-2);
          padding: clamp(4rem, 10vh, 7rem) 0;
        }
        .ms-inner {
          display: flex;
          flex-direction: column;
          gap: clamp(1.4rem, 3vh, 2.2rem);
        }

        /* ── header + year rail ── */
        .ms-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem 2rem;
          flex-wrap: wrap;
        }
        .ms-title {
          font-family: var(--font-head);
          font-weight: 800;
          text-transform: uppercase;
          font-size: clamp(1.6rem, 3.4vw, 2.8rem);
          line-height: 1;
          margin-top: 0.8rem;
        }
        .text-orange {
          color: var(--orange);
        }
        .ms-rail {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .ms-year {
          appearance: none;
          background: none;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 0.45rem 1rem;
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--text-faint);
          cursor: pointer;
          transition: color 0.3s, border-color 0.3s, background 0.3s,
            transform 0.3s var(--ease);
        }
        .ms-year:hover {
          color: #fff;
          border-color: rgba(232, 114, 42, 0.5);
        }
        .ms-year.past {
          color: var(--text-dim);
          border-color: rgba(232, 114, 42, 0.25);
        }
        .ms-year.on {
          color: #fff;
          background: var(--orange);
          border-color: var(--orange);
          box-shadow: 0 0 18px rgba(232, 114, 42, 0.45);
        }

        /* ── countdown clock ── */
        .ms-prog {
          position: relative;
          height: 2px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .ms-prog-fill {
          position: absolute;
          inset: 0;
          transform-origin: left center;
          transform: scaleX(0);
          background: linear-gradient(90deg, var(--orange-deep), var(--orange-bright));
          box-shadow: 0 0 14px var(--orange);
          animation-name: msProg;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes msProg {
          to {
            transform: scaleX(1);
          }
        }

        /* ── stage ── */
        .ms-stage {
          position: relative;
          min-height: clamp(430px, 58vh, 560px);
        }
        .ms-slide {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: 1fr 1.04fr;
          gap: clamp(1.5rem, 4vw, 4rem);
          align-items: center;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.6s var(--ease), visibility 0.6s;
        }
        .ms-slide.is-active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        /* giant ghost year behind the copy */
        .ms-ghost {
          position: absolute;
          left: -0.5rem;
          top: -2.4rem;
          font-family: var(--font-head);
          font-weight: 800;
          font-size: clamp(7rem, 17vw, 15rem);
          line-height: 0.8;
          letter-spacing: -0.04em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(232, 114, 42, 0.12);
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
        .ms-txt {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        /* content rises in as the slide becomes active */
        .is-active .ms-txt > * {
          animation: msRise 0.6s var(--ease) both;
        }
        .is-active .ms-yr {
          animation-delay: 0.05s;
        }
        .is-active h3 {
          animation-delay: 0.12s;
        }
        .is-active p {
          animation-delay: 0.19s;
        }
        @keyframes msRise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .ms-count {
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          color: var(--orange);
        }
        .ms-count-tot {
          color: var(--text-faint);
        }
        .ms-yr {
          font-family: var(--font-head);
          font-weight: 800;
          font-size: clamp(2.6rem, 6vw, 5rem);
          line-height: 1;
          color: #fff;
          margin: 0.5rem 0 0.2rem;
        }
        .ms-txt h3 {
          font-size: clamp(1.3rem, 2.6vw, 2.1rem);
          text-transform: uppercase;
          color: var(--orange);
          margin: 0.4rem 0 1rem;
          line-height: 1.05;
        }
        .ms-txt p {
          color: var(--text-dim);
          font-size: clamp(1rem, 1.4vw, 1.18rem);
          line-height: 1.65;
          max-width: 46ch;
        }
        .ms-media {
          position: relative;
          height: clamp(300px, 52vh, 520px);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--line);
          z-index: 1;
        }
        /* next/image (fill) sets position/size/object-fit inline; the Ken-Burns
           keyframe lives in globals.css so it can reach next/image's <img>. */
        .is-active .ms-media :global(img) {
          animation: msKB 6s ease-out both;
        }
        .ms-frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 20px;
          box-shadow: inset 0 0 0 1px rgba(232, 114, 42, 0.25);
        }

        /* play / pause */
        .ms-pp {
          position: absolute;
          right: 0;
          bottom: 0;
          z-index: 3;
          width: 3.75rem;
          height: 3.75rem;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: rgba(5, 5, 6, 0.6);
          backdrop-filter: blur(6px);
          color: #fff;
          cursor: pointer;
          transition: color 0.3s, border-color 0.3s, transform 0.3s var(--ease);
        }
        .ms-pp:hover {
          color: var(--orange);
          border-color: rgba(232, 114, 42, 0.5);
          transform: scale(1.08);
        }

        @media (max-width: 900px) {
          .ms-stage {
            min-height: 0;
          }
          .ms-slide {
            position: relative;
            inset: auto;
            grid-template-columns: 1fr;
            gap: 1.2rem;
            opacity: 0;
            height: 0;
            overflow: hidden;
          }
          .ms-slide.is-active {
            height: auto;
            overflow: visible;
          }
          .ms-media {
            order: -1;
            height: 56vw;
            min-height: 220px;
          }
          .ms-ghost {
            top: auto;
            bottom: -1rem;
            font-size: 30vw;
          }
          .ms-pp {
            position: static;
            margin: 1.2rem auto 0;
          }
        }
      `}</style>
    </section>
  );
}

const staticCss = `
  .ms { background: var(--bg-2); padding: clamp(4rem,10vh,7rem) 0; }
  .ms-static { display: flex; flex-direction: column; gap: 3rem; margin-top: 2rem; }
  .ms-srow { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; }
  .ms-syear { font-family: var(--font-head); font-weight: 800; font-size: 2.4rem; color: var(--orange); }
  .ms-srow h3 { text-transform: uppercase; color: #fff; margin: 0.4rem 0 0.8rem; }
  .ms-srow p { color: var(--text-dim); line-height: 1.6; }
  .ms-smedia { border-radius: 20px; overflow: hidden; border: 1px solid var(--line); aspect-ratio: 4/3; }
  .ms-smedia img { width: 100%; height: 100%; object-fit: cover; }
  @media (max-width: 900px) { .ms-srow { grid-template-columns: 1fr; } .ms-smedia { order: -1; } }
`;
