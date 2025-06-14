import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EarningsBreakdown } from "@/components/earnings/EarningsBreakdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { EARNING_TYPE_COLORS } from "@/lib/constants";
import { Helmet } from "react-helmet";

const Earnings = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

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
            <h2 className="text-2xl font-semibold mb-4">Loading your earnings data...</h2>
            <div className="w-16 h-16 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Transform earnings data for charts
  const getEarningsByType = () => {
    if (!earnings || !earnings.length) return [];
    
    const earningsByType = {
      direct: 0,
      binary: 0,
      level: 0,
      autopool: 0,
      emi_bonus: 0,
    };
    
    earnings.forEach((earning) => {
      const amount = parseFloat(earning.amount);
      earningsByType[earning.earningType] += amount;
    });
    
    return Object.keys(earningsByType).map((type) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value: earningsByType[type],
      color: EARNING_TYPE_COLORS[type]?.color || '#000000',
    }));
  };

  const getEarningsByMonth = () => {
    if (!earnings || !earnings.length) return [];
    
    const now = new Date();
    const months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        direct: 0,
        binary: 0,
        level: 0,
        autopool: 0,
        emi_bonus: 0,
      });
    }
    
    earnings.forEach((earning) => {
      const earningDate = new Date(earning.createdAt);
      const month = earningDate.toLocaleString('default', { month: 'short' });
      const year = earningDate.getFullYear();
      
      const monthData = months.find(m => m.month === month && m.year === year);
      if (monthData) {
        const amount = parseFloat(earning.amount);
        monthData[earning.earningType] += amount;
      }
    });
    
    return months;
  };

  const earningsByType = getEarningsByType();
  const earningsByMonth = getEarningsByMonth();

  return (
    <>
      <Helmet>
        <title>My Earnings - Pelnora Jewellers</title>
        <meta name="description" content="Track your earnings from Pelnora Jewellers MLM program, including direct, binary, level, and auto pool income." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">My Earnings</h1>
              <p className="mt-1 text-sm text-gray-500">Track and analyze your income streams</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Object.entries(EARNING_TYPE_COLORS).map(([type, colors]) => (
                <Card key={type} className="bg-white shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${colors.bg} rounded-md p-3`}>
                        <svg className={`h-6 w-6 ${colors.text}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Income
                          </dt>
                          <dd>
                            <div className="text-lg font-bold text-gray-900 font-mono">
                              {earningsLoading 
                                ? "..." 
                                : `₹${earningsByType.find(e => e.name.toLowerCase() === type.replace('_', ' '))?.value.toFixed(2) || "0.00"}`}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Tabs defaultValue="breakdown" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="breakdown">Earnings Breakdown</TabsTrigger>
                <TabsTrigger value="history">Earnings History</TabsTrigger>
                <TabsTrigger value="charts">Earnings Charts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="breakdown" className="mt-6">
                <EarningsBreakdown earnings={earnings} isLoading={earningsLoading} detailed={true} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">Transaction History</CardTitle>
                    <CardDescription>Complete record of all your earnings</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {earningsLoading ? (
                      <div className="text-center py-10">
                        <div className="w-12 h-12 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading transaction history...</p>
                      </div>
                    ) : earnings && earnings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {earnings.map((earning) => (
                              <tr key={earning.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div>{new Date(earning.createdAt).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EARNING_TYPE_COLORS[earning.earningType]?.bg} ${EARNING_TYPE_COLORS[earning.earningType]?.text}`}>
                                    {earning.earningType.charAt(0).toUpperCase() + earning.earningType.slice(1).replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {earning.description || `${earning.earningType.charAt(0).toUpperCase() + earning.earningType.slice(1).replace('_', ' ')} earnings`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium text-green-600">
                                  +₹{parseFloat(earning.amount).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Start referring members or complete EMI payments to earn income.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="charts" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-medium text-gray-900">Earnings Distribution</CardTitle>
                      <CardDescription>Breakdown of earnings by income type</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {earningsLoading ? (
                        <div className="text-center py-10">
                          <div className="w-12 h-12 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-500">Loading chart data...</p>
                        </div>
                      ) : earningsByType.length > 0 ? (
                        <div className="w-full" style={{ height: "300px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={earningsByType}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {earningsByType.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">No earnings data available to display.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-medium text-gray-900">Monthly Earnings</CardTitle>
                      <CardDescription>Earnings trend over the past 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {earningsLoading ? (
                        <div className="text-center py-10">
                          <div className="w-12 h-12 border-4 border-gold-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-500">Loading chart data...</p>
                        </div>
                      ) : earningsByMonth.length > 0 ? (
                        <div className="w-full" style={{ height: "300px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={earningsByMonth}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                              <Legend />
                              <Bar dataKey="direct" stackId="a" name="Direct" fill={EARNING_TYPE_COLORS.direct.color} />
                              <Bar dataKey="binary" stackId="a" name="Binary" fill={EARNING_TYPE_COLORS.binary.color} />
                              <Bar dataKey="level" stackId="a" name="Level" fill={EARNING_TYPE_COLORS.level.color} />
                              <Bar dataKey="autopool" stackId="a" name="Auto Pool" fill={EARNING_TYPE_COLORS.autopool.color} />
                              <Bar dataKey="emi_bonus" stackId="a" name="EMI Bonus" fill={EARNING_TYPE_COLORS.emi_bonus.color} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">No monthly earnings data available to display.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Earnings;
