"use client";

import { memo } from "react";

/**
 * Opening scene — the Powerline "P" as the die of a circuit board. Orange PCB
 * traces draw OUTWARD from the logo in staggered fans (out → 45° jog → out, like
 * real escape routing), each tip lighting a pad or a via, until the board is
 * complete. Deterministic (same every load). The Preloader then holds briefly
 * and dollies/fades the finished board away to reveal the site.
 *
 * styled-jsx notes: no data:/url() backgrounds (all inline SVG); keyframe
 * `animation` shorthands carry no var() (delays are set via animation-delay).
 */

// The real Powerline "P" mark (natural centre ≈ 96,96).
const P_PATH =
  "M 45.955 44.083 C 44.205 47.355, 45.082 70.813, 47 72.023 C 47.839 72.553, 59.637 72.976, 73.782 72.985 C 100.907 73.001, 104.131 73.494, 107.369 78.117 C 109.205 80.737, 109.527 87.146, 107.970 90.055 C 106.135 93.484, 101.609 95, 93.205 95 C 82.182 95, 82 95.263, 82 111.174 C 82 127.156, 81.872 127.007, 95.579 126.983 C 123.215 126.934, 141.900 115.285, 146.640 95.147 C 151.347 75.148, 142.535 55.952, 124.593 47.121 C 115.027 42.412, 111.742 42.051, 78.285 42.024 C 47.665 42, 47.049 42.040, 45.955 44.083 M 54.202 57.250 L 54.500 63.500 79 64 C 106.298 64.557, 108.105 64.939, 113.724 71.338 C 119.421 77.827, 120.180 85.807, 115.897 94.202 C 112.907 100.062, 107.221 103.276, 98.660 103.942 L 91.500 104.500 91.500 111 L 91.500 117.500 95.846 117.812 C 98.236 117.984, 103.398 117.627, 107.318 117.019 C 127.223 113.930, 138.470 102.190, 138.470 84.500 C 138.470 74.861, 136.060 68.723, 129.702 62.167 C 120.156 52.325, 114.454 51.027, 80.702 51.012 L 53.905 51 54.202 57.250 M 46.035 78.934 C 44.626 81.568, 44.626 146.432, 46.035 149.066 C 46.980 150.830, 48.246 151, 60.464 151 C 71.306 151, 74.156 150.701, 75.429 149.429 C 76.786 148.071, 77 143.848, 77 118.429 L 77 89 88.800 89 C 101.191 89, 103 88.427, 103 84.500 C 103 80.421, 101.350 80, 85.371 80 C 72.861 80, 69.862 80.280, 68.571 81.571 C 67.214 82.929, 67 87.156, 67 112.619 L 67 142.095 60.750 141.798 L 54.500 141.500 54.235 110.585 C 54.057 89.810, 53.607 79.232, 52.863 78.335 C 51.226 76.362, 47.224 76.713, 46.035 78.934";

const CX = 720, CY = 450;
const P_SCALE = 1.6;
const P_TF = `translate(${(CX - 96 * P_SCALE).toFixed(1)} ${(CY - 96 * P_SCALE).toFixed(1)}) scale(${P_SCALE})`;

const DIRS = 8;      // 8 fan directions (N, NE, E, … NW)
const FAN = 5;       // traces per direction
const R0 = 96;       // start radius — just at the P edge (P drawn on top)
const GAP = 24;      // spacing between parallel traces in a fan
const JOG = 28;      // length of the 45° corner segment
const REACH = [116, 182, 248]; // outer-segment lengths → pads sit in tiers
const HBONUS = 175;            // extra length scaled by |cos| → left/right traces run longest, filling the wide frame
const DEG = Math.PI / 180;
export const DRAW = 0.9; // trace draw duration (s) — kept in sync with CSS

