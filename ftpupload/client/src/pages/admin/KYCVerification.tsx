import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2, XCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet";

const KYCVerification = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch users with KYC details
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/kyc-verification'],
  });

  // Update KYC status mutation
  const updateKYCStatusMutation = useMutation({
    mutationFn: async ({ userId, status, rejectionReason }: { userId: number; status: 'approved' | 'rejected'; rejectionReason?: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/kyc-verification/${userId}`, {
        status,
        rejectionReason
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "KYC status updated",
        description: "The KYC verification status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-verification'] });
      setShowRejectDialog(false);
      setShowDetailsDialog(false);
      setRejectionReason("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update KYC status",
        variant: "destructive",
      });
    },
  });

  // Filter users
  const filteredUsers = users
    ? users.filter((user: any) => {
        const textMatch = 
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.panNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.idProofNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return textMatch;
      })
    : [];

  // Get status badge
  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Verified</Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
    );
  };

  // Handle status update
  const handleUpdateStatus = (userId: number, status: 'approved' | 'rejected') => {
    if (status === "rejected") {
      setSelectedUser(users.find((u: any) => u.id === userId));
      setShowRejectDialog(true);
    } else {
      updateKYCStatusMutation.mutate({ userId, status });
    }
  };

  // Handle reject confirmation
  const handleRejectConfirm = () => {
    if (!selectedUser) return;
    
    updateKYCStatusMutation.mutate({ 
      userId: selectedUser.id, 
      status: "rejected",
      rejectionReason: rejectionReason || "KYC verification rejected by admin"
    });
  };

  return (
    <>
      <Helmet>
        <title>KYC Verification - Pelnora Admin</title>
        <meta name="description" content="Manage KYC verification requests for Pelnora users" />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="py-8 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-playfair font-bold text-purple-dark">KYC Verification</h1>
              <p className="mt-1 text-sm text-gray-500">Review and verify user KYC submissions</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Pending Verifications</CardTitle>
                    <CardDescription>Review and process KYC verification requests</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredUsers.map((user: any) => (
                      <div key={user.id} className="flex items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-bold text-gray-900 mr-3">{user.name}</h4>
                            {getStatusBadge(user.kycStatus)}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">PAN Number</p>
                              <p className="text-sm font-medium">{user.panNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">ID Proof Type</p>
                              <p className="text-sm font-medium">{user.idProofType}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">ID Proof Number</p>
                              <p className="text-sm font-medium">{user.idProofNumber}</p>
                            </div>
                          </div>
                          {user.panCardImage && (
                            <div className="mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                View PAN Card Image
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!user.kycStatus && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleUpdateStatus(user.id, 'approved')}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleUpdateStatus(user.id, 'rejected')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No KYC submissions found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "No pending KYC verification requests"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>

      {/* Rejection reason dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC verification request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="resize-none"
              rows={4}
            />
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
              disabled={updateKYCStatusMutation.isPending}
            >
              {updateKYCStatusMutation.isPending ? "Rejecting..." : "Reject KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAN Card image dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PAN Card Image</DialogTitle>
            <DialogDescription>
              Review the submitted PAN card image
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedUser?.panCardImage && (
              <img 
                src={selectedUser.panCardImage} 
                alt="PAN Card" 
                className="w-full rounded-lg"
              />
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KYCVerification; 