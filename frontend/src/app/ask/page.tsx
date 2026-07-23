'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import io from 'socket.io-client';
import { useApp, BACKEND_URL } from '../../components/AppContext';
import { 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  User, 
  Bot, 
  AlertTriangle, 
  HelpCircle, 
  Moon, 
  Video,
  Phone
} from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  emotionLabel?: string;
  crisisTriggered?: boolean;
  createdAt: string;
}

export default function AskAnonymouslyPage() {
  const {
    sessionToken,
    language,
    speak,
    incrementQuestions
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [askForFriend, setAskForFriend] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(false);
  
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 22 || currentHour < 5;

  // Setup Socket Connection
  useEffect(() => {
    if (!sessionToken) return;

    // Load history via REST first
    fetch(`${BACKEND_URL}/chat/history/${sessionToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessages(data.messages);
          const hasCrisis = data.messages.some((m: ChatMessage) => m.crisisTriggered);
          setCrisisAlert(hasCrisis);
        }
      })
      .catch(err => console.error('Failed to load chat history', err));

    // Connect socket
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.emit('join_session', sessionToken);

    socket.on('chat_message', (msg: ChatMessage) => {
      setMessages(prev => {
        if (msg.role === 'user' && prev.length > 0 && prev[prev.length - 1].content === msg.content) {
          return prev;
        }
        return [...prev, msg];
      });

      setIsTyping(false);

      if (msg.role === 'assistant') {
        if (msg.crisisTriggered) {
          setCrisisAlert(true);
        }
        if (ttsEnabled) {
          speak(msg.content);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionToken, ttsEnabled, speak]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Submit chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !sessionToken) return;

    const messageText = inputText;
    setInputText('');
    setIsTyping(true);
    incrementQuestions();

    const userMsg: ChatMessage = {
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_chat', {
        sessionToken,
        message: messageText,
        isAskForFriend: askForFriend
      });
    } else {
      try {
        const res = await fetch(`${BACKEND_URL}/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken,
            message: messageText,
            isAskForFriend: askForFriend
          })
        });
        const data = await res.json();
        
        setIsTyping(false);

        if (data.success) {
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: data.response,
            emotionLabel: data.emotionLabel,
            crisisTriggered: data.crisisTriggered,
            createdAt: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, assistantMsg]);
          
          if (data.crisisTriggered) {
            setCrisisAlert(true);
          }
          
          if (ttsEnabled) {
            speak(data.response);
          }
        }
      } catch (err) {
        setIsTyping(false);
        console.error('REST Chat call failed', err);
      }
    }
  };

  const startVoiceInputSimulation = () => {
    if (isRecording) return;
    setIsRecording(true);
    speak(language === 'en' ? 'Recording started, speak now.' : 'Gufata amajwi byatangiye, vuga noneaha.');

    setTimeout(() => {
      setIsRecording(false);
      const simulatedText = language === 'en'
        ? 'I have been feeling very sad and isolated lately. Is it depression?'
        : 'Mfite umuhangayiko n’agahinda mu mutima, nkora iki?';
      setInputText(simulatedText);
      speak(language === 'en' ? 'Voice input recorded.' : 'Amajwi yafashwe.');
    }, 4000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto rounded-3xl overflow-hidden border border-[#edeaf5] bg-white shadow-sm glass-panel">
      
      {/* Chat header */}
      <header className="p-4 border-b border-[#edeaf5] flex items-center justify-between bg-[#fbfbfe]">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#7c3aed]/10 border border-[#7c3aed]/25">
            <Bot className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#2d1c66]">Pulse360 Advisor</span>
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'en' ? 'Confidential Counsel' : 'Ubufasha Buhishwe'}
            </p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          {isNightTime && (
            <div className="flex items-center gap-1 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
              <Moon className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest">2AM Crisis Mode</span>
            </div>
          )}
          
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 rounded-xl border transition flex items-center gap-1 ${
              ttsEnabled 
                ? 'bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed]' 
                : 'bg-[#f7f6fc] border-[#edeaf5] text-slate-400'
            }`}
            title="Toggle Voice Output"
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Safety / Crisis alerts banner */}
      {crisisAlert && (
        <div className="p-4 bg-red-50 border-b border-red-100 text-xs text-red-700 flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 space-y-1">
            <p className="font-extrabold">
              {language === 'en' ? 'Crisis Support Guidelines Activated' : 'Kuba hafi y’Umukoresha Byatangiye'}
            </p>
            <p className="leading-relaxed text-red-600">
              {language === 'en' 
                ? 'If you are experiencing suicidal thoughts, self-harm intentions, or overwhelming pain, please call our 24/7 free national lines:' 
                : 'Niba wumva ufite agahinda gakabije, ibitekerezo byo kwiyahura, cyangwa ububabaro bukabije, hamagara ifatisha ryacu:'}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-2">
              <a href="tel:114" className="px-3.5 py-1.5 rounded-lg bg-red-500 text-white font-bold flex items-center gap-1.5 hover:bg-red-600 shadow-sm transition">
                <Phone className="w-3.5 h-3.5" /> Call 114
              </a>
              <a href="tel:112" className="px-3.5 py-1.5 rounded-lg bg-[#1c194d] text-white font-bold flex items-center gap-1.5 hover:bg-[#13113e] transition">
                <Phone className="w-3.5 h-3.5" /> Call 112
              </a>
              <Link href="/consultation" className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] text-white font-bold flex items-center gap-1.5 hover:bg-[#6d28d9] shadow-sm transition">
                <Video className="w-3.5 h-3.5" /> Book Consultation
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#fbfbfe]/30">
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <Bot className="w-12 h-12 text-[#7c3aed]/25" />
            <h3 className="font-bold text-sm text-[#2d1c66]">
              {language === 'en' ? 'Start a Safe Conversation' : 'Tangira Ikiganiro Kizewe'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {language === 'en'
                ? 'Ask about stress, anxiety, family planning, HIV prevention, or clinics in Rwanda. All answers are confidential.'
                : 'Baza ku bijyanye n’umuhangayiko, kwirinda indwara, kuboneza urubyaro, cyangwa amavuriro mu Rwanda. Byose bikorwa mu ibanga.'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 flex items-center justify-center shrink-0 border border-[#7c3aed]/25">
                  <Bot className="w-4 h-4 text-[#7c3aed]" />
                </div>
              )}
              
              <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm border text-left ${
                isUser 
                  ? 'bg-[#7c3aed] border-[#7c3aed] text-white rounded-tr-none'
                  : 'bg-white border-[#edeaf5] text-[#2d1c66] rounded-tl-none'
              }`}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {!isUser && msg.emotionLabel && msg.emotionLabel !== 'normal' && (
                  <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-2 border ${
                    msg.emotionLabel === 'sad' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20' :
                    msg.emotionLabel === 'anxious' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20' :
                    'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
                  }`}>
                    {msg.emotionLabel}
                  </span>
                )}
                
                <p className={`text-[8px] mt-2 text-right ${isUser ? 'text-purple-200' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-[#edeaf5] flex items-center justify-center shrink-0 border border-slate-200">
                  <User className="w-4 h-4 text-[#2d1c66]" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 flex items-center justify-center shrink-0 border border-[#7c3aed]/25">
              <Bot className="w-4 h-4 text-[#7c3aed]" />
            </div>
            <div className="bg-white border-[#edeaf5] rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Friend Mode and Mic triggers */}
      <footer className="p-4 border-t border-[#edeaf5] bg-[#fbfbfe] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          <button
            onClick={() => {
              setAskForFriend(!askForFriend);
              speak(
                !askForFriend 
                  ? 'Ask for a friend mode enabled. Pronouns and framing are adjusted.'
                  : 'Ask for a friend mode disabled.'
              );
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              askForFriend 
                ? 'bg-[#ec4899]/10 border-[#ec4899]/35 text-[#ec4899] shadow-sm' 
                : 'bg-white border-[#edeaf5] text-slate-500 hover:text-[#2d1c66]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{language === 'en' ? 'Ask for a Friend' : 'Baza ku bw’Inshuti'}</span>
          </button>

          <div className="flex items-center gap-2">
            {isRecording && (
              <span className="text-[10px] font-bold text-[#10b981] animate-pulse">
                {language === 'en' ? 'Listening...' : 'Nkumvirije...'}
              </span>
            )}
            <button
              onClick={startVoiceInputSimulation}
              className={`p-2.5 rounded-xl border transition ${
                isRecording 
                  ? 'bg-red-500 border-red-500 text-white pulse-green' 
                  : 'bg-white border-[#edeaf5] text-slate-600 hover:border-slate-300'
              }`}
              title="Simulate Voice Input"
            >
              <Mic className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              askForFriend 
                ? (language === 'en' ? 'Ask a question for your friend...' : 'Baza ikibazo ku bw’inshuti yawe...')
                : (language === 'en' ? 'Type your message anonymously...' : 'Andika ikibazo cyawe bihishwe...')
            }
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#edeaf5] text-sm text-[#2d1c66] focus:outline-none focus:border-[#7c3aed] transition placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-3 rounded-xl bg-[#ec4899] hover:bg-[#db2777] disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold transition flex items-center justify-center shadow-md shadow-[#ec4899]/15"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>

    </div>
  );
}
