import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModals } from "@/components/auth/AuthModals";
import { PACKAGES } from "@/lib/constants";

export const PackagesSection = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handlePackageSelect = () => {
    setShowSignupModal(true);
  };

  return (
    <>
      <section className="py-16 bg-gray-50" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl font-bold text-purple-dark mb-4">Investment Packages</h2>
            <div className="w-24 h-1 bg-gold-dark mx-auto mb-6"></div>
            <p className="max-w-3xl mx-auto text-gray-600">Choose the investment package that fits your goals. All packages include our exclusive 11-month EMI plan with a complimentary bonus month.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PACKAGES.map((pkg, index) => (
              <div 
                key={pkg.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-transform hover:scale-105 ${pkg.popular ? 'transform scale-105 ring-2 ring-gold-dark' : ''}`}
              >
                <div className={`bg-${pkg.color} text-white p-4 text-center relative overflow-hidden`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-white text-gold-dark text-xs font-bold py-1 px-3 transform rotate-45 translate-x-2 -translate-y-1">
                      POPULAR
                    </div>
                  )}
                  <h3 className="font-playfair text-xl font-bold">{pkg.name}</h3>
                  <p className="text-sm opacity-80">{pkg.description}</p>
                </div>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-charcoal">₹{pkg.monthlyAmount.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                    <p className="text-gray-500 text-sm">for 11 months</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-gold-dark mr-2 mt-0.5" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                    {pkg.nonBenefits.map((nonBenefit, i) => (
                      <li key={i} className="flex items-start text-gray-400">
                        <X className="h-5 w-5 text-gray-300 mr-2 mt-0.5" />
                        <span>{nonBenefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full bg-${pkg.color} hover:bg-${pkg.color.replace('-dark', '')} text-white font-bold`}
                    onClick={handlePackageSelect}
                  >
                    Select Package
                  </Button>
                </div>
              </div>
            ))}
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
