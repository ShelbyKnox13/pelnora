import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronRight, Users } from "lucide-react";
import { Helmet } from "react-helmet";

const AutoPool = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch auto pool entries
  const { data: autoPoolEntries, isLoading: autoPoolLoading } = useQuery({
    queryKey: ['/api/auto-pool/me'],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Loading your auto pool data...</h2>
            <div className="w-16 h-16 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isEligible = user?.autoPoolEligible;
  const totalEarningsAmount = user ? parseFloat(user.totalEarnings) : 0;
  const remainingAmount = 10000 - totalEarningsAmount;

  return (
    <>
      <Helmet>
        <title>Auto Pool - Pelnora Jewellers</title>
        <meta name="description" content="Track your position in the Pelnora Jewellers Auto Pool matrix and view your potential earnings from this exclusive income source." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">Auto Pool</h1>
              <p className="mt-1 text-sm text-gray-500">Track your auto pool matrix and earnings</p>
            </div>
            
            {!isEligible && (
              <Alert className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not Eligible for Auto Pool Yet</AlertTitle>
                <AlertDescription>
                  You need to earn ₹10,000 total income to enter the Auto Pool. 
                  {totalEarningsAmount > 0 && 
                    ` You've earned ₹${totalEarningsAmount.toFixed(2)} so far. Only ₹${remainingAmount.toFixed(2)} more to go!`
                  }
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gold-light/20 rounded-md p-3">
                      <Users className="h-6 w-6 text-gold-dark" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Auto Pool Eligibility</dt>
                        <dd>
                          <div className="text-lg font-bold text-gray-900">
                            {isEligible ? 'Eligible' : 'Not Eligible'}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-light/20 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Auto Pool Earnings</dt>
                        <dd>
                          <div className="text-lg font-bold text-gray-900 font-mono">
                            {autoPoolLoading ? (
                              <Skeleton className="h-7 w-24" />
                            ) : (
                              `₹${isEligible ? '4,900.00' : '0.00'}`
                            )}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-teal-light/20 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Auto Pool Position</dt>
                        <dd>
                          <div className="text-lg font-bold text-gray-900">
                            {autoPoolLoading ? (
                              <Skeleton className="h-7 w-24" />
                            ) : (
                              isEligible ? 'Level 1, Position 3' : 'Not in pool'
                            )}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-gray-900">Auto Pool Matrix</CardTitle>
                <CardDescription>
                  The auto pool follows a 1:3:9 matrix structure. Each level has a specific number of positions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {!isEligible ? (
                  <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100">
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="mt-5 text-lg font-medium text-gray-900">You're not eligible for Auto Pool yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Continue earning through direct referrals, binary and level income to reach ₹10,000 
                      total earnings and unlock the Auto Pool bonus opportunity.
                    </p>
                    <div className="mt-6">
                      <div className="text-sm font-medium text-gray-700">Progress toward Auto Pool eligibility</div>
                      <div className="mt-2 relative">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div 
                            style={{ width: `${Math.min(100, (totalEarningsAmount / 10000) * 100)}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gold-dark"
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex justify-between">
                          <span>₹0</span>
                          <span>₹10,000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12 py-4">
                    {/* Level 1 (1 position) */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Level 1 (Root)</h3>
                      <div className="flex justify-center">
                        <div className="w-24 h-24 bg-purple-dark rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white">
                          <div className="text-center">
                            <div className="text-xs">You</div>
                            <div className="text-xl">1</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Level 2 (3 positions) */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Level 2 (3 positions)</h3>
                      <div className="flex justify-center space-x-8">
                        {[1, 2, 3].map((position) => (
                          <div 
                            key={position}
                            className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-4 border-white ${
                              position < 3 ? 'bg-gold-dark' : 'bg-teal-dark'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-xs">{position < 3 ? 'Member' : 'You'}</div>
                              <div>{position}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center mt-2">
                        <svg width="280" height="40" className="absolute -mt-[60px] z-0">
                          <path d="M140,0 L60,40" stroke="#D4AF37" strokeWidth="2" fill="none" />
                          <path d="M140,0 L140,40" stroke="#D4AF37" strokeWidth="2" fill="none" />
                          <path d="M140,0 L220,40" stroke="#D4AF37" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Level 3 (9 positions) */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Level 3 (9 positions)</h3>
                      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
                        {Array(9).fill(0).map((_, i) => (
                          <div 
                            key={i}
                            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white ${
                              i < 5 ? 'bg-gold-dark text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-xs">{i < 5 ? 'Member' : '-'}</div>
                              <div>{i + 1}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center mt-4">
                        <ChevronRight className="h-6 w-6 text-gray-400" />
                        <span className="text-gray-500 text-sm">More positions will appear as the pool expands</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-medium text-gray-900">Auto Pool Earnings Explained</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    The Auto Pool is an exclusive income opportunity that becomes available once you've earned a total income of ₹10,000 from all sources.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">How the 1:3:9 Matrix Works</h4>
                    <ul className="space-y-2 list-disc pl-5">
                      <li className="text-gray-600">
                        <span className="font-medium">Level 1:</span> You are placed at the top of your personal matrix (1 position)
                      </li>
                      <li className="text-gray-600">
                        <span className="font-medium">Level 2:</span> 3 members are placed beneath you
                      </li>
                      <li className="text-gray-600">
                        <span className="font-medium">Level 3:</span> 9 members are placed beneath level 2 (3 under each level 2 member)
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Auto Pool Earnings Distribution</h4>
                    <ul className="space-y-2 list-disc pl-5">
                      <li className="text-gray-600">
                        <span className="font-medium">Pool Funding:</span> 2.5% of all member income is contributed to the Auto Pool
                      </li>
                      <li className="text-gray-600">
                        <span className="font-medium">Distribution:</span> Pool funds are distributed based on your position and the number of members in your matrix
                      </li>
                      <li className="text-gray-600">
                        <span className="font-medium">Eligibility:</span> Once you qualify, you remain in the Auto Pool permanently
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-gray-600">
                    As more members join the Auto Pool, it expands, creating more earning opportunities. Your position is permanent, ensuring continuous income as long as the pool grows.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AutoPool;
