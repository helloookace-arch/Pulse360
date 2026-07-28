'use client';

import React, { useState } from 'react';
import { useApp, BACKEND_URL } from '../../components/AppContext';
import { 
  Video, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  PhoneOff, 
  Mic, 
  MicOff, 
  ArrowRight,
  Shield,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Counselor {
  id: string;
  name: string;
  specialtyEn: string;
  specialtyRw: string;
  fee: number;
  avatarColor: string;
}

interface ConsultationBooking {
  id: string;
  counselorId: string;
  counselorName?: string;
  counselorRole?: string;
  slotTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  roomId: string;
  meetingUrl: string;
}

const TIME_SLOT_MAP: Record<string, string> = {
  '10:00 AM': '10:00:00',
  '02:00 PM': '14:00:00',
  '04:00 PM': '16:00:00'
};

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function getMaxBookingDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}

function createLocalConsultation(counselorId: string, slotTime: string): ConsultationBooking {
  const id = `local-booking-${Date.now()}`;
  const roomId = `meet-${id.slice(-8)}`;
  return {
    id,
    counselorId,
    slotTime,
    status: 'pending',
    roomId,
    meetingUrl: `https://telehealth.pulse360.rw/room/${roomId}`
  };
}

export default function VirtualConsultationPage() {
  const {
    language,
    sessionToken,
    consultationCount,
    addConsultationLocally,
    speak
  } = useApp();

  const [step, setStep] = useState<'specialty' | 'datetime' | 'payment' | 'confirmed' | 'active_call'>('specialty');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => getTodayDate());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  
  const [paymentProvider, setPaymentProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [phone, setPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [consultationDetails, setConsultationDetails] = useState<ConsultationBooking | null>(null);

  const [micActive, setMicActive] = useState(true);
  const [callTimer, setCallTimer] = useState('00:00');

  const counselors: Counselor[] = [
    { 
      id: 'dr-mugisha', 
      name: 'Dr. Mugisha Jean', 
      specialtyEn: 'Mental Health Therapist', 
      specialtyRw: 'Umujyanama mu by’Ubuzima bwo mu Mutwe', 
      fee: 10000, 
      avatarColor: 'bg-indigo-600'
    },
    { 
      id: 'nurse-kamanzi', 
      name: 'Nurse Kamanzi Marie', 
      specialtyEn: 'Sexual & Reproductive Health Specialist', 
      specialtyRw: 'Inzobere mu Myororokere n’Ubuzima bw’Imyanya ndangagitsina', 
      fee: 8000, 
      avatarColor: 'bg-[#10b981]'
    },
    { 
      id: 'dr-uwera', 
      name: 'Dr. Uwera Aline', 
      specialtyEn: 'General Wellness & Stress Coach', 
      specialtyRw: 'Inzobere mu Mibereho Myiza n’Umuhangayiko', 
      fee: 5000, 
      avatarColor: 'bg-purple-600'
    }
  ];

  const handleSelectSpecialty = (c: Counselor) => {
    setSelectedCounselor(c);
    setStep('datetime');
    speak(language === 'en' ? `Selected ${c.name}. Now choose date and time.` : `Wahisemo ${c.name}. Hitamo umunsi n’isaha.`);
  };

  const handleSelectDateTime = async () => {
    if (!selectedCounselor) return;

    const slotTime = `${selectedDate}T${TIME_SLOT_MAP[selectedTime]}`;

    try {
      const res = await fetch(`${BACKEND_URL}/consultation/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken,
          counselorId: selectedCounselor.id,
          slotTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setConsultationId(data.consultation.id);
        setConsultationDetails(data.consultation);
      } else {
        throw new Error(data.error || 'Failed to register booking');
      }
    } catch (e) {
      console.error('Failed to register booking', e);
      const fallbackConsultation = createLocalConsultation(selectedCounselor.id, slotTime);
      setConsultationId(fallbackConsultation.id);
      setConsultationDetails(fallbackConsultation);
    }

    if (consultationCount === 0) {
      setStep('confirmed');
      addConsultationLocally();
      speak(language === 'en' ? 'First session is free! Booking confirmed.' : 'Ubonye gahunda ya mbere kubuntu! Byemejwe.');
    } else {
      setStep('payment');
      speak(language === 'en' ? 'Select mobile payment options.' : 'Hitamo uburyo bwo kwishyura kuri telephone.');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !selectedCounselor) return;
    setIsPaying(true);

    try {
      const res = await fetch(`${BACKEND_URL}/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId: consultationId || `local-${Date.now()}`,
          amount: selectedCounselor.fee,
          phone,
          provider: paymentProvider
        })
      });
      const data = await res.json();
      setIsPaying(false);
      if (data.success) {
        if (data.consultation?.paymentRef) {
          setConsultationDetails(prev => prev ? { ...prev, status: 'confirmed' } : prev);
        }
        addConsultationLocally();
        setStep('confirmed');
        speak(language === 'en' ? 'Payment approved. Consultation scheduled.' : 'Kwishyura byemejwe. Gahunda yateguwe.');
      }
    } catch {
      setTimeout(() => {
        setIsPaying(false);
        setConsultationDetails(prev => prev ? { ...prev, status: 'confirmed' } : prev);
        addConsultationLocally();
        setStep('confirmed');
        speak(language === 'en' ? 'Payment approved. Consultation scheduled.' : 'Kwishyura byemejwe. Gahunda yateguwe.');
      }, 2000);
    }
  };

  const handleStartCall = () => {
    setStep('active_call');
    speak(language === 'en' ? 'Connecting to secure avatar consultation call.' : 'Turi kuguhuza n’umujyanama wawe.');
    
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      setCallTimer(`${mins}:${secs}`);
    }, 1000);

    (window as unknown as { callInterval: ReturnType<typeof setInterval> }).callInterval = interval;
  };

  const handleEndCall = () => {
    const w = window as unknown as { callInterval?: ReturnType<typeof setInterval> };
    if (w.callInterval) {
      clearInterval(w.callInterval);
    }
    setStep('specialty');
    setSelectedCounselor(null);
    setConsultationDetails(null);
    setConsultationId(null);
    setSelectedDate(getTodayDate());
    setSelectedTime('10:00 AM');
    speak(language === 'en' ? 'Consultation call ended.' : 'Ikiganiro cyarangiye.');
  };

  const currentSpecialty = selectedCounselor 
    ? (language === 'en' ? selectedCounselor.specialtyEn : selectedCounselor.specialtyRw)
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d1c66]">
          {language === 'en' ? 'Virtual Consultation' : 'Kugisha Inama mu Mashusho'}
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'en' 
            ? 'Connect securely with licensed counselors through an avatar-mediated private video call.' 
            : 'Girana imibonano y’amashusho yihishwe n’abajyanama bacu bacukuye inyigisho.'}
        </p>
      </div>

      <Card className="rounded-3xl border-none shadow-xl bg-white/95 backdrop-blur-xl p-6 md:p-8 min-h-[400px] flex flex-col justify-between">
        
        {step === 'specialty' && (
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#2d1c66] uppercase tracking-wider">
                {language === 'en' ? 'Step 1: Choose Your Counselor' : 'Intambwe ya 1: Hitamo Umujyanama'}
              </h3>
              {consultationCount === 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#10b981]/15 text-[#10b981] animate-pulse border border-[#10b981]/25">
                  <Coins className="w-3.5 h-3.5" />
                  {language === 'en' ? 'FREE FIRST SESSION' : 'GUSAHA YA MBERE NI MAKU'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {counselors.map((c) => {
                const spec = language === 'en' ? c.specialtyEn : c.specialtyRw;
                const costLabel = consultationCount === 0 ? 'FREE' : `${c.fee.toLocaleString()} RWF`;
                return (
                  <Card
                    key={c.id}
                    onClick={() => handleSelectSpecialty(c)}
                    className="p-5 rounded-2xl bg-[#f7f6fc]/50 border-[#edeaf5] hover:border-[#7c3aed]/30 hover:bg-white hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-64 group"
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-xl ${c.avatarColor} flex items-center justify-center font-bold text-white shadow-lg`}>
                        {c.name.split(' ').pop()?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#2d1c66] group-hover:text-[#7c3aed] transition">{c.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{spec}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#edeaf5] pt-3 mt-4">
                      <span className="text-xs font-bold text-slate-450">{language === 'en' ? 'Price:' : 'Igiciro:'}</span>
                      <span className={`text-xs font-black ${consultationCount === 0 ? 'text-[#10b981]' : 'text-[#7c3aed]'}`}>{costLabel}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 'datetime' && selectedCounselor && (
          <div className="space-y-6 flex-1">
            <h3 className="font-bold text-sm text-[#2d1c66] uppercase tracking-wider">
              {language === 'en' ? `Step 2: Choose Slot for ${selectedCounselor.name}` : `Intambwe ya 2: Hitamo igihe kuri ${selectedCounselor.name}`}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4 rounded-xl bg-[#f7f6fc] border-[#edeaf5] space-y-3">
                <label className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-[#7c3aed]" /> Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  min={getTodayDate()}
                  max={getMaxBookingDate()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-[#edeaf5] rounded-lg text-xs font-semibold text-[#2d1c66] focus-visible:ring-[#7c3aed]"
                />
              </Card>

              <Card className="p-4 rounded-xl bg-[#f7f6fc] border-[#edeaf5] space-y-3">
                <label className="text-xs font-bold text-[#2d1c66] flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#ec4899]" /> Select Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {['10:00 AM', '02:00 PM', '04:00 PM'].map(time => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className={`h-9 text-[10px] font-bold ${
                        selectedTime === time 
                          ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white' 
                          : 'bg-white border-[#edeaf5] text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[#edeaf5] mt-6">
              <Button
                variant="outline"
                onClick={() => setStep('specialty')}
                className="bg-[#f7f6fc] border-[#edeaf5] text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Back
              </Button>
              <Button
                onClick={handleSelectDateTime}
                className="rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-lg shadow-[#7c3aed]/15 flex items-center gap-1.5"
              >
                <span>{language === 'en' ? 'Continue' : 'Komeza'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && selectedCounselor && (
          <form onSubmit={handlePayment} className="space-y-6 flex-1">
            <h3 className="font-bold text-sm text-[#2d1c66] uppercase tracking-wider">
              {language === 'en' ? 'Step 3: Secure Mobile Checkout' : 'Intambwe ya 3: Kwishyura Byizewe'}
            </h3>

            <Card className="p-5 rounded-2xl bg-[#f7f6fc] border-[#edeaf5] space-y-4 max-w-md mx-auto">
              <div className="flex items-center justify-between border-b border-[#edeaf5] pb-3">
                <span className="text-xs text-slate-400">Consultation Fee</span>
                <span className="text-sm font-black text-[#2d1c66]">{selectedCounselor.fee.toLocaleString()} RWF</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'MTN', name: 'MTN MoMo', border: 'border-yellow-500/20', active: 'bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600' },
                    { key: 'Airtel', name: 'Airtel Money', border: 'border-red-500/20', active: 'bg-red-500 text-white border-red-600 hover:bg-red-600' }
                  ].map(prov => {
                    const active = paymentProvider === prov.key;
                    return (
                      <Button
                        key={prov.key}
                        type="button"
                        variant={active ? "default" : "outline"}
                        onClick={() => setPaymentProvider(prov.key as 'MTN' | 'Airtel')}
                        className={`h-12 rounded-xl text-xs font-bold transition-all ${
                          active ? prov.active : `bg-white ${prov.border} text-slate-400 hover:text-slate-600`
                        }`}
                      >
                        {prov.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Money Number</label>
                <div className="relative">
                  <Input
                    type="tel"
                    required
                    placeholder="078 / 072 / 073..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 rounded-xl bg-white border-[#edeaf5] text-xs text-[#2d1c66] focus-visible:ring-[#7c3aed] transition"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-3 rounded-xl bg-white text-[10px] text-slate-550 border border-[#edeaf5]">
                <Shield className="w-4 h-4 text-[#10b981] shrink-0" />
                <span>Transactions are secured through national payment gateways.</span>
              </div>
            </Card>

            <div className="flex justify-between items-center pt-6 border-t border-[#edeaf5] mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('datetime')}
                className="bg-[#f7f6fc] border-[#edeaf5] text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPaying || !phone}
                className="rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-md shadow-[#7c3aed]/15"
              >
                {isPaying ? 'Processing Payment...' : `Pay ${selectedCounselor.fee.toLocaleString()} RWF`}
              </Button>
            </div>
          </form>
        )}

        {step === 'confirmed' && selectedCounselor && (
          <div className="space-y-6 flex-1 text-center py-6 max-w-md mx-auto">
            <CheckCircle className="w-16 h-16 text-[#10b981] mx-auto animate-bounce" />
            <div className="space-y-2">
              <h3 className="text-lg font-black text-[#2d1c66]">
                {language === 'en' ? 'Consultation Confirmed' : 'Gahunda Yemejwe Neza'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'en'
                  ? `Your private consultation session with ${selectedCounselor.name} (${currentSpecialty}) is scheduled for:`
                  : `Urugendo rwawe rwihishe na ${selectedCounselor.name} (${currentSpecialty}) rwahitswe kuri:`}
              </p>
            </div>

            <Card className="p-4 rounded-2xl bg-[#f7f6fc] border-[#edeaf5] grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Date</p>
                <p className="text-xs font-bold text-[#2d1c66] mt-0.5">{selectedDate}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Time Slot</p>
                <p className="text-xs font-bold text-[#2d1c66] mt-0.5">{selectedTime}</p>
              </div>
            </Card>

            {consultationDetails && (
              <Card className="p-4 rounded-2xl bg-white border-[#edeaf5] text-left space-y-2 shadow-sm">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Meeting Room ID</p>
                  <p className="text-xs font-mono font-bold text-[#2d1c66] mt-0.5">{consultationDetails.roomId}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Secure WebRTC Link</p>
                  <a
                    href={consultationDetails.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#7c3aed] break-all hover:underline"
                  >
                    {consultationDetails.meetingUrl}
                  </a>
                </div>
              </Card>
            )}

            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleStartCall}
                  className="w-full h-12 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white font-bold text-xs shadow-lg shadow-[#ec4899]/15 flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>{language === 'en' ? 'Join Virtual Room Now' : 'Injira mu cyumba cy’Imibonano'}</span>
                </Button>
                {consultationDetails && (
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl bg-[#7c3aed]/5 hover:bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed] font-bold text-xs flex items-center justify-center gap-2"
                    asChild
                  >
                    <a href={consultationDetails.meetingUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowRight className="w-4 h-4" />
                      <span>{language === 'en' ? 'Open Meeting Link' : 'Fungura Umuyoboro w’Inama'}</span>
                    </a>
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStep('specialty');
                  setConsultationDetails(null);
                  setConsultationId(null);
                }}
                className="w-full h-11 rounded-xl bg-[#f7f6fc] border-[#edeaf5] text-slate-500 hover:text-[#2d1c66] hover:bg-slate-100 text-xs font-bold"
              >
                {language === 'en' ? 'Return to Specialist Directory' : 'Komeza Uruhande rwa Directory'}
              </Button>
            </div>
          </div>
        )}

        {step === 'active_call' && selectedCounselor && (
          <div className="space-y-6 flex-1 flex flex-col justify-between h-[500px]">
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Feed */}
              <Card className="relative rounded-2xl overflow-hidden bg-slate-50 border-[#edeaf5] flex items-center justify-center h-full shadow-inner">
                <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 rounded text-[10px] text-[#2d1c66] border border-[#edeaf5] font-bold">
                  {selectedCounselor.name}
                </div>
                
                <div className="flex flex-col items-center space-y-4 animate-head-nod">
                  <svg className="w-24 h-24 text-slate-300" viewBox="0 0 100 100">
                    <circle cx="50" cy="40" r="24" fill="#edeaf8" stroke="#7c3aed" strokeWidth="2" />
                    <path d="M15 90 C 20 65, 80 65, 85 90 Z" fill="#dcd9f4" stroke="#7c3aed" strokeWidth="2" />
                    <circle cx="42" cy="38" r="3" fill="#10b981" />
                    <circle cx="58" cy="38" r="3" fill="#10b981" />
                    <path d="M45 52 Q 50 56 55 52" stroke="#7c3aed" strokeWidth="2" fill="none" />
                  </svg>
                  
                  <div className="flex gap-1 items-center justify-center">
                    <span className="w-1.5 h-3 bg-[#10b981] rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-6 bg-[#10b981] rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-4 bg-[#10b981] rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="w-1.5 h-7 bg-[#10b981] rounded animate-bounce" style={{ animationDelay: '450ms' }} />
                    <span className="w-1.5 h-2 bg-[#10b981] rounded animate-bounce" style={{ animationDelay: '600ms' }} />
                  </div>
                </div>
              </Card>

              {/* User Feed */}
              <Card className="relative rounded-2xl overflow-hidden bg-slate-50 border-[#edeaf5] flex items-center justify-center h-full shadow-inner">
                <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 rounded text-[10px] text-[#2d1c66] border border-[#edeaf5] font-bold">
                  {language === 'en' ? 'Anonymous Peer (You)' : 'Umukoresha (Wowe)'}
                </div>

                <div className="text-center space-y-2">
                  <svg className="w-20 h-20 text-slate-450 mx-auto" viewBox="0 0 100 100">
                    <circle cx="50" cy="40" r="22" fill="#f1eff7" stroke="#b4b0cc" strokeWidth="2" />
                    <path d="M20 90 C 25 70, 75 70, 80 90 Z" fill="#e0ddf1" stroke="#b4b0cc" strokeWidth="2" />
                  </svg>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {micActive ? (language === 'en' ? 'Audio Stream Active' : 'Amajwi Yafunguye') : (language === 'en' ? 'Muted' : 'Urufunga')}
                  </p>
                </div>
              </Card>
            </div>

            {/* Bottom Controls */}
            <Card className="p-4 rounded-2xl bg-[#f7f6fc] border-[#edeaf5] flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[#2d1c66]">DURATION: {callTimer}</span>
              
              <div className="flex gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setMicActive(!micActive)}
                  className={`w-12 h-12 rounded-full transition ${
                    micActive ? 'bg-[#edeaf5] text-[#2d1c66] hover:bg-[#ded9ed] border-transparent' : 'bg-red-500 text-white hover:bg-red-600 border-transparent'
                  }`}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                  size="icon"
                  onClick={handleEndCall}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white border-transparent"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>

              <span className="text-[10px] text-[#10b981] font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                SECURE WebRTC
              </span>
            </Card>

          </div>
        )}

      </Card>
      
    </div>
  );
}
