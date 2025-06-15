import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  UserPlus,
  Wallet,
  Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardOverviewProps {
  stats: any;
  isLoading: boolean;
}

export const DashboardOverview = ({ stats, isLoading }: DashboardOverviewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.userCount || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%"
    },
    {
      title: "Active Packages",
      value: stats?.activePackages || 0,
      icon: Package,
      color: "bg-green-500",
      change: "+8%"
    },
    {
      title: "Paid EMIs",
      value: stats?.totalPaidEMIs || 0,
      icon: CreditCard,
      color: "bg-purple-500",
      change: "+15%"
    },
    {
      title: "Total Earnings",
      value: `₹${stats?.totalEarnings?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "bg-amber-500",
      change: "+22%"
    },
    {
      title: "Pending Withdrawals",
      value: stats?.pendingWithdrawals || 0,
      icon: Wallet,
      color: "bg-red-500",
      change: "-5%"
    },
    {
      title: "Total Payouts",
      value: `₹${stats?.totalWithdrawalAmount?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "bg-teal-500",
      change: "+18%"
    },
    {
      title: "Completed Packages",
      value: stats?.completedPackages || 0,
      icon: Activity,
      color: "bg-indigo-500",
      change: "+10%"
    },
    {
      title: "New Signups Today",
      value: stats?.recentSignups?.filter((user: any) => {
        const today = new Date();
        const userDate = new Date(user.createdAt);
        return userDate.toDateString() === today.toDateString();
      }).length || 0,
      icon: UserPlus,
      color: "bg-pink-500",
      change: "+25%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
                <div className="ml-2">
                  <Badge 
                    variant={stat.change.startsWith('+') ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentSignups?.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent signups</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Status</span>
                <Badge variant="default" className="bg-green-500">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge variant="default" className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <Badge variant="default" className="bg-green-500">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <Badge variant="default" className="bg-green-500">Running</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auto Pool</span>
                <Badge variant="default" className="bg-green-500">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">Add User</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium">Add Earning</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Process EMI</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Wallet className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-sm font-medium">Approve Withdrawal</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};