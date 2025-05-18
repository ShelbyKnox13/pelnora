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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  XCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export const EMIManager = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch all EMI payments
  const { data: emiPayments, isLoading } = useQuery({
    queryKey: ['/api/emi-payments'],
  });
  
  // Update EMI status mutation
  const updateEMIStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/emi-payments/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "EMI status updated",
        description: "The EMI payment status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emi-payments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update EMI status",
        variant: "destructive",
      });
    },
  });
  
  // Filter EMI payments
  const filteredEMIPayments = emiPayments
    ? emiPayments.filter((emi: any) => {
        // Apply text search
        const textMatch = 
          emi.userId.toString().includes(searchQuery) ||
          (emi.userDetails && emi.userDetails.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (emi.userDetails && emi.userDetails.referralId.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply status filter
        const statusMatch = !statusFilter || emi.status === statusFilter;
        
        return textMatch && statusMatch;
      })
    : [];
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Late</Badge>;
      case 'bonus_earned':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Bonus Earned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Group EMIs by package
  const emisByPackage = emiPayments
    ? emiPayments.reduce((acc: any, emi: any) => {
        const key = emi.packageId;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(emi);
        return acc;
      }, {})
    : {};
  
  // Handle updating EMI status
  const handleUpdateStatus = (id: number, status: string) => {
    updateEMIStatusMutation.mutate({ id, status });
  };
  
  // Export EMIs as CSV
  const exportEMIsCSV = () => {
    if (!emiPayments || emiPayments.length === 0) return;
    
    // Define CSV headers and prepare data
    const headers = 'ID,User ID,User Name,Referral ID,Package ID,Amount,Status,Due Date,Payment Date,Created At\n';
    
    const csvRows = emiPayments.map((emi: any) => {
      return [
        emi.id,
        emi.userId,
        emi.userDetails?.name || '',
        emi.userDetails?.referralId || '',
        emi.packageId,
        emi.amount,
        emi.status,
        emi.dueDate,
        emi.paymentDate || '',
        emi.createdAt
      ].join(',');
    });
    
    // Create CSV content
    const csvContent = headers + csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pelnora_emi_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>EMI Manager</CardTitle>
              <CardDescription>Track and manage package EMI payments</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={exportEMIsCSV}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/emi-payments'] });
                  toast({
                    title: "Data refreshed",
                    description: "EMI payments data has been refreshed",
                  });
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users or IDs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>{statusFilter || "All Statuses"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('paid')}>
                    Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('late')}>
                    Late
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('bonus_earned')}>
                    Bonus Earned
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEMIPayments.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEMIPayments.map((emi: any) => (
                    <TableRow key={emi.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{emi.userDetails?.name || `User ${emi.userId}`}</span>
                          <span className="text-sm text-muted-foreground">{emi.userDetails?.referralId || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">#{emi.packageId}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">₹{parseFloat(emi.amount).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(emi.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(emi.dueDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {emi.paymentDate ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{new Date(emi.paymentDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Not paid</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {emi.status !== 'paid' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(emi.id, 'paid')}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {emi.status !== 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(emi.id, 'pending')}>
                                <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            {emi.status !== 'late' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(emi.id, 'late')}>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Mark as Late
                              </DropdownMenuItem>
                            )}
                            {emi.status !== 'bonus_earned' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(emi.id, 'bonus_earned')}>
                                <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                                Mark Bonus Earned
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No EMI payments found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery || statusFilter
                  ? "Try adjusting your search or filter criteria"
                  : "No EMI payments have been recorded in the system yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};