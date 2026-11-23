import type { Metadata } from "next";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Household from "@/components/Household";
import Measures from "@/components/Measures";
import Nav from "@/components/Nav";
import NumberCheck from "@/components/NumberCheck";
import Security from "@/components/Security";
import Showcase from "@/components/Showcase";
import Steps from "@/components/Steps";

export const metadata: Metadata = {
  title: "GaltonKS: portfolio risk analysis for advisors",
  description:
    "Galton measures how concentrated a client's portfolio really is, builds a household risk profile, and explains both in plain language. The engine computes every figure; every answer is checked before you see it.",
};

export default function Advisors() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Measures />
        <Steps />
        <NumberCheck />
        <Showcase />
        <Household />
        <Security />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
