"use client";

import Image from "next/image";
import { customers, partners } from "@/lib/content";
import { Reveal } from "@/components/Primitives";

function Marquee({ items, reverse, alt }) {
  // Repeat short lists so the strip always fills the viewport, then duplicate
  // once for a seamless loop (animation translates by exactly one base set).
  const base = items.length >= 6 ? items : [...items, ...items, ...items];
  const loop = [...base, ...base];
  return (
    <div className="marquee" aria-hidden="true">
      <div className={`mq-track ${reverse ? "rev" : ""}`}>
        {loop.map((src, i) => (
          <div className="logo" key={i}>
            <Image src={src} alt={alt} fill sizes="184px" style={{ objectFit: "contain" }} />
          </div>
        ))}
      </div>
      <style jsx>{`
        .marquee {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent,
            #000 10%,
            #000 90%,
            transparent
          );
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 10%,
            #000 90%,
            transparent
          );
        }
        .mq-track {
          display: flex;
          gap: 3.5rem;
          width: max-content;
          animation: scroll 40s linear infinite;
        }
        .mq-track.rev {
          animation-direction: reverse;
        }
        .marquee:hover .mq-track {
          animation-play-state: paused;
        }
        .logo {
          position: relative;
          flex: 0 0 auto;
          height: 6.25rem;
          width: 11.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.7rem 1rem;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          transition: transform 0.3s var(--ease), box-shadow 0.3s;
        }
        .logo:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
        }
        /* next/image (fill) handles size/object-fit; keep the plate padding on the
           image and globalize grayscale + hover (styled-jsx can't scope its <img>). */
        .logo :global(img) {
          padding: 0.7rem 1rem;
          box-sizing: border-box;
          object-position: center;
          filter: grayscale(1);
          opacity: 0.82;
          transition: filter 0.3s, opacity 0.3s;
        }
        .logo:hover :global(img) {
          filter: none;
          opacity: 1;
        }
        @keyframes scroll {
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mq-track {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default function Logos() {
  return (
    <section className="logos">
      <div className="container">
        <Reveal>
          <div className="block">
            <span className="eyebrow">Powerline Customers</span>
            <h3>Trusted across Egypt&apos;s biggest names</h3>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Marquee items={customers} alt="Powerline customer" />
        </Reveal>

        <Reveal>
          <div className="block block-2">
            <span className="eyebrow">Partners with Global Leaders</span>
            <h3>Built with world-class technology partners</h3>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Marquee items={partners} reverse alt="Powerline global partner" />
        </Reveal>
      </div>

      <style jsx>{`
        .logos {
          padding: clamp(5rem, 12vh, 9rem) 0;
          background: transparent;
        }
        .block {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .block-2 {
          margin-top: 5rem;
        }
        .block h3 {
          font-family: var(--font-head);
          font-weight: 700;
          font-size: clamp(1.4rem, 3vw, 2.2rem);
          margin-top: 1rem;
          color: #fff;
        }
        .block :global(.eyebrow) {
          justify-content: center;
        }
      `}</style>
    </section>
  );
}
