"use client";
import Link from "next/link";
import { Search, FileText, BarChart3, MessageSquare, Zap, Shield, ChevronDown, Check, ArrowRight, Star, Globe, Clock, Users } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Search, title: "Vibe Scan", desc: "Describe your ideal job in plain English. Our AI understands context, not just keywords, and scores every job by relevance." },
  { icon: FileText, title: "AI Proposals", desc: "Generate personalized cover letters that analyze job requirements, client history, and your profile automatically." },
  { icon: Zap, title: "Smart Filters", desc: "30+ parameters including budget, client rating, job type, and posting time. Run multiple search campaigns." },
  { icon: BarChart3, title: "Analytics", desc: "Track bids per day, view rate, reply rate, and response time. Data-driven decisions for your freelancing." },
  { icon: MessageSquare, title: "Auto-Reply", desc: "Pre-written messages auto-queued when proposals get replies. Never miss a client conversation again." },
  { icon: Shield, title: "AI Decision Maker", desc: "Smart filtering that learns your preferences. Analyzes job quality and client credibility before you bid." },
];

const stats = [
  { value: "50K+", label: "Jobs Scanned" },
  { value: "12K+", label: "Proposals Generated" },
  { value: "89%", label: "Match Accuracy" },
  { value: "3.2x", label: "More Interviews" },
];

const steps = [
  { n: "01", title: "Set Up Your Profile", desc: "Add your skills, experience, and preferences. The AI uses this to find perfect matches." },
  { n: "02", title: "Scan & Score Jobs", desc: "Search in plain English or use filters. AI scores every job 0-100 based on your profile." },
  { n: "03", title: "Generate & Send", desc: "One-click AI proposals tailored to each job. Edit, copy, and send in seconds." },
  { n: "04", title: "Track & Optimize", desc: "Monitor your performance. See what works and let analytics guide your strategy." },
];

const comparison = [
  { feature: "Time per proposal", manual: "15-30 min", ai: "< 30 sec" },
  { feature: "Daily proposals", manual: "5-10", ai: "50+" },
  { feature: "Job matching", manual: "Manual scrolling", ai: "AI-scored" },
  { feature: "Personalization", manual: "Copy-paste", ai: "Context-aware" },
  { feature: "Response tracking", manual: "Spreadsheet", ai: "Real-time" },
  { feature: "Reply speed", manual: "Hours", ai: "Instant auto-reply" },
];

const testimonials = [
  { name: "Sarah K.", role: "Full-Stack Developer", text: "Went from 2 interviews/week to 8. The AI proposals are genuinely personalized — clients actually comment on how tailored they are.", stars: 5 },
  { name: "Marcus T.", role: "UI/UX Designer", text: "Vibe Scan is a game changer. I just describe my ideal project and it finds exactly what I'm looking for. Saved me hours daily.", stars: 5 },
  { name: "Priya M.", role: "Content Writer", text: "The analytics helped me realize I was bidding on the wrong categories. Shifted my strategy and doubled my win rate in a month.", stars: 5 },
];

const pricing = [
  { name: "Free", price: "$0", period: "/forever", desc: "Get started with AI-powered job hunting", features: ["50 job scans/month", "10 AI proposals", "Basic filters", "Match scoring"], cta: "Get Started", popular: false },
  { name: "Pro", price: "$29", period: "/month", desc: "For serious freelancers who want to scale", features: ["Unlimited job scans", "Unlimited AI proposals", "Advanced filters (30+)", "Auto-reply templates", "Full analytics", "Priority AI processing"], cta: "Start Pro Trial", popular: true },
  { name: "Enterprise", price: "$79", period: "/month", desc: "For agencies and teams", features: ["Everything in Pro", "Team collaboration", "API access", "Custom AI training", "Dedicated support", "White-label options"], cta: "Contact Sales", popular: false },
];

