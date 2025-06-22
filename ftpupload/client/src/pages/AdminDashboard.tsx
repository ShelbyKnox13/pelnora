import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { EarningsControl } from "@/components/admin/EarningsControl";
import { EMIManager } from "@/components/admin/EMIManager";
import { WithdrawalsPanel } from "@/components/admin/WithdrawalsPanel";
import { AutoPoolManager } from "@/components/admin/AutoPoolManager";
import { BinaryTreeManager } from "@/components/admin/BinaryTreeManager";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { KYCManagement } from "@/components/admin/KYCManagement";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  CircleUser, 
  CreditCard, 
  DollarSign, 
  Package, 
  Users, 
  TreePine,
  Settings,
  BarChart3,
  LogOut,
  Shield,
  FileCheck
} from "lucide-react";
import { Helmet } from "react-helmet";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { adminLogout, isLoggingOut } = useAdminAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/admin");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Auto logout after 10 minutes of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        adminLogout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [adminLogout]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && isAdmin,
  });

  const handleLogout = async () => {
    await adminLogout();
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Shield className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Loading admin panel...</h2>
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Pelnora Jewellers</title>
        <meta name="description" content="Admin control panel for Pelnora Jewellers MLM platform. Manage users, earnings, EMIs, withdrawals, and auto pool settings." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full flex items-center justify-center mr-3">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pelnora Admin</h1>
                  <p className="text-xs text-gray-500">Management Panel</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </header>

        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
                <TabsTrigger value="overview" className="flex gap-1 items-center">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex gap-1 items-center">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="kyc" className="flex gap-1 items-center">
                  <FileCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">KYC</span>
                </TabsTrigger>
                <TabsTrigger value="earnings" className="flex gap-1 items-center">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Earnings</span>
                </TabsTrigger>
                <TabsTrigger value="emi" className="flex gap-1 items-center">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">EMI</span>
                </TabsTrigger>
                <TabsTrigger value="binary" className="flex gap-1 items-center">
                  <TreePine className="h-4 w-4" />
                  <span className="hidden sm:inline">Binary</span>
                </TabsTrigger>
                <TabsTrigger value="withdrawals" className="flex gap-1 items-center">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Withdrawals</span>
                </TabsTrigger>
                <TabsTrigger value="autopool" className="flex gap-1 items-center">
                  <CircleUser className="h-4 w-4" />
                  <span className="hidden sm:inline">Auto Pool</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex gap-1 items-center">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <DashboardOverview stats={stats} isLoading={statsLoading} />
              </TabsContent>
              
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="kyc">
                <KYCManagement />
              </TabsContent>
              
              <TabsContent value="earnings">
                <EarningsControl />
              </TabsContent>
              
              <TabsContent value="emi">
                <EMIManager />
              </TabsContent>

              <TabsContent value="binary">
                <BinaryTreeManager />
              </TabsContent>
              
              <TabsContent value="withdrawals">
                <WithdrawalsPanel />
              </TabsContent>
              
              <TabsContent value="autopool">
                <AutoPoolManager />
              </TabsContent>

              <TabsContent value="settings">
                <AdminSettings />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;