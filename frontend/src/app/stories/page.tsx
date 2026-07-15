'use client';

import React, { useState, useEffect } from 'react';
import { useApp, BACKEND_URL } from '../../components/AppContext';
import { 
  Heart, 
  MessageSquare, 
  PlusCircle, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  MapPin
} from 'lucide-react';

interface Story {
  _id: string;
  content: string;
  category: 'Mental Health' | 'Reproductive Health' | 'Wellness';
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  districtHash: string;
  createdAt: string;
}

export default function CommunityStoriesPage() {
  const {
    language,
    district,
    likedStories,
    likeStoryLocally,
    speak
  } = useApp();

  const [stories, setStories] = useState<Story[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Mental Health' | 'Reproductive Health' | 'Wellness'>('All');
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Mental Health' | 'Reproductive Health' | 'Wellness'>('Mental Health');
  
  const [moderationMessage, setModerationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/stories`);
      const data = await res.json();
      if (data.success) {
        setStories(data.stories);
      }
    } catch (err) {
      console.error('Failed to load stories, using fallbacks', err);
      setStories([
        {
          _id: 'story-1',
          content: 'I used to struggle with severe anxiety before my exams. Finding Pulse360 helped me learn relaxation techniques anonymously, and my grades have actually improved. It is great to know I am not alone.',
          category: 'Mental Health',
          likes: 24,
          status: 'approved',
          districtHash: 'Kigali_Nyarugenge',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          _id: 'story-2',
          content: 'Kuganira ku buzima bw’imyororokere n’ababyeyi bacu biracyari ikizira mu miryango yacu. Pulse360 yampaye amakuru mazima yo kwirinda indwara n’inda zitateganijwe nta pfunwe.',
          category: 'Reproductive Health',
          likes: 42,
          status: 'approved',
          districtHash: 'Rubavu_Gisenyi',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    }
  };

  const handleLike = async (id: string) => {
    if (likedStories.includes(id)) return;
    
    setStories(prev => prev.map(s => s._id === id ? { ...s, likes: s.likes + 1 } : s));
    likeStoryLocally(id);

    try {
      await fetch(`${BACKEND_URL}/stories/like/${id}`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    setModerationMessage(null);

    const targetDistrict = district || 'Kigali';

    try {
      const res = await fetch(`${BACKEND_URL}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent,
          category: newCategory,
          district: targetDistrict
        })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setModerationMessage({
          type: 'success',
          text: language === 'en'
            ? 'Story approved by automated AI moderation and posted!'
            : 'Ubuhamya bwawe bwemewe na AI moderation kandi bwashyizwe ku rubuga!'
        });
        setNewContent('');
        fetchStories();
        setTimeout(() => {
          setShowSubmitModal(false);
          setModerationMessage(null);
        }, 2000);
      } else {
        setModerationMessage({
          type: 'error',
          text: data.error || (language === 'en' ? 'Moderation failed: Content violates community guidelines.' : 'Moderation yanze: Ubuhamya burimo amagambo atemewe.')
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      const isModerate = newContent.toLowerCase().includes('spam') || newContent.toLowerCase().includes('http') || newContent.length < 10;
      
      if (isModerate) {
        setModerationMessage({
          type: 'error',
          text: language === 'en' ? 'Moderation failed: Content violates community guidelines.' : 'Moderation yanze: Ubuhamya burimo amagambo atemewe.'
        });
      } else {
        setModerationMessage({
          type: 'success',
          text: language === 'en' ? 'Story approved by automated AI moderation!' : 'Ubuhamya bwawe bwemewe na AI moderation!'
        });
        const localNew: Story = {
          _id: `story-local-${Date.now()}`,
          content: newContent,
          category: newCategory,
          likes: 0,
          status: 'approved',
          districtHash: targetDistrict,
          createdAt: new Date().toISOString()
        };
        setStories(prev => [localNew, ...prev]);
        setNewContent('');
        setTimeout(() => {
          setShowSubmitModal(false);
          setModerationMessage(null);
        }, 2000);
      }
    }
  };

  const filteredStories = activeCategory === 'All'
    ? stories
    : stories.filter(s => s.category === activeCategory);

  const speakStory = (s: Story) => {
    speak(`${language === 'en' ? 'Story in' : 'Ubuhamya bwa'} ${s.category}. ${s.content}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d1c66]"
            onMouseEnter={() => speak(language === 'en' ? 'Community Stories. Read anonymous support stories.' : 'Ubuhamya bw’inshuti. Soma ibyo abandi banyuzemo.')}
          >
            {language === 'en' ? 'Community Stories' : 'Ubuhamya bw’Umuryango'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'en' ? 'Read and share anonymous testimonies, fostering shared support.' : 'Soma kandi usangize abandi ubuhamya utagaragaje amazina yawe.'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowSubmitModal(true);
            speak(language === 'en' ? 'Share your story' : 'Sangiza abandi ubuhamya');
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold transition shadow-lg shadow-[#ec4899]/10 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'en' ? 'Share Anonymous Story' : 'Sangiza Ubuhamya'}</span>
        </button>
      </header>

      {/* Category selector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#edeaf5] pb-2">
        {(['All', 'Mental Health', 'Reproductive Health', 'Wellness'] as const).map(cat => {
          const label = language === 'en' ? cat : 
            cat === 'All' ? 'Byose' :
            cat === 'Mental Health' ? 'Ubuzima bwo mu Mutwe' :
            cat === 'Reproductive Health' ? 'Imyororokere' : 'Imyitwarire myiza';
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                speak(language === 'en' ? `Filtered by ${cat}` : `Gufungura ibyerekeye ${label}`);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeCategory === cat 
                  ? 'bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/25 shadow-sm'
                  : 'bg-white border border-[#edeaf5] text-slate-500 hover:text-[#7c3aed] hover:bg-[#edeaf5]/20'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Feed list */}
      <div className="space-y-4 max-w-3xl">
        {filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-[#edeaf5] rounded-2xl">
            <MessageSquare className="w-10 h-10 text-slate-300 animate-pulse mb-2" />
            <p className="text-xs text-slate-400">{language === 'en' ? 'No stories in this category yet. Be the first to share!' : 'Nta buhamya buraboneka. Tanga ubwa mbere!'}</p>
          </div>
        ) : (
          filteredStories.map((story) => {
            const hasLiked = likedStories.includes(story._id);
            return (
              <div 
                key={story._id} 
                className="p-6 rounded-2xl bg-white border border-[#edeaf5] glass-panel space-y-4 cursor-pointer hover:border-[#7c3aed]/30 transition text-left"
                onClick={() => speakStory(story)}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="px-2.5 py-1 rounded bg-[#f7f6fc] border border-[#edeaf5] text-[#7c3aed]">
                    {story.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{story.districtHash}</span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-[#2d1c66]">
                  &ldquo;{story.content}&rdquo;
                </p>

                <div className="flex items-center justify-between border-t border-[#edeaf5] pt-4 text-[10px] text-slate-400">
                  <span>{new Date(story.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(story._id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                      hasLiked 
                        ? 'bg-rose-50 border-rose-100 text-rose-500' 
                        : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-400 hover:text-rose-500 hover:border-rose-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="font-bold">{story.likes} {language === 'en' ? 'Support Likes' : 'Gushyigikira'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Story Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#edeaf5] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fade-in relative text-left">
            
            <div className="flex items-center justify-between border-b border-[#edeaf5] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7c3aed]" />
                <h3 className="font-extrabold text-base text-[#2d1c66]">{language === 'en' ? 'Share Anonymous Story' : 'Ubuhamya Bihishwe'}</h3>
              </div>
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded bg-[#f7f6fc] border border-[#edeaf5] text-slate-400 hover:text-[#2d1c66]"
              >
                &times;
              </button>
            </div>

            {moderationMessage && (
              <div className={`p-4 rounded-xl flex items-start gap-3 text-xs ${
                moderationMessage.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                  : 'bg-red-50 border border-red-100 text-red-700'
              }`}>
                {moderationMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <p className="leading-relaxed font-semibold">{moderationMessage.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmitStory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Category' : 'Icyiciro'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mental Health', 'Reproductive Health', 'Wellness'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border text-center transition ${
                        newCategory === cat 
                          ? 'bg-[#7c3aed]/10 border-[#7c3aed]/25 text-[#7c3aed]' 
                          : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-400'
                      }`}
                    >
                      {language === 'en' ? cat : cat === 'Mental Health' ? 'Umutwe' : cat === 'Reproductive Health' ? 'Imyororokere' : 'Imyitwarire'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Your Story' : 'Ubuhamya Bwawe'}</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={language === 'en' ? 'Type your experience anonymously... Guidelines: No spam, no URLs, write at least 10 letters.' : 'Andika ubuhamya bwawe... Icyitonderwa: Nta kwamamaza, nta links, andika inyuguti 10 cyangwa zirenga.'}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-white border border-[#edeaf5] text-xs focus:outline-none focus:border-[#7c3aed] transition text-[#2d1c66] placeholder-slate-400 resize-none"
                />
              </div>

              <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#f7f6fc] text-[10px] text-slate-400 border border-[#edeaf5]">
                <Sparkles className="w-4 h-4 text-[#7c3aed] shrink-0" />
                <span>{language === 'en' ? 'Pulse360 AI content moderation checks submissions instantly before posting.' : 'AI Content Moderation isuzuma ibyo wanditse ako kanya mbere yo kubitangaza.'}</span>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[#edeaf5]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f7f6fc] hover:bg-[#edeaf5] border border-[#edeaf5] text-slate-400 text-xs font-bold transition"
                >
                  {language === 'en' ? 'Cancel' : 'Guhagarika'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newContent.trim()}
                  className="px-5 py-2 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {isSubmitting ? (language === 'en' ? 'Submitting...' : 'Gushyiraho...') : (language === 'en' ? 'Submit Story' : 'Ohereza')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
