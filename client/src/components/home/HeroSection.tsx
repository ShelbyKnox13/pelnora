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
                  size="lg"
                  className="bg-gold hover:bg-gold-light text-white font-bold py-4 px-8 rounded-md shadow-lg text-lg"
                  onClick={() => setShowSignupModal(true)}
                >
                  SIGN UP NOW
                </Button>
                <Button 
                  size="lg"
                  variant="outline" 
                  className="bg-transparent hover:bg-white/10 text-white border-white font-bold py-4 px-8 text-lg"
                  onClick={() => setShowLoginModal(true)}
                >
                  LOGIN
                </Button>
              </div>
              <div className="mt-4 bg-black/30 p-3 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-white text-sm">
                  <span className="font-semibold text-gold">For testing:</span> Use email <span className="font-mono bg-black/40 px-1 rounded">test@pelnora.com</span> and password <span className="font-mono bg-black/40 px-1 rounded">test123</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating login/signup buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        <Button
          className="bg-gold hover:bg-gold-light text-white font-bold py-3 px-6 rounded-md shadow-lg"
          onClick={() => setShowLoginModal(true)}
        >
          Login
        </Button>
        <Button
          className="bg-purple-dark hover:bg-purple text-white font-bold py-3 px-6 rounded-md shadow-lg"
          onClick={() => setShowSignupModal(true)}
        >
          Sign Up
        </Button>
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
