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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, RefreshCcw, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const AutoPoolManager = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("matrix");
  
  // Fetch auto pool matrix
  const { data: autoPoolEntries, isLoading } = useQuery({
    queryKey: ['/api/auto-pool'],
  });
  
  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Filter entries based on search
  const filteredEntries = autoPoolEntries
    ? autoPoolEntries.filter((entry: any) => {
        if (!searchQuery) return true;
        
        const user = users?.find((u: any) => u.id === entry.userId);
        return user && (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.referralId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.level.toString().includes(searchQuery)
        );
      })
    : [];
  
  // Group entries by level
  const entriesByLevel = filteredEntries.reduce((acc: any, entry: any) => {
    const level = entry.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(entry);
    return acc;
  }, {});
  
  // Calculate earnings for each level
  const getLevelEarningsSummary = () => {
    if (!autoPoolEntries) return [];
    
    const levelSummary: any = {};
    
    autoPoolEntries.forEach((entry: any) => {
      const level = entry.level;
      if (!levelSummary[level]) {
        levelSummary[level] = {
          level,
          userCount: 0,
          totalEarnings: 0,
          earningsPerUser: 0,
        };
      }
      
      levelSummary[level].userCount++;
    });
    
    // Calculate earnings based on level
    Object.keys(levelSummary).forEach(level => {
      const levelNum = parseInt(level);
      const userCount = levelSummary[level].userCount;
      
      // First level is 1:3, second is 1:9, third is 1:27
      const childrenMultiplier = Math.pow(3, levelNum);
      
      // Basic earnings calculation - this would be replaced with actual business logic
      const baseEarning = 100 * levelNum; // ₹100 per level as base
      const totalEarnings = baseEarning * childrenMultiplier;
      
      levelSummary[level].totalEarnings = totalEarnings;
      levelSummary[level].earningsPerUser = userCount > 0 ? totalEarnings / userCount : 0;
    });
    
    return Object.values(levelSummary);
  };
  
  const levelEarningsSummary = getLevelEarningsSummary();
  
  // Export auto pool data as CSV
  const exportAutoPoolCSV = () => {
    if (!autoPoolEntries || autoPoolEntries.length === 0) return;
    
    // Define CSV headers and prepare data
    const headers = 'ID,User ID,User Name,Level,Position,Parent ID,Join Date\n';
    
    const csvRows = autoPoolEntries.map((entry: any) => {
      const user = users?.find((u: any) => u.id === entry.userId);
      return [
        entry.id,
        entry.userId,
        user?.name || '',
        entry.level,
        entry.position,
        entry.parentId || '',
        entry.joinDate
      ].join(',');
    });
    
    // Create CSV content
    const csvContent = headers + csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pelnora_auto_pool_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate visual matrix for a level
  const renderMatrixLevel = (level: number) => {
    const entries = entriesByLevel[level] || [];
    
    if (entries.length === 0) {
      return (
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No members in Level {level}</h3>
          <p className="text-gray-500">This level doesn't have any members yet</p>
        </div>
      );
    }
    
    // For level 1, we show 1:3 matrix
    if (level === 1) {
      return (
        <div className="py-8">
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 text-purple-800 border-purple-200 border rounded-md p-3 mb-4 w-48 text-center">
              Root
            </div>
            <div className="w-1 h-8 bg-gray-200"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, idx) => {
                const entry = entries.find((e: any) => e.position === (idx + 1).toString());
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-1 h-8 bg-gray-200"></div>
                    <div className={`border rounded-md p-3 w-32 text-center ${
                      entry 
                        ? "bg-gold-100 text-gold-800 border-gold-200" 
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                      {entry 
                        ? getUserNameById(entry.userId)
                        : `Position ${idx + 1}`
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    
    // For level 2, we show 1:9 matrix (3 parents, each with 3 children)
    if (level === 2) {
      return (
        <div className="py-8 overflow-x-auto">
          <div className="flex flex-col items-center min-w-max">
            <div className="grid grid-cols-3 gap-4 mb-8">
              {Array(3).fill(0).map((_, parentIdx) => (
                <div key={parentIdx} className="flex flex-col items-center">
                  <div className={`border rounded-md p-3 w-32 text-center bg-purple-100 text-purple-800 border-purple-200`}>
                    {`Level 1 - ${parentIdx + 1}`}
                  </div>
                  <div className="w-1 h-8 bg-gray-200"></div>
                  <div className="grid grid-cols-3 gap-3">
                    {Array(3).fill(0).map((_, childIdx) => {
                      const position = (parentIdx * 3 + childIdx + 1).toString();
                      const entry = entries.find((e: any) => e.position === position);
                      return (
                        <div key={childIdx} className="flex flex-col items-center">
                          <div className="w-1 h-8 bg-gray-200"></div>
                          <div className={`border rounded-md p-2 w-24 text-center text-xs ${
                            entry 
                              ? "bg-gold-100 text-gold-800 border-gold-200" 
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {entry 
                              ? getUserNameById(entry.userId)
                              : `Pos ${position}`
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // For level 3+, we show a tabular view
    return (
      <div className="py-4">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Parent Position</TableHead>
                <TableHead>Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.position}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{getUserNameById(entry.userId)}</span>
                      <span className="text-sm text-muted-foreground">
                        {getUserReferralById(entry.userId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.parentId || "Root"}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(entry.joinDate), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  
  // Helper to get user name by ID
  const getUserNameById = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };
  
  // Helper to get referral ID
  const getUserReferralById = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.referralId : '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Auto Pool Manager</CardTitle>
              <CardDescription>Manage the auto pool matrix and earnings distribution</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={exportAutoPoolCSV}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/auto-pool'] });
                  toast({
                    title: "Data refreshed",
                    description: "Auto pool data has been refreshed",
                  });
                }}
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger value="matrix">Matrix View</TabsTrigger>
              <TabsTrigger value="earnings">Earnings Summary</TabsTrigger>
              <TabsTrigger value="members">Members List</TabsTrigger>
            </TabsList>
            
            {/* Search bar only for matrix and members tabs */}
            {activeTab !== "earnings" && (
              <div className="relative w-full sm:w-72 mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
            
            <TabsContent value="matrix" className="mt-0">
              {isLoading ? (
                <div className="space-y-8">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index}>
                      <Skeleton className="h-8 w-48 mb-4" />
                      <div className="grid grid-cols-3 gap-4">
                        {Array(3).fill(0).map((_, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <Skeleton className="h-16 w-32" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">Level 1 (1:3 Matrix)</h3>
                    {renderMatrixLevel(1)}
                  </div>
                  
                  <div className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">Level 2 (1:9 Matrix)</h3>
                    {renderMatrixLevel(2)}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Level 3 (1:27 Matrix)</h3>
                    {renderMatrixLevel(3)}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="earnings" className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Matrix Size</TableHead>
                        <TableHead>Total Earnings</TableHead>
                        <TableHead>Per User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {levelEarningsSummary.map((summary: any) => (
                        <TableRow key={summary.level}>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Level {summary.level}
                            </Badge>
                          </TableCell>
                          <TableCell>{summary.userCount}</TableCell>
                          <TableCell>1:{Math.pow(3, summary.level)}</TableCell>
                          <TableCell className="font-mono font-medium">
                            ₹{summary.totalEarnings.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono">
                            ₹{summary.earningsPerUser.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="members" className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredEntries.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry: any) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{getUserNameById(entry.userId)}</span>
                              <span className="text-sm text-muted-foreground">
                                {getUserReferralById(entry.userId)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                              Level {entry.level}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.position}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(entry.joinDate), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No auto pool members found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchQuery
                      ? "Try adjusting your search criteria"
                      : "No users have been assigned to the auto pool matrix yet"}
                  </p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};