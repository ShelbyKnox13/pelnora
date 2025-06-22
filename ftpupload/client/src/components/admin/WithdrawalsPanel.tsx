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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const WithdrawalsPanel = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Fetch all withdrawals
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['/api/withdrawals'],
  });
  
  // Update withdrawal status mutation
  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      const response = await apiRequest('PATCH', `/api/withdrawals/${id}`, { 
        status,
        rejectionReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal updated",
        description: "The withdrawal status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawals'] });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update withdrawal status",
        variant: "destructive",
      });
    },
  });
  
  // Filter withdrawals
  const filteredWithdrawals = withdrawals
    ? withdrawals.filter((withdrawal: any) => {
        // Apply text search
        const textMatch = 
          withdrawal.userId.toString().includes(searchQuery) ||
          (withdrawal.userDetails && withdrawal.userDetails.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (withdrawal.userDetails && withdrawal.userDetails.referralId.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (withdrawal.bankDetails && withdrawal.bankDetails.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply status filter
        const statusMatch = !statusFilter || withdrawal.status === statusFilter;
        
        return textMatch && statusMatch;
      })
    : [];
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Handle status update
  const handleUpdateStatus = (id: number, status: string) => {
    if (status === "rejected") {
      setSelectedWithdrawal(withdrawals.find((w: any) => w.id === id));
      setShowRejectDialog(true);
    } else {
      updateWithdrawalMutation.mutate({ id, status });
    }
  };
  
  // Handle reject confirmation
  const handleRejectConfirm = () => {
    if (!selectedWithdrawal) return;
    
    updateWithdrawalMutation.mutate({ 
      id: selectedWithdrawal.id, 
      status: "rejected",
      rejectionReason: rejectionReason || "Withdrawal request rejected by admin"
    });
  };
  
  // Export withdrawals as CSV
  const exportWithdrawalsCSV = () => {
    if (!withdrawals || withdrawals.length === 0) return;
    
    // Define CSV headers and prepare data
    const headers = 'ID,User ID,User Name,Amount,Status,Bank Details,Created At,Processed At,Rejection Reason\n';
    
    const csvRows = withdrawals.map((withdrawal: any) => {
      return [
        withdrawal.id,
        withdrawal.userId,
        withdrawal.userDetails?.name || '',
        withdrawal.amount,
        withdrawal.status,
        `"${withdrawal.bankDetails || ''}"`,
        withdrawal.createdAt,
        withdrawal.processedAt || '',
        `"${withdrawal.rejectionReason || ''}"`
      ].join(',');
    });
    
    // Create CSV content
    const csvContent = headers + csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pelnora_withdrawals_${new Date().toISOString().split('T')[0]}.csv`);
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
              <CardTitle>Withdrawals</CardTitle>
              <CardDescription>Manage and process withdrawal requests</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={exportWithdrawalsCSV}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/withdrawals'] });
                  toast({
                    title: "Data refreshed",
                    description: "Withdrawals data has been refreshed",
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
                placeholder="Search users or bank details..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                    Rejected
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
          ) : filteredWithdrawals.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal: any) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{withdrawal.userDetails?.name || `User ${withdrawal.userId}`}</span>
                          <span className="text-sm text-muted-foreground">{withdrawal.userDetails?.referralId || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-medium">₹{parseFloat(withdrawal.amount).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {withdrawal.bankDetails || "No bank details provided"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(withdrawal.createdAt), { addSuffix: true })}
                        </div>
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
                            {withdrawal.status === 'pending' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(withdrawal.id, 'approved')}
                                  className="flex items-center gap-2 text-green-600"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleUpdateStatus(withdrawal.id, 'rejected')}
                                  className="flex items-center gap-2 text-red-600"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {withdrawal.status !== 'pending' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(withdrawal.id, 'pending')}
                                className="flex items-center gap-2"
                              >
                                Reset to Pending
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No withdrawal requests found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery || statusFilter
                  ? "Try adjusting your search or filter criteria"
                  : "No withdrawal requests have been submitted yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection reason dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <Textarea
                  id="rejectionReason"
                  placeholder="Enter rejection reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={updateWithdrawalMutation.isPending}
            >
              {updateWithdrawalMutation.isPending ? "Rejecting..." : "Reject Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};