'use client';

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { User, Lock, Mail, X, AlertCircle } from 'lucide-react';

interface UserData {
  userId: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserData) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { language } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = tab === 'login' 
      ? { identifier, password } 
      : { username, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || (tab === 'login' ? 'Login failed' : 'Registration failed'));
      }
    } catch {
      setLoading(false);
      setError('Network connection error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#edeaf5] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in relative text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#edeaf5] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-extrabold text-base text-[#2d1c66]">
              {tab === 'login' 
                ? (language === 'en' ? 'Sign In to Pulse360' : 'Injira mu Koperative') 
                : (language === 'en' ? 'Create Account' : 'Fungura Konti')}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded bg-[#f7f6fc] border border-[#edeaf5] text-slate-400 hover:text-[#2d1c66]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-[#f7f6fc] p-1 rounded-xl border border-[#edeaf5]">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              tab === 'login' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-slate-400 hover:text-[#2d1c66]'
            }`}
          >
            {language === 'en' ? 'Sign In' : 'Injira'}
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              tab === 'register' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-slate-400 hover:text-[#2d1c66]'
            }`}
          >
            {language === 'en' ? 'Register' : 'Iyandikishe'}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {tab === 'register' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#7c3aed]" /> {language === 'en' ? 'Username' : 'Izina ryo gukoresha'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. JeanMugisha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#ec4899]" /> {language === 'en' ? 'Email Address' : 'Imejiri'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7c3aed]" /> {language === 'en' ? 'Username or Email' : 'Izina cyangwa Imejiri'}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#7c3aed]" /> {language === 'en' ? 'Password' : 'Ijambo ry’ibanga'}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>



          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs transition shadow-md shadow-[#7c3aed]/15 disabled:opacity-50 mt-2"
          >
            {loading 
              ? (language === 'en' ? 'Processing...' : 'Bitegerejwe...') 
              : (tab === 'login' ? (language === 'en' ? 'Sign In' : 'Injira') : (language === 'en' ? 'Create Account' : 'Kora Konti'))}
          </button>
        </form>

      </div>
    </div>
  );
}
