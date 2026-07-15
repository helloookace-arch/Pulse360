'use client';

import React, { useState, useEffect } from 'react';
import { useApp, FontSize, Contrast } from '../../components/AppContext';
import { 
  Accessibility, 
  Volume2, 
  VolumeX, 
  Eye, 
  Type, 
  Hand, 
  Sparkles,
  Play,
  Info
} from 'lucide-react';

export default function AccessibilityHubPage() {
  const {
    language,
    fontSize,
    setFontSize,
    contrast,
    setContrast,
    screenReader,
    setScreenReader,
    gestureTracking,
    setGestureTracking,
    speak
  } = useApp();

  const [activeSimulatedKey, setActiveSimulatedKey] = useState<number>(0);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [signConcept, setSignConcept] = useState<'idle' | 'hello' | 'emergency' | 'support'>('idle');

  useEffect(() => {
    if (!simulationRunning) return;

    const interval = setInterval(() => {
      setActiveSimulatedKey(prev => (prev + 1) % 4);
      const options = ['Dashboard', 'AI Chatbot', 'Find a Clinic', 'Accessibility Settings'];
      speak(language === 'en' ? `Focused on ${options[(activeSimulatedKey + 1) % 4]}` : `Urupapuro rwibanze kuri ${options[(activeSimulatedKey + 1) % 4]}`);
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationRunning, activeSimulatedKey, language]);

  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
    setGestureTracking(!gestureTracking);
    speak(
      !simulationRunning
        ? 'Hands free simulator active. Cycling screen options every 3 seconds.'
        : 'Hands free simulator stopped.'
    );
  };

  const triggerSignLanguage = (concept: 'hello' | 'emergency' | 'support') => {
    setSignConcept(concept);
    if (concept === 'hello') {
      speak(language === 'en' ? 'Sign Language: Hello and Welcome!' : 'Amarenga: Uraho kandi murakaza neza!');
    } else if (concept === 'emergency') {
      speak(language === 'en' ? 'Sign Language: Emergency Helpline!' : 'Amarenga: Ubutabazi bwihuse!');
    } else {
      speak(language === 'en' ? 'Sign Language: Mental Health counseling support.' : 'Amarenga: Ubufasha mu buzima bwo mu mutwe.');
    }

    setTimeout(() => {
      setSignConcept('idle');
    }, 4000);
  };

  const getSignDescription = () => {
    if (signConcept === 'hello') return language === 'en' ? 'Hand waving outwards to greet' : 'Gukubita ikiganza hanze usuhuza';
    if (signConcept === 'emergency') return language === 'en' ? 'Right arm raised high, pulsing red alert light' : 'Ukuboko k’iburyo kumanitse hejuru, urumuri rutukura';
    if (signConcept === 'support') return language === 'en' ? 'Both hands clasped together near heart' : 'Amaboko yombi arafatanye hafi y’umutima';
    return language === 'en' ? 'Avatar is listening and ready' : 'Avatar iriteguye kumva';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d1c66]">
          {language === 'en' ? 'Accessibility Tools' : 'Ibikoresho by’Aboroherwa'}
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'en' 
            ? 'Customize your user experience with visual adjustments, voice controls, hands-free tracking, and sign language interpreters.' 
            : 'Hindura imikoreshereze y’iyi porogaramu ukoresheje amajwi, ingano y’inyuguti, n’amarenga.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left column: Visual and Voice Controls */}
        <div className="space-y-6">
          
          {/* Visual settings */}
          <div className="p-6 rounded-2xl bg-white border border-[#edeaf5] space-y-4 glass-panel">
            <h3 className="font-extrabold text-sm text-[#2d1c66] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#3b82f6]" />
              {language === 'en' ? 'Visual Accessibility' : 'Urumuri n’Ingano'}
            </h3>

            {/* Font size chooser */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> {language === 'en' ? 'Text Size' : 'Ingano y’Inyuguti'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['sm', 'base', 'lg', 'xl'] as FontSize[]).map(size => {
                  const active = fontSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        active 
                          ? 'bg-[#3b82f6]/10 border-[#3b82f6]/35 text-[#3b82f6]' 
                          : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-500 hover:text-[#2d1c66]'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contrast levels */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {language === 'en' ? 'Contrast Theme' : 'Urumuri rw’Ikirere'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'normal', name: 'Normal Dark' },
                  { key: 'high', name: 'High Contrast' }
                ].map(theme => {
                  const active = contrast === theme.key;
                  return (
                    <button
                      key={theme.key}
                      onClick={() => setContrast(theme.key as Contrast)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                        active 
                          ? 'bg-[#7c3aed]/10 border-[#7c3aed]/25 text-[#7c3aed]' 
                          : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-500 hover:text-[#2d1c66]'
                      }`}
                    >
                      {theme.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Voice Screen Reader Controls */}
          <div className="p-6 rounded-2xl bg-white border border-[#edeaf5] space-y-4 glass-panel">
            <h3 className="font-extrabold text-sm text-[#2d1c66] flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#10b981]" />
              {language === 'en' ? 'Voice Navigation (Screen Reader)' : 'Amajwi n’Umusomyi w’Ibyanditse'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Enable browser-based text synthesis. When activated, hovering over links and elements will vocalize their action.'
                : 'Fungura umusomyi w’amajwi. Iyo wafunguye, iyo unyujije cursor ku kintu cyose kikubwira icyo gikora mu majwi.'}
            </p>

            <button
              onClick={() => setScreenReader(!screenReader)}
              className={`w-full py-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-2 ${
                screenReader 
                  ? 'bg-[#10b981]/15 border-[#10b981]/30 text-[#10b981]' 
                  : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-500'
              }`}
            >
              {screenReader ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>
                {screenReader 
                  ? (language === 'en' ? 'Screen Reader ACTIVE' : 'Umusomyi Wafunguye') 
                  : (language === 'en' ? 'Activate Screen Reader' : 'Fungura Umusomyi')}
              </span>
            </button>
          </div>

          {/* Hands-Free cycling simulator */}
          <div className="p-6 rounded-2xl bg-white border border-[#edeaf5] space-y-4 glass-panel">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#2d1c66] flex items-center gap-2">
                <Hand className="w-5 h-5 text-[#7c3aed]" />
                {language === 'en' ? 'Hands-Free Interaction' : 'Gukoresha Ikarita n’Amaso'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Simulates eye-tracking and gesture systems by sequentially highlighting dashboard navigation points.'
                : 'Uburyo bwo gukoresha porogaramu ukoresheje amaso cyangwa ibiganza byerekanwa kuri camera.'}
            </p>

            <button
              onClick={toggleSimulation}
              className={`w-full py-3 rounded-xl border font-bold text-xs transition flex items-center justify-center gap-2 ${
                simulationRunning 
                  ? 'bg-[#7c3aed]/10 border-[#7c3aed]/30 text-[#7c3aed] pulse-green' 
                  : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-500'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>
                {simulationRunning 
                  ? (language === 'en' ? 'Gaze Tracker Cycling...' : 'Simulateur Irarangira...') 
                  : (language === 'en' ? 'Start Hands-Free Simulator' : 'Tangira Gukoresha Iganza')}
              </span>
            </button>

            {simulationRunning && (
              <div className="p-3 bg-[#f7f6fc] border border-[#edeaf5] rounded-xl space-y-2 animate-fade-in text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Focal Points:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Dashboard', 'AI Chatbot', 'Find a Clinic', 'Accessibility'].map((opt, i) => (
                    <div 
                      key={i}
                      className={`p-2 rounded-lg text-center text-xs font-bold border transition ${
                        activeSimulatedKey === i 
                          ? 'bg-[#7c3aed]/10 border-[#7c3aed]/40 text-[#2d1c66] shadow-sm'
                          : 'bg-white border-[#edeaf5] text-slate-400'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Sign Language animated avatar */}
        <div className="p-6 rounded-2xl bg-white border border-[#edeaf5] space-y-6 glass-panel flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#2d1c66] flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-[#10b981]" />
              {language === 'en' ? 'Rwandan Sign Language Avatar' : 'Amarenga y’Amashusho y’Urubyiruko'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'en'
                ? 'Get animated sign feedback for key health instructions by selecting terms below.'
                : 'Reba uburyo amarenga y’ikinyarwanda asobanura amagambo y’ubuzima ahiswemo.'}
            </p>
          </div>

          <div className="relative h-64 w-full rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] flex items-center justify-center overflow-hidden">
            {signConcept === 'emergency' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
            {signConcept === 'support' && <div className="absolute inset-0 bg-[#7c3aed]/5 animate-pulse pointer-events-none" />}

            <div className="text-center relative">
              <svg className="w-36 h-36 mx-auto overflow-visible" viewBox="0 0 100 100">
                <path d="M20 90 C 25 70, 75 70, 80 90 Z" fill="#edeaf8" stroke="#7c3aed" strokeWidth="2.5" />
                
                <g className="animate-head-nod">
                  <circle cx="50" cy="40" r="22" fill="#dcd9f4" stroke="#7c3aed" strokeWidth="2" />
                  <circle cx="43" cy="38" r="2.5" fill="#2d1c66" className="animate-pulse" />
                  <circle cx="57" cy="38" r="2.5" fill="#2d1c66" className="animate-pulse" />
                  <path d="M46 51 Q 50 55 54 51" stroke="#7c3aed" strokeWidth="2" fill="none" />
                </g>

                <g className={signConcept === 'hello' ? 'animate-arm-wave' : ''}>
                  <path 
                    d="M22 75 L10 60 C8 58, 4 62, 6 64 L18 80 Z" 
                    fill="#edeaf8" 
                    stroke="#7c3aed" 
                    strokeWidth="2" 
                  />
                </g>

                <g className={
                  signConcept === 'emergency' ? 'translate-y-[-15px] rotate-[-20deg]' :
                  signConcept === 'support' ? 'translate-x-[15px] translate-y-[-5px]' : ''
                } style={{ transition: 'all 0.5s ease-in-out' }}>
                  <path 
                    d="M78 75 L90 55 C92 53, 96 57, 94 59 L82 80 Z" 
                    fill="#edeaf8" 
                    stroke="#7c3aed" 
                    strokeWidth="2" 
                  />
                </g>
              </svg>

              <div className="absolute bottom-2 inset-x-0 text-center">
                <span className="inline-block bg-white border border-[#edeaf5] text-[10px] px-2.5 py-1 rounded-xl text-[#2d1c66] font-bold uppercase tracking-wider shadow-sm">
                  {getSignDescription()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Trigger Concepts:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSignLanguage('hello')}
                className="py-2 px-1 rounded-xl text-[10px] font-bold bg-[#f7f6fc] hover:bg-[#edeaf5] border border-[#edeaf5] text-[#2d1c66] transition"
              >
                {language === 'en' ? 'Greet Me' : 'Uraho / Muraho'}
              </button>
              <button
                onClick={() => triggerSignLanguage('emergency')}
                className="py-2 px-1 rounded-xl text-[10px] font-bold bg-[#f7f6fc] hover:bg-[#edeaf5] border border-[#edeaf5] text-red-500 transition"
              >
                {language === 'en' ? 'Emergency' : 'Kwiregura'}
              </button>
              <button
                onClick={() => triggerSignLanguage('support')}
                className="py-2 px-1 rounded-xl text-[10px] font-bold bg-[#f7f6fc] hover:bg-[#edeaf5] border border-[#edeaf5] text-[#7c3aed] transition"
              >
                {language === 'en' ? 'Support' : 'Ubufasha'}
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#f7f6fc] border border-[#edeaf5] rounded-xl flex gap-2 items-start text-left text-[10px] text-slate-400">
            <Info className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-500">
              {language === 'en' 
                ? 'Sign interpretations follow the Rwandan Sign Language (RSL) standard protocols for youth health advocacy.' 
                : 'Uburyo amarenga yerekanwa akurikiza amahame y’Inyigisho z’Amarenga mu Rwanda (RSL).'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
