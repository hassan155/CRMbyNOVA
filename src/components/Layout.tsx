import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Mail,
  ShieldAlert,
  Settings,
  LogOut,
  Search,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  X,
  Download,
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const Layout: React.FC = () => {
  const { currentUser, logout, hasPermission } = useAuth();
  const { contacts, deals, exportCRMDataJSON, resetToDefaultDummyData } = useCRM();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, requiredAction: 'view_dashboard' },
    { label: 'Contacts & Companies', path: '/contacts', icon: Users, requiredAction: 'view_contacts' },
    { label: 'Sales Pipeline', path: '/deals', icon: Kanban, requiredAction: 'view_deals' },
    { label: 'Tasks & Activities', path: '/tasks', icon: CheckSquare, requiredAction: 'view_dashboard' },
    { label: 'Communication Hub', path: '/communications', icon: Mail, requiredAction: 'view_dashboard' },
    { label: 'User Management', path: '/users', icon: ShieldAlert, requiredAction: 'manage_users' },
    { label: 'Settings & Data', path: '/settings', icon: Settings, requiredAction: 'view_dashboard' },
  ];

  const filteredContacts = searchQuery.trim()
    ? contacts.filter(
        c =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const filteredDeals = searchQuery.trim()
    ? deals.filter(
        d =>
          (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (d.companyName && d.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleGlobalSearchNavigate = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'sales_agent':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'editor':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      <ChangePasswordModal />

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-lg">
              B
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight leading-none">Bridgeye</div>
              <div className="text-[10px] text-orange-400 font-semibold tracking-wide uppercase mt-0.5">
                Enterprise CRM
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-3 mx-3 my-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm ring-2 ring-orange-500/40">
            {currentUser?.name ? currentUser.name[0] : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
            <span
              className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getRoleBadgeColor(
                currentUser?.role
              )}`}
            >
              {currentUser?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const hasAccess = hasPermission(item.requiredAction as any);
            if (!hasAccess) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          {currentUser?.role === 'super_admin' && (
            <button
              onClick={() => {
                if (window.confirm('Reset all CRM data to the default sample dataset?')) {
                  resetToDefaultDummyData();
                  success('Database Reset', 'Sample data has been re-seeded.');
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition"
              title="Reset sample data"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Sample DB</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            <div className="relative w-full">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs text-slate-500 transition"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span>Search contacts, deals, or companies...</span>
                </div>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded font-mono text-slate-400">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={exportCRMDataJSON}
              title="Quick Backup JSON"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Backup</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsQuickCreateOpen(!isQuickCreateOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>

              {isQuickCreateOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Actions
                  </div>
                  <button
                    onClick={() => {
                      setIsQuickCreateOpen(false);
                      navigate('/contacts');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>New Contact</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickCreateOpen(false);
                      navigate('/deals');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-2"
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>New Deal</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsQuickCreateOpen(false);
                      navigate('/tasks');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 flex items-center gap-2"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>New Task</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Command / Search Palette Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search contacts, deals, companies..."
                autoFocus
                className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3 space-y-4">
              {searchQuery.trim() === '' ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Search across all contacts, deals, and records in your CRM.
                </div>
              ) : (
                <>
                  {filteredContacts.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                        Contacts ({filteredContacts.length})
                      </div>
                      <div className="space-y-1">
                        {filteredContacts.slice(0, 5).map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleGlobalSearchNavigate('/contacts')}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-800">
                                {c.firstName} {c.lastName}
                              </div>
                              <div className="text-slate-500 text-[11px]">{c.email} • {c.companyName}</div>
                            </div>
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-medium uppercase">
                              {c.stage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredDeals.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                        Deals ({filteredDeals.length})
                      </div>
                      <div className="space-y-1">
                        {filteredDeals.slice(0, 5).map(d => (
                          <div
                            key={d.id}
                            onClick={() => handleGlobalSearchNavigate('/deals')}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer text-xs"
                          >
                            <div>
                              <div className="font-semibold text-slate-800">{d.name}</div>
                              <div className="text-slate-500 text-[11px]">
                                ${d.amount.toLocaleString()} • {d.stage.replace('_', ' ')}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                              {d.probability}% prob
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredContacts.length === 0 && filteredDeals.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No matching records found for "{searchQuery}".
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 px-4">
              <span>Quick Navigation</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleGlobalSearchNavigate('/contacts')}
                  className="hover:text-slate-700"
                >
                  All Contacts
                </button>
                <span>•</span>
                <button
                  onClick={() => handleGlobalSearchNavigate('/deals')}
                  className="hover:text-slate-700"
                >
                  All Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
