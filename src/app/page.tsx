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

export default function Home() {
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
