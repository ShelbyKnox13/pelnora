import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { Link } from "wouter";
import { EARNING_TYPE_COLORS } from "@/lib/constants";
import { Earning } from "@shared/schema";

interface RecentEarningsProps {
  earnings?: Earning[];
  isLoading: boolean;
}

export const RecentEarnings = ({ earnings, isLoading }: RecentEarningsProps) => {
  // Format earning type for display
  const formatEarningType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Earnings</h3>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : earnings && earnings.length > 0 ? (
          <ul className="divide-y divide-gray-200 mb-4">
            {earnings.slice(0, 5).map((earning) => (
              <li key={earning.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatEarningType(earning.earningType)} Income
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <span className="text-sm font-medium text-green-600 font-mono">
                  +₹{parseFloat(earning.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings yet</h3>
            <p className="mt-1 text-sm text-gray-500">Your earnings will appear here as you start making money.</p>
          </div>
        )}
        {earnings && earnings.length > 0 && (
          <Link href="/earnings" className="text-purple-dark hover:text-purple font-medium text-sm flex items-center">
            View all transactions
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};
