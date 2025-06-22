export const Footer = () => {
  return (
    <footer className="bg-charcoal-dark text-cream relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-20 w-40 h-40 border border-gold-dark rounded-full"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 border border-gold-dark rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <h3 className="font-elegant text-2xl font-bold text-gold-dark mb-2">PELNORA</h3>
              <p className="font-elegant text-lg text-cream">JEWELLERS</p>
            </div>
            <p className="text-cream text-sm leading-relaxed mb-6">
              Crafting exceptional jewelry for over 30 years, combining traditional artistry with contemporary elegance to create timeless treasures.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gold-dark rounded-full flex items-center justify-center hover:bg-gold transition-all duration-300 transform hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gold-dark rounded-full flex items-center justify-center hover:bg-gold transition-all duration-300 transform hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gold-dark rounded-full flex items-center justify-center hover:bg-gold transition-all duration-300 transform hover:scale-110">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Contact Us */}
          <div>
            <h3 className="text-gold-dark font-elegant font-bold text-lg mb-6">Contact Us</h3>
            <div className="space-y-4">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-dark mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-cream text-sm">support@pelnora.in</span>
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-dark mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-cream text-sm">+91 98765 43210</span>
              </p>
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gold-dark mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-cream text-sm">123 Jewellers Street<br />Mumbai, Maharashtra 400001<br />India</span>
              </p>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-gold-dark font-elegant font-bold text-lg mb-6">Our Services</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-cream hover:text-gold-light transition-colors duration-300 cursor-pointer">Custom Jewelry Design</li>
              <li className="text-cream hover:text-gold-light transition-colors duration-300 cursor-pointer">Jewelry Repair & Maintenance</li>
              <li className="text-cream hover:text-gold-light transition-colors duration-300 cursor-pointer">Certification & Appraisal</li>
              <li className="text-cream hover:text-gold-light transition-colors duration-300 cursor-pointer">Investment Consultation</li>
              <li className="text-cream hover:text-gold-light transition-colors duration-300 cursor-pointer">Bridal Collections</li>
            </ul>
          </div>
          
          {/* Business Hours */}
          <div>
            <h3 className="text-gold-dark font-elegant font-bold text-lg mb-6">Business Hours</h3>
            <div className="space-y-3 text-sm">
              <p className="text-cream">
                <span className="font-semibold">Mon - Sat:</span><br />
                10:00 AM - 8:00 PM
              </p>
              <p className="text-cream">
                <span className="font-semibold">Sunday:</span><br />
                11:00 AM - 6:00 PM
              </p>
              <p className="text-cream">
                <span className="font-semibold">Festivals:</span><br />
                9:00 AM - 9:00 PM
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 border-t border-charcoal">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-cream text-sm mb-4 md:mb-0">
              © 2025 Pelnora Jewellers. All rights reserved.
            </p>
            <p className="text-cream text-sm">
              Designed with excellence for timeless elegance.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
