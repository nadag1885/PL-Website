"use client";

import dynamic from "next/dynamic";
import SmoothScroll from "@/components/SmoothScroll";
import EnergyRail from "@/components/EnergyRail";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Non-critical floating helper — keep it out of the initial bundle.
const RobotAsk = dynamic(() => import("@/components/RobotAsk"), { ssr: false });

export default function PageShell({ children, robot = true }) {
  return (
    <SmoothScroll>
      <EnergyRail />
      <Nav />
      <main>{children}</main>
      <Footer />
      {robot && <RobotAsk />}
    </SmoothScroll>
  );
}
