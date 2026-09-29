"use client";

import Link from "next/link";
import Image from "next/image";
import { productLines } from "@/lib/content";
import { Reveal, CountUp } from "@/components/Primitives";

/**
 * Product Lines — a cinematic full-bleed cover grid. Each line is a dark,
 * baked-imagery tile with an HTML title (so type stays crisp/responsive), two
 * count-up "data" chips in frosted glass, and an Explore affordance. Hover
 * energises the tile: the cover pushes in, an orange "current" edge lights, a
 * warm tint blooms, the title underline draws, and the arrow advances. Reveal
 * is staggered on scroll. All transform/opacity; fully reduced-motion-safe.
 */
export default function ProductLines() {
  return (
    <section className="lines" id="solutions">
      <span className="glow" aria-hidden="true" />
      <span className="grid-tex" aria-hidden="true" />
      <div className="container">
        <Reveal>
          <div className="head sec-head">
            <span className="eyebrow">Product Lines</span>
            <h2 className="section-title">
              Eight lines.
              <br />
              <span>One flow of power.</span>
            </h2>
            <p className="head-sub">
              From low-voltage distribution to medium-voltage switchgear, compact
              substations, transformers and power-factor correction — every line
              engineered, type-tested and assembled in-house.
            </p>
          </div>
        </Reveal>

        <div className="grid">
          {productLines.map((l, i) => (
            <Reveal key={l.key} delay={i * 70} className="cell">
              <article className="tile">
                <Link href={l.href} className="tile-link" aria-label={`${l.title} — explore line`}>
                  <Image className="cover" src={l.img} alt={l.title} fill sizes="(max-width: 520px) 22rem, (max-width: 860px) 50vw, (max-width: 1200px) 33vw, 25vw" style={{ objectFit: "cover" }} />
                  <span className="veil" aria-hidden="true" />
                  <span className="tint" aria-hidden="true" />
                  <span className="edge" aria-hidden="true" />
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>

                  <div className="body">
                    <h3 className="t-title">{l.title}</h3>
                    <div className="specs">
                      {l.specs.map((s) => (
                        <span className="chip" key={s.label}>
                          <span className="v">
                            <CountUp value={s.value} suffix={s.suffix} />
                          </span>
                          <span className="l">{s.label}</span>
                        </span>
                      ))}
                    </div>
                    <span className="more">
                      Explore line
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      <style jsx>{`
        .lines {
          position: relative;
          padding: clamp(5rem, 12vh, 9rem) 0;
          overflow: hidden;
        }
        /* ambient orange glow behind the grid */
        .glow {
          position: absolute;
          top: 4%;
          left: 50%;
          width: min(1100px, 92vw);
          height: 560px;
          transform: translateX(-50%);
          background: radial-gradient(
            55% 55% at 50% 40%,
            rgba(232, 114, 42, 0.18),
            transparent 70%
          );
          filter: blur(30px);
          pointer-events: none;
          z-index: 0;
        }
        /* faint engineering grid texture, masked to the centre */
        .grid-tex {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(232, 114, 42, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232, 114, 42, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          -webkit-mask-image: radial-gradient(circle at 50% 34%, #000 0%, transparent 62%);
          mask-image: radial-gradient(circle at 50% 34%, #000 0%, transparent 62%);
          pointer-events: none;
          z-index: 0;
        }
        .container {
          position: relative;
          z-index: 1;
        }

        .head {
          text-align: center;
          max-width: 62ch;
          margin-inline: auto;
        }
        .head :global(.eyebrow) {
          justify-content: center;
        }
        .section-title {
          margin: 1rem 0 0;
          color: #fff;
        }
        .section-title span {
          color: var(--orange);
          text-shadow: 0 0 34px rgba(232, 114, 42, 0.45);
        }
        .head-sub {
          margin: 1.2rem auto 0;
          max-width: 58ch;
          color: var(--text-dim);
          font-size: clamp(0.95rem, 1.2vw, 1.05rem);
          line-height: 1.6;
        }

        /* ── grid ── */
        .grid {
          margin-top: clamp(2.6rem, 5vw, 4rem);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(0.85rem, 1.4vw, 1.35rem);
        }
        .grid :global(.cell) {
          display: flex;
        }

        /* ── tile ── */
        .tile {
          position: relative;
          flex: 1;
          aspect-ratio: 4 / 5;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: #0b0b0d;
          /* NB: no transform on the tile — a hover translate/scale moves the
             clickable area out from under the pointer and makes clicks flaky
             (you'd have to click several times). All hover feedback below is
             non-moving (border, shadow, image zoom, edge, tint). */
          transition: border-color 0.45s ease, box-shadow 0.45s ease;
        }
        .tile:hover {
          border-color: rgba(232, 114, 42, 0.6);
          box-shadow: 0 30px 80px -34px rgba(0, 0, 0, 0.9),
            0 0 55px -18px rgba(232, 114, 42, 0.5);
        }
        :global(.tile-link) {
          position: absolute;
          inset: 0;
          display: block;
        }
        :global(.tile-link:focus-visible) {
          outline: 2px solid var(--orange);
          outline-offset: 3px;
          border-radius: 20px;
        }
        /* next/image (fill) sets position/size/object-fit inline; styled-jsx can't
           reach its <img>, so the zoom + tint live in :global() rules. */
        :global(.cover) {
          transform: scale(1.03);
          transition: transform 0.7s var(--ease), filter 0.6s ease;
          filter: saturate(1.02);
        }
        .tile:hover :global(.cover) {
          transform: scale(1.1);
          filter: saturate(1.12);
        }
        /* dark overlay — a moody wash across the whole cover, deepening toward
           the bottom where the copy sits. Eases back on hover so the product
           "comes alive". */
        .veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(
              180deg,
              rgba(5, 5, 6, 0.58) 0%,
              rgba(5, 5, 6, 0.46) 32%,
              rgba(5, 5, 6, 0.74) 66%,
              rgba(5, 5, 6, 0.96) 100%
            );
          transition: opacity 0.55s ease;
        }
        .tile:hover .veil {
          opacity: 0.8;
        }
        /* warm orange bloom on hover */
        .tint {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            120% 80% at 50% 100%,
            rgba(232, 114, 42, 0.32),
            transparent 62%
          );
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .tile:hover .tint {
          opacity: 1;
        }
        /* the orange "current" edge that lights across the top on hover */
        .edge {
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--orange),
            var(--orange-bright, #ff8a4c),
            var(--orange),
            transparent
          );
          opacity: 0;
          box-shadow: 0 0 18px rgba(232, 114, 42, 0.8);
          transition: opacity 0.5s ease;
          z-index: 3;
        }
        .tile:hover .edge {
          opacity: 1;
        }
        .idx {
          position: absolute;
          top: 0.9rem;
          left: 0.9rem;
          z-index: 3;
          font-family: var(--font-head);
          font-weight: 800;
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          color: #fff;
          padding: 0.24rem 0.55rem;
          border-radius: 8px;
          background: rgba(232, 114, 42, 0.9);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
        }

        .body {
          position: absolute;
          inset: auto 0 0 0;
          z-index: 3;
          padding: clamp(1rem, 1.6vw, 1.5rem);
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .t-title {
          position: relative;
          align-self: flex-start;
          font-family: var(--font-head);
          font-weight: 800;
          font-style: italic;
          font-size: clamp(1.35rem, 1.9vw, 1.9rem);
          line-height: 1.02;
          color: #fff;
          text-shadow: 0 2px 22px rgba(0, 0, 0, 0.7);
          margin: 0;
        }
        .t-title::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -0.28rem;
          height: 2px;
          background: linear-gradient(90deg, var(--orange), transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s var(--ease);
        }
        .tile:hover .t-title::after {
          transform: scaleX(1);
        }
        /* frosted "data" chips */
        .specs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .chip {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.14rem;
          padding: 0.44rem 0.72rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .chip .v {
          font-family: var(--font-head);
          font-weight: 800;
          font-size: 1.05rem;
          line-height: 1;
          color: var(--orange);
          font-variant-numeric: tabular-nums;
        }
        .chip .l {
          font-size: 0.56rem;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          line-height: 1;
          color: rgba(255, 255, 255, 0.68);
        }
        .more {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 0.15rem;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          color: #fff;
          transition: color 0.3s ease;
        }
        .more svg {
          transition: transform 0.35s var(--ease);
        }
        .tile:hover .more {
          color: var(--orange);
        }
        .tile:hover .more svg {
          transform: translateX(5px);
        }

        /* ── responsive ── */
        @media (max-width: 1200px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 860px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 520px) {
          .grid {
            grid-template-columns: 1fr;
            max-width: 24rem;
            margin-inline: auto;
          }
          .tile {
            aspect-ratio: 16 / 11;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tile,
          :global(.cover),
          .veil,
          .tint,
          .edge,
          .more,
          .more svg,
          .t-title::after {
            transition: none;
          }
          .tile:hover {
            transform: none;
          }
          .tile:hover :global(.cover) {
            transform: scale(1.03);
          }
        }
      `}</style>
    </section>
  );
}
