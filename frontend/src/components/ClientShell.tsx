'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from './AppContext';
import {
  Menu,
  X,
  User,
  Heart,
  Phone,
  Languages,
  Eye,
  Type,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    language,
    toggleLanguage,
    sessionId,
    speak,
    fontSize,
    setFontSize,
    contrast,
    setContrast
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { href: '/', labelEn: 'Home', labelRw: 'Ahabanza' },
    { href: '/learn', labelEn: 'Learn', labelRw: 'Soma' },
    { href: '/stories', labelEn: 'Stories', labelRw: 'Ubuhamya' },
    { href: '/ask', labelEn: 'Ask', labelRw: 'Baza' },
    { href: '/consultation', labelEn: 'Consultation', labelRw: 'Umujyanama' },
    { href: '/clinics', labelEn: 'Find a Clinic', labelRw: 'Shaka Ivuriro' },
    { href: '/accessibility', labelEn: 'Accessibility', labelRw: 'Aboroherwa' }
  ];

  const anonymousHash = sessionId ? sessionId.substring(0, 5).toUpperCase() : 'PEER';

  const readItem = (en: string, rw: string) => {
    speak(language === 'en' ? en : rw);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f6fc] text-[#493f6d]">
      
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
                    : 'text-[#625985] hover:text-[#7c3aed] hover:bg-[#f7f6fc]'
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

          {/* User profile dropdown simulator */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] cursor-pointer hover:bg-[#edeaf5]/20 transition"
            title={`Anonymous Profile @${anonymousHash}`}
            onMouseEnter={() => readItem(`Profile ID ${anonymousHash}`, `Uwirabura nimero ${anonymousHash}`)}
          >
            <div className="w-6 h-6 rounded-full bg-[#7c3aed]/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-[#7c3aed]" />
            </div>
            <span className="text-[10px] font-black text-[#2d1c66]">@{anonymousHash}</span>
          </div>

        </div>

        {/* Mobile menu hamburger button */}
        <div className="lg:hidden flex items-center gap-2">
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

    </div>
  );
}
