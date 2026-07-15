import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../db_mock_mongo.json');

export interface Article {
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

export interface Story {
  _id: string;
  content: string;
  category: 'Mental Health' | 'Reproductive Health' | 'Wellness';
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  districtHash: string;
  createdAt: string;
}

export interface Clinic {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  district: string;
}

export interface HealthQA {
  _id: string;
  question: string;
  answer: string;
  language: 'English' | 'Kinyarwanda';
  category: string;
  source: string;
}

interface MockDB {
  articles: Article[];
  stories: Story[];
  clinics: Clinic[];
  health_qa: HealthQA[];
}

const defaultArticles: Article[] = [
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

const defaultStories: Story[] = [
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
];

const defaultClinics: Clinic[] = [
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

const defaultHealthQA: HealthQA[] = [
  {
    _id: 'qa-1',
    question: 'What is PEP and when should it be taken?',
    answer: 'PEP (Post-Exposure Prophylaxis) is a course of emergency anti-HIV medicines taken after possible exposure to HIV. It must be started within 72 hours (3 days) of exposure to be effective. Go to the nearest youth clinic or hospital immediately if you need PEP.',
    language: 'English',
    category: 'Reproductive Health',
    source: 'RBC / WHO Guidelines'
  },
  {
    _id: 'qa-2',
    question: 'Ese PEP n’iki kandi ifatwa ryari?',
    answer: 'PEP ni imiti y’urukurikirane itangwa mu gihe cy’imidagadago nyuma yo kwakeka ko wahuye na virusi itera SIDA. Igomba gufatwa mu gihe kitarenze amasaha 72 (iminsi 3) kugira ngo ikore neza. Gana ivuriro ryenda rikwegereye vuba bishoboka.',
    language: 'Kinyarwanda',
    category: 'Reproductive Health',
    source: 'RBC Guidelines'
  }
];

class MongoMockService {
  private db: MockDB = { articles: [], stories: [], clinics: [], health_qa: [] };

  constructor() {
    this.loadDB();
  }

  private loadDB() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.db = JSON.parse(raw);
      } else {
        this.db = {
          articles: defaultArticles,
          stories: defaultStories,
          clinics: defaultClinics,
          health_qa: defaultHealthQA
        };
        this.saveDB();
      }
    } catch (e) {
      console.error('Failed to load mongo mock DB, using default datasets', e);
      this.db = {
        articles: defaultArticles,
        stories: defaultStories,
        clinics: defaultClinics,
        health_qa: defaultHealthQA
      };
    }
  }

  private saveDB() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save mongo mock DB', e);
    }
  }

  getArticles() {
    return this.db.articles;
  }

  getArticleById(id: string) {
    return this.db.articles.find(a => a._id === id);
  }

  getStories() {
    return this.db.stories.filter(s => s.status === 'approved');
  }

  addStory(content: string, category: 'Mental Health' | 'Reproductive Health' | 'Wellness', districtHash: string) {
    const isModerate = content.toLowerCase().includes('spam') || content.toLowerCase().includes('http') || content.length < 10;
    const status = isModerate ? 'rejected' : 'approved';
    const newStory: Story = {
      _id: `story-${Date.now()}`,
      content,
      category,
      likes: 0,
      status,
      districtHash,
      createdAt: new Date().toISOString()
    };
    this.db.stories.unshift(newStory);
    this.saveDB();
    return newStory;
  }

  likeStory(id: string) {
    const story = this.db.stories.find(s => s._id === id);
    if (story) {
      story.likes += 1;
      this.saveDB();
      return story;
    }
    return null;
  }

  getClinics() {
    return this.db.clinics;
  }

  getHealthQA() {
    return this.db.health_qa;
  }
}

export const dbMock = new MongoMockService();
