import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Deal, PipelineStage } from '../types/crm';
import {
  Plus,
  Calendar,
  Building,
  Trash2,
  X,
  Percent,
} from 'lucide-react';

const STAGES_CONFIG: { stage: PipelineStage; label: string; color: string; badge: string }[] = [
  { stage: 'lead', label: 'Lead Inbound', color: 'border-slate-300 bg-slate-50', badge: 'bg-slate-200 text-slate-700' },
  { stage: 'contacted', label: 'Contacted', color: 'border-blue-300 bg-blue-50/30', badge: 'bg-blue-100 text-blue-700' },
  { stage: 'meeting_scheduled', label: 'Meeting Scheduled', color: 'border-purple-300 bg-purple-50/30', badge: 'bg-purple-100 text-purple-700' },
  { stage: 'proposal_sent', label: 'Proposal Sent', color: 'border-amber-300 bg-amber-50/30', badge: 'bg-amber-100 text-amber-700' },
  { stage: 'closed_won', label: 'Closed Won', color: 'border-emerald-300 bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-700' },
  { stage: 'closed_lost', label: 'Closed Lost', color: 'border-rose-300 bg-rose-50/30', badge: 'bg-rose-100 text-rose-700' },
];

export const DealsKanbanPage: React.FC = () => {
  const { deals, contacts, addDeal, deleteDeal, moveDealStage } = useCRM();
  const { currentUser, hasPermission } = useAuth();
  const { success, error } = useToast();

  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // New deal form fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(25000);
  const [stage, setStage] = useState<PipelineStage>('lead');
  const [contactId, setContactId] = useState('');
  const [probability, setProbability] = useState<number>(30);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const canManage = hasPermission('manage_deals');

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    const dealId = draggedDealId || e.dataTransfer.getData('text/plain');
    if (dealId) {
      moveDealStage(dealId, targetStage);
      success('Stage Updated', `Deal moved to ${targetStage.replace('_', ' ')}`);
      setDraggedDealId(null);
    }
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0) {
      error('Invalid input', 'Please provide a deal title and valid amount');
      return;
    }

    const selectedContact = contacts.find(c => c.id === contactId);

    const created = addDeal({
      name,
      amount: Number(amount),
      stage,
      contactId: contactId || undefined,
      contactName: selectedContact ? `${selectedContact.firstName} ${selectedContact.lastName}` : undefined,
      companyName: selectedContact?.companyName || 'Enterprise Lead',
      ownerId: currentUser?.id || 'usr_superadmin_01',
      probability: Number(probability),
      expectedCloseDate,
    });

    success('Deal Added', `${created.name} added to pipeline.`);
    setIsModalOpen(false);
    setName('');
    setAmount(25000);
    setProbability(30);
  };

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Pipeline Kanban</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag and drop deals across stages or click to edit lifecycle details
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        )}
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
        {STAGES_CONFIG.map(({ stage: stgKey, label, color, badge }) => {
          const stageDeals = deals.filter(d => d.stage === stgKey);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div
              key={stgKey}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, stgKey)}
              className={`w-80 flex-shrink-0 rounded-2xl border ${color} flex flex-col max-h-full transition-all`}
            >
              {/* Stage Header */}
              <div className="p-3.5 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs rounded-t-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                    ${stageValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Deal Cards Container */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[200px]">
                {stageDeals.map(deal => {
                  return (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={e => handleDragStart(e, deal.id)}
                      onClick={() => setSelectedDeal(deal)}
                      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-500/40 cursor-grab active:cursor-grabbing transition text-xs space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition leading-snug">
                          {deal.name}
                        </h4>
                        <span className="text-xs font-black text-slate-900 flex-shrink-0">
                          ${deal.amount.toLocaleString()}
                        </span>
                      </div>

                      {deal.companyName && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{deal.companyName}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Percent className="w-3 h-3 text-emerald-500" />
                          <span>{deal.probability}% win</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'Q4'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageDeals.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-200/80 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Create New Opportunity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp Enterprise Expansion"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deal Value ($) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={e => setProbability(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Contact</label>
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">Select a contact (optional)</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.companyName || 'Independent'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as PipelineStage)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 capitalize"
                  >
                    {STAGES_CONFIG.map(s => (
                      <option key={s.stage} value={s.stage}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={e => setExpectedCloseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
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
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deal Details Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDeal.name}</h3>
                <div className="text-xl font-black text-emerald-600 mt-0.5">
                  ${selectedDeal.amount.toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedDeal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-1">Stage</span>
                  <select
                    value={selectedDeal.stage}
                    onChange={e => {
                      const newStg = e.target.value as PipelineStage;
                      moveDealStage(selectedDeal.id, newStg);
                      setSelectedDeal({ ...selectedDeal, stage: newStg });
                      success('Stage Updated', `Deal is now in ${newStg.replace('_', ' ')}`);
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                  >
                    {STAGES_CONFIG.map(s => (
                      <option key={s.stage} value={s.stage}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Probability</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedDeal.probability}%</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Account & Organization</span>
                <p className="font-bold text-slate-800">{selectedDeal.companyName || 'Not Assigned'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {canManage && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete this deal permanently?')) {
                      deleteDeal(selectedDeal.id);
                      setSelectedDeal(null);
                      success('Deleted', 'Deal removed from CRM.');
                    }
                  }}
                  className="flex items-center gap-1.5 text-rose-600 font-semibold text-xs hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Deal</span>
                </button>
              )}

              <button
                onClick={() => setSelectedDeal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
