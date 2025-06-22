import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "@shared/schema";

interface PackageInfoProps {
  userPackage: Package;
}

export const PackageInfo = ({ userPackage }: PackageInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Package Type</p>
            <p className="text-2xl font-bold capitalize">{userPackage.packageType}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium">Investment Amount</p>
            <p className="text-2xl font-bold">₹{userPackage.monthlyAmount}</p>
          </div>

          <div>
            <p className="text-sm font-medium">EMI Status</p>
            <p className="text-lg font-semibold">
              {userPackage.paidMonths} / {userPackage.totalMonths} Months
            </p>
            <p className="text-sm text-muted-foreground">
              {userPackage.timelyPaymentsCount} timely payments
              {userPackage.emiWaiverEligible && " - Eligible for 12th EMI waiver"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Total Earnings</p>
            <p className="text-2xl font-bold">₹{userPackage.totalEarnings}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 