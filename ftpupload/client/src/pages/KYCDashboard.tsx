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
  X 
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/kyc/dashboard', icon: LayoutDashboard },
  { name: 'KYC Verification', href: '/kyc/verification', icon: Shield },
  { name: 'Tickets', href: '/kyc/tickets', icon: TicketCheck },
  { name: 'User Management', href: '/kyc/users', icon: Users },
];

export default function KYCDashboard() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = '/kyc/dashboard' as string;

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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Pending KYC Verifications
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">24</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => handleNavigation('/kyc/verification')}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                        <TicketCheck className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Open Tickets
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">12</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => handleNavigation('/kyc/tickets')}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Verified Users
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">156</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <button
                        onClick={() => handleNavigation('/kyc/users')}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900">Recent KYC Submissions</h2>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <li key={item}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              User #{item}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                John Doe
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <Shield className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                PAN: ABCDE1234F
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Submitted on {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
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