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
  MessageSquare,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

const navigation = [
  { name: 'Dashboard', href: '/kyc/dashboard', icon: LayoutDashboard },
  { name: 'KYC Verification', href: '/kyc/verification', icon: Shield },
  { name: 'Tickets', href: '/kyc/tickets', icon: TicketCheck },
  { name: 'User Management', href: '/kyc/users', icon: Users },
];

// Mock data for tickets
const mockTickets = [
  {
    id: 'TKT-001',
    subject: 'KYC Verification Issue',
    status: 'open',
    priority: 'high',
    createdBy: 'user123',
    createdAt: '2023-06-05T10:30:00',
    lastUpdated: '2023-06-05T14:45:00',
  },
  {
    id: 'TKT-002',
    subject: 'Document Upload Problem',
    status: 'in-progress',
    priority: 'medium',
    createdBy: 'user456',
    createdAt: '2023-06-04T09:15:00',
    lastUpdated: '2023-06-05T11:20:00',
  },
  {
    id: 'TKT-003',
    subject: 'Verification Delay',
    status: 'closed',
    priority: 'low',
    createdBy: 'user789',
    createdAt: '2023-06-03T16:45:00',
    lastUpdated: '2023-06-04T10:30:00',
  },
];

export default function KYCTickets() {
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pathname = '/kyc/tickets' as string;

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

  // Filter tickets based on search query and filters
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle creating a new ticket
  const handleCreateTicket = () => {
    const newTicketObj = {
      id: `TKT-${(tickets.length + 1).toString().padStart(3, '0')}`,
      subject: newTicket.subject,
      status: 'open' as const,
      priority: newTicket.priority,
      createdBy: 'kyc-agent',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    setTickets([newTicketObj, ...tickets]);
    setNewTicket({
      subject: '',
      description: '',
      priority: 'medium' as 'high' | 'medium' | 'low',
    });
    setIsDialogOpen(false);
    toast.success('Ticket created successfully');
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Open</span>;
      case 'in-progress':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Progress</span>;
      case 'closed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Closed</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Medium</span>;
      case 'low':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{priority}</span>;
    }
  };

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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Support Tickets</h2>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Ticket
                </button>
              </div>

              {/* New Ticket Dialog */}
              {isDialogOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Ticket</h3>
                            <div className="mt-2">
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                  <input
                                    type="text"
                                    id="subject"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Enter ticket subject"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                  <textarea
                                    id="description"
                                    rows={4}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Describe the issue in detail"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                  ></textarea>
                                </div>
                                <div>
                                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                                  <select
                                    id="priority"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'high' | 'medium' | 'low' })}
                                  >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={handleCreateTicket}
                          disabled={!newTicket.subject}
                        >
                          Create Ticket
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                          className="border border-gray-300 rounded-md px-3 py-2"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                          className="border border-gray-300 rounded-md px-3 py-2"
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                          <option value="all">All Priority</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket) => (
                        <li key={ticket.id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {ticket.subject}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                {getStatusBadge(ticket.status)}
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <TicketCheck className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  {ticket.id}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                  Created by: {ticket.createdBy}
                                </p>
                                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                  {getPriorityBadge(ticket.priority)}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  Last updated: {formatDate(ticket.lastUpdated)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <MessageSquare className="mr-1 h-4 w-4" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-6 text-center text-gray-500">
                        No tickets found matching your criteria.
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