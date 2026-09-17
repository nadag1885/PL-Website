// Server-side catalogue access tokens. A short signed string (HMAC-SHA256)
// scoped to a single catalogue slug with a 7-day expiry, stored in an
// HttpOnly cookie. This is the authority for "has this visitor unlocked the
// catalogue?" — it can't be forged client-side, and it gates the protected
// page-image route. No JWT dependency; Node's crypto is enough.
import crypto from "node:crypto";

const TTL_DAYS = 7;
export const ACCESS_TTL_DAYS = TTL_DAYS;

function secret() {
  // Falls back to the CRM secret (already set in prod) so access tokens are
  // signed even if a dedicated secret isn't configured; the dev default only
  // ever applies locally.
  return (
    process.env.CATALOG_ACCESS_SECRET ||
    process.env.CRM_INGEST_SECRET ||
    "powerline-dev-catalog-secret"
  );
}

export function cookieName(slug) {
  return `pl_cat_${slug}`;
}

export function createAccessToken(slug) {
  const exp = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${slug}.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAccessToken(token, slug) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [s, exp, sig] = parts;
  if (s !== slug) return false;
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  const expected = crypto
    .createHmac("sha256", secret())
    .update(`${s}.${exp}`)
    .digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
