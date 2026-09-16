// ─────────────────────────────────────────────────────────────────────────
// Ask Powerline — guided consultation flow (data-driven, per project convention).
// The /ask experience walks a visitor through: Domain → Focus → Question →
// Contact → Review. This file is the single source of truth for that flow:
// the starting domains, each domain's follow-up ("focus") options, and the
// context suggestion chips offered while the visitor writes their question.
//
// Icons are referenced by key (see ICON_KEYS) and drawn in the component — lib
// stays plain data (no JSX), matching lib/content.js.
//
// BACKEND CONTRACT: the chosen domain + focus are rendered into the same
// "Topic:" line the old form sent, and the question is the message body, so the
// CRM ("ask" source) and FormSubmit email payloads keep their existing shape.
// ─────────────────────────────────────────────────────────────────────────

// Domains shown on the very first screen. `line` is what the robot guide says
// once the visitor lands on the follow-up (focus) step for that domain.
export const DOMAINS = [
  {
    id: "lv",
    label: "LV Distribution",
    hint: "Panels, boards & motor control",
    icon: "board",
    line: "Low-voltage distribution — what are you working on?",
    focus: [
      { id: "mdb", label: "Main / sub distribution board" },
      { id: "mcc", label: "Motor control centre (MCC)" },
      { id: "ratings", label: "Ratings, selectivity & sizing" },
      { id: "retrofit", label: "Retrofit or upgrade" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["400 V", "690 V", "Up to 6300 A", "IEC 61439", "Form 4b", "New project", "Retrofit"],
  },
  {
    id: "mv",
    label: "MV Switchgear",
    hint: "Primary switchgear & protection",
    icon: "switchgear",
    line: "Medium-voltage switchgear — where's the focus?",
    focus: [
      { id: "primary", label: "Primary switchgear" },
      { id: "protection", label: "Protection & relays" },
      { id: "typetest", label: "Type-testing & internal arc" },
      { id: "spares", label: "Retrofit or spares" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["12 kV", "24 kV", "31.5 kA", "IEC 62271", "VD4 vacuum", "Type-tested", "New project"],
  },
  {
    id: "rmu",
    label: "Ring Main Units",
    hint: "Secondary distribution",
    icon: "rmu",
    line: "Ring main units — tell me a bit more.",
    focus: [
      { id: "sf6", label: "SF6 RMU" },
      { id: "air", label: "Air-insulated RMU" },
      { id: "automation", label: "Automation / smart grid" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["12 kV", "24 kV", "SF6", "Air-insulated", "RTU / automation", "IEC 62271-200"],
  },
  {
    id: "transformers",
    label: "Transformers",
    hint: "Dry-type & oil-immersed",
    icon: "transformer",
    line: "Transformers — which way are you leaning?",
    focus: [
      { id: "dry", label: "Dry-type" },
      { id: "oil", label: "Oil-immersed" },
      { id: "sizing", label: "Sizing, losses & cooling" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["12 / 24 kV", "Up to 3000 kVA", "Dry-type", "Oil-immersed", "IEC 60076", "New project"],
  },
  {
    id: "css",
    label: "Compact Substation",
    hint: "Packaged MV / TR / LV",
    icon: "substation",
    line: "Compact substation — what do you need?",
    focus: [
      { id: "new", label: "A new compact substation" },
      { id: "layout", label: "Configuration & layout" },
      { id: "rating", label: "Rating & transformer choice" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["12 / 24 kV", "Up to 1500 kVA", "EEHC approved", "Kiosk", "Remote site"],
  },
  {
    id: "pfc",
    label: "Power Factor Correction",
    hint: "Capacitors & harmonics",
    icon: "capacitor",
    line: "Power factor correction — what's the situation?",
    focus: [
      { id: "sizing", label: "Capacitor bank sizing" },
      { id: "harmonics", label: "Harmonics / detuned filters" },
      { id: "existing", label: "Fixing an existing PF issue" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["400–525 V", "kVAr sizing", "Detuned", "IEC 60831", "Utility penalty"],
  },
  {
    id: "product",
    label: "Product Selection",
    hint: "Help me choose the right fit",
    icon: "select",
    line: "Let's find the right product — what are you comparing?",
    focus: [
      { id: "which", label: "Which product fits my need" },
      { id: "compare", label: "Compare two options" },
      { id: "spec", label: "Review a specification" },
      { id: "unsure", label: "Not sure yet" },
    ],
    chips: ["LV panel", "MV switchgear", "RMU", "Transformer", "Datasheet", "Tender spec"],
  },
  {
    id: "other",
    label: "Something else",
    hint: "Standards, site issues & more",
    icon: "spark",
    line: "No problem — what's it about?",
    focus: [
      { id: "standards", label: "Standards & compliance" },
      { id: "site", label: "An existing installation / site issue" },
      { id: "value", label: "Value engineering" },
      { id: "industry", label: "General industry question" },
      { id: "other", label: "Something not listed" },
    ],
    chips: ["IEC standards", "Documentation", "Site visit", "New project", "Retrofit"],
  },
];

export function getDomain(id) {
  return DOMAINS.find((d) => d.id === id) || null;
}

export function getFocus(domainId, focusId) {
  const d = getDomain(domainId);
  return (d && d.focus.find((f) => f.id === focusId)) || null;
}

// The valid icon keys drawn by the component's icon set.
export const ICON_KEYS = [
  "board",
  "switchgear",
  "rmu",
  "transformer",
  "substation",
  "capacitor",
  "select",
  "spark",
];
