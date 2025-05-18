import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { PackageCard } from "@/components/dashboard/PackageCard";
import { DirectReferrals } from "@/components/dashboard/DirectReferrals";
import { RecentEarnings } from "@/components/dashboard/RecentEarnings";
import { BinaryTree } from "@/components/team/BinaryTree";
import { EarningsBreakdown } from "@/components/earnings/EarningsBreakdown";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user package
  const { data: userPackage, isLoading: packageLoading } = useQuery({
    queryKey: ['/api/packages/me'],
    enabled: isAuthenticated,
  });

  // Fetch earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['/api/earnings/me'],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Loading your dashboard...</h2>
            <div className="w-16 h-16 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Helmet>
        <title>Dashboard - Pelnora Jewellers</title>
        <meta name="description" content="View your Pelnora Jewellers dashboard, monitor your earnings, team growth, and package details." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, <span className="font-medium">{user?.name}</span></p>
            </div>
            
            {/* Stats Cards */}
            <StatsCards user={user} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Package Card */}
              {packageLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-24 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ) : userPackage ? (
                <PackageCard userPackage={userPackage} />
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">No Active Package</h3>
                    <p className="text-gray-600 mb-4">You don't have an active package. Choose a package to start your earnings journey.</p>
                    <button 
                      onClick={() => navigate("/#packages")}
                      className="w-full bg-gold-dark hover:bg-gold text-white font-bold py-2 px-4 rounded-md"
                    >
                      View Packages
                    </button>
                  </CardContent>
                </Card>
              )}
              
              {/* Direct Referrals */}
              <DirectReferrals />
              
              {/* Recent Earnings */}
              <RecentEarnings earnings={earnings} isLoading={earningsLoading} />
            </div>

            {/* Binary Tree & Earnings Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Binary Tree */}
              <BinaryTree compact={true} />
              
              {/* Earnings Breakdown */}
              <EarningsBreakdown earnings={earnings} isLoading={earningsLoading} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
