"use client";

import Image from "next/image";
import { Reveal } from "@/components/Primitives";

export default function PageHero({ eyebrow, title, accent, lead, img }) {
  return (
    <header className="ph">
      {img && (
        <div className="ph-bg">
          <Image src={img} alt="" aria-hidden="true" fill sizes="(max-width: 1200px) 100vw, 1200px" style={{ objectFit: "cover", opacity: 0.35 }} priority />
          <div className="ph-veil" />
        </div>
      )}
      <div className="container ph-inner">
        <Reveal>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>
            {title} {accent && <span>{accent}</span>}
          </h1>
          {lead && <p>{lead}</p>}
        </Reveal>
      </div>
      <style jsx>{`
        .ph {
          position: relative;
          padding: clamp(8rem, 22vh, 13rem) 0 clamp(3rem, 8vh, 5rem);
          overflow: hidden;
          border-bottom: 1px solid var(--line);
        }
        .ph-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .ph-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
        }
        .ph-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(
              90deg,
              rgba(5, 5, 6, 0.92),
              rgba(5, 5, 6, 0.55)
            ),
            linear-gradient(0deg, var(--bg), transparent 55%);
        }
        .ph-inner {
          position: relative;
          z-index: 2;
        }
        h1 {
          font-size: clamp(2.2rem, 6vw, 4.6rem);
          text-transform: uppercase;
          margin: 1.2rem 0 0;
          line-height: 1;
        }
        h1 span {
          color: var(--orange);
        }
        p {
          max-width: 60ch;
          margin: 1.4rem 0 0;
          color: var(--text-dim);
          font-size: clamp(1rem, 1.4vw, 1.18rem);
        }
      `}</style>
    </header>
  );
}
