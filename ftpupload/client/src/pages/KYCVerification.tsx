import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Cookies from 'js-cookie';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  TicketCheck, 
  LogOut, 
  Menu, 
  X,
  Search,
  Filter,
  Check,
  X as XIcon
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/kyc/dashboard', icon: LayoutDashboard },
  { name: 'KYC Verification', href: '/kyc/verification', icon: Shield },
  { name: 'Tickets', href: '/kyc/tickets', icon: TicketCheck },
  { name: 'User Management', href: '/kyc/users', icon: Users },
];

// Mock KYC submissions data
const mockSubmissions = [
  {
    id: 'KYC-001',
    userId: 'USR-001',
    userName: 'John Doe',
    email: 'john@example.com',
    panNumber: 'ABCDE1234F',
    idProofType: 'Aadhar Card',
    idProofNumber: '1234-5678-9012',
    status: 'pending',
    submittedAt: '2023-06-01T10:30:00',
  },
  {
    id: 'KYC-002',
    userId: 'USR-002',
    userName: 'Jane Smith',
    email: 'jane@example.com',
    panNumber: 'FGHIJ5678K',
    idProofType: 'Passport',
    idProofNumber: 'P1234567',
    status: 'pending',
    submittedAt: '2023-06-02T14:45:00',
  },
  {
    id: 'KYC-003',
    userId: 'USR-003',
    userName: 'Robert Johnson',
    email: 'robert@example.com',
    panNumber: 'LMNOP9012Q',
    idProofType: 'Driving License',
    idProofNumber: 'DL987654321',
    status: 'approved',
    submittedAt: '2023-05-28T09:15:00',
  },
  {
    id: 'KYC-004',
    userId: 'USR-004',
    userName: 'Sarah Williams',
    email: 'sarah@example.com',
    panNumber: 'QRSTU3456V',
    idProofType: 'Voter ID',
    idProofNumber: 'VID123456789',
    status: 'rejected',
    submittedAt: '2023-05-30T16:20:00',
  },
];

export default function KYCVerification() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = '/kyc/verification' as string;

  useEffect(() => {
    const checkAuth = () => {
      const kycAuth = Cookies.get('kycAuthenticated');
      const lastActivity = Cookies.get('kycLastActivity');
      
      if (!kycAuth || !lastActivity) {
        setLocation('/kyc');
        return;
      }

      // Check for session timeout (10 minutes)
      const lastActivityTime = parseInt(lastActivity);
      if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
        // Clear cookies with proper settings
        Cookies.remove('kycAuthenticated', { path: '/' });
        Cookies.remove('kycLastActivity', { path: '/' });
        setLocation('/kyc');
        return;
      }

      // Update last activity timestamp with proper settings
      Cookies.set('kycLastActivity', Date.now().toString(), { 
        expires: 1,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [setLocation]);

  const handleLogout = () => {
    // Clear cookies with proper settings
    Cookies.remove('kycAuthenticated', { path: '/' });
    Cookies.remove('kycLastActivity', { path: '/' });
    
    // Also clear any localStorage data to be safe
    localStorage.removeItem('kycAuthenticated');
    localStorage.removeItem('kycLastActivity');
    
    toast.success('Logged out successfully');
    
    // Add a small delay before navigation to ensure the toast is shown
    setTimeout(() => {
      setLocation('/kyc');
    }, 500);
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  // Filter submissions based on search query and status filter
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = 
      submission.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.panNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.idProofNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Handle approve KYC
  const handleApproveKYC = (id: string) => {
    setSubmissions(submissions.map(submission => 
      submission.id === id ? { ...submission, status: 'approved' as const } : submission
    ));
    toast.success('KYC approved successfully');
    setIsModalOpen(false);
  };

  // Handle reject KYC
  const handleRejectKYC = (id: string) => {
    setSubmissions(submissions.map(submission => 
      submission.id === id ? { ...submission, status: 'rejected' as const } : submission
    ));
    toast.success('KYC rejected successfully');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <a href="/" className="flex-shrink-0 flex items-center">
              <span className="font-playfair font-bold text-xl text-gold-dark">PELNORA</span>
              <span className="font-playfair ml-1 text-xl text-purple-dark">JEWELLERS</span>
            </a>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4">
            <a href="/" className="flex-shrink-0 flex items-center">
              <span className="font-playfair font-bold text-xl text-gold-dark">PELNORA</span>
              <span className="font-playfair ml-1 text-xl text-purple-dark">JEWELLERS</span>
            </a>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 my-auto">
                {navigation.find(item => item.href === pathname)?.name || 'KYC Panel'}
              </h1>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">KYC Verification Requests</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and verify user KYC submissions
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, PAN, or ID number..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        className="border border-gray-300 rounded-md px-3 py-2"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {filteredSubmissions.length > 0 ? (
                      filteredSubmissions.map((submission) => (
                        <li key={submission.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {submission.userName}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                {getStatusBadge(submission.status)}
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex sm:flex-col">
                                <p className="flex items-center text-sm text-gray-500">
                                  <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  {submission.email}
                                </p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <Shield className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  <span>PAN: {submission.panNumber}</span>
                                  <span className="mx-2">•</span>
                                  <span>{submission.idProofType}: {submission.idProofNumber}</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  Submitted on {formatDate(submission.submittedAt)}
                                </p>
                              </div>
                            </div>
                            {submission.status === 'pending' && (
                              <div className="mt-3 flex justify-end space-x-3">
                                <button
                                  onClick={() => handleApproveKYC(submission.id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectKYC(submission.id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  <XIcon className="mr-1 h-4 w-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-6 text-center text-gray-500">
                        No KYC submissions found matching your criteria.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}