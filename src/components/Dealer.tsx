import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, HelpCircle, FileCheck, Send, MapPin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbStore, DealerInquiry, Product, STATE_DISTRICTS } from '../db';

interface DealerProps {
  lang: 'en' | 'mr';
  products: Product[];
  onDealerSubmit: (inquiry: Omit<DealerInquiry, 'id' | 'submittedAt' | 'status'>) => void;
}

export default function Dealer({ lang, products, onDealerSubmit }: DealerProps) {
  // Application form states
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    mobile: '',
    email: '',
    address: '',
    state: 'Maharashtra',
    district: 'Pune',
    experience: '1-3 Years',
    interestedProduct: 'DOODHURJA Premium Cattle Feed (50 Bag)',
    message: ''
  });

  const [districtsList, setDistrictsList] = useState<string[]>(STATE_DISTRICTS['Maharashtra']);
  const [success, setSuccess] = useState(false);

  // Active state change updates district lists
  useEffect(() => {
    const districts = STATE_DISTRICTS[formData.state] || [];
    setDistrictsList(districts);
    if (districts.length > 0) {
      setFormData(prev => ({ ...prev, district: districts[0] }));
    }
  }, [formData.state]);

  const handleApplyDealer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.businessName || !formData.mobile) {
      alert(lang === 'en' ? 'Please fill out all required fields.' : 'कृपया सर्व आवश्यक रकाने भरा.');
      return;
    }

    onDealerSubmit({
      fullName: formData.fullName,
      businessName: formData.businessName,
      mobile: formData.mobile,
      email: formData.email || 'dealer@pjintel.com',
      address: formData.address,
      state: formData.state,
      district: formData.district,
      experience: formData.experience,
      interestedProduct: formData.interestedProduct,
      message: formData.message
    });

    setSuccess(true);
    setFormData({
      fullName: '',
      businessName: '',
      mobile: '',
      email: '',
      address: '',
      state: 'Maharashtra',
      district: 'Pune',
      experience: '1-3 Years',
      interestedProduct: 'DOODHURJA Premium Cattle Feed (50 Bag)',
      message: ''
    });

    setTimeout(() => {
      setSuccess(false);
    }, 7000);
  };

  const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Madhya Pradesh'];
  const experiences = ['No Experience', '1-3 Years', '3-5 Years', '5+ Years'];

  return (
    <div className="bg-cream py-12 min-h-screen text-darkgray font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary to-[#2C1D18] rounded-3xl p-8 sm:p-12 text-cream shadow-xl relative overflow-hidden border border-secondary/20"
        >
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full z-0 transform translate-x-20 -translate-y-20"></div>
          
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="bg-accent text-stone-900 font-extrabold text-[10px] md:text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-lg border border-white/20 shadow-sm inline-flex items-center space-x-1">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
              <span>{lang === 'en' ? 'EXPAND YOUR LOGISTICS BUSINESS' : 'महाराष्ट्रात व्यवसाय विस्तार करण्याची मोठी संधी'}</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black text-white leading-tight">
              {lang === 'en' ? 'Become Our Authorized Dealer' : 'दुग्धऊर्जा पशू खाद्याचे अधिकृत डीलरशिप मिळवा'}
            </h2>
            <p className="text-xs sm:text-sm text-cream/90 leading-relaxed max-w-2xl">
              {lang === 'en'
                ? 'Join PJ Industries family. We offer direct wholesale pricing, free farmer marketing canopy kits, printed booklets, and high-yielding local commissions.'
                : 'तुमच्या तालुक्यात कृषी केंद्र किंवा पशू खाद्य दुकान असल्यास आमच्यासोबत भागीदार व्हा. सर्वाधिक विक्री आणि शेतकऱ्यांच्या विश्वासू ब्रँडचे अधिकृत विक्रेता बना.'}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Support Requirements list (LEFT Column) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-6"
          >
            
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-secondary/15 shadow-sm space-y-6">
              <h4 className="text-base font-black text-stone-900 border-b pb-2">
                {lang === 'en' ? 'Dealership Privileges' : 'डीलरशिपचे काय फायदे आहेत ?'}
              </h4>

              <div className="space-y-5 text-sm text-stone-600">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0 border border-primary/20">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-black">Unrivaled wholesale margins</strong>
                    <span className="text-xs text-stone-500 leading-relaxed">Direct-from-factory pricing with high margins per ton of cattle feed ordered.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0 border border-primary/20">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-black">Zonal Area Protection</strong>
                    <span className="text-xs text-stone-500 leading-relaxed">Exclusive distributor rights inside your selected district block to prevent local cross-competitions.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0 border border-primary/20">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-black">Technical Training Kits</strong>
                    <span className="text-xs text-stone-500 leading-relaxed">Free scientific booklets mapping cattle fat expansion parameters, helping you educate local dairy networks.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4.5 bg-accent/15 rounded-2xl border border-accent/45 text-center text-xs">
              <span className="font-black text-amber-900 block uppercase tracking-wide mb-1">💬 Need help? Call Factory Line Directly:</span>
              <a href="tel:+919145687999" className="font-extrabold text-sm text-stone-900 hover:underline">+91 91456 87999</a>
            </div>

          </motion.div>

          {/* Dealership submission form (RIGHT Column) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-secondary/15 shadow-md space-y-6"
          >
            <div>
              <h3 className="text-xl font-black text-stone-900 font-serif leading-tight">
                {lang === 'en' ? 'B2B Dealership Application' : 'अधिकृत डीलरशिप फॉर्म'}
              </h3>
              <p className="text-xs text-stone-400 mt-1">Please fill out this form; responses are reviewed inside 24 hours.</p>
            </div>

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
                      ? 'Submission received! Your franchise inquiry is saved in sales console.'
                      : 'डीलर अर्ज यशस्वीरीत्या नोंदवला गेला आहे! मुख्य व्यवस्थापक २४ तासात कागदपत्रांची तपासणी करतील.'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleApplyDealer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10"
                    placeholder={lang === 'en' ? 'Your Full Name' : 'तुमचे संपूर्ण नाव'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Business / Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10"
                    placeholder={lang === 'en' ? 'Shop or Enterprise Name' : 'व्यवसाय किंवा दुकानाचे नाव'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10"
                    placeholder={lang === 'en' ? '10-Digit Mobile Number' : '१० अंकी मोबाईल नंबर'}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10"
                    placeholder={lang === 'en' ? 'Email Address' : 'ईमेल पत्ता'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Select State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Select District / City</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {districtsList.map((dt) => (
                      <option key={dt} value={dt}>{dt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Experience in Agro-Feeds</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {experiences.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Product of Interest</label>
                  <select
                    value={formData.interestedProduct}
                    onChange={(e) => setFormData({ ...formData, interestedProduct: e.target.value })}
                    className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>{lang === 'en' ? p.name : p.nameMr}</option>
                    ))}
                    <option value="All Products Dealership">All Feed Series distribution</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Full Shop / Godown Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10 text-darkgray"
                  placeholder="Enter full physical address of godown or shop location."
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-stone-500 mb-1.5 tracking-wider">Message / Previous business details</label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border border-secondary/20 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/10 text-darkgray"
                  placeholder="Stating approximate monthly sales tone-load expectations if any."
                ></textarea>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full h-11 bg-button text-white font-black uppercase text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md hover:brightness-110 active:brightness-95 transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Request Dealership Franchise</span>
                </motion.button>
              </div>
            </form>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
