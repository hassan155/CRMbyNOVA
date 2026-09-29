import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { LoginView } from './components/LoginView';

import { DashboardPage } from './pages/DashboardPage';
import { ContactsPage } from './pages/ContactsPage';
import { DealsKanbanPage } from './pages/DealsKanbanPage';
import { TasksPage } from './pages/TasksPage';
import { CommunicationHubPage } from './pages/CommunicationHubPage';
import { UsersManagementPage } from './pages/UsersManagementPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component based on user session & RBAC
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredAction?: string;
}> = ({ children, requiredAction }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading CRM Workspace...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredAction && !hasPermission(requiredAction as any)) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 m-6">
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">
          Your current account role does not have authorization to view this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// Public Route Guard (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginView />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="deals" element={<DealsKanbanPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="communications" element={<CommunicationHubPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredAction="manage_users">
              <UsersManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CRMProvider>
            <AppContent />
          </CRMProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
