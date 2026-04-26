import { Link } from "react-router-dom";

export default function PlaytoFooter() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl mb-4">
              <div className="w-4 h-4 bg-[#FDE047] rounded-full" />
              Playto
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              The all-in-one creator platform. Communities, courses, memberships, and automation — all free, forever.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-widest text-white/40 mb-6">Product</h4>
            <ul className="space-y-3">
              <li><Link to="/autodm" className="text-white/70 hover:text-white transition-colors text-sm font-medium">AutoDM</Link></li>
              <li><Link to="/pay" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Playto Pay</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Content Vault</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Communities</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Courses</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-widest text-white/40 mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="https://www.playto.so/terms" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Terms</a></li>
              <li><a href="https://www.playto.so/privacy" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Privacy</a></li>
              <li><a href="https://www.playto.so/customer-support" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Contact</a></li>
              <li><a href="https://www.playto.so/customer-support" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Customer Support</a></li>
              <li><a href="https://www.playto.so/refund-policy" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Refund Policy</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-widest text-white/40 mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="https://www.playto.so/affiliate-terms" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Affiliate Terms</a></li>
              <li><a href="https://www.playto.so/takedown-policy" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Takedown Policy</a></li>
              <li><a href="https://www.playto.so/data-processing-addendum" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Data Processing Addendum</a></li>
              <li><a href="https://www.playto.so/cookies-policy" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors text-sm font-medium">Cookies Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2026 Playto. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://www.playto.so/terms" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white/70 text-sm transition-colors">Terms</a>
            <a href="https://www.playto.so/privacy" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white/70 text-sm transition-colors">Privacy</a>
            <a href="https://www.playto.so/customer-support" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white/70 text-sm transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
