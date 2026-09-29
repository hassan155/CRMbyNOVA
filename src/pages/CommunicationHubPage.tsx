import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { EmailTemplate } from '../types/crm';
import {
  Mail,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export const CommunicationHubPage: React.FC = () => {
  const { templates, communicationLogs, contacts, addTemplate, deleteTemplate, logCommunication } = useCRM();
  const { hasPermission } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'templates' | 'chat_logs'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(templates[0] || null);

  // New Template Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplSubject, setTplSubject] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplCategory, setTplCategory] = useState<EmailTemplate['category']>('sales');

  // Quick Chat/WhatsApp send simulation state
  const [chatChannel, setChatChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp');
  const [chatContactId, setChatContactId] = useState(contacts[0]?.id || '');
  const [chatMessage, setChatMessage] = useState('');
  const [chatSubject, setChatSubject] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canManageTemplates = hasPermission('manage_templates');

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName || !tplSubject || !tplBody) {
      error('Missing fields', 'Please fill out name, subject and body.');
      return;
    }

    const created = addTemplate({
      name: tplName,
      subject: tplSubject,
      body: tplBody,
      category: tplCategory,
      variables: ['firstName', 'companyName'],
    });

    success('Template Saved', `Template "${created.name}" created.`);
    setIsModalOpen(false);
    setSelectedTemplate(created);
    setTplName('');
    setTplSubject('');
    setTplBody('');
  };

  const handleSendMockMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !chatContactId) {
      error('Cannot send', 'Please select a contact and type a message.');
      return;
    }

    const targetContact = contacts.find(c => c.id === chatContactId);

    logCommunication({
      contactId: chatContactId,
      channel: chatChannel,
      direction: 'outbound',
      subject: chatSubject || `${chatChannel.toUpperCase()} Outbound Message`,
      body: chatMessage,
      status: 'sent',
    });

    success(
      'Message Dispatched',
      `Sent via ${chatChannel.toUpperCase()} to ${targetContact?.firstName || 'Contact'}.`
    );
    setChatMessage('');
    setChatSubject('');
  };

  const copyTemplateContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Copied', 'Template body copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Email & Communication Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage high-conversion email templates, sequences, and omnichannel communication logs
          </p>
        </div>

        {canManageTemplates && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'templates' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Templates & Sequences</span>
        </button>
        <button
          onClick={() => setActiveTab('chat_logs')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'chat_logs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Omnichannel Messaging & Logs</span>
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Directory List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Templates ({templates.length})
            </h3>

            <div className="space-y-2">
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedTemplate?.id === tpl.id
                      ? 'border-orange-500 bg-orange-50/40 text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold truncate">{tpl.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                      {tpl.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{tpl.subject}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Preview and Editor */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedTemplate ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedTemplate.name}</h2>
                    <span className="text-xs text-slate-400 font-medium capitalize">
                      Category: {selectedTemplate.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyTemplateContent(selectedTemplate.body, selectedTemplate.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                    >
                      {copiedId === selectedTemplate.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Body</span>
                        </>
                      )}
                    </button>

                    {canManageTemplates && (
                      <button
                        onClick={() => {
                          if (window.confirm('Delete template?')) {
                            deleteTemplate(selectedTemplate.id);
                            setSelectedTemplate(templates.find(t => t.id !== selectedTemplate.id) || null);
                            success('Deleted', 'Template removed');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subject Line</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Body Content</label>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap font-mono text-slate-800 leading-relaxed">
                    {selectedTemplate.body}
                  </div>
                </div>

                <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-200/80 text-[11px] text-orange-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>
                    Supported merge tokens: <code className="bg-orange-100 px-1 py-0.5 rounded font-mono">{"{{firstName}}"}</code>, <code className="bg-orange-100 px-1 py-0.5 rounded font-mono">{"{{companyName}}"}</code>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Select or create a template to preview.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'chat_logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Direct Send Console */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Direct Omnichannel Dispatch</h3>
            <p className="text-xs text-slate-500">Send simulated WhatsApp, Email or SMS directly to a CRM contact</p>

            <form onSubmit={handleSendMockMessage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Contact</label>
                <select
                  value={chatContactId}
                  onChange={e => setChatContactId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['whatsapp', 'email', 'sms'] as const).map(ch => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => setChatChannel(ch)}
                      className={`py-2 rounded-xl font-bold uppercase text-[10px] transition ${
                        chatChannel === ch
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {chatChannel === 'email' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={chatSubject}
                    onChange={e => setChatSubject(e.target.value)}
                    placeholder="Email subject..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  rows={4}
                  required
                  placeholder="Type message here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch {chatChannel.toUpperCase()}</span>
              </button>
            </form>
          </div>

          {/* History Stream */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Communication Timeline & History</h3>
            <p className="text-xs text-slate-500">Real-time log of customer touchpoints across all channels</p>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {communicationLogs.map(log => {
                const contact = contacts.find(c => c.id === log.contactId);

                return (
                  <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.channel === 'whatsapp'
                              ? 'bg-emerald-100 text-emerald-700'
                              : log.channel === 'email'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {log.channel}
                        </span>
                        <span className="font-bold text-slate-900">
                          {contact ? `${contact.firstName} ${contact.lastName}` : 'Contact'}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">({log.direction})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {log.subject && (
                      <div className="font-semibold text-slate-800 text-[11px]">{log.subject}</div>
                    )}
                    <div className="text-slate-600 text-[11px] leading-relaxed">{log.body}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-200">
              Create Email Template
            </h3>

            <form onSubmit={handleCreateTemplate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Executive Pitch"
                  value={tplName}
                  onChange={e => setTplName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={tplCategory}
                  onChange={e => setTplCategory(e.target.value as EmailTemplate['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl capitalize"
                >
                  {['sales', 'onboarding', 'follow_up', 'support'].map(c => (
                    <option key={c} value={c}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  required
                  placeholder="Quick question regarding {{companyName}}"
                  value={tplSubject}
                  onChange={e => setTplSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Body Content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Hi {{firstName}},&#10;&#10;I wanted to touch base regarding your team at {{companyName}}..."
                  value={tplBody}
                  onChange={e => setTplBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
