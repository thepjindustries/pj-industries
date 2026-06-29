import React, { useState } from 'react';
import { Menu, X, Landmark, Globe, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'mr';
  setLang: (lang: 'en' | 'mr') => void;
  currentStaff: any;
  currentAdmin: boolean;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  currentStaff,
  currentAdmin,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems = [
    { id: 'home', labelEn: 'Home', labelMr: 'मुख्यपृष्ठ' },
    { id: 'products', labelEn: 'Products', labelMr: 'उत्पादने' },
    { id: 'about', labelEn: 'About Us', labelMr: 'आमच्याबद्दल' },
    { id: 'dealer', labelEn: 'Become a Dealer', labelMr: 'डीलर व्हा' },
    { id: 'contact', labelEn: 'Contact Us', labelMr: 'संपर्क साधा' }
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <motion.div 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 shadow-md font-sans"
    >
      {/* Top Promotion / Information Bar */}
      <div 
        id="promo-header" 
        className="bg-primary text-cream px-6 py-2.5 flex flex-col sm:flex-row justify-between items-center text-xs border-b border-secondary/30 gap-1.5"
      >
        <span className="font-medium tracking-wide">
          GST NO: 27APIPJ3647P2Z8 | 📞 +91 91456 87999
        </span>
        <span className="italic font-bold font-serif text-accent">
          An ISO 9001:2015 Certified Company
        </span>
      </div>

      <header id="app-header" className="bg-cream/95 backdrop-blur-md border-b border-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Brand Section */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => handleNavClick('home')}
            >
              <div 
                id="company-logo" 
                className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center font-serif font-black text-accent text-2.5xl shadow-md border border-secondary overflow-hidden"
              >
                {!logoError ? (
                  <img 
                    src="/logo.jpeg" 
                    alt="PJ Logo" 
                    className="w-full h-full object-contain p-1 bg-white"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  "PJ"
                )}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-serif font-black text-primary tracking-tight leading-none uppercase">
                    PJ Industries
                  </span>
                  <span className="bg-button text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs leading-none">
                    GST REGISTERED
                  </span>
                </div>
                <h1 className="text-[10px] font-bold text-secondary tracking-wider leading-none uppercase mt-1">
                  {lang === 'en' ? 'DOODHURJA Cattle Feed' : 'दुग्धऊर्जा पशू खाद्य'}
                </h1>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav id="desktop-nav" className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-4 py-2 font-black text-sm transition-colors duration-300 ${
                      isActive ? 'text-primary' : 'text-darkgray hover:text-primary-light'
                    }`}
                  >
                    {lang === 'en' ? item.labelEn : item.labelMr}
                    {isActive && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-button rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}

              {/* Login Status Shortcuts */}
              {currentStaff && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  id="header-nav-staff"
                  onClick={() => handleNavClick('staff-dashboard')}
                  className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center space-x-1.5 text-primary hover:bg-primary/10 ${
                    activeTab === 'staff-dashboard' ? 'bg-primary/15 border border-primary/20' : ''
                  }`}
                >
                  <User className="h-4 w-4 text-primary" />
                  <span>{lang === 'en' ? 'Dashboard' : 'डॅशबोर्ड'}</span>
                </motion.button>
              )}

              {currentAdmin && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  id="header-nav-admin"
                  onClick={() => handleNavClick('admin-dashboard')}
                  className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center space-x-1.5 text-secondary hover:bg-secondary/10 ${
                    activeTab === 'admin-dashboard' ? 'bg-secondary/15 border border-secondary/20' : ''
                  }`}
                >
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  <span>{lang === 'en' ? 'Admin Portal' : 'अ‍ॅडमिन पोर्टल'}</span>
                </motion.button>
              )}

              {/* Default Login Tabs */}
              {!currentStaff && !currentAdmin && (
                <div className="flex items-center space-x-2 pl-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    id="nav-staff-login"
                    onClick={() => handleNavClick('staff-login')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
                      activeTab === 'staff-login' 
                        ? 'bg-primary text-cream shadow-md' 
                        : 'text-darkgray hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {lang === 'en' ? 'Staff' : 'स्टाफ'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    id="nav-admin-login"
                    onClick={() => handleNavClick('admin-login')}
                    className={`px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all ${
                      activeTab === 'admin-login' 
                        ? 'bg-button text-white shadow-md' 
                        : 'text-darkgray hover:bg-secondary/10 hover:text-secondary'
                    }`}
                  >
                    {lang === 'en' ? 'Admin' : 'अ‍ॅडमिन'}
                  </motion.button>
                </div>
              )}

              {/* Active user status signouts */}
              {(currentStaff || currentAdmin) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  id="header-signout-btn"
                  onClick={onLogout}
                  className="ml-2 px-3 py-1.5 text-xs font-black uppercase text-button border border-button/45 hover:bg-button/10 rounded-lg transition-transform"
                >
                  {lang === 'en' ? 'Sign Out' : 'लॉग आउट'}
                </motion.button>
              )}
            </nav>

            {/* Action buttons (Language Switcher) */}
            <div className="hidden lg:flex items-center space-x-3 ml-4 border-l pl-4 border-secondary/20">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                id="lang-selector-btn"
                onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-secondary text-xs font-bold text-darkgray hover:bg-cream bg-white shadow-xs"
              >
                <Globe className="h-4.5 w-4.5 text-primary" />
                <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
              </motion.button>
            </div>

            {/* Mobile Menu & Language Toggle buttons */}
            <div className="flex items-center space-x-2 lg:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                id="mobile-lang-btn"
                onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-extrabold bg-primary text-cream flex items-center space-x-1"
              >
                <Globe className="h-3.5 w-3.5 text-accent animate-spin-slow" />
                <span>{lang === 'en' ? 'मराठी' : 'EN'}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-darkgray hover:bg-secondary/15"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>

          </div>
        </div>
      </header>

      {/* Animated Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            id="mobile-drawer" 
            className="lg:hidden bg-cream border-t border-secondary/20 shadow-lg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`mob-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold ${
                    activeTab === item.id
                      ? 'bg-primary text-cream shadow-xs'
                      : 'text-darkgray hover:bg-secondary/10'
                  }`}
                >
                  {lang === 'en' ? item.labelEn : item.labelMr}
                </button>
              ))}

              <hr className="border-secondary/20 my-3" />

              {currentStaff && (
                <button
                  id="mob-nav-staff-dash"
                  onClick={() => handleNavClick('staff-dashboard')}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold text-primary hover:bg-primary/10 ${
                    activeTab === 'staff-dashboard' ? 'bg-primary/10 font-black border-l-4 border-primary' : ''
                  }`}
                >
                  📊 {lang === 'en' ? 'Staff Panel' : 'स्टाफ डॅशबोर्ड'} ({currentStaff.fullName})
                </button>
              )}

              {currentAdmin && (
                <button
                  id="mob-nav-admin-dash"
                  onClick={() => handleNavClick('admin-dashboard')}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold text-secondary hover:bg-secondary/10 ${
                    activeTab === 'admin-dashboard' ? 'bg-secondary/10 font-black border-l-4 border-secondary' : ''
                  }`}
                >
                  ⚙️ {lang === 'en' ? 'Admin Portal' : 'अॅडमिन पोर्टल'}
                </button>
              )}

              {!currentStaff && !currentAdmin && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    id="mob-nav-staff-login"
                    onClick={() => handleNavClick('staff-login')}
                    className="px-4 py-3 text-center bg-cream border border-primary rounded-xl text-sm font-black text-primary"
                  >
                    {lang === 'en' ? 'Staff Login' : 'स्टाफ लॉगिन'}
                  </button>
                  <button
                    id="mob-nav-admin-login"
                    onClick={() => handleNavClick('admin-login')}
                    className="px-4 py-3 text-center bg-cream border border-button rounded-xl text-sm font-black text-button"
                  >
                    {lang === 'en' ? 'Admin Login' : 'अ‍ॅडमिन लॉगिन'}
                  </button>
                </div>
              )}

              {(currentStaff || currentAdmin) && (
                <button
                  id="mob-nav-signout"
                  onClick={onLogout}
                  className="w-full text-center mt-3 py-3 text-sm font-bold text-button bg-button/10 hover:bg-button/20 rounded-xl"
                >
                  {lang === 'en' ? 'Sign Out / Logout' : 'लॉग आउट करा'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
