import { NextResponse } from 'next/server';
import { getD1 } from '../../../../lib/db';

export const runtime = 'edge';

type ClinicRecord = {
  id?: string;
  _id?: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[] | string;
  hours: string;
  district: string;
  distance?: number | null;
};

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

const fallbackClinics = [
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const db = getD1();
    let clinics: ClinicRecord[] = fallbackClinics;

    if (db) {
      const { results } = await db.prepare('SELECT * FROM Clinic').all<Record<string, unknown>>();
      if (results && results.length > 0) {
        clinics = results.map((c) => ({
          ...c,
          _id: c.id,
          services: typeof c.services === 'string' ? JSON.parse(c.services) : c.services
        })) as ClinicRecord[];
      }
    }

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const sortedClinics = clinics.map(c => {
        const distance = getHaversineDistance(userLat, userLng, c.lat, c.lng);
        return { ...c, distance };
      }).sort((a, b) => a.distance - b.distance);

      return NextResponse.json({ success: true, clinics: sortedClinics });
    }

    return NextResponse.json({ success: true, clinics: clinics.map(c => ({ ...c, distance: null })) });
  } catch (error: unknown) {
    console.warn('Nearby clinics fallback:', error);
    return NextResponse.json({ success: true, clinics: fallbackClinics });
  }
}
