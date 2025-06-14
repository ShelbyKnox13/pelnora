import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { PackagesSection } from "@/components/home/PackagesSection";
import { EarningsPlanSection } from "@/components/home/EarningsPlanSection";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { AuthModals } from "@/components/auth/AuthModals";

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Check for referral ID and show signup modal automatically
  useEffect(() => {
    const checkReferralId = () => {
      const storedRefId = sessionStorage.getItem('referralId');
      if (storedRefId) {
        // Small delay to ensure the component is fully mounted
        setTimeout(() => {
          setShowSignupModal(true);
        }, 100);
      }
    };

    checkReferralId();
  }, []);

  return (
    <>
      <Helmet>
        <title>Pelnora Jewellers - Premium MLM Opportunity</title>
        <meta name="description" content="Join Pelnora Jewellers MLM network and unlock multiple income streams with our innovative compensation plan, designed for sustainable growth and prosperity." />
        <meta property="og:title" content="Pelnora Jewellers - Premium MLM Opportunity" />
        <meta property="og:description" content="Join Pelnora Jewellers MLM network and unlock multiple income streams with our innovative compensation plan, designed for sustainable growth and prosperity." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Fixed Action Bar - Always visible */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col space-y-3">
        <Button
          size="lg"
          onClick={() => setShowLoginModal(true)}
          className="bg-gold hover:bg-gold-light text-white font-bold py-4 px-8 rounded-md shadow-xl text-xl"
        >
          LOGIN HERE
        </Button>
        <Button
          size="lg"
          onClick={() => setShowSignupModal(true)}
          className="bg-purple-dark hover:bg-purple text-white font-bold py-4 px-8 rounded-md shadow-xl text-xl"
        >
          SIGN UP HERE
        </Button>
      </div>
      
      {/* Test credentials notice */}
      <div className="fixed bottom-32 left-4 z-50 bg-black/70 p-3 rounded-lg max-w-xs">
        <p className="text-white text-sm font-bold">Test Login:</p>
        <p className="text-white text-sm">Email: <span className="font-mono bg-black/90 px-1 rounded">test@pelnora.com</span></p>
        <p className="text-white text-sm">Password: <span className="font-mono bg-black/90 px-1 rounded">test123</span></p>
      </div>
      
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
      
      <AuthModals
        showLogin={showLoginModal}
        showSignup={showSignupModal}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseSignup={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
    </>
  );
};

export default Home;
