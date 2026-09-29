import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Database,
  FileSpreadsheet,
  FileCode,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Mail,
  CreditCard,
  Link2,
  Plug,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    contacts,
    deals,
    integrations,
    exportCRMDataJSON,
    exportContactsCSV,
    exportDealsCSV,
    importContactsFromCSV,
    toggleIntegration,
    updateIntegrationConfig,
    resetToDefaultDummyData,
    clearAllData,
  } = useCRM();
  const { currentUser, hasPermission } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'integrations' | 'data' | 'system'>('integrations');
  const [selectedIntegModal, setSelectedIntegModal] = useState<string | null>(null);
  const [configKeyInput, setConfigKeyInput] = useState('');

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canExport = hasPermission('export_data');
  const canImport = hasPermission('import_data');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(Boolean);
        if (lines.length < 2) {
          error('Invalid CSV', 'File does not contain valid data rows.');
          return;
        }

        const newContacts = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
          if (cols.length >= 2) {
            newContacts.push({
              firstName: cols[0] || 'Imported',
              lastName: cols[1] || 'Lead',
              email: cols[2] || `lead_${Date.now()}_${i}@imported.com`,
              phone: cols[3] || '',
              companyName: cols[4] || 'Imported Organization',
              jobTitle: cols[5] || 'Executive',
              stage: 'lead' as const,
              leadScore: 50,
            });
          }
        }

        const count = importContactsFromCSV(newContacts);
        success('Import Successful', `${count} contacts imported into your CRM.`);
      } catch {
        error('Import Failed', 'Failed to parse CSV format.');
      }
    };
    reader.readAsText(file);
  };

  const getIntegIcon = (id: string) => {
    switch (id) {
      case 'integ_whatsapp':
        return <MessageSquare className="w-6 h-6 text-emerald-600" />;
      case 'integ_sheets':
        return <BarChart3 className="w-6 h-6 text-green-600" />;
      case 'integ_gmail':
        return <Mail className="w-6 h-6 text-red-500" />;
      case 'integ_slack':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'integ_stripe':
        return <CreditCard className="w-6 h-6 text-indigo-600" />;
      case 'integ_zapier':
        return <Link2 className="w-6 h-6 text-orange-500" />;
      default:
        return <Plug className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings & App Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure third-party connectors, manage data backups, CSV mapping, and database maintenance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'integrations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>App Center & Integrations</span>
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'data' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Data Import & Export</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'system' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Database & Maintenance</span>
        </button>
      </div>

      {/* Tab 1: Integrations Marketplace */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(integ => (
            <div
              key={integ.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-xs">
                    {getIntegIcon(integ.id)}
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={integ.isConnected}
                      onChange={() => {
                        toggleIntegration(integ.id);
                        success(
                          integ.isConnected ? 'Disconnected' : 'Connected',
                          `${integ.name} integration state updated.`
                        );
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-sm text-slate-900">{integ.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{integ.description}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span
                  className={`flex items-center gap-1.5 font-semibold text-[11px] ${
                    integ.isConnected ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      integ.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  {integ.isConnected ? 'Active & Synced' : 'Disabled'}
                </span>

                <button
                  onClick={() => {
                    setSelectedIntegModal(integ.id);
                    setConfigKeyInput(String(integ.config?.apiKey || ''));
                  }}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold transition"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Data Import & Export */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Export Center */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-600" />
              <span>Export CRM Data</span>
            </h3>
            <p className="text-xs text-slate-500">
              Download your CRM records instantly in CSV format or full JSON backup snapshot.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Contacts & Leads CSV</div>
                  <div className="text-[11px] text-slate-400">{contacts.length} total contacts</div>
                </div>
                <button
                  disabled={!canExport}
                  onClick={exportContactsCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Deals & Pipeline CSV</div>
                  <div className="text-[11px] text-slate-400">{deals.length} total deals</div>
                </div>
                <button
                  disabled={!canExport}
                  onClick={exportDealsCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">Complete Database Backup (JSON)</div>
                  <div className="text-[11px] text-slate-400">All tables, logs, tasks, users & settings</div>
                </div>
                <button
                  disabled={!canExport}
                  onClick={exportCRMDataJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                >
                  <FileCode className="w-4 h-4 text-orange-400" />
                  <span>Backup JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* CSV Import Center */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-orange-600" />
              <span>Import Contacts via CSV</span>
            </h3>
            <p className="text-xs text-slate-500">
              Upload existing contact lists. Supported columns: First Name, Last Name, Email, Phone, Company, Job Title.
            </p>

            <div className="border-2 border-dashed border-slate-200 hover:border-orange-500/50 rounded-2xl p-8 text-center transition">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">Drag & drop your CSV file here, or browse</div>
              <p className="text-[11px] text-slate-400 mt-1">Automatic column field mapping supported</p>

              <label className="mt-4 inline-block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-orange-500/20">
                <span>Select CSV File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={!canImport}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Database & Maintenance */}
      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Database Reset & State Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin controls for managing sample datasets and encrypted local storage
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-amber-900">Reset to Default Sample Database</h4>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Re-populates all modules with high-fidelity dummy leads, deals, tasks and templates.
                </p>
              </div>
              <button
                disabled={!isSuperAdmin}
                onClick={() => {
                  if (window.confirm('Reset all CRM data to initial sample dataset?')) {
                    resetToDefaultDummyData();
                    success('Reset Complete', 'Default dummy database restored.');
                  }
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Seed DB</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-rose-900">Clear All Transactional Records</h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Deletes all contacts, deals, activities and tasks to start with an entirely fresh, blank slate.
                </p>
              </div>
              <button
                disabled={!isSuperAdmin}
                onClick={() => {
                  if (window.confirm('Are you sure you want to wipe all CRM contacts and deals?')) {
                    clearAllData();
                    success('Database Cleared', 'All records have been purged.');
                  }
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration Configure Modal */}
      {selectedIntegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
              Configure Integration Credentials
            </h3>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Secret / Webhook URL</label>
                <input
                  type="text"
                  value={configKeyInput}
                  onChange={e => setConfigKeyInput(e.target.value)}
                  placeholder="e.g. sk_live_990141..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 text-xs">
              <button
                onClick={() => setSelectedIntegModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateIntegrationConfig(selectedIntegModal, { apiKey: configKeyInput });
                  success('Saved', 'Integration configuration saved.');
                  setSelectedIntegModal(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Save Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
