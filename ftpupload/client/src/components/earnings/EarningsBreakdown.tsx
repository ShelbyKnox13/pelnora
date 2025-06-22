import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EARNING_TYPE_COLORS } from "@/lib/constants";
import { Earning } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface EarningsBreakdownProps {
  earnings?: Earning[];
  isLoading: boolean;
  detailed?: boolean;
}

export const EarningsBreakdown = ({ earnings, isLoading, detailed = false }: EarningsBreakdownProps) => {
  const { user } = useAuth();
  
  // Calculate earnings by type
  const calculateEarningsByType = () => {
    if (!earnings || earnings.length === 0) {
      return {
        direct: 0,
        binary: 0,
        level: 0,
        autopool: 0,
        emi_bonus: 0,
        total: 0,
        deduction: 0,
        net: 0,
      };
    }
    
    // Sum up earnings by type
    const earningsByType = {
      direct: 0,
      binary: 0,
      level: 0,
      autopool: 0,
      emi_bonus: 0,
    };
    
    earnings.forEach((earning) => {
      const amount = parseFloat(earning.amount);
      earningsByType[earning.earningType] += amount;
    });
    
    // Calculate totals
    const total = Object.values(earningsByType).reduce((sum, amount) => sum + amount, 0);
    const deduction = total * 0.1; // 10% deduction
    const net = total - deduction;
    
    return {
      ...earningsByType,
      total,
      deduction,
      net,
    };
  };
  
  const earningsByType = calculateEarningsByType();
  
  // Calculate percentage for progress bars
  const getPercentage = (amount: number) => {
    if (earningsByType.total === 0) return 0;
    return (amount / earningsByType.total) * 100;
  };

  return (
    <Card>
      <CardHeader className={detailed ? undefined : "px-4 py-5"}>
        <CardTitle className="text-xl font-medium text-gray-900">Earnings Breakdown</CardTitle>
      </CardHeader>
      <CardContent className={`${detailed ? "pt-0" : "pt-0 p-4"}`}>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-2 w-full mb-6" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct Income */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gold-dark mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Direct Income (5%)</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono">₹{earningsByType.direct.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gold-dark h-2 rounded-full" style={{ width: `${getPercentage(earningsByType.direct)}%` }}></div>
              </div>
            </div>
            
            {/* Binary Income */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-dark mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Binary Income (5%)</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono">₹{earningsByType.binary.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-dark h-2 rounded-full" style={{ width: `${getPercentage(earningsByType.binary)}%` }}></div>
              </div>
            </div>
            
            {/* Level Income */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-teal-dark mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Level Income (62% of Binary)</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono">₹{earningsByType.level.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-dark h-2 rounded-full" style={{ width: `${getPercentage(earningsByType.level)}%` }}></div>
              </div>
            </div>
            
            {/* Auto Pool Income */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Auto Pool Income</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono">₹{earningsByType.autopool.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${getPercentage(earningsByType.autopool)}%` }}></div>
              </div>
            </div>
            
            {/* EMI Bonus */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">EMI Bonus</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-mono">₹{earningsByType.emi_bonus.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${getPercentage(earningsByType.emi_bonus)}%` }}></div>
              </div>
            </div>
            
            {/* Total Earnings */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-700">Total Earnings</span>
                <span className="text-base font-bold text-gray-900 font-mono">₹{earningsByType.total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Company Charges */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">10% Company Charges</span>
                <span className="text-red-500 font-mono">-₹{earningsByType.deduction.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Net Earnings */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-700">Net Earnings</span>
                <span className="text-base font-bold text-green-600 font-mono">₹{earningsByType.net.toFixed(2)}</span>
              </div>
            </div>

            {detailed && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Understanding Earnings Breakdown</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li>
                      <span className="font-medium">Direct Income:</span> 5% commission on every direct referral's package purchase.
                    </li>
                    <li>
                      <span className="font-medium">Binary Income:</span> 5% on matched business volume in your binary organization (1:2 or 2:1 matching).
                    </li>
                    <li>
                      <span className="font-medium">Level Income:</span> 62% of binary income distributed across your unlocked levels (up to 20 levels).
                    </li>
                    <li>
                      <span className="font-medium">Auto Pool Income:</span> Additional earnings from the 1:3:9 matrix pool once you qualify.
                    </li>
                    <li>
                      <span className="font-medium">EMI Bonus:</span> Equivalent to 1 EMI payment when you complete all payments on time.
                    </li>
                    <li>
                      <span className="font-medium">Deductions:</span> 10% company charges (2.5% goes to auto pool funding).
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
