import { NextResponse } from "next/server";
import { forwardLeadToCrm } from "@/lib/crm";

// Same-origin proxy that forwards contact/careers form submissions to the CRM
// ingest endpoint (the shared secret stays server-side). Best-effort: any
// failure returns quietly so the email path (the primary channel) is unaffected.
// The actual CRM call lives in lib/crm.js and is shared with the catalogue
// unlock route so there is only one CRM integration.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body */
  }
  const source =
    body.source === "careers" ? "careers" : body.source === "ask" ? "ask" : "contact";
  const result = await forwardLeadToCrm({
    name: body.name,
    email: body.email,
    phone: body.phone,
    company: body.company,
    message: body.message,
    source,
  });
  return NextResponse.json(result);
}
