import React, { useState } from 'react';
import { Mail, Phone, MapPin, Landmark, Award, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactInquiry, Product } from '../db';

interface ContactProps {
  lang: 'en' | 'mr';
  products: Product[];
  onContactSubmit: (inquiry: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>) => void;
}

export default function Contact({ lang, products, onContactSubmit }: ContactProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    productInquiry: 'DOODHURJA Premium Cattle Feed (50 Bag)',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.email) {
      alert(lang === 'en' ? 'Please complete all required fields.' : 'कृपया सर्व आवश्यक रकाने भरा.');
      return;
    }

    onContactSubmit({
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      productInquiry: formData.productInquiry,
      message: formData.message
    });

    setSuccess(true);
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      productInquiry: 'DOODHURJA Premium Cattle Feed (50 Bag)',
      message: ''
    });

    setTimeout(() => {
      setSuccess(false);
    }, 6000);
  };

  return (
    <div className="bg-cream py-12 min-h-screen text-darkgray font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Intro */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="text-xs font-black uppercase text-primary tracking-widest bg-white px-4 py-1.5 rounded-full border border-secondary/15 shadow-3xs">
            {lang === 'en' ? 'CUSTOMER CARE HELPDESK' : 'ग्राहक सेवा केंद्र'}
          </span>
          <h2 className="text-3xl sm:text-4xl text-stone-900 font-serif font-black leading-tight">
            {lang === 'en' ? 'Connect with PJ Industries Support Team' : 'पी. जे. इंडस्ट्रीज ग्राहक सेवा'}
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full"></div>
          <p className="text-sm text-stone-500 leading-relaxed">
            {lang === 'en'
              ? 'Our dynamic sales team matches quotes within 2 hours. Drop a line if you have wholesale inquiries.'
              : 'घाऊक मका पेंड बॅग ऑर्डर्स किंवा वितरण एजन्सी हवी असल्यास आमचे प्रतिनिधी २४ तासांत मदत करतील.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Support Info Side Card (LEFT) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-6"
          >
            
            {/* Location mapping card */}
            <div className="bg-gradient-to-br from-primary to-[#2C1D18] text-cream p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden border border-secondary/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full"></div>
              
              <div className="space-y-2">
                <span className="text-[10px] text-accent font-black tracking-widest uppercase">OFFICE SPECIFICATION</span>
                <h3 className="text-xl font-black uppercase tracking-tight font-serif text-white">PJ INDUSTRIES UNIT</h3>
              </div>

              <div className="space-y-5 text-xs sm:text-sm">
                <div className="flex items-start space-x-3.5">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-cream/90">
                    <strong className="text-white">PLOT A63</strong>, Behind Yazaki Factory,<br />
                    Yash Inn Chowk, Ranjangaon MIDC,<br />
                    Pune – 412220, Maharashtra
                  </span>
                </div>

                <div className="flex items-center space-x-3.5">
                  <Phone className="h-4.5 w-4.5 text-accent shrink-0" />
                  <a href="tel:+919145687999" className="hover:underline font-black text-white text-base">
                    +91 91456 87999
                  </a>
                </div>

                <div className="flex items-center space-x-3.5">
                  <Mail className="h-4.5 w-4.5 text-accent shrink-0" />
                  <a href="mailto:info@pjindustries.co.in" className="hover:underline text-cream/90 font-mono">
                    info@pjindustries.co.in
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <span className="text-[10px] text-accent font-black uppercase tracking-wider block mb-1.5">Corporate Registration Code</span>
                <div className="bg-stone-900/40 p-3 rounded-xl border border-white/10 font-mono text-xs font-bold text-accent text-center">
                  GST NO: 27APIPJ3647P2Z8
                </div>
              </div>
            </div>

            {/* Quick trust metrics */}
            <div className="bg-white p-6 rounded-2xl border border-secondary/15 shadow-sm space-y-3.5 text-center">
              <span className="text-primary font-black text-xs block tracking-wider">★ FREE CONSULTATION ★</span>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed text-justify">
                {lang === 'en'
                  ? 'Our senior formulation scientists will design customized cattle schedules corresponding to your specific cows breed.'
                  : 'आमचे पशुवैद्यकीय तज्ञ पशुधनाच्या योग्य आरोग्यासाठी विनामूल्य आहार आराखडा बनवून देतील.'}
              </p>
            </div>

          </motion.div>

          {/* Form Interactive Side Board (RIGHT) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white p-8 rounded-3xl border border-secondary/15 shadow-md space-y-6"
          >
            <h3 className="text-xl font-black text-stone-900 font-serif border-b pb-2">
              {lang === 'en' ? 'Direct Customer Query Sheet' : 'थेट चौकशी व संपर्क अर्ज'}
            </h3>

            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-bold rounded-xl flex items-center space-x-2 shadow-inner"
                >
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span>
                    {lang === 'en' 
                      ? 'Thank you! Your inquiry has been forwarded directly to Ranjangaon MIDC admin unit.' 
                      : 'चौकशी अर्ज वेळेवर जमा झाला आहे! आमचे प्रतिनिधी लवकरच संपर्क करतील.'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10 text-darkgray"
                    placeholder={lang === 'en' ? 'Your Full Name' : 'तुमचे संपूर्ण नाव'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10 text-darkgray"
                    placeholder={lang === 'en' ? '10-Digit Mobile Number' : '१० अंकी मोबाईल नंबर'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10 text-darkgray"
                  placeholder={lang === 'en' ? 'Email Address' : 'ईमेल पत्ता'}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Product Inquiry Target</label>
                <select
                  value={formData.productInquiry}
                  onChange={(e) => setFormData({ ...formData, productInquiry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-secondary/20 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {lang === 'en' ? p.name : p.nameMr}
                    </option>
                  ))}
                  <option value="General Wholesale Query">General Inquiry / Feed Distribution</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Special message details *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10 text-darkgray"
                  placeholder="Please state how many cattle you own or bag expectations."
                ></textarea>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full h-11 bg-button text-white font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Inquiry</span>
                </motion.button>
              </div>
            </form>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
