export type UserRole = 'super_admin' | 'admin' | 'sales_agent' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  isTempPassword?: boolean;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  lastActive?: string;
}

export type PipelineStage = 
  | 'lead'
  | 'contacted'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'closed_won'
  | 'closed_lost';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  stage: 'lead' | 'contacted' | 'qualified' | 'customer' | 'churned';
  leadScore: number;
  tags: string[];
  ownerId: string;
  createdAt: string;
  lastActivityDate: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  phone?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: PipelineStage;
  probability: number;
  expectedCloseDate?: string;
  closedAt?: string;
  contactId?: string;
  contactName?: string;
  companyName?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'note' | 'call' | 'meeting' | 'email' | 'status_change';
  title: string;
  description: string;
  contactId?: string;
  dealId?: string;
  userId: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  dueDate: string;
  completedAt?: string;
  contactId?: string;
  assignedToId: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'sales' | 'onboarding' | 'follow_up' | 'support';
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  contactId: string;
  channel: 'email' | 'whatsapp' | 'sms';
  direction: 'inbound' | 'outbound';
  subject?: string;
  body: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface IntegrationSetting {
  id: string;
  name: string;
  description: string;
  category: string;
  isConnected: boolean;
  lastSyncAt?: string;
  config?: Record<string, string | boolean>;
}

export type TimeRangeFilter = '24h' | '7d' | '30d' | 'ytd' | 'custom';

export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

export type PermissionAction =
  | 'view_dashboard'
  | 'view_contacts'
  | 'manage_contacts'
  | 'view_deals'
  | 'manage_deals'
  | 'manage_users'
  | 'manage_settings'
  | 'manage_templates'
  | 'configure_integrations'
  | 'export_data'
  | 'import_data'
  | 'reset_database';

export interface CRMDatabase {
  users: User[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  activities: Activity[];
  tasks: Task[];
  templates: EmailTemplate[];
  communicationLogs: CommunicationLog[];
  integrations: IntegrationSetting[];
  pipelineStages: PipelineStage[];
}
