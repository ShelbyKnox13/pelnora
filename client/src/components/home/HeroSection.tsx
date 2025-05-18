import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModals } from "@/components/auth/AuthModals";

export const HeroSection = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 bg-gray-800 opacity-70"></div>
        <div 
          className="h-[500px] bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
            <div className="max-w-2xl">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">Transform Your Future with Pelnora</h1>
              <p className="text-lg text-gray-100 mb-8">Join our exclusive network of entrepreneurs and unlock premium income opportunities with India's growing jewelry brand.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  className="bg-gold-dark hover:bg-gold text-white font-bold py-3 px-6 rounded-md shadow-lg"
                  onClick={() => setShowSignupModal(true)}
                >
                  Join Now
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-transparent hover:bg-white/10 text-white border-white"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
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
