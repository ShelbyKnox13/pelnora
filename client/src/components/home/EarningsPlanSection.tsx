import { Check, CheckCircle2 } from "lucide-react";
import { EARNINGS_DESCRIPTIONS, EARNING_TYPE_COLORS } from "@/lib/constants";

export const EarningsPlanSection = () => {
  return (
    <section className="py-16 bg-white" id="earnings-plan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-3xl font-bold text-purple-dark mb-4">Earnings Plan</h2>
          <div className="w-24 h-1 bg-gold-dark mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-gray-600">Our comprehensive compensation plan offers multiple streams of income to maximize your earning potential.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Business team photo */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Professional business team" 
              className="w-full h-auto"
            />
          </div>
          
          <div>
            <h3 className="font-playfair text-2xl font-bold text-purple-dark mb-6">Multiple Income Streams</h3>
            
            <div className="space-y-6">
              {/* Direct Income */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className={`${EARNING_TYPE_COLORS.direct.bg} rounded-full p-2 mr-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${EARNING_TYPE_COLORS.direct.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-charcoal">Direct Income (5%)</h4>
                    <p className="text-gray-600">{EARNINGS_DESCRIPTIONS.direct}</p>
                  </div>
                </div>
              </div>
              
              {/* Binary Income */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className={`${EARNING_TYPE_COLORS.binary.bg} rounded-full p-2 mr-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${EARNING_TYPE_COLORS.binary.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-charcoal">Binary Income (5%)</h4>
                    <p className="text-gray-600">{EARNINGS_DESCRIPTIONS.binary}</p>
                  </div>
                </div>
              </div>
              
              {/* Level Income */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className={`${EARNING_TYPE_COLORS.level.bg} rounded-full p-2 mr-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${EARNING_TYPE_COLORS.level.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-charcoal">Level Income (62% of Binary)</h4>
                    <p className="text-gray-600">{EARNINGS_DESCRIPTIONS.level}</p>
                  </div>
                </div>
              </div>
              
              {/* Auto Pool Income */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-start">
                  <div className={`${EARNING_TYPE_COLORS.autopool.bg} rounded-full p-2 mr-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${EARNING_TYPE_COLORS.autopool.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-charcoal">Auto Pool Income</h4>
                    <p className="text-gray-600">{EARNINGS_DESCRIPTIONS.autopool}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 shadow-md border border-gray-100">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-charcoal mb-2">Unlock Levels</h4>
              <p className="text-gray-600">Each direct referral unlocks 2 additional levels in your level income plan.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-charcoal mb-2">EMI Bonus</h4>
              <p className="text-gray-600">Pay all 11 EMIs on time and get the equivalent of 1 EMI as a bonus.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-charcoal mb-2">Withdrawal Process</h4>
              <p className="text-gray-600">Simple withdrawal process with no minimum amount and quick processing.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
