import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, PermissionAction } from '../types/crm';
import { StorageEngine } from '../utils/storage';
import { verifyPassword, hashPassword } from '../utils/crypto';

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTempPasswordModalOpen: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  dismissPasswordPrompt: () => void;
  hasPermission: (action: PermissionAction, resourceOwnerId?: string) => boolean;
  checkRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'bridgeye_crm_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTempPasswordModalOpen, setIsTempPasswordModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const db = StorageEngine.getDatabase();
      const sessionUserId = localStorage.getItem(SESSION_KEY);
      if (sessionUserId) {
        const found = db.users.find(u => u.id === sessionUserId);
        if (found && found.status === 'active') {
          setCurrentUser(found);
          if (found.isTempPassword) {
            setIsTempPasswordModalOpen(true);
          }
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (e) {
      console.error('Session load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const db = StorageEngine.getDatabase();
      const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      
      if (!user) {
        return { success: false, error: 'Invalid email address or user not found' };
      }
      
      if (user.status === 'inactive') {
        return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
      }

      const isValid = verifyPassword(pass, user.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Incorrect password entered' };
      }

      // Update last active
      const updatedUsers = db.users.map(u => 
        u.id === user.id ? { ...u, lastActive: new Date().toISOString() } : u
      );
      StorageEngine.saveDatabase({ ...db, users: updatedUsers });

      setCurrentUser(user);
      localStorage.setItem(SESSION_KEY, user.id);

      if (user.isTempPassword) {
        setIsTempPasswordModalOpen(true);
      }

      return { success: true };
    } catch {
      return { success: false, error: 'An unexpected error occurred during login.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsTempPasswordModalOpen(false);
  };

  const updateUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    try {
      const db = StorageEngine.getDatabase();
      const newHash = hashPassword(newPassword);
      const updatedUser: User = {
        ...currentUser,
        passwordHash: newHash,
        isTempPassword: false,
      };

      const updatedUsers = db.users.map(u => u.id === currentUser.id ? updatedUser : u);
      StorageEngine.saveDatabase({ ...db, users: updatedUsers });
      
      setCurrentUser(updatedUser);
      setIsTempPasswordModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update password' };
    }
  };

  const dismissPasswordPrompt = () => {
    setIsTempPasswordModalOpen(false);
  };

  const checkRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  const hasPermission = (action: PermissionAction, resourceOwnerId?: string): boolean => {
    if (!currentUser) return false;

    // Super Admin has unrestricted access to everything
    if (currentUser.role === 'super_admin') return true;

    // Admin has access to manage team and oversee CRM data
    if (currentUser.role === 'admin') {
      return true;
    }

    switch (action) {
      case 'manage_users':
      case 'manage_settings':
      case 'reset_database':
      case 'configure_integrations':
      case 'export_data':
      case 'import_data':
        return false;

      case 'manage_deals':
      case 'manage_contacts':
        if (currentUser.role === 'sales_agent') {
          if (!resourceOwnerId) return true;
          return resourceOwnerId === currentUser.id;
        }
        return false;

      case 'view_deals':
      case 'view_contacts':
      case 'view_dashboard':
        return true;

      case 'manage_templates':
        return currentUser.role === 'editor' || currentUser.role === 'sales_agent';

      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isTempPasswordModalOpen,
        login,
        logout,
        updateUserPassword,
        dismissPasswordPrompt,
        hasPermission,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
