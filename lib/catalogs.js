// ── Gated product catalogues — single source of truth ──────────────────────
// Add a new catalogue by (1) placing its PDF at private/catalogs/<key>/<file>,
// (2) rendering its pages to private/catalogs/<key>/pages/<prefix>-001.webp …,
// and (3) adding an entry here. Both the in-site viewer (page images) and the
// optional PDF download are delivered ONLY through gated APIs after a lead is
// captured — neither is ever a public/static URL.
//
// `slug` must match the product slug in lib/content.js `products`. Several
// products may share one catalogue's files/access via `assetKey` (e.g. all the
// low-voltage panels share the "lv" assets) — the on-disk folder, the cookie
// scope and the access token all key off `assetKey` (falling back to `slug`).

// The five low-voltage panel products share one "LV Panels" catalogue.
const LV = {
  title: "Low Voltage Panels Technical Catalogue",
  edition: "2026 · Type-Tested LV Panels",
  assetKey: "lv",
  file: "LV_Panels_Catalogue_2026.pdf",
  downloadName: "Powerline-LV-Panels-Technical-Catalogue-2026.pdf",
  totalPages: 24,
  pageAspect: 0.7071,
  pagePrefix: "lv",
};
const LV_PRODUCTS = {
  plp: "PLP",
  "pro-e": "PRO-E",
  minicenter: "Minicenter",
  unikit: "UniKIT",
  "sr-basic": "SR Basic",
};

// Current & Voltage transformers are two products that share one "Instrument
// Transformers" catalogue (assets on disk under assetKey "instrument-transformers").
const IT = {
  title: "Instrument Transformers Technical Catalogue",
  edition: "2026 · Current & Voltage Transformers",
  assetKey: "instrument-transformers",
  file: "Instrument_Transformers_Catalogue_2026.pdf",
  downloadName: "Powerline-Instrument-Transformers-Technical-Catalogue-2026.pdf",
  totalPages: 14,
  pageAspect: 0.7071,
  pagePrefix: "it",
};

export const catalogs = {
  psec: {
    slug: "psec",
    productName: "PSEC",
    title: "PSEC Technical Catalogue",
    edition: "2026 · SF6 Ring Main Unit",
    file: "PSEC_Catalogue_2026.pdf",
    downloadName: "Powerline-PSEC-Technical-Catalogue-2026.pdf",
    totalPages: 31,
    pageAspect: 0.7071,
    pagePrefix: "psec",
  },
  pral: {
    slug: "pral",
    productName: "PRAL",
    title: "PRAL Technical Catalogue",
    edition: "2026 · Air-Insulated Ring Main Unit",
    file: "PRAL_Catalogue_2026.pdf",
    downloadName: "Powerline-PRAL-Technical-Catalogue-2026.pdf",
    totalPages: 28,
    pageAspect: 0.7071,
    pagePrefix: "pral",
  },
  plgear: {
    slug: "plgear",
    productName: "PLGEAR",
    title: "PLGEAR Technical Catalogue",
    edition: "2026 · Metal-Clad MV Switchgear",
    file: "PLGEAR_Catalogue_2026.pdf",
    downloadName: "Powerline-PLGEAR-Technical-Catalogue-2026.pdf",
    totalPages: 23,
    pageAspect: 0.7071,
    pagePrefix: "plgear",
  },
  pcss: {
    slug: "pcss",
    productName: "PCSS",
    title: "PCSS Technical Catalogue",
    edition: "2026 · Compact Secondary Substation",
    file: "PCSS_Catalogue_2026.pdf",
    downloadName: "Powerline-PCSS-Technical-Catalogue-2026.pdf",
    totalPages: 20,
    pageAspect: 0.7071,
    pagePrefix: "pcss",
  },
  pcmk: {
    slug: "pcmk",
    productName: "PCMK",
    title: "PCMK Capacitors Technical Catalogue",
    edition: "2026 · LV Shunt Capacitors",
    file: "PCMK_Capacitors_Catalogue_2026.pdf",
    downloadName: "Powerline-PCMK-Capacitors-Technical-Catalogue-2026.pdf",
    totalPages: 15,
    pageAspect: 0.7071,
    pagePrefix: "pcmk",
  },
  "current-transformers": { slug: "current-transformers", productName: "Current Transformers", ...IT },
  "voltage-transformers": { slug: "voltage-transformers", productName: "Voltage Transformers", ...IT },
  "dry-type-transformers": {
    slug: "dry-type-transformers",
    productName: "Dry Type Transformers",
    title: "Dry-Type Transformers Technical Catalogue",
    edition: "2026 · Cast-Resin Dry-Type Transformers",
    file: "PDTR_Transformers_Catalogue_2026.pdf",
    downloadName: "Powerline-Dry-Type-Transformers-Technical-Catalogue-2026.pdf",
    totalPages: 8,
    pageAspect: 0.7071,
    pagePrefix: "dry",
  },
  // Low-voltage panels — five products, one shared catalogue (assetKey "lv").
  ...Object.fromEntries(
    Object.entries(LV_PRODUCTS).map(([slug, productName]) => [
      slug,
      { slug, productName, ...LV },
    ])
  ),
};

export function getCatalog(slug) {
  return (slug && catalogs[slug]) || null;
}

// Folder / cookie / access-token key for a catalogue (shared across products
// that point at the same assets via `assetKey`).
export function catalogKey(cat) {
  return (cat && (cat.assetKey || cat.slug)) || "";
}
