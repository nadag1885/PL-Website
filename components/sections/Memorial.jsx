"use client";

import Image from "next/image";
import { memorial } from "@/lib/content";
import { Reveal } from "@/components/Primitives";

/**
 * A deliberately quiet, reduced-motion moment out of respect.
 * Portrait on the left, tribute on the right.
 */
export default function Memorial() {
  return (
    <section className="memorial">
      <div className="container">
        <Reveal>
          <div className="inner">
            <div className="portrait">
              <Image src={memorial.img} alt={memorial.name} fill sizes="(max-width: 760px) 240px, 300px" style={{ objectFit: "cover", transform: "scale(1.6)", transformOrigin: "50% 58%", filter: "grayscale(0.2)" }} />
              <span className="ember" />
            </div>

            <div className="content">
              <span className="eyebrow">In loving memory</span>
              <p className="quote">{memorial.body}</p>
              <span className="name">— {memorial.name}</span>
            </div>
          </div>
        </Reveal>
      </div>

      <style jsx>{`
        .memorial {
          padding: clamp(5rem, 14vh, 10rem) 0;
          background: #030304;
        }
        .inner {
          display: grid;
          grid-template-columns: clamp(170px, 20vw, 300px) 1fr;
          gap: clamp(2.5rem, 6vw, 6rem);
          align-items: center;
        }
        .portrait {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 18%;
          overflow: hidden;
        }
        .portrait img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          /* zoom in to crop the light sky / empty background around him */
          transform: scale(1.6);
          transform-origin: 50% 58%;
          filter: grayscale(0.2);
        }
        .ember {
          position: absolute;
          inset: 0;
          border-radius: 18%;
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(232, 114, 42, 0.35);
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 0.9;
          }
        }
        .content {
          max-width: none;
        }
        .content .eyebrow {
          margin-bottom: 1.4rem;
        }
        .quote {
          font-family: var(--font-head);
          font-weight: 400;
          font-size: clamp(1.05rem, 1.7vw, 1.55rem);
          line-height: 1.5;
          color: var(--text);
          margin: 0;
        }
        .name {
          display: block;
          margin-top: 1.8rem;
          color: var(--orange);
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        @media (prefers-reduced-motion: reduce) {
          .ember {
            animation: none;
          }
        }
        @media (max-width: 760px) {
          .inner {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
            justify-items: center;
          }
          .portrait {
            width: clamp(180px, 60vw, 240px);
          }
          .content .eyebrow {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
