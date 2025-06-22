import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface BinaryTreeProps {
  data?: any;
  isLoading?: boolean;
  compact?: boolean;
}

export const BinaryTree = ({ data, isLoading = false, compact = false }: BinaryTreeProps) => {
  const { user } = useAuth();

  const renderSVGTree = () => {
    const leftMembers = data?.downline?.filter((member: any) => member.position === 'left') || [];
    const rightMembers = data?.downline?.filter((member: any) => member.position === 'right') || [];
    
    return (
      <svg width="320" height="200" viewBox="0 0 320 200">
        {/* Root - Current User */}
        <circle cx="160" cy="30" r="20" className="tree-node active-node" />
        <text x="160" y="35" textAnchor="middle" className="text-white font-medium text-xs">You</text>
        
        {/* Left Side */}
        {leftMembers.length > 0 && (
          <>
            <path d="M145,45 L100,75" className="tree-connector" />
            <circle cx="85" cy="90" r="20" className="tree-node active-node" />
            <text x="85" y="95" textAnchor="middle" className="text-white font-medium text-xs">
              {leftMembers[0].name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </text>
          </>
        )}
        
        {/* Right Side */}
        {rightMembers.length > 0 && (
          <>
            <path d="M175,45 L220,75" className="tree-connector" />
            <circle cx="235" cy="90" r="20" className="tree-node active-node" />
            <text x="235" y="95" textAnchor="middle" className="text-white font-medium text-xs">
              {rightMembers[0].name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </text>
          </>
        )}
        
        {/* Show empty slots if no members */}
        {leftMembers.length === 0 && (
          <>
            <path d="M145,45 L100,75" className="tree-connector" stroke-dasharray="5,5" />
            <circle cx="85" cy="90" r="20" className="tree-node" />
            <text x="85" y="95" textAnchor="middle" className="text-purple-dark font-medium text-xs">?</text>
          </>
        )}
        
        {rightMembers.length === 0 && (
          <>
            <path d="M175,45 L220,75" className="tree-connector" stroke-dasharray="5,5" />
            <circle cx="235" cy="90" r="20" className="tree-node" />
            <text x="235" y="95" textAnchor="middle" className="text-purple-dark font-medium text-xs">?</text>
          </>
        )}
      </svg>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Binary Team Structure</h3>
          <div className="flex justify-center">
            {renderSVGTree()}
          </div>
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Left Team</p>
              <p className="text-lg font-bold text-gray-900">{data?.leftTeamCount || 0} members</p>
              <p className="text-xs font-medium text-green-600 mt-1">Business Volume</p>
              <p className="text-xs font-medium text-green-600">₹{data?.leftTeamBusiness || 0}</p>
              <p className="text-xs font-medium text-amber-600">Carry Forward</p>
              <p className="text-xs font-medium text-amber-600">₹{data?.leftCarryForward || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Right Team</p>
              <p className="text-lg font-bold text-gray-900">{data?.rightTeamCount || 0} members</p>
              <p className="text-xs font-medium text-green-600 mt-1">Business Volume</p>
              <p className="text-xs font-medium text-green-600">₹{data?.rightTeamBusiness || 0}</p>
              <p className="text-xs font-medium text-amber-600">Carry Forward</p>
              <p className="text-xs font-medium text-amber-600">₹{data?.rightCarryForward || 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/team" className="text-purple-dark hover:text-purple font-medium text-sm flex items-center justify-center">
              View full binary tree
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-900">Binary Organization</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-60 w-full rounded-md" />
            <div className="flex justify-between">
              <Skeleton className="h-14 w-28" />
              <Skeleton className="h-14 w-28" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <style jsx global>{`
                .tree-connector {
                  stroke: #D4AF37;
                  stroke-width: 2;
                  fill: none;
                }
                .tree-node {
                  stroke: #4A154B;
                  stroke-width: 2;
                  fill: white;
                }
                .active-node {
                  fill: #D4AF37;
                }
              `}</style>
              
              <div className="relative py-8 max-w-4xl mx-auto">
                {data?.downline && data.downline.length > 0 ? (
                  <div className="text-center">
                    <div className="inline-block bg-white p-6 rounded-lg shadow-lg border-2 border-gold-dark">
                      <div className="text-lg font-bold text-purple-dark mb-4">You</div>
                      <div className="flex justify-center space-x-8">
                        {/* Left Team */}
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">Left Team</div>
                          <div className="space-y-2">
                            {data.downline
                              .filter((member: any) => member.position === 'left')
                              .slice(0, 5)
                              .map((member: any, index: number) => (
                                <div key={member.id} className="bg-green-100 p-2 rounded border border-green-300">
                                  <div className="text-sm font-medium text-green-800">{member.name}</div>
                                  <div className="text-xs text-green-600">Level {member.level}</div>
                                </div>
                              ))}
                            {data.downline.filter((member: any) => member.position === 'left').length === 0 && (
                              <div className="bg-gray-100 p-2 rounded border border-gray-300 text-gray-500">
                                No members
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Right Team */}
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">Right Team</div>
                          <div className="space-y-2">
                            {data.downline
                              .filter((member: any) => member.position === 'right')
                              .slice(0, 5)
                              .map((member: any, index: number) => (
                                <div key={member.id} className="bg-blue-100 p-2 rounded border border-blue-300">
                                  <div className="text-sm font-medium text-blue-800">{member.name}</div>
                                  <div className="text-xs text-blue-600">Level {member.level}</div>
                                </div>
                              ))}
                            {data.downline.filter((member: any) => member.position === 'right').length === 0 && (
                              <div className="bg-gray-100 p-2 rounded border border-gray-300 text-gray-500">
                                No members
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-block bg-white p-6 rounded-lg shadow-lg border-2 border-gold-dark">
                      <div className="text-lg font-bold text-purple-dark mb-4">You</div>
                      <div className="flex justify-center space-x-8">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">Left Team</div>
                          <div className="bg-gray-100 p-4 rounded border border-gray-300 text-gray-500">
                            No members yet
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600 mb-2">Right Team</div>
                          <div className="bg-gray-100 p-4 rounded border border-gray-300 text-gray-500">
                            No members yet
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-600">
                        Share your referral link to start building your team!
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-around w-full mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                <div>
                  <h4 className="font-bold text-lg text-charcoal mb-2">Left Team</h4>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-purple-dark mr-1">{data?.leftTeamCount || 0}</span>
                    <span className="text-gray-500">members</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-600">Business Volume</div>
                    <div className="text-xl font-bold text-green-600">₹{data?.leftTeamBusiness || 0}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-600">Carry Forward</div>
                    <div className="text-lg font-bold text-amber-600">₹{data?.leftCarryForward || 0}</div>
                  </div>
                </div>
                <div className="border-l border-gray-200 pl-8">
                  <h4 className="font-bold text-lg text-charcoal mb-2">Right Team</h4>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-purple-dark mr-1">{data?.rightTeamCount || 0}</span>
                    <span className="text-gray-500">members</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-600">Business Volume</div>
                    <div className="text-xl font-bold text-green-600">₹{data?.rightTeamBusiness || 0}</div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-600">Carry Forward</div>
                    <div className="text-lg font-bold text-amber-600">₹{data?.rightCarryForward || 0}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center w-full bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Binary Income Earning Potential</h4>
                <p className="text-sm text-gray-600">
                  Your binary income is calculated based on matching volume between your left and right teams.
                  The first binary match uses a 2:1 or 1:2 ratio, while subsequent matches use a 1:1 ratio.
                  All matching pairs earn 5% commission on the weaker leg's business volume.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
