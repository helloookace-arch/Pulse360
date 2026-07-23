-- Cloudflare D1 SQL Schema & Initial Seed for Pulse360

-- 1. Session Table
CREATE TABLE IF NOT EXISTS Session (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE NOT NULL,
  district TEXT DEFAULT 'Kigali',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  lastActive DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Message Table
CREATE TABLE IF NOT EXISTS Message (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  emotionLabel TEXT,
  crisisTriggered BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES Session(id)
);

-- 3. Article Table
CREATE TABLE IF NOT EXISTS Article (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Mental Health' | 'Reproductive Health' | 'Wellness'
  body TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON string array
  language TEXT NOT NULL, -- 'English' | 'Kinyarwanda'
  readingTime TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Community Story Table
CREATE TABLE IF NOT EXISTS Story (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved', -- 'approved' | 'rejected' | 'pending'
  districtHash TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Clinic Table
CREATE TABLE IF NOT EXISTS Clinic (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  services TEXT NOT NULL, -- Comma-separated or JSON
  hours TEXT NOT NULL,
  district TEXT NOT NULL
);

-- 6. Consultation Table
CREATE TABLE IF NOT EXISTS Consultation (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  counselorId TEXT DEFAULT 'dr-mugisha',
  slotTime DATETIME,
  status TEXT DEFAULT 'pending',
  paymentRef TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES Session(id)
);

-- 7. CrisisEvent Table
CREATE TABLE IF NOT EXISTS CrisisEvent (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  triggerType TEXT NOT NULL,
  escalated BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sessionId) REFERENCES Session(id)
);

-- 8. User Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  avatar TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data: Articles
INSERT OR IGNORE INTO Article (id, title, category, body, tags, language, readingTime, thumbnail) VALUES
('art-1', 'Understanding Anxiety: A Guide for Young Rwandans', 'Mental Health', 'Anxiety is a natural response to stress, but when it becomes overwhelming, it can affect your daily life. In Rwanda, young people face academic pressure, unemployment concerns, and social expectations. Understanding your triggers, practicing deep breathing, and talking to a counselor anonymously can make a huge difference. Remember, mental health is health, and seeking help is a strength.', '["anxiety", "mental health", "youth", "mindfulness"]', 'English', '4 min read', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop'),
('art-2', 'Gusobanukirwa Agahinda Gakabije (Depression)', 'Mental Health', 'Agahinda gakabije si intege nke. Ni indwara ivurwa igakira. Bimwe mu bimenyetso byayo ni ukubura ibitotsi, kumva nta cyizere cyo kubaho ufite, ndetse no gutakaza intege mu byo wakundaga gukora. Niba wumva ufite ibi bimenyetso, watugisha inama kuri Pulse360 mu buryo bwizewe kandi buhishwe.', '["agahinda gakabije", "ubuzima bwo mu mutwe", "inama"]', 'Kinyarwanda', '5 min read', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop'),
('art-3', 'Reproductive Health: Myths vs. Facts', 'Reproductive Health', 'There are many misconceptions about sexual and reproductive health. In this article, we debunk common myths surrounding contraception, fertility, and STIs. Knowledge is your shield. Getting accurate information is key to protecting yourself and planning your future.', '["srh", "contraception", "myths", "education"]', 'English', '6 min read', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop'),
('art-4', 'Uburyo bwo Kwirinda Sida n’Izindi Ndwara Zandurira mu Mibonano Mpuzabitsina', 'Reproductive Health', 'Kwirinda ni byiza kuruta kwivuza. Koresha agakingirizo buri gihe, ipimishe buri gihe kugira ngo umenye uko uhagaze, kandi niba ukeka ko wanduye vuba, shaka imiti ya PEP (Post-Exposure Prophylaxis) mu masaha 72. Ubuzima bwawe buri mu maboko yawe.', '["kwirinda", "sida", "srh", "ubuzima"]', 'Kinyarwanda', '4 min read', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop'),
('art-5', 'Self-Care Habits for Daily Wellness', 'Wellness', 'Wellness is not a destination; it is a dynamic journey. Simple acts like sleeping 8 hours a day, drinking enough water, taking short walks, and limiting social media exposure can boost your mood and immune system. Learn to listen to your body and mind.', '["wellness", "self-care", "sleep", "lifestyle"]', 'English', '3 min read', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop');

-- Initial Seed Data: Clinics
INSERT OR IGNORE INTO Clinic (id, name, lat, lng, address, phone, services, hours, district) VALUES
('clinic-1', 'Kigali Youth Friendly Center', -1.9441, 30.0619, 'KN 3 Rd, Nyarugenge, Kigali', '+250 788 123 456', '["Youth Counseling", "SRH Information", "HIV Testing", "Contraceptives"]', '8:00 AM - 5:00 PM', 'Nyarugenge'),
('clinic-2', 'Huye District Hospital Clinic', -2.5967, 29.7394, 'RN1, Huye, Rwanda', '+250 788 654 321', '["Mental Health Consultations", "HIV Treatment (ART)", "Family Planning"]', '24/7 Service', 'Huye'),
('clinic-3', 'Rubavu Friendly Health Clinic', -1.7013, 29.2559, 'Gisenyi Lake Road, Rubavu', '+250 789 111 222', '["Crisis Guidance", "PrEP/PEP Services", "Condom Distribution", "Testing"]', '8:00 AM - 6:00 PM', 'Rubavu'),
('clinic-4', 'Musanze Community Wellness Post', -1.5034, 29.6331, 'Musanze Center, Rwanda', '+250 788 333 444', '["Psychological Support", "Family Wellness", "Reproductive Care"]', '9:00 AM - 5:00 PM', 'Musanze');

-- Initial Seed Data: Stories
INSERT OR IGNORE INTO Story (id, content, category, likes, status, districtHash) VALUES
('story-1', 'I used to struggle with severe anxiety before my exams. Finding Pulse360 helped me learn relaxation techniques anonymously, and my grades have actually improved. It is great to know I am not alone.', 'Mental Health', 24, 'approved', 'Kigali_Nyarugenge'),
('story-2', 'Kuganira ku buzima bw’imyororokere n’ababyeyi bacu biracyari ikizira mu miryango yacu. Pulse360 yampaye amakuru mazima yo kwirinda indwara n’inda zitateganijwe nta pfunwe.', 'Reproductive Health', 42, 'approved', 'Rubavu_Gisenyi');
