// /ask — server-side proxy of the Chatbase-hosted Help Page.
//
// We proxy the HTML document through this Route Handler (instead of a plain
// next.config rewrite) for one reason: it lets us inject a small style tag so
// the page gets some breathing room at the very top. The public URL stays
// askpowerline.com/ask — the browser is never redirected to chatbase.co.
//
// The page's own assets (/__cb/*) and chat API (/api/chat/<agent>/*) are still
// proxied by the fast rewrites in next.config.mjs; only this HTML document is
// transformed here. Optional catch-all so /ask and any nested /ask/* both work.

export const dynamic = "force-dynamic"; // always proxy live, never prerender/cache

const AGENT = "sLKM0TNp1axEFPg4aizRO";
// chatbase.co 308-redirects to www.chatbase.co — target www directly.
const UPSTREAM = `https://www.chatbase.co/${AGENT}/help`;

// Some breathing room at the top of the Chatbase help page. The page's <body>
// background is white while the app itself is near-black, so the padded strip
// must be painted the page's dark colour (matches <html>/<main>, zinc-950).
const INJECT = `<style id="pl-ask-top-pad">body{padding-top:2rem!important;background-color:#09090b!important}</style>`;

export async function GET(request, { params }) {
  const { search } = new URL(request.url);
  const parts = params?.path;
  const sub = parts && parts.length ? "/" + parts.map(encodeURIComponent).join("/") : "";
  const target = UPSTREAM + sub + search;

  let upstream;
  try {
    upstream = await fetch(target, {
      headers: {
        "user-agent": request.headers.get("user-agent") || "",
        accept: request.headers.get("accept") || "text/html",
        "accept-language": request.headers.get("accept-language") || "",
      },
      redirect: "follow",
    });
  } catch {
    return new Response("Upstream chat page is unavailable.", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const contentType = upstream.headers.get("content-type") || "";

  // Only HTML documents get the style injection; anything else streams through.
  if (!contentType.includes("text/html")) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "content-type": contentType || "application/octet-stream" },
    });
  }

  let html = await upstream.text();
  html = html.includes("</head>")
    ? html.replace("</head>", `${INJECT}</head>`)
    : INJECT + html;

  return new Response(html, {
    status: upstream.status,
    headers: {
      "content-type": contentType, // text/html; charset=utf-8
      "cache-control": "no-store",
    },
  });
}
