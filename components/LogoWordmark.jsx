// Powerline primary wordmark (new brand-book logo) as inline SVG, for the dark
// nav/footer backgrounds: POWER #fff, LINE #E85C1A, track 85% orange / 15% grey
// (#5C5C58). The typeface is Archivo (loaded in app/layout via next/font).
//
// When `animated`, the track runs the "Option A" line-fill on a gentle loop: orange
// flows in from the left behind a wavy front, holds full for a few seconds (the
// resting state, so the logo reads complete most of the time), then smoothly drains
// back to the left and replays — with a clear pause between each pass, never the
// constant shimmer. A CSS reduced-motion rule (globals.css) swaps in a static filled
// line (no animation at all).
// Rendered via dangerouslySetInnerHTML so the SMIL markup is emitted verbatim.

const WORDMARK =
  '<text x="0" y="188" textLength="1200" lengthAdjust="spacing" font-size="196" letter-spacing="-5.88" style="font-family:var(--font-archivo),Archivo,sans-serif">' +
  '<tspan font-weight="800" fill="#FFFFFF">POWER</tspan>' +
  '<tspan font-weight="300" fill="#E85C1A">LINE</tspan></text>' +
  '<rect x="0" y="220" width="1200" height="26" fill="#5C5C58"/>';

const STATIC_INNER = WORDMARK + '<rect x="0" y="220" width="1020" height="26" fill="#E85C1A"/>';

const ANIM_INNER =
  '<defs><mask id="pl-track-fill" maskUnits="userSpaceOnUse" x="-1500" y="150" width="3200" height="200">' +
  '<g><animateTransform attributeName="transform" type="translate" ' +
  'values="0 0 ; 1060 0 ; 1060 0 ; 0 0" keyTimes="0 ; 0.288 ; 0.797 ; 1" ' +
  'dur="5.9s" begin="0.35s" repeatCount="indefinite" calcMode="spline" ' +
  'keySplines="0.3 0 0.2 1 ; 0 0 1 1 ; 0.4 0 0.3 1"/>' +
  '<path d="M 0 184 Q 11 208.5 0 233 Q -11 257.5 0 282 L -1320 282 L -1320 184 Z" fill="#ffffff"/>' +
  '</g></mask></defs>' +
  WORDMARK +
  '<rect class="pl-anim-fill" x="0" y="220" width="1020" height="26" fill="#E85C1A" mask="url(#pl-track-fill)"/>' +
  '<rect class="pl-static-fill" x="0" y="220" width="1020" height="26" fill="#E85C1A"/>';

export default function LogoWordmark({ animated = false, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 272"
      role="img"
      aria-label="Powerline"
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: animated ? ANIM_INNER : STATIC_INNER }}
    />
  );
}
