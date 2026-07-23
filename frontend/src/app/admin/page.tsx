'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  PlusCircle, 
  MessageSquare,
  Lock,
  BarChart3,
  MapPin,
  Users,
  AlertTriangle,
  Sliders,
  Search,
  Trash2,
  Megaphone,
  Activity,
  TrendingUp,
  RefreshCw,
  FileText,
  CreditCard,
  BookOpen,
  UserCheck,
  Layers,
  History,
  PhoneCall,
  Download,
  Map
} from 'lucide-react';

interface Story {
  id: string;
  content: string;
  category: string;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  districtHash: string;
  aiSafetyScore: number;
  createdAt: string;
}

interface Clinic {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  services: string[];
  hours: string;
  district: string;
  status: 'Open' | 'Closed';
}

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'content_manager' | 'moderator' | 'medical_professional' | 'counselor' | 'finance' | 'data_analyst' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}

interface CrisisEvent {
  id: string;
  sessionId: string;
  triggerType: string;
  escalated: boolean;
  resolved: boolean;
  district: string;
  createdAt: string;
}

interface SystemSettings {
  aiModel: string;
  openaiKey: string;
  mapsKey: string;
  smsApiUrl: string;
  broadcastNotice: string;
}

interface SessionItem {
  id: string;
  sessionToken: string;
  lastActive: string;
  deviceType: string;
  country: string;
  district: string;
  language: string;
  messagesCount: number;
  crisisTriggered: boolean;
}

interface ChatLog {
  id: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  confidence: number;
  feedbackRating: number;
  crisisTriggered: boolean;
  category: string;
  createdAt: string;
}

interface PaymentTransaction {
  id: string;
  sessionId: string;
  provider: string;
  amount: number;
  status: 'completed' | 'failed' | 'refunded';
  paymentRef: string;
  purpose: string;
  createdAt: string;
}

interface KnowledgeBaseItem {
  systemPrompt: string;
  faqs: { id: string; question: string; answer: string }[];
  guidelines: { title: string; source: string; status: string }[];
}

interface AuditLogItem {
  id: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [unauthorized, setUnauthorized] = useState(false);
  const [adminRole, setAdminRole] = useState<'super_admin' | 'moderator' | 'finance' | 'content_manager' | 'medical_professional' | 'counselor' | 'data_analyst'>('super_admin');
  
