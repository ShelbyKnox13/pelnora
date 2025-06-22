import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  TreePine, 
  Users, 
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react";

export const BinaryTreeManager = () => {
  const [searchUserId, setSearchUserId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Fetch all users for search
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Fetch binary structure for selected user
  const { data: binaryData, isLoading: binaryLoading, refetch: refetchBinary } = useQuery({
    queryKey: ['/api/binary-structure', selectedUserId],
    enabled: !!selectedUserId,
  });

  // Fetch level statistics for selected user
  const { data: levelStats, isLoading: levelStatsLoading } = useQuery({
    queryKey: ['/api/level-statistics', selectedUserId],
    enabled: !!selectedUserId,
  });

  const handleSearch = () => {
    const userId = parseInt(searchUserId);
    if (userId && !isNaN(userId)) {
      setSelectedUserId(userId);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUserId(userId);
    setSearchUserId(userId.toString());
  };

  const filteredUsers = users?.filter((user: any) => 
    user.name.toLowerCase().includes(searchUserId.toLowerCase()) ||
    user.id.toString().includes(searchUserId) ||
    user.email.toLowerCase().includes(searchUserId.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Binary Tree Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by User ID, Name, or Email..."
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchUserId}>
              <Search className="h-4 w-4 mr-2" />
              View Tree
            </Button>
            {selectedUserId && (
              <Button variant="outline" onClick={() => refetchBinary()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>

          {/* User Search Results */}
          {searchUserId && !selectedUserId && (
            <div className="border rounded-lg max-h-60 overflow-y-auto">
              {usersLoading ? (
                <div className="p-4 space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="divide-y">
                  {filteredUsers.slice(0, 10).map((user: any) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">ID: {user.id} • {user.email}</p>
                      </div>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-gray-500 text-center">No users found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Binary Tree Display */}
      {selectedUserId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tree Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Binary Tree Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              {binaryLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-1/2" />
                    <Skeleton className="h-16 w-1/2" />
                  </div>
                </div>
              ) : binaryData ? (
                <div className="space-y-4">
                  {/* Root User */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-amber-500 text-white rounded-lg">
                      <p className="font-bold">{binaryData.user?.name}</p>
                      <p className="text-sm">ID: {binaryData.user?.id}</p>
                      <p className="text-xs">Left: {binaryData.user?.leftTeamCount} | Right: {binaryData.user?.rightTeamCount}</p>
                    </div>
                  </div>

                  {/* Left and Right Teams */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Team */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-center mb-3 text-green-600">Left Team ({binaryData.leftTeam?.length || 0})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {binaryData.leftTeam?.map((member: any) => (
                          <div key={member.id} className="p-2 bg-green-50 rounded text-sm">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-gray-600">ID: {member.id}</p>
                          </div>
                        )) || <p className="text-gray-500 text-center">No members</p>}
                      </div>
                    </div>

                    {/* Right Team */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-center mb-3 text-blue-600">Right Team ({binaryData.rightTeam?.length || 0})</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {binaryData.rightTeam?.map((member: any) => (
                          <div key={member.id} className="p-2 bg-blue-50 rounded text-sm">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-gray-600">ID: {member.id}</p>
                          </div>
                        )) || <p className="text-gray-500 text-center">No members</p>}
                      </div>
                    </div>
                  </div>

                  {/* Binary Matching Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Binary Matching Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Left Carry Forward:</p>
                        <p className="font-bold">₹{binaryData.user?.leftCarryForward || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Right Carry Forward:</p>
                        <p className="font-bold">₹{binaryData.user?.rightCarryForward || '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No binary data found</p>
              )}
            </CardContent>
          </Card>

          {/* Level Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Level Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {levelStatsLoading ? (
                <div className="space-y-2">
                  {Array(10).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : levelStats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Unlocked Levels</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {levelStats.unlockedLevels || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-gray-600">Max Levels</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {levelStats.maxLevels || 20}
                      </p>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {levelStats.levels?.slice(0, 10).map((level: any) => (
                      <div key={level.level} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant={level.status === 'unlocked' ? 'default' : 'secondary'}>
                            Level {level.level}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {level.members} members
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{level.earnings}</p>
                        </div>
                      </div>
                    )) || <p className="text-gray-500 text-center">No level data</p>}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No level statistics found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {!selectedUserId && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <TreePine className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Binary Tree Manager</h3>
              <p className="mb-4">Search for a user to view their binary tree structure and level statistics.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">View Team Structure</p>
                  <p className="text-xs">See left and right team members</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">Level Analysis</p>
                  <p className="text-xs">Check unlocked levels and earnings</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Eye className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">Binary Matching</p>
                  <p className="text-xs">Monitor carry forward amounts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};