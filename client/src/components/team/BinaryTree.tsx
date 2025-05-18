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
    return (
      <svg width="320" height="200" viewBox="0 0 320 200">
        {/* Level 1 */}
        <circle cx="160" cy="30" r="20" className="tree-node active-node" />
        <text x="160" y="35" textAnchor="middle" className="text-white font-medium text-xs">You</text>
        
        {/* Level 2 - Left */}
        <path d="M145,45 L100,75" className="tree-connector" />
        <circle cx="85" cy="90" r="20" className="tree-node active-node" />
        <text x="85" y="95" textAnchor="middle" className="text-white font-medium text-xs">A</text>
        
        {/* Level 2 - Right */}
        <path d="M175,45 L220,75" className="tree-connector" />
        <circle cx="235" cy="90" r="20" className="tree-node active-node" />
        <text x="235" y="95" textAnchor="middle" className="text-white font-medium text-xs">B</text>
        
        {/* Level 3 - Left-Left */}
        <path d="M70,105 L35,135" className="tree-connector" />
        <circle cx="20" cy="150" r="20" className="tree-node active-node" />
        <text x="20" y="155" textAnchor="middle" className="text-white font-medium text-xs">C</text>
        
        {/* Level 3 - Left-Right */}
        <path d="M100,105 L135,135" className="tree-connector" />
        <circle cx="150" cy="150" r="20" className="tree-node active-node" />
        <text x="150" y="155" textAnchor="middle" className="text-white font-medium text-xs">D</text>
        
        {/* Level 3 - Right-Left */}
        <path d="M220,105 L185,135" className="tree-connector" />
        <circle cx="170" cy="150" r="20" className="tree-node active-node" />
        <text x="170" y="155" textAnchor="middle" className="text-white font-medium text-xs">E</text>
        
        {/* Level 3 - Right-Right */}
        <path d="M250,105 L285,135" className="tree-connector" />
        <circle cx="300" cy="150" r="20" className="tree-node" />
        <text x="300" y="155" textAnchor="middle" className="text-purple-dark font-medium text-xs">?</text>
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
              <p className="text-lg font-bold text-gray-900">{user?.leftTeamCount || 0} members</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Right Team</p>
              <p className="text-lg font-bold text-gray-900">{user?.rightTeamCount || 0} members</p>
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
                <svg width="800" height="400" viewBox="0 0 800 400" className="mx-auto">
                  {/* Level 1 */}
                  <circle cx="400" cy="50" r="30" className="tree-node active-node" />
                  <text x="400" y="55" textAnchor="middle" className="text-white font-medium">You</text>
                  
                  {/* Level 2 */}
                  <path d="M380,75 L280,125" className="tree-connector" />
                  <circle cx="250" cy="150" r="30" className="tree-node active-node" />
                  <text x="250" y="155" textAnchor="middle" className="text-white font-medium">L1</text>
                  
                  <path d="M420,75 L520,125" className="tree-connector" />
                  <circle cx="550" cy="150" r="30" className="tree-node active-node" />
                  <text x="550" y="155" textAnchor="middle" className="text-white font-medium">R1</text>
                  
                  {/* Level 3 - Left Side */}
                  <path d="M230,175 L180,225" className="tree-connector" />
                  <circle cx="150" cy="250" r="30" className="tree-node active-node" />
                  <text x="150" y="255" textAnchor="middle" className="text-white font-medium">LL1</text>
                  
                  <path d="M270,175 L320,225" className="tree-connector" />
                  <circle cx="350" cy="250" r="30" className="tree-node active-node" />
                  <text x="350" y="255" textAnchor="middle" className="text-white font-medium">LR1</text>
                  
                  {/* Level 3 - Right Side */}
                  <path d="M530,175 L480,225" className="tree-connector" />
                  <circle cx="450" cy="250" r="30" className="tree-node active-node" />
                  <text x="450" y="255" textAnchor="middle" className="text-white font-medium">RL1</text>
                  
                  <path d="M570,175 L620,225" className="tree-connector" />
                  <circle cx="650" cy="250" r="30" className="tree-node" />
                  <text x="650" y="255" textAnchor="middle" className="text-purple-dark font-medium">?</text>
                  
                  {/* Level 4 - Left Left Side */}
                  <path d="M130,275 L105,325" className="tree-connector" />
                  <circle cx="90" cy="350" r="25" className="tree-node active-node" />
                  <text x="90" y="354" textAnchor="middle" className="text-white font-medium text-xs">LLL</text>
                  
                  <path d="M170,275 L195,325" className="tree-connector" />
                  <circle cx="210" cy="350" r="25" className="tree-node" />
                  <text x="210" y="354" textAnchor="middle" className="text-purple-dark font-medium text-xs">?</text>
                  
                  {/* Level 4 - Left Right Side */}
                  <path d="M330,275 L305,325" className="tree-connector" />
                  <circle cx="290" cy="350" r="25" className="tree-node active-node" />
                  <text x="290" y="354" textAnchor="middle" className="text-white font-medium text-xs">LRL</text>
                  
                  <path d="M370,275 L395,325" className="tree-connector" />
                  <circle cx="410" cy="350" r="25" className="tree-node active-node" />
                  <text x="410" y="354" textAnchor="middle" className="text-white font-medium text-xs">LRR</text>
                  
                  {/* Level 4 - Right Left Side */}
                  <path d="M430,275 L405,325" className="tree-connector" />
                  <circle cx="390" cy="350" r="25" className="tree-node" />
                  <text x="390" y="354" textAnchor="middle" className="text-purple-dark font-medium text-xs">?</text>
                  
                  <path d="M470,275 L495,325" className="tree-connector" />
                  <circle cx="510" cy="350" r="25" className="tree-node" />
                  <text x="510" y="354" textAnchor="middle" className="text-purple-dark font-medium text-xs">?</text>
                </svg>
              </div>
              
              <div className="flex justify-around w-full mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                <div>
                  <h4 className="font-bold text-lg text-charcoal mb-2">Left Team</h4>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-purple-dark mr-1">{user?.leftTeamCount || 0}</span>
                    <span className="text-gray-500">members</span>
                  </div>
                </div>
                <div className="border-l border-gray-200 pl-8">
                  <h4 className="font-bold text-lg text-charcoal mb-2">Right Team</h4>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-purple-dark mr-1">{user?.rightTeamCount || 0}</span>
                    <span className="text-gray-500">members</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center w-full bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Binary Income Earning Potential</h4>
                <p className="text-sm text-gray-600">
                  Your binary income is calculated based on matching volume between your left and right teams.
                  For every matched pair (1:2 or 2:1 ratio), you earn 5% commission.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
