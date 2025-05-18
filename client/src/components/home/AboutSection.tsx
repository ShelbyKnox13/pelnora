import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const AboutSection = () => {
  return (
    <section className="py-16 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl font-bold text-purple-dark mb-4">About Pelnora Jewellers</h2>
          <div className="w-24 h-1 bg-gold-dark mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-gray-600">Pelnora Jewellers combines exquisite craftsmanship with innovative business opportunities, creating a platform where beauty meets prosperity.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-light/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Premium Earnings</h3>
            <p className="text-gray-600">Unlock multiple income streams with our innovative compensation plan, designed for sustained growth.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gold-light/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Growing Community</h3>
            <p className="text-gray-600">Join thousands of successful partners building their business with Pelnora's proven system.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-teal-light/10 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Flexible EMI Plans</h3>
            <p className="text-gray-600">Start your journey with affordable monthly installments and earn bonuses for timely payments.</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-lg overflow-hidden shadow-md">
            <img 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Elegant jewelry collection" 
              className="w-full h-auto"
            />
          </div>
          <div>
            <h3 className="font-playfair text-2xl font-bold text-purple-dark mb-4">Exclusive Opportunity</h3>
            <p className="text-gray-600 mb-6">At Pelnora Jewellers, we believe in sharing success. Our unique business model combines the luxury jewelry market with a powerful MLM structure that rewards dedication and leadership.</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gold-dark mr-2 mt-0.5" />
                <span className="text-gray-600">Multiple income streams available from day one</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gold-dark mr-2 mt-0.5" />
                <span className="text-gray-600">Transparent binary and level compensation plans</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gold-dark mr-2 mt-0.5" />
                <span className="text-gray-600">Auto pool system for exponential growth potential</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-gold-dark mr-2 mt-0.5" />
                <span className="text-gray-600">Supportive community and comprehensive training</span>
              </li>
            </ul>
            <Button className="bg-purple-dark hover:bg-purple text-white font-bold">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
  );
};