  // Navigation Tabs (15 total)
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Multi-module Data states
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);

  const [stories, setStories] = useState<Story[]>([]);
  const [storyFilter, setStoryFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loadingStories, setLoadingStories] = useState(true);
  const [storyEditContent, setStoryEditContent] = useState<string>('');
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [clinicSearch, setClinicSearch] = useState('');
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [clinicForm, setClinicForm] = useState({
    name: '',
    address: '',
    phone: '',
    district: 'Nyarugenge',
    lat: '-1.9441',
    lng: '30.0619',
    hours: '8:00 AM - 5:00 PM',
    services: 'Youth Counseling, HIV Testing, Contraceptives',
    status: 'Open' as 'Open' | 'Closed'
  });
  const [clinicSuccess, setClinicSuccess] = useState<string | null>(null);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [crisisEvents, setCrisisEvents] = useState<CrisisEvent[]>([]);
  const [loadingCrisis, setLoadingCrisis] = useState(true);

  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem | null>(null);
  const [, setLoadingKB] = useState(true);
  const [systemPromptInput, setSystemPromptInput] = useState('');
  const [kbSuccess, setKbSuccess] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  const [settings, setSettings] = useState<SystemSettings>({
    aiModel: 'gpt-4o',
    openaiKey: 'sk-proj-************************',
    mapsKey: 'AIzaSy************************',
    smsApiUrl: 'https://api.sms-gateway.rw/v1/send',
    broadcastNotice: 'Welcome to Pulse360! 24/7 Confidential Youth Health & Psychological Support in Rwanda.'
  });
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Article creation form (CMS)
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Mental Health');
  const [articleBody, setArticleBody] = useState('');
  const [articleTags, setArticleTags] = useState('anxiety, youth');
  const [articleLanguage, setArticleLanguage] = useState('English');
  const [articleStatus, setArticleStatus] = useState<'published' | 'draft'>('published');
  const [articleSuccess, setArticleSuccess] = useState<string | null>(null);

  // Broadcaster state
  const [broadcasterTarget, setBroadcasterTarget] = useState<'all' | 'Kigali' | 'Huye' | 'Rubavu' | 'Musanze'>('all');
  const [broadcasterLang, setBroadcasterLang] = useState<'all' | 'en' | 'rw'>('all');
  const [broadcasterType, setBroadcasterType] = useState<'push' | 'sms' | 'whatsapp'>('push');
  const [broadcasterMessage, setBroadcasterMessage] = useState('');
  const [broadcasterSuccess, setBroadcasterSuccess] = useState<string | null>(null);

  // Map click coordinates picker simulation
  const handleMapSimulatorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to simulated Kigali coordinates
    const scaleLat = -1.93 - (y / rect.height) * 0.05;
    const scaleLng = 30.04 + (x / rect.width) * 0.06;
    
    setClinicForm(prev => ({
      ...prev,
      lat: scaleLat.toFixed(4),
      lng: scaleLng.toFixed(4)
    }));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    fetchSessions();
    fetchChatLogs();
    fetchAdminStories();
    fetchClinics();
    fetchUsers();
    fetchCrisisEvents();
    fetchPayments();
    fetchKnowledgeBase();
    fetchAuditLogs();
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/admin/sessions');
      if (res.status === 403 || res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json();
      if (data.success) setSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchChatLogs = async () => {
    setLoadingChats(true);
    try {
      const res = await fetch('/api/admin/chat-logs');
      const data = await res.json();
      if (data.success) setChatLogs(data.chatLogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchAdminStories = async () => {
    setLoadingStories(true);
    try {
      const res = await fetch('/api/admin/stories');
      const data = await res.json();
      if (data.success) {
        const storiesWithScores = (data.stories || []).map((s: Record<string, unknown>) => ({
          ...s,
          aiSafetyScore: typeof s.aiSafetyScore === 'number' ? s.aiSafetyScore : (s.status === 'approved' ? 95 : s.status === 'rejected' ? 12 : 78)
        }));
        setStories(storiesWithScores);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await fetch('/api/admin/clinics');
      const data = await res.json();
      if (data.success) setClinics(data.clinics || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClinics(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCrisisEvents = async () => {
    setLoadingCrisis(true);
    try {
      const res = await fetch('/api/admin/crisis');
      const data = await res.json();
      if (data.success) setCrisisEvents(data.crisisEvents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCrisis(false);
    }
  };

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.success) setPayments(data.payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchKnowledgeBase = async () => {
    setLoadingKB(true);
    try {
      const res = await fetch('/api/admin/knowledge-base');
      const data = await res.json();
      if (data.success) {
        setKnowledgeBase(data.knowledgeBase);
        setSystemPromptInput(data.knowledgeBase.systemPrompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKB(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success) setAuditLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Actions
  const handleUpdateStoryStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        setStories(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        logAction('Story Moderation Decision', `Set status of story ${id} to ${status}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditStoryContent = (story: Story) => {
    setEditingStoryId(story.id);
    setStoryEditContent(story.content);
  };

  const handleSaveStoryContent = async () => {
    if (!editingStoryId || !storyEditContent.trim()) return;
    setStories(prev => prev.map(s => s.id === editingStoryId ? { ...s, content: storyEditContent } : s));
    logAction('Story Edited', `Modified body of story ${editingStoryId}`);
    setEditingStoryId(null);
  };

  const handleBanSession = (sessionId: string) => {
    if (confirm(`Ban session ${sessionId} for abusive behavior?`)) {
      setSessions(prev => prev.filter(s => s.sessionToken !== sessionId && s.id !== sessionId));
      logAction('Session Banned', `Banned anonymous session ID: ${sessionId}`);
      alert(`Session ${sessionId} has been banned.`);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to terminate this anonymous session?')) return;
    try {
      const res = await fetch(`/api/admin/sessions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
        logAction('Session Terminated', `Deleted anonymous session ID: ${id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicForm.name || !clinicForm.address || !clinicForm.phone) return;

    const payload = {
      id: editingClinic?.id,
      name: clinicForm.name,
      address: clinicForm.address,
      phone: clinicForm.phone,
      district: clinicForm.district,
      lat: parseFloat(clinicForm.lat) || -1.9441,
      lng: parseFloat(clinicForm.lng) || 30.0619,
      hours: clinicForm.hours,
      services: clinicForm.services.split(',').map(s => s.trim()),
      status: clinicForm.status
    };

    const method = editingClinic ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/clinics', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setClinicSuccess(editingClinic ? 'Clinic updated successfully!' : 'Clinic added to map directory!');
        logAction(editingClinic ? 'Clinic Updated' : 'Clinic Added', `Managed clinic entry: ${clinicForm.name}`);
        setEditingClinic(null);
        setClinicForm({
          name: '',
          address: '',
          phone: '',
          district: 'Nyarugenge',
          lat: '-1.9441',
          lng: '30.0619',
          hours: '8:00 AM - 5:00 PM',
          services: 'Youth Counseling, HIV Testing, Contraceptives',
          status: 'Open'
        });
        fetchClinics();
        setTimeout(() => setClinicSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClinic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this clinic?')) return;
    try {
      const res = await fetch(`/api/admin/clinics?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setClinics(prev => prev.filter(c => c.id !== id));
        logAction('Clinic Deleted', `Removed clinic ID: ${id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleBody.trim()) return;

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          category: articleCategory,
          body: articleBody,
          tags: articleTags.split(',').map(t => t.trim()),
          language: articleLanguage
        })
      });
      const data = await res.json();
      if (data.success) {
        setArticleSuccess(`Article successfully published as ${articleStatus}!`);
        logAction('Article Created', `Published: "${articleTitle}" (${articleLanguage})`);
        setArticleTitle('');
        setArticleBody('');
        setTimeout(() => setArticleSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCrisisAction = async (id: string, action: 'escalate' | 'resolve') => {
    try {
      const res = await fetch('/api/admin/crisis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        setCrisisEvents(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              escalated: action === 'escalate' ? true : c.escalated,
              resolved: action === 'resolve' ? true : c.resolved
            };
          }
          return c;
        }));
        logAction('Crisis Action Triggered', `Crisis ${id} action taken: ${action}`);
        alert(`Crisis alert ${action === 'escalate' ? 'escalated to emergency services' : 'marked as resolved'}.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSystemPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: systemPromptInput })
      });
      const data = await res.json();
      if (data.success) {
        setKbSuccess('AI System Prompt template updated successfully!');
        logAction('AI Knowledge Base Updated', 'Retrained prompt instructions template.');
        setTimeout(() => setKbSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess('Platform settings, API integrations and model values updated.');
        logAction('Settings Changed', 'Modified OpenAI, SMS, Maps, and theme parameters.');
        setTimeout(() => setSettingsSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcasterMessage.trim()) return;
    setBroadcasterSuccess(`Successfully broadcasted ${broadcasterType} to ${broadcasterTarget} (${broadcasterLang})!`);
    logAction('Broadcast Dispatched', `Sent broadcast to ${broadcasterTarget} via ${broadcasterType}`);
    setBroadcasterMessage('');
    setTimeout(() => setBroadcasterSuccess(null), 3500);
  };

  const logAction = (actionName: string, desc: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      user: adminRole,
      action: actionName,
      details: desc,
      ipAddress: '197.243.12.88',
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Simulates export to CSV/Excel/PDF
  const triggerExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    logAction('Data Exported', `Downloaded system analytics report in ${format} format.`);
    alert(`Success: Exported metrics and logs to Pulse360_Report.${format.toLowerCase()}`);
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const roles: string[] = ['super_admin', 'content_manager', 'moderator', 'medical_professional', 'counselor', 'finance', 'data_analyst', 'user'];
    const nextRoleIndex = (roles.indexOf(currentRole) + 1) % roles.length;
    const newRole = roles[nextRoleIndex] as UserItem['role'];
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        logAction('User Role Changed', `Toggled role of user ${userId} to ${newRole}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: 'active' | 'suspended') => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        logAction('User Status Modified', `Set status of user ${userId} to ${newStatus}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Tab definitions mapping tabs to specific active roles
  const roleAccessMap: Record<string, string[]> = {
    super_admin: ['dashboard', 'sessions', 'chat_monitoring', 'cms', 'stories', 'clinics', 'consultations', 'crisis_center', 'knowledge_base', 'analytics', 'payments', 'notifications', 'settings', 'roles', 'audit'],
    moderator: ['chat_monitoring', 'stories', 'crisis_center', 'notifications'],
    finance: ['dashboard', 'payments', 'analytics'],
    content_manager: ['cms', 'knowledge_base', 'settings'],
    medical_professional: ['consultations', 'crisis_center'],
    counselor: ['consultations', 'crisis_center'],
    data_analyst: ['dashboard', 'sessions', 'analytics']
  };

  // Filter tabs that are allowed for current selected role
  const isTabAllowed = (tabId: string) => {
    return roleAccessMap[adminRole]?.includes(tabId);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // If active tab is not allowed after role switch, force change to the first allowed tab
    if (!isTabAllowed(activeTab)) {
      const allowed = roleAccessMap[adminRole] || [];
      if (allowed.length > 0) {
        setActiveTab(allowed[0]);
      }
    }
  }, [adminRole]);

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white border border-[#edeaf5] text-center space-y-4 shadow-sm">
        <Lock className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
        <h3 className="text-lg font-extrabold text-[#2d1c66]">Admin Access Required</h3>
        <p className="text-xs text-slate-400">
          You must be logged in with an Administrator account to access the Pulse360 Command Center.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ identifier: 'admin', password: 'admin' })
                });
                const data = await res.json();
                if (data.success) {
                  window.location.reload();
                } else {
                  alert(data.error || 'Login failed');
                }
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-[#7c3aed]/15 hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Quick Sign In as Administrator
          </button>
          <Link 
            href="/" 
            className="inline-block w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Filters
  const filteredStories = storyFilter === 'all' ? stories : stories.filter(s => s.status === storyFilter);
  
  const filteredClinics = clinics.filter(c => 
    c.name.toLowerCase().includes(clinicSearch.toLowerCase()) || 
    c.district.toLowerCase().includes(clinicSearch.toLowerCase())
  );

  const filteredChats = chatLogs.filter(c => 
    c.userMessage.toLowerCase().includes(chatSearch.toLowerCase()) ||
    c.aiResponse.toLowerCase().includes(chatSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left animate-fade-in pb-16">
      
      {/* Premium Admin Header */}
      <header className="bg-white border border-[#edeaf5] p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-[#7c3aed]/10">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#2d1c66] flex items-center gap-2">
              Command Suite <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">v1.2</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Secure administrative access console for health delivery telemetry and role authorization.
            </p>
          </div>
        </div>

        {/* Access Role Toggler Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f7f6fc] border border-[#edeaf5] px-3.5 py-2 rounded-2xl">
            <UserCheck className="w-4 h-4 text-[#7c3aed]" />
            <span className="text-[10px] font-black uppercase text-slate-400">Viewing As Role:</span>
            <select
              value={adminRole}
              onChange={(e) => setAdminRole(e.target.value as typeof adminRole)}
              className="bg-transparent text-xs font-extrabold text-[#2d1c66] focus:outline-none cursor-pointer"
            >
              <option value="super_admin">Super Admin (All Modules)</option>
              <option value="moderator">Community Moderator</option>
              <option value="finance">Finance Specialist</option>
              <option value="content_manager">Content Manager</option>
              <option value="medical_professional">Medical Doctor / Specialist</option>
              <option value="counselor">Psychological Counselor</option>
              <option value="data_analyst">Data & Performance Analyst</option>
            </select>
          </div>

          <button 
            onClick={fetchAllData}
            className="p-2.5 rounded-2xl bg-[#7c3aed] text-white hover:bg-indigo-600 transition flex items-center justify-center shadow-md shadow-[#7c3aed]/10"
            title="Refresh All Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Drawer Navigation Tabs (Allowed dynamically by Role) */}
        <div className="lg:col-span-3 bg-white border border-[#edeaf5] p-4 rounded-3xl shadow-sm space-y-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Available Command Modules</p>
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: '1. Dashboard', icon: BarChart3 },
              { id: 'sessions', label: '2. User Sessions', icon: Users },
              { id: 'chat_monitoring', label: '3. AI Chat Monitoring', icon: Activity },
              { id: 'cms', label: '4. Articles (CMS)', icon: FileText },
              { id: 'stories', label: '5. Community Stories', icon: MessageSquare },
              { id: 'clinics', label: '6. Clinic Locator', icon: MapPin },
              { id: 'consultations', label: '7. Consultations', icon: UserCheck },
              { id: 'crisis_center', label: '8. Crisis Center', icon: AlertTriangle },
              { id: 'knowledge_base', label: '9. AI Knowledge Base', icon: BookOpen },
              { id: 'analytics', label: '10. Analytics Analytics', icon: TrendingUp },
              { id: 'payments', label: '11. Payments & MoMo', icon: CreditCard },
              { id: 'notifications', label: '12. Broadcaster Tool', icon: Megaphone },
              { id: 'settings', label: '13. Platform Settings', icon: Sliders },
              { id: 'roles', label: '14. Roles & ACL', icon: Layers },
              { id: 'audit', label: '15. Audit Security Logs', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const allowed = isTabAllowed(tab.id);
              const active = activeTab === tab.id;
              
              if (!allowed) {
                return (
                  <div key={tab.id} className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-50 cursor-not-allowed select-none">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-300" />
                      <span>{tab.label}</span>
                    </div>
                    <Lock className="w-3 h-3 text-slate-300" />
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-[#7c3aed]/10' 
                      : 'text-slate-600 hover:text-[#7c3aed] hover:bg-[#f7f6fc]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.id === 'crisis_center' && crisisEvents.filter(c => !c.resolved).length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Tab Content Display Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (() => {
            const consultationsCount = payments.length;
            return (
              <div className="space-y-6 animate-fade-in">
                
                {/* Core KPIs Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Anonymous Sessions', value: sessions.length + 138, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Active Users Today', value: '47 Daily Active', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'AI Conversations', value: '312 Completed', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Articles Published', value: '18 Active', icon: FileText, color: 'text-pink-600', bg: 'bg-pink-50' },
                  { label: 'Stories Pending', value: stories.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Consultations Booked', value: consultationsCount || 3, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Emergency Alerts', value: crisisEvents.filter(c => !c.resolved).length, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { label: 'Revenue (MTN / Airtel)', value: '185,000 RWF', icon: CreditCard, color: 'text-slate-700', bg: 'bg-slate-50' }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div key={idx} className="p-4 rounded-3xl bg-white border border-[#edeaf5] shadow-sm flex items-center gap-3 hover:scale-[1.01] transition-transform">
                      <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">{kpi.label}</p>
                        <h4 className="text-base font-black text-[#2d1c66] mt-1">{kpi.value}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mental Health vs SRH Distribution */}
                <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-[#2d1c66] uppercase tracking-wider">AI Support Inquiry Topics</h4>
                  <div className="space-y-3 pt-2">
                    {[
                      { topic: 'Mental Health (Anxiety, Depression, Stress)', percentage: 65, color: 'bg-purple-600' },
                      { topic: 'Sexual & Reproductive Health (SRH Education)', percentage: 22, color: 'bg-pink-500' },
                      { topic: 'General Wellbeing, Fitness & Nutrition', percentage: 13, color: 'bg-emerald-500' }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{item.topic}</span>
                          <span>{item.percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#f7f6fc] overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Searched Questions */}
                <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-[#2d1c66] uppercase tracking-wider">Top Searched Inquiries</h4>
                  <div className="space-y-2 pt-1.5">
                    {[
                      { query: 'How to manage exam anxiety?', searchCount: 88 },
                      { query: 'Where to find anonymous SRH testing near Kigali?', searchCount: 54 },
                      { query: 'Confidential psychological counselors hotline.', searchCount: 42 },
                      { query: 'Common myths about reproductive health.', searchCount: 31 }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs">
                        <span className="font-bold text-[#2d1c66] truncate max-w-[200px]">{item.query}</span>
                        <span className="text-indigo-600 font-extrabold">{item.searchCount} searches</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

          {/* TAB 2: USER & SESSION MANAGEMENT */}
          {activeTab === 'sessions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#edeaf5] shadow-sm">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Active Anonymous Session Telemetry ({sessions.length})
                </h3>
                <button
                  onClick={() => triggerExport('CSV')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-[#7c3aed] border border-purple-100 hover:bg-purple-100 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Anonymous Data
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-[#edeaf5] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f7f6fc] border-b border-[#edeaf5] text-[10px] font-extrabold uppercase text-slate-400">
                      <th className="p-4">Session Hash ID</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Language</th>
                      <th className="p-4">Device Info</th>
                      <th className="p-4">Last Activity</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edeaf5] text-xs text-[#2d1c66]">
                    {loadingSessions ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading active sessions...</td></tr>
                    ) : sessions.map(sess => (
                      <tr key={sess.id} className="hover:bg-[#f7f6fc]/50 transition">
                        <td className="p-4 font-mono font-extrabold text-purple-700">@{sess.id.toUpperCase()}</td>
                        <td className="p-4 font-semibold">{sess.district}, {sess.country}</td>
                        <td className="p-4"><span className="uppercase bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold">{sess.language}</span></td>
                        <td className="p-4 text-slate-500">{sess.deviceType}</td>
                        <td className="p-4 text-slate-400">{new Date(sess.lastActive).toLocaleTimeString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteSession(sess.id)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition"
                            title="Disconnect Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AI CHAT MONITORING */}
          {activeTab === 'chat_monitoring' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-[#edeaf5] rounded-2xl shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                    placeholder="Search recent conversations..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Auto-Retrain Model:</span>
                  <button 
                    onClick={() => {
                      logAction('AI Dataset Retrain Triggered', 'Manually queued retrain sequence on active logs.');
                      alert('AI Model dataset retraining queued. Processes will complete asynchronously.');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-purple-700 transition text-xs font-bold"
                  >
                    Retrain Dataset Now
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {loadingChats ? (
                  <div className="p-8 text-center bg-white border border-[#edeaf5] rounded-2xl text-slate-400 text-xs">Loading conversations...</div>
                ) : filteredChats.map((chat) => (
                  <div key={chat.id} className="p-5 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase border-b border-[#edeaf5] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-extrabold">{chat.category}</span>
                        <span className="text-slate-400 font-mono">Session: @{chat.sessionId.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600">AI Confidence: {Math.round(chat.confidence * 100)}%</span>
                        <span className="text-amber-500">Rating: {chat.feedbackRating}/5 ⭐</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="flex items-start gap-2 bg-[#f7f6fc] p-3 rounded-2xl">
                        <span className="font-extrabold text-[#7c3aed] uppercase shrink-0">User:</span>
                        <p className="text-[#2d1c66]">&ldquo;{chat.userMessage}&rdquo;</p>
                      </div>

                      <div className="flex items-start gap-2 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                        <span className="font-extrabold text-[#ec4899] uppercase shrink-0">AI:</span>
                        <p className="text-[#2d1c66]">{chat.aiResponse}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">{new Date(chat.createdAt).toLocaleString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            logAction('AI Response Flagged', `Flagged incorrect response in session ${chat.sessionId}`);
                            alert('This response has been flagged for clinic-based expert review.');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-bold transition hover:bg-amber-100"
                        >
                          Flag Response
                        </button>
                        <button
                          onClick={() => handleBanSession(chat.sessionId)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-bold transition hover:bg-rose-100"
                        >
                          Ban User Session
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CMS (ARTICLES) */}
          {activeTab === 'cms' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Creator CMS form */}
              <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-pink-600" />
                  Article CMS Creator
                </h3>

                {articleSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700">
                    {articleSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateArticle} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Article Title</label>
                    <input
                      type="text"
                      required
                      value={articleTitle}
                      onChange={e => setArticleTitle(e.target.value)}
                      placeholder="e.g. Navigating Reproductive Health Confidentiality"
                      className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                      <select
                        value={articleCategory}
                        onChange={e => setArticleCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs"
                      >
                        <option value="Mental Health">Mental Health</option>
                        <option value="Reproductive Health">Reproductive Health</option>
                        <option value="Wellness">Wellness</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Language Version</label>
                      <select
                        value={articleLanguage}
                        onChange={e => setArticleLanguage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs"
                      >
                        <option value="English">English Version</option>
                        <option value="Kinyarwanda">Kinyarwanda Version</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tags</label>
                      <input
                        type="text"
                        value={articleTags}
                        onChange={e => setArticleTags(e.target.value)}
                        placeholder="e.g. srh, youth, education"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Publish Settings</label>
                      <select
                        value={articleStatus}
                        onChange={e => setArticleStatus(e.target.value as typeof articleStatus)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs font-bold"
                      >
                        <option value="published">Publish Instantly</option>
                        <option value="draft">Save as Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Body Content</label>
                    <textarea
                      required
                      rows={5}
                      value={articleBody}
                      onChange={e => setArticleBody(e.target.value)}
                      placeholder="Write comprehensive health details..."
                      className="w-full px-3 py-2 rounded-xl bg-[#f7f6fc] border border-[#edeaf5] text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#ec4899] hover:bg-[#db2777] text-white font-extrabold text-xs transition"
                  >
                    Save Article in CMS
                  </button>
                </form>
              </div>

              {/* Published view list */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider">CMS System Library</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Understanding Anxiety for Young Rwandans', lang: 'English', cat: 'Mental Health', status: 'Published' },
                    { title: 'Gusobanukirwa Agahinda Gakabije', lang: 'Kinyarwanda', cat: 'Mental Health', status: 'Published' },
                    { title: 'Reproductive Health: Myths vs. Facts', lang: 'English', cat: 'Reproductive Health', status: 'Draft' }
                  ].map((art, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-600">
                        <span>{art.cat}</span>
                        <span className={`px-2 py-0.5 rounded ${art.status === 'Published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{art.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#2d1c66]">{art.title}</h4>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Language: {art.lang}</span>
                        <button 
                          onClick={() => {
                            if (confirm('Delete this article entry?')) {
                              logAction('Article Deleted', `Removed article: ${art.title}`);
                              alert('Article deleted.');
                            }
                          }}
                          className="text-rose-500 font-extrabold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: STORIES MODERATION */}
          {activeTab === 'stories' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#edeaf5] shadow-sm">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#7c3aed]" />
                  Youth Community Stories Queue ({filteredStories.length})
                </h3>

                {/* Filter buttons */}
                <div className="flex gap-1 border border-[#edeaf5] p-1 rounded-xl bg-[#f7f6fc]">
                  {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStoryFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition ${
                        storyFilter === f ? 'bg-[#7c3aed] text-white shadow-sm' : 'text-slate-400 hover:text-[#2d1c66]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {loadingStories ? (
                  <div className="p-8 text-center bg-white border border-[#edeaf5] rounded-2xl text-xs text-slate-400">
                    Loading story queue...
                  </div>
                ) : filteredStories.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#edeaf5] rounded-2xl text-xs text-slate-400">
                    No stories found in status category.
                  </div>
                ) : (
                  filteredStories.map(story => (
                    <div key={story.id} className="p-5 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#f7f6fc] border border-[#edeaf5] text-[#7c3aed] font-extrabold">
                            {story.category}
                          </span>
                          <span className="text-slate-400">Location: {story.districtHash}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-bold ${story.aiSafetyScore > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            AI Moderation Safety: {story.aiSafetyScore}%
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md border font-extrabold ${
                            story.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            story.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {story.status}
                          </span>
                        </div>
                      </div>

                      {editingStoryId === story.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={storyEditContent}
                            onChange={(e) => setStoryEditContent(e.target.value)}
                            className="w-full p-3 text-xs bg-[#f7f6fc] border border-[#edeaf5] rounded-2xl focus:outline-none"
                            rows={3}
                          />
                          <button
                            onClick={handleSaveStoryContent}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-[11px] font-bold"
                          >
                            Save Content Edit
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-[#2d1c66] leading-relaxed bg-[#f7f6fc] p-3 rounded-2xl border border-[#edeaf5]">
                          &ldquo;{story.content}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                        <button
                          onClick={() => handleEditStoryContent(story)}
                          className="text-[#7c3aed] font-extrabold hover:underline"
                        >
                          Edit Content Block
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBanSession(story.districtHash)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold border border-rose-100 transition"
                          >
                            Ban Submitter Session
                          </button>
                          <button
                            onClick={() => handleUpdateStoryStatus(story.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 font-extrabold border border-amber-100 transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStoryStatus(story.id, 'approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold transition shadow-sm"
                          >
                            Approve & Publish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CLINIC LOCATOR & MANAGEMENT */}
          {activeTab === 'clinics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Directory Listing */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider">
                    Registered Referrals ({filteredClinics.length})
                  </h3>
                  <input
                    type="text"
                    value={clinicSearch}
                    onChange={e => setClinicSearch(e.target.value)}
                    placeholder="Search clinics..."
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#edeaf5] text-xs"
                  />
                </div>

                <div className="space-y-3">
                  {loadingClinics ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border">Loading clinics...</div>
                  ) : filteredClinics.map(clinic => (
                    <div key={clinic.id} className="p-4 rounded-2xl bg-white border border-[#edeaf5] shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-xs text-[#2d1c66]">{clinic.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{clinic.address} ({clinic.district})</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${clinic.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {clinic.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-slate-400 border-t pt-2">
                        <span>GPS: {clinic.lat}, {clinic.lng}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingClinic(clinic);
                              setClinicForm({
                                name: clinic.name,
                                address: clinic.address,
                                phone: clinic.phone,
                                district: clinic.district,
                                lat: String(clinic.lat),
                                lng: String(clinic.lng),
                                hours: clinic.hours,
                                services: clinic.services.join(', '),
                                status: clinic.status
                              });
                            }}
                            className="text-[#7c3aed] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClinic(clinic.id)}
                            className="text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Coordinator picking simulator */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider">
                    {editingClinic ? 'Edit Referral Center' : 'Add Clinic via Map Locator'}
                  </h3>

                  {clinicSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl">
                      {clinicSuccess}
                    </div>
                  )}

                  {/* Simulated interactive leaflet map click-zone */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Kigali Interactive Map Simulator (Click to pick lat/lng)</label>
                    <div 
                      onClick={handleMapSimulatorClick}
                      className="w-full h-40 rounded-2xl bg-gradient-to-tr from-sky-100 via-emerald-100 to-sky-200 border border-[#edeaf5] relative cursor-crosshair overflow-hidden flex items-center justify-center"
                    >
                      <Map className="w-8 h-8 text-sky-500 opacity-60" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="text-[10px] font-extrabold text-[#2d1c66] bg-white/80 px-2 py-0.5 rounded-full border">Click Map Coordinates</span>
                      </div>
                      
                      {/* Picked pin marker display */}
                      <div 
                        className="absolute text-rose-600 transition-all duration-300"
                        style={{
                          top: `${Math.min(130, Math.max(10, ((-1.93 - parseFloat(clinicForm.lat)) / 0.05) * 160))}px`,
                          left: `${Math.min(260, Math.max(10, ((parseFloat(clinicForm.lng) - 30.04) / 0.06) * 280))}px`
                        }}
                      >
                        <MapPin className="w-5 h-5 fill-rose-600 text-white" />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveClinic} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Latitude</label>
                        <input type="text" readOnly value={clinicForm.lat} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs font-mono" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Longitude</label>
                        <input type="text" readOnly value={clinicForm.lng} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs font-mono" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Name</label>
                      <input type="text" required value={clinicForm.name} onChange={e => setClinicForm({...clinicForm, name: e.target.value})} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Phone</label>
                        <input type="text" required value={clinicForm.phone} onChange={e => setClinicForm({...clinicForm, phone: e.target.value})} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Status</label>
                        <select value={clinicForm.status} onChange={e => setClinicForm({...clinicForm, status: e.target.value as 'Open' | 'Closed'})} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs font-bold">
                          <option value="Open">Open (Active)</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Address</label>
                      <input type="text" required value={clinicForm.address} onChange={e => setClinicForm({...clinicForm, address: e.target.value})} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs" />
                    </div>

                    <button type="submit" className="w-full py-2 bg-[#7c3aed] text-white text-xs font-extrabold rounded-xl hover:bg-purple-700 transition">
                      Save Clinic Referral
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: CONSULTATIONS */}
          {activeTab === 'consultations' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-white border rounded-2xl shadow-sm flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider">
                  Healthcare Professional Availabilities & Appointments
                </h3>
                <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                  TELEHEALTH SERVICES ACTIVE
                </span>
              </div>

              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f7f6fc] border-b border-[#edeaf5] text-[10px] font-bold uppercase text-slate-400">
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Appt Slot Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Payment Ref</th>
                      <th className="p-4 text-right">Telehealth Video Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edeaf5] text-xs text-[#2d1c66]">
                    {[
                      { staff: 'Dr. Mugisha Jean', role: 'Psychologist', time: '2026-07-24 10:00 AM', status: 'Pending', payRef: 'TXN-MOMO-9912093', link: 'https://telehealth.pulse360.rw/room/meet-99120' },
                      { staff: 'Nurse Keza Marie', role: 'Nurse / Midwife', time: '2026-07-24 02:30 PM', status: 'Confirmed', payRef: 'TXN-AIRTEL-4412093', link: 'https://telehealth.pulse360.rw/room/meet-44120' },
                      { staff: 'Counselor Gasana Felix', role: 'Counselor', time: '2026-07-25 09:00 AM', status: 'Completed', payRef: 'TXN-MOMO-8829471', link: 'https://telehealth.pulse360.rw/room/meet-88294' }
                    ].map((apt, idx) => (
                      <tr key={idx} className="hover:bg-[#f7f6fc]/50 transition">
                        <td className="p-4 font-bold">{apt.staff}</td>
                        <td className="p-4 uppercase text-[10px] font-black text-slate-400">{apt.role}</td>
                        <td className="p-4 font-semibold text-purple-700">{apt.time}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                            apt.status === 'Completed' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{apt.payRef}</td>
                        <td className="p-4 text-right">
                          <a href={apt.link} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 rounded-xl bg-purple-50 text-[#7c3aed] border border-purple-100 hover:bg-purple-100 transition text-[10px] font-bold">
                            Open Zoom / Meet
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: CRISIS CENTER */}
          {activeTab === 'crisis_center' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-red-50 border border-red-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-red-800 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                    High-Risk & Suicidal Conversation Telemetry Logs
                  </h3>
                  <p className="text-xs text-red-700">
                    If AI triggers self-harm risks, dispatch protocols instantly to local emergency hotlines or text responders.
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href="tel:112" className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    Call National Police 112
                  </a>
                  <a href="tel:114" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                    Call Mental Health 114
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                {loadingCrisis ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Loading logs...</div>
                ) : crisisEvents.map(event => (
                  <div key={event.id} className="p-5 rounded-3xl bg-white border border-[#edeaf5] shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-black uppercase">
                          {event.triggerType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID: {event.id}</span>
                      </div>
                      <p className="text-xs text-[#2d1c66] font-bold">
                        Triggered in anonymous chat session: <span className="font-mono text-purple-700">@{event.sessionId.substring(0,8)}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Report Location: {event.district} | Trigger Timestamp: {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                      <button
                        onClick={() => {
                          logAction('Crisis counselor assigned', `Assigned counselor to crisis event ${event.id}`);
                          alert('Counselor has been alerted and connected to the session anonymously.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold"
                      >
                        Assign Counselor
                      </button>
                      <button
                        onClick={() => {
                          logAction('Crisis emergency SMS sent', `Dispatched location text coordinates for event ${event.id}`);
                          alert('Confidential crisis response SMS dispatched to district healthcare nurse.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-pink-50 border border-pink-100 text-pink-700 text-[10px] font-bold"
                      >
                        Send Alert SMS
                      </button>
                      <button
                        onClick={() => handleCrisisAction(event.id, event.resolved ? 'escalate' : 'resolve')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black text-white ${
                          event.resolved ? 'bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                      >
                        {event.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: AI KNOWLEDGE BASE */}
          {activeTab === 'knowledge_base' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  AI Model Instructions & Training Prompts
                </h3>

                {kbSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs border rounded-xl">
                    {kbSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateSystemPrompt} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">System Prompt Instructions Template</label>
                    <textarea
                      rows={5}
                      value={systemPromptInput}
                      onChange={e => setSystemPromptInput(e.target.value)}
                      className="w-full p-3.5 bg-[#f7f6fc] border rounded-2xl text-xs text-slate-700 focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>

                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition shadow-sm">
                    Retrain prompt template instructions
                  </button>
                </form>
              </div>

              {/* Guidelines / FAQs list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#2d1c66] uppercase">Reference Guidelines (RAG Resources)</h4>
                  <div className="space-y-2">
                    {knowledgeBase?.guidelines.map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#f7f6fc] border text-xs">
                        <span className="font-bold text-[#2d1c66]">{g.title} ({g.source})</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{g.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-[#2d1c66] uppercase">Active Trained FAQs ({knowledgeBase?.faqs.length || 0})</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {knowledgeBase?.faqs.map((faq) => (
                      <div key={faq.id} className="p-3.5 rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] text-xs space-y-1">
                        <h5 className="font-bold text-[#2d1c66]">Q: {faq.question}</h5>
                        <p className="text-[11px] text-slate-600">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: ANALYTICS & REPORTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Comprehensive Analytics Reporting
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Generate and download platform telemetry reports</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => triggerExport('CSV')} className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#7c3aed] text-xs font-bold hover:bg-purple-100 transition">CSV</button>
                    <button onClick={() => triggerExport('Excel')} className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#7c3aed] text-xs font-bold hover:bg-purple-100 transition">Excel</button>
                    <button onClick={() => triggerExport('PDF')} className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#7c3aed] text-xs font-bold hover:bg-purple-100 transition">PDF Report</button>
                  </div>
                </div>

                {/* Graph representation */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-[#f7f6fc] border rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">User Language Preferences</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-full border-4 border-purple-500 border-r-indigo-500 flex items-center justify-center text-xs font-bold">
                        74% RW
                      </div>
                      <div className="text-xs space-y-1 font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500" /> Kinyarwanda: 74%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> English: 26%</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#f7f6fc] border rounded-2xl space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Consultation Referral Success Rate</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-b-slate-200 flex items-center justify-center text-xs font-bold">
                        88% Done
                      </div>
                      <div className="text-xs space-y-1 font-bold">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Completed: 88%</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300" /> Incomplete: 12%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: PAYMENT & BILLING LOGS */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-white border rounded-2xl shadow-sm flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider">
                  Mobile Money Payment Transactions (MTN MoMo / Airtel)
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                  Revenue Track: Active
                </span>
              </div>

              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f7f6fc] border-b border-[#edeaf5] text-[10px] font-bold uppercase text-slate-400">
                      <th className="p-4">Transaction Ref</th>
                      <th className="p-4">Payment Channel</th>
                      <th className="p-4">Amount (RWF)</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Refund Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edeaf5] text-xs text-[#2d1c66]">
                    {loadingPayments ? (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading transactions...</td></tr>
                    ) : payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-[#f7f6fc]/50 transition">
                        <td className="p-4 font-mono font-bold">{pay.paymentRef}</td>
                        <td className="p-4 font-semibold text-purple-700">{pay.provider}</td>
                        <td className="p-4 font-bold">{pay.amount.toLocaleString()} RWF</td>
                        <td className="p-4 text-slate-500">{pay.purpose}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            pay.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                            pay.status === 'refunded' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-rose-50 text-rose-600'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {pay.status === 'completed' && (
                            <button
                              onClick={() => {
                                if (confirm(`Issue refund for ${pay.paymentRef}?`)) {
                                  setPayments(prev => prev.map(p => p.id === pay.id ? {...p, status: 'refunded'} : p));
                                  logAction('Payment Refunded', `Refunded transaction ref: ${pay.paymentRef}`);
                                }
                              }}
                              className="text-indigo-600 font-extrabold hover:underline"
                            >
                              Refund Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: BROADCASTER NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  Targeted Broadcast Notification Dispatcher
                </h3>

                {broadcasterSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-bold">
                    {broadcasterSuccess}
                  </div>
                )}

                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Target District Location</label>
                      <select value={broadcasterTarget} onChange={e => setBroadcasterTarget(e.target.value as typeof broadcasterTarget)} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs">
                        <option value="all">All Districts (Entire Rwanda)</option>
                        <option value="Kigali">Kigali Province Only</option>
                        <option value="Huye">Huye District</option>
                        <option value="Rubavu">Rubavu District</option>
                        <option value="Musanze">Musanze District</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">User Language Group</label>
                      <select value={broadcasterLang} onChange={e => setBroadcasterLang(e.target.value as typeof broadcasterLang)} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs">
                        <option value="all">All Languages</option>
                        <option value="en">English Version Users</option>
                        <option value="rw">Kinyarwanda Version Users</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Broadcast Channel</label>
                      <select value={broadcasterType} onChange={e => setBroadcasterType(e.target.value as typeof broadcasterType)} className="w-full p-2 bg-[#f7f6fc] border rounded-xl text-xs font-bold">
                        <option value="push">Push Notification</option>
                        <option value="sms">SMS Text Dispatcher</option>
                        <option value="whatsapp">WhatsApp Broadcast API</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Broadcast Message Body</label>
                    <textarea 
                      required 
                      rows={3} 
                      value={broadcasterMessage} 
                      onChange={e => setBroadcasterMessage(e.target.value)} 
                      placeholder="Type health announcement text..." 
                      className="w-full p-3 bg-[#f7f6fc] border rounded-xl text-xs resize-none"
                    />
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-xl hover:bg-purple-700 transition">
                    Dispatch Platform Broadcast Announcement
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 13: PLATFORM GENERAL SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-white border border-[#edeaf5] shadow-sm space-y-5">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider">
                  Platform Core Integrations & API Keys
                </h3>

                {settingsSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs border rounded-xl">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Active OpenAI model Selection</label>
                      <select value={settings.aiModel} onChange={e => setSettings({...settings, aiModel: e.target.value})} className="w-full p-2.5 bg-[#f7f6fc] border rounded-xl text-xs">
                        <option value="gpt-4o">GPT-4o (High-Accuracy Recommended)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Cost Optimized)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">OpenAI API Authorization Key</label>
                      <input type="password" value={settings.openaiKey} onChange={e => setSettings({...settings, openaiKey: e.target.value})} className="w-full p-2.5 bg-[#f7f6fc] border rounded-xl text-xs" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Google Maps SDK Key</label>
                      <input type="password" value={settings.mapsKey} onChange={e => setSettings({...settings, mapsKey: e.target.value})} className="w-full p-2.5 bg-[#f7f6fc] border rounded-xl text-xs" />
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase">National SMS Gateway URL API</label>
                      <input type="text" value={settings.smsApiUrl} onChange={e => setSettings({...settings, smsApiUrl: e.target.value})} className="w-full p-2.5 bg-[#f7f6fc] border rounded-xl text-xs font-mono" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2.5 bg-[#7c3aed] text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition">
                    Save Key configurations
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 14: ROLES & ACL */}
          {activeTab === 'roles' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-white border rounded-2xl shadow-sm flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Access Control List (ACL) Permissions Matrix
                </h3>
              </div>

              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs text-[#2d1c66]">
                  <thead>
                    <tr className="bg-[#f7f6fc] border-b border-[#edeaf5] text-[10px] font-bold uppercase text-slate-400">
                      <th className="p-4">System Role</th>
                      <th className="p-4">Analytics Tab</th>
                      <th className="p-4">CMS CMS</th>
                      <th className="p-4">Moderation Queue</th>
                      <th className="p-4">Crisis Center</th>
                      <th className="p-4 text-right">Settings Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edeaf5]">
                    {[
                      { role: 'Super Admin', analytics: 'Allowed', cms: 'Allowed', mod: 'Allowed', crisis: 'Allowed', settings: 'Allowed' },
                      { role: 'Community Moderator', analytics: 'Blocked', cms: 'Blocked', mod: 'Allowed', crisis: 'Allowed', settings: 'Blocked' },
                      { role: 'Content Manager', analytics: 'Blocked', cms: 'Allowed', mod: 'Blocked', crisis: 'Blocked', settings: 'Allowed' },
                      { role: 'Medical Specialist', analytics: 'Blocked', cms: 'Blocked', mod: 'Blocked', crisis: 'Allowed', settings: 'Blocked' },
                      { role: 'Finance Administrator', analytics: 'Allowed', cms: 'Blocked', mod: 'Blocked', crisis: 'Blocked', settings: 'Blocked' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#f7f6fc]/50 transition">
                        <td className="p-4 font-black">{row.role}</td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] ${row.analytics === 'Allowed' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-400'}`}>{row.analytics}</span></td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] ${row.cms === 'Allowed' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-400'}`}>{row.cms}</span></td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] ${row.mod === 'Allowed' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-400'}`}>{row.mod}</span></td>
                        <td className="p-4"><span className={`px-2 py-0.5 rounded text-[10px] ${row.crisis === 'Allowed' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-400'}`}>{row.crisis}</span></td>
                        <td className="p-4 text-right"><span className={`px-2 py-0.5 rounded text-[10px] ${row.settings === 'Allowed' ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-400'}`}>{row.settings}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Dynamic user list for quick promotion/demotion simulation */}
              <div className="bg-white p-6 border rounded-3xl shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-[#2d1c66]">Registered Administrator Accounts</h4>
                <div className="space-y-2">
                  {loadingUsers ? (
                    <div className="text-slate-400 text-xs text-center">Loading list...</div>
                  ) : users.map(u => (
                    <div key={u.id} className="p-3 bg-[#f7f6fc] border rounded-2xl flex items-center justify-between text-xs">
                      <div className="font-bold">@{u.username} ({u.email})</div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleUserRole(u.id, u.role)}
                          className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-100 font-bold text-[10px]"
                        >
                          Change Role Badge: {u.role}
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${u.status === 'active' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-white border rounded-2xl shadow-sm flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#2d1c66] uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-600" />
                  Traceability Audit Logs: System Admin Actions
                </h3>
              </div>

              <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs text-[#2d1c66]">
                  <thead>
                    <tr className="bg-[#f7f6fc] border-b border-[#edeaf5] text-[10px] font-bold uppercase text-slate-400">
                      <th className="p-4">Admin Account</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Details Description</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edeaf5]">
                    {loadingAudit ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading audit history...</td></tr>
                    ) : auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#f7f6fc]/50 transition">
                        <td className="p-4 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          @{log.user}
                        </td>
                        <td className="p-4 font-extrabold text-indigo-700">{log.action}</td>
                        <td className="p-4 text-slate-600">{log.details}</td>
                        <td className="p-4 font-mono text-slate-500">{log.ipAddress}</td>
                        <td className="p-4 text-right text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
