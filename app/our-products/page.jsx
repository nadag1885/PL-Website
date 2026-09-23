import Link from "next/link";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import ProductGrid from "@/components/ProductGrid";
import { Reveal } from "@/components/Primitives";
import { lowVoltage, primarySwitchgear, secondarySwitchgear, compactSubstation, dryTransformers, instrumentTransformers, capacitors } from "@/lib/content";

export const metadata = {
  title: "Our Products — Powerline",
  description:
    "Powerline's products: certified low voltage panels, medium voltage switchgear and dry-type transformers, built to international standards.",
};

const groups = [
  { data: lowVoltage, href: "/low-voltage", img: "/img/line-lv.webp" },
  { data: primarySwitchgear, href: "/primary-switchgear", img: "/img/prod-mcset.webp" },
  { data: secondarySwitchgear, href: "/secondary-switchgear", img: "/img/line-mv.webp" },
  { data: compactSubstation, href: "/compact-substation", img: "/img/prod-pcss.webp" },
  { data: dryTransformers, href: "/products/dry-type-transformers", img: "/img/prod-dry.webp" },
  { data: instrumentTransformers, href: "/instrument-transformers", img: "/img/prod-instrument-transformers.webp" },
  { data: capacitors, href: "/capacitors", img: "/img/prod-capacitor.webp" },
];

export default function AssemblyLinesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="What We Build"
        title="Our"
        accent="Products"
        lead="From certified low voltage panels to medium voltage switchgear and dry-type transformers — engineered, type-tested and assembled at our facilities to international standards."
        img="/img/line-lv.webp"
      />

      <section className="al">
        <div className="container">
          {groups.map(({ data, href, img }) => (
            <div className="al-group" key={data.title}>
              <Reveal>
                <div className="al-head sec-head">
                  <div className="al-head-text">
                    <span className="eyebrow">Our Products</span>
                    <h2 className="section-title">{data.title}</h2>
                    <p>{data.intro}</p>
                  </div>
                  <Link href={href} className="btn btn-ghost al-cta">
                    View {data.title} →
                  </Link>
                </div>
              </Reveal>
              <ProductGrid items={data.products} />
            </div>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .al { padding: clamp(3.5rem,9vh,6rem) 0 clamp(5rem,12vh,8rem); }
        .al-group + .al-group { margin-top: clamp(4rem,10vh,7rem); }
        .al-head { display:flex; justify-content:space-between; align-items:flex-end; gap:2rem; flex-wrap:wrap; }
        .al-head-text { max-width: 70ch; }
        .al-head h2 { margin:1rem 0 0.8rem; }
        .al-head p { color: var(--text-dim); font-size:1rem; max-width:60ch; }
        .al-cta { flex:0 0 auto; }
        @media (max-width:700px){ .al-cta{ width:100%; justify-content:center; } }
      ` }} />
    </PageShell>
  );
}
