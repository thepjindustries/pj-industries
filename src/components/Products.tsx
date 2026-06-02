import React, { useState } from 'react';
import { 
  Search, 
  Tag, 
  Check, 
  HelpCircle, 
  Coffee, 
  ShoppingBag, 
  Share2, 
  PhoneCall, 
  ChevronRight, 
  X, 
  Sparkles,
  Award,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ContactInquiry } from '../db';

interface ProductsProps {
  lang: 'en' | 'mr';
  products: Product[];
  onContactSubmit: (inquiry: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>) => void;
}

export default function Products({ lang, products, onContactSubmit }: ProductsProps) {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals & Interactive States
  const [activeZoomProduct, setActiveZoomProduct] = useState<Product | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const [isZoomLevel, setIsZoomLevel] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Inquiry form states
  const [inquiryForm, setInquiryForm] = useState({
    fullName: '',
    mobile: '',
    message: ''
  });

  const categories = ['All', 'High Lactation', 'XBreed Specialist', 'Heifer Growth'];

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(term) || p.nameMr.toLowerCase().includes(term);
    const descMatch = p.description.toLowerCase().includes(term) || p.descriptionMr.toLowerCase().includes(term);
    const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return (nameMatch || descMatch) && catMatch;
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleShare = (product: Product) => {
    const shareText = `Check out ${product.name} from PJ Industries on AI Studio! Price: ₹${product.price}. High quality cattle nutrition.`;
    navigator.clipboard.writeText(window.location.href);
    triggerToast(lang === 'en' 
      ? 'Product link copied to clipboard!' 
      : 'उत्पादनाची माहिती सोशल लिंकसह कॉपी झाली आहे!'
    );
  };

  const generateWhatsAppLink = (product: Product) => {
    const text = encodeURIComponent(
      `नमस्ते PJ INDUSTRIES, मला आपल्या "${lang === 'en' ? product.name : product.nameMr}" या उत्पादनाबद्दल चौकशी करायची आहे.\n\n` +
      `किंमत: ₹${product.price} प्रति बॅग\n` +
      `कृपया माझ्याशी संपर्क साधावा. धन्यवाद!`
    );
    return `https://wa.me/919145687999?text=${text}`;
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.fullName || !inquiryForm.mobile) {
      alert(lang === 'en' ? 'Please supply your name and phone number.' : 'कृपया तुमचे नाव आणि मोबाईल नंबर भरा.');
      return;
    }

    if (inquiryProduct) {
      onContactSubmit({
        fullName: inquiryForm.fullName,
        mobile: inquiryForm.mobile,
        email: inquiryForm.fullName.toLowerCase().replace(/\s/g, '') + '@gmail.com',
        productInquiry: inquiryProduct.name,
        message: `${inquiryForm.message || 'Interested in buying.'} (Catalogs inquiry modal submitted)`
      });

      triggerToast(lang === 'en' 
        ? `Inquiry for ${inquiryProduct.name} submitted!` 
        : `${inquiryProduct.nameMr} ची चौकशी नोदवली गेली आहे!`
      );

      setInquiryForm({ fullName: '', mobile: '', message: '' });
      setInquiryProduct(null);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-12 text-darkgray font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="fixed bottom-5 right-5 z-50 bg-primary border border-white/20 text-cream rounded-2xl shadow-2xl px-6 py-4 flex items-center space-x-3 max-w-sm"
            >
              <div className="bg-accent text-stone-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                ✓
              </div>
              <span className="text-sm font-bold">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. SECTION INTRO AND BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <span className="text-xs font-black uppercase text-primary tracking-widest bg-white px-4 py-1.5 rounded-full border border-secondary/15 shadow-xs">
            {lang === 'en' ? 'DOODHURJA CATALOGUE' : 'दुग्धऊर्जा पशू खाद्य दालन'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
            {lang === 'en' ? 'Premium Balanced Nutrition Series' : 'सकस आणि संतुलित पोषण खाद्य श्रेणी'}
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full"></div>
          <p className="text-sm text-stone-500 leading-relaxed">
            {lang === 'en' 
              ? 'Our dynamic scientific formulations increase milk density fat (FAT) and SNF. Add healthy protein to your animals today.'
              : 'शास्त्रशुद्ध गुणधर्मांनी परिपूर्ण जेथे प्रत्येक बॅगमध्ये मिळेल भरपूर विटामिन्स, खनिज द्रव्ये आणि पोषक घटक.'}
          </p>
        </motion.div>

        {/* 2. DYNAMIC WORKSPACE COMPONENT CONTROLLER (SEARCH / FILTERS) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-secondary/15 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-12"
        >
          
          {/* Active search text box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'en' ? 'Search cattle feed, maize, cake...' : 'खाद्य, पेंड किंवा घटक शोधण्यासाठी टाईप करा...'}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-secondary/20 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15 text-darkgray"
            />
          </div>

          {/* Quick tab filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-cream shadow-md'
                    : 'bg-cream text-darkgray hover:bg-cream-dark'
                }`}
              >
                {cat === 'All' ? (lang === 'en' ? 'All Range' : 'सर्व प्रकार') : cat}
              </motion.button>
            ))}
          </div>

        </motion.div>

        {/* 3. PRODUCT CATALOG GRID */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-center py-20 rounded-3xl border-2 border-dashed border-secondary/25"
            >
              <ShoppingBag className="mx-auto h-16 w-16 text-stone-300 animate-bounce mb-3" />
              <h3 className="text-lg font-black text-stone-800">
                {lang === 'en' ? 'No products matches your search.' : 'या नावाने कोणतेही उत्पादन सापडले नाही.'}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'en' ? 'Try checking back with another name or category click.' : 'कृपया इतर कीवर्ड वापरून पुन्हा प्रयत्न करा.'}
              </p>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map((prod) => (
                <motion.div 
                  key={prod.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  id={`cat-prod-${prod.id}`}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden border border-secondary/15 hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                >
                  {/* Image layout with label */}
                  <div className="h-64 relative bg-stone-50 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Quick Zoom button trigger */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setActiveZoomProduct(prod);
                        setIsZoomLevel(false);
                      }}
                      className="absolute top-4 left-4 bg-white/95 text-stone-700 hover:text-primary p-2.5 rounded-xl shadow-md backdrop-blur-xs transition-transform"
                      title="Zoom Details"
                    >
                      <Maximize2 className="h-4.5 w-4.5" />
                    </motion.button>

                    <div className="absolute top-4 right-4 bg-accent text-stone-900 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 border border-white/20">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{prod.category}</span>
                    </div>

                    {prod.status === 'Out of Stock' && (
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center backdrop-blur-xs z-10">
                        <span className="bg-red-650 text-white font-black text-xs px-4 py-2.5 rounded-xl tracking-wider uppercase border border-white/20 shadow-md">
                          {lang === 'en' ? 'Out of Stock' : 'सध्या उपलब्ध नाही'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <h3 className="text-xl font-serif font-black text-stone-900 group-hover:text-primary transition-colors leading-tight">
                        {lang === 'en' ? prod.name : prod.nameMr}
                      </h3>

                      <p className="text-xs sm:text-sm text-stone-500 leading-relaxed line-clamp-3">
                        {lang === 'en' ? prod.description : prod.descriptionMr}
                      </p>

                      {/* Compact list advantages */}
                      <div className="pt-2 space-y-1.5">
                        {(lang === 'en' ? prod.advantages.slice(0, 2) : prod.advantagesMr.slice(0, 2)).map((adv, aIdx) => (
                          <div key={aIdx} className="flex items-center space-x-2 text-xs text-stone-600 font-medium">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate">{adv}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational and contact shortcuts */}
                    <div className="space-y-3.5 pt-4 border-t border-secondary/10">
                      
                      {/* Price and dynamic inquiry */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-black block">Retail Price</span>
                          <span className="text-2xl font-black text-primary font-mono">
                            ₹{prod.price} <span className="text-xs font-bold text-stone-400">/ 50kg</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShare(prod)}
                            className="p-3 rounded-xl border border-secondary/20 text-stone-600 hover:bg-cream hover:text-stone-900 transition-all"
                            title="Share Product"
                          >
                            <Share2 className="h-4 w-4" />
                          </motion.button>
                          
                          <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={generateWhatsAppLink(prod)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs hover:bg-emerald-700 transition-all font-black text-xs flex items-center space-x-1"
                          >
                            <span>WA Inquiry</span>
                          </motion.a>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setInquiryProduct(prod)}
                        className="w-full h-11 bg-button text-white font-black rounded-xl text-xs uppercase tracking-wide flex items-center justify-center space-x-2 shadow-md hover:brightness-110"
                      >
                        <PhoneCall className="h-4 w-4" />
                        <span>{lang === 'en' ? 'Submit Inquiry Form' : 'कारखान्यामध्ये थेट चौकशी करा'}</span>
                      </motion.button>

                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. DETAILS BANNER AND ZOOM IMAGE VIEW DIALOG */}
        <AnimatePresence>
          {activeZoomProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="zoom-modal" 
              className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 flex items-center justify-center p-4 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-secondary/20"
              >
                
                {/* Close Button Anchor */}
                <button
                  onClick={() => {
                    setActiveZoomProduct(null);
                    setIsZoomLevel(false);
                  }}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white transition-all shadow-md"
                >
                  <X className="h-5.5 w-5.5" />
                </button>

                <div className="overflow-y-auto p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Dynamic Zoom Image Side Frame */}
                    <div className="md:col-span-12 lg:col-span-5 space-y-4">
                      <div 
                        className="relative h-64 sm:h-80 bg-stone-50 rounded-2xl overflow-hidden cursor-zoom-in group border border-secondary/10"
                        onClick={() => setIsZoomLevel(!isZoomLevel)}
                      >
                        <img
                          src={activeZoomProduct.image}
                          alt="Product Zoom Feed"
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            isZoomLevel ? 'scale-160' : 'scale-100 group-hover:scale-105'
                          }`}
                        />
                        <div className="absolute bottom-3 left-3 bg-stone-900/70 text-cream text-[9px] font-black px-2.5 py-1.5 rounded-lg backdrop-blur-xs uppercase tracking-wide">
                          {isZoomLevel ? 'Click to Standard' : 'Click to Double Zoom'}
                        </div>
                      </div>

                      <div className="bg-accent/15 p-4 rounded-xl border border-accent/40 text-center">
                        <span className="text-[10px] uppercase tracking-wider text-amber-900 font-extrabold block">B2B Dealership Price</span>
                        <p className="text-xs sm:text-sm font-bold text-darkgray leading-relaxed mt-0.5">
                          {lang === 'en' ? 'Direct factory discounts on tons-orders!' : 'घाऊक ऑर्डरवर विशेष विशेष सूट!'}
                        </p>
                      </div>
                    </div>

                    {/* Informational Rich Content Side */}
                    <div className="md:col-span-12 lg:col-span-7 space-y-5">
                      <div>
                        <span className="inline-block bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-primary/20 mb-2">
                          {activeZoomProduct.category}
                        </span>
                        <h3 className="text-2xl font-serif font-black text-stone-900 leading-tight">
                          {lang === 'en' ? activeZoomProduct.name : activeZoomProduct.nameMr}
                        </h3>
                        <div className="flex items-center space-x-3.5 mt-2.5">
                          <span className="text-2xl font-black text-primary font-mono">₹{activeZoomProduct.price} <span className="text-xs font-bold text-stone-400">/ Bag</span></span>
                          <span className="text-xs text-primary font-extrabold bg-primary/10 px-3 py-1 rounded-full border border-primary/25">
                            {activeZoomProduct.status === 'Available' ? 'Available' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5 border-b pb-1 border-secondary/10">
                            {lang === 'en' ? 'Description' : 'उत्पादनाविषयी माहिती'}
                          </h4>
                          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed text-justify">
                            {lang === 'en' ? activeZoomProduct.description : activeZoomProduct.descriptionMr}
                          </p>
                        </div>

                        {/* Advantages List */}
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2 border-b pb-1 border-secondary/10">
                            {lang === 'en' ? 'Key Advantages' : 'मुख्य फायदे'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(lang === 'en' ? activeZoomProduct.advantages : activeZoomProduct.advantagesMr).map((adv, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-xs text-stone-600 font-medium">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{adv}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-2 border-b pb-1 border-secondary/10">
                            {lang === 'en' ? 'Core Ingredients' : 'समाविष्ट घटक'}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(lang === 'en' ? activeZoomProduct.ingredients : activeZoomProduct.ingredientsMr).map((ing, idx) => (
                              <span key={idx} className="bg-cream text-darkgray text-[10px] font-black px-3   py-1.5 rounded-lg border border-secondary/20">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Usage Instructions */}
                        <div className="bg-cream/50 p-4 rounded-xl border border-secondary/20">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-secondary block mb-1">Feeding Instructions</span>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {lang === 'en' ? activeZoomProduct.usage : activeZoomProduct.usageMr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-4 border-t border-secondary/10">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setInquiryProduct(activeZoomProduct);
                            setActiveZoomProduct(null);
                          }}
                          className="flex-1 py-3 bg-button text-white hover:brightness-110 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all text-center"
                        >
                          {lang === 'en' ? 'Open Inquiry Form' : 'चौकशी अर्ज उघडा'}
                        </motion.button>
                        <motion.a
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          href={generateWhatsAppLink(activeZoomProduct)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-black text-xs uppercase tracking-wider text-center"
                        >
                          WhatsApp
                        </motion.a>
                      </div>

                    </div>

                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. INLINE PRODUCT INQUIRY FORM MODAL */}
        <AnimatePresence>
          {inquiryProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="inquiry-modal" 
              className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 flex items-center justify-center p-4 backdrop-blur-xs"
            >
              <motion.div 
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-secondary/15"
              >
                
                <button
                  onClick={() => setInquiryProduct(null)}
                  className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:bg-cream hover:text-stone-900"
                >
                  <X className="h-5.5 w-5.5" />
                </button>

                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider text-primary font-black block bg-cream px-3 py-1 rounded-full border border-secondary/15 w-fit mx-auto">
                      FACTORY DIRECT INQUIRY
                    </span>
                    <h3 className="text-lg font-black text-stone-900 mt-2.5 leading-tight font-serif">
                      {lang === 'en' ? 'Inquire: ' : 'चौकशी: '} {lang === 'en' ? inquiryProduct.name : inquiryProduct.nameMr}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1.5">
                      Please submit your mobile details to receive bulk rates.
                    </p>
                  </div>

                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Your Name' : 'तुमचे नाव'}
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.fullName}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, fullName: e.target.value })}
                        placeholder="e.g. Satish Patil"
                        className="w-full px-4 py-3 border border-secondary/20 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15 text-darkgray"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Mobile Number' : 'मोबाईल नंबर'}
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={inquiryForm.mobile}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, mobile: e.target.value })}
                        placeholder="e.g. 9145687999"
                        className="w-full px-4 py-3 border border-secondary/20 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15 text-darkgray"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                        {lang === 'en' ? 'Message' : 'संदेश / आवश्यकता'}
                      </label>
                      <textarea
                        rows={2}
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        placeholder="Specify bag count e.g. 50 bags"
                        className="w-full px-4 py-3 border border-secondary/20 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15 text-darkgray"
                      ></textarea>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="w-full py-3.5 bg-primary text-cream text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:brightness-110"
                    >
                      {lang === 'en' ? 'Request Instant Callback' : 'त्वरित मला कॉल करा'}
                    </motion.button>
                  </form>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
