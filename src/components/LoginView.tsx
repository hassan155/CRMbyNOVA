import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('admin@bridgeye.com');
  const [password, setPassword] = useState('Nova123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      success('Welcome back!', 'Successfully signed in to Bridgeye CRM');
    } else {
      toastError('Login Failed', res.error || 'Invalid credentials');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Brand Logo */}
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20 text-white font-black text-2xl">
            B
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Bridgeye</h1>
            <p className="text-xs text-orange-400 font-medium">Enterprise Growth CRM</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-bold text-slate-100">
          Sign in to your CRM workspace
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Protected client-side architecture with multi-role access control
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-700/60">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-orange-500/25 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Bridgeye</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pre-Configured Demo Accounts (Click to test):</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@bridgeye.com', 'Nova123')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-orange-500/30 hover:border-orange-500 text-left transition group"
              >
                <div className="font-semibold text-orange-400 group-hover:text-orange-300 flex items-center justify-between">
                  <span>Super Admin</span>
                  <Shield className="w-3 h-3" />
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">admin@bridgeye.com</div>
                <div className="text-[10px] text-slate-500">Pass: Nova123</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('sarah.connor@bridgeye.com', 'Sarah123!')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-left transition group"
              >
                <div className="font-semibold text-blue-400 group-hover:text-blue-300 flex items-center justify-between">
                  <span>Admin Role</span>
                  <Lock className="w-3 h-3" />
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">sarah.connor@...</div>
                <div className="text-[10px] text-slate-500">Pass: Sarah123!</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('marcus.vance@bridgeye.com', 'Marcus123!')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-left transition group"
              >
                <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>Sales Agent</span>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">marcus.vance@...</div>
                <div className="text-[10px] text-slate-500">Pass: Marcus123!</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('david.kim@bridgeye.com', 'David123!')}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-left transition group"
              >
                <div className="font-semibold text-purple-400 group-hover:text-purple-300 flex items-center justify-between">
                  <span>Editor Role</span>
                  <Layers className="w-3 h-3" />
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">david.kim@...</div>
                <div className="text-[10px] text-slate-500">Pass: David123!</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Bridgeye CRM v2.4 • Netlify Static & Serverless Ready • Client-Side RBAC
        </div>
      </div>
    </div>
  );
};
