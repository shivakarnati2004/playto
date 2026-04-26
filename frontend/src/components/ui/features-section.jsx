import { motion } from "framer-motion";
import { MessageCircle, BookOpen, TrendingUp, Megaphone, Shield, CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "Community Chat",
    description: "Organized, WhatsApp-style chat with threads & topics.",
    icon: <MessageCircle className="w-6 h-6 text-[#FDE047]" />,
    items: ["Threaded replies", "Topic organization", "Voice channel"]
  },
  {
    title: "Course Delivery",
    description: "Structured course management & content delivery.",
    icon: <BookOpen className="w-6 h-6 text-[#FDE047]" />,
    items: ["Organized lessons", "Assignment submission", "Progress tracking"]
  },
  {
    title: "Member Engagement",
    description: "Boost participation with clear progress signals and community highlights.",
    icon: <TrendingUp className="w-6 h-6 text-[#FDE047]" />,
    items: ["Contributor highlights", "Milestone tracking", "Activity metrics"]
  },
  {
    title: "Creator Marketing",
    description: "Tools to grow communities, courses & memberships easily.",
    icon: <Megaphone className="w-6 h-6 text-[#FDE047]" />,
    items: ["Email Marketing", "WhatsApp Marketing", "Landing Page Builder"]
  },
  {
    title: "Exclusive Memberships",
    description: "Exclusive spaces for supporters with premium content.",
    icon: <Shield className="w-6 h-6 text-[#FDE047]" />,
    items: ["Host Exclusive Content", "Unlimited File Sharing", "Organize Member Events"]
  }
];

const steps = [
  {
    number: "1",
    title: "Create Your Vision",
    desc: "Build your community or course with a few taps—no code required. Add lessons, set topics, and customize your space."
  },
  {
    number: "2",
    title: "Launch with Ease",
    desc: "Share your unique link via social media or messaging apps. Your audience downloads Playto and joins instantly."
  },
  {
    number: "3",
    title: "Grow and Thrive",
    desc: "Engage with live chats, structured courses, and challenges. Watch your revenue soar as your community scales."
  }
];

export function FeaturesSection() {
  return (
    <div className="bg-[#0A0A0A] w-full py-32 px-6 md:px-16 text-white relative overflow-hidden">
      
      {/* What is Playto */}
      <div className="max-w-5xl mx-auto mb-32 relative z-10">
        <h2 className="font-display font-bold text-4xl sm:text-6xl text-white mb-6 tracking-tight">
          What is Playto?
        </h2>
        <p className="text-xl sm:text-3xl font-medium text-white/70 leading-snug max-w-3xl">
          A mobile-first platform to launch communities, courses & memberships fast, generate revenue, and connect deeply with your audience.
        </p>
      </div>

      {/* Feature Cards Grid (Glassmorphism) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40 relative z-10">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6">
              {f.icon}
            </div>
            <h3 className="font-display font-bold text-2xl mb-3">{f.title}</h3>
            <p className="text-white/60 font-body text-sm mb-8 leading-relaxed">
              {f.description}
            </p>
            <ul className="space-y-3">
              {f.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-[#FDE047]" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* 3 Step Path - Liquid Yellow Breakout */}
      <div className="w-full relative">
        <div className="absolute inset-0 bg-[#FDE047] rounded-tr-[120px] rounded-tl-[40px] transform skew-y-[-2deg] scale-110 z-0"></div>
        <div className="relative z-10 py-32 px-6 md:px-16 max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-display font-bold text-black text-5xl sm:text-7xl tracking-tight mb-4">
              How Playto Works
            </h2>
            <p className="text-black/80 font-medium text-xl sm:text-2xl">
              Your 3-Step Path to Success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col">
                <div className="w-16 h-16 rounded-full bg-black text-[#FDE047] flex items-center justify-center font-display font-bold text-2xl mb-6 shadow-xl">
                  {s.number}
                </div>
                <h3 className="font-display font-bold text-black text-3xl mb-4">{s.title}</h3>
                <p className="text-black/80 font-medium text-base leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
