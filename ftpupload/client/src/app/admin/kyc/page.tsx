'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  Search,
  Filter,
  RefreshCw,
  Check,
  X,
  Eye,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface KYCSubmission {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  panNumber: string;
  idProofType: string;
  idProofNumber: string;
  panCardImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
}

export default function KYCVerification() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = Cookies.get('adminAuthenticated');
      const lastActivity = Cookies.get('adminLastActivity');
      
      if (!adminAuth || !lastActivity) {
        router.push('/admin');
        return false;
      }

      // Check for session timeout (10 minutes)
      const lastActivityTime = parseInt(lastActivity);
      if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
        // Clear cookies with proper settings
        Cookies.remove('adminAuthenticated', { path: '/' });
        Cookies.remove('adminLastActivity', { path: '/' });
        router.push('/admin');
        return false;
      }

      // Update last activity timestamp with proper settings
      Cookies.set('adminLastActivity', Date.now().toString(), { 
        expires: 1,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return true;
    };

    if (checkAuth()) {
      fetchKYCSubmissions();
    }
  }, [router]);

  const fetchKYCSubmissions = async () => {
    try {
      setLoading(true);
      const adminAuth = Cookies.get('adminAuthenticated');
      const adminLastActivity = Cookies.get('adminLastActivity');

      const response = await fetch('/api/admin/kyc', {
        headers: {
          'x-admin-auth': adminAuth || '',
          'x-admin-last-activity': adminLastActivity || '',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch KYC submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      toast.error('Failed to load KYC submissions');
      console.error('KYC submissions fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: number) => {
    try {
      const adminAuth = Cookies.get('adminAuthenticated');
      const adminLastActivity = Cookies.get('adminLastActivity');

      const response = await fetch(`/api/admin/kyc/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'x-admin-auth': adminAuth || '',
          'x-admin-last-activity': adminLastActivity || '',
        },
      });
      if (!response.ok) throw new Error('Failed to approve KYC submission');
      toast.success('KYC submission approved successfully');
      fetchKYCSubmissions();
    } catch (error) {
      toast.error('Failed to approve KYC submission');
      console.error('KYC approval error:', error);
    }
  };

  const handleReject = async (submissionId: number) => {
    try {
      const adminAuth = Cookies.get('adminAuthenticated');
      const adminLastActivity = Cookies.get('adminLastActivity');

      const response = await fetch(`/api/admin/kyc/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'x-admin-auth': adminAuth || '',
          'x-admin-last-activity': adminLastActivity || '',
        },
      });
      if (!response.ok) throw new Error('Failed to reject KYC submission');
      toast.success('KYC submission rejected successfully');
      fetchKYCSubmissions();
    } catch (error) {
      toast.error('Failed to reject KYC submission');
      console.error('KYC rejection error:', error);
    }
  };

  const handleViewImage = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setShowImageModal(true);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KYC Verification</h2>
          <p className="text-muted-foreground">
            Review and manage user KYC submissions
          </p>
        </div>
        <Button
          onClick={fetchKYCSubmissions}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions</CardTitle>
          <CardDescription>
            Review and verify user KYC documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, PAN, or ID proof..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>PAN Number</TableHead>
                  <TableHead>ID Proof</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{submission.userName}</span>
                          <span className="text-sm text-muted-foreground">{submission.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{submission.panNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="capitalize">{submission.idProofType.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">{submission.idProofNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            submission.status === 'approved'
                              ? 'default'
                              : submission.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}</span>
                          {submission.reviewedAt && (
                            <span className="text-sm text-muted-foreground">
                              Reviewed {formatDistanceToNow(new Date(submission.reviewedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewImage(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(submission.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(submission.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No KYC submissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {showImageModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PAN Card Image</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-[16/9] w-full">
              <img
                src={selectedSubmission.panCardImage}
                alt="PAN Card"
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 