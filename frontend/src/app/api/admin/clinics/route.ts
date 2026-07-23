import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/auth';

export const runtime = 'edge';

const INITIAL_CLINICS = [
  {
    id: 'clinic-1',
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
    id: 'clinic-2',
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
    id: 'clinic-3',
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
    id: 'clinic-4',
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
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      const { results } = await db.prepare('SELECT * FROM Clinic ORDER BY name ASC').all();
      if (results && results.length > 0) {
        const parsed = results.map((c: Record<string, unknown>) => ({
          ...c,
          services: typeof c.services === 'string' ? JSON.parse(c.services as string) : c.services
        }));
        return NextResponse.json({ success: true, clinics: parsed });
      }
    }

    return NextResponse.json({ success: true, clinics: INITIAL_CLINICS });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch clinics';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { name, lat, lng, address, phone, services, hours, district } = await request.json();
    if (!name || !address || !phone || !district) {
      return NextResponse.json({ success: false, error: 'Missing required clinic fields' }, { status: 400 });
    }

    const clinicId = `clinic_${Date.now()}`;
    const servicesJson = JSON.stringify(Array.isArray(services) ? services : [services]);

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      await db.prepare(
        'INSERT INTO Clinic (id, name, lat, lng, address, phone, services, hours, district) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(clinicId, name, parseFloat(lat) || -1.9441, parseFloat(lng) || 30.0619, address, phone, servicesJson, hours || '8:00 AM - 5:00 PM', district).run();
    }

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinicId,
        name,
        lat: parseFloat(lat) || -1.9441,
        lng: parseFloat(lng) || 30.0619,
        address,
        phone,
        services: Array.isArray(services) ? services : [services],
        hours: hours || '8:00 AM - 5:00 PM',
        district
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create clinic';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { id, name, lat, lng, address, phone, services, hours, district } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Clinic ID required' }, { status: 400 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    const servicesJson = JSON.stringify(Array.isArray(services) ? services : [services]);

    if (db) {
      await db.prepare(
        'UPDATE Clinic SET name = ?, lat = ?, lng = ?, address = ?, phone = ?, services = ?, hours = ?, district = ? WHERE id = ?'
      ).bind(name, parseFloat(lat), parseFloat(lng), address, phone, servicesJson, hours, district, id).run();
    }

    return NextResponse.json({ success: true, message: 'Clinic updated successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update clinic';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Clinic ID required' }, { status: 400 });
    }

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;

    if (db) {
      await db.prepare('DELETE FROM Clinic WHERE id = ?').bind(id).run();
    }

    return NextResponse.json({ success: true, message: 'Clinic deleted successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete clinic';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
