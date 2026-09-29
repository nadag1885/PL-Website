"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, alt, badge }) {
  const list = images && images.length ? images : [];
  const [active, setActive] = useState(0);
  if (!list.length) return null;

  return (
    <div className="gallery">
      {/* main-wrap is NOT clipped, so the stamp can straddle the image edge and
          spill onto the page; .main itself still clips the photo. */}
      <div className="main-wrap">
        <div className="main">
          <Image src={list[active]} alt={alt} fill sizes="(max-width:850px) 92vw, 46vw" style={{ objectFit: "contain" }} priority />
          <span className="frame" />
        </div>

        {badge && (
          /* a real stamp impression pressed across the edge of the image —
             ~half on the photo, ~half on the page behind it */
          <span className="pg-cert" aria-hidden="false">
            {/* Raw <img>: this stamp keeps its styled-jsx scoped animation, which
                next/image's <img> can't receive. It's a small (700px) seal. */}
            <img
              className="pg-badge"
              src={badge}
              alt="Designed & Type Tested by Powerline"
            />
          </span>
        )}
      </div>

      {list.length > 1 && (
        <div className="thumbs">
          {list.map((src, i) => (
            <button
              key={src}
              className={`thumb ${i === active ? "on" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`${alt} image ${i + 1}`}
              aria-current={i === active}
            >
              <Image src={src} alt="" width={84} height={84} style={{ objectFit: "contain" }} />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .gallery {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .main-wrap {
          position: relative;
          /* visible so the stamp can cross the edge onto the page */
        }
        .main {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--line);
          /* white so off-ratio images (e.g. certificates) show whole, padded
             with white space rather than being cropped */
          background: #fff;
        }
        .main img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .frame {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 20px;
          box-shadow: inset 0 0 0 1px rgba(232, 114, 42, 0.25);
        }

        /* ============================================================
           PHYSICAL CERTIFICATION STAMP
           A real stamp impression pressed across the LEFT edge of the
           image — ~50% sits on the photo, ~50% spills onto the page
           behind it, so it reads as applied AFTER the page, crossing
           layers. On load it is physically stamped:
             1. the stamp tool slams down from above (fast, accelerating)
             2. hard impact + compression
             3. the ink impression appears INSTANTLY at the moment of impact
             4. a quick vibration
             5. it settles
           No fade-in, no scale-up, no floating.
           ============================================================ */
        .pg-cert {
          --pl: 232, 114, 42;
          position: absolute;
          top: 0;
          right: 0;
          width: clamp(116px, 29%, 176px);
          aspect-ratio: 1;
          /* straddle the TOP-RIGHT corner of the image → ~50% sits on the photo
             (its lower-left), ~50% spills off onto the page (up + into the
             column gap). pointer-events:none so nothing underneath is blocked. */
          transform: translate(26%, -40%) rotate(6deg);
          z-index: 6;
          pointer-events: none;
          /* a real cast shadow so the stamp sits physically above the page */
          filter: drop-shadow(0 14px 24px rgba(0, 0, 0, 0.6));
        }

        /* the INK impression — already in place above the page; it does NOT
           slide in from anywhere. Invisible until the moment of contact, then
           it appears INSTANTLY (no fade) and is pressed home with a tiny
           micro-compression and settle. Motion stays within 0.96–1.01 scale —
           you feel the press, you don't see a UI element arrive. */
        .pg-badge {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0;
          transform-origin: center;
          filter: drop-shadow(0 0 10px rgba(var(--pl), 0.35))
            drop-shadow(0 5px 12px rgba(0, 0, 0, 0.5));
          animation: pgInk 0.95s cubic-bezier(0.3, 0.7, 0.2, 1) 0.5s forwards;
        }
        @keyframes pgInk {
          /* contact: ink lands instantly, a hair small */
          0% { opacity: 1; transform: scale(0.965); }
          /* impact: pressed flat for an instant (micro vertical compression) */
          42% { transform: scale(1.012, 0.99); }
          /* subtle rebound */
          70% { transform: scale(0.998); }
          /* settled */
          100% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .pg-badge {
            animation: none;
            opacity: 1;
          }
        }

        /* mobile: keep it in the upper-right but straddle only the TOP edge
           (no horizontal overflow) so it never clips against the viewport */
        @media (max-width: 680px) {
          .pg-cert {
            right: 6%;
            width: clamp(104px, 32%, 150px);
            transform: translate(0, -40%) rotate(6deg);
          }
        }

        .thumbs {
          display: flex;
          gap: 0.7rem;
          flex-wrap: wrap;
        }
        .thumb {
          width: 5.25rem;
          height: 5.25rem;
          padding: 0;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.25s, transform 0.25s var(--ease);
        }
        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .thumb:hover {
          transform: translateY(-3px);
        }
        .thumb.on {
          border-color: var(--orange);
          box-shadow: 0 0 0 2px rgba(232, 114, 42, 0.4);
        }
      `}</style>
    </div>
  );
}
