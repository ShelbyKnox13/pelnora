import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { EarningsControl } from "@/components/admin/EarningsControl";
import { EMIManager } from "@/components/admin/EMIManager";
import { WithdrawalsPanel } from "@/components/admin/WithdrawalsPanel";
import { AutoPoolManager } from "@/components/admin/AutoPoolManager";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CircleUser, CreditCard, DollarSign, Package, Users } from "lucide-react";
import { Helmet } from "react-helmet";

const Admin = () => {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    enabled: isAuthenticated && isAdmin,
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Loading admin panel...</h2>
            <div className="w-16 h-16 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Panel - Pelnora Jewellers</title>
        <meta name="description" content="Admin control panel for Pelnora Jewellers MLM platform. Manage users, earnings, EMIs, withdrawals, and auto pool settings." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-500">Manage users, earnings, and system operations</p>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-light/20 rounded-md p-3">
                      <CircleUser className="h-6 w-6 text-purple-dark" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-bold text-gray-900">
                          {statsLoading ? "Loading..." : stats?.userCount || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gold-light/20 rounded-md p-3">
                      <Package className="h-6 w-6 text-gold-dark" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Packages</dt>
                        <dd className="text-lg font-bold text-gray-900">
                          {statsLoading ? "Loading..." : stats?.activePackages || 0}
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
                      <CreditCard className="h-6 w-6 text-teal-dark" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Withdrawals</dt>
                        <dd className="text-lg font-bold text-gray-900">
                          {statsLoading ? "Loading..." : stats?.pendingWithdrawals || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Payouts</dt>
                        <dd className="text-lg font-bold text-gray-900 font-mono">
                          {statsLoading ? "Loading..." : `₹${stats?.totalWithdrawalAmount?.toFixed(2) || "0.00"}`}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="users" className="flex gap-2 items-center">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">User Management</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
                <TabsTrigger value="earnings" className="flex gap-2 items-center">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Earnings Control</span>
                  <span className="sm:hidden">Earnings</span>
                </TabsTrigger>
                <TabsTrigger value="emi" className="flex gap-2 items-center">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">EMI Manager</span>
                  <span className="sm:hidden">EMIs</span>
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="flex gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Withdrawals</span>
                  <span className="sm:hidden">Withdraw</span>
                </TabsTrigger>
                <TabsTrigger value="autopool" className="flex gap-2 items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="hidden sm:inline">Auto Pool</span>
                  <span className="sm:hidden">Pool</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="earnings">
                <EarningsControl />
              </TabsContent>
              
              <TabsContent value="emi">
                <EMIManager />
              </TabsContent>
              
              <TabsContent value="withdrawals">
                <WithdrawalsPanel />
              </TabsContent>
              
              <TabsContent value="autopool">
                <AutoPoolManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Admin;
