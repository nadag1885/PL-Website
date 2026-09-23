import { notFound } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { Reveal } from "@/components/Primitives";
import ProductGallery from "@/components/ProductGallery";
import ProjectsScale from "@/components/ProjectsScale";
import CatalogButton from "@/components/CatalogButton";
import { getCatalog } from "@/lib/catalogs";
import { pcssProjects } from "@/lib/pcssProjects";
import { pralProjects } from "@/lib/pralProjects";
import { psecProjects } from "@/lib/psecProjects";
import { lvProjects } from "@/lib/lvProjects";
import { mvswgProjects } from "@/lib/mvswgProjects";
import {
  products,
  lowVoltage,
  primarySwitchgear,
  secondarySwitchgear,
  compactSubstation,
  supplies,
  brand,
} from "@/lib/content";

// Products that get a "track record" scale section (count-up + project marquee).
const scaleSections = {
  pcss: {
    projects: pcssProjects,
    total: 65,
    title: "PCSS substations delivered",
    ariaLabel: "The scale of Powerline's PCSS portfolio",
    lead:
      "Compact secondary substations engineered, fabricated, and commissioned by " +
      "Powerline for clients across Egypt — a portfolio that keeps growing. " +
      "Below is a selection of delivered reference projects.",
  },
  pral: {
    projects: pralProjects,
    title: "PRAL ring main units delivered",
    ariaLabel: "The scale of Powerline's PRAL portfolio",
    lead:
      "Air-insulated ring main units engineered and commissioned by Powerline for " +
      "distribution networks across Egypt — a portfolio that keeps growing. " +
      "Below is a selection of delivered reference projects.",
  },
  psec: {
    projects: psecProjects,
    title: "PSEC ring main units delivered",
    ariaLabel: "The scale of Powerline's PSEC portfolio",
    lead:
      "SF6 ring main units engineered and commissioned by Powerline for " +
      "distribution networks across Egypt — a portfolio that keeps growing. " +
      "Below is a selection of delivered reference projects.",
  },
  "switchgear-mcset": {
    projects: mvswgProjects,
    title: "MV switchgear boards delivered",
    ariaLabel: "The scale of Powerline's Schneider MCset portfolio",
    lead:
      "Schneider MCset medium-voltage switchgear assembled and commissioned by " +
      "Powerline for clients across Egypt — a portfolio that keeps growing. " +
      "Below is a selection of delivered reference projects.",
  },
};

// All low-voltage products share the same LV project reference list.
const lvSection = {
  projects: lvProjects,
  title: "Low voltage boards delivered",
  ariaLabel: "The scale of Powerline's low-voltage portfolio",
  lead:
    "Type-tested low voltage boards engineered, built, and delivered by " +
    "Powerline for clients across Egypt — a portfolio that keeps growing. " +
    "Below is a selection of delivered reference projects.",
};
["plp", "pro-e", "minicenter", "unikit", "sr-basic"].forEach((slug) => {
  scaleSections[slug] = lvSection;
});

// Dry-type transformers intentionally have no "track record" section for now.

const lineImg = {
  "Low Voltage": "/img/line-lv.webp",
  "Primary Switchgear": "/img/prod-mcset.webp",
  "Secondary Switchgear": "/img/line-mv.webp",
  "Compact Substation PCSS": "/img/prod-pcss.webp",
  "Dry Transformers": "/img/prod-dry.webp",
  "Instrument Transformers": "/img/prod-instrument-transformers.webp",
  Capacitors: "/img/prod-capacitor.webp",
  Supplies: "/img/line-supplies.webp",
};
const lineHref = {
  "Low Voltage": "/low-voltage",
  "Primary Switchgear": "/primary-switchgear",
  "Secondary Switchgear": "/secondary-switchgear",
  "Compact Substation PCSS": "/compact-substation",
  "Dry Transformers": "/our-products",
  "Instrument Transformers": "/instrument-transformers",
  Capacitors: "/capacitors",
  Supplies: "/supplies",
};

// Build a lookup of every product across the collections.
const collections = [
  { line: "Low Voltage", set: lowVoltage },
  { line: "Primary Switchgear", set: primarySwitchgear },
  { line: "Secondary Switchgear", set: secondarySwitchgear },
  { line: "Compact Substation PCSS", set: compactSubstation },
  { line: "Supplies", set: supplies },
];

