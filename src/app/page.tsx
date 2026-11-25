import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Project';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import PortfolioEffects from '@/components/PortfolioEffects';

export default function Home() {
  return (
    <div className="page">
      <Header />
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
      <PortfolioEffects />
    </div>
  );
}