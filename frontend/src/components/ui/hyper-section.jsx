import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, TrendingUp, Zap } from "lucide-react";

export function HyperSection() {
  return (
    <div className="bg-[#0A0A0A] w-full min-h-screen">
      {/* Liquid Yellow Hero Section */}
      <div className="bg-[#FDE047] w-full relative overflow-hidden rounded-b-[40px] md:rounded-br-[120px] md:rounded-bl-[40px] pb-24 md:pb-32 pt-10 px-6 md:px-16">
        
        {/* Top Nav inside the yellow area */}
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2 font-display font-bold text-black text-xl tracking-tight">
            <div className="w-4 h-4 bg-black rounded-full" />
            Playto
          </div>
          <div className="hidden md:flex items-center gap-8 text-black/80 font-medium text-sm">
            <a href="#" className="hover:text-black">AutoDM</a>
            <a href="#" className="hover:text-black">Playto Pay</a>
            <a href="#" className="hover:text-black">Communities</a>
            <a href="#" className="hover:text-black">Courses</a>
          </div>
          <button className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform active:scale-95 shadow-lg">
            Get Started
          </button>
        </nav>

        {/* Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 relative z-10 max-w-7xl mx-auto">
          
          {/* Left Column */}
          <div className="flex flex-col justify-center items-start z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/20 text-black text-[10px] font-bold uppercase tracking-widest mb-8">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
              ✦ Introducing Playto →
            </div>
            
            <h1 className="font-display font-bold text-6xl sm:text-7xl lg:text-8xl xl:text-[90px] leading-[0.85] tracking-tight text-black mb-8">
              BUILD
              <br />
              COMMUNITY
            </h1>
            
            <p className="text-black/80 text-lg md:text-xl font-medium max-w-md mb-10 leading-snug">
              The Easiest Way to Build & Monetize Communities, Courses & Memberships.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <button className="group bg-black text-white px-6 py-3.5 rounded-full font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95">
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3.5 rounded-full border-2 border-black/20 text-black font-semibold hover:border-black/40 hover:scale-105 transition-all active:scale-95">
                View Demo
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#FDE047] overflow-hidden bg-white/20">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                      alt="User" 
                      className="w-full h-full object-cover mix-blend-multiply opacity-80"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-black text-lg leading-tight">2M+</span>
                <span className="text-black/60 text-xs font-semibold uppercase tracking-wider">Active Users</span>
              </div>
            </div>
          </div>

          {/* Right Column - Floating UI */}
          <div className="relative flex justify-center items-center lg:h-[600px]">
            
            {/* The Phone / App Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full max-w-[320px] bg-[#0A0A0A] rounded-[40px] p-6 shadow-2xl relative z-10 border border-white/5"
            >
              <div className="flex justify-between items-start mb-16">
                <div className="w-10 h-10 rounded-full bg-[#FDE047] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" fill="currentColor" />
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[10px] font-bold tracking-widest uppercase">
                  Creator
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-white/50 text-sm font-medium mb-1">Monthly Revenue</p>
                <h3 className="text-white font-display font-bold text-5xl tracking-tight">$12,450</h3>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-xs text-white/50 mb-2 font-medium">
                  <span>Engagement Rate</span>
                  <span>85%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[85%] bg-[#FDE047] rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white text-black py-3 rounded-full font-semibold text-sm hover:scale-105 transition-transform active:scale-95">
                  New Course
                </button>
                <button className="bg-white/10 text-white py-3 rounded-full font-semibold text-sm hover:bg-white/20 transition-colors active:scale-95">
                  Message
                </button>
              </div>
            </motion.div>

            {/* Floating Badge 1 - Stock Up */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 right-0 lg:-right-10 bg-white/40 backdrop-blur-xl border border-white/50 rounded-full py-3 px-5 shadow-xl flex items-center gap-3 z-20"
            >
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#FDE047]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest leading-none mb-1">Members</span>
                <span className="text-black font-bold text-sm leading-none">+14.2%</span>
              </div>
            </motion.div>

            {/* Floating Badge 2 - Global Payments */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-10 -left-6 lg:-left-16 bg-[#0A0A0A] rounded-full py-3 px-5 shadow-2xl flex items-center gap-3 z-20 border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-[#FDE047] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Global</span>
                <span className="text-white font-bold text-sm leading-none">Payments</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* The Dark Void Below */}
      <div className="bg-[#0A0A0A] w-full py-24 px-6 md:px-16 flex flex-col items-center justify-center relative">
         <div className="text-white/30 text-xs font-bold uppercase tracking-widest mb-10 text-center">
           Trusted by bold teams worldwide
         </div>
         <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos mockup */}
            <div className="text-xl font-display font-bold text-white">dbt</div>
            <div className="text-xl font-display font-bold text-white tracking-tighter">Tableau</div>
            <div className="text-xl font-display font-bold text-white italic">Fivetran</div>
            <div className="text-xl font-display font-bold text-white">Snowflake</div>
         </div>
      </div>
    </div>
  );
}
