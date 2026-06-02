import React from 'react';
import { Mail, Phone, MapPin, Landmark, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  lang: 'en' | 'mr';
  setActiveTab: (tab: string) => void;
}

export default function Footer({ lang, setActiveTab }: FooterProps) {
  return (
    <footer 
      id="app-footer" 
      className="bg-stone-900 text-stone-200 border-t-4 border-accent relative overflow-hidden font-sans"
    >
      
      {/* Decorative background shape */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-[0.03] rounded-full transform translate-x-32 -translate-y-32"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-accent p-2.5 rounded-xl border border-secondary shadow-md">
                <Landmark className="h-5.5 w-5.5" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase text-white font-serif">PJ INDUSTRIES</span>
            </div>
            
            <p className="text-stone-400 text-sm leading-relaxed">
              {lang === 'en' 
                ? 'Pioneering scientific cattle nutrition & bypass proteins. PJ Industries is a trusted partner for thousands of progressive dairy milk farmers.'
                : 'पशुधनाचा आहार आणि आरोग्यामध्ये क्रांती घडवण्याचा आमचा ध्यास. हजारों शेतकऱ्यांचा विश्वासू पशू खाद्य ब्रँड - दुग्धऊर्जा.'}
            </p>

            <div className="bg-stone-800 p-3.5 rounded-xl border border-stone-700 space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-accent flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>GST Registration No</span>
              </div>
              <p className="text-xs font-mono font-bold text-stone-200">27APIPJ3647P2Z8</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-black border-b border-secondary pb-2 mb-4 text-accent font-serif">
              {lang === 'en' ? 'Quick Navigation' : 'त्वरित दुवे'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="text-stone-300 hover:text-accent font-extrabold text-left hover:translate-x-1.5 transition-all duration-300"
                >
                  {lang === 'en' ? 'Home / Main Board' : 'मुख्यपृष्ठ'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="text-stone-300 hover:text-accent font-extrabold text-left hover:translate-x-1.5 transition-all duration-300"
                >
                  {lang === 'en' ? 'Doodhurja Products' : 'दुग्धऊर्जा उत्पादने'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('about')} 
                  className="text-stone-300 hover:text-accent font-extrabold text-left hover:translate-x-1.5 transition-all duration-300"
                >
                  {lang === 'en' ? 'Company Background' : 'आमच्याबद्दल'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('dealer')} 
                  className="text-accent hover:text-white font-black text-left hover:translate-x-1.5 transition-all duration-300"
                >
                  {lang === 'en' ? 'Dealer Inquiry Panel' : 'डीलर व्हा - अर्ज करा'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('contact')} 
                  className="text-stone-300 hover:text-accent font-extrabold text-left hover:translate-x-1.5 transition-all duration-300"
                >
                  {lang === 'en' ? 'Help & Support Desk' : 'संपर्क साधा'}
                </button>
              </li>
            </ul>
          </div>

          {/* Corporate Manufacturing Unit */}
          <div>
            <h3 className="text-lg font-black border-b border-secondary pb-2 mb-4 text-accent font-serif">
              {lang === 'en' ? 'Registered Office & Factory' : 'पत्ता आणि कारखाना'}
            </h3>
            <div className="space-y-3.5 text-sm text-stone-300">
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span className="leading-relaxed text-stone-300">
                  <strong className="text-white">PJ INDUSTRIES</strong><br />
                  PLOT A63, Behind Yazaki Factory,<br />
                  Yash Inn Chowk, Ranjangaon MIDC,<br />
                  Pune – 412220, Maharashtra
                </span>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <h3 className="text-lg font-black border-b border-secondary pb-2 mb-4 text-accent font-serif">
              {lang === 'en' ? 'Customer Support' : 'ग्राहक सेवा संपर्क'}
            </h3>
            <div className="space-y-3.5 text-sm text-stone-300">
              <p className="text-xs text-stone-400 leading-relaxed">
                {lang === 'en'
                  ? 'Feel free to contact us for wholesale orders, dealership guidelines, or cattle health guidance sessions.'
                  : 'घाऊक मागणी, डीलर अर्ज किंवा जनावरांच्या आरोग्याविषयी मार्गदर्शनासाठी थेट फोन करा.'}
              </p>
              
              <div className="flex items-center space-x-2.5">
                <Phone className="h-4.5 w-4.5 text-accent" />
                <a href="tel:+919145687999" className="text-base font-black text-white hover:text-accent transition-colors">
                  +91 91456 87999
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-accent" />
                <a href="mailto:info@pjindustries.co.in" className="hover:text-accent transition-colors text-xs font-mono">
                  info@pjindustries.co.in
                </a>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center text-xs text-primary-light font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <span className="w-2 h-2 bg-primary-light rounded-full animate-ping mr-2"></span>
                  Factory Online Status: Active
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Outer Legal Information Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col items-center gap-6">
          <div className="w-full text-center text-xs text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p id="copyright-text">
              © {new Date().getFullYear()} PJ INDUSTRIES. All Rights Reserved. DOODHURJA (दुग्धऊर्जा) is a registered trademark of PJ Industries, Pune.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => setActiveTab('staff-login')} className="hover:text-white font-bold transition-colors">
                Staff Portal
              </button>
              <span>•</span>
              <button onClick={() => setActiveTab('admin-login')} className="hover:text-white font-bold transition-colors text-accent">
                Admin Control System
              </button>
            </div>
          </div>
          
          {/* Developer Credit Info in small, clean design */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[11px] text-stone-500 font-medium border-t border-stone-800/40 pt-4 w-full text-center">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-stone-400">Developer:</span>
              <span className="text-stone-300">Omkar Karande</span>
            </div>
            <span className="hidden sm:inline text-stone-700">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-stone-400">Contact:</span>
              <a href="tel:+919834534812" className="text-secondary hover:text-accent transition-colors font-semibold">9834534812</a>
            </div>
            <span className="hidden sm:inline text-stone-700">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-stone-400">Instagram:</span>
              <a href="https://instagram.com/omkarkarande12" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors">@omkarkarande12</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
