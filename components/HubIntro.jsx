"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { values } from "@/lib/content";

/**
 * Opening scene — the Powerline "P" as a power hub. Five bowed branches grow
 * out of the P one-by-one, each lighting a value node and revealing its card
 * (Integrity, Realism, Grit, Partnership, Ownership) — the same hub-and-spoke
 * shape as the Core Values section. The Preloader then holds and fades it to
 * reveal the site. Deterministic; reduced-motion shows the whole network lit.
 *
 * Self-contained (its own `hi-*` classes) so it can't affect CoreValues.
 */

const P_PATH =
  "M 45.955 44.083 C 44.205 47.355, 45.082 70.813, 47 72.023 C 47.839 72.553, 59.637 72.976, 73.782 72.985 C 100.907 73.001, 104.131 73.494, 107.369 78.117 C 109.205 80.737, 109.527 87.146, 107.970 90.055 C 106.135 93.484, 101.609 95, 93.205 95 C 82.182 95, 82 95.263, 82 111.174 C 82 127.156, 81.872 127.007, 95.579 126.983 C 123.215 126.934, 141.900 115.285, 146.640 95.147 C 151.347 75.148, 142.535 55.952, 124.593 47.121 C 115.027 42.412, 111.742 42.051, 78.285 42.024 C 47.665 42, 47.049 42.040, 45.955 44.083 M 54.202 57.250 L 54.500 63.500 79 64 C 106.298 64.557, 108.105 64.939, 113.724 71.338 C 119.421 77.827, 120.180 85.807, 115.897 94.202 C 112.907 100.062, 107.221 103.276, 98.660 103.942 L 91.500 104.500 91.500 111 L 91.500 117.500 95.846 117.812 C 98.236 117.984, 103.398 117.627, 107.318 117.019 C 127.223 113.930, 138.470 102.190, 138.470 84.500 C 138.470 74.861, 136.060 68.723, 129.702 62.167 C 120.156 52.325, 114.454 51.027, 80.702 51.012 L 53.905 51 54.202 57.250 M 46.035 78.934 C 44.626 81.568, 44.626 146.432, 46.035 149.066 C 46.980 150.830, 48.246 151, 60.464 151 C 71.306 151, 74.156 150.701, 75.429 149.429 C 76.786 148.071, 77 143.848, 77 118.429 L 77 89 88.800 89 C 101.191 89, 103 88.427, 103 84.500 C 103 80.421, 101.350 80, 85.371 80 C 72.861 80, 69.862 80.280, 68.571 81.571 C 67.214 82.929, 67 87.156, 67 112.619 L 67 142.095 60.750 141.798 L 54.500 141.500 54.235 110.585 C 54.057 89.810, 53.607 79.232, 52.863 78.335 C 51.226 76.362, 47.224 76.713, 46.035 78.934";

const ICONS = {
  shield: <><path d="M12 3l7 3v5c0 4.2-2.9 7.4-7 8.8C7.9 18.4 5 15.2 5 11V6l7-3z" /><path d="M9 11.5l2 2 4-4" /></>,
  bulb: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.2 1h5l.2-1c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3z" /></>,
  summit: <><path d="M3 20l6.5-13 4 7.5 2.2-3.5L21 20z" /><path d="M3 20h18" /></>,
  link: <><circle cx="9" cy="12" r="5" /><circle cx="15" cy="12" r="5" /></>,
  flag: <><path d="M6 21V4" /><path d="M6 4h11l-2.2 4L17 12H6" /></>,
};
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

const HUB = { x: 500, y: 362 };
const POS = [
  { x: 500, y: 150, anchor: "up" },
  { x: 244, y: 300, anchor: "left" },
  { x: 348, y: 566, anchor: "left" },
  { x: 756, y: 300, anchor: "right" },
  { x: 652, y: 566, anchor: "right" },
];
const NODES = values.map((v, i) => ({ ...v, ...POS[i] }));

function branch(n) {
  const mx = (HUB.x + n.x) / 2, my = (HUB.y + n.y) / 2;
  const dx = n.x - HUB.x, dy = n.y - HUB.y, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const bow = 22 * (n.x >= HUB.x ? 1 : -1);
  return `M ${HUB.x} ${HUB.y} Q ${(mx + nx * bow).toFixed(1)} ${(my + ny * bow).toFixed(1)} ${n.x} ${n.y}`;
}

