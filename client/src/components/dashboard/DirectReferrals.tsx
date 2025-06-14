import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDistanceToNow } from 'date-fns';
import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  referralId: string;
  referredBy?: string;
  isActive: boolean;
  createdAt: string;
}

export const DirectReferrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Fetch direct referrals
  const { data: directReferrals, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/referrals/me'],
    enabled: !!user, // Fetch for any authenticated user
  });

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleCopyReferralId = async () => {
    if (user?.referralId) {
      await navigator.clipboard.writeText(user.referralId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${user?.referralId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Pelnora Jewellers',
          text: 'Join me on Pelnora Jewellers and start your journey to financial freedom!',
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Direct Referrals</h3>
        {usersLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : directReferrals && directReferrals.length > 0 ? (
          <>
            <ul className="divide-y divide-gray-200 mb-4">
              {directReferrals.slice(0, 3).map((referral: User) => (
                <li key={referral.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(referral.name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{referral.name}</p>
                      <p className="text-xs text-gray-500">
                        Joined {formatDistanceToNow(new Date(referral.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    referral.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {referral.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
            
            {/* Referral ID and Link Section */}
            {user && (
              <div className="mt-4 mb-4 space-y-3">
                <div className="p-3 bg-gradient-to-r from-purple-50 to-amber-50 rounded-md border border-purple-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Your Referral ID:</p>
                      <p className="text-sm font-bold text-purple-800">{user.referralId}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyReferralId}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareReferralLink}
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Referral Link
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No direct referrals yet</h3>
            <p className="mt-1 text-sm text-gray-500">Share your referral code to start building your team.</p>
            {user && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Your Referral ID:</p>
                    <p className="text-sm font-bold text-purple-800">{user.referralId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyReferralId}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareReferralLink}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Referral Link
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* View all referrals link - shown when there are referrals */}
        {directReferrals && directReferrals.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <Link href="/team" className="text-purple-700 hover:text-purple-800 font-medium text-sm flex items-center justify-center">
              View all referrals ({directReferrals.length})
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
