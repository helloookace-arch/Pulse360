import { NextResponse } from 'next/server';

export const runtime = 'edge';

const fallbackArticles = [
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const language = searchParams.get('language');

    // @ts-expect-error - Edge runtime types
    const db = process.env.DB || (globalThis as unknown as { DB?: unknown }).DB;
    let articles = fallbackArticles;

    if (db) {
      const { results } = await db.prepare('SELECT * FROM Article').all();
      if (results && results.length > 0) {
        articles = results.map((a: unknown) => ({
          ...a,
          _id: a.id,
          tags: typeof a.tags === 'string' ? JSON.parse(a.tags) : a.tags
        }));
      }
    }

    if (category && category !== 'All') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (language) {
      articles = articles.filter(a => a.language.toLowerCase() === language.toLowerCase());
    }

    if (search) {
      const query = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.body.toLowerCase().includes(query) ||
        (Array.isArray(a.tags) && a.tags.some((t: string) => t.toLowerCase().includes(query)))
      );
    }

    return NextResponse.json({ success: true, articles });
  } catch {
    return NextResponse.json({ success: true, articles: fallbackArticles });
  }
}
