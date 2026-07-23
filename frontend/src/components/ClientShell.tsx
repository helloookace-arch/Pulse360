'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './AppContext';
import AuthModal from './AuthModal';
import {
  Menu,
  X,
  User,
  Heart,
  Languages,
  Type,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    language,
    toggleLanguage,
    sessionId,
    speak,
    fontSize,
    setFontSize
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => setAuthUser(null));

    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.broadcastNotice) {
          setBroadcastNotice(data.settings.broadcastNotice);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAuthUser(null);
    speak(language === 'en' ? 'Logged out successfully' : 'Uzasohotse neza');
  };

  const baseMenuItems = [
    { href: '/', labelEn: 'Home', labelRw: 'Ahabanza' },
    { href: '/learn', labelEn: 'Learn', labelRw: 'Soma' },
    { href: '/stories', labelEn: 'Stories', labelRw: 'Ubuhamya' },
    { href: '/ask', labelEn: 'Ask', labelRw: 'Baza' },
    { href: '/consultation', labelEn: 'Consultation', labelRw: 'Umujyanama' },
    { href: '/clinics', labelEn: 'Find a Clinic', labelRw: 'Shaka Ivuriro' },
    { href: '/accessibility', labelEn: 'Accessibility', labelRw: 'Aboroherwa' }
  ];

  const menuItems = authUser?.role === 'admin' 
    ? [...baseMenuItems, { href: '/admin', labelEn: 'Admin Panel', labelRw: 'Admin Panel' }]
    : baseMenuItems;

  const anonymousHash = sessionId ? sessionId.substring(0, 5).toUpperCase() : 'PEER';

  const readItem = (en: string, rw: string) => {
    speak(language === 'en' ? en : rw);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f6fc] text-[#493f6d]">
      
      {/* Broadcast Notice Banner */}
      {broadcastNotice && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 text-white text-[11px] font-bold py-2 px-4 text-center shadow-inner flex items-center justify-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-white/20 uppercase text-[9px] tracking-wider">Announcement</span>
          <span>{broadcastNotice}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#edeaf5] px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
        {/* Logo and Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group"
          onMouseEnter={() => readItem('Pulse 360, Health Companion', 'Pulse 360, Umufasha w’Ubuzima')}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] flex items-center justify-center shadow-md shadow-[#7c3aed]/15 transition-transform group-hover:scale-105">
            <Heart className="w-5 h-5 text-white fill-white/10" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-[#2d1c66]">PULSE 360</h1>
            <p className="text-[9px] text-[#7c3aed] font-bold tracking-wider leading-none">Your health. Your voice. Our support.</p>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {menuItems.map(item => {
            const active = pathname === item.href;
            const label = language === 'en' ? item.labelEn : item.labelRw;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  active 
                    ? 'text-[#7c3aed] bg-[#7c3aed]/5'
                    : item.href === '/admin' ? 'text-purple-700 bg-purple-100 hover:bg-purple-200' : 'text-[#625985] hover:text-[#7c3aed] hover:bg-[#f7f6fc]'
                }`}
                onMouseEnter={() => readItem(`Go to ${item.labelEn}`, `Komeza kuri ${item.labelRw}`)}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Profile */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Quick Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] hover:border-[#edeaf5] hover:bg-[#edeaf5]/30 text-[#2d1c66] transition flex items-center gap-1.5"
            onMouseEnter={() => readItem('Change language', 'Guhindura ururimi')}
          >
            <Languages className="w-4 h-4 text-[#ec4899]" />
            <span className="text-[10px] font-bold">{language.toUpperCase()}</span>
          </button>

          {/* Quick Size Toggle */}
          <button
            onClick={() => setFontSize(fontSize === 'base' ? 'lg' : fontSize === 'lg' ? 'xl' : fontSize === 'xl' ? 'sm' : 'base')}
            className="p-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] hover:bg-[#edeaf5]/30 text-[#625985] transition"
            title="Adjust text size"
            onMouseEnter={() => readItem('Adjust text size', 'Guhindura ingano y’inyuguti')}
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Account indicator / Login trigger */}
          {authUser ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 cursor-pointer"
                title={`Logged in as ${authUser.username} (${authUser.role})`}
              >
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {authUser.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-[10px] font-black text-purple-900">@{authUser.username}</span>
                {authUser.role === 'admin' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                )}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5]"
                title={`Anonymous Peer @${anonymousHash}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-[#7c3aed]" />
                </div>
                <span className="text-[9px] font-bold text-[#2d1c66]">@{anonymousHash}</span>
              </div>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs transition shadow-sm"
              >
                {language === 'en' ? 'Sign In / Register' : 'Injira / Iyandikishe'}
              </button>
            </div>
          )}

        </div>

        {/* Mobile menu action controls */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile User Profile / Login trigger icon */}
          <button
            onClick={() => {
              if (authUser) {
                setMobileOpen(true);
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="p-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-[#7c3aed] flex items-center justify-center"
            title={authUser ? `@${authUser.username}` : 'Sign In / Register'}
          >
            <User className="w-5 h-5" />
          </button>

          <button 
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-[10px] font-bold text-[#2d1c66]"
          >
            {language.toUpperCase()}
          </button>
          
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-[#2d1c66]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white/95 flex flex-col p-6 pt-20 justify-between animate-fade-in">
          <button 
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#f7f6fc] text-[#2d1c66] border border-[#edeaf5]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-4">
            {/* Mobile Auth Button or Logged in User Bar */}
            {authUser ? (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {authUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#2d1c66]">@{authUser.username}</p>
                    <p className="text-[10px] text-[#7c3aed] font-bold uppercase">{authUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 text-xs font-bold hover:bg-red-200 transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); setAuthModalOpen(true); }}
                className="w-full py-3 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <User className="w-4 h-4" />
                <span>{language === 'en' ? 'Sign In / Register' : 'Injira / Iyandikishe'}</span>
              </button>
            )}

            <nav className="space-y-2">
              {menuItems.map(item => {
                const label = language === 'en' ? item.labelEn : item.labelRw;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold ${
                      active ? 'bg-[#7c3aed]/5 text-[#7c3aed] border border-[#7c3aed]/10' : 'text-[#625985]'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center space-y-3">
            <p className="text-xs font-bold text-red-600 uppercase">{language === 'en' ? 'Helpline Assistance' : 'Ubutabazi bw’Imirongo'}</p>
            <div className="flex gap-2 justify-center">
              <a href="tel:114" className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs shadow-sm">Call 114</a>
              <a href="tel:112" className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Call 112</a>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto min-h-[calc(100vh-14rem)]">
        {children}
      </main>

      {/* Audit Solid Dark-Navy Footer */}
      <footer className="w-full bg-[#12103e] text-[#a8a5d4] py-12 px-4 md:px-8 border-t border-slate-900 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Trademark & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white/10" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-wider">PULSE 360</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#8c88bf] max-w-sm">
              Safe. Anonymous. Accessible. Anytime. Providing Rwandans and youth across Africa with judgment-free health companion services.
            </p>
          </div>

          {/* Site Menu Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2.5 md:col-span-2 items-center md:justify-end text-[11px] font-bold text-[#b4b1e2]">
            <Link href="/" className="hover:text-white transition">{language === 'en' ? 'Privacy Policy' : 'Ubwizigame'}</Link>
            <Link href="/" className="hover:text-white transition">{language === 'en' ? 'Terms of Use' : 'Amategeko'}</Link>
            <a href="tel:114" className="hover:text-white transition">{language === 'en' ? 'Emergency Contacts' : 'Ubutabazi Buhishwe'}</a>
            <Link href="/" className="hover:text-white transition">{language === 'en' ? 'About Us' : 'Ibitwimye'}</Link>
            <Link href="/" className="hover:text-white transition">{language === 'en' ? 'Contact Us' : 'Twandikire'}</Link>
          </div>
        </div>

        {/* Bottom socials & legal */}
        <div className="max-w-6xl mx-auto border-t border-[#23205c]/55 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-[#8c88bf]">
          <p>© {new Date().getFullYear()} Pulse360 Platform. All rights reserved.</p>
          
          {/* Social media grid */}
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition p-1.5 rounded-lg bg-[#23205c]/40 hover:bg-[#7c3aed]/10"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition p-1.5 rounded-lg bg-[#23205c]/40 hover:bg-[#7c3aed]/10"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition p-1.5 rounded-lg bg-[#23205c]/40 hover:bg-[#7c3aed]/10"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition p-1.5 rounded-lg bg-[#23205c]/40 hover:bg-[#7c3aed]/10"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onSuccess={(user) => setAuthUser(user)} 
      />

    </div>
  );
}
