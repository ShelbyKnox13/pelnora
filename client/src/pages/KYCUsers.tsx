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
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/kyc/dashboard', icon: LayoutDashboard },
  { name: 'KYC Verification', href: '/kyc/verification', icon: Shield },
  { name: 'Tickets', href: '/kyc/tickets', icon: TicketCheck },
  { name: 'User Management', href: '/kyc/users', icon: Users },
];

// Mock users data
const mockUsers = [
  {
    id: 'USR-001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    kycStatus: 'approved',
    registeredAt: '2023-05-01T10:30:00',
  },
  {
    id: 'USR-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '8765432109',
    kycStatus: 'pending',
    registeredAt: '2023-05-10T14:45:00',
  },
  {
    id: 'USR-003',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '7654321098',
    kycStatus: 'rejected',
    registeredAt: '2023-05-15T09:15:00',
  },
  {
    id: 'USR-004',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '6543210987',
    kycStatus: 'approved',
    registeredAt: '2023-05-20T16:20:00',
  },
  {
    id: 'USR-005',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '5432109876',
    kycStatus: 'pending',
    registeredAt: '2023-05-25T11:10:00',
  },
];

export default function KYCUsers() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('all');
  const pathname = '/kyc/users' as string;

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

  // Filter users based on search query and KYC status filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesKycStatus = kycStatusFilter === 'all' || user.kycStatus === kycStatusFilter;
    
    return matchesSearch && matchesKycStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get KYC status badge
  const getKycStatusBadge = (status: string) => {
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
                  <h2 className="text-lg font-medium text-gray-900">User Management</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage user accounts and their KYC status
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        className="border border-gray-300 rounded-md px-3 py-2"
                        value={kycStatusFilter}
                        onChange={(e) => setKycStatusFilter(e.target.value)}
                      >
                        <option value="all">All KYC Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KYC Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered On
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">{user.name.charAt(0)}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getKycStatusBadge(user.kycStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.registeredAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}