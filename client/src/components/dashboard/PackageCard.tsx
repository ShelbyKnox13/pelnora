import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package } from "@shared/schema";
import { format } from "date-fns";

interface PackageCardProps {
  userPackage: Package;
}

export const PackageCard = ({ userPackage }: PackageCardProps) => {
  const { toast } = useToast();
  const [isPayingEMI, setIsPayingEMI] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = (userPackage.paidMonths / userPackage.totalMonths) * 100;
  
  // Format package type name
  const formatPackageType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  // Pay EMI mutation
  const payEMIMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/emi-payments', {
        packageId: userPackage.id,
        userId: userPackage.userId,
        amount: userPackage.monthlyAmount,
        status: 'paid',
        month: userPackage.paidMonths + 1
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "EMI payment successful",
        description: "Your monthly payment has been processed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/packages/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/emi-payments/me'] });
      setIsPayingEMI(false);
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsPayingEMI(false);
    },
  });
  
  const handlePayEMI = () => {
    setIsPayingEMI(true);
    payEMIMutation.mutate();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Package</h3>
        <div className="flex items-center mb-6">
          <div className={`h-12 w-12 rounded-md flex items-center justify-center bg-${userPackage.packageType === 'platinum' ? 'gold' : userPackage.packageType === 'diamond' ? 'purple' : userPackage.packageType === 'gold' ? 'teal' : 'purple'}-dark`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <h4 className="text-xl font-bold text-gray-900">{formatPackageType(userPackage.packageType)} Package</h4>
            <p className="text-sm text-gray-500">₹{parseFloat(userPackage.monthlyAmount).toLocaleString()}/month - {userPackage.totalMonths} months</p>
          </div>
        </div>
        
        <div className="overflow-hidden bg-gray-100 rounded-full mb-4">
          <div 
            className={`h-2 ${userPackage.packageType === 'platinum' ? 'bg-gold-dark' : userPackage.packageType === 'diamond' ? 'bg-purple-dark' : userPackage.packageType === 'gold' ? 'bg-teal-dark' : 'bg-purple-dark'}`} 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{userPackage.paidMonths}/{userPackage.totalMonths} EMIs Paid</span>
          <span className="text-gray-900 font-medium">{progressPercentage.toFixed(0)}% Complete</span>
        </div>
        
        {userPackage.isCompleted ? (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <div>
                <h4 className="font-medium text-green-800">Package Completed!</h4>
                <p className="text-sm text-green-700">
                  You've successfully completed all your EMI payments.
                  {userPackage.bonusEarned && ' You earned the EMI bonus for on-time payments!'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Next EMI Due:</span>
              <span className="text-sm font-medium text-gray-900">
                {userPackage.nextPaymentDue ? format(new Date(userPackage.nextPaymentDue), "dd MMMM, yyyy") : "Not scheduled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Amount:</span>
              <span className="text-sm font-medium text-gray-900 font-mono">₹{parseFloat(userPackage.monthlyAmount).toLocaleString()}</span>
            </div>
            
            <div className="mt-4">
              <Button
                onClick={handlePayEMI}
                className={`w-full ${userPackage.packageType === 'platinum' ? 'bg-gold-dark hover:bg-gold' : userPackage.packageType === 'diamond' ? 'bg-purple-dark hover:bg-purple' : userPackage.packageType === 'gold' ? 'bg-teal-dark hover:bg-teal' : 'bg-purple-dark hover:bg-purple'} text-white font-bold`}
                disabled={isPayingEMI}
              >
                {isPayingEMI ? "Processing..." : "Pay EMI Now"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
