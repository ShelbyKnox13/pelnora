import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AuthModals } from "@/components/auth/AuthModals";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, X } from "lucide-react";

export const Navbar = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="font-playfair font-bold text-2xl text-gold-dark">Pelnora</span>
                <span className="font-playfair ml-1 text-2xl text-purple-dark">Jewellers</span>
              </Link>
              
              {/* Desktop navigation */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <Link href="/" className={`px-3 py-2 font-medium text-sm ${location === '/' ? 'border-gold-dark text-gold-dark border-b-2' : 'border-transparent text-gray-500 hover:border-gold-light hover:text-gold-dark border-b-2'}`}>
                  Home
                </Link>
                
                {isAuthenticated && (
                  <>
                    <Link href="/dashboard" className={`px-3 py-2 font-medium text-sm ${location === '/dashboard' ? 'border-gold-dark text-gold-dark border-b-2' : 'border-transparent text-gray-500 hover:border-gold-light hover:text-gold-dark border-b-2'}`}>
                      Dashboard
                    </Link>
                    <Link href="/team" className={`px-3 py-2 font-medium text-sm ${location === '/team' ? 'border-gold-dark text-gold-dark border-b-2' : 'border-transparent text-gray-500 hover:border-gold-light hover:text-gold-dark border-b-2'}`}>
                      My Team
                    </Link>
                    <Link href="/earnings" className={`px-3 py-2 font-medium text-sm ${location === '/earnings' ? 'border-gold-dark text-gold-dark border-b-2' : 'border-transparent text-gray-500 hover:border-gold-light hover:text-gold-dark border-b-2'}`}>
                      Earnings
                    </Link>
                    <Link href="/withdrawals" className={`px-3 py-2 font-medium text-sm ${location === '/withdrawals' ? 'border-gold-dark text-gold-dark border-b-2' : 'border-transparent text-gray-500 hover:border-gold-light hover:text-gold-dark border-b-2'}`}>
                      Withdrawals
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link href="/admin" className={`px-3 py-2 font-medium text-sm ${location === '/admin' ? 'border-gold-dark text-gold-dark border-b-2' : 'border-transparent text-gray-500 hover:border-gold-light hover:text-gold-dark border-b-2'}`}>
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <div className="flex space-x-4 items-center">
                  <button type="button" className="relative p-1 text-gray-500 hover:text-gold-dark">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-gold-dark"></span>
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-dark">
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">Admin Panel</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-gray-600 hover:text-gold-dark px-3 py-2 font-medium text-sm"
                  >
                    Login
                  </button>
                  <Button
                    onClick={() => setShowSignupModal(true)}
                    className="bg-gold-dark hover:bg-gold text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white pb-3 border-t border-gray-200">
            <div className="pt-2 space-y-1">
              <Link
                href="/"
                className={`block px-3 py-2 text-base font-medium ${
                  location === '/' ? 'text-gold-dark bg-gold-light/10' : 'text-gray-600 hover:text-gold-dark hover:bg-gold-light/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={`block px-3 py-2 text-base font-medium ${
                      location === '/dashboard' ? 'text-gold-dark bg-gold-light/10' : 'text-gray-600 hover:text-gold-dark hover:bg-gold-light/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/team"
                    className={`block px-3 py-2 text-base font-medium ${
                      location === '/team' ? 'text-gold-dark bg-gold-light/10' : 'text-gray-600 hover:text-gold-dark hover:bg-gold-light/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Team
                  </Link>
                  <Link
                    href="/earnings"
                    className={`block px-3 py-2 text-base font-medium ${
                      location === '/earnings' ? 'text-gold-dark bg-gold-light/10' : 'text-gray-600 hover:text-gold-dark hover:bg-gold-light/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Earnings
                  </Link>
                  <Link
                    href="/withdrawals"
                    className={`block px-3 py-2 text-base font-medium ${
                      location === '/withdrawals' ? 'text-gold-dark bg-gold-light/10' : 'text-gray-600 hover:text-gold-dark hover:bg-gold-light/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Withdrawals
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`block px-3 py-2 text-base font-medium ${
                    location === '/admin' ? 'text-gold-dark bg-gold-light/10' : 'text-gray-600 hover:text-gold-dark hover:bg-gold-light/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              {isAuthenticated ? (
                <div className="px-4 py-2 border-t border-gray-200 mt-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 pt-4 flex flex-col space-y-2">
                  <Button
                    onClick={() => {
                      setShowLoginModal(true);
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-center"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSignupModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-center bg-gold-dark hover:bg-gold text-white"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModals
        showLogin={showLoginModal}
        showSignup={showSignupModal}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseSignup={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
    </>
  );
};
