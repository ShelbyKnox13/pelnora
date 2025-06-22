import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark via-charcoal to-charcoal-dark opacity-50"></div>
      <div 
        className="h-[700px] bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
          <div className="text-center w-full">
            <h1 className="font-elegant text-5xl md:text-7xl font-bold text-white mb-6 tracking-wide">
              Timeless Elegance
            </h1>
            <h2 className="font-elegant text-5xl md:text-7xl font-bold text-white mb-8 tracking-wide">
              Redefined
            </h2>
            <p className="text-xl text-cream mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover exquisite handcrafted jewelry that celebrates life's precious moments with unmatched artistry and brilliance. Each piece tells a story of timeless beauty and exceptional craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => scrollToSection('collections')}
                className="bg-gold-dark hover:bg-gold text-white font-semibold py-4 px-10 rounded-md shadow-xl text-lg transition-all duration-300 transform hover:scale-105"
              >
                Explore Collection
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('our-legacy')}
                className="border-2 border-cream text-black hover:bg-cream hover:text-black font-semibold py-4 px-10 rounded-md shadow-xl text-lg transition-all duration-300"
              >
                Our Story
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-cream animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};
