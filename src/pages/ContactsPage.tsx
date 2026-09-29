import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp } from '../animations';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Contact, Activity } from '../types/crm';
import {
  Search,
  Plus,
  Trash2,
  X,
  History,
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { contacts, deals, activities, addContact, updateContact, deleteContact, addActivity } = useCRM();
  const { currentUser, hasPermission } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [stage, setStage] = useState<Contact['stage']>('lead');
  const [tagsInput, setTagsInput] = useState('');

  // Timeline Activity Log state
  const [newActivityType, setNewActivityType] = useState<Activity['type']>('note');
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDesc, setNewActivityDesc] = useState('');

  const canManage = hasPermission('manage_contacts');

  const filteredContacts = contacts.filter(c => {
    const matchesSearch =
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) {
      error('Missing fields', 'First name and email are required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newC = addContact({
      firstName,
      lastName,
      email,
      phone,
      companyName,
      jobTitle,
      stage,
      leadScore: 50,
      tags: tags.length ? tags : ['Prospect'],
      ownerId: currentUser?.id || 'usr_superadmin_01',
    });

    success('Contact Created', `${newC.firstName} ${newC.lastName} has been added.`);
    setIsCreateModalOpen(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setJobTitle('');
    setTagsInput('');
  };

  const handleLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newActivityTitle) return;

    addActivity({
      type: newActivityType,
      title: newActivityTitle,
      description: newActivityDesc,
      contactId: selectedContact.id,
      userId: currentUser?.id || 'usr_superadmin_01',
    });

    success('Activity Logged', 'Timeline updated with new interaction.');
    setNewActivityTitle('');
    setNewActivityDesc('');
  };

  const contactActivities = selectedContact
    ? activities.filter(a => a.contactId === selectedContact.id)
    : [];

  const contactDeals = selectedContact
    ? deals.filter(d => d.contactId === selectedContact.id)
    : [];

  return (
    <motion.section
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className="space-y-6"
    >
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contacts & Companies</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your address book, customer lifecycle status, and relationship timelines
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search contacts, emails, companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase">Stage:</span>
          {['all', 'lead', 'contacted', 'qualified', 'customer', 'churned'].map(s => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                stageFilter === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Contact Name</th>
                <th className="py-3.5 px-4">Company & Title</th>
                <th className="py-3.5 px-4">Lifecycle Stage</th>
                <th className="py-3.5 px-4">Lead Score</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className="hover:bg-slate-50/80 cursor-pointer transition"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-400 text-white font-bold text-xs flex items-center justify-center">
                        {c.firstName[0]}
                        {c.lastName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 hover:text-orange-600 transition">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-700">{c.companyName || '—'}</div>
                    <div className="text-[11px] text-slate-400">{c.jobTitle || 'Contact'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        c.stage === 'customer'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : c.stage === 'qualified'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : c.stage === 'contacted'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : c.stage === 'churned'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {c.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, c.leadScore)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{c.leadScore}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags || []).slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {(c.tags || []).length > 2 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px]">
                          +{c.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {canManage && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (window.confirm(`Delete ${c.firstName} ${c.lastName}?`)) {
                            deleteContact(c.id);
                            success('Deleted', 'Contact removed from CRM');
                            if (selectedContact?.id === c.id) setSelectedContact(null);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Contact Details & Timeline Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Header */}
            <div>
              <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                    {selectedContact.firstName[0]}
                    {selectedContact.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedContact.jobTitle || 'Executive'} at {selectedContact.companyName || 'Independent'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="p-6 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Email Address</span>
                  <a href={`mailto:${selectedContact.email}`} className="font-bold text-orange-600 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Phone</span>
                  <span className="font-bold text-slate-800">{selectedContact.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Lifecycle Stage</span>
                  <select
                    value={selectedContact.stage}
                    onChange={e => {
                      const newStg = e.target.value as Contact['stage'];
                      updateContact(selectedContact.id, { stage: newStg });
                      setSelectedContact({ ...selectedContact, stage: newStg });
                      success('Stage Updated', `Contact moved to ${newStg}`);
                    }}
                    className="mt-0.5 px-2 py-1 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800 capitalize"
                  >
                    {['lead', 'contacted', 'qualified', 'customer', 'churned'].map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Associated Deals */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Associated Deals ({contactDeals.length})
                  </h3>
                </div>
                {contactDeals.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No deals attached to this contact.</p>
                ) : (
                  <div className="space-y-2">
                    {contactDeals.map(d => (
                      <div
                        key={d.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-slate-500 capitalize">{d.stage.replace('_', ' ')}</div>
                        </div>
                        <div className="font-bold text-emerald-600">${d.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <History className="w-4 h-4 text-orange-500" />
                  <span>Interaction Timeline & Notes</span>
                </h3>

                {/* Log interaction form */}
                <form onSubmit={handleLogActivity} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex gap-2 text-xs">
                    {(['note', 'call', 'meeting', 'email'] as Activity['type'][]).map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setNewActivityType(t)}
                        className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                          newActivityType === t ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Subject or Activity Title..."
                    value={newActivityTitle}
                    onChange={e => setNewActivityTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <textarea
                    placeholder="Details or meeting summary..."
                    value={newActivityDesc}
                    onChange={e => setNewActivityDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                  >
                    Log Activity
                  </button>
                </form>

                {/* History Stream */}
                <div className="space-y-3">
                  {contactActivities.map(act => (
                    <div key={act.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{act.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contact Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Add New Contact</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as Contact['stage'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 capitalize"
                  >
                    {['lead', 'contacted', 'qualified', 'customer', 'churned'].map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Enterprise, High-Priority, Q4"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.section>
  );
};
