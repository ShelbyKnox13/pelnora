import { Card, CardContent } from "@/components/ui/card";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign,
  Users,
  Shield,
  CreditCard
} from "lucide-react";
import { Link } from "wouter";

interface StatsCardsProps {
  user: User | null;
}

export const StatsCards = ({ user }: StatsCardsProps) => {
  // Fetch earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['/api/earnings/me'],
    enabled: !!user,
  });

  // Calculate total earnings amount
  const totalEarnings = user?.totalEarnings || "0";
  
  // Calculate withdrawable amount
  const withdrawableAmount = user?.withdrawableAmount || "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gold-light/20 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-gold-dark" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    ₹{parseFloat(totalEarnings).toLocaleString()}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/earnings" className="font-medium text-gold-dark hover:text-gold">
              View details
            </Link>
          </div>
        </div>
      </Card>

      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-light/20 rounded-md p-3">
              <Users className="h-6 w-6 text-purple-dark" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900">
                    {user ? (user.leftTeamCount + user.rightTeamCount) : <Skeleton className="h-7 w-16" />}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/team" className="font-medium text-purple-dark hover:text-purple">
              View team
            </Link>
          </div>
        </div>
      </Card>

      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-teal-light/20 rounded-md p-3">
              <Shield className="h-6 w-6 text-teal-dark" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Unlocked Levels</dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900">
                    {user ? `${user.unlockedLevels}/20` : <Skeleton className="h-7 w-16" />}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/team?tab=levels" className="font-medium text-teal-dark hover:text-teal">
              Level details
            </Link>
          </div>
        </div>
      </Card>

      <Card className="bg-white overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gold-light/20 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-gold-dark" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Withdrawable</dt>
                <dd>
                  <div className="text-lg font-bold text-gray-900 font-mono">
                    ₹{parseFloat(withdrawableAmount).toLocaleString()}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href="/withdrawals" className="font-medium text-gold-dark hover:text-gold">
              Withdraw
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
