import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { EARNING_TYPE_COLORS } from '@/lib/constants';
import { Earning } from '@shared/schema';
import * as XLSX from 'xlsx';

export default function AdminIncome() {
  const [, navigate] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    type: '',
    description: '',
    relatedUserId: '',
  });

  // Check authentication
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('adminAuthenticated');
    const lastActivity = sessionStorage.getItem('adminLastActivity');
    
    if (!adminAuth || !lastActivity) {
      navigate('/admin');
      return;
    }

    // Check for session timeout (10 minutes)
    const lastActivityTime = parseInt(lastActivity);
    if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
      sessionStorage.removeItem('adminAuthenticated');
      sessionStorage.removeItem('adminLastActivity');
      navigate('/admin');
      return;
    }

    // Update last activity timestamp
    sessionStorage.setItem('adminLastActivity', Date.now().toString());
  }, [navigate]);

  // Fetch earnings data
  const { data: earnings, isLoading, refetch } = useQuery<Earning[]>({
    queryKey: ['/api/admin/earnings'],
    enabled: true,
  });

  const handleAddEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/earnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(formData.userId),
          amount: formData.amount,
          type: formData.type,
          description: formData.description,
          relatedUserId: formData.relatedUserId ? parseInt(formData.relatedUserId) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add earning');
      }

      toast.success('Earning added successfully');
      setShowAddModal(false);
      setFormData({
        userId: '',
        amount: '',
        type: '',
        description: '',
        relatedUserId: '',
      });
      refetch();
    } catch (error) {
      toast.error('Failed to add earning');
    }
  };

  const handleDeleteEarning = async (earningId: string) => {
    if (!confirm('Are you sure you want to delete this earning?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/earnings?id=${earningId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete earning');
      }

      toast.success('Earning deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete earning');
    }
  };

  const handleExport = () => {
    if (!earnings) return;

    const worksheet = XLSX.utils.json_to_sheet(
      earnings.map((earning) => ({
        'User ID': earning.userId,
        'Amount': earning.amount,
        'Type': earning.earningType,
        'Description': earning.description,
        'Date': new Date(earning.createdAt).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Earnings');
    XLSX.writeFile(workbook, 'earnings.xlsx');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Income Control</h1>
          <div className="space-x-4">
            <Button onClick={() => setShowAddModal(true)}>Add Earning</Button>
            <Button onClick={handleExport}>Export to Excel</Button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings?.map((earning) => (
                <TableRow key={earning.id}>
                  <TableCell>{earning.userId}</TableCell>
                  <TableCell>₹{earning.amount}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${EARNING_TYPE_COLORS[earning.earningType].color}20`,
                        color: EARNING_TYPE_COLORS[earning.earningType].color,
                      }}
                    >
                      {earning.earningType}
                    </span>
                  </TableCell>
                  <TableCell>{earning.description}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEarning(earning.id.toString())}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Earning Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Earning</h2>
            <form onSubmit={handleAddEarning} className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct Referral</SelectItem>
                    <SelectItem value="binary">Binary Commission</SelectItem>
                    <SelectItem value="level">Level Income</SelectItem>
                    <SelectItem value="autopool">Auto Pool</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="relatedUserId">Related User ID (Optional)</Label>
                <Input
                  id="relatedUserId"
                  value={formData.relatedUserId}
                  onChange={(e) => setFormData({ ...formData, relatedUserId: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Earnings History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Earnings History - {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
                Close
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings
                  ?.filter((earning) => earning.userId === selectedUser.id)
                  .map((earning) => (
                    <TableRow key={earning.id}>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${EARNING_TYPE_COLORS[earning.earningType].color}20`,
                            color: EARNING_TYPE_COLORS[earning.earningType].color,
                          }}
                        >
                          {earning.earningType}
                        </span>
                      </TableCell>
                      <TableCell>₹{earning.amount}</TableCell>
                      <TableCell>{earning.description}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(earning.createdAt), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
} 