const faqs = [
  { q: "How does the AI job matching work?", a: "Our AI uses your profile, skills, and preferences to score every job 0-100. It understands context beyond simple keywords — describe your ideal job in plain English and it finds matches." },
  { q: "Is my Upwork account safe?", a: "Absolutely. We only read public RSS job feeds. We never access your Upwork account directly or store any credentials." },
  { q: "Can I edit AI-generated proposals?", a: "Yes! Every proposal is fully editable. The AI gives you a strong starting point that you can customize before sending." },
  { q: "What AI model do you use?", a: "We use Google's Gemini AI for intelligent job scoring and proposal generation. It's fast, accurate, and continuously improving." },
  { q: "Is there a free plan?", a: "Yes! Our free tier includes 50 job scans and 10 AI proposals per month. No credit card required." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Zap size={16} /></div>
            <span className="text-lg font-bold">Upwork Hunter</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Log in</Link>
            <Link href="/dashboard" className="btn-primary text-sm !px-5 !py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in-up">
            <Zap size={14} /> AI-Powered Upwork Automation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in-up">
            Win More Clients<br /><span className="gradient-text">with AI Precision</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-100" style={{opacity:0,animationFillMode:'forwards'}}>
            Stop scrolling through hundreds of jobs manually. Let AI find perfect matches, write compelling proposals, and track your performance — all on autopilot.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200" style={{opacity:0,animationFillMode:'forwards'}}>
            <Link href="/dashboard" className="btn-primary text-base flex items-center gap-2">Get Started Free <ArrowRight size={18} /></Link>
            <a href="#features" className="btn-secondary text-base">See How It Works</a>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500 animate-fade-in-up delay-300" style={{opacity:0,animationFillMode:'forwards'}}>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Everything You Need to <span className="gradient-text">Dominate Upwork</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Powerful AI tools that automate your entire bidding workflow — from finding jobs to winning clients.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card card-hover group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-all">
                  <Icon size={22} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-gray-400">Four simple steps to transform your Upwork game.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="card card-hover flex gap-5">
                <div className="text-3xl font-black gradient-text shrink-0">{n}</div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{title}</h3>
                  <p className="text-sm text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Manual vs <span className="gradient-text">AI-Powered</span></h2>
            <p className="text-gray-400">See the difference automation makes.</p>
          </div>
          <div className="card overflow-hidden !p-0">
            <div className="grid grid-cols-3 gap-0 text-sm font-semibold bg-white/[0.03] border-b border-white/[0.06] px-6 py-4">
              <div className="text-gray-400">Feature</div><div className="text-center text-red-400">Manual</div><div className="text-center text-green-400">Upwork Hunter</div>
            </div>
            {comparison.map(({ feature, manual, ai }) => (
              <div key={feature} className="grid grid-cols-3 gap-0 text-sm px-6 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="text-gray-300">{feature}</div><div className="text-center text-gray-500">{manual}</div><div className="text-center text-green-400 font-medium">{ai}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Loved by <span className="gradient-text">Freelancers</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card card-hover">
                <div className="flex gap-1 mb-4">{Array.from({length:t.stars}).map((_,i)=><Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />)}</div>
                <p className="text-sm text-gray-300 mb-5 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
            <p className="text-gray-400">Start free. Upgrade when you&apos;re ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p) => (
              <div key={p.name} className={`card card-hover relative ${p.popular ? "border-blue-500/30 animate-pulse-glow" : ""}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold">Most Popular</div>}
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
                <div className="mb-6"><span className="text-4xl font-extrabold">{p.price}</span><span className="text-gray-500">{p.period}</span></div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-gray-300"><Check size={16} className="text-green-500 shrink-0" />{f}</li>)}
                </ul>
                <Link href="/dashboard" className={`block text-center py-3 rounded-xl font-semibold transition-all ${p.popular ? "btn-primary !block" : "btn-secondary !block"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#080808]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-center">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="card !p-0 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left font-medium hover:bg-white/[0.02] transition-colors">
                  {f.q}<ChevronDown size={18} className={`text-gray-500 transition-transform ${openFaq===i?"rotate-180":""}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to <span className="gradient-text">Win More Clients?</span></h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of freelancers who automated their Upwork workflow.</p>
          <Link href="/dashboard" className="btn-primary text-lg inline-flex items-center gap-2">Get Started Free <ArrowRight size={20} /></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Zap size={16} /></div>
            <span className="font-bold">Upwork Hunter</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="text-sm text-gray-600">&copy; 2024 Upwork Hunter. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
