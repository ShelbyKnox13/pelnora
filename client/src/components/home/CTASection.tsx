import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModals } from "@/components/auth/AuthModals";

export const CTASection = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <section className="py-16 bg-purple-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl font-bold text-white mb-6">Ready to Begin Your Journey?</h2>
          <p className="text-gray-200 max-w-3xl mx-auto mb-8">Join thousands of partners already building their financial freedom with Pelnora Jewellers. Start your journey today!</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              className="bg-gold hover:bg-gold-light text-white font-bold py-3 px-8 rounded-md shadow-lg text-lg"
              onClick={() => setShowSignupModal(true)}
            >
              Sign Up Now
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent hover:bg-white/10 text-white border-white font-bold py-3 px-8 text-lg"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </Button>
          </div>
          <div className="mt-6 text-white">
            <p className="text-sm">Already have an account? <button onClick={() => setShowLoginModal(true)} className="text-gold underline font-semibold">Login here</button></p>
            <p className="text-sm mt-2">Want to join with a referral? <button onClick={() => setShowSignupModal(true)} className="text-gold underline font-semibold">Sign up here</button></p>
          </div>
        </div>
      </section>

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
