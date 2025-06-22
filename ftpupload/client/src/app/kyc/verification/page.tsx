'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
} from 'lucide-react';

interface KYCSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  panNumber: string;
  idProofType: string;
  idProofNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt: string | null;
  panCardImage: string;
  idProofImage: string;
}

export default function KYCVerification() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [selectedImage, setSelectedImage] = useState<'pan' | 'id' | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/kyc/submissions', {
        headers: {
          'x-kyc-auth': Cookies.get('kycAuthenticated') || '',
          'x-kyc-last-activity': Cookies.get('kycLastActivity') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/kyc/submissions/${id}/approve`, {
        method: 'POST',
        headers: {
          'x-kyc-auth': Cookies.get('kycAuthenticated') || '',
          'x-kyc-last-activity': Cookies.get('kycLastActivity') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve submission');
      }

      toast.success('KYC submission approved successfully');
      fetchSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve KYC submission');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/kyc/submissions/${id}/reject`, {
        method: 'POST',
        headers: {
          'x-kyc-auth': Cookies.get('kycAuthenticated') || '',
          'x-kyc-last-activity': Cookies.get('kycLastActivity') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject submission');
      }

      toast.success('KYC submission rejected successfully');
      fetchSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject KYC submission');
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const searchLower = searchQuery.toLowerCase();
    return (
      submission.userName.toLowerCase().includes(searchLower) ||
      submission.userEmail.toLowerCase().includes(searchLower) ||
      submission.panNumber.toLowerCase().includes(searchLower) ||
      submission.idProofNumber.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, PAN, or ID proof..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PAN Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{submission.userName}</div>
                    <div className="text-sm text-gray-500">{submission.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.panNumber}</div>
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setSelectedImage('pan');
                      }}
                      className="text-sm text-purple-600 hover:text-purple-900"
                    >
                      View PAN Card
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.idProofType}</div>
                    <div className="text-sm text-gray-500">{submission.idProofNumber}</div>
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setSelectedImage('id');
                      }}
                      className="text-sm text-purple-600 hover:text-purple-900"
                    >
                      View ID Proof
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        submission.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {submission.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(submission.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(submission.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedSubmission && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedImage === 'pan' ? 'PAN Card' : 'ID Proof'} - {selectedSubmission.userName}
              </h3>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setSelectedImage(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <img
              src={selectedImage === 'pan' ? selectedSubmission.panCardImage : selectedSubmission.idProofImage}
              alt={selectedImage === 'pan' ? 'PAN Card' : 'ID Proof'}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
} 