// Build the deterministic PCB traces once at module load.
const TRACES = (() => {
  const out = [];
  for (let dir = 0; dir < DIRS; dir++) {
    const a = (-90 + dir * 45) * DEG;
    const ux = Math.cos(a), uy = Math.sin(a);
    const px = -uy, py = ux; // perpendicular (fan spread axis)
    for (let f = 0; f < FAN; f++) {
      const o = (f - (FAN - 1) / 2) * GAP;              // sideways offset
      const side = o > 0 ? 1 : o < 0 ? -1 : 0;
      const sx = CX + ux * R0 + px * o;                 // start (near the P)
      const sy = CY + uy * R0 + py * o;
      const a1 = 44 + f * 7;                            // first straight run
      const ax = sx + ux * a1, ay = sy + uy * a1;
      let dvx = ux + px * side, dvy = uy + py * side;   // 45° jog direction
      const dl = Math.hypot(dvx, dvy) || 1;
      const bx = ax + (dvx / dl) * JOG, by = ay + (dvy / dl) * JOG;
      const reach = REACH[(dir + f) % REACH.length] + Math.round(HBONUS * Math.abs(ux));
      const ex = bx + ux * reach, ey = by + uy * reach; // final run → pad
      out.push({
        d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ax.toFixed(1)} ${ay.toFixed(1)} L ${bx.toFixed(1)} ${by.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`,
        ex: +ex.toFixed(1),
        ey: +ey.toFixed(1),
        via: (dir + f) % 3 === 2,                       // some tips are hollow vias
        delay: +(0.14 + dir * 0.05 + f * 0.06).toFixed(3),
      });
    }
  }
  return out;
})();

function CircuitIntro() {
  return (
    <div className="ci" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="ci-svg">
        {/* faint chip "die" outline behind the P */}
        <rect className="ci-die" x={CX - 118} y={CY - 118} width="236" height="236" rx="18" pathLength="1" />

        {/* one-shot power-on ring expanding from the centre */}
        <circle className="ci-surge" cx={CX} cy={CY} r="120" />

        {/* traces (drawn behind the P so they emerge from under the logo) */}
        <g className="ci-net">
          {TRACES.map((t, i) => (
            <path key={`w${i}`} className="ci-wire" d={t.d} pathLength="1" style={{ "--d": `${t.delay}s` }} />
          ))}
        </g>

        {/* pads / vias light up as each trace reaches its tip */}
        <g className="ci-net">
          {TRACES.map((t, i) => (
            <g key={`p${i}`} className="ci-tip" style={{ "--d": `${(t.delay + DRAW).toFixed(3)}s`, transformOrigin: `${t.ex}px ${t.ey}px` }}>
              {t.via ? (
                <circle className="ci-via" cx={t.ex} cy={t.ey} r="6.5" />
              ) : (
                <circle className="ci-pad" cx={t.ex} cy={t.ey} r="5" />
              )}
            </g>
          ))}
        </g>

        {/* soft dark plate so any inner trace ends fade under the P */}
        <defs>
          <radialGradient id="ciPlate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="1" />
            <stop offset="52%" stopColor="#000" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse className="ci-plate" cx={CX} cy={CY} rx="150" ry="150" fill="url(#ciPlate)" />

        {/* THE P — the source, on top */}
        <g className="ci-p">
          <g transform={P_TF}>
            <path className="ci-p-glow" d={P_PATH} pathLength="1" />
            <path className="ci-p-fill" d={P_PATH} fillRule="evenodd" />
            <path className="ci-p-stroke" d={P_PATH} pathLength="1" />
            <path className="ci-p-pulse" d={P_PATH} pathLength="1" />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .ci {
          --pl: 232, 114, 42;
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .ci-svg {
          width: 100%;
          height: 100%;
          display: block;
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        /* On close-start the Preloader adds .ci-closing → freeze everything to a
           solid final state so the dolly zoom renders at 60fps. */
        .ci.ci-closing .ci-wire,
        .ci.ci-closing .ci-p-pulse,
        .ci.ci-closing .ci-tip,
        .ci.ci-closing .ci-surge { animation: none !important; }
        .ci.ci-closing .ci-wire { stroke-dashoffset: 0; }
        .ci.ci-closing .ci-tip { opacity: 1; transform: none; }
        .ci.ci-closing .ci-surge { opacity: 0; }

        /* ── chip die ── */
        .ci-die {
          fill: none;
          stroke: rgba(var(--pl), 0.3);
          stroke-width: 1.5;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          opacity: 0;
          animation: ciReveal 0.5s ease forwards 0.05s, ciDraw 0.9s ease forwards 0.05s;
        }

        /* ── power-on surge ring ── */
        .ci-surge {
          fill: none;
          stroke: rgba(var(--pl), 0.55);
          stroke-width: 2;
          transform-box: view-box;
          transform-origin: ${CX}px ${CY}px;
          opacity: 0;
          animation: ciSurge 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
        }
        @keyframes ciSurge {
          0% { opacity: 0; transform: scale(0.35); }
          25% { opacity: 0.8; }
          100% { opacity: 0; transform: scale(2.1); }
        }

        /* ── traces: draw outward from the logo, then stay solid ── */
        .ci-wire {
          fill: none;
          stroke: #ff7d1e;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          filter: drop-shadow(0 0 5px rgba(var(--pl), 0.7));
          animation: ciDraw 0.9s ease forwards;
          animation-delay: var(--d);
        }
        @keyframes ciDraw { to { stroke-dashoffset: 0; } }
        @keyframes ciReveal { to { opacity: 1; } }

        /* ── pads / vias at each tip ── */
        .ci-tip {
          transform-box: view-box;
          opacity: 0;
          animation: ciPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          animation-delay: var(--d);
        }
        @keyframes ciPop {
          0% { opacity: 0; transform: scale(0.2); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        .ci-pad {
          fill: #ffb070;
          filter: drop-shadow(0 0 5px rgba(var(--pl), 0.95));
        }
        .ci-via {
          fill: #0a0a0a;
          stroke: #ff8a2a;
          stroke-width: 2.6;
          filter: drop-shadow(0 0 5px rgba(var(--pl), 0.9));
        }

        /* dark plate behind the P */
        .ci-plate { opacity: 0; animation: ciReveal 0.6s ease forwards 0.05s; }

        /* ── the P (source, on top) ── */
        .ci-p {
          transform-box: fill-box;
          transform-origin: center;
          animation: ciGrow 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
        }
        @keyframes ciGrow {
          0% { opacity: 0; transform: scale(0.86); }
          100% { opacity: 1; transform: scale(1); }
        }
        .ci-p-fill { fill: rgba(var(--pl), 0.1); }
        .ci-p-glow { fill: none; stroke: rgba(var(--pl), 0.5); stroke-width: 7; filter: blur(5px); }
        .ci-p-stroke {
          fill: none; stroke: #e8722a; stroke-width: 3;
          stroke-linecap: round; stroke-linejoin: round;
          filter: drop-shadow(0 0 5px rgba(var(--pl), 0.85));
        }
        .ci-p-pulse {
          fill: none; stroke: #ffe2cd; stroke-width: 3.2; stroke-linecap: round;
          stroke-dasharray: 0.08 0.92; stroke-dashoffset: 1; opacity: 0;
          filter: drop-shadow(0 0 5px rgba(255, 200, 140, 0.95));
          animation: ciReveal 0.3s ease forwards 0.5s, ciPPulse 1.7s linear infinite 0.5s;
        }
        @keyframes ciPPulse { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .ci-die, .ci-surge, .ci-wire, .ci-tip, .ci-p, .ci-p-pulse, .ci-plate {
            animation: none; opacity: 1;
          }
          .ci-die, .ci-wire { stroke-dashoffset: 0; }
          .ci-tip { transform: none; }
          .ci-surge { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default memo(CircuitIntro);