function resolve(slug) {
  if (products[slug]) return products[slug];
  for (const { line, set } of collections) {
    const hit = set.products.find((p) => p.href === `/products/${slug}`);
    if (hit) {
      return {
        title: hit.name,
        line,
        img: lineImg[line],
        lead: hit.desc,
        specs: [],
        features: [],
      };
    }
  }
  return null;
}

export function generateStaticParams() {
  const slugs = new Set(Object.keys(products));
  collections.forEach(({ set }) =>
    set.products.forEach((p) => slugs.add(p.href.replace("/products/", "")))
  );
  return [...slugs].map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const p = resolve(params.slug);
  if (!p) return { title: "Product — Powerline" };
  return { title: `${p.title} — Powerline`, description: p.lead };
}

export default function ProductPage({ params }) {
  const p = resolve(params.slug);
  if (!p) notFound();

  return (
    <PageShell>
      <section className="pd">
        <div className="container">
          <Reveal className="crumbs">
            <Link href={lineHref[p.line] || "/"}>{p.line}</Link>
            <span>/</span>
            <span className="cur">{p.title}</span>
          </Reveal>

          <div className="grid">
            <Reveal as="div">
              <ProductGallery images={p.gallery || [p.img]} alt={p.title} badge={p.badge} />
            </Reveal>

            <Reveal as="div" className="detail" delay={120}>
              <span className="eyebrow">{p.line}</span>
              <h1>{p.title}</h1>
              <p className="lead">{p.lead}</p>

              {p.specs?.length > 0 && (
                <div className="specs">
                  {p.specs.map((s) => (
                    <div className="spec" key={s.k}>
                      <span className="k">{s.k}</span>
                      <span className="v">{s.v}</span>
                    </div>
                  ))}
                </div>
              )}

              {p.features?.length > 0 && (
                <ul className="features">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}

              <div className="actions">
                <Link href="/contact" className="btn btn-primary">Sales Request</Link>
                <a href={`tel:${brand.phone}`} className="btn btn-ghost" aria-label={`Call Powerline on ${brand.phoneDisplay}`}>Call Us</a>
                {getCatalog(params.slug) && <CatalogButton catalog={getCatalog(params.slug)} />}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {scaleSections[params.slug] && <ProjectsScale {...scaleSections[params.slug]} />}

      <style dangerouslySetInnerHTML={{ __html: `
        .pd { padding: clamp(8rem,18vh,11rem) 0 clamp(5rem,12vh,8rem); }
        .crumbs { display:flex; gap:0.6rem; align-items:center; font-size:0.85rem; color:var(--text-faint); margin-bottom:2rem; }
        .crumbs a { color:var(--text-dim); }
        .crumbs a:hover { color:var(--orange); }
        .crumbs .cur { color:#fff; }
        .grid { display:grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem,5vw,4rem); align-items:start; }
        .media { position:relative; border-radius:20px; overflow:hidden; border:1px solid var(--line); background:var(--bg-2); }
        .media img { width:100%; aspect-ratio:1/1; object-fit:cover; }
        .frame { position:absolute; inset:0; box-shadow: inset 0 0 0 1px rgba(232,114,42,.25); border-radius:20px; pointer-events:none; }
        .detail h1 { font-size:clamp(2.2rem,5vw,3.6rem); text-transform:uppercase; margin:1rem 0 1.2rem; }
        .lead { color:var(--text-dim); font-size:1.08rem; line-height:1.6; }
        .specs { display:grid; grid-template-columns:repeat(2,1fr); gap:0.8rem; margin:2rem 0; }
        .spec { padding:1rem 1.2rem; border:1px solid var(--line); border-radius:12px; background:var(--bg-2); }
        .spec .k { display:block; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-faint); }
        .spec .v { display:block; font-family:var(--font-head); font-weight:700; color:var(--orange); font-size:1.1rem; margin-top:0.3rem; }
        .features { list-style:none; padding:0; margin:1.5rem 0 2rem; display:grid; gap:0.7rem; }
        .features li { position:relative; padding-left:1.6rem; color:var(--text-dim); font-size:0.95rem; }
        .features li::before { content:""; position:absolute; left:0; top:0.55em; width:8px; height:8px; border-radius:50%; background:var(--orange); box-shadow:0 0 8px var(--orange); }
        .actions { display:flex; gap:1rem; flex-wrap:wrap; }
        @media (max-width:850px){ .grid{ grid-template-columns:1fr; } .actions{ justify-content:center; } }
      ` }} />
    </PageShell>
  );
}
