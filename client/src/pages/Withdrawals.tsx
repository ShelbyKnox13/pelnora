import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowDownCircle, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { insertWithdrawalSchema } from "@shared/schema";
import { Helmet } from "react-helmet";

// Extend the withdrawal schema with form-specific validation
const withdrawalFormSchema = z.object({
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  remarks: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

const Withdrawals = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch withdrawals
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/withdrawals/me'],
    enabled: isAuthenticated,
  });

  // Setup form
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: "",
      remarks: "",
    },
  });

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      const response = await apiRequest('POST', '/api/withdrawals', {
        amount: data.amount,
        remarks: data.remarks || "",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal request submitted",
        description: "Your request has been received and is pending approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawals/me'] });
      form.reset();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit withdrawal",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: WithdrawalFormValues) => {
    // Check if amount is greater than withdrawable amount
    if (user && parseFloat(data.amount) > parseFloat(user.withdrawableAmount)) {
      toast({
        title: "Insufficient balance",
        description: `Your withdrawable amount is ₹${user.withdrawableAmount}`,
        variant: "destructive",
      });
      return;
    }
    
    withdrawalMutation.mutateAsync(data);
  };

  // Format withdrawal status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Loading withdrawal data...</h2>
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
        <title>Withdrawals - Pelnora Jewellers</title>
        <meta name="description" content="Manage your Pelnora Jewellers earnings withdrawals, view transaction history, and request new withdrawals of your available balance." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">Withdrawals</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your earnings withdrawals</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gold-light/20 rounded-md p-3">
                      <ArrowDownCircle className="h-6 w-6 text-gold-dark" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Withdrawable Amount</dt>
                        <dd className="text-3xl font-bold text-gray-900 font-mono">₹{user?.withdrawableAmount || "0.00"}</dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button 
                      onClick={() => setIsFormOpen(!isFormOpen)}
                      className="w-full bg-gold-dark hover:bg-gold text-white font-bold"
                      disabled={parseFloat(user?.withdrawableAmount || "0") <= 0}
                    >
                      {isFormOpen ? "Cancel" : "Request Withdrawal"}
                    </Button>
                  </div>
                  
                  {parseFloat(user?.withdrawableAmount || "0") <= 0 && (
                    <div className="mt-4 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        You don't have any withdrawable amount yet. Continue earning through direct, binary, level, and auto pool income to build your balance.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {isFormOpen && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">Withdrawal Request</CardTitle>
                    <CardDescription>Submit a new withdrawal request</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (₹)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter amount" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter an amount up to ₹{user?.withdrawableAmount || "0.00"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="remarks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Remarks (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any notes for this withdrawal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsFormOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-purple-dark hover:bg-purple text-white"
                            disabled={withdrawalMutation.isPending}
                          >
                            {withdrawalMutation.isPending ? "Submitting..." : "Submit Request"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-medium text-gray-900">Withdrawal History</CardTitle>
                <CardDescription>Track the status of your withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawalsLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-24 mb-2" />
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : withdrawals && withdrawals.length > 0 ? (
                  <div className="space-y-4">
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-bold text-gray-900 mr-3">₹{parseFloat(withdrawal.amount).toFixed(2)}</h4>
                            {getStatusBadge(withdrawal.status)}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            Requested {formatDistanceToNow(new Date(withdrawal.requestDate), { addSuffix: true })}
                          </p>
                          {withdrawal.processedDate && (
                            <p className="text-sm text-gray-500">
                              Processed {formatDistanceToNow(new Date(withdrawal.processedDate), { addSuffix: true })}
                            </p>
                          )}
                          {withdrawal.remarks && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{withdrawal.remarks}"</p>
                          )}
                        </div>
                        <div>
                          {withdrawal.status === 'pending' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Processing
                            </Badge>
                          )}
                          {withdrawal.status === 'approved' && (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          )}
                          {withdrawal.status === 'rejected' && (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <ArrowDownCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No withdrawal history</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't made any withdrawal requests yet.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t px-6 py-4">
                <div className="w-full">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Bank Details for Withdrawals</h4>
                  {user?.bankName ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Bank Name</p>
                        <p className="text-sm font-medium">{user.bankName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="text-sm font-medium">{user.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">IFSC Code</p>
                        <p className="text-sm font-medium">{user.ifscCode}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">
                          You haven't added your bank details yet. Please update your profile to add bank details for withdrawals.
                        </p>
                        <Button variant="link" className="p-0 h-auto text-purple-dark" onClick={() => navigate("/dashboard")}>
                          Update Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Withdrawals;
