import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/sections/Hero/Hero";

export default function Home() {
  return (
    <>
      <a
        href="#work"
        className="sr-only z-[110] rounded-full bg-action px-5 py-3 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-5 focus:py-3"
      >
        Skip to work
      </a>
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        <Hero />
      </main>
      <Footer />
    </>
  );
}
