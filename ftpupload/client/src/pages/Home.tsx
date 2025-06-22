import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { LegacySection } from "@/components/home/LegacySection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Pelnora Jewellers - Timeless Elegance in Every Piece</title>
        <meta name="description" content="Discover exquisite handcrafted jewelry at Pelnora Jewellers. From timeless classics to contemporary designs, our collections celebrate life's precious moments." />
        <meta property="og:title" content="Pelnora Jewellers - Timeless Elegance in Every Piece" />
        <meta property="og:description" content="Discover exquisite handcrafted jewelry at Pelnora Jewellers. From timeless classics to contemporary designs, our collections celebrate life's precious moments." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <HeroSection />
          <LegacySection />
          <CollectionsSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
