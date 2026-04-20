import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_20%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_22%),linear-gradient(180deg,#081120_0%,#0d1728_55%,#111f34_100%)] py-16 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,rgba(59,130,246,0.06)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid gap-8 md:grid-cols-4 mb-12">
          {/* Logo & Socials */}
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <Link to="/" className="mb-6 flex items-center space-x-3">
              <img src="/images/Logo.png" alt="LearnPaddi" className="h-12 w-auto rounded-xl bg-white/80 p-1.5 shadow-sm" />
              <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-300 bg-clip-text text-2xl font-black text-transparent">LearnPaddi</span>
            </Link>
            <p className="mb-6 max-w-sm text-base leading-8 text-slate-200/90">
              MSME Registered | Empowering students with industry-ready skills.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.linkedin.com/company/learnpaddi" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-sky-400/15 hover:text-white hover:shadow-[0_18px_30px_rgba(37,99,235,0.2)]" aria-label="LinkedIn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://x.com/LearnPaddi" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-200/30 hover:bg-white/14 hover:text-white hover:shadow-[0_18px_30px_rgba(148,163,184,0.18)]" aria-label="X">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.youtube.com/@Learn-paddi" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300/35 hover:bg-rose-400/15 hover:text-white hover:shadow-[0_18px_30px_rgba(244,63,94,0.18)]" aria-label="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 1.62-4.385 8.521.03 6.835.986 7.854 4.381 8.089 3.592.234 11.588.237 15.179 0 3.396-.234 4.35-1.254 4.385-8.521.03-6.799-.98-7.994-4.33-8.089zM16.42 14.87a.375.375 0 00-.447-.24l-4.588.007a.375.375 0 00-.242.447l.007 4.588a.375.375 0 00.24.447l4.588-.007a.375.375 0 00.447-.24l-.007-4.588zM8.5 14.87a.375.375 0 01.24-.447l4.588-.007a.375.375 0 01.447.24l-.007 4.588a.375.375 0 01-.24.447l-4.588.007a.375.375 0 01-.447-.24l.007-4.588z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h4 className="mb-6 text-xl font-bold text-white">Quick Links</h4>
            <ul className="space-y-3 text-slate-300">
              <li><a href="/#features" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Features</a></li>
              <li><a href="/#courses" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Courses</a></li>
              <li><a href="/#how-it-works" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">How it Works</a></li>
              <li><a href="/aboutus.html" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">About</a></li>
              <li><a href="/careers.html" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Careers</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h4 className="mb-6 text-xl font-bold text-white">Programs</h4>
            <ul className="space-y-3 text-slate-300">
              <li><Link to="/courses" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Career Skills</Link></li>
              <li><Link to="/courses" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Soft Skills</Link></li>
              <li><Link to="/courses" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Digital Literacy</Link></li>
              <li><Link to="/courses" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Industry Connect</Link></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h4 className="mb-6 text-xl font-bold text-white">Legal</h4>
            <ul className="mb-8 space-y-3 text-slate-300">
              <li><a href="/privacy.html" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms.html" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Terms of Service</a></li>
              <li><a href="/help.html" className="inline-flex rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/8 hover:text-white">Help Center</a></li>
            </ul>
            <h4 className="mb-4 text-xl font-bold text-white">Contact</h4>
            <p className="mb-5 text-slate-200/90">Ready to partner with us?</p>
            <a href="/#contactForm" className="inline-flex items-center gap-3 rounded-2xl border border-cyan-300/25 bg-gradient-to-r from-blue-500/25 via-sky-400/20 to-cyan-400/25 px-6 py-3.5 font-bold text-white shadow-[0_16px_35px_rgba(14,116,240,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/45 hover:from-blue-500/35 hover:to-cyan-400/35 hover:shadow-[0_22px_42px_rgba(14,116,240,0.24)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12">
                <i className="fas fa-envelope" />
              </span>
              Get In Touch
            </a>
          </div>
        </div>
        <div className="relative border-t border-white/10 pt-8 text-center text-sm text-slate-400">
          &copy; 2025 LearnPaddi. All rights reserved. |{' '}
          <a href="https://udyamregistration.gov.in/UA/PrintAcknowledgement_Public.aspx?Udyam_Reference_Number=UDYAM-TN-34-0092036" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 transition-colors hover:text-white">MSME Registered</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
