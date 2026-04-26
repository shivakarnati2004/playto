import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle, ChevronDown, Instagram, Zap, MessageSquare, FolderOpen, Repeat, LayoutTemplate, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PlaytoFooter from "../components/ui/PlaytoFooter";

export default function AutoDMPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: "Is AutoDM really free?", a: "Yes, 100%. AutoDM is free forever. No premium tiers, no hidden limits, no trial period." },
    { q: "How do I connect my Instagram?", a: "One tap through Instagram's official API. Safe, secure, and instant." },
    { q: "Can I use AutoDM on multiple posts?", a: "Yes. Set it once, and it works on any post — past or future. No re-setup needed." },
    { q: "What is the Content Vault?", a: "A hosted hub for all your digital products, links, and lead magnets. One shareable link that works forever." },
    { q: "Does it work with Reels and Stories?", a: "AutoDM works on posts and Reels comments. Story replies are coming soon." },
    { q: "Can I customize the DM message?", a: "Absolutely. Write your own message, add links, and personalize for each trigger." },
  ];

  return (
    <main className="bg-void min-h-screen font-body text-white selection:bg-[#FDE047] selection:text-black">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-white text-xl">
            <div className="w-4 h-4 bg-[#FDE047] rounded-full" />
            Playto
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link to="/autodm" className="text-white transition-colors">AutoDM</Link>
            <Link to="/pay" className="hover:text-white transition-colors">Playto Pay</Link>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
          </div>
          <a href="https://app.playto.so/apps/autodm/" target="_blank" rel="noreferrer" className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
            Get Started Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FDE047]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="font-display font-bold text-5xl md:text-8xl tracking-tight mb-8 leading-[1.05]">
            The last AutoDM tool<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE047] to-amber-200">you'll ever need.</span>
          </h1>
          <p className="text-lg md:text-2xl text-white/60 max-w-3xl mx-auto mb-12 leading-relaxed">
            Easy automation. Built-in content vault. Free forever (actually).
          </p>
          <a href="https://app.playto.so/apps/autodm/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#FDE047] text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(253,224,71,0.3)]">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-[#FDE047] text-black px-6 rounded-[40px] md:rounded-[80px] mx-4 mb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tight">Live in 15 seconds.</h2>
            <p className="text-2xl font-medium opacity-80">Three steps. That's all.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Instagram className="w-6 h-6" />, step: 1, title: "Connect Instagram", desc: "Link your Instagram in one tap. Safe, official, instant." },
              { icon: <Zap className="w-6 h-6" />, step: 2, title: "Pick Your Trigger", desc: "Pick any post, keyword, or comment that triggers your DM." },
              { icon: <MessageSquare className="w-6 h-6" />, step: 3, title: "Write Your DM", desc: "Type your message, add a link, and hit go. Done." }
            ].map((s, i) => (
              <div key={i} className="bg-black/5 rounded-3xl p-8 text-center border border-black/10">
                <div className="w-16 h-16 bg-black text-[#FDE047] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  {s.icon}
                </div>
                <h3 className="font-display font-bold text-2xl mb-4">{s.title}</h3>
                <p className="font-medium opacity-80 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16 text-2xl font-bold font-display opacity-80">
            That's it. Seriously.
          </div>
        </div>
      </section>

      {/* The Difference */}
      <section className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">The old way vs. the Playto way.</h2>
            <p className="text-xl text-white/60">There's a reason everyone is switching.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-10 md:p-14">
              <h3 className="font-display font-bold text-3xl mb-8 text-red-400">The Old Way</h3>
              <ul className="space-y-6">
                {["Complicated tools with confusing dashboards", "Monthly fees that add up fast", "Broken links and scattered Drive files", "Re-setup for every single post", "Hours of tutorials just to get started"].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-white/80">
                    <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#FDE047]/10 border border-[#FDE047]/30 rounded-[40px] p-10 md:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FDE047] text-black px-6 py-1.5 font-bold text-sm rounded-bl-3xl">Recommended</div>
              <h3 className="font-display font-bold text-3xl mb-8 text-[#FDE047]">The Playto Way</h3>
              <ul className="space-y-6">
                {["Simple setup — live in 15 seconds", "Free forever. No catch, no limits", "One vault link that always works", "Set once, works on every post forever", "So easy you already know how to use it"].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-white">
                    <CheckCircle2 className="w-6 h-6 text-[#FDE047] shrink-0 mt-0.5" />
                    <span className="text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Content Vault */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">Set it once.<br />Share everything. Forever.</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">All your files, links, and lead magnets in one place. One link. Works forever.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Repeat className="w-6 h-6" />, title: "Always On", desc: "Works on any post, any comment. No re-setup needed." },
            { icon: <FolderOpen className="w-6 h-6" />, title: "One Link", desc: "One link for everything. Add new content anytime." },
            { icon: <FileText className="w-6 h-6" />, title: "Your Way", desc: "Share everything at once or pick items one by one." }
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors text-center">
              <div className="w-12 h-12 rounded-full bg-[#FDE047]/20 text-[#FDE047] flex items-center justify-center mx-auto mb-6">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">{f.title}</h3>
              <p className="text-white/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">Built for simplicity.</h2>
          <p className="text-2xl text-white/60">Zero bloat. Every feature earns its place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: <Zap />, title: "Keyword Triggers", desc: "Reply only when someone says the right word. Smart targeting, zero noise." },
            { icon: <MessageSquare />, title: "Content Delivery", desc: "Send files, links, and lead magnets right in the DM. No extra steps." },
            { icon: <LayoutTemplate />, title: "Ready-Made Templates", desc: "Pre-built DM flows for every use case. Pick one, tweak it, go live." },
            { icon: <FolderOpen />, title: "Your Content, Hosted", desc: "No more Drive links or Notion pages. Everything lives on Playto." }
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#FDE047]/20 text-[#FDE047] flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">{f.title}</h3>
              <p className="text-white/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wall of Love */}
      <section className="py-32 px-6 bg-[#FDE047] text-black rounded-[40px] md:rounded-[80px] mx-4 mb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tight">Loved by creators.</h2>
            <p className="text-2xl font-medium opacity-80">Here's what they're saying.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { text: "I set it up during lunch. By dinner, I'd already gotten 40 new DM conversations. This thing is wild.", author: "Sarah K.", title: "Content Creator" },
              { text: "I was paying $49/mo for something worse. Switched to Playto and it's free AND better. No brainer.", author: "Alex R.", title: "Digital Marketer" },
              { text: "The Content Vault is genius. I put all my freebies in one link and never think about it again.", author: "Maya J.", title: "Coach" },
              { text: "My followers used to DM me asking for my resources. Now it happens automatically. Saved me hours every week.", author: "Ravi P.", title: "Educator" },
              { text: "Honestly didn't believe it was free. Used it for a month waiting for the catch. There is no catch.", author: "Lisa T.", title: "Blogger" },
              { text: "15 seconds to set up is not an exaggeration. I literally timed it. Took me 12.", author: "Chris M.", title: "Fitness Creator" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                <p className="font-medium text-lg leading-relaxed mb-8">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt={t.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t.author}</h4>
                    <p className="text-black/60 text-sm font-medium">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-3xl mx-auto mb-32">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-5xl mb-6">Got questions?</h2>
          <p className="text-xl text-white/60">We've got answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
              <button 
                className="w-full px-6 py-5 text-left font-bold text-lg flex items-center justify-between hover:bg-white/5"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-white/70 leading-relaxed font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#FDE047]/5 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="font-display font-bold text-5xl md:text-7xl mb-8 relative z-10">
          Your audience<br />is waiting.
        </h2>
        <p className="text-xl text-white/60 mb-12 relative z-10">Join 250+ creators already using Playto.</p>
        <a href="https://app.playto.so/apps/autodm/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#FDE047] text-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(253,224,71,0.3)] relative z-10">
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </a>
      </section>

      <PlaytoFooter />
    </main>
  );
}
