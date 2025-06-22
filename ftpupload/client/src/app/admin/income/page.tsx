'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  IndianRupee,
  RefreshCw,
  Download,
  Plus,
  Minus,
  History,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface Earning {
  id: number;
  userId: number;
  amount: number;
  type: 'direct' | 'binary' | 'level' | 'autopool' | 'emi_bonus';
  description: string;
  createdAt: string;
  relatedUserId: number | null;
  user: {
    firstName: string;
    lastName: string;
    referralId: string;
  };
}

export default function IncomeControl() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Earning | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await fetch('/api/admin/earnings');
      if (!response.ok) throw new Error('Failed to fetch earnings');
      const data = await response.json();
      setEarnings(data);
    } catch (error) {
      toast.error('Failed to load earnings data');
      console.error('Earnings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = earnings.map(earning => ({
      'User': `${earning.user.firstName} ${earning.user.lastName}`,
      'Referral ID': earning.user.referralId,
      'Amount': earning.amount,
      'Type': earning.type,
      'Description': earning.description,
      'Date': new Date(earning.createdAt).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Earnings');
    XLSX.writeFile(wb, 'pelnora_earnings.xlsx');
  };

  const calculateTotals = () => {
    const totals = {
      direct: 0,
      binary: 0,
      level: 0,
      autopool: 0,
      emi_bonus: 0,
      total: 0,
    };

    earnings.forEach(earning => {
      totals[earning.type] += earning.amount;
      totals.total += earning.amount;
    });

    return totals;
  };

  const totals = calculateTotals();

  const handleDeleteEarning = async (earningId: number) => {
    if (!confirm('Are you sure you want to delete this earning?')) return;

    try {
      const response = await fetch(`/api/admin/earnings?id=${earningId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete earning');

      toast.success('Earning deleted successfully');
      fetchEarnings();
    } catch (error) {
      console.error('Error deleting earning:', error);
      toast.error('Failed to delete earning');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Direct Earnings</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totals.direct.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Binary Earnings</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totals.binary.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Level Earnings</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totals.level.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Auto Pool Earnings</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totals.autopool.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">EMI Bonus</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totals.emi_bonus.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                  <dd className="text-lg font-medium text-gray-900">₹{totals.total.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Earnings
        </button>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>

      {/* Earnings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {earnings.map((earning) => (
                <tr key={earning.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {earning.user.firstName} {earning.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{earning.user.referralId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      earning.type === 'direct'
                        ? 'bg-blue-100 text-blue-800'
                        : earning.type === 'binary'
                        ? 'bg-green-100 text-green-800'
                        : earning.type === 'level'
                        ? 'bg-purple-100 text-purple-800'
                        : earning.type === 'autopool'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {earning.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{earning.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {earning.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(earning.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedUser(earning)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <History className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEarning(earning.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Earnings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Earnings</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                userId: parseInt(formData.get('userId') as string),
                amount: parseFloat(formData.get('amount') as string),
                type: formData.get('type') as 'direct' | 'binary' | 'level' | 'autopool' | 'emi_bonus',
                description: formData.get('description') as string,
                relatedUserId: formData.get('relatedUserId') ? parseInt(formData.get('relatedUserId') as string) : null,
              };

              try {
                const response = await fetch('/api/admin/earnings', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error('Failed to create earning');

                toast.success('Earning added successfully');
                setShowAddModal(false);
                fetchEarnings();
              } catch (error) {
                console.error('Error creating earning:', error);
                toast.error('Failed to add earning');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                    User ID
                  </label>
                  <input
                    type="number"
                    name="userId"
                    id="userId"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      required
                      step="0.01"
                      min="0"
                      className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    id="type"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="direct">Direct</option>
                    <option value="binary">Binary</option>
                    <option value="level">Level</option>
                    <option value="autopool">Auto Pool</option>
                    <option value="emi_bonus">EMI Bonus</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="relatedUserId" className="block text-sm font-medium text-gray-700">
                    Related User ID (Optional)
                  </label>
                  <input
                    type="number"
                    name="relatedUserId"
                    id="relatedUserId"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Earnings History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Earnings History: {selectedUser.user.firstName} {selectedUser.user.lastName}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {earnings
                    .filter(earning => earning.userId === selectedUser.userId)
                    .map((earning) => (
                      <tr key={earning.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            earning.type === 'direct'
                              ? 'bg-blue-100 text-blue-800'
                              : earning.type === 'binary'
                              ? 'bg-green-100 text-green-800'
                              : earning.type === 'level'
                              ? 'bg-purple-100 text-purple-800'
                              : earning.type === 'autopool'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {earning.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{earning.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {earning.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(earning.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 