"use client";

import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/Primitives";
import { products } from "@/lib/content";

const detailFor = (href) => products[href.replace("/products/", "")] || {};
const imgFor = (href) => detailFor(href).img;
const badgeFor = (href) => detailFor(href).badge;
const hoverFor = (href) => {
  const g = detailFor(href).gallery;
  return g && g.length > 1 ? g[1] : null;
};

export default function ProductGrid({ items }) {
  return (
    <div className="grid">
      {items.map((p, i) => {
        const hover = hoverFor(p.href);
        return (
        <Reveal as="div" key={p.name} delay={i * 70}>
          <div className="prod-wrap">
            <Link href={p.href} className="prod">
              <div className={`prod-thumb ${hover ? "has-hover" : ""}`}>
                {imgFor(p.href) && (
                  <Image className="img-base" src={imgFor(p.href)} alt={p.name} fill sizes="(max-width:700px) 92vw, (max-width:1100px) 46vw, 340px" style={{ objectFit: "cover" }} />
                )}
                {hover && (
                  <Image className="img-hover" src={hover} alt={`${p.name} — interior`} fill sizes="(max-width:700px) 92vw, (max-width:1100px) 46vw, 340px" style={{ objectFit: "cover" }} />
                )}
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="prod-body">
                <div className="prod-head">
                  <h3>{p.name}</h3>
                  <span className="arrow">→</span>
                </div>
                {p.desc && <p>{p.desc}</p>}
              </div>
            </Link>
            {/* the seal lives OUTSIDE the clipped card so it can hang off the
                top-right corner onto the page, like the single product page */}
            {badgeFor(p.href) && (
              <Image className="card-badge" src={badgeFor(p.href)} alt="Type Tested by Powerline" width={90} height={90} draggable="false" />
            )}
          </div>
        </Reveal>
        );
      })}

      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(17.5rem, 100%), 1fr));
          gap: 1.3rem;
        }
        .prod-wrap {
          position: relative;
          height: 100%;
        }
        .prod {
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--bg-2);
          overflow: hidden;
          transition: transform 0.35s var(--ease), border-color 0.35s,
            box-shadow 0.35s;
        }
        .prod:hover {
          transform: translateY(-5px);
          border-color: rgba(232, 114, 42, 0.5);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }
        .prod-thumb {
          position: relative;
          aspect-ratio: 1 / 1;
          background: var(--bg-3);
          overflow: hidden;
        }
        /* next/image (fill) sets position/size/object-fit inline; styled-jsx can't
           reach its <img>, so the crossfade + zoom live in :global() rules. */
        :global(.img-base),
        :global(.img-hover) {
          transition: opacity 0.55s var(--ease), transform 0.6s var(--ease);
        }
        :global(.img-hover) {
          opacity: 0;
        }
        /* crossfade to the interior image when one exists */
        .prod:hover .prod-thumb.has-hover :global(.img-base) {
          opacity: 0;
        }
        .prod:hover .prod-thumb.has-hover :global(.img-hover) {
          opacity: 1;
        }
        /* single-image cards just zoom */
        .prod:hover .prod-thumb:not(.has-hover) :global(.img-base) {
          transform: scale(1.05);
        }
        .prod-thumb::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(5, 5, 6, 0.55));
        }
        /* type-tested seal — hangs OFF the top-right corner onto the page,
           like the single product page (it sits in .prod-wrap, outside the
           clipped card). pointer-events:none so the card stays fully clickable
           underneath. */
        :global(.card-badge) {
          position: absolute;
          top: 0;
          right: 0;
          width: clamp(58px, 21%, 86px);
          height: auto;
          aspect-ratio: 1;
          object-fit: contain;
          /* ~95% on the image in the top-right corner; ~5% crosses onto the page */
          transform: translate(5%, -5%) rotate(4deg);
          filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.55))
            drop-shadow(0 6px 13px rgba(0, 0, 0, 0.5));
          z-index: 5;
          pointer-events: none;
        }
        .num {
          position: absolute;
          bottom: 0.9rem;
          left: 0.9rem;
          font-family: var(--font-head);
          font-weight: 800;
          font-size: 0.85rem;
          color: #fff;
          background: var(--orange);
          padding: 0.25rem 0.6rem;
          border-radius: 7px;
        }
        .prod-body {
          padding: 1.4rem 1.5rem 1.6rem;
          flex: 1;
        }
        .prod-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.6rem;
        }
        .arrow {
          color: var(--orange);
          font-family: var(--font-head);
          font-weight: 700;
          transition: transform 0.3s var(--ease);
        }
        .prod:hover .arrow {
          transform: translateX(6px);
        }
        h3 {
          font-size: 1.35rem;
          text-transform: uppercase;
          margin: 0 0 0.6rem;
        }
        .prod p {
          color: var(--text-dim);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
