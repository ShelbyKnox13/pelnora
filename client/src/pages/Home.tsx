import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { PackagesSection } from "@/components/home/PackagesSection";
import { EarningsPlanSection } from "@/components/home/EarningsPlanSection";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Pelnora Jewellers - Premium MLM Opportunity</title>
        <meta name="description" content="Join Pelnora Jewellers MLM network and unlock multiple income streams with our innovative compensation plan, designed for sustainable growth and prosperity." />
        <meta property="og:title" content="Pelnora Jewellers - Premium MLM Opportunity" />
        <meta property="og:description" content="Join Pelnora Jewellers MLM network and unlock multiple income streams with our innovative compensation plan, designed for sustainable growth and prosperity." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <AboutSection />
          <PackagesSection />
          <EarningsPlanSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
