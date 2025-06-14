import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "@shared/schema";

interface ReferralStatsProps {
  userPackage: Package;
}

export const ReferralStats = ({ userPackage }: ReferralStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Direct Referrals</p>
            <p className="text-2xl font-bold">{userPackage.directReferrals}</p>
            <p className="text-sm text-muted-foreground">
              Each referral unlocks 2 levels
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Direct Earnings</p>
            <p className="text-2xl font-bold">₹{userPackage.directEarnings}</p>
            <p className="text-sm text-muted-foreground">
              From direct referral commissions
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Level Earnings</p>
            <p className="text-2xl font-bold">₹{userPackage.levelEarnings}</p>
            <p className="text-sm text-muted-foreground">
              From level commissions
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Binary Earnings</p>
            <p className="text-2xl font-bold">₹{userPackage.binaryEarnings}</p>
            <p className="text-sm text-muted-foreground">
              From binary tree structure
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 