'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../components/AppContext';
import { 
  Heart, 
  Video, 
  Lock,
  Shield, 
  User,
  ChevronRight,
  BookMarked,
  FileText,
  HelpCircle,
  LogOut,
  Compass,
  ArrowRight
} from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  category: string;
  date: string;
  color: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const {
    language,
    district,
    setDistrict,
    questionsCount,
    consultationCount,
    savedArticles,
    likedStories,
    speak
  } = useApp();

  const [anonymousMode, setAnonymousMode] = useState(true);

  const featuredArticles: Article[] = [
    {
      _id: '1',
      category: 'MENTAL HEALTH',
      title: 'Understanding Anxiety and How to Manage It',
      date: '2 days ago',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: (
        <svg className="w-10 h-10 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
      )
    },
    {
      _id: '2',
      category: 'REPRODUCTIVE HEALTH',
      title: 'Facts About Family Planning',
      date: '3 days ago',
      color: 'bg-pink-100 text-pink-700 border-pink-200',
      icon: (
        <svg className="w-10 h-10 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
          <path d="M12 6v12M8 10h8" />
        </svg>
      )
    },
    {
      _id: '3',
      category: 'MENTAL HEALTH',
      title: 'How to Build Self Confidence',
      date: '4 days ago',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: (
        <svg className="w-10 h-10 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      )
    },
    {
      _id: '4',
      category: 'WELLNESS',
      title: 'Self Care Practices for Better Mental Health',
      date: '5 days ago',
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: (
        <svg className="w-10 h-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a15 15 0 0 0-9 9c0 5 4 9 9 9s9-4 9-9a15 15 0 0 0-9-9Z" />
          <path d="M12 6v10" />
        </svg>
      )
    }
  ];

  const stories = [
    {
      content: 'I struggled in silence for years, but sharing my story gave me freedom.',
      author: 'Anonymous'
    },
    {
      content: 'After getting support, I found the strength to start again.',
      author: 'Anonymous'
    },
    {
      content: 'Pulse 360 changed the way I see my mental health.',
      author: 'Anonymous'
    },
    {
      content: 'I feel safe here. No judgment, just support.',
      author: 'Anonymous'
    }
  ];

  const readText = (text: string) => {
    speak(text);
  };

  return (
    <div className="space-y-12 animate-fade-in text-left">
      
      {/* 1. HERO SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-r from-[#edeaf8] via-[#f7f6fc] to-[#ffffff] border border-[#edeaf5] rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        
        {/* Left Side: Text and CTA Buttons */}
        <div className="lg:col-span-7 space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2d1c66] tracking-tight leading-tight">
            Your safe space for <br />
            <span className="bg-gradient-to-r from-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">mental and reproductive health.</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
            Get trusted information, anonymous support and professional help anytime, anywhere.
          </p>

          {/* Action buttons matching mockup colors */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link 
              href="/learn" 
              className="px-6 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md shadow-[#7c3aed]/15 transition duration-200"
              onMouseEnter={() => readText('Learn Now')}
            >
              Learn Now
            </Link>
            <Link 
              href="/ask" 
              className="px-6 py-3 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white font-bold text-xs shadow-md shadow-[#ec4899]/15 transition duration-200"
              onMouseEnter={() => readText('Ask a Question')}
            >
              Ask a Question
            </Link>
            <Link 
              href="/consultation" 
              className="px-6 py-3 rounded-xl bg-[#1c194d] hover:bg-[#13113e] text-white font-bold text-xs shadow-md shadow-[#1c194d]/15 transition duration-200"
              onMouseEnter={() => readText('Start Consultation')}
            >
              Start Consultation
            </Link>
          </div>
        </div>

        {/* Right Side: Vector Illustration & Overlay Info Pills */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          
          {/* Circular light-purple concentric design background */}
          <div className="absolute w-72 h-72 rounded-full border-4 border-[#7c3aed]/5 animate-pulse" />
          <div className="absolute w-60 h-60 rounded-full border border-[#7c3aed]/10" />

          {/* Stylized vector SVG illustration of the woman with curly hair looking at her phone */}
          <svg className="w-64 h-64 relative z-10 overflow-visible" viewBox="0 0 100 100">
            {/* Soft backdrop */}
            <circle cx="50" cy="50" r="42" fill="rgba(124, 58, 237, 0.04)" />
            {/* Hair back */}
            <circle cx="48" cy="22" r="12" fill="#181313" />
            <circle cx="62" cy="24" r="10" fill="#181313" />
            <circle cx="36" cy="30" r="11" fill="#181313" />
            <circle cx="35" cy="45" r="9" fill="#181313" />
            
            {/* Shoulder and clothes */}
            <path d="M12 95 C 16 65, 76 65, 82 95 Z" fill="#7c3aed" />
            
            {/* Neck */}
            <path d="M44 55 L44 68 C 44 72, 56 72, 56 68 L56 55 Z" fill="#d2906b" />
            
            {/* Face */}
            <path d="M35 44 C 35 25, 65 25, 65 44 C 65 60, 35 60, 35 44 Z" fill="#e09d78" />
            
            {/* Curly hair overlap top */}
            <circle cx="50" cy="22" r="11" fill="#1e1818" />
            <circle cx="60" cy="32" r="8" fill="#1e1818" />
            <circle cx="39" cy="26" r="10" fill="#1e1818" />
            <circle cx="44" cy="18" r="9" fill="#1e1818" />
            <circle cx="55" cy="18" r="9" fill="#1e1818" />
            
            {/* Earring */}
            <circle cx="66" cy="46" r="3.5" fill="none" stroke="#eab308" strokeWidth="1.5" />
            
            {/* Face features (side profile view looking slightly down left) */}
            <circle cx="42" cy="40" r="1.5" fill="#1e1818" />
            <path d="M34 46 Q 38 48 34 50" stroke="#1e1818" strokeWidth="1" fill="none" />
            <path d="M43 51 Q 48 54 53 51" stroke="#a25841" strokeWidth="1.5" fill="none" />
            
            {/* Arm & Hand holding phone */}
            <path d="M18 95 L32 72 C 34 68, 38 72, 35 76 L25 95 Z" fill="#e09d78" />
            
            {/* Phone */}
            <rect x="28" y="62" width="12" height="20" rx="2" transform="rotate(-15 34 72)" fill="#1c194d" stroke="#625985" strokeWidth="1" />
            <circle cx="33" cy="65" r="1" fill="#10b981" />
          </svg>

          {/* Three Overlay vertical status pills on the right side */}
          <div className="absolute right-[-10px] space-y-2.5 z-20">
            {[
              { label: 'Anonymous', icon: Shield },
              { label: 'Confidential', icon: Lock },
              { label: 'Supportive', icon: Heart }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 border border-[#edeaf5] shadow-sm text-[10px] font-bold text-[#2d1c66]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#7c3aed]" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 2. FEATURED HEALTH NEWS */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#2d1c66] tracking-tight">Featured Health News</h3>
          <Link href="/learn" className="text-xs font-bold text-[#7c3aed] flex items-center hover:underline">
            <span>View all</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArticles.map((art) => (
            <div 
              key={art._id}
              className="rounded-2xl border border-[#edeaf5] bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#7c3aed]/20 hover:shadow-md transition duration-300 group cursor-pointer"
              onClick={() => {
                readText(art.title);
              }}
            >
              {/* Category Graphic Block */}
              <div className="h-32 bg-[#fbfbfe] border-b border-[#edeaf5] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#7c3aed]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {art.icon}
              </div>

              {/* Information body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded border ${art.color}`}>
                    {art.category}
                  </span>
                  <h4 className="text-xs font-extrabold text-[#2d1c66] leading-snug group-hover:text-[#7c3aed] transition line-clamp-2">
                    {art.title}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">{art.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. COMMUNITY STORIES SECTION */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#2d1c66] tracking-tight">Community Stories</h3>
          <Link href="/stories" className="text-xs font-bold text-[#7c3aed] flex items-center hover:underline">
            <span>View all</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((s, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#edeaf5] shadow-sm flex flex-col justify-between hover:border-[#7c3aed]/20 transition cursor-pointer"
              onClick={() => readText(s.content)}
            >
              <div className="space-y-3">
                {/* Quote marks */}
                <span className="text-2xl font-black text-[#7c3aed]/25 leading-none block">“</span>
                <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-3">
                  {s.content}
                </p>
              </div>
              <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">{s.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONFIDENTIALITY LOCK BANNER */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-[#edeaf8] to-[#ffffff] border border-[#edeaf5] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#edeaf5] flex items-center justify-center shrink-0 shadow-sm">
            <Lock className="w-5.5 h-5.5 text-[#7c3aed]" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#2d1c66]">{language === 'en' ? 'You are not alone. We are here for you.' : 'Nturi wenyine. Turi kumwe nawe.'}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{language === 'en' ? 'Your privacy is our priority. Get anonymous support instantly.' : 'Ubwizigame bwawe ni ingenzi. Hagarara neza nta pfunwe.'}</p>
          </div>
        </div>
        <Link 
          href="/consultation" 
          className="px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs transition whitespace-nowrap shadow-md shadow-[#7c3aed]/10 self-start md:self-center"
        >
          Get Support Now
        </Link>
      </section>

      {/* 5. AUDITED DASHBOARD STATISTICS WIDGET GRID */}
      <section className="p-6 md:p-8 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 rounded bg-[#7c3aed]" />
          <div>
            <h3 className="font-extrabold text-base text-[#2d1c66]">Dashboard</h3>
            <p className="text-[11px] text-slate-400">Manage your activities and privacy settings.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Dashboard Left Sidebar Menu */}
          <div className="lg:col-span-3 space-y-1 bg-[#f7f6fc] p-3 rounded-2xl border border-[#edeaf5] self-start">
            {[
              { label: 'Dashboard', icon: User, active: true },
              { label: 'My Consultations', icon: Video },
              { label: 'Saved Articles', icon: BookMarked },
              { label: 'My Questions', icon: FileText },
              { label: 'Settings', icon: HelpCircle },
              { label: 'Logout', icon: LogOut }
            ].map((menu, i) => {
              const Icon = menu.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-bold transition duration-200 ${
                    menu.active 
                      ? 'bg-[#7c3aed] text-white shadow-sm' 
                      : 'text-[#625985] hover:text-[#7c3aed] hover:bg-[#edeaf5]/40'
                  }`}
                  onClick={() => readText(menu.label)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{menu.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dashboard Center Statistics Block */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Consultations', value: consultationCount || 3 },
                { label: 'Saved Articles', value: savedArticles.length || 12 },
                { label: 'Questions Asked', value: questionsCount || 5 },
                { label: 'Stories Liked', value: likedStories.length || 8 }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#edeaf5] text-center space-y-1.5 shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <h4 className="text-2xl font-black text-[#2d1c66]">{stat.value}</h4>
                </div>
              ))}
            </div>

            {/* Privacy toggle settings */}
            <div className="p-5 rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] space-y-4 text-left">
              <h4 className="text-xs font-bold text-[#2d1c66] uppercase tracking-wider">Privacy Settings</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#2d1c66]">Anonymous Mode</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Keep your identity completely hidden.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setAnonymousMode(!anonymousMode);
                      speak(anonymousMode ? 'Anonymous mode disabled' : 'Anonymous mode enabled');
                    }}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      anonymousMode ? 'bg-[#10b981]' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${
                      anonymousMode ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-[#edeaf5] pt-3">
                  <div>
                    <p className="text-xs font-bold text-[#2d1c66]">Data Protection</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Your data is stored locally and securely.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[8px] font-bold text-emerald-700 uppercase">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Location selector */}
            <div className="flex items-center justify-between p-4 bg-[#f7f6fc] border border-[#edeaf5] rounded-2xl">
              <span className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5"><Compass className="w-4 h-4 text-[#7c3aed]" /> Current District:</span>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  readText(`District updated to ${e.target.value}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#edeaf5] text-xs font-bold text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
              >
                {['Nyarugenge', 'Gasabo', 'Kicukiro', 'Huye', 'Rubavu', 'Musanze', 'Kayonza'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Dashboard Right Resources & Emergency Button */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Quick emergency button block (violet back) */}
            <div className="p-5 rounded-2xl bg-[#7c3aed] text-white space-y-4 text-center shadow-lg shadow-[#7c3aed]/15 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
              <div className="space-y-1 text-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-100">Need Immediate Help?</h4>
                <p className="text-[10px] text-purple-200">You are not alone.</p>
              </div>
              
              <a 
                href="tel:114" 
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#7c3aed] font-extrabold text-xs flex items-center justify-center gap-1.5 transition duration-200 shadow"
              >
                Emergency Contacts
              </a>
            </div>

            {/* Resources list matching mockup */}
            <div className="p-5 rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] space-y-3 text-left">
              <h4 className="text-xs font-bold text-[#2d1c66] uppercase tracking-wider">Resources</h4>
              
              <ul className="space-y-2">
                {[
                  { label: 'Crisis Support Lines', link: 'tel:114' },
                  { label: 'Self Help Tools', link: '/accessibility' },
                  { label: 'Guided Meditation', link: '/learn' },
                  { label: 'FAQs', link: '/learn' }
                ].map((res, i) => (
                  <li key={i}>
                    <Link 
                      href={res.link} 
                      className="text-xs font-medium text-[#625985] hover:text-[#7c3aed] flex items-center justify-between group"
                    >
                      <span>{res.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
