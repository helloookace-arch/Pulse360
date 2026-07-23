'use client';

import React, { useState, useEffect } from 'react';
import { useApp, BACKEND_URL } from '../../components/AppContext';
import { 
  Search, 
  Bookmark, 
  Clock, 
  Calendar, 
  BookOpen, 
  X
} from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  category: 'Mental Health' | 'Reproductive Health' | 'Wellness';
  body: string;
  tags: string[];
  language: 'English' | 'Kinyarwanda';
  readingTime: string;
  thumbnail: string;
  publishedAt: string;
}

export default function EducationHubPage() {
  const {
    language,
    savedArticles,
    toggleArticleSave,
    speak
  } = useApp();

  const [articles, setArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Mental Health' | 'Reproductive Health' | 'Wellness'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const langFilter = language === 'en' ? 'English' : 'Kinyarwanda';
        const url = new URL(`${BACKEND_URL}/articles`);
        url.searchParams.append('language', langFilter);
        
        if (activeCategory !== 'All') {
          url.searchParams.append('category', activeCategory);
        }
        if (searchQuery) {
          url.searchParams.append('search', searchQuery);
        }

        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success) {
          setArticles(data.articles);
        }
      } catch (err) {
        console.error('Failed to load articles, using client fallback', err);
        const fallbackList: Article[] = [
          {
            _id: 'art-1',
            title: 'Understanding Anxiety: A Guide for Young Rwandans',
            category: 'Mental Health',
            body: 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can affect your daily life. In Rwanda, young people face academic pressure, unemployment concerns, and social expectations. Understanding your triggers, practicing deep breathing, and talking to a counselor anonymously can make a huge difference. Remember, mental health is health, and seeking help is a strength.',
            tags: ['anxiety', 'mental health', 'youth', 'mindfulness'],
            language: 'English',
            readingTime: '4 min read',
            thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop',
            publishedAt: new Date().toISOString()
          },
          {
            _id: 'art-2',
            title: 'Gusobanukirwa Agahinda Gakabije (Depression)',
            category: 'Mental Health',
            body: 'Agahinda gakabije si intege nke. Ni indwara ivurwa igakira. Bimwe mu bimenyetso byayo ni ukubura ibitotsi, kumva nta cyizere cyo kubaho ufite, ndetse no gutakaza intege mu byo wakundaga gukora. Niba wumva ufite ibi bimenyetso, watugisha inama kuri Pulse360 mu buryo bwizewe kandi buhishwe.',
            tags: ['agahinda gakabije', 'ubuzima bwo mu mutwe', 'inama'],
            language: 'Kinyarwanda',
            readingTime: '5 min read',
            thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop',
            publishedAt: new Date().toISOString()
          },
          {
            _id: 'art-3',
            title: 'Reproductive Health: Myths vs. Facts',
            category: 'Reproductive Health',
            body: 'There are many misconceptions about sexual and reproductive health. In this article, we debunk common myths surrounding contraception, fertility, and STIs. Knowledge is your shield. Getting accurate information is key to protecting yourself and planning your future.',
            tags: ['srh', 'contraception', 'myths', 'education'],
            language: 'English',
            readingTime: '6 min read',
            thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop',
            publishedAt: new Date().toISOString()
          },
          {
            _id: 'art-4',
            title: 'Uburyo bwo Kwirinda Sida n’Izindi Ndwara Zandurira mu Mibonano Mpuzabitsina',
            category: 'Reproductive Health',
            body: 'Kwirinda ni byiza kuruta kwivuza. Koresha agakingirizo buri gihe, ipimishe buri gihe kugira ngo umenye uko uhagaze, kandi niba ukeka ko wanduye vuba, shaka imiti ya PEP (Post-Exposure Prophylaxis) mu masaha 72. Ubuzima bwawe buri mu maboko yawe.',
            tags: ['kwirinda', 'sida', 'srh', 'ubuzima'],
            language: 'Kinyarwanda',
            readingTime: '4 min read',
            thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop',
            publishedAt: new Date().toISOString()
          },
          {
            _id: 'art-5',
            title: 'Self-Care Habits for Daily Wellness',
            category: 'Wellness',
            body: 'Wellness is not a destination; it is a dynamic journey. Simple acts like sleeping 8 hours a day, drinking enough water, taking short walks, and limiting social media exposure can boost your mood and immune system. Learn to listen to your body and mind.',
            tags: ['wellness', 'self-care', 'sleep', 'lifestyle'],
            language: 'English',
            readingTime: '3 min read',
            thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop',
            publishedAt: new Date().toISOString()
          }
        ];

        let filtered = fallbackList.filter(a => a.language === (language === 'en' ? 'English' : 'Kinyarwanda'));
        if (activeCategory !== 'All') {
          filtered = filtered.filter(a => a.category === activeCategory);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
        }
        setArticles(filtered);
      }
    };

    fetchArticles();
  }, [language, activeCategory, searchQuery]);

  const speakArticle = (art: Article) => {
    speak(`${art.title}. Category: ${art.category}. Reading time: ${art.readingTime}. Body: ${art.body}`);
  };

  const getRelatedArticles = (currentArticle: Article) => {
    return articles.filter(a => a._id !== currentArticle._id && a.category === currentArticle.category);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Category header */}
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <h2 
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d1c66]"
              onMouseEnter={() => speak(language === 'en' ? 'Education Hub. Access reliable health resources.' : 'Inyigisho z’Ubuzima. Soma inyandiko zizewe.')}
            >
              {language === 'en' ? 'Education Hub' : 'Urubuga rw’Inyigisho'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'en' ? 'Evidence-based resources supporting your wellness.' : 'Inyigisho zishingiye ku bimenyetso bigufasha kugira ubuzima bwiza.'}
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={language === 'en' ? 'Search articles or topics...' : 'Shaka inyandiko cyangwa ibiganiro...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#edeaf5] focus:outline-none focus:border-[#7c3aed] transition text-sm text-[#2d1c66] placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Category selector tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#edeaf5] pb-2">
          {(['All', 'Mental Health', 'Reproductive Health', 'Wellness'] as const).map(cat => {
            const label = language === 'en' ? cat : 
              cat === 'All' ? 'Byose' :
              cat === 'Mental Health' ? 'Ubuzima bwo mu Mutwe' :
              cat === 'Reproductive Health' ? 'Imyororokere' : 'Imyitwarire myiza';
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  speak(language === 'en' ? `Filtered by ${cat}` : `Gufungura ibyerekeye ${label}`);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  active 
                    ? 'bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 shadow-sm'
                    : 'bg-white border border-[#edeaf5] text-slate-500 hover:text-[#7c3aed] hover:bg-[#edeaf5]/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Articles Cards Grid */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-white border border-dashed border-[#edeaf5] rounded-2xl">
          <BookOpen className="w-12 h-12 text-[#7c3aed]/30 animate-pulse" />
          <h3 className="font-bold text-sm text-slate-450">{language === 'en' ? 'No Articles Found' : 'Nta nyandiko zabonetse'}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => {
            const isSaved = savedArticles.includes(art._id);
            return (
              <article 
                key={art._id} 
                className="rounded-2xl bg-white border border-[#edeaf5] overflow-hidden flex flex-col justify-between glass-panel glass-panel-hover group"
              >
                {/* Thumbnail */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img 
                    src={art.thumbnail} 
                    alt={art.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[9px] font-bold text-[#7c3aed] uppercase tracking-wider border border-[#edeaf5]">
                    {art.category}
                  </div>
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleArticleSave(art._id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm transition border ${
                      isSaved 
                        ? 'bg-[#ec4899] border-[#ec4899] text-white' 
                        : 'bg-white/80 border-[#edeaf5] text-slate-400 hover:text-[#ec4899]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                {/* Info and content */}
                <div 
                  className="p-5 flex-1 flex flex-col justify-between space-y-3 cursor-pointer text-left"
                  onClick={() => {
                    setSelectedArticle(art);
                    speakArticle(art);
                  }}
                >
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-sm text-[#2d1c66] group-hover:text-[#7c3aed] transition leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {art.body}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#edeaf5] text-[10px] text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art.readingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(art.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Article Reader */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-white border-l border-[#edeaf5] h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl animate-fade-in text-left">
            <div>
              <div className="flex items-center justify-between border-b border-[#edeaf5] pb-4 mb-6">
                <span className="px-3 py-1 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] text-xs font-bold uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleArticleSave(selectedArticle._id)}
                    className={`p-2 rounded-xl border transition ${
                      savedArticles.includes(selectedArticle._id)
                        ? 'bg-[#ec4899]/15 border-[#ec4899]/20 text-[#ec4899]'
                        : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-400'
                    }`}
                  >
                    <Bookmark className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-slate-400 hover:text-[#2d1c66]"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <h1 className="text-xl md:text-3xl font-extrabold text-[#2d1c66] leading-tight mb-4">
                {selectedArticle.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold mb-6">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {selectedArticle.readingTime}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(selectedArticle.publishedAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>

              <div className="h-64 w-full rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-[#edeaf5]">
                <img src={selectedArticle.thumbnail} alt={selectedArticle.title} className="w-full h-full object-cover" />
              </div>

              <div className="text-sm leading-relaxed text-[#493f6d] space-y-4 mb-8 whitespace-pre-wrap">
                {selectedArticle.body}
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedArticle.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-[#f7f6fc] border border-[#edeaf5] text-xs font-semibold text-slate-500">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-[#edeaf5] pt-6 mt-6">
              <h4 className="font-extrabold text-sm text-[#2d1c66] mb-3">
                {language === 'en' ? 'Related Articles' : 'Inyandiko Zijyanye N’iyi'}
              </h4>
              
              <div className="space-y-3">
                {getRelatedArticles(selectedArticle).slice(0, 2).map(rel => (
                  <div
                    key={rel._id}
                    onClick={() => {
                      setSelectedArticle(rel);
                      speakArticle(rel);
                    }}
                    className="flex gap-3 p-3 rounded-xl bg-[#f7f6fc]/60 border border-[#edeaf5] hover:border-[#7c3aed]/30 transition cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-[#edeaf5]">
                      <img src={rel.thumbnail} alt={rel.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-[#2d1c66] group-hover:text-[#7c3aed] transition line-clamp-1 leading-snug">
                        {rel.title}
                      </h5>
                      <span className="text-[9px] text-[#7c3aed] font-bold uppercase tracking-wider inline-block mt-1">
                        {rel.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
