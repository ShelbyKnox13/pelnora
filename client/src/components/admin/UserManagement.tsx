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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Printer,
  Search,
  User,
  UserPlus,
  XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const UserManagement = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PATCH', `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User information has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowUserDetails(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Could not update user",
        variant: "destructive",
      });
    },
  });
  
  // Handle user activation/deactivation
  const handleUserStatusChange = (user: any, isActive: boolean) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { isActive }
    });
  };
  
  // Handle KYC approval
  const handleKYCApproval = (user: any, kycStatus: boolean) => {
    updateUserMutation.mutate({
      id: user.id,
      data: { kycStatus }
    });
  };
  
  // Filter users based on search query
  const filteredUsers = users
    ? users.filter((user: any) => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery) ||
        user.referralId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Function to export users as CSV
  const exportUsersCSV = () => {
    if (!users || users.length === 0) return;
    
    // Define CSV headers and prepare data
    const headers = 'ID,Name,Email,Phone,Referral ID,Referred By,Status,KYC Status,Left Team,Right Team,Total Earnings,Created At\n';
    
    const csvRows = users.map((user: any) => {
      return [
        user.id,
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.phone}"`,
        user.referralId,
        user.referredBy || '',
        user.isActive ? 'Active' : 'Inactive',
        user.kycStatus ? 'Approved' : 'Pending',
        user.leftTeamCount,
        user.rightTeamCount,
        user.totalEarnings,
        new Date(user.createdAt).toISOString()
      ].join(',');
    });
    
    // Create CSV content
    const csvContent = headers + csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pelnora_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to handle print ID card
  const printIDCard = (user: any) => {
    // Set up print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;
    
    // Create ID card HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pelnora ID Card - ${user.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .id-card {
              width: 3.375in;
              height: 2.125in;
              border: 1px solid #ccc;
              border-radius: 10px;
              margin: 0 auto;
              padding: 15px;
              position: relative;
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              background: white;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              border-bottom: 2px solid #4A154B;
              padding-bottom: 10px;
            }
            .logo {
              font-size: 16px;
              font-weight: bold;
              color: #4A154B;
            }
            .logo span {
              color: #D4AF37;
            }
            .content {
              display: flex;
            }
            .details {
              flex: 1;
            }
            .user-photo {
              width: 80px;
              height: 80px;
              background: #f0f0f0;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-size: 24px;
              color: #4A154B;
              border: 2px solid #D4AF37;
            }
            .name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .id {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .detail {
              font-size: 11px;
              color: #333;
              margin-bottom: 3px;
            }
            .watermark {
              position: absolute;
              bottom: 5px;
              right: 5px;
              opacity: 0.1;
              font-size: 50px;
              transform: rotate(-45deg);
            }
            .qr-code {
              width: 50px;
              height: 50px;
              background: #f0f0f0;
              margin-left: auto;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              text-align: center;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-button" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print(); window.close();" style="padding: 10px 20px; background: #4A154B; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print ID Card
            </button>
          </div>
          
          <div class="id-card">
            <div class="header">
              <div class="logo"><span>Pelnora</span> Jewellers</div>
            </div>
            
            <div class="content">
              <div class="user-photo">${user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</div>
              
              <div class="details">
                <div class="name">${user.name}</div>
                <div class="id">ID: ${user.referralId}</div>
                <div class="detail">Email: ${user.email}</div>
                <div class="detail">Phone: ${user.phone}</div>
                <div class="detail">Joined: ${new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div class="watermark">PELNORA</div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, approvals, and permissions</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={exportUsersCSV}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Referral ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
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
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
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
                      <TableCell className="font-mono">{user.referralId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`${user.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${user.kycStatus ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}
                          >
                            KYC: {user.kycStatus ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Left: {user.leftTeamCount}</div>
                          <div>Right: {user.rightTeamCount}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">₹{parseFloat(user.totalEarnings).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
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
                                setShowUserDetails(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleUserStatusChange(user, !user.isActive)}
                              className="flex items-center gap-2"
                            >
                              {user.isActive ? (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>Activate</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleKYCApproval(user, !user.kycStatus)}
                              className="flex items-center gap-2"
                            >
                              {user.kycStatus ? (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span>Reject KYC</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>Approve KYC</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => printIDCard(user)}
                              className="flex items-center gap-2"
                            >
                              <Printer className="h-4 w-4" />
                              Print ID Card
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users?.length || 0} users
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View and manage detailed information for {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="team">Team & Levels</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-dark text-xl font-medium">
                    {selectedUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Referral ID</div>
                    <div className="font-mono p-2 bg-muted rounded-md">{selectedUser.referralId}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Referred By</div>
                    <div className="p-2 bg-muted rounded-md">
                      {selectedUser.referredBy ? `ID: ${selectedUser.referredBy}` : 'None'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium">Account Status</span>
                  <Switch
                    checked={selectedUser.isActive}
                    onCheckedChange={(checked) => handleUserStatusChange(selectedUser, checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">KYC Status</span>
                  <Switch
                    checked={selectedUser.kycStatus}
                    onCheckedChange={(checked) => handleKYCApproval(selectedUser, checked)}
                  />
                </div>
                
                <div className="text-sm font-medium mt-2">Bank Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Bank Name</div>
                    <div className="p-2 bg-muted rounded-md text-sm">
                      {selectedUser.bankName || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Account Number</div>
                    <div className="p-2 bg-muted rounded-md text-sm">
                      {selectedUser.accountNumber || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">IFSC Code</div>
                    <div className="p-2 bg-muted rounded-md text-sm">
                      {selectedUser.ifscCode || 'Not provided'}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-medium mb-2">Binary Team</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Left Team</div>
                        <div className="text-2xl font-bold">{selectedUser.leftTeamCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Right Team</div>
                        <div className="text-2xl font-bold">{selectedUser.rightTeamCount}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-medium mb-2">Level Access</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Unlocked Levels</div>
                        <div className="text-2xl font-bold">{selectedUser.unlockedLevels}/20</div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gold-light/20 flex items-center justify-center text-gold-dark">
                        <ChevronDown className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Input 
                    type="number" 
                    className="w-32 mr-2" 
                    placeholder="Set levels"
                    defaultValue={selectedUser.unlockedLevels}
                    min="0"
                    max="20"
                  />
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      const levelInput = document.querySelector('input[type="number"]') as HTMLInputElement;
                      if (levelInput && levelInput.value) {
                        const levels = parseInt(levelInput.value);
                        if (levels >= 0 && levels <= 20) {
                          updateUserMutation.mutate({
                            id: selectedUser.id,
                            data: { unlockedLevels: levels }
                          });
                        }
                      }
                    }}
                  >
                    Update Levels
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="earnings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Earnings</div>
                    <div className="text-2xl font-bold font-mono">₹{parseFloat(selectedUser.totalEarnings).toFixed(2)}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Withdrawable</div>
                    <div className="text-2xl font-bold font-mono">₹{parseFloat(selectedUser.withdrawableAmount).toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Auto Pool Status</div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Auto Pool Eligibility</span>
                    <Switch
                      checked={selectedUser.autoPoolEligible}
                      onCheckedChange={(checked) => {
                        updateUserMutation.mutate({
                          id: selectedUser.id,
                          data: { autoPoolEligible: checked }
                        });
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
                      setShowUserDetails(false);
                    }}
                  >
                    Refresh Data
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => printIDCard(selectedUser)}>
                <Printer className="mr-2 h-4 w-4" />
                Print ID Card
              </Button>
              <Button onClick={() => setShowUserDetails(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
