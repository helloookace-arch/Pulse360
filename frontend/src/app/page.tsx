"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../components/AppContext";
import {
  Heart,
  Video,
  Lock,
  Shield,
  ChevronRight,
  BookMarked,
  FileText,
  HelpCircle,
  Compass,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  _id: string;
  title: string;
  category: string;
  date: string;
  color: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const {
    language,
    district,
    setDistrict,
    questionsCount,
    consultationCount,
    savedArticles,
    likedStories,
    speak,
  } = useApp();

  const [anonymousMode, setAnonymousMode] = useState(true);

  const featuredArticles: Article[] = [
    {
      _id: "1",
      category: "MENTAL HEALTH",
      title: "Understanding Anxiety and How to Manage It",
      date: "2 days ago",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: (
        <svg
          className="w-10 h-10 text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
      ),
    },
    {
      _id: "2",
      category: "REPRODUCTIVE HEALTH",
      title: "Facts About Family Planning",
      date: "3 days ago",
      color: "bg-pink-100 text-pink-700 border-pink-200",
      icon: (
        <svg
          className="w-10 h-10 text-pink-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
          <path d="M12 6v12M8 10h8" />
        </svg>
      ),
    },
    {
      _id: "3",
      category: "MENTAL HEALTH",
      title: "How to Build Self Confidence",
      date: "4 days ago",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      icon: (
        <svg
          className="w-10 h-10 text-indigo-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      ),
    },
    {
      _id: "4",
      category: "WELLNESS",
      title: "Self Care Practices for Better Mental Health",
      date: "5 days ago",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: (
        <svg
          className="w-10 h-10 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2a15 15 0 0 0-9 9c0 5 4 9 9 9s9-4 9-9a15 15 0 0 0-9-9Z" />
          <path d="M12 6v10" />
        </svg>
      ),
    },
  ];

  const stories = [
    {
      content:
        "I struggled in silence for years, but sharing my story gave me freedom.",
      author: "Anonymous",
    },
    {
      content: "After getting support, I found the strength to start again.",
      author: "Anonymous",
    },
    {
      content: "Pulse 360 changed the way I see my mental health.",
      author: "Anonymous",
    },
    {
      content: "I feel safe here. No judgment, just support.",
      author: "Anonymous",
    },
  ];

  const readText = (text: string) => {
    speak(text);
  };

  return (
    <div className="space-y-10 animate-fade-in text-left">
      <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white/95 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 py-7 md:px-10 md:py-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-[#2d1c66]">
                {language === "en" ? (
                  <>
                    Your safe space for
                    <br />
                    <span className="gradient-text">
                      mental and reproductive health.
                    </span>
                  </>
                ) : (
                  <>
                    Aha ni ahizewe kuri
                    <br />
                    <span className="gradient-text">
                      {"serivisi z'ubuzima bwo mu mutwe n'imyororokere."}
                    </span>
                  </>
                )}
              </h2>

              <p className="max-w-xl text-sm md:text-base leading-7 text-slate-500">
                {language === "en"
                  ? "Get trusted information, anonymous support and professional help anytime, anywhere."
                  : "Bona amakuru yizewe, ubufasha bw ibanga n ubujyanama bw abanyamwuga igihe icyo ari cyo cyose, aho uri hose."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/learn">
                <Button
                  onMouseEnter={() => readText("Learn Now")}
                  className="rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] px-6 h-12 text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {language === "en" ? "Learn Now" : "Soma Nonaha"}
                </Button>
              </Link>
              <Link href="/ask">
                <Button
                  onMouseEnter={() => readText("Ask a Question")}
                  className="rounded-full bg-[#ec4899] hover:bg-[#db2777] px-6 h-12 text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {language === "en" ? "Ask a Question" : "Baza Ikibazo"}
                </Button>
              </Link>
              <Link href="/consultation">
                <Button
                  onMouseEnter={() => readText("Start Consultation")}
                  className="rounded-full bg-[#1c194d] hover:bg-[#13113e] px-6 h-12 text-white font-bold shadow-md hover:shadow-lg transition-all"
                >
                  {language === "en" ? "Start Consultation" : "Tangira Inama"}
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 lg:justify-end">
              {/* Professional Vector Illustration with Concentric Rings */}
              <div className="relative w-[240px] h-[240px] md:w-[280px] md:h-[280px] flex-shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 320 320"
                  className="w-full h-full drop-shadow-sm"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Concentric Outer Background Circles */}
                  <circle cx="160" cy="160" r="150" fill="url(#hero-bg-grad)" stroke="#f1ecfb" strokeWidth="1.5" />
                  <circle cx="160" cy="160" r="122" stroke="#ebdffa" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx="160" cy="160" r="94" stroke="#e3d4f8" strokeWidth="1.5" />

                  <defs>
                    <radialGradient id="hero-bg-grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(160 160) scale(150)">
                      <stop stopColor="#7c3aed" stopOpacity="0.06" />
                      <stop offset="1" stopColor="#7c3aed" stopOpacity="0.01" />
                    </radialGradient>
                    <linearGradient id="purple-top" x1="80" y1="230" x2="240" y2="320" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#6d28d9" />
                    </linearGradient>
                    <linearGradient id="phone-grad" x1="100" y1="210" x2="140" y2="280" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1e1b4b" />
                      <stop offset="1" stopColor="#312e81" />
                    </linearGradient>
                  </defs>

                  {/* Volumetric Curly Afro Hair (Background Clusters) */}
                  <g fill="#211d2b">
                    <circle cx="160" cy="92" r="46" />
                    <circle cx="124" cy="108" r="42" />
                    <circle cx="196" cy="108" r="42" />
                    <circle cx="98" cy="138" r="38" />
                    <circle cx="222" cy="138" r="38" />
                    <circle cx="86" cy="172" r="30" />
                    <circle cx="234" cy="172" r="30" />
                    <circle cx="140" cy="80" r="40" />
                    <circle cx="180" cy="80" r="40" />
                  </g>

                  {/* Neck */}
                  <path d="M 144 205 L 144 250 C 144 258, 176 258, 176 250 L 176 205 Z" fill="#c8875e" />

                  {/* Head & Face */}
                  <ellipse cx="160" cy="165" rx="38" ry="46" fill="#d7976e" />

                  {/* Ears */}
                  <ellipse cx="122" cy="170" rx="6" ry="9" fill="#c8875e" />
                  <ellipse cx="198" cy="170" rx="6" ry="9" fill="#c8875e" />

                  {/* Gold Hoop Earring (Right Ear) */}
                  <circle cx="204" cy="174" r="12" fill="none" stroke="#eab308" strokeWidth="4.5" />

                  {/* Facial Features */}
                  {/* Eyebrows */}
                  <path d="M 134 150 Q 142 146 150 150" fill="none" stroke="#211d2b" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 170 150 Q 178 146 186 150" fill="none" stroke="#211d2b" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Eyes */}
                  <circle cx="142" cy="159" r="3.5" fill="#211d2b" />
                  <circle cx="178" cy="159" r="3.5" fill="#211d2b" />
                  <circle cx="143" cy="158" r="1" fill="#ffffff" />
                  <circle cx="179" cy="158" r="1" fill="#ffffff" />

                  {/* Nose contour */}
                  <path d="M 160 162 Q 157 172 162 173" fill="none" stroke="#b6734c" strokeWidth="2" strokeLinecap="round" />

                  {/* Friendly Smile */}
                  <path d="M 144 184 Q 160 197 176 184" fill="none" stroke="#8c4723" strokeWidth="3.5" strokeLinecap="round" />

                  {/* Torso / Purple Outfit */}
                  <path d="M 65 320 C 65 240, 255 240, 255 320 Z" fill="url(#purple-top)" />

                  {/* Left Arm holding Smartphone */}
                  <path d="M 75 320 Q 100 270 122 250" fill="none" stroke="#d7976e" strokeWidth="22" strokeLinecap="round" />

                  {/* Smartphone */}
                  <g transform="translate(104, 218) rotate(-14 20 30)">
                    <rect x="0" y="0" width="34" height="62" rx="7" fill="url(#phone-grad)" stroke="#4338ca" strokeWidth="2" />
                    {/* Screen light indicator dot */}
                    <circle cx="17" cy="14" r="3" fill="#10b981" />
                    <rect x="10" y="48" width="14" height="2" rx="1" fill="#6366f1" />
                  </g>
                </svg>
              </div>

              {/* Floating Feature Badges */}
              <div className="flex flex-col gap-3">
                {[
                  {
                    label: language === "en" ? "Anonymous" : "Ibanga",
                    icon: Shield,
                  },
                  {
                    label: language === "en" ? "Confidential" : "Bihishwe",
                    icon: Lock,
                  },
                  {
                    label: language === "en" ? "Supportive" : "Ubufasha",
                    icon: Heart,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-full border border-purple-100 bg-white/95 backdrop-blur-md px-5 py-3 text-xs md:text-sm font-bold text-[#2d1c66] shadow-sm hover:shadow-md hover:border-purple-200 transition-all transform hover:-translate-y-0.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-[#7c3aed]" />
                      </div>
                      <span className="tracking-tight">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="section-kicker">
              <ArrowRight className="w-3.5 h-3.5" />
              {language === "en" ? "Choose your path" : "Hitamo inzira yawe"}
            </span>
            <h3 className="mt-3 text-2xl font-black text-[#2d1c66]">
              {language === "en"
                ? "Start with the kind of support you need today."
                : "Tangira n ubufasha ukeneye uyu munsi."}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: "Talk through a question",
              body: "Get immediate guidance on stress, anxiety, HIV prevention, or reproductive health.",
              href: "/ask",
              icon: HelpCircle,
              tint: "from-[#7c3aed]/12 to-white",
            },
            {
              title: "Learn privately",
              body: "Explore trusted articles and practical explainers designed for young people in Rwanda.",
              href: "/learn",
              icon: BookMarked,
              tint: "from-[#ec4899]/10 to-white",
            },
            {
              title: "Book real support",
              body: "Move from guidance to care with a secure consultation or nearby clinic referral.",
              href: "/consultation",
              icon: Video,
              tint: "from-[#10b981]/10 to-white",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`group block h-full`}
                onMouseEnter={() => readText(item.title)}
              >
                <Card className={`h-full rounded-[1.75rem] border-none bg-gradient-to-br ${item.tint} hover:shadow-xl transition-all p-6`}>
                  <div className="space-y-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#edeaf5] flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-[#2d1c66] group-hover:text-[#7c3aed] transition">
                        {item.title}
                      </h4>
                      <p className="text-sm leading-6 text-slate-500">
                        {item.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-[#7c3aed] uppercase tracking-[0.14em]">
                      <span>Open</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-kicker">
                <BookMarked className="w-3.5 h-3.5" />
                Featured resources
              </span>
              <h3 className="mt-3 text-2xl font-black text-[#2d1c66]">
                Guides designed to feel clear, calm, and practical.
              </h3>
            </div>
            <Link
              href="/learn"
              className="text-xs font-bold text-[#7c3aed] flex items-center hover:underline"
            >
              <span>View all</span>
              <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featuredArticles.map((art) => (
              <Card
                key={art._id}
                className="group rounded-[1.75rem] overflow-hidden cursor-pointer transition border-none shadow-md hover:shadow-xl"
                onClick={() => readText(art.title)}
              >
                <div className="relative h-36 bg-[#fbfbfe] border-b border-[#edeaf5] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_30%)] opacity-90" />
                  <div className="relative">{art.icon}</div>
                </div>
                <CardContent className="p-5 space-y-3">
                  <span
                    className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded border ${art.color}`}
                  >
                    {art.category}
                  </span>
                  <h4 className="text-base font-black text-[#2d1c66] leading-snug group-hover:text-[#7c3aed] transition">
                    {art.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold">
                    {art.date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-5">
          <Card className="rounded-[1.75rem] border-none shadow-md p-6 space-y-5">
            <div>
              <span className="section-kicker">
                <Lock className="w-3.5 h-3.5" />
                Privacy snapshot
              </span>
              <h3 className="mt-3 text-xl font-black text-[#2d1c66]">
                Your support stays private by default.
              </h3>
            </div>

            <div id="privacy-settings" className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] p-4">
                <div>
                  <p className="text-sm font-bold text-[#2d1c66]">
                    Anonymous Mode
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Keep your identity hidden while you browse and ask
                    questions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAnonymousMode(!anonymousMode);
                    speak(
                      anonymousMode
                        ? "Anonymous mode disabled"
                        : "Anonymous mode enabled",
                    );
                  }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    anonymousMode ? "bg-[#10b981]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${
                      anonymousMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="rounded-2xl bg-[#f7f6fc] border border-[#edeaf5] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#2d1c66]">
                    Location context
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7c3aed]">
                    {district}
                  </span>
                </div>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    readText(`District updated to ${e.target.value}`);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#edeaf5] text-xs font-bold text-[#2d1c66] focus:outline-none focus:border-[#7c3aed]"
                >
                  {[
                    "Nyarugenge",
                    "Gasabo",
                    "Kicukiro",
                    "Huye",
                    "Rubavu",
                    "Musanze",
                    "Kayonza",
                  ].map((d) => (
                     <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] leading-5 text-slate-400">
                  We use your district to surface more relevant clinics, crisis
                  support, and care options.
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[1.75rem] border-none shadow-[0_26px_50px_-28px_rgba(124,58,237,0.6)] bg-[#7c3aed] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-100">
              Need immediate help?
            </p>
            <h4 className="mt-3 text-2xl font-black">Call 114 or 112 now.</h4>
            <p className="mt-2 text-sm leading-6 text-purple-100">
              If you or someone nearby is at immediate risk, use emergency lines
              first. Pulse360 can still help you find follow-up support.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="tel:114" className="flex-1">
                <Button className="w-full rounded-full bg-white text-[#7c3aed] hover:bg-white/90 py-6 text-sm font-black">
                  Call 114
                </Button>
              </a>
              <a href="tel:112" className="flex-1">
                <Button className="w-full rounded-full bg-[#1c194d] text-white hover:bg-[#13113e] py-6 text-sm font-black">
                  Call 112
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <Card className="rounded-[1.75rem] border-none shadow-md h-full p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <span className="section-kicker">
                  <Heart className="w-3.5 h-3.5" />
                  Community trust
                </span>
                <h3 className="mt-3 text-2xl font-black text-[#2d1c66]">
                  Stories that remind people they are not alone.
                </h3>
              </div>
              <Link
                href="/stories"
                className="text-xs font-bold text-[#7c3aed] flex items-center hover:underline"
              >
                <span>View all</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-[#edeaf5] bg-[#fbfbfe] p-5 hover:border-[#7c3aed]/20 transition cursor-pointer hover:shadow-sm"
                  onClick={() => readText(s.content)}
                >
                  <span className="text-3xl font-black text-[#7c3aed]/20 leading-none">
                    “
                  </span>
                  <p className="mt-3 text-sm text-slate-500 italic leading-7 line-clamp-4">
                    {s.content}
                  </p>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {s.author}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-5">
          <Card className="rounded-[1.75rem] border-none shadow-md h-full p-6 md:p-7 space-y-6">
            <div>
              <span className="section-kicker">
                <FileText className="w-3.5 h-3.5" />
                Your dashboard
              </span>
              <h3 className="mt-3 text-2xl font-black text-[#2d1c66]">
                A simpler snapshot of what matters most.
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Consultations", value: consultationCount || 3 },
                { label: "Saved Articles", value: savedArticles.length || 12 },
                { label: "Questions Asked", value: questionsCount || 5 },
                { label: "Stories Liked", value: likedStories.length || 8 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl bg-[#f7f6fc] border border-[#edeaf5] p-4 transition-all hover:bg-white hover:shadow-md"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] font-black text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-black text-[#2d1c66]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-[#f7f6fc] border border-[#edeaf5] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#edeaf5] flex items-center justify-center shadow-sm">
                  <Compass className="w-5 h-5 text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#2d1c66]">
                    Tailored for your district
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    Your current location context is{" "}
                    <span className="font-bold text-[#7c3aed]">{district}</span>,
                    which helps prioritize relevant clinics and care information.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/consultation">
                  <Button className="rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] px-4 py-2.5 text-xs font-black shadow-sm">
                    View consultations
                  </Button>
                </Link>
                <Link href="/ask">
                  <Button variant="outline" className="rounded-full bg-white border-[#edeaf5] text-[#2d1c66] hover:bg-slate-50 px-4 py-2.5 text-xs font-black shadow-sm">
                    Ask something new
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
