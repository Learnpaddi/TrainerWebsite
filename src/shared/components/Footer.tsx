import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Socials */}
          <div>
            <a href="/" className="flex items-center space-x-3 mb-6">
              <img src="/images/Logo.png" alt="LearnPaddi" className="h-12 w-auto" />
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LearnPaddi</span>
            </a>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              MSME Registered | Empowering students with industry-ready skills.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/learnpaddi" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://x.com/LearnPaddi" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="X">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.youtube.com/@Learn-paddi" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="YouTube">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 1.62-4.385 8.521.03 6.835.986 7.854 4.381 8.089 3.592.234 11.588.237 15.179 0 3.396-.234 4.35-1.254 4.385-8.521.03-6.799-.98-7.994-4.33-8.089zM16.42 14.87a.375.375 0 00-.447-.24l-4.588.007a.375.375 0 00-.242.447l.007 4.588a.375.375 0 00.24.447l4.588-.007a.375.375 0 00.447-.24l-.007-4.588zM8.5 14.87a.375.375 0 01.24-.447l4.588-.007a.375.375 0 01.447.24l-.007 4.588a.375.375 0 01-.24.447l-4.588.007a.375.375 0 01-.447-.24l.007-4.588z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="/#courses" className="hover:text-white transition-colors">Courses</a></li>
              <li><a href="/#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="/aboutus.html" className="hover:text-white transition-colors">About</a></li>
              <li><a href="/careers.html" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-xl font-bold mb-6">Programs</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="/lms/courses.html" className="hover:text-white transition-colors">Career Skills</a></li>
              <li><a href="/lms/courses.html" className="hover:text-white transition-colors">Soft Skills</a></li>
              <li><a href="/lms/courses.html" className="hover:text-white transition-colors">Digital Literacy</a></li>
              <li><a href="/lms/courses.html" className="hover:text-white transition-colors">Industry Connect</a></li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-xl font-bold mb-6">Legal</h4>
            <ul className="space-y-3 text-gray-400 mb-6">
              <li><a href="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms.html" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/help.html" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
            <h4 className="text-xl font-bold mb-6">Contact</h4>
            <p className="text-gray-400 mb-4">Ready to partner with us?</p>
            <a href="/#contactForm" className="inline-flex items-center gap-2 text-primary hover:text-white font-bold bg-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300">
              <i className="fas fa-envelope" />
              Get In Touch
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          &amp;copy; 2025 LearnPaddi. All rights reserved. | 
          <a href="https://udyamregistration.gov.in/UA/PrintAcknowledgement_Public.aspx?Udyam_Reference_Number=UDYAM-TN-34-0092036" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">MSME Registered</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

