'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  BookOpen,
  Briefcase,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Zap,
  Globe,
  Database,
  ExternalLink,
} from 'lucide-react';
import { technologies } from '../lib/mock-data/technologies';
import { articles } from '../lib/mock-data/articles';
import { researchPapers } from '../lib/mock-data/research';
import { skills, careerPaths } from '../lib/mock-data/skills';
import { sourcesList, storyClusters } from '../lib/mock-data/sources';
import { TechCard } from '../components/cards/TechCard';
import { ArticleCard } from '../components/cards/ArticleCard';
import { ResearchCard } from '../components/cards/ResearchCard';
import { StoryClusterCard } from '../components/cards/StoryClusterCard';
import { Badge } from '../components/ui/Badge';
import { Sparkline } from '../components/ui/Sparkline';
import { INTEREST_OPTIONS } from '../lib/utils';
import { useAppStore } from '../lib/store/useAppStore';

export default function LandingPage() {
  const { interests, toggleInterest } = useAppStore();

  const trendingTech = technologies.slice(0, 6);
  const latestArticles = articles.slice(0, 4);
  const featuredResearch = researchPapers.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-purple-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-6 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Technology Intelligence & Trend Detection Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Stay Ahead of{' '}
              <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-500 bg-clip-text text-transparent">
                Technology.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Discover emerging technologies, important industry developments, research, and skills that matter — personalized for you.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/home"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/trending"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-200"
              >
                <span>Explore Trends</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </Link>
            </div>
          </div>

          {/* Hero Intelligence Preview Widget */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0f1629]/80 backdrop-blur-xl shadow-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Live Global Signal Feed
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>342 Sources</span>
                <span>•</span>
                <span>1,876 Techs Tracked</span>
                <span>•</span>
                <span className="text-purple-400 font-bold">17 Emerging Signals</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Emerging Highlight 1 */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 font-semibold uppercase">
                      Top Emerging
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">+128%</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">LLM Agents</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Surge in multi-agent orchestration frameworks across enterprise repos.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-mono text-slate-400">
                  <span>74 sources</span>
                  <Sparkline data={[20, 35, 42, 55, 68, 85, 128]} color="#a855f7" width={70} height={20} />
                </div>
              </div>

              {/* Emerging Highlight 2 */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                      Rising Fast
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">+31%</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">Rust in Linux</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    First batch of memory-safe kernel production drivers merged.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-mono text-slate-400">
                  <span>38 sources</span>
                  <Sparkline data={[50, 52, 56, 62, 70, 75, 88]} color="#06b6d4" width={70} height={20} />
                </div>
              </div>

              {/* Emerging Highlight 3 */}
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">
                      Trending Paper
                    </span>
                    <span className="text-xs font-mono text-purple-400 font-bold">arXiv:2407</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">FlashAttention-3</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Asynchronous tensor core attention hitting 850 TFLOPs on modern GPUs.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[11px] font-mono text-slate-400">
                  <span>890 citations</span>
                  <span className="text-cyan-400 font-semibold">arXiv CS.LG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRENDING TECHNOLOGIES SECTION */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/30 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
                Emerging Signals
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Trending Technologies
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Detected across blogs, code repositories, research preprints, and developer discussions.
              </p>
            </div>
            <Link
              href="/trending"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>View All 50+ Trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTech.map((tech) => (
              <TechCard key={tech.id} tech={tech} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. LATEST DEVELOPMENTS & STORY CLUSTERING */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-500 font-semibold">
                Multi-Source Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Latest Technology Developments
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Clustered stories from independent reporting sources with 30-second AI summaries.
              </p>
            </div>
            <Link
              href="/latest"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>Browse Full Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Clustered story highlight */}
          {storyClusters.length > 0 && (
            <div className="mb-8">
              <StoryClusterCard cluster={storyClusters[0]} />
            </div>
          )}

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW THE PLATFORM WORKS */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
              Architecture & Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              How TeQVu Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              An intelligent pipeline that separates critical technical breakthroughs from PR noise and content farm spam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Multi-Source Collection',
                desc: 'Polls 340+ verified RSS feeds, research APIs (arXiv, IEEE), engineering blogs, and developer hubs continuously.',
                icon: Globe,
                color: 'text-cyan-400',
              },
              {
                step: '02',
                title: 'AI Entity Extraction',
                desc: 'Extracts referenced technologies, frameworks, and techniques using NLP classification and deduplicates coverage.',
                icon: Cpu,
                color: 'text-purple-400',
              },
              {
                step: '03',
                title: 'Trend Velocity Engine',
                desc: 'Evaluates independent sources, credibility ratings, mention momentum, and repo metrics to compute trend scores.',
                icon: TrendingUp,
                color: 'text-emerald-400',
              },
              {
                step: '04',
                title: 'Anti-Spam Delivery',
                desc: 'Delivers personalized briefings and strictly throttled alerts according to your quiet hours and preferences.',
                icon: ShieldCheck,
                color: 'text-amber-400',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-700">
                        {s.step}
                      </span>
                      <Icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{s.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PERSONALIZED INTELLIGENCE */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
                Tailored Discovery
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Personalized for Your Stack & Career
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                Whether you are an IT student mastering fundamentals, a software engineer architecting systems, or a researcher tracking breakthroughs, TeQVu adapts to your domains.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  <span>Interactive domain selection across 17+ technology areas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  <span>Custom technology watchlist with real-time velocity metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                  <span>Curated research preprints and developer discussions</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-md shadow-cyan-500/20"
                >
                  <span>Customize Your Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Domain Chips */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">
                Click to preview customized tags:
              </div>
              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((item) => {
                  const selected = interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        selected
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RESEARCH & ACADEMIC DISCOVERY */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/30 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-semibold">
                Academic & Lab Breakthroughs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Research & Academic Discovery
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Direct access to foundational papers from arXiv, IEEE, ACM, and enterprise research labs.
              </p>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>Explore Research Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredResearch.map((paper) => (
              <ResearchCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. CAREER & SKILLS INTELLIGENCE */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold">
                Workforce & Tech Demand
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Career & Skills Intelligence
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Real data on technologies and skills gaining traction across global engineering teams.
              </p>
            </div>
            <Link
              href="/jobs-skills"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>Explore All Career Paths</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Career Path Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerPaths.slice(0, 3).map((path) => (
              <div
                key={path.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">{path.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{path.growthRate}% YoY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {path.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      Critical Skills:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{path.averageSalary}</span>
                  <Link
                    href={`/jobs-skills`}
                    className="text-cyan-500 dark:text-cyan-400 font-semibold hover:underline"
                  >
                    View Roadmap →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SMART NEWSLETTER & ANTI-SPAM SECTION */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/30 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Spam Guarantee</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Intelligent Email Newsletters & Alerts
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                We never spam you with every minor article. TeQVu applies rigorous thresholding before dispatching:
              </p>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: 'Scheduled Cadence',
                    desc: 'Choose Daily, Weekly, or Monthly digests compiled strictly from your followed interests.',
                  },
                  {
                    title: 'Strict Alert Throttles',
                    desc: 'Default maximum of 1 critical priority alert per day, honoring your configured quiet hours.',
                  },
                  {
                    title: 'Multi-Factor Validation',
                    desc: 'Alerts require verified independent source corroboration, high mention growth, and high trust scores.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/newsletter"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Configure Newsletter Rules</span>
                </Link>
              </div>
            </div>

            {/* Email Preview Mockup */}
            <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 font-sans">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    T
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">TeQVu Daily Brief</div>
                    <div className="text-[11px] text-slate-400">to alex.rivera@techpulse.dev</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  Daily Digest #184
                </span>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1">
                    Top Development
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Anthropic Releases Claude 4 with 200K Context
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 text-[11px]">
                    Significant advances in autonomous software agents and multi-tool planning.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">
                    Your Followed Tech Watchlist
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
                    <span>Rust (+31%)</span>
                    <span>Next.js (+23%)</span>
                    <span>pgvector (+92%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Frequency: Daily at 07:00</span>
                <span className="text-cyan-400 font-medium">1-Click Unsubscribe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRUSTED SOURCES */}
      <section className="py-16 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Credibility & Attribution
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Aggregated from Trusted Global Sources
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            TeQVu rigorously scores and attributes each insight to its original author, publication, or laboratory.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {sourcesList.slice(0, 6).map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center text-center hover:border-cyan-500/40 transition"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {src.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-500 mt-1">
                  Trust: {src.trustScore}/10
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{src.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA SECTION */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-r from-cyan-900/30 via-purple-900/20 to-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Ready for your quick view of what&apos;s next in tech?
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of software engineers, IT students, and researchers tracking technology developments in real time.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-xl shadow-cyan-500/25 transition"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
            >
              <span>Set Preferences</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-white dark:bg-[#0a0f1e] text-slate-500 dark:text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
            {/* Column 1: Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-white">TeQVu</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed max-w-sm text-slate-500">
                Your Quick View of What&apos;s Next in Tech. Built for IT students, software engineers, technology researchers, and academics.
              </p>
              <div className="mt-4 text-[11px] font-mono text-slate-400">
                © {new Date().getFullYear()} TeQVu Intelligence. All rights reserved.
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                Platform
              </h4>
              <ul className="space-y-2">
                <li><Link href="/home" className="hover:text-cyan-400 transition">Dashboard</Link></li>
                <li><Link href="/trending" className="hover:text-cyan-400 transition">Trending Tech</Link></li>
                <li><Link href="/latest" className="hover:text-cyan-400 transition">Latest News</Link></li>
                <li><Link href="/technologies" className="hover:text-cyan-400 transition">Tech Explorer</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                Discovery
              </h4>
              <ul className="space-y-2">
                <li><Link href="/research" className="hover:text-cyan-400 transition">Research Hub</Link></li>
                <li><Link href="/jobs-skills" className="hover:text-cyan-400 transition">Jobs & Skills</Link></li>
                <li><Link href="/for-you" className="hover:text-cyan-400 transition">For You Feed</Link></li>
                <li><Link href="/watchlist" className="hover:text-cyan-400 transition">Watchlist</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                Governance
              </h4>
              <ul className="space-y-2">
                <li><Link href="/newsletter" className="hover:text-cyan-400 transition">Newsletter Rules</Link></li>
                <li><Link href="/settings" className="hover:text-cyan-400 transition">Settings</Link></li>
                <li><Link href="/admin" className="hover:text-cyan-400 transition">Admin Console</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <div>Attribution verified: Original publications retain all copyrights and trademarks.</div>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>API Status: Healthy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
