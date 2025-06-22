import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BinaryTree } from "@/components/team/BinaryTree";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/ui/back-button";
import { Helmet } from "react-helmet";

const Team = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch binary structure
  const { data: binaryStructure, isLoading: structureLoading } = useQuery({
    queryKey: ['/api/binary-structure/me'],
    enabled: isAuthenticated,
  });

  // Fetch level statistics
  const { data: levelStats, isLoading: levelStatsLoading } = useQuery({
    queryKey: ['/api/level-statistics/me'],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Loading your team data...</h2>
            <div className="w-16 h-16 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Helmet>
        <title>My Team - Pelnora Jewellers</title>
        <meta name="description" content="View your Pelnora Jewellers team structure, downline members, and performance metrics in a hierarchical binary tree visualization." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">My Team</h1>
              <p className="mt-1 text-sm text-gray-500">View your team structure and performance</p>
            </div>
            
            <Tabs defaultValue="tree" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="tree">Binary Tree</TabsTrigger>
                <TabsTrigger value="table">Tabular View</TabsTrigger>
                <TabsTrigger value="levels">Level Statistics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tree" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">Binary Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <BinaryTree isLoading={structureLoading} data={binaryStructure} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="table" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">Team Members</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {structureLoading ? (
                      <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[200px]" />
                              <Skeleton className="h-4 w-[150px]" />
                            </div>
                            <div className="ml-auto">
                              <Skeleton className="h-6 w-[100px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : binaryStructure?.downline?.length > 0 ? (
                      <div className="rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {binaryStructure?.downline?.map((member: any) => (
                              <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {member.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.position === 'left' ? 'Left' : 'Right'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {member.level}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    member.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {member.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                        <p className="mt-1 text-sm text-gray-500">Start building your team by sharing your referral link.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="levels" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">Level Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {levelStatsLoading ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                              <Skeleton className="h-6 w-32 mb-2" />
                              <Skeleton className="h-8 w-24 mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          ))}
                        </div>
                        <Skeleton className="h-64 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="font-bold text-lg text-charcoal mb-2">Unlocked Levels</h4>
                            <div className="flex items-center">
                              <div className="text-2xl font-bold text-gold-dark">
                                {levelStats?.unlockedLevels || 0} / {levelStats?.maxLevels || 20}
                              </div>
                              <div className="ml-auto bg-gold-light/20 px-2 py-1 rounded text-xs font-medium text-gold-dark">
                                {levelStats?.completionPercentage || 0}% Complete
                              </div>
                            </div>
                            <div className="mt-2 overflow-hidden bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-gold-dark" 
                                style={{ width: `${levelStats?.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="font-bold text-lg text-charcoal mb-2">Direct Referrals</h4>
                            <div className="flex items-center">
                              <div className="text-2xl font-bold text-purple-dark">
                                {levelStats?.directReferralCount || 0}
                              </div>
                              <div className="ml-auto text-sm text-gray-500">Each referral unlocks 2 levels</div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="font-bold text-lg text-charcoal mb-2">Next Level Unlock</h4>
                            <div className="flex items-center">
                              {levelStats?.nextLevel ? (
                                <>
                                  <div className="text-2xl font-bold text-teal-dark">Level {levelStats.nextLevel}</div>
                                  <div className="ml-auto text-sm text-gray-500">
                                    Need {levelStats.referralsNeededForNextLevel} more direct referral{levelStats.referralsNeededForNextLevel !== 1 ? 's' : ''}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-2xl font-bold text-green-600">All Unlocked!</div>
                                  <div className="ml-auto text-sm text-gray-500">Maximum levels reached</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {levelStats?.levels?.map((level, i) => (
                                <tr key={level.level} className={level.status === 'locked' ? 'bg-gray-50' : ''}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Level {level.level}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      level.status === 'unlocked' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {level.status === 'unlocked' ? 'Unlocked' : 'Locked'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {level.status === 'unlocked' ? level.members : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                    <span className={level.status === 'unlocked' ? 'text-green-600' : 'text-gray-400'}>
                                      {level.status === 'unlocked' ? level.earnings : '-'}
                                    </span>
                                  </td>
                                </tr>
                              )) || Array(20).fill(0).map((_, i) => (
                                <tr key={i} className="bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">Level {i + 1}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Locked
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Team;
