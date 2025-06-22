import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EARNING_TYPE_COLORS } from "@/lib/constants";
import { ArrowUpRight, BadgeDollarSign, Calculator, DollarSign, Plus, RefreshCcw, Search, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Create earning form schema
const createEarningSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  amount: z.string().min(1, { message: "Amount is required" }).refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  earningType: z.enum(["direct", "binary", "level", "autopool", "emi_bonus"]),
  description: z.string().optional(),
});

type CreateEarningForm = z.infer<typeof createEarningSchema>;

export const EarningsControl = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Fetch all earnings
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ['/api/earnings'],
  });
  
  // Setup form
  const form = useForm<CreateEarningForm>({
    resolver: zodResolver(createEarningSchema),
    defaultValues: {
      userId: "",
      amount: "",
      earningType: "direct",
      description: "",
    },
  });
  
  // Create earning mutation
  const createEarningMutation = useMutation({
    mutationFn: async (data: CreateEarningForm) => {
      const response = await apiRequest('POST', '/api/earnings', {
        userId: parseInt(data.userId),
        amount: data.amount,
        earningType: data.earningType,
        description: data.description || `Manual ${data.earningType} income added by admin`,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Earning created",
        description: "The earning has been added successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/earnings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add earning",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: CreateEarningForm) => {
    createEarningMutation.mutate(data);
  };
  
  // Process earnings data for charts
  const processEarningsData = () => {
    if (!earnings || earnings.length === 0) return { byType: [], byDay: [] };
    
    // Earnings by type
    const earningsByType = {
      direct: 0,
      binary: 0,
      level: 0,
      autopool: 0,
      emi_bonus: 0,
    };
    
    // Earnings by day (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const earningsByDay: { [key: string]: any } = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      earningsByDay[dateStr] = {
        date: dateStr,
        amount: 0,
        count: 0,
      };
    }
    
    earnings.forEach((earning: any) => {
      // Add to earnings by type
      earningsByType[earning.earningType] += parseFloat(earning.amount);
      
      // Add to earnings by day
      const earningDate = new Date(earning.createdAt).toISOString().split('T')[0];
      if (earningsByDay[earningDate]) {
        earningsByDay[earningDate].amount += parseFloat(earning.amount);
        earningsByDay[earningDate].count += 1;
      }
    });
    
    // Convert to array format for charts
    const byType = Object.keys(earningsByType).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value: earningsByType[type],
      color: EARNING_TYPE_COLORS[type]?.color || '#cccccc',
    }));
    
    const byDay = Object.values(earningsByDay).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return { byType, byDay };
  };
  
  const chartData = processEarningsData();
  
  // Filter users by search query
  const filteredUsers = users
    ? users.filter((user: any) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.referralId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Filter earnings for selected user
  const userEarnings = earnings
    ? selectedUserId
      ? earnings.filter((earning: any) => earning.userId === parseInt(selectedUserId))
      : earnings
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Earnings Control</CardTitle>
              <CardDescription>Manage and monitor all earnings in the system</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Earning</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Earning</DialogTitle>
                    <DialogDescription>
                      Manually add earnings to a user's account
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {usersLoading ? (
                                  <div className="p-2">Loading users...</div>
                                ) : users?.length > 0 ? (
                                  users.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.name} ({user.referralId})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2">No users found</div>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter amount" 
                                {...field} 
                                type="number"
                                step="0.01"
                                min="0"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="earningType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Earning Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="direct">Direct Income</SelectItem>
                                <SelectItem value="binary">Binary Income</SelectItem>
                                <SelectItem value="level">Level Income</SelectItem>
                                <SelectItem value="autopool">Auto Pool Income</SelectItem>
                                <SelectItem value="emi_bonus">EMI Bonus</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter description or reason for this earning"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createEarningMutation.isPending}
                        >
                          {createEarningMutation.isPending ? "Adding..." : "Add Earning"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/earnings'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/users'] });
                  toast({
                    title: "Data refreshed",
                    description: "Earnings data has been refreshed",
                  });
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {/* Earnings Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <h3 className="text-2xl font-bold font-mono mt-1">
                          {earningsLoading ? (
                            <Skeleton className="h-8 w-24" />
                          ) : (
                            `₹${chartData.byType.reduce((sum, item) => sum + item.value, 0).toFixed(2)}`
                          )}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-purple-light/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-purple-dark" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                        <h3 className="text-2xl font-bold mt-1">
                          {earningsLoading ? (
                            <Skeleton className="h-8 w-24" />
                          ) : (
                            earnings?.length || 0
                          )}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-gold-light/10 rounded-full flex items-center justify-center">
                        <BadgeDollarSign className="h-6 w-6 text-gold-dark" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Per User</p>
                        <h3 className="text-2xl font-bold font-mono mt-1">
                          {earningsLoading || usersLoading ? (
                            <Skeleton className="h-8 w-24" />
                          ) : (
                            users && users.length > 0 ? 
                            `₹${(chartData.byType.reduce((sum, item) => sum + item.value, 0) / users.length).toFixed(2)}` :
                            '₹0.00'
                          )}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-teal-light/10 rounded-full flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-teal-dark" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                        <h3 className="text-2xl font-bold font-mono mt-1">
                          {earningsLoading ? (
                            <Skeleton className="h-8 w-24" />
                          ) : (
                            earnings ? 
                            `₹${earnings.filter((e: any) => {
                              const date = new Date(e.createdAt);
                              const now = new Date();
                              const diff = now.getTime() - date.getTime();
                              return diff <= 24 * 60 * 60 * 1000;
                            }).reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0).toFixed(2)}` :
                            '₹0.00'
                          )}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Earnings Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Distribution</CardTitle>
                    <CardDescription>Breakdown by income type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {earningsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-t-transparent border-gold-dark rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading chart data...</p>
                        </div>
                      </div>
                    ) : chartData.byType.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData.byType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.byType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No earnings data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Earnings</CardTitle>
                    <CardDescription>Transaction volume over the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {earningsLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-t-transparent border-gold-dark rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading chart data...</p>
                        </div>
                      </div>
                    ) : chartData.byDay.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.byDay}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(date) => {
                                const d = new Date(date);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                              }}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                              labelFormatter={(label) => {
                                const d = new Date(label);
                                return d.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                              }}
                            />
                            <Legend />
                            <Bar dataKey="amount" name="Amount (₹)" fill="#D4AF37" />
                            <Bar dataKey="count" name="Transactions" fill="#4A154B" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No earnings data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select 
                  value={selectedUserId || ""}
                  onValueChange={(value) => setSelectedUserId(value || null)}
                >
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Users</SelectItem>
                    {filteredUsers.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.referralId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-border">
                        {earningsLoading || usersLoading ? (
                          Array(5).fill(0).map((_, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                              <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                              <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                            </tr>
                          ))
                        ) : userEarnings.length > 0 ? (
                          userEarnings.map((earning: any) => {
                            const earningUser = users?.find((u: any) => u.id === earning.userId);
                            return (
                              <tr key={earning.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm">
                                  <div>{new Date(earning.createdAt).toLocaleDateString()}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {earningUser ? (
                                    <div>
                                      <div className="font-medium">{earningUser.name}</div>
                                      <div className="text-xs text-muted-foreground">{earningUser.referralId}</div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">User ID: {earning.userId}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant="outline"
                                    className={`${EARNING_TYPE_COLORS[earning.earningType]?.bg} ${EARNING_TYPE_COLORS[earning.earningType]?.text}`}
                                  >
                                    {earning.earningType.charAt(0).toUpperCase() + earning.earningType.slice(1).replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                                  {earning.description || `${earning.earningType.charAt(0).toUpperCase() + earning.earningType.slice(1).replace('_', ' ')} income`}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-mono font-medium text-green-600">
                                  +₹{parseFloat(earning.amount).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                              No earnings found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedUserId 
                      ? `Showing ${userEarnings.length} earnings for selected user`
                      : `Showing ${userEarnings.length} earnings in total`
                    }
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled>Next</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Settings</CardTitle>
                  <CardDescription>Configure system-wide earning parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Income Percentages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Direct Income</label>
                          <div className="flex items-center w-32">
                            <Input type="number" value="5" min="0" max="100" className="text-right" />
                            <span className="ml-2">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Binary Income</label>
                          <div className="flex items-center w-32">
                            <Input type="number" value="5" min="0" max="100" className="text-right" />
                            <span className="ml-2">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Level Income (% of Binary)</label>
                          <div className="flex items-center w-32">
                            <Input type="number" value="62" min="0" max="100" className="text-right" />
                            <span className="ml-2">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Company Deduction</label>
                          <div className="flex items-center w-32">
                            <Input type="number" value="10" min="0" max="100" className="text-right" />
                            <span className="ml-2">%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Auto Pool Contribution</label>
                          <div className="flex items-center w-32">
                            <Input type="number" value="2.5" min="0" max="100" step="0.1" className="text-right" />
                            <span className="ml-2">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Auto Pool Eligibility</label>
                          <div className="flex items-center w-32">
                            <Input type="number" value="10000" min="0" className="text-right" />
                            <span className="ml-2">₹</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Auto Pool Matrix</label>
                          <div className="flex items-center gap-1 w-32">
                            <Input type="number" value="1" min="1" max="10" className="text-right" />
                            <span>:</span>
                            <Input type="number" value="3" min="1" max="10" className="text-right" />
                            <span>:</span>
                            <Input type="number" value="9" min="1" max="20" className="text-right" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-purple-dark hover:bg-purple">Save Changes</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Level Income Distribution</CardTitle>
                  <CardDescription>Configure percentage distribution across 20 levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <label className="text-sm">Level {i + 1}</label>
                        <div className="flex items-center w-20">
                          <Input 
                            type="number" 
                            value={((20 - i) * 0.25).toFixed(2)} 
                            min="0" 
                            max="100" 
                            step="0.01" 
                            className="text-right text-sm" 
                          />
                          <span className="ml-1">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
                  <Button variant="outline">Reset to Default</Button>
                  <Button className="bg-purple-dark hover:bg-purple">Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};
