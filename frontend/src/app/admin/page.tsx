'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../../components/AppContext';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PlusCircle, 
  MessageSquare,
  Lock,
  Sparkles
} from 'lucide-react';

interface Story {
  id: string;
  content: string;
  category: string;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  districtHash: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loadingStories, setLoadingStories] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // Article creation form
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Mental Health');
  const [articleBody, setArticleBody] = useState('');
  const [articleTags, setArticleTags] = useState('mental health, youth');
  const [articleLanguage, setArticleLanguage] = useState('English');
  const [articleSuccess, setArticleSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminStories();
  }, []);

  const fetchAdminStories = async () => {
    setLoadingStories(true);
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      setLoadingStories(false);

      if (res.status === 403 || res.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (data.success) {
        setStories(data.stories);
      }
    } catch {
      setLoadingStories(false);
    }
  };

  const handleUpdateStoryStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        setStories(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleBody.trim()) return;

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          category: articleCategory,
          body: articleBody,
          tags: articleTags.split(',').map(t => t.trim()),
          language: articleLanguage
        })
      });
      const data = await res.json();
      if (data.success) {
        setArticleSuccess('Article created and published successfully!');
        setArticleTitle('');
        setArticleBody('');
        setTimeout(() => setArticleSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-[#edeaf5] text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-extrabold text-[#2d1c66]">Admin Access Required</h3>
        <p className="text-xs text-slate-400">
          You must be logged in with an Administrator account to view this page.
        </p>
        <Link 
          href="/" 
          className="inline-block px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs font-bold shadow-md shadow-[#7c3aed]/15"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const filteredStories = filter === 'all' ? stories : stories.filter(s => s.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-fade-in">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#edeaf5] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d1c66]">
              Admin Moderation Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review community stories, publish verified health articles, and manage platform safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-[10px] font-extrabold text-purple-700 uppercase">
            ADMINISTRATOR ACTIVE
          </span>
        </div>
      </header>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Stories', value: stories.length, icon: MessageSquare, color: 'text-purple-600' },
          { label: 'Pending Review', value: stories.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
          { label: 'Approved Stories', value: stories.filter(s => s.status === 'approved').length, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Rejected Content', value: stories.filter(s => s.status === 'rejected').length, icon: XCircle, color: 'text-rose-500' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-white border border-[#edeaf5] shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5]">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-xl font-black text-[#2d1c66]">{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Community Stories Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#7c3aed]" />
              Story Moderation Queue
            </h3>

            {/* Filters */}
            <div className="flex gap-1 border border-[#edeaf5] p-1 rounded-xl bg-white">
              {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                    filter === f ? 'bg-[#7c3aed] text-white' : 'text-slate-400 hover:text-[#2d1c66]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {loadingStories ? (
              <div className="p-8 text-center bg-white border border-[#edeaf5] rounded-2xl text-xs text-slate-400">
                Loading moderation queue...
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#edeaf5] rounded-2xl text-xs text-slate-400">
                No stories found in category &ldquo;{filter}&rdquo;.
              </div>
            ) : (
              filteredStories.map(story => (
                <div key={story.id} className="p-5 rounded-2xl bg-white border border-[#edeaf5] shadow-sm space-y-3 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                    <span className="px-2 py-0.5 rounded bg-[#f7f6fc] border border-[#edeaf5] text-[#7c3aed]">
                      {story.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${
                      story.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      story.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {story.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#2d1c66] leading-relaxed">
                    &ldquo;{story.content}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#edeaf5] text-[10px] text-slate-400">
                    <span>District: {story.districtHash}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStoryStatus(story.id, 'rejected')}
                        className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-100 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStoryStatus(story.id, 'approved')}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-sm"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Article Creation Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#edeaf5] shadow-sm space-y-4 text-left">
            <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#ec4899]" />
              Publish Health Article
            </h3>

            {articleSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{articleSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateArticle} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Article Title</label>
                <input
                  type="text"
                  required
                  value={articleTitle}
                  onChange={e => setArticleTitle(e.target.value)}
                  placeholder="e.g. Managing Stress During Exams"
                  className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={articleCategory}
                    onChange={e => setArticleCategory(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66]"
                  >
                    <option value="Mental Health">Mental Health</option>
                    <option value="Reproductive Health">Reproductive Health</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
                  <select
                    value={articleLanguage}
                    onChange={e => setArticleLanguage(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66]"
                  >
                    <option value="English">English</option>
                    <option value="Kinyarwanda">Kinyarwanda</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tags (comma separated)</label>
                <input
                  type="text"
                  value={articleTags}
                  onChange={e => setArticleTags(e.target.value)}
                  placeholder="mental health, mindfulness, youth"
                  className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Body Content</label>
                <textarea
                  required
                  rows={5}
                  value={articleBody}
                  onChange={e => setArticleBody(e.target.value)}
                  placeholder="Write article text..."
                  className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white font-bold text-xs transition shadow-md shadow-[#ec4899]/15"
              >
                Publish Article
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
