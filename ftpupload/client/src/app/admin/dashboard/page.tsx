'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Package,
  CreditCard,
  IndianRupee,
  Wallet,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface DashboardStats {
  totalUsers: number;
  totalActiveUsers: number;
  totalDirectReferrals: number;
  totalIncomePaid: number;
  totalWithdrawalsProcessed: number;
  poolParticipantsCount: number;
  monthlyData: any[];
  packageDistribution: any[];
  emiStatusCounts: any[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalActiveUsers: 0,
    totalDirectReferrals: 0,
    totalIncomePaid: 0,
    totalWithdrawalsProcessed: 0,
    poolParticipantsCount: 0,
    monthlyData: [],
    packageDistribution: [],
    emiStatusCounts: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = Cookies.get('adminAuthenticated');
      const lastActivity = Cookies.get('adminLastActivity');
      
      if (!adminAuth || !lastActivity) {
        router.push('/admin');
        return false;
      }

      // Check for session timeout (10 minutes)
      const lastActivityTime = parseInt(lastActivity);
      if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
        Cookies.remove('adminAuthenticated');
        Cookies.remove('adminLastActivity');
        router.push('/admin');
        return false;
      }

      // Update last activity timestamp
      Cookies.set('adminLastActivity', Date.now().toString(), { expires: 1 });
      return true;
    };

    const fetchDashboardData = async () => {
      if (!checkAuth()) return;

      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(checkAuth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [router]);

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Users',
      value: stats.totalActiveUsers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Direct Referrals',
      value: stats.totalDirectReferrals,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Income',
      value: `₹${stats.totalIncomePaid.toLocaleString()}`,
      icon: IndianRupee,
      color: 'bg-yellow-500',
    },
    {
      name: 'Total Withdrawals',
      value: `₹${stats.totalWithdrawalsProcessed.toLocaleString()}`,
      icon: Wallet,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {stats.recentActivity.map((activity) => (
              <li key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">{activity.description}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {activity.type}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 