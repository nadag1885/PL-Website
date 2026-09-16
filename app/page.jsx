"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import EnergyField from "@/components/EnergyField";
import EnergyRail from "@/components/EnergyRail";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RobotAsk from "@/components/RobotAsk";

// Eager: above-the-fold + all pinned/scrubbed sections (their pin math must be
// stable at first paint).
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import ProductLines from "@/components/sections/ProductLines";
import Milestones from "@/components/sections/Milestones";
import CoreValues from "@/components/CoreValues";
import Safety from "@/components/sections/Safety";

// Lazy: the trailing sections (all AFTER the last pinned section, Safety, so
// deferring them can't shift any pin offset). Splits their JS out of the
// first-load bundle; placeholders reserve height to avoid layout shift.
// (next/dynamic requires an inline object-literal for its options.)
const PowerlineEffect = dynamic(() => import("@/components/sections/PowerlineEffect"), {
  loading: () => <div style={{ minHeight: "90vh" }} aria-hidden />,
});
const Logos = dynamic(() => import("@/components/sections/Logos"), {
  loading: () => <div style={{ minHeight: "60vh" }} aria-hidden />,
});
const CTA = dynamic(() => import("@/components/sections/CTA"), {
  loading: () => <div style={{ minHeight: "60vh" }} aria-hidden />,
});
const Memorial = dynamic(() => import("@/components/sections/Memorial"), {
  loading: () => <div style={{ minHeight: "70vh" }} aria-hidden />,
});

// Module-scoped flag: false on a full page load (first open / reload), and
// stays true across in-app navigation. So the intro plays once per page load,
// never again when the user returns to home from another page.
let introPlayed = false;

export default function Home() {
  const [ready, setReady] = useState(introPlayed);
  const [showIntro, setShowIntro] = useState(!introPlayed);

  return (
    <SmoothScroll>
      {showIntro && (
        <Preloader
          // Reveal the site AND unmount the preloader together at the very end.
          // No React state changes during the animation → it can never restart.
          onComplete={() => {
            introPlayed = true;
            setReady(true);
            setShowIntro(false);
          }}
        />
      )}

      {/* Sparse, non-distracting ambient field behind the whole page — the
          occasional random electrical pulse races across and fades. No
          persistent network to pull the eye around. */}
      <div className="page-electric" aria-hidden="true">
        <EnergyField />
      </div>

      <EnergyRail />
      <Nav />
      <main className="home-main">
        <Hero ready={ready} />
        <Projects />
        <ProductLines />
        <Milestones />
        <CoreValues />
        <Safety />
        <PowerlineEffect />
        <Logos />
        <CTA />
        <Memorial />
      </main>
      <Footer />
      {ready && <RobotAsk />}
    </SmoothScroll>
  );
}
