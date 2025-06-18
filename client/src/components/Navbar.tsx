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
import { Bell, Menu, X, Crown } from "lucide-react";

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
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '2px' }}>
                PELNORA JEWELLERS
              </span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
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
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowLoginModal(true)}
                  variant="outline"
                  className="border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-bold px-6 transition-colors duration-300"
                >
                  Login
                </Button>
                <Button
                  onClick={() => setShowSignupModal(true)}
                  className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold px-6 transition-all duration-300 shadow-lg"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-600"
            >
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
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <div className="px-3 pt-4 flex flex-col space-y-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user?.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-3 pt-4 flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-center border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white font-bold transition-colors duration-300"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setShowSignupModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold transition-all duration-300 shadow-lg"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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
    </nav>
  );
};
