import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDistanceToNow } from 'date-fns';

export const DirectReferrals = () => {
  const { user } = useAuth();
  
  // Fetch users for referrals
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    enabled: user?.role === 'admin', // Only admins can fetch all users
  });
  
  // Filter direct referrals (users referred by current user)
  const directReferrals = allUsers?.filter(
    (referral) => referral.referredBy === user?.id
  ) || [];

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
        ) : directReferrals.length > 0 ? (
          <ul className="divide-y divide-gray-200 mb-4">
            {directReferrals.slice(0, 4).map((referral) => (
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
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500">Your Referral ID:</p>
                <p className="text-sm font-bold text-purple-dark">{user.referralId}</p>
              </div>
            )}
          </div>
        )}
        {directReferrals.length > 0 && (
          <Link href="/team" className="text-purple-dark hover:text-purple font-medium text-sm flex items-center">
            View all referrals
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};
