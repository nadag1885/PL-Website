"use client";

import SmoothScroll from "@/components/SmoothScroll";
import EnergyRail from "@/components/EnergyRail";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RobotAsk from "@/components/RobotAsk";

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
