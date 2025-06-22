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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Filter,
  Key,
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
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Package management state
  const [selectedPackageType, setSelectedPackageType] = useState<string>("");
  const [packageAmount, setPackageAmount] = useState<string>("");
  const [showPackageForm, setShowPackageForm] = useState(false);
  
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

  // Admin update user levels mutation
  const updateUserLevelsMutation = useMutation({
    mutationFn: async ({ id, unlockedLevels }: { id: number; unlockedLevels: number }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${id}/levels`, { unlockedLevels });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Levels updated",
        description: data.message || "User levels have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      // Update the selected user in the UI
      if (selectedUser && selectedUser.id === data.user?.id) {
        setSelectedUser((prev: any) => ({ ...prev, unlockedLevels: data.user.unlockedLevels }));
      }
    },
    onError: (error: any) => {
      toast({
        title: "Level update failed",
        description: error.message || "Could not update user levels",
        variant: "destructive",
      });
    },
  });

  // Get user password mutation
  const getUserPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('GET', `/api/admin/users/${userId}/password`);
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedUser((prev: any) => ({ 
        ...prev, 
        password: data.password,
        isPasswordHashed: data.isHashed 
      }));
    },
    onError: (error: any) => {
      toast({
        title: "Failed to fetch password",
        description: error.message || "Could not retrieve user password",
        variant: "destructive",
      });
    },
  });

  // Change user password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/password`, { 
        password: newPassword 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "User password has been updated successfully",
      });
      setNewPassword("");
      setIsChangingPassword(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Password change failed",
        description: error.message || "Could not change user password",
        variant: "destructive",
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/deactivate`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "User deactivated",
        description: data.message || "User has been deactivated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      if (selectedUser && selectedUser.id === data.user?.id) {
        setSelectedUser(data.user);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation failed",
        description: error.message || "Could not deactivate user",
        variant: "destructive",
      });
    },
  });

  // Activate user mutation
  const activateUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/activate`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "User activated",
        description: data.message || "User has been activated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      if (selectedUser && selectedUser.id === data.user?.id) {
        setSelectedUser(data.user);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Activation failed",
        description: error.message || "Could not activate user",
        variant: "destructive",
      });
    },
  });

  // Delete user permanently mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/delete-permanently`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "User deleted permanently",
        description: data.message || "User has been permanently deleted",
      });
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/earnings/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/binary-business/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/packages/me'] });
      
      // Force refetch all queries to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
      queryClient.refetchQueries({ queryKey: ['/api/users'] });
      
      setShowUserDetails(false);
      setSelectedUser(null);
      
      // Show additional info if there were reassignments or orphaned users
      if (data.reassignedUsers && data.reassignedUsers.length > 0) {
        toast({
          title: "Users reassigned",
          description: `${data.reassignedUsers.length} users were reassigned in the binary tree`,
        });
      }
      
      if (data.orphanedUsers && data.orphanedUsers.length > 0) {
        toast({
          title: "Orphaned users",
          description: `${data.orphanedUsers.length} users became orphaned and were removed from the binary tree`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Deletion failed",
        description: error.message || "Could not delete user permanently",
        variant: "destructive",
      });
    },
  });

  // Recalculate all user stats mutation
  const recalculateStatsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/recalculate-all-stats');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Stats recalculated successfully",
        description: data.message || `Updated stats for ${data.updatedUsers} users`,
      });
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/earnings/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/binary-business/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/packages/me'] });
      
      // Force refetch all queries to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
      queryClient.refetchQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Recalculation failed",
        description: error.message || "Could not recalculate user stats",
        variant: "destructive",
      });
    },
  });
  
  // Handle user activation/deactivation
  const handleUserStatusChange = (user: any, isActive: boolean) => {
    if (isActive) {
      activateUserMutation.mutate(user.id);
    } else {
      deactivateUserMutation.mutate(user.id);
    }
  };

  // Handle delete user confirmation
  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Confirm delete user
  const confirmDeleteUser = () => {
    if (userToDelete && deleteConfirmText === "DELETE") {
      deleteUserMutation.mutate(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      setDeleteConfirmText("");
    }
  };

  // Handle recalculate stats
  const handleRecalculateStats = () => {
    recalculateStatsMutation.mutate();
  };

  // Reset current user stats mutation (for debugging)
  const resetUserStatsMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('POST', `/api/debug/reset-user-stats/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "User stats reset",
        description: data.message || "User stats have been reset to zero",
      });
      // Force refresh all queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Reset failed",
        description: error.message || "Could not reset user stats",
        variant: "destructive",
      });
    },
  });

  // Handle reset current user stats (for debugging)
  const handleResetCurrentUserStats = () => {
    // Get current user ID from session/auth
    // For now, let's use user ID 2 (test user)
    resetUserStatsMutation.mutate(2);
  };

  // Fetch user's current package
  const { data: userPackage, isLoading: packageLoading } = useQuery({
    queryKey: ['/api/packages/user', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null;
      const response = await apiRequest('GET', `/api/admin/users/${selectedUser.id}/package`);
      return response.json();
    },
    enabled: !!selectedUser?.id,
  });

  // Create or update package mutation
  const packageMutation = useMutation({
    mutationFn: async ({ userId, packageData }: { userId: number; packageData: any }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/package`, packageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Package updated",
        description: "User package has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/packages/user', selectedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      resetPackageFormState();
    },
    onError: (error: any) => {
      toast({
        title: "Package update failed",
        description: error.message || "Could not update user package",
        variant: "destructive",
      });
    },
  });

  // Delete package mutation
  const deletePackageMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/users/${userId}/package`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Package deleted",
        description: "User package has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/packages/user', selectedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Package deletion failed",
        description: error.message || "Could not delete user package",
        variant: "destructive",
      });
    },
  });


  
  // KYC approval is now handled in the KYC tab

  // Handle view password
  const handleViewPassword = () => {
    if (!selectedUser.password) {
      getUserPasswordMutation.mutate(selectedUser.id);
    }
    setShowPassword(!showPassword);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (!newPassword.trim()) {
      toast({
        title: "Invalid password",
        description: "Password cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      userId: selectedUser.id,
      newPassword: newPassword
    });
  };

  // Reset password state when dialog closes or user changes
  const resetPasswordState = () => {
    setShowPassword(false);
    setNewPassword("");
    setIsChangingPassword(false);
    if (selectedUser) {
      setSelectedUser((prev: any) => ({ ...prev, password: undefined }));
    }
  };

  // Reset package form state
  const resetPackageFormState = () => {
    setShowPackageForm(false);
    setSelectedPackageType("");
    setPackageAmount("");
  };

  // Package management handlers
  const handlePackageSubmit = () => {
    if (!selectedPackageType || !packageAmount) {
      toast({
        title: "Invalid package data",
        description: "Please select a package type and enter an amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(packageAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    packageMutation.mutate({
      userId: selectedUser.id,
      packageData: {
        packageType: selectedPackageType,
        monthlyAmount: amount.toString(),
        totalMonths: 11,
        paidMonths: 0
      }
    });
  };

  const handleDeletePackage = () => {
    if (window.confirm('Are you sure you want to delete this user\'s package? This action cannot be undone.')) {
      deletePackageMutation.mutate(selectedUser.id);
    }
  };

  // Package type options with amounts
  const packageOptions = [
    { value: 'silver', label: 'Silver Package', defaultAmount: '2500' },
    { value: 'gold', label: 'Gold Package', defaultAmount: '5000' },
    { value: 'platinum', label: 'Platinum Package', defaultAmount: '10000' },
    { value: 'diamond', label: 'Diamond Package', defaultAmount: '25000' }
  ];

  // Handle package type selection
  const handlePackageTypeChange = (value: string) => {
    setSelectedPackageType(value);
    const selectedOption = packageOptions.find(opt => opt.value === value);
    if (selectedOption) {
      setPackageAmount(selectedOption.defaultAmount);
    }
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
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleRecalculateStats}
                disabled={recalculateStatsMutation.isPending}
              >
                {recalculateStatsMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {recalculateStatsMutation.isPending ? 'Recalculating...' : 'Recalculate Stats'}
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                onClick={handleResetCurrentUserStats}
                disabled={resetUserStatsMutation.isPending}
              >
                {resetUserStatsMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {resetUserStatsMutation.isPending ? 'Resetting...' : 'Reset Test User Stats'}
                </span>
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
                            {/* KYC management moved to dedicated tab */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => printIDCard(user)}
                              className="flex items-center gap-2"
                            >
                              <Printer className="h-4 w-4" />
                              Print ID Card
                            </DropdownMenuItem>
                            {user.role !== 'admin' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteUser(user)}
                                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </>
                            )}
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
        <Dialog open={showUserDetails} onOpenChange={(open) => {
          setShowUserDetails(open);
          if (!open) {
            resetPasswordState();
            resetPackageFormState();
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View and manage detailed information for {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="package">Package</TabsTrigger>
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
                  <Badge variant="outline" className={selectedUser.kycStatus ? "bg-green-100 text-green-800 border-green-300" : "bg-yellow-100 text-yellow-800 border-yellow-300"}>
                    {selectedUser.kycStatus ? "Approved" : "Pending"}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">(Managed in KYC tab)</span>
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

                {/* Password Management Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Password Management
                  </div>
                  
                  <div className="space-y-4">
                    {/* View Password */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Current Password</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 p-2 bg-muted rounded-md text-sm font-mono">
                            {showPassword && selectedUser.password ? 
                              (selectedUser.isPasswordHashed ? 
                                selectedUser.password + ' (Encrypted)' : 
                                selectedUser.password
                              ) : 
                              '••••••••••••'
                            }
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewPassword}
                            disabled={getUserPasswordMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {getUserPasswordMutation.isPending ? 'Loading...' : (showPassword ? 'Hide' : 'View')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="p-3 border rounded-lg">
                      <Label className="text-sm font-medium">Change Password</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="flex-1"
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          onClick={handlePasswordChange}
                          disabled={!newPassword.trim() || changePasswordMutation.isPending}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Key className="h-4 w-4" />
                          {changePasswordMutation.isPending ? 'Changing...' : 'Change'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="package" className="space-y-4">
                <div className="space-y-4">
                  {/* Current Package Display */}
                  {packageLoading ? (
                    <div className="p-4 border rounded-lg">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ) : userPackage ? (
                    <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-medium text-green-800">Current Package</div>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Active
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-green-600">Package Type</div>
                          <div className="font-semibold capitalize">{userPackage.packageType}</div>
                        </div>
                        <div>
                          <div className="text-sm text-green-600">Monthly Amount</div>
                          <div className="font-semibold">₹{parseFloat(userPackage.monthlyAmount).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-green-600">Progress</div>
                          <div className="font-semibold">{userPackage.paidMonths}/{userPackage.totalMonths} months</div>
                        </div>
                        <div>
                          <div className="text-sm text-green-600">Status</div>
                          <div className="font-semibold">{userPackage.isCompleted ? 'Completed' : 'Active'}</div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleDeletePackage}
                          disabled={deletePackageMutation.isPending}
                        >
                          {deletePackageMutation.isPending ? 'Deleting...' : 'Delete Package'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="text-center text-muted-foreground">
                        <div className="text-lg font-medium mb-2">No Package Assigned</div>
                        <div className="text-sm">This user doesn't have any package assigned yet.</div>
                      </div>
                    </div>
                  )}

                  {/* Add/Update Package Form */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-lg font-medium">
                        {userPackage ? 'Update Package' : 'Assign Package'}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPackageForm(!showPackageForm)}
                      >
                        {showPackageForm ? 'Cancel' : (userPackage ? 'Change Package' : 'Add Package')}
                      </Button>
                    </div>

                    {showPackageForm && (
                      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Package Type</Label>
                            <Select value={selectedPackageType} onValueChange={handlePackageTypeChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select package type" />
                              </SelectTrigger>
                              <SelectContent>
                                {packageOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Monthly Amount (₹)</Label>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={packageAmount}
                              onChange={(e) => setPackageAmount(e.target.value)}
                              min="0"
                              step="100"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            onClick={resetPackageFormState}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handlePackageSubmit}
                            disabled={packageMutation.isPending}
                          >
                            {packageMutation.isPending ? 'Saving...' : (userPackage ? 'Update Package' : 'Assign Package')}
                          </Button>
                        </div>
                      </div>
                    )}
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
                    id="levels-input"
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
                      const levelInput = document.getElementById('levels-input') as HTMLInputElement;
                      if (levelInput && levelInput.value) {
                        const levels = parseInt(levelInput.value);
                        if (levels >= 0 && levels <= 20) {
                          updateUserLevelsMutation.mutate({
                            id: selectedUser.id,
                            unlockedLevels: levels
                          });
                        } else {
                          toast({
                            title: "Invalid level",
                            description: "Levels must be between 0 and 20",
                            variant: "destructive",
                          });
                        }
                      } else {
                        toast({
                          title: "Invalid input",
                          description: "Please enter a valid level number",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={updateUserLevelsMutation.isPending}
                  >
                    {updateUserLevelsMutation.isPending ? 'Updating...' : 'Update Levels'}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User Permanently</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p className="font-semibold mb-2">⚠️ This action cannot be undone and will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Permanently delete the user account</li>
                  <li>Remove all associated data (packages, earnings, withdrawals)</li>
                  <li>Reassign their downline users in the binary tree</li>
                  <li>Invalidate all earnings related to this user</li>
                  <li>Update referral relationships</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Type <strong>DELETE</strong> to confirm this action.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="border-red-300 focus:border-red-500"
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText("");
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleteConfirmText !== "DELETE" || deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
