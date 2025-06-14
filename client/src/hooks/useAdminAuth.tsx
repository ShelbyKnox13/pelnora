import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const useAdminAuth = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Admin logout mutation
  const adminLogoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/logout', {});
      return res.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries();
      queryClient.clear();
      
      toast({
        title: "Admin logout successful",
        description: "You have been logged out from the admin panel",
      });
      navigate("/admin");
    },
    onError: (error: any) => {
      console.error('Admin logout error:', error);
      
      // Even if the server request fails, clear local data and redirect
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.invalidateQueries();
      queryClient.clear();
      
      toast({
        title: "Logout completed",
        description: "You have been logged out from the admin panel",
        variant: "default",
      });
      navigate("/admin");
    },
  });

  const adminLogout = async () => {
    try {
      await adminLogoutMutation.mutateAsync();
    } catch (error) {
      // Error is already handled in onError above
      console.error('Admin logout failed:', error);
    }
  };

  return {
    adminLogout,
    isLoggingOut: adminLogoutMutation.isPending,
  };
};