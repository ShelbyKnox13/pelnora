'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  Network,
  CreditCard,
  Wallet,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'KYC Verification', href: '/admin/kyc', icon: Shield },
  { name: 'Income Control', href: '/admin/income', icon: IndianRupee },
  { name: 'Binary Tree', href: '/admin/binary', icon: Network },
  { name: 'EMI Control', href: '/admin/emi', icon: CreditCard },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: Wallet },
  { name: 'Auto Pool', href: '/admin/auto-pool', icon: Layers },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = Cookies.get('adminAuthenticated');
      const lastActivity = Cookies.get('adminLastActivity');
      
      if (!adminAuth || !lastActivity) {
        router.push('/admin');
        return;
      }

      // Check for session timeout (10 minutes)
      const lastActivityTime = parseInt(lastActivity);
      if (Date.now() - lastActivityTime > 10 * 60 * 1000) {
        // Clear cookies with proper settings
        Cookies.remove('adminAuthenticated', { path: '/' });
        Cookies.remove('adminLastActivity', { path: '/' });
        router.push('/admin');
        return;
      }

      // Update last activity timestamp with proper settings
      Cookies.set('adminLastActivity', Date.now().toString(), { 
        expires: 1,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    // Clear cookies with proper settings
    Cookies.remove('adminAuthenticated', { path: '/' });
    Cookies.remove('adminLastActivity', { path: '/' });
    router.push('/admin');
    toast.success('Logged out successfully');
  };

  // Don't show layout on login page
  if (pathname === '/admin') {
    return <>{children}</>;
  }

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
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
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
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
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
                {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
              </h1>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 