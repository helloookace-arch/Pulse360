'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useApp, BACKEND_URL } from '../../components/AppContext';
import { 
  Search, 
  Phone, 
  Clock, 
  Compass, 
  Navigation 
} from 'lucide-react';

interface Clinic {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  district: string;
  distance?: number | null;
}

const MapComponent = dynamic(
  () => import('../../components/MapComponent'),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-50 flex items-center justify-center rounded-2xl border border-[#edeaf5]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 rounded-full border-4 border-t-[#7c3aed] border-slate-200 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-bold">Loading Interactive Maps...</p>
      </div>
    </div>
  )}
);

export default function FindClinicPage() {
  const {
    language,
    district,
    speak
  } = useApp();

  const [userLocation, setUserLocation] = useState<[number, number]>([-1.9441, 30.0619]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  const [transitMode, setTransitMode] = useState<'walking' | 'driving'>('walking');
  const [directions, setDirections] = useState<string | null>(null);

  useEffect(() => {
    let lat = -1.9441;
    let lng = 30.0619;

    if (district === 'Huye') {
      lat = -2.5967; lng = 29.7394;
    } else if (district === 'Rubavu') {
      lat = -1.7013; lng = 29.2559;
    } else if (district === 'Musanze') {
      lat = -1.5034; lng = 29.6331;
    }
    
    setUserLocation([lat, lng]);
  }, [district]);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/clinics/nearby?lat=${userLocation[0]}&lng=${userLocation[1]}`);
        const data = await res.json();
        if (data.success) {
          setClinics(data.clinics);
        }
      } catch (err) {
        console.error('Failed to query clinics, using fallbacks', err);
        const fallbackClinics: Clinic[] = [
          {
            _id: 'clinic-1',
            name: 'Kigali Youth Friendly Center',
            lat: -1.9441,
            lng: 30.0619,
            address: 'KN 3 Rd, Nyarugenge, Kigali',
            phone: '+250 788 123 456',
            services: ['Youth Counseling', 'SRH Information', 'HIV Testing', 'Contraceptives'],
            hours: '8:00 AM - 5:00 PM',
            district: 'Nyarugenge'
          },
          {
            _id: 'clinic-2',
            name: 'Huye District Hospital Clinic',
            lat: -2.5967,
            lng: 29.7394,
            address: 'RN1, Huye, Rwanda',
            phone: '+250 788 654 321',
            services: ['Mental Health Consultations', 'HIV Treatment (ART)', 'Family Planning'],
            hours: '24/7 Service',
            district: 'Huye'
          },
          {
            _id: 'clinic-3',
            name: 'Rubavu Friendly Health Clinic',
            lat: -1.7013,
            lng: 29.2559,
            address: 'Gisenyi Lake Road, Rubavu',
            phone: '+250 789 111 222',
            services: ['Crisis Guidance', 'PrEP/PEP Services', 'Condom Distribution', 'Testing'],
            hours: '8:00 AM - 6:00 PM',
            district: 'Rubavu'
          },
          {
            _id: 'clinic-4',
            name: 'Musanze Community Wellness Post',
            lat: -1.5034,
            lng: 29.6331,
            address: 'Musanze Center, Rwanda',
            phone: '+250 788 333 444',
            services: ['Psychological Support', 'Family Wellness', 'Reproductive Care'],
            hours: '9:00 AM - 5:00 PM',
            district: 'Musanze'
          }
        ];

        const getHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371;
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180)) * Math.cos(lat2*(Math.PI/180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
          return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));
        };

        const sorted = fallbackClinics.map(c => ({
          ...c,
          distance: getHaversine(userLocation[0], userLocation[1], c.lat, c.lng)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setClinics(sorted);
      }
    };

    fetchClinics();
  }, [userLocation]);

  useEffect(() => {
    if (!selectedClinic) {
      setDirections(null);
      return;
    }

    const dist = selectedClinic.distance || 1.5;
    if (transitMode === 'walking') {
      const mins = Math.round(dist * 12);
      setDirections(language === 'en'
        ? `Route: Head north on main avenue, turn left towards ${selectedClinic.address}. Estimated walking: ${mins} minutes (${dist} km)`
        : `Umuhanda: Gana mu majyaruguru ku muhanda mukuru, ukate ibumoso ugana ${selectedClinic.address}. Uragenda iminota ${mins} n’amaguru (${dist} km)`);
    } else {
      const mins = Math.round(dist * 2.5);
      setDirections(language === 'en'
        ? `Route: Drive along main highway RN1, take exit to ${selectedClinic.address}. Estimated driving: ${mins} minutes (${dist} km)`
        : `Umuhanda: Twarana umuhanda munini RN1, ukate ugana ${selectedClinic.address}. Uragenda iminota ${mins} utwaye imodoka (${dist} km)`);
    }
  }, [selectedClinic, transitMode, language]);

  const handleSelectClinic = (c: Clinic) => {
    setSelectedClinic(c);
    speak(language === 'en' ? `Selected ${c.name}. Distance is ${c.distance || '0'} kilometers.` : `Wahisemo ${c.name}. Intera iri hagati yanyu ni ibilometero ${c.distance || '0'}.`);
  };

  const filteredClinics = clinics.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2d1c66]">
          {language === 'en' ? 'Find a Clinic' : 'Shaka Ivuriro Ryawe'}
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'en' 
            ? 'Interactive map of youth-friendly clinic locations with real-time walking and driving distance.' 
            : 'Ikarita ikwereka amavuriro y’urubyiruko ahaboneka imiti, ibinini, na testing, n’iminota uragenda.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-4 lg:col-span-1 flex flex-col h-[500px]">
          
          <div className="relative">
            <input
              type="text"
              placeholder={language === 'en' ? 'Search clinics, testing, PEP...' : 'Shaka amavuriro, kwipimisha, PEP...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed] transition placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <div className="p-3 bg-[#f7f6fc] rounded-xl border border-[#edeaf5] flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-[#7c3aed]" /> Active GPS:</span>
            <span className="font-bold text-[#2d1c66] uppercase">{district} (Simulated)</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredClinics.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs bg-white border border-[#edeaf5] rounded-xl">{language === 'en' ? 'No clinics match search' : 'Nta mavuriro yabonetse'}</div>
            ) : (
              filteredClinics.map(c => {
                const isSelected = selectedClinic?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => handleSelectClinic(c)}
                    className={`p-4 rounded-xl border transition cursor-pointer text-left space-y-2.5 ${
                      isSelected 
                        ? 'bg-[#7c3aed]/5 border-[#7c3aed]/40' 
                        : 'bg-white border-[#edeaf5] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-[#2d1c66] leading-snug">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.address}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {c.services.slice(0, 2).map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-[#f7f6fc] border border-[#edeaf5] text-[8px] text-[#7c3aed] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#edeaf5] text-[9px] text-slate-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{c.hours}</span>
                      </div>
                      {c.distance !== null && (
                        <div className="text-[#7c3aed] font-extrabold">
                          {c.distance} km
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="h-[380px] w-full rounded-2xl overflow-hidden shadow-sm border border-[#edeaf5] bg-white">
            <MapComponent 
              userCoords={userLocation} 
              clinics={clinics} 
              selectedClinic={selectedClinic} 
            />
          </div>

          {selectedClinic && (
            <div className="p-4 rounded-2xl bg-white border border-[#edeaf5] space-y-3 glass-panel animate-fade-in text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-[#7c3aed]" />
                  <h4 className="font-extrabold text-xs text-[#2d1c66]">Route Directions to {selectedClinic.name}</h4>
                </div>
                
                <div className="flex bg-[#f7f6fc] rounded-lg p-0.5 border border-[#edeaf5]">
                  <button
                    onClick={() => setTransitMode('walking')}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition ${
                      transitMode === 'walking' ? 'bg-[#7c3aed] text-white' : 'text-slate-500 hover:text-[#2d1c66]'
                    }`}
                  >
                    Walking
                  </button>
                  <button
                    onClick={() => setTransitMode('driving')}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition ${
                      transitMode === 'driving' ? 'bg-[#7c3aed] text-white' : 'text-slate-500 hover:text-[#2d1c66]'
                    }`}
                  >
                    Driving
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#493f6d] leading-relaxed font-semibold bg-[#f7f6fc]/70 p-3 rounded-xl border border-[#edeaf5]">
                {directions}
              </p>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-450">Need to call first?</span>
                <a
                  href={`tel:${selectedClinic.phone}`}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#f7f6fc] border border-[#edeaf5] text-[#2d1c66] font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#ec4899]" />
                  <span>Call {selectedClinic.phone}</span>
                </a>
              </div>
            </div>
          )}

          {!selectedClinic && (
            <div className="p-4 rounded-2xl bg-white border border-[#edeaf5] text-center text-xs text-slate-450 font-semibold shadow-sm">
              {language === 'en' ? 'Click on a clinic card in the directory to overlay route directions.' : 'Kanda ku ivuriro ryo ku rutonde kugira ngo ugaragaze icyerekezo kuri map.'}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