function HubIntro() {
  const diagram = useRef(null);

  // Play the build sequence once on mount.
  useEffect(() => {
    const d = diagram.current;
    if (!d) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pGroup = d.querySelector(".hi-p");
    const pStroke = d.querySelector(".hi-p-stroke");
    const branches = [...d.querySelectorAll(".hi-branch")];
    const snodes = [...d.querySelectorAll(".hi-snode")];
    const cards = [...d.querySelectorAll(".hi-vcard")];

    if (reduce) {
      pGroup.classList.add("on");
      if (pStroke) pStroke.style.strokeDashoffset = "0";
      branches.forEach((b) => (b.style.strokeDashoffset = "0"));
      snodes.forEach((s) => s.classList.add("on"));
      cards.forEach((c) => c.classList.add("show"));
      return;
    }

    const tl = gsap.timeline();
    tl.call(() => pGroup.classList.add("on"), null, 0);
    tl.fromTo(pStroke, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, 0.1);
    let t = 0.7;
    branches.forEach((b, i) => {
      tl.fromTo(b, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" }, t);
      tl.call(() => { snodes[i].classList.add("on"); cards[i].classList.add("show"); }, null, t + 0.4);
      t += 0.45;
    });
    return () => tl.kill();
  }, []);

  // Scale + centre the whole composition (diagram + overlaid cards) to fit the
  // viewport, at any size. Measured from the real card bounding box.
  useEffect(() => {
    const dia = diagram.current;
    if (!dia) return;
    const DESIGN_W = 880;
    const MARGIN = 28;
    const MAX = 1.06;
    const apply = () => {
      dia.style.transform = "none";
      dia.style.width = DESIGN_W + "px";
      const dr = dia.getBoundingClientRect();
      let minL = 0, maxR = dr.width, minT = 0, maxB = dr.height;
      dia.querySelectorAll(".hi-vcard").forEach((c) => {
        const b = c.getBoundingClientRect();
        minL = Math.min(minL, b.left - dr.left);
        maxR = Math.max(maxR, b.right - dr.left);
        minT = Math.min(minT, b.top - dr.top);
        maxB = Math.max(maxB, b.bottom - dr.top);
      });
      const cW = maxR - minL, cH = maxB - minT;
      const s = Math.min(MAX, (window.innerWidth - 2 * MARGIN) / cW, (window.innerHeight - 2 * MARGIN) / cH);
      const cx = minL + cW / 2, cy = minT + cH / 2; // bbox centre in diagram coords
      const tx = window.innerWidth / 2 - cx * s;
      const ty = window.innerHeight / 2 - cy * s;
      dia.style.transformOrigin = "0 0";
      dia.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
    };
    apply();
    const r = requestAnimationFrame(apply);
    const t1 = setTimeout(apply, 250);
    window.addEventListener("resize", apply);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t1);
      window.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <div className="hi" aria-hidden="true">
      <div className="hi-diagram" ref={diagram}>
        <svg className="hi-svg" viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="hiPlate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.92" />
              <stop offset="60%" stopColor="#000" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {NODES.map((n, i) => (
            <path key={`b${i}`} className="hi-branch" d={branch(n)} pathLength="1" />
          ))}
          {NODES.map((n, i) => (
            <g key={`n${i}`} className="hi-snode" transform={`translate(${n.x} ${n.y})`}>
              <circle className="hi-snode-ring" r="13" />
              <circle className="hi-snode-core" r="6" />
            </g>
          ))}

          <ellipse className="hi-plate" cx={HUB.x} cy={HUB.y} rx="150" ry="150" fill="url(#hiPlate)" />
          <g className="hi-p" transform="translate(404 264) scale(1.02)">
            <path className="hi-p-glow" d={P_PATH} pathLength="1" />
            <path className="hi-p-fill" d={P_PATH} fillRule="evenodd" />
            <path className="hi-p-stroke" d={P_PATH} pathLength="1" />
            <path className="hi-p-pulse" d={P_PATH} pathLength="1" />
          </g>
        </svg>

        {NODES.map((n, i) => (
          <div
            key={`c${i}`}
            className={`hi-vcard ${n.anchor}`}
            style={{ left: `${(n.x / 1000) * 100}%`, top: `${(n.y / 720) * 100}%` }}
          >
            <span className="hi-vc-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="hi-vc-icon"><Icon name={n.icon} /></span>
            <h3>{n.title}</h3>
            <p>{n.line}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .hi { position: absolute; inset: 0; overflow: hidden; }
        .hi-diagram {
          position: absolute; left: 0; top: 0;
          width: 880px; aspect-ratio: 1000 / 720;
          will-change: transform;
        }
        .hi-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

        /* branches */
        :global(.hi-branch) {
          fill: none; stroke: var(--orange); stroke-width: 3; stroke-linecap: round;
          stroke-dasharray: 1; stroke-dashoffset: 1;
          filter: drop-shadow(0 0 4px rgba(232, 114, 42, 0.7));
        }

        /* value nodes — hidden until their branch reaches them, so nothing is
           pre-placed at the sides; the network grows out from the centre P. */
        :global(.hi-snode) { opacity: 0; transition: opacity 0.4s var(--ease); }
        :global(.hi-snode.on) { opacity: 1; }
        :global(.hi-snode-ring) {
          fill: var(--bg); stroke: rgba(232, 114, 42, 0.4); stroke-width: 2;
          transition: stroke 0.4s ease;
        }
        :global(.hi-snode-core) {
          fill: var(--orange); transform: scale(0);
          transform-box: fill-box; transform-origin: center;
          transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.5, 1);
        }
        :global(.hi-snode.on .hi-snode-ring) { stroke: var(--orange); filter: drop-shadow(0 0 9px rgba(232, 114, 42, 0.8)); }
        :global(.hi-snode.on .hi-snode-core) { transform: scale(1); }

        /* central P hub */
        :global(.hi-p-glow) { fill: none; stroke: rgba(232, 114, 42, 0.5); stroke-width: 7; filter: blur(5px); opacity: 0; transition: opacity 0.6s ease; }
        :global(.hi-p-fill) { fill: rgba(232, 114, 42, 0.1); opacity: 0; transition: opacity 0.6s ease; }
        :global(.hi-p-stroke) {
          fill: none; stroke: var(--orange); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
          stroke-dasharray: 1; stroke-dashoffset: 1;
          filter: drop-shadow(0 0 5px rgba(232, 114, 42, 0.85));
        }
        :global(.hi-p-pulse) {
          fill: none; stroke: #fff2e6; stroke-width: 3.4; stroke-linecap: round;
          stroke-dasharray: 0.08 0.92; stroke-dashoffset: 1; opacity: 0;
        }
        :global(.hi-p.on .hi-p-glow) { opacity: 1; }
        :global(.hi-p.on .hi-p-fill) { opacity: 1; }
        :global(.hi-p.on .hi-p-pulse) { opacity: 1; animation: hiFlow 1.9s linear infinite; }
        @keyframes hiFlow { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }

        /* freeze the loop when the Preloader starts closing */
        .hi.hi-closing :global(.hi-p-pulse) { animation: none !important; opacity: 0; }

        /* value cards overlaid at node positions */
        .hi-vcard {
          position: absolute; width: max-content; max-width: 14.375rem;
          opacity: 0; transition: opacity 0.55s var(--ease); pointer-events: none;
        }
        .hi-vcard.show { opacity: 1; }
        .hi-vcard.up { transform: translate(-50%, calc(-100% - 16px)); text-align: center; }
        .hi-vcard.left { transform: translate(calc(-100% - 24px), -50%); text-align: right; }
        .hi-vcard.right { transform: translate(24px, -50%); text-align: left; }
        .hi-vc-num { display: block; font-family: var(--font-head); font-weight: 700; font-size: 0.66rem; letter-spacing: 0.22em; color: var(--orange); }
        .hi-vc-icon {
          display: inline-grid; place-items: center; width: 46px; height: 46px; border-radius: 12px;
          margin: 0.35rem 0 0.1rem; color: var(--orange);
          background: rgba(232, 114, 42, 0.08); border: 1px solid rgba(232, 114, 42, 0.22);
          transform: translateY(8px); opacity: 0;
          transition: opacity 0.45s var(--ease) 0.05s, transform 0.45s var(--ease) 0.05s;
        }
        .hi-vcard.left .hi-vc-icon { margin-left: auto; }
        .hi-vcard h3 {
          font-family: var(--font-head); font-weight: 800; text-transform: uppercase;
          font-size: 1.7rem; color: #fff; margin: 0.3rem 0 0.25rem; line-height: 1;
          transform: translateY(8px); opacity: 0;
          transition: opacity 0.45s var(--ease) 0.12s, transform 0.45s var(--ease) 0.12s;
        }
        .hi-vcard p {
          color: var(--text-dim); font-size: 0.98rem; line-height: 1.4;
          transform: translateY(8px); opacity: 0;
          transition: opacity 0.45s var(--ease) 0.18s, transform 0.45s var(--ease) 0.18s;
        }
        .hi-vcard.show .hi-vc-icon, .hi-vcard.show h3, .hi-vcard.show p { opacity: 1; transform: none; }

        @media (prefers-reduced-motion: reduce) {
          :global(.hi-p.on .hi-p-pulse) { animation: none; opacity: 0; }
          .hi-vcard, .hi-vc-icon, .hi-vcard h3, .hi-vcard p { transition: none; }
        }
      `}</style>
    </div>
  );
}

export default HubIntro;
