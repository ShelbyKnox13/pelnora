import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, LevelStatistics } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface LevelStatisticsProps {
  userPackage: Package;
  onReset?: () => void;
}

export const LevelStatistics = ({ userPackage, onReset }: LevelStatisticsProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [levelStats, setLevelStats] = useState<LevelStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  // Use actual values from the database
  const unlockedLevels = userPackage.unlockedLevels || 0;
  const directReferrals = userPackage.directReferrals || 0;
  const progressPercentage = (unlockedLevels / 20) * 100;

  // Calculate next level requirements
  const nextLevel = unlockedLevels + 1;
  const referralsNeeded = Math.ceil(nextLevel / 2) - directReferrals;

  useEffect(() => {
    const fetchLevelStats = async () => {
      try {
        const response = await fetch('/api/level-statistics/me');
        if (!response.ok) throw new Error('Failed to fetch level statistics');
        const data = await response.json();
        setLevelStats(data);
      } catch (error) {
        console.error('Error fetching level statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLevelStats();
  }, []);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const response = await fetch('/api/auth/reset-user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userPackage.userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset stats');
      }

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error resetting stats:', error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Level Statistics</CardTitle>
        <Button 
          variant="destructive" 
          onClick={handleReset}
          disabled={isResetting || (directReferrals === 0 && unlockedLevels === 0)}
        >
          {isResetting ? 'Resetting...' : 'Reset Referrals'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Level Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Unlocked Levels</span>
              <span className="text-sm font-medium">{unlockedLevels} / 20</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">{progressPercentage.toFixed(0)}% Complete</p>
          </div>

          {/* Direct Referrals */}
          <div>
            <p className="text-sm font-medium">Direct Referrals</p>
            <p className="text-2xl font-bold">{directReferrals}</p>
            <p className="text-sm text-muted-foreground">Each referral unlocks 2 levels</p>
          </div>

          {/* Next Level Unlock */}
          {unlockedLevels < 20 && (
            <div>
              <p className="text-sm font-medium">Next Level Unlock</p>
              <p className="text-lg font-semibold">Level {nextLevel}</p>
              <p className="text-sm text-muted-foreground">
                Need {referralsNeeded} more direct {referralsNeeded === 1 ? 'referral' : 'referrals'}
              </p>
            </div>
          )}

          {/* Level Details */}
          <div>
            <div className="grid grid-cols-4 gap-4 text-sm font-medium">
              <div>Level</div>
              <div>Status</div>
              <div>Members</div>
              <div>Earnings</div>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading level statistics...</div>
            ) : (
              Array.from({ length: 20 }, (_, i) => i + 1).map((level) => {
                const levelStat = levelStats.find(stat => stat.level === level);
                return (
                  <div key={level} className="grid grid-cols-4 gap-4 text-sm">
                    <div>Level {level}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        levelStat?.status === 'unlocked' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {levelStat?.status === 'unlocked' ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <div>{levelStat?.memberCount || '-'}</div>
                    <div>₹{levelStat?.earnings || '0.00'}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 