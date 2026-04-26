import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Globe, CreditCard, Zap, Smartphone, DollarSign, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PlaytoPayPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: "What payment methods do you support?", a: "We support over 50 payment methods including all major credit cards, Apple Pay, Google Pay, Affirm, Klarna, UPI, and local bank transfers." },
    { q: "Is there a monthly fee or subscription?", a: "No. Playto Pay is free to use. We only charge a flat 4% fee per transaction." },
    { q: "How fast do I get my money?", a: "Settlements occur in under 7 days globally. Expedited payouts are available for established accounts." },
    { q: "Do my clients need to create an account?", a: "No. Your clients can check out directly as guests without any friction." },
    { q: "Where can I receive payouts?", a: "We support payouts to over 50 countries via direct bank transfer or local methods." },
    { q: "What is a Merchant of Record?", a: "As your Merchant of Record, we handle global tax compliance, chargebacks, and legal liability so you don't have to." },
    { q: "Do you support subscriptions and recurring payments?", a: "Yes, you can easily set up recurring billing and subscriptions for courses or memberships." },
    { q: "How does Buy Now Pay Later work?", a: "Your clients can choose Affirm or Klarna at checkout to split their payments. You get paid the full amount immediately." },
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
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <Link to="/register" className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FDE047]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm font-medium mb-8">
            <div className="w-2 h-2 bg-[#FDE047] rounded-full animate-pulse" />
            Free to Start · Flat 4% Fee
          </div>
          
          <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tight mb-8 leading-[1.1]">
            Accept payments <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE047] to-amber-200">from anywhere.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/70 max-w-3xl mb-12 leading-relaxed">
            Flat 4% on everything. Global payments in 50+ countries. <br />
            Cards, wallets, installments — you sell, we handle the rest.
          </p>
          
          <button className="bg-[#FDE047] text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(253,224,71,0.3)] mb-16 flex items-center gap-2">
            Start Accepting Payments
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale">
            {['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay', 'PayPal', 'Affirm', 'Klarna'].map((brand) => (
              <span key={brand} className="font-display font-bold text-xl">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/10 bg-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="font-display font-bold text-5xl text-[#FDE047] mb-2">$100K+</h3>
            <p className="text-white/60 font-medium">Monthly Volume</p>
          </div>
          <div>
            <h3 className="font-display font-bold text-5xl text-[#FDE047] mb-2">300+</h3>
            <p className="text-white/60 font-medium">Happy Clients</p>
          </div>
          <div>
            <h3 className="font-display font-bold text-5xl text-[#FDE047] mb-2">50+</h3>
            <p className="text-white/60 font-medium">Payment Methods</p>
          </div>
        </div>
      </section>

      {/* Payment Methods Detail */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="features">
        <div className="text-center mb-20">
          <h2 className="font-display font-bold text-4xl md:text-6xl mb-6">Every Payment Method</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            If they can pay with it, you can accept it. 50+ payment methods across the globe. The widest coverage of any platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "CARDS", items: ["Visa", "Mastercard", "American Express", "Discover & Diners"] },
            { title: "DIGITAL WALLETS", items: ["Apple Pay", "Google Pay", "PayPal", "Cash App"] },
            { title: "BUY NOW PAY LATER", items: ["Affirm", "Klarna", "Afterpay", "Credit Card EMI"] },
            { title: "REGIONAL METHODS", items: ["UPI", "Net Banking", "Bank Transfers", "Wire Transfers"] },
          ].map((cat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h4 className="text-[#FDE047] text-sm font-bold uppercase tracking-widest mb-6">{cat.title}</h4>
              <ul className="space-y-4">
                {cat.items.map((item, j) => (
                  <li key={j} className="flex items-center justify-between text-white/80 font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-[#FDE047] text-black px-6 rounded-[40px] md:rounded-[80px] mx-4 mb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tight">How It Works</h2>
            <p className="text-2xl font-medium opacity-80">Live in 60 seconds. Three steps. That's all.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              { step: 1, title: "Create a Product", desc: "Set your price, add a description, and get a checkout link instantly." },
              { step: 2, title: "Share Your Link", desc: "Send it anywhere — DMs, bio, email, WhatsApp. Clients pay without logging in." },
              { step: 3, title: "Get Paid", desc: "Money hits your account in under 7 days. Global payouts to any country." }
            ].map((s, i) => (
              <div key={i} className="bg-black/5 rounded-3xl p-8 text-center border border-black/10">
                <div className="w-16 h-16 bg-black text-[#FDE047] rounded-full flex items-center justify-center font-display font-bold text-3xl mx-auto mb-6 shadow-xl">
                  {s.step}
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

      {/* Why Playto Pay */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">Why Playto Pay</h2>
          <p className="text-2xl text-white/60">Built for the way you work. Everything you need. Nothing you don't.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <ShieldCheck />, title: "Merchant of Record", desc: "We handle taxes, compliance, and disputes across 100+ geographies. You don't lift a finger." },
            { icon: <Globe />, title: "Global BNPL", desc: "Offer Affirm, Klarna & Credit Card EMI to your clients worldwide. Increase conversions and ticket size." },
            { icon: <Zap />, title: "Fast Settlement", desc: "Get paid in under 7 days. Expedited options available. Global payouts to any country." },
            { icon: <Smartphone />, title: "Zero Friction", desc: "Your clients never need to log in or create an account. Just pay and go — 95%+ payment success rate." },
            { icon: <DollarSign />, title: "Subscriptions", desc: "Collect recurring payments in 100+ currencies. Ideal for SaaS, courses, memberships, and communities." },
            { icon: <CreditCard />, title: "Payment Links", desc: "No dev team? No problem. Create a payment link in seconds and share it anywhere." }
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

      {/* The Difference */}
      <section className="py-32 px-6 bg-white/5 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">The Difference</h2>
            <p className="text-xl text-white/60">Stop losing revenue to hidden fees and friction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <div className="bg-red-500/10 border border-red-500/20 rounded-[40px] p-10 md:p-14">
              <h3 className="font-display font-bold text-3xl mb-8 text-red-400">The Old Way</h3>
              <ul className="space-y-6">
                {["Hidden forex fees eating into your revenue", "5-7% total fees on international payments", "Clients need accounts to pay you", "Settlements take 2-4 weeks", "No BNPL or EMI options for your clients"].map((item, i) => (
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
                {["Flat 4% on everything. No hidden fees", "Live in 60 seconds — no code needed", "Clients just pay. No login required", "Settled in under 7 days", "50+ payment methods worldwide"].map((item, i) => (
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

      {/* Pricing Table */}
      <section className="py-32 px-6 max-w-7xl mx-auto" id="pricing">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">Pricing</h2>
          <p className="text-xl text-white/60">Save thousands in hidden fees.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-6 px-4 font-bold text-white/50 uppercase tracking-widest text-sm">Platform</th>
                <th className="py-6 px-4 font-bold text-white/50 uppercase tracking-widest text-sm">Monthly Sub</th>
                <th className="py-6 px-4 font-bold text-white/50 uppercase tracking-widest text-sm">Fee (Intl)</th>
                <th className="py-6 px-4 font-bold text-white/50 uppercase tracking-widest text-sm text-center">BNPL / EMI</th>
                <th className="py-6 px-4 font-bold text-white/50 uppercase tracking-widest text-sm text-center">Global Payouts</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[#FDE047]/10 border-b border-[#FDE047]/20">
                <td className="py-6 px-4 font-bold text-lg text-[#FDE047]">Playto Pay</td>
                <td className="py-6 px-4 font-bold">$0</td>
                <td className="py-6 px-4 font-bold text-xl">4%</td>
                <td className="py-6 px-4 text-center"><CheckCircle2 className="inline text-[#FDE047] w-6 h-6" /></td>
                <td className="py-6 px-4 text-center"><CheckCircle2 className="inline text-[#FDE047] w-6 h-6" /></td>
              </tr>
              {[
                { name: "Stripe", fee: "~4.4% + 30¢" },
                { name: "PayPal", fee: "~4.5% + 49¢" },
                { name: "Paddle", fee: "5% + 50¢" },
                { name: "Lemon Squeezy", fee: "5% + 50¢ + extras" },
                { name: "Whop", fee: "~5.7% + 30¢" },
                { name: "Dodo Payments", fee: "4% + 40¢ + extras" }
              ].map((comp, i) => (
                <tr key={i} className="border-b border-white/10 opacity-70">
                  <td className="py-6 px-4 font-medium">{comp.name}</td>
                  <td className="py-6 px-4">$0</td>
                  <td className="py-6 px-4">{comp.fee}</td>
                  <td className="py-6 px-4 text-center text-white/20">—</td>
                  <td className="py-6 px-4 text-center text-white/20">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Wall of Love */}
      <section className="py-32 px-6 bg-[#FDE047] text-black rounded-[40px] md:rounded-[80px] mx-4 mb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6 tracking-tight">Wall of Love</h2>
            <p className="text-2xl font-medium opacity-80">Trusted by creators & agencies. Here's what they're saying.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { text: "Switched from Stripe and I'm saving thousands in forex fees. The flat 4% is a game-changer for international payments.", author: "Rahul S.", title: "Agency Owner" },
              { text: "My clients can now pay with Affirm and Klarna. Nobody else offers BNPL this easily. My conversions went up 40%.", author: "Ananya K.", title: "Course Creator" },
              { text: "I love that my clients don't need to create an account. I just send them a link and they pay. It couldn't be simpler.", author: "James T.", title: "Freelance Designer" },
              { text: "Global payouts are incredible. No other platform gives you this flexibility to settle in any country.", author: "Sameer A.", title: "Agency Founder" },
              { text: "Set up my first product in under a minute. Already collected $5,000 in my first week. The simplicity is unreal.", author: "Priya M.", title: "SaaS Founder" },
              { text: "Payment links are perfect for my community. I share them in WhatsApp groups and money just flows in. Love it.", author: "David L.", title: "Community Builder" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                <p className="font-medium text-lg leading-relaxed mb-8">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
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
      <section className="py-20 px-6 max-w-3xl mx-auto mb-32" id="faq">
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

      {/* CTA Footer */}
      <section className="py-32 px-6 text-center border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#FDE047]/5 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="font-display font-bold text-5xl md:text-7xl mb-8 relative z-10">
          Your clients are <br/> ready to pay.
        </h2>
        <p className="text-xl text-white/60 mb-12 relative z-10">Join 300+ creators and agencies already using Playto Pay.</p>
        <button className="bg-[#FDE047] text-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform active:scale-95 shadow-[0_0_40px_rgba(253,224,71,0.3)] relative z-10">
          Start Accepting Payments
        </button>
      </section>

    </main>
  );
}
