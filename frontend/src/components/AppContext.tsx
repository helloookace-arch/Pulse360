'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'rw';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type Contrast = 'normal' | 'high';

interface AppContextType {
  sessionToken: string | null;
  sessionId: string | null;
  district: string;
  language: Language;
  fontSize: FontSize;
  contrast: Contrast;
  screenReader: boolean;
  gestureTracking: boolean;
  savedArticles: string[];
  likedStories: string[];
  questionsCount: number;
  consultationCount: number;
  setDistrict: (dist: string) => void;
  toggleLanguage: () => void;
  setFontSize: (size: FontSize) => void;
  setContrast: (contrast: Contrast) => void;
  setScreenReader: (active: boolean) => void;
  setGestureTracking: (active: boolean) => void;
  toggleArticleSave: (id: string) => void;
  likeStoryLocally: (id: string) => void;
  incrementQuestions: () => void;
  addConsultationLocally: () => void;
  speak: (text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const BACKEND_URL = 'http://localhost:3001';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [district, setDistrictState] = useState<string>('Kigali');
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSizeState] = useState<FontSize>('base');
  const [contrast, setContrastState] = useState<Contrast>('normal');
  const [screenReader, setScreenReaderState] = useState<boolean>(false);
  const [gestureTracking, setGestureTrackingState] = useState<boolean>(false);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [likedStories, setLikedStories] = useState<string[]>([]);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [consultationCount, setConsultationCount] = useState<number>(0);

  // Load configuration from localStorage and register session
  useEffect(() => {
    // 1. Session check
    const storedToken = localStorage.getItem('pulse360_token');
    const storedId = localStorage.getItem('pulse360_session_id');
    const storedDistrict = localStorage.getItem('pulse360_district');
    
    // 2. Accessibility settings load
    const storedLang = localStorage.getItem('pulse360_lang') as Language;
    const storedSize = localStorage.getItem('pulse360_size') as FontSize;
    const storedContrast = localStorage.getItem('pulse360_contrast') as Contrast;
    const storedReader = localStorage.getItem('pulse360_reader') === 'true';
    const storedGesture = localStorage.getItem('pulse360_gesture') === 'true';
    
    // 3. User saves load
    const storedSaved = JSON.parse(localStorage.getItem('pulse360_saved_articles') || '[]');
    const storedLiked = JSON.parse(localStorage.getItem('pulse360_liked_stories') || '[]');
    
    if (storedLang) setLanguage(storedLang);
    if (storedSize) setFontSizeState(storedSize);
    if (storedContrast) setContrastState(storedContrast);
    if (storedReader) setScreenReaderState(storedReader);
    if (storedGesture) setGestureTrackingState(storedGesture);
    setSavedArticles(storedSaved);
    setLikedStories(storedLiked);

    if (storedToken && storedId) {
      setSessionToken(storedToken);
      setSessionId(storedId);
      if (storedDistrict) setDistrictState(storedDistrict);
      fetchSessionMetrics(storedToken);
    } else {
      createAnonymousSession(storedDistrict || 'Kigali');
    }
  }, []);

  const fetchSessionMetrics = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/metrics/${token}`);
      const data = await res.json();
      if (data.success) {
        setQuestionsCount(data.metrics.questionsAsked);
        setConsultationCount(data.metrics.consultationsCount);
      }
    } catch (e) {
      console.error('Failed to sync metrics from server', e);
    }
  };

  const createAnonymousSession = async (distName: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: distName })
      });
      const data = await res.json();
      if (data.success) {
        setSessionToken(data.sessionToken);
        setSessionId(data.sessionId);
        setDistrictState(data.district);
        localStorage.setItem('pulse360_token', data.sessionToken);
        localStorage.setItem('pulse360_session_id', data.sessionId);
        localStorage.setItem('pulse360_district', data.district);
      }
    } catch (e) {
      console.error('Failed to initiate anonymous session', e);
    }
  };

  const setDistrict = (dist: string) => {
    setDistrictState(dist);
    localStorage.setItem('pulse360_district', dist);
    // Sync with server if session exists
    if (sessionToken) {
      // Background action
      fetch(`${BACKEND_URL}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: dist })
      }).catch(e => console.error(e));
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'rw' : 'en';
    setLanguage(next);
    localStorage.setItem('pulse360_lang', next);
    speak(next === 'en' ? 'Language switched to English' : 'Ururimi rwawahinduwe mu Kinyarwanda');
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('pulse360_size', size);
    speak(`Font size adjusted`);
  };

  const setContrast = (con: Contrast) => {
    setContrastState(con);
    localStorage.setItem('pulse360_contrast', con);
    speak(`Contrast updated`);
  };

  const setScreenReader = (active: boolean) => {
    setScreenReaderState(active);
    localStorage.setItem('pulse360_reader', active ? 'true' : 'false');
    if (active) {
      speak('Screen reader activated. Hover over text to read out loud.');
    } else {
      speak('Screen reader deactivated.');
    }
  };

  const setGestureTracking = (active: boolean) => {
    setGestureTrackingState(active);
    localStorage.setItem('pulse360_gesture', active ? 'true' : 'false');
    speak(active ? 'Hands free tracking enabled' : 'Hands free tracking disabled');
  };

  const toggleArticleSave = (id: string) => {
    let updated;
    if (savedArticles.includes(id)) {
      updated = savedArticles.filter(item => item !== id);
      speak('Article removed from bookmarks');
    } else {
      updated = [...savedArticles, id];
      speak('Article bookmarked');
    }
    setSavedArticles(updated);
    localStorage.setItem('pulse360_saved_articles', JSON.stringify(updated));
  };

  const likeStoryLocally = (id: string) => {
    if (likedStories.includes(id)) return;
    const updated = [...likedStories, id];
    setLikedStories(updated);
    localStorage.setItem('pulse360_liked_stories', JSON.stringify(updated));
    speak('Story liked');
  };

  const incrementQuestions = () => {
    setQuestionsCount(prev => prev + 1);
  };

  const addConsultationLocally = () => {
    setConsultationCount(prev => prev + 1);
    speak('Consultation successfully scheduled');
  };

  const speak = (text: string) => {
    if (!screenReader && !text.startsWith('Screen reader')) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'fr-FR'; // French fallback acts closer to Kinyarwanda phonetics if Kinyarwanda is not on browser
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppContext.Provider
      value={{
        sessionToken,
        sessionId,
        district,
        language,
        fontSize,
        contrast,
        screenReader,
        gestureTracking,
        savedArticles,
        likedStories,
        questionsCount,
        consultationCount,
        setDistrict,
        toggleLanguage,
        setFontSize,
        setContrast,
        setScreenReader,
        setGestureTracking,
        toggleArticleSave,
        likeStoryLocally,
        incrementQuestions,
        addConsultationLocally,
        speak
      }}
    >
      <div 
        className={`
          w-full min-h-screen
          ${fontSize === 'sm' ? 'text-xs md:text-sm' : ''}
          ${fontSize === 'base' ? 'text-sm md:text-base' : ''}
          ${fontSize === 'lg' ? 'text-base md:text-lg' : ''}
          ${fontSize === 'xl' ? 'text-lg md:text-xl' : ''}
          ${contrast === 'high' ? 'contrast-125 saturate-125 brightness-110' : ''}
        `}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
