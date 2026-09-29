import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../types/crm';
import {
  UserPlus,
  Key,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const { users, createUser, updateUserRole, resetUserPassword, toggleUserStatus, deleteUser } = useCRM();
  const { currentUser } = useAuth();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('sales_agent');
  const [tempPassword, setTempPassword] = useState('Bridgeye2026!');

  // Reset Password Modal
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [newTempPass, setNewTempPass] = useState('ResetPass123!');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      error('Missing fields', 'Name and email are required.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      error('Duplicate Email', 'A user with this email address already exists.');
      return;
    }

    const created = createUser({
      name,
      email: email.trim().toLowerCase(),
      role,
      tempPassword,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + users.length}?w=100&h=100&fit=crop&crop=faces`,
    });

    success('User Provisioned', `Account created for ${created.name} (${created.role}).`);
    setIsModalOpen(false);
    setName('');
    setEmail('');
    setRole('sales_agent');
    setTempPassword('Bridgeye2026!');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUserId || !newTempPass) return;

    resetUserPassword(resetModalUserId, newTempPass);
    success('Password Reset', 'Temporary password issued. User must change on next login.');
    setResetModalUserId(null);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'admin':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'sales_agent':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'editor':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Management & RBAC Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision team members, assign role permissions, issue temporary passwords, and control workspace access
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Role Capabilities Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { role: 'Super Admin', desc: 'Absolute authority over all users, data, settings & reset', color: 'border-rose-200 bg-rose-50/50' },
          { role: 'Admin', desc: 'Oversees deals, contacts, pipeline stages & integrations', color: 'border-blue-200 bg-blue-50/50' },
          { role: 'Sales Agent', desc: 'Manages assigned leads, deals & client interaction logs', color: 'border-emerald-200 bg-emerald-50/50' },
          { role: 'Editor', desc: 'Creates & manages email templates, content & messaging sequences', color: 'border-purple-200 bg-purple-50/50' },
          { role: 'Viewer', desc: 'Read-only access to executive dashboards & contact directories', color: 'border-slate-200 bg-slate-50/50' },
        ].map(item => (
          <div key={item.role} className={`p-3 rounded-xl border text-xs ${item.color}`}>
            <span className="font-bold text-slate-900 block">{item.role}</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Access Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Security State</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isSelf = currentUser?.id === u.id;
                const isSuperAdminUser = u.role === 'super_admin';

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px]">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isSuperAdminUser ? (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                          Super Admin
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => {
                            const newR = e.target.value as UserRole;
                            updateUserRole(u.id, newR);
                            success('Role Updated', `${u.name} is now ${newR}`);
                          }}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 capitalize text-xs"
                        >
                          {['admin', 'sales_agent', 'editor', 'viewer'].map(r => (
                            <option key={r} value={r}>
                              {r.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        disabled={isSelf || isSuperAdminUser}
                        onClick={() => {
                          toggleUserStatus(u.id);
                          success(
                            'Status Changed',
                            `${u.name} is now ${u.status === 'active' ? 'Inactive' : 'Active'}`
                          );
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.isTempPassword ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                          <Key className="w-3 h-3" />
                          <span>Must Reset Password</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                          <Lock className="w-3 h-3 text-emerald-500" />
                          <span>Custom Password Set</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setResetModalUserId(u.id);
                            setNewTempPass('BridgeyeTemp99!');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        >
                          Issue Temp Pass
                        </button>

                        {!isSelf && !isSuperAdminUser && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete user ${u.name}?`)) {
                                deleteUser(u.id);
                                success('Deleted', 'User removed from team.');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Provision User Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Taylor"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email ID (Login Username) *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl capitalize"
                >
                  <option value="sales_agent">Sales Agent (Manage own deals & contacts)</option>
                  <option value="admin">Admin (Manage team & configurations)</option>
                  <option value="editor">Editor (Email templates & communications)</option>
                  <option value="viewer">Viewer (Read-only reports & directory)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Temporary Password</label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={e => setTempPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  User will be prompted to replace this password on their first session.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Issue Temporary Password
            </h3>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Temporary Password</label>
                <input
                  type="text"
                  required
                  value={newTempPass}
                  onChange={e => setNewTempPass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResetModalUserId(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  Confirm & Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
