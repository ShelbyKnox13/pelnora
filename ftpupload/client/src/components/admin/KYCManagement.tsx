import { useState, useEffect } from "react";
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
  DialogFooter
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Search,
  XCircle,
  FileImage,
  Eye,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const KYCManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showKYCDetails, setShowKYCDetails] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Fetch all KYC submissions from the users endpoint
  const { data: kycSubmissions, isLoading: kycLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/users', null, {
        headers: {
          'x-admin-auth': 'true',
          'x-admin-last-activity': Date.now().toString()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    select: (data) => {
      // Filter users who have KYC data (submitted or attempted KYC)
      return data?.filter((user: any) => user.panNumber || user.panCardImage);
    }
  });
  
  // Update KYC status mutation using users endpoint
  const updateKYCStatusMutation = useMutation({
    mutationFn: async ({ userId, status, rejectionReason }: { userId: number; status: string; rejectionReason?: string }) => {
      // Using the API endpoint to update KYC status
      const response = await apiRequest('PATCH', `/api/admin/kyc-verification/${userId}`, {
        status,
        rejectionReason: rejectionReason || ""
      }, {
        headers: {
          'x-admin-auth': 'true',
          'x-admin-last-activity': Date.now().toString()
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update KYC status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC status updated",
        description: "The user's KYC status has been updated successfully",
      });
      // Invalidate both possible query keys
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowKYCDetails(false);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update KYC status",
        variant: "destructive",
      });
    },
  });

  // Handle KYC approval
  const handleKYCApproval = (userId: number) => {
    updateKYCStatusMutation.mutate({
      userId,
      status: 'approved'
    });
  };

  // Handle KYC rejection
  const handleKYCRejection = (userId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    updateKYCStatusMutation.mutate({
      userId,
      status: 'rejected',
      rejectionReason
    });
  };
  
  // Filter KYC submissions based on search query and status filter
  const filteredSubmissions = kycSubmissions
    ? kycSubmissions.filter((user: any) => {
        // Status filtering - If no kycStatus, treat as "pending"
        const status = user.kycStatus || "pending";
        if (statusFilter !== "all" && status !== statusFilter) {
          return false;
        }
        
        // Search filtering
        return (
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone?.includes(searchQuery) ||
          user.referralId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.panNumber && user.panNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
    : [];

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Not Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>KYC Management</CardTitle>
              <CardDescription>Manage and verify user KYC submissions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    <span>
                      {statusFilter === "all" ? "All Status" : 
                       statusFilter === "approved" ? "Approved" : 
                       statusFilter === "rejected" ? "Rejected" : "Pending"}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Submissions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending Verification
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>PAN Number</TableHead>
                  <TableHead>ID Proof</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-dark font-medium">
                            {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{user.panNumber || "Not provided"}</TableCell>
                      <TableCell>
                        {user.idProofType ? 
                          `${user.idProofType.toUpperCase()}: ${user.idProofNumber}` : 
                          "Not provided"}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.kycStatus || "pending")}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.kycSubmissionDate || user.updatedAt ? 
                            formatDistanceToNow(new Date(user.kycSubmissionDate || user.updatedAt), { addSuffix: true }) : 
                            "Recently"}
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
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowKYCDetails(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {(!user.kycStatus || user.kycStatus === 'pending') && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    handleKYCApproval(user.id);
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowKYCDetails(true);
                                    setRejectionReason(""); // Reset rejection reason
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.kycStatus === 'approved' && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowKYCDetails(true);
                                  setRejectionReason(""); // Reset rejection reason
                                }}
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                                Mark as Rejected
                              </DropdownMenuItem>
                            )}
                            {user.kycStatus === 'rejected' && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  handleKYCApproval(user.id);
                                }}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Mark as Approved
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No KYC submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredSubmissions.length} of {kycSubmissions?.length || 0} submissions
          </div>
        </CardFooter>
      </Card>

      {/* KYC Details Dialog */}
      {selectedUser && (
        <Dialog open={showKYCDetails} onOpenChange={setShowKYCDetails}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>KYC Verification Details</DialogTitle>
              <DialogDescription>
                Review KYC submission for {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Basic Info */}
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-dark text-xl font-medium">
                  {selectedUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedUser.kycStatus)}
                  </div>
                </div>
              </div>
              
              {/* KYC Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">PAN Card Details</Label>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">PAN Number:</span> {selectedUser.panNumber}
                    </div>
                    <div className="border-t pt-2">
                      <div className="text-sm font-medium mb-2">PAN Card Image</div>
                      <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {selectedUser.panCardImage ? (
                          <img 
                            src={selectedUser.panCardImage.startsWith('http') 
                              ? selectedUser.panCardImage 
                              : `/api/kyc/image/${selectedUser.id}/${selectedUser.panCardImage}`
                            } 
                            alt="PAN Card" 
                            className="max-w-full max-h-full object-contain"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              console.log("Error loading PAN card image:", selectedUser.panCardImage);
                              // Try alternate paths
                              const currentSrc = e.currentTarget.src;
                              if (currentSrc.includes('/api/kyc/image/')) {
                                e.currentTarget.src = `/uploads/${selectedUser.panCardImage}`;
                              } else if (currentSrc.includes('/uploads/')) {
                                e.currentTarget.src = `/server/public/uploads/${selectedUser.panCardImage}`;
                              } else {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgOUEzIDMgMCAxIDEgMTYgOUEzIDMgMCAxIDEgMTAgOVoiIGZpbGw9IiM2QjcyODAiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQgOEE0IDQgMCAwIDEgOCA0SDE2QTQgNCAwIDAgMSAyMCA4VjE2QTQgNCAwIDAgMSAxNiAyMEg4QTQgNCAwIDAgMSA0IDE2VjhaTTggNkgyVjRINlY2SDhaTTggNkgxNkEyIDIgMCAwIDEgMTggOFYxNkEyIDIgMCAwIDEgMTYgMThIOEEyIDIgMCAwIDEgNiAxNlY4QTIgMiAwIDAgMSA4IDZaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+';
                              }
                            }}
                          />
                        ) : (
                          <FileImage className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">ID Proof Details</Label>
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">ID Type:</span> {selectedUser.idProofType ? selectedUser.idProofType.toUpperCase() : 'Not provided'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">ID Number:</span> {selectedUser.idProofNumber || 'Not provided'}
                    </div>
                    {selectedUser.idProofImage && (
                      <div className="border-t pt-2">
                        <div className="text-sm font-medium mb-2">ID Proof Image</div>
                        <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          <img 
                            src={selectedUser.idProofImage.startsWith('http') 
                              ? selectedUser.idProofImage 
                              : `/api/kyc/image/${selectedUser.id}/${selectedUser.idProofImage}`
                            } 
                            alt="ID Proof" 
                            className="max-w-full max-h-full object-contain"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              console.log("Error loading ID proof image:", selectedUser.idProofImage);
                              // Try alternate paths
                              const currentSrc = e.currentTarget.src;
                              if (currentSrc.includes('/api/kyc/image/')) {
                                e.currentTarget.src = `/uploads/${selectedUser.idProofImage}`;
                              } else if (currentSrc.includes('/uploads/')) {
                                e.currentTarget.src = `/server/public/uploads/${selectedUser.idProofImage}`;
                              } else {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgOUEzIDMgMCAxIDEgMTYgOUEzIDMgMCAxIDEgMTAgOVoiIGZpbGw9IiM2QjcyODAiLz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTQgOEE0IDQgMCAwIDEgOCA0SDE2QTQgNCAwIDAgMSAyMCA4VjE2QTQgNCAwIDAgMSAxNiAyMEg4QTQgNCAwIDAgMSA0IDE2VjhaTTggNkgyVjRINlY2SDhaTTggNkgxNkEyIDIgMCAwIDEgMTggOFYxNkEyIDIgMCAwIDEgMTYgMThIOEEyIDIgMCAwIDEgNiAxNlY4QTIgMiAwIDAgMSA4IDZaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+';
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Status Information */}
              {selectedUser.kycStatus === 'rejected' && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Rejection Reason</h4>
                      <p className="text-sm text-red-700 mt-1">{selectedUser.kycRejectionReason || "No reason provided"}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(!selectedUser.kycStatus || selectedUser.kycStatus === 'pending') && (
                <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Pending Verification</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This KYC submission is awaiting your verification. Please review the provided documents and approve or reject accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Rejection Reason Input (for rejecting) */}
              {selectedUser.kycStatus !== 'rejected' && (
                <div className="p-4 border rounded-lg space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason (required if rejecting)</Label>
                  <Textarea 
                    id="rejectionReason"
                    placeholder="Provide a reason for rejection that will be shown to the user"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowKYCDetails(false)}
                className="sm:order-2"
              >
                Close
              </Button>
              
              {(!selectedUser.kycStatus || selectedUser.kycStatus === 'pending') && (
                <div className="flex gap-2 sm:order-1">
                  <Button 
                    onClick={() => handleKYCApproval(selectedUser.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve KYC
                  </Button>
                  <Button 
                    onClick={() => handleKYCRejection(selectedUser.id)}
                    variant="destructive"
                    disabled={!rejectionReason.trim()}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject KYC
                  </Button>
                </div>
              )}
              
              {selectedUser.kycStatus === 'approved' && (
                <Button 
                  onClick={() => handleKYCRejection(selectedUser.id)}
                  variant="destructive"
                  disabled={!rejectionReason.trim()}
                  className="sm:order-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark as Rejected
                </Button>
              )}
              
              {selectedUser.kycStatus === 'rejected' && (
                <Button 
                  onClick={() => handleKYCApproval(selectedUser.id)}
                  className="bg-green-600 hover:bg-green-700 text-white sm:order-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Approved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};