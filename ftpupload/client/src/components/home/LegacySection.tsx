export const LegacySection = () => {
  return (
    <section id="our-legacy" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border border-gold-dark rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-gold-dark rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-gold-dark rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-elegant font-bold mb-4 text-charcoal-dark">Our Legacy</h2>
          <div className="w-24 h-1 bg-gold-dark mx-auto mb-6"></div>
          <p className="text-xl text-charcoal max-w-2xl mx-auto">
            Three decades of excellence in crafting jewelry that transcends time
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-lg text-charcoal leading-relaxed">
                For over three decades, <span className="font-elegant font-semibold text-gold-dark">Pelnora Jewellers</span> has been synonymous with exceptional craftsmanship and timeless beauty. Founded with a vision to create jewelry that tells stories, we have carefully curated collections that blend traditional artistry with contemporary design.
              </p>
              
              <p className="text-lg text-charcoal leading-relaxed">
                Our master craftsmen, with their inherited skills passed down through generations, meticulously create each piece using the finest diamonds, precious gemstones, and pure gold. Every creation from our atelier is a testament to our commitment to excellence and our passion for perfection.
              </p>
              
              <p className="text-lg text-charcoal leading-relaxed">
                From bridal sets that mark new beginnings to statement pieces that celebrate achievements, Pelnora transforms precious metals and stones into treasured heirlooms that will be cherished for generations to come.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-elegant font-bold text-gold-dark mb-2">30+</div>
                <div className="text-sm text-charcoal uppercase tracking-wide">Years of Excellence</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-elegant font-bold text-gold-dark mb-2">10K+</div>
                <div className="text-sm text-charcoal uppercase tracking-wide">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-elegant font-bold text-gold-dark mb-2">500+</div>
                <div className="text-sm text-charcoal uppercase tracking-wide">Unique Designs</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-w-4 aspect-h-5 rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Master craftsman at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold-dark rounded-lg opacity-20"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-gold-dark rounded-lg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
