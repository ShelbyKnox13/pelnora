import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { AuthModals } from "@/components/auth/AuthModals";
import { Star, Award, Shield, Heart, Crown, Gem } from "lucide-react";

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Check for referral ID and show signup modal automatically
  useEffect(() => {
    const checkReferralId = () => {
      const storedRefId = sessionStorage.getItem('referralId');
      if (storedRefId) {
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
        <title>Pelnora Jewellers - Timeless Elegance & Exquisite Craftsmanship</title>
        <meta name="description" content="Discover Pelnora Jewellers' exquisite collection of handcrafted jewelry. Experience our legacy of excellence, timeless designs, and unmatched craftsmanship." />
        <meta property="og:title" content="Pelnora Jewellers - Timeless Elegance & Exquisite Craftsmanship" />
        <meta property="og:description" content="Discover Pelnora Jewellers' exquisite collection of handcrafted jewelry. Experience our legacy of excellence, timeless designs, and unmatched craftsmanship." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-rose-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 to-rose-100/30"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              {/* Logo */}
              <div className="flex items-center justify-center mb-8">
                <div className="bg-gradient-to-r from-amber-600 to-rose-600 p-4 rounded-full shadow-2xl">
                  <Crown className="w-16 h-16 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
                    PELNORA
                  </h1>
                  <p className="text-2xl font-elegant text-amber-700">JEWELLERS</p>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                Timeless Elegance
                <span className="block text-amber-600">Exquisite Craftsmanship</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                For generations, Pelnora Jewellers has been synonymous with unparalleled artistry, 
                creating treasured pieces that celebrate life's most precious moments.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">Our Exquisite Collections</h3>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Collection 1 - Traditional Indian */}
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-xl">
                  <div className="aspect-square bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                    <Gem className="w-32 h-32 text-amber-700 opacity-80" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="text-2xl font-bold text-white mb-2">Traditional Heritage</h4>
                    <p className="text-white/90">Celebrating India's rich jewelry traditions</p>
                  </div>
                </div>
              </div>

              {/* Collection 2 - Contemporary */}
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-xl">
                  <div className="aspect-square bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
                    <Star className="w-32 h-32 text-rose-700 opacity-80" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="text-2xl font-bold text-white mb-2">Contemporary Elegance</h4>
                    <p className="text-white/90">Modern designs for today's woman</p>
                  </div>
                </div>
              </div>

              {/* Collection 3 - Bridal */}
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-xl">
                  <div className="aspect-square bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center">
                    <Heart className="w-32 h-32 text-yellow-700 opacity-80" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="text-2xl font-bold text-white mb-2">Bridal Collection</h4>
                    <p className="text-white/90">Perfect for your special day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Models Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-amber-50 to-rose-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">Adorned in Pelnora</h3>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Western Model */}
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-80 h-96 mx-auto bg-gradient-to-br from-rose-200 to-pink-200 rounded-lg shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-rose-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Crown className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-rose-700 font-semibold">Western Elegance</p>
                    </div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">International Appeal</h4>
                <p className="text-gray-600">Sophisticated designs loved worldwide</p>
              </div>

              {/* Indian Model */}
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-80 h-96 mx-auto bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Gem className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-amber-700 font-semibold">Indian Grace</p>
                    </div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">Cultural Heritage</h4>
                <p className="text-gray-600">Traditional beauty meets modern style</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Pelnora */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-gray-800 mb-16">The Pelnora Legacy</h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50">
                <Award className="w-16 h-16 text-amber-600 mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Excellence</h4>
                <p className="text-gray-600 leading-relaxed">
                  Every piece is meticulously crafted by master artisans who have perfected their skills over decades, 
                  ensuring each creation meets our uncompromising standards of excellence.
                </p>
              </div>

              <div className="text-center p-8 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50">
                <Shield className="w-16 h-16 text-rose-600 mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Timeless Quality</h4>
                <p className="text-gray-600 leading-relaxed">
                  Using only the finest materials and time-honored techniques, we create jewelry that transcends 
                  trends and becomes cherished heirlooms for generations to come.
                </p>
              </div>

              <div className="text-center p-8 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50">
                <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Heritage</h4>
                <p className="text-gray-600 leading-relaxed">
                  Our legacy spans generations, built on trust, authenticity, and an unwavering commitment 
                  to creating jewelry that celebrates life's most precious moments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-amber-600 to-rose-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h3 className="text-4xl font-bold mb-6">Join the Pelnora Family</h3>
            <p className="text-xl mb-8 opacity-90">
              Discover exclusive opportunities to be part of our jewelry legacy. 
              Connect with us to explore our referral program and exclusive collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSignupModal(true)}
                className="bg-white text-amber-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors duration-300 text-lg"
              >
                Become a Partner
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold py-4 px-8 rounded-lg transition-colors duration-300 text-lg"
              >
                Partner Login
              </button>
            </div>
          </div>
        </section>

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
