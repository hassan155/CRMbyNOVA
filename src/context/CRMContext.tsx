import React, { createContext, useContext, useState } from 'react';
import type {
  CRMDatabase,
  Contact,
  Deal,
  Company,
  Activity,
  Task,
  EmailTemplate,
  CommunicationLog,
  IntegrationSetting,
  User,
  PipelineStage,
  TimeRangeFilter,
  CustomDateRange
} from '../types/crm';
import { StorageEngine } from '../utils/storage';
import { hashPassword } from '../utils/crypto';

export interface CRMContextType {
  db: CRMDatabase;
  contacts: Contact[];
  deals: Deal[];
  companies: Company[];
  activities: Activity[];
  tasks: Task[];
  templates: EmailTemplate[];
  communicationLogs: CommunicationLog[];
  integrations: IntegrationSetting[];
  pipelineStages: PipelineStage[];
  users: User[];
  
  // Date Filtering Global State
  timeRange: TimeRangeFilter;
  setTimeRange: (range: TimeRangeFilter) => void;
  customDateRange: CustomDateRange;
  setCustomDateRange: (range: CustomDateRange) => void;

  // Contacts Actions
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'lastActivityDate'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactById: (id: string) => Contact | undefined;

  // Companies Actions
  addCompany: (company: Omit<Company, 'id' | 'createdAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

  // Deals Actions
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  moveDealStage: (dealId: string, targetStage: PipelineStage) => void;

  // Activities Actions
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  deleteActivity: (id: string) => void;

  // Tasks Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;

  // Templates Actions
  addTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => EmailTemplate;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Communications Actions
  logCommunication: (log: Omit<CommunicationLog, 'id' | 'timestamp'>) => CommunicationLog;

  // Integrations Actions
  toggleIntegration: (id: string) => void;
  updateIntegrationConfig: (id: string, config: Record<string, string | boolean>) => void;

  // Users Management Actions (Super Admin / Admin)
  createUser: (user: { name: string; email: string; role: User['role']; tempPassword?: string; avatar?: string }) => User;
  updateUserRole: (userId: string, role: User['role']) => void;
  resetUserPassword: (userId: string, tempPass: string) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Pipeline Stages Actions
  updatePipelineStages: (stages: PipelineStage[]) => void;

  // Data Import & Export / Reset
  exportCRMDataJSON: () => void;
  exportContactsCSV: () => void;
  exportDealsCSV: () => void;
  importContactsFromCSV: (csvData: Partial<Contact>[]) => number;
  resetToDefaultDummyData: () => void;
  clearAllData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<CRMDatabase>(() => StorageEngine.getDatabase());
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const persist = (newDb: CRMDatabase) => {
    setDb(newDb);
    StorageEngine.saveDatabase(newDb);
  };

  // Contacts
  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'lastActivityDate'>): Contact => {
    const newContact: Contact = {
      ...contactData,
      id: `cont_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
    };
    const updated = { ...db, contacts: [newContact, ...db.contacts] };
    persist(updated);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    const updated = {
      ...db,
      contacts: db.contacts.map(c => (c.id === id ? { ...c, ...updates, lastActivityDate: new Date().toISOString() } : c)),
    };
    persist(updated);
  };

  const deleteContact = (id: string) => {
    const updated = {
      ...db,
      contacts: db.contacts.filter(c => c.id !== id),
      deals: db.deals.filter(d => d.contactId !== id),
      activities: db.activities.filter(a => a.contactId !== id),
      tasks: db.tasks.filter(t => t.contactId !== id),
    };
    persist(updated);
  };

  const getContactById = (id: string) => db.contacts.find(c => c.id === id);

  // Companies
  const addCompany = (comp: Omit<Company, 'id' | 'createdAt'>): Company => {
    const newComp: Company = {
      ...comp,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    persist({ ...db, companies: [newComp, ...db.companies] });
    return newComp;
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    persist({
      ...db,
      companies: db.companies.map(c => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const deleteCompany = (id: string) => {
    persist({
      ...db,
      companies: db.companies.filter(c => c.id !== id),
    });
  };

  // Deals
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persist({ ...db, deals: [newDeal, ...db.deals] });
    return newDeal;
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    persist({
      ...db,
      deals: db.deals.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)),
    });
  };

  const deleteDeal = (id: string) => {
    persist({
      ...db,
      deals: db.deals.filter(d => d.id !== id),
      activities: db.activities.filter(a => a.dealId !== id),
    });
  };

  const moveDealStage = (dealId: string, targetStage: PipelineStage) => {
    const targetDeal = db.deals.find(d => d.id === dealId);
    if (!targetDeal) return;

    let closedAt = targetDeal.closedAt;
    if (['closed_won', 'closed_lost'].includes(targetStage)) {
      closedAt = new Date().toISOString();
    }

    const updatedDeals = db.deals.map(d =>
      d.id === dealId
        ? {
            ...d,
            stage: targetStage,
            probability: targetStage === 'closed_won' ? 100 : targetStage === 'closed_lost' ? 0 : d.probability,
            closedAt,
            updatedAt: new Date().toISOString(),
          }
        : d
    );

    // Also auto-log activity
    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      type: 'status_change',
      title: `Stage updated to ${targetStage.replace('_', ' ').toUpperCase()}`,
      description: `Deal moved from ${targetDeal.stage} to ${targetStage}`,
      contactId: targetDeal.contactId,
      dealId: targetDeal.id,
      userId: targetDeal.ownerId,
      createdAt: new Date().toISOString(),
    };

    persist({
      ...db,
      deals: updatedDeals,
      activities: [newActivity, ...db.activities],
    });
  };

  // Activities
  const addActivity = (act: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const newAct: Activity = {
      ...act,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    persist({ ...db, activities: [newAct, ...db.activities] });
    return newAct;
  };

  const deleteActivity = (id: string) => {
    persist({
      ...db,
      activities: db.activities.filter(a => a.id !== id),
    });
  };

  // Tasks
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    persist({ ...db, tasks: [newTask, ...db.tasks] });
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    persist({
      ...db,
      tasks: db.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const toggleTaskComplete = (id: string) => {
    persist({
      ...db,
      tasks: db.tasks.map(t =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              completedAt: t.status !== 'completed' ? new Date().toISOString() : undefined,
            }
          : t
      ),
    });
  };

  const deleteTask = (id: string) => {
    persist({
      ...db,
      tasks: db.tasks.filter(t => t.id !== id),
    });
  };

  // Templates
  const addTemplate = (tpl: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): EmailTemplate => {
    const newTpl: EmailTemplate = {
      ...tpl,
      id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persist({ ...db, templates: [newTpl, ...db.templates] });
    return newTpl;
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    persist({
      ...db,
      templates: db.templates.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
    });
  };

  const deleteTemplate = (id: string) => {
    persist({
      ...db,
      templates: db.templates.filter(t => t.id !== id),
    });
  };

  // Communication Logs
  const logCommunication = (logData: Omit<CommunicationLog, 'id' | 'timestamp'>): CommunicationLog => {
    const newLog: CommunicationLog = {
      ...logData,
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    persist({ ...db, communicationLogs: [newLog, ...db.communicationLogs] });
    return newLog;
  };

  // Integrations
  const toggleIntegration = (id: string) => {
    persist({
      ...db,
      integrations: db.integrations.map(integ =>
        integ.id === id
          ? {
              ...integ,
              isConnected: !integ.isConnected,
              lastSyncAt: !integ.isConnected ? new Date().toISOString() : integ.lastSyncAt,
            }
          : integ
      ),
    });
  };

  const updateIntegrationConfig = (id: string, config: Record<string, string | boolean>) => {
    persist({
      ...db,
      integrations: db.integrations.map(integ =>
        integ.id === id ? { ...integ, config: { ...integ.config, ...config } } : integ
      ),
    });
  };

  // Users Management
  const createUser = (userData: { name: string; email: string; role: User['role']; tempPassword?: string; avatar?: string }): User => {
    const tempPass = userData.tempPassword || 'Bridgeye2026!';
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      passwordHash: hashPassword(tempPass),
      isTempPassword: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatar: userData.avatar,
    };
    persist({ ...db, users: [...db.users, newUser] });
    return newUser;
  };

  const updateUserRole = (userId: string, role: User['role']) => {
    persist({
      ...db,
      users: db.users.map(u => (u.id === userId ? { ...u, role } : u)),
    });
  };

  const resetUserPassword = (userId: string, tempPass: string) => {
    persist({
      ...db,
      users: db.users.map(u =>
        u.id === userId
          ? {
              ...u,
              passwordHash: hashPassword(tempPass),
              isTempPassword: true,
            }
          : u
      ),
    });
  };

  const toggleUserStatus = (userId: string) => {
    persist({
      ...db,
      users: db.users.map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      ),
    });
  };

  const deleteUser = (userId: string) => {
    persist({
      ...db,
      users: db.users.filter(u => u.id !== userId),
    });
  };

  const updatePipelineStages = (stages: PipelineStage[]) => {
    persist({ ...db, pipelineStages: stages });
  };

  // Data Import / Export / Wipe
  const exportCRMDataJSON = () => {
    const cleanDb = { ...db };
    const blob = new Blob([JSON.stringify(cleanDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bridgeye-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportContactsCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Title', 'Stage', 'Lead Score', 'Tags', 'Created At'];
    const rows = db.contacts.map(c => [
      `"${c.firstName}"`,
      `"${c.lastName}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.companyName || ''}"`,
      `"${c.jobTitle || ''}"`,
      `"${c.stage}"`,
      c.leadScore,
      `"${(c.tags || []).join(', ')}"`,
      `"${c.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDealsCSV = () => {
    const headers = ['Deal Name', 'Value ($)', 'Stage', 'Probability (%)', 'Contact', 'Company', 'Created At'];
    const rows = db.deals.map(d => [
      `"${d.name}"`,
      d.amount,
      `"${d.stage}"`,
      d.probability,
      `"${d.contactName || ''}"`,
      `"${d.companyName || ''}"`,
      `"${d.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `deals-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importContactsFromCSV = (records: Partial<Contact>[]): number => {
    const newContacts: Contact[] = records.map(r => ({
      id: `cont_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      firstName: r.firstName || 'Unknown',
      lastName: r.lastName || 'Contact',
      email: r.email || `contact_${Date.now()}@imported.com`,
      phone: r.phone || '',
      companyName: r.companyName || '',
      jobTitle: r.jobTitle || '',
      stage: r.stage || 'lead',
      leadScore: Number(r.leadScore) || 50,
      tags: r.tags || ['Imported'],
      ownerId: r.ownerId || db.users[0]?.id || 'usr_superadmin_01',
      createdAt: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
    }));

    persist({
      ...db,
      contacts: [...newContacts, ...db.contacts],
    });
    return newContacts.length;
  };

  const resetToDefaultDummyData = () => {
    const reset = StorageEngine.resetToDefault();
    setDb(reset);
  };

  const clearAllData = () => {
    const empty = StorageEngine.clearAllData();
    setDb(empty);
  };

  return (
    <CRMContext.Provider
      value={{
        db,
        contacts: db.contacts,
        deals: db.deals,
        companies: db.companies,
        activities: db.activities,
        tasks: db.tasks,
        templates: db.templates,
        communicationLogs: db.communicationLogs,
        integrations: db.integrations,
        pipelineStages: db.pipelineStages,
        users: db.users,
        timeRange,
        setTimeRange,
        customDateRange,
        setCustomDateRange,
        addContact,
        updateContact,
        deleteContact,
        getContactById,
        addCompany,
        updateCompany,
        deleteCompany,
        addDeal,
        updateDeal,
        deleteDeal,
        moveDealStage,
        addActivity,
        deleteActivity,
        addTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        logCommunication,
        toggleIntegration,
        updateIntegrationConfig,
        createUser,
        updateUserRole,
        resetUserPassword,
        toggleUserStatus,
        deleteUser,
        updatePipelineStages,
        exportCRMDataJSON,
        exportContactsCSV,
        exportDealsCSV,
        importContactsFromCSV,
        resetToDefaultDummyData,
        clearAllData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = (): CRMContextType => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
