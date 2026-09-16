"use client";

import Link from "next/link";
import { brand, nav, locations } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="top">
          <div className="col brand-col">
            <img src="/img/logo-white.webp" alt="Powerline" className="flogo" />
            <p className="ftag">{brand.tagline}</p>
            <div className="socials">
              <a href={brand.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
              <a href={brand.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>

          <div className="col">
            <h4>Navigate</h4>
            {nav.map((n) => (
              <Link key={n.href} href={n.href}>{n.label}</Link>
            ))}
          </div>

          <div className="col">
            <h4>Find Us</h4>
            {locations.map((l) => (
              <a key={l.name} href={l.maps} target="_blank" rel="noreferrer" className="loc">
                <strong>{l.name}</strong>
                <span>{l.address}</span>
              </a>
            ))}
          </div>

          <div className="col">
            <h4>Contact</h4>
            <a href={`tel:${brand.phone}`}>{brand.phoneDisplay}</a>
            <Link href="/contact" className="btn btn-primary fcta">Sales Request</Link>
          </div>
        </div>

        <div className="bottom">
          <span>{brand.copyright}</span>
        </div>
      </div>

      <style jsx>{`
        .footer {
          position: relative;
          background: var(--bg-2);
          border-top: 1px solid var(--line);
          padding: 5rem 0 2.5rem;
          margin-top: 0;
        }
        .footer::before {
          content: "";
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--orange),
            transparent
          );
          box-shadow: 0 0 16px var(--orange);
          opacity: 0.6;
        }
        .top {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1.4fr 1fr;
          gap: 2.5rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid var(--line);
        }
        .flogo {
          height: 3.375rem;
          width: auto;
          max-width: none;
          margin-bottom: 1.1rem;
        }
        .ftag {
          color: var(--orange);
          font-size: 0.98rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.5;
          max-width: 30ch;
          margin: 0 0 1rem;
        }
        .socials {
          display: flex;
          gap: 1rem;
        }
        .socials a {
          font-size: 0.85rem;
          color: var(--text-dim);
          transition: color 0.2s;
        }
        .socials a:hover {
          color: var(--orange);
        }
        h4 {
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--orange);
          margin: 0 0 1.2rem;
        }
        .col :global(a) {
          display: block;
          font-size: 0.9rem;
          color: var(--text-dim);
          margin-bottom: 0.7rem;
          transition: color 0.2s;
        }
        .col :global(a:hover) {
          color: #fff;
        }
        .loc {
          margin-bottom: 1rem !important;
        }
        .loc strong {
          display: block;
          color: #fff;
          font-weight: 600;
          font-size: 0.88rem;
        }
        .loc span {
          font-size: 0.82rem;
          color: var(--text-faint);
        }
        .fcta {
          margin-top: 0.6rem;
          padding: 0.7rem 1.2rem;
          font-size: 0.82rem;
        }
        .col :global(a.fcta),
        .col :global(a.fcta:hover) {
          color: #0a0a0a;
        }
        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.8rem;
          font-size: 0.8rem;
          color: var(--text-faint);
        }
        .tagline {
          color: var(--orange);
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        @media (max-width: 900px) {
          .top {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }
        @media (max-width: 560px) {
          .top {
            grid-template-columns: 1fr;
          }
          .bottom {
            flex-direction: column;
            gap: 0.6rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
