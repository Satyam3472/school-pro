import About from "@/components/About";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Navbar from "@/components/NavBar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero/>
      <Gallery />
      <About />
      <Footer/>
    </div>
  );
}
