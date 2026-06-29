import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MapPin, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Heart, 
  Compass, 
  Sparkles, 
  Milk,
  ChevronLeft,
  ChevronRight,
  Send,
  Building,
  Users,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbStore, Product, ContactInquiry, AboutUsData, FarmerFeedback } from '../db';

interface HomeProps {
  lang: 'en' | 'mr';
  setActiveTab: (tab: string) => void;
  onContactSubmit: (inquiry: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>) => void;
  products: Product[];
  aboutData?: AboutUsData;
}

export default function Home({ lang, setActiveTab, onContactSubmit, products, aboutData }: HomeProps) {
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultImages = [
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=1200'
  ];

  const heroImages = aboutData?.heroPhotos && aboutData.heroPhotos.length > 0
    ? aboutData.heroPhotos
    : (aboutData?.heroPhoto ? [aboutData.heroPhoto] : defaultImages);

  const slides = heroImages.map((img, idx) => {
    if (idx === 0) {
      return {
        titleEn: 'Natural Cattle Wellness',
        titleMr: 'निरोगी पशुधन, आरोग्यदायी दूध!',
        subtitleEn: 'DOODHURJA Cattle Feed - Re-engineered for Higher Milk Fat and Health.',
        subtitleMr: 'दुग्धऊर्जा पशू खाद्य - संपूर्ण समतोल पोषण आणि भरघोस दूध वाढीची विश्वसनीय हमी!',
        image: img
      };
    } else if (idx === 1) {
      return {
        titleEn: 'Boost Milk Quality & Yield',
        titleMr: 'तुमच्या गाईंचं दूध वाढवा आजच!',
        subtitleEn: 'Increase fat percent and daily milk yield in crossbred cows in just 7 days.',
        subtitleMr: 'तुमच्या दुभत्या जनावरांचे दूध आणि फॅट गॅरंटीड वाढवा.',
        image: img
      };
    } else if (idx === 2) {
      return {
        titleEn: 'Balanced Feeding Science',
        titleMr: 'शेतकऱ्यांचा नंबर १ विश्वासू सोबती!',
        subtitleEn: 'Manufactured with high-tech steam-cooking machinery in Ranjangaon MIDC.',
        subtitleMr: 'रांजणगाव एमआयडीसी पुणे येथे प्रगत स्टीम कुकरद्वारे बनविलेले दर्जेदार मका पेंड.',
        image: img
      };
    } else {
      return {
        titleEn: 'Direct Factory Premium Feed',
        titleMr: 'थेट कारखान्यातून अस्सल गुणवत्ता!',
        subtitleEn: '100% pure balanced cattle feed direct high throughput steam cooked.',
        subtitleMr: 'शुद्ध आणि प्रगत तंत्रज्ञानाने शिजवलेले पशू खाद्य थेट तुमच्या दारी.',
        image: img
      };
    }
  });

  // Auto Slider Effect
  useEffect(() => {
    if (slides.length <= 1) {
      setCurrentSlide(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Quick Query Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    city: '',
    productInquiry: 'DOODHURJA Premium Cattle Feed (50 Bag)',
    message: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Farmer Feedback Form State & DB list
  const [dbFeedbacks, setDbFeedbacks] = useState<FarmerFeedback[]>([]);
  const [feedbackForm, setFeedbackForm] = useState({
    fullName: '',
    mobile: '',
    village: '',
    district: '',
    rating: 5,
    review: ''
  });
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  const loadFeedbacks = async () => {
    try {
      const list = await dbStore.getList<FarmerFeedback>('feedbacks', []);
      setDbFeedbacks(list);
    } catch (e) {
      console.error("Error loading feedbacks", e);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, mobile, village, district, rating, review } = feedbackForm;
    if (!fullName || !mobile || !village || !district || !review) {
      alert(lang === 'en' ? 'Please fill in all fields.' : 'कृपया सर्व रकाने काळजीपूर्वक भरा.');
      return;
    }
    
    const id = `fb-${Date.now()}`;
    const newFeedback: FarmerFeedback = {
      id,
      fullName,
      mobile,
      village,
      district,
      rating: Number(rating) || 5,
      review,
      submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    };

    await dbStore.saveItem<FarmerFeedback>('feedbacks', id, newFeedback, []);
    setFeedbackSuccessMsg(lang === 'en' 
      ? 'Thank you! Your feedback has been registered.' 
      : 'धन्यवाद! तुमचा मूल्यवान अभिप्राय यशस्वीरीत्या नोंदवला गेला आहे.'
    );

    // Refresh feedback list
    loadFeedbacks();

    // Reset Form
    setFeedbackForm({
      fullName: '',
      mobile: '',
      village: '',
      district: '',
      rating: 5,
      review: ''
    });

    setTimeout(() => {
      setFeedbackSuccessMsg('');
    }, 5000);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.city) {
      alert(lang === 'en' ? 'Please complete all required fields.' : 'कृपया सर्व आवश्यक रकाने भरा.');
      return;
    }
    
    onContactSubmit({
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.fullName.toLowerCase().replace(/\s/g, '') + '@gmail.com',
      productInquiry: formData.productInquiry,
      message: `${formData.message} | Location: ${formData.city}`
    });

    setSuccessMsg(lang === 'en' 
      ? 'Inquiry submitted successfully! Our representative will call you in 2 hours.' 
      : 'चौकशी यशस्वीरीत्या नोंदवली गेली आहे! आमचे प्रतिनिधी २ तासांत आपल्याशी संपर्क साधतील.'
    );

    setFormData({
      fullName: '',
      mobile: '',
      city: '',
      productInquiry: 'DOODHURJA Premium Cattle Feed (50 Bag)',
      message: ''
    });

    setTimeout(() => {
      setSuccessMsg('');
    }, 5000);
  };

  // Product Advantages List
  const advantages = [
    {
      icon: <Milk className="h-8 w-8 text-primary" />,
      titleEn: 'Balanced Nutrition',
      titleMr: 'संतुलित आहार पोषण',
      descEn: 'Perfect ratio of maize, proteins, bypassing fats and macro-nutrients.',
      descMr: 'मका, प्रथिने, विटामिन्स आणि कॅल्शियमचे योग्य व संतुलित शास्त्रीय प्रमाण.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-[#8D6E63]" />,
      titleEn: 'Fast Results',
      titleMr: 'जलद आणि खात्रीशीर निकाल',
      descEn: 'Noticeable milk quantity and fat thickness improvements within 7 days.',
      descMr: 'सुरू केल्यावर अवघ्या ७ दिवसात दुधाचे प्रमाण आणि फॅट मध्ये स्पष्ट वाढ दिसू लागते.'
    },
    {
      icon: <Award className="h-8 w-8 text-[#8D6E63]" />,
      titleEn: 'Trusted Quality',
      titleMr: 'विश्वासू आणि दर्जेदार',
      descEn: 'Lab certified ingredients manufactured behind Yazaki Factory.',
      descMr: 'रांजणगाव प्लांटमध्ये कठोर गुणवत्ता नियंत्रणाखाली उत्पादित १००% दर्जेदार.'
    },
    {
      icon: <Compass className="h-8 w-8 text-primary" />,
      titleEn: 'Better Digestion',
      titleMr: 'उत्तम पचनशक्ती',
      descEn: 'Enriched with active yeast cultures which boost cattle dietary transit.',
      descMr: 'सक्रिय यीस्ट कल्चर आणि सुलभ पाचक घटकांमुळे अपचनाचे आजार टाळतात.'
    },
    {
      icon: <Sparkles className="h-8 w-8 text-[#8D6E63]" />,
      titleEn: 'Guaranteed Milk Increase',
      titleMr: 'भरघोस दुधात वाढ',
      descEn: 'Builds sustained peak lactation curves for crossbred cows and buffaloes.',
      descMr: 'गाई आणि म्हशींच्या कमाल दूध उत्पादन क्षमतेत दीर्घकाळ वाढ कायम राहते.'
    },
    {
      icon: <Heart className="h-8 w-8 text-accent" />,
      titleEn: 'Immunity & Vitality',
      titleMr: 'रोगप्रतिकारक शक्ती वाढ',
      descEn: 'Stronger bone structures, stable calves growth and shorter dry cycles.',
      descMr: 'कॅल्शियममुळे जनावरांची हाडे बळकट होतात आणि प्रजनन क्षमता वाढते.'
    }
  ];

  // Why Choose Us list
  const reasonsList = [
    { textEn: '100% Organic & Chemical-Free processing standard', textMr: '१००% नैसर्गिक आणि रसायनमुक्त प्रक्रिया' },
    { textEn: 'Manufactured with state-of-the-art steam boilers', textMr: 'अत्याधुनिक स्टीम बॉयलरद्वारे निर्जंतुक प्रक्रिया' },
    { textEn: 'Highly affordable factor-direct agricultural pricing', textMr: 'थेट कारखान्यातून येत असल्याने वाजवी व रास्त दर' },
    { textEn: 'Developed under guidance of veterinary doctors', textMr: 'तज्ञ पशुवैद्यकांच्या देखरेखीखाली बनवलेले विशेष सूत्र' }
  ];

  const testimonials = [
    {
      name: 'Balasaheb Thorat',
      city: 'Ranjangaon MIDC Area',
      textEn: 'Since shifting to Doodhurja Premium, our cows average FAT improved from 3.8 to 4.4 effortlessly! Incredible local product.',
      textMr: 'दुग्धऊर्जा सुरू केल्यावर फक्त ८ दिवसात आमच्या जर्सी गायींचे दूध सकाळी २ लिटरने वाढले. फॅट पण ३.८ वरून ४.४ झाले आहे. खूप चांगला अनुभव आहे.'
    },
    {
      name: 'Ganesh Shinde',
      city: 'Shirur Zonal Area',
      textEn: 'Very easy digestion. Calves love the Growth Booster pellet. Highly recommended to all fellow progressive farmers.',
      textMr: 'पचनक्रिया खूप चांगली राहते, गाई चारा पण व्यवस्थित खातात. कालवड बूस्टर देखील कालवडीच्या जलद वाढीसाठी अत्यंत योग्य आहे.'
    }
  ];

  // Animation Variants
  const fadeInUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="bg-cream min-h-screen text-darkgray font-sans select-none">
      
      {/* 1. HERO SLIDER SECTION */}
      <section id="hero-slider" className="relative h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] bg-stone-950 overflow-hidden shadow-xl border-b border-secondary/20">
        <AnimatePresence mode="wait">
          {slides.map((slide, idx) => (
            idx === currentSlide && (
              <div key={idx} className="absolute inset-0 flex items-center justify-center">
                {/* 1a. Background Image Overlay spanning the full section perfectly for all resolution fits */}
                <motion.img
                  initial={{ scale: 1.05, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={slide.image}
                  alt="Cattle Feed Banner"
                  className="absolute inset-0 w-full h-full object-cover object-center z-0"
                  referrerPolicy="no-referrer"
                />

                {/* 1b. Translucent color shader for high text contrast */}
                <div className="absolute inset-0 bg-black/55 z-10"></div>
                
                {/* Slide Content */}
                <div className="absolute inset-0 z-20 flex items-center py-4 md:py-0 overflow-y-auto">
                  <div className="max-w-4xl mx-auto px-4 sm:px-12 w-full text-center text-white space-y-2.5 sm:space-y-4 md:space-y-6 my-auto">
                    
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="inline-block bg-accent text-stone-900 font-extrabold tracking-widest text-[9px] sm:text-xs md:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full uppercase shadow-lg border border-white/20"
                    >
                      {lang === 'en' ? '★ DIRECT FROM FACTORY ★' : '★ थेट कारखान्यातून उत्तम ऑफर ★'}
                    </motion.span>

                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white drop-shadow-md leading-tight"
                    >
                      {lang === 'en' ? slide.titleEn : slide.titleMr}
                    </motion.h2>

                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="text-[11px] sm:text-sm md:text-base lg:text-lg text-stone-200 font-semibold max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none"
                    >
                      {lang === 'en' ? slide.subtitleEn : slide.subtitleMr}
                    </motion.p>

                    {/* Call-to-actions */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 pt-1 sm:pt-4"
                    >
                      <motion.a
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href="tel:+919145687999"
                        id="hero-call-now-btn"
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-button text-white font-black h-10 sm:h-14 rounded-xl shadow-lg border border-accent flex items-center justify-center space-x-2 sm:space-x-2.5 uppercase tracking-wider text-[11px] sm:text-xs hover:brightness-110 active:brightness-95 transition-all"
                      >
                        <Phone className="h-3.5 w-3.5 sm:h-5 sm:w-5 animate-pulse" />
                        <span>{lang === 'en' ? 'Call Now: 9145687999' : 'त्वरित फोन करा: ९१४५६८७९९९'}</span>
                      </motion.a>

                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('dealer')}
                        id="hero-dealer-inquiry-btn"
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-primary text-cream font-black h-10 sm:h-14 rounded-xl shadow-lg border border-secondary flex items-center justify-center space-x-2 sm:space-x-2.5 uppercase tracking-wider text-[11px] sm:text-xs hover:brightness-110 active:brightness-95 transition-all"
                      >
                        <span>{lang === 'en' ? 'Become a Dealer Today' : 'आमचे अधिकृत डीलर बना'}</span>
                      </motion.button>

                    </motion.div>

                  </div>
                </div>
              </div>
            )
          ))}
        </AnimatePresence>

        {/* Manual Slides Controllers */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors shadow-md backdrop-blur-xs flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors shadow-md backdrop-blur-xs flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Dynamic Dot Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-1.5 sm:space-x-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                  idx === currentSlide ? 'bg-accent w-5 sm:w-6 shadow-sm' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. ABOUT PRODUCT OVERVIEW SECTION */}
      <section id="product-overview" className="py-20 bg-cream border-b border-secondary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Frame */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 relative group px-2 sm:px-0"
            >
              <div className="absolute inset-0 bg-primary rounded-3xl transform rotate-3 group-hover:rotate-1 transition-transform shadow-lg"></div>
              <div className="relative bg-white p-3.5 sm:p-4 rounded-3xl shadow-xl border border-secondary-light/20 flex flex-col items-center">
                <img
                  src={aboutData?.productOverviewPhoto || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=500"}
                  alt="High quality cattle"
                  className="rounded-2xl w-full h-[230px] sm:h-[340px] object-cover filter brightness-95"
                />
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  className="absolute -bottom-4 right-4 sm:-bottom-5 sm:right-5 bg-accent text-stone-900 font-extrabold px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl shadow-xl border border-white text-xs sm:text-sm uppercase text-center"
                >
                  {lang === 'en' ? '★ Enriched with Vitamin AD3 ★' : '★ जीवनसत्त्वे समृद्ध मका पेंड ★'}
                </motion.div>
              </div>
            </motion.div>

            {/* Structured Pitch */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex items-center space-x-2 text-primary">
                <div className="h-1 w-12 bg-primary rounded-full"></div>
                <span className="text-sm font-black tracking-widest uppercase">{lang === 'en' ? 'NATURAL CATTLE WELLNESS' : 'नैसर्गिक पशुधन आरोग्य विज्ञान'}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
                {lang === 'en' 
                  ? 'Premium Maize Pellet Power For High-Yielding Milch Animals.'
                  : 'तुमच्या गाई आणि म्हशींसाठी अधिकृत दुग्धऊर्जा संतुलित मका पेंड.'}
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed text-justify">
                {lang === 'en'
                  ? 'DOODHURJA (दुग्धऊर्जा) is manufactured under advanced temperature-regulated steam treatment which gelatinizes raw starch for 300% faster animal digestion. Combining scientific formula design with 100% natural, chemical-free ingredients sourced directly from chosen Maharashtra farms, PJ Industries guarantees an immediate rise in milk solid fats (FAT & SNF) count within 7 to 10 days of starting.'
                  : 'दुग्धऊर्जा (Doodhurja) संतुलित मका पेंड ही प्रगत तापमान-नियंत्रित स्टीम प्रक्रियेद्वारे उत्पादित केली जाते, ज्यामुळे कच्च्या धान्याची पचनक्षमता ३००% वेगाने वाढते. तज्ज्ञ पशुवैद्यकांच्या मार्गदर्शनाखाली १००% नैसर्गिक आणि रसायनमुक्त घटकांपासून बनवलेली ही मका पेंड, अवघ्या ७ ते १० दिवसांत दुधाचे प्रमाण आणि फॅट (FAT & SNF) वाढवण्याची शाश्वत खात्री देते.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {reasonsList.map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-stone-700 text-xs sm:text-sm font-semibold">
                      {lang === 'en' ? reason.textEn : reason.textMr}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('products')}
                  className="px-6 py-3 bg-primary text-white font-black rounded-xl text-xs sm:text-sm shadow-md hover:brightness-110 active:brightness-95 transition-all uppercase tracking-wider"
                >
                  {lang === 'en' ? 'Explore Our Feed Range' : 'आमची उत्पादने पहा'}
                </motion.button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section id="why-choose-us" className="py-10 sm:py-16 bg-primary text-white overflow-hidden relative">
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl"></div>
 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-6 items-center">
            
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="space-y-3.5 sm:space-y-4"
            >
              <span className="inline-block text-accent text-[9px] sm:text-2xs font-extrabold tracking-widest uppercase bg-amber-955/20 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-accent/25">
                {lang === 'en' ? '★ UNMATCHED MANUFACTURING PRECISION' : '★ पी. जे. वरच विश्वास का?'}
              </span>

              <h2 className="text-2xl sm:text-4xl font-serif font-black leading-tight">
                {lang === 'en' 
                  ? 'Why 5000+ Progressive Milk Producers Trust PJ' 
                  : 'महाराष्ट्रातील ५००0+ प्रगतशील शेतकरी पी. जे. वरच का विश्वास ठेवतात?'}
              </h2>

              <p className="text-stone-200 text-xs sm:text-sm leading-relaxed text-justify">
                {lang === 'en'
                  ? 'Every feed bag produced inside PJ MIDC plot passes through robust manufacturing standards. We combine direct scientific formulation with 100% natural, premium maize grain products directly bought from Maharashtra farms. Progressive dairy farms trust us for uniform fat and milk solid improvements (FAT & SNF) within 7 to 10 days constraint.'
                  : 'आमच्या कारखान्यातील प्रत्येक पिशवीमध्ये सर्वोत्तम दर्जाची संतुलित मका पेंड उत्पादित केली जाते. आम्ही थेट शास्त्रशुद्ध फॉर्म्युला आणि १००% नैसर्गिक धान्यांचे परिपूर्ण मिश्रण वापरतो, ज्यामुळे गायी-म्हशींचे दूध व फॅट लक्षणीय वाढते.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white/5 p-3.5 sm:p-5 rounded-xl border border-white/10 text-center space-y-1.5 backdrop-blur-xs hover:border-accent/40 transition-colors animate-fade-in">
                  <ShieldCheck className="h-5 w-5 sm:h-7 sm:w-7 text-accent mx-auto" />
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-accent font-serif">100%</h4>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider text-stone-300 font-bold">{lang === 'en' ? 'Chemical Free Pellet' : 'रसायनमुक्त पशू खाद्य'}</p>
                </div>

                <div className="bg-white/5 p-3.5 sm:p-5 rounded-xl border border-white/10 text-center space-y-1.5 backdrop-blur-xs hover:border-accent/40 transition-colors animate-fade-in">
                  <Percent className="h-5 w-5 sm:h-7 sm:w-7 text-accent mx-auto" />
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-accent font-serif font-mono">5 Quality</h4>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider text-stone-300 font-bold">{lang === 'en' ? 'Lab Gates' : 'कठोर गुणवत्ता तपासणी'}</p>
                </div>

                <div className="bg-white/5 p-3.5 sm:p-5 rounded-xl border border-white/10 text-center space-y-1.5 backdrop-blur-xs hover:border-accent/40 transition-colors animate-fade-in">
                  <Award className="h-5 w-5 sm:h-7 sm:w-7 text-accent mx-auto" />
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-accent font-serif font-mono">ISO</h4>
                  <p className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-wider text-stone-300 font-bold">{lang === 'en' ? 'Certified Quality' : 'प्रमाणित प्रक्रिया'}</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 5. DYNAMIC PRODUCT GALLERY PREVIEW */}
      <section id="gallery" className="py-20 bg-cream-light border-b border-secondary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-3 mb-16"
          >
            <span className="text-primary font-black text-xs uppercase tracking-wider bg-white px-4 py-1.5 rounded-full border border-secondary-light/20 shadow-xs">
              {lang === 'en' ? 'GALLERY & RANGE' : 'दुग्धऊर्जा उत्पादन दालन'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
              {lang === 'en' ? 'Our High-Grade Animal Feed Range' : 'आमची उत्कृष्ट आणि बाजारात अव्वल पशू खाद्य श्रेणी'}
            </h2>
            <div className="w-16 h-1 bg-accent mx-auto rounded-full"></div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {products.slice(0, 3).map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{ y: -8 }}
                id={`product-card-${prod.id}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-secondary/15 flex flex-col group transition-all duration-300"
              >
                <div className="h-56 relative overflow-hidden bg-stone-100">
                  <img
                    referrerPolicy="no-referrer"
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550"
                  />
                  <span className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-2.5 py-1.5 rounded-lg shadow-md border border-white/10">
                    {prod.category}
                  </span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 group-hover:text-primary transition-colors font-serif">
                      {lang === 'en' ? prod.name : prod.nameMr}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 line-clamp-3 mt-1.5 leading-relaxed">
                      {lang === 'en' ? prod.description : prod.descriptionMr}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-secondary/10">
                    <span className="text-xl font-black text-primary font-mono">
                      ₹{prod.price} <span className="text-[10px] font-bold text-stone-400">/ Bag</span>
                    </span>
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-black uppercase text-button flex items-center space-x-1"
                    >
                      <span>{lang === 'en' ? 'View Details' : 'माहिती पहा'}</span>
                      <span>→</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* 6. BECOME A DEALER BANNER PANEL */}
      <section id="dealer-banner" className="bg-accent/15 border-y border-accent/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-r from-primary to-[#8D6E63] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full z-0 transform translate-x-16 -translate-y-16"></div>
            
            <div className="space-y-4 z-10 max-w-2xl text-center lg:text-left">
              <span className="bg-accent text-stone-950 text-[10px] md:text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-sm border border-white/10">
                {lang === 'en' ? 'B2B PARTNERSHIP OPPORTUNITY' : 'सुवर्ण व्यवसाय संधी'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black text-white leading-tight">
                {lang === 'en' ? 'Become Our Dealer Today!' : 'आमचे अधिकृत डीलर किंवा वितरक बना!'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-100/90 leading-relaxed">
                {lang === 'en'
                  ? 'Join PJ Industries expanding cattle nutrition channel. Enjoy high margin profits, direct technical support kits, and marketing materials for farmers.'
                  : 'तुमच्या तालुक्यात किंवा गावात दुग्धऊर्जा पशू खाद्याची एजन्सी घेऊन यशस्वी व्यवसाय सुरू करा. उच्च नफा आणि विनामूल्य डीलर मार्केटिंग बॅनर मिळवा.'}
              </p>
            </div>

            <div className="z-10 shrink-0 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('dealer')}
                id="apply-now-dealer-btn"
                className="w-full sm:w-auto px-8 py-4 bg-button text-white font-black rounded-xl text-sm border border-accent hover:brightness-110 active:brightness-95 transition-all shadow-lg uppercase tracking-wider"
              >
                {lang === 'en' ? 'Apply For Dealership Now' : 'डीलर बनण्यासाठी अर्ज करा'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. CONTACT QUICK INQUIRY FORM */}
      <section id="contact-form-section" className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-3xl border border-secondary/15 shadow-2xl p-8 sm:p-12 space-y-8 relative"
          >
            <div className="absolute top-0 left-12 transform -translate-y-1/2 bg-primary text-accent px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider shadow-md border border-secondary-light/30">
              {lang === 'en' ? 'QUICK ENQUIRY' : 'त्वरित चौकशी अर्ज'}
            </div>

            <div className="space-y-2 text-center pt-2">
              <h3 className="text-xl sm:text-3xl font-black text-stone-900 leading-tight">
                {lang === 'en' ? 'Connect Directly With Doodhurja Experts' : 'थेट आमचा संपर्क फॉर्म भरा'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-2xl mx-auto">
                {lang === 'en' 
                  ? 'Fill out this quick 1-minute form, and your inquiry will be logged directly to our admin sales executive.'
                  : 'खालील माहिती भरा, आमचे सेल्स अधिकारी तुम्हाला त्वरित योग्य दराची कोटेशन पाठवतील.'}
              </p>
            </div>

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-primary/10 border border-primary/30 text-primary text-sm font-bold rounded-xl flex items-center space-x-2 shadow-inner"
              >
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Your Full Name *' : 'तुमचे संपूर्ण नाव *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={lang === 'en' ? 'Your Full Name' : 'तुमचे संपूर्ण नाव'}
                    className="w-full px-4.5 py-3 border border-secondary/20 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Mobile Number *' : 'मोबाईल नंबर *'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder={lang === 'en' ? 'Mobile Number' : 'मोबाईल नंबर'}
                    className="w-full px-4.5 py-3 border border-secondary/20 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'City / Village *' : 'शहर / गाव *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={lang === 'en' ? 'City or Village' : 'शहर / गाव'}
                    className="w-full px-4.5 py-3 border border-secondary/20 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-600 uppercase tracking-wider mb-2">
                    {lang === 'en' ? 'Select Product For Inquiry' : 'चौकशी उत्पादन निवडा'}
                  </label>
                  <select
                    value={formData.productInquiry}
                    onChange={(e) => setFormData({ ...formData, productInquiry: e.target.value })}
                    className="w-full px-4.5 py-3 border border-secondary/20 rounded-xl text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {lang === 'en' ? p.name : p.nameMr}
                      </option>
                    ))}
                    <option value="General Dealership Inquiry">
                      {lang === 'en' ? 'General Dealership / Agency' : 'डीलरशिप / एजन्सी चौकशी'}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-600 uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Message / Special requirements' : 'तुमचा संदेश / आवश्यकता'}
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={lang === 'en' ? 'Enter how many bags you need or cattle quantity' : 'तुम्हाला एकूण किती पिशव्या हव्या आहेत किंवा जनावरांची संख्या नमूद करा'}
                  className="w-full px-4.5 py-3 border border-secondary/20 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-cream/15"
                ></textarea>
              </div>

              <div className="text-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  id="submit-quick-inquiry-btn"
                  className="w-full sm:w-auto px-10 py-4 bg-button text-white font-black rounded-xl text-sm shadow-lg hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center space-x-2 mx-auto uppercase tracking-wider"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>{lang === 'en' ? 'Submit Inquiry Now' : 'चौकशी अर्ज सबमिट करा'}</span>
                </motion.button>
              </div>

            </form>
          </motion.div>
        </div>
      </section>

      {/* 8. COMPACT TESTIMONIALS & FEEDBACK SECTION (Placed as requested at the very end of page & in small compact layout) */}
      <section id="testimonials" className="py-12 bg-white border-t border-secondary/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Compact list of farmer voices */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="inline-block text-[10px] font-extrabold tracking-widest text-[#2E7D32] uppercase bg-green-50 px-2.5 py-0.5 rounded-md border border-green-100">
                  {lang === 'en' ? 'FARMER VOICES' : 'शेतकऱ्यांचे मनोगत'}
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-black text-stone-900 leading-tight">
                  {lang === 'en' ? 'Tested and Loved By Progressive Milk Producers' : 'शेकडो समाधानी डेअरी युनिट्स आणि शेतकऱ्यांचे अभिप्राय'}
                </h3>
              </div>

              {/* Scrollable list/grid of testimonials with absolute compact heights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {[...testimonials, ...dbFeedbacks].map((test: any, index) => {
                  const fbName = test.fullName || test.name;
                  const fbCity = test.village ? `${test.village}, ${test.district}` : test.city;
                  const fbText = test.review || (lang === 'en' ? test.textEn : test.textMr);
                  const fbRating = test.rating || 5;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-cream p-3 rounded-xl border border-secondary-light/35 flex flex-col justify-between space-y-2 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <p className="italic text-stone-600 text-xs leading-relaxed text-justify">
                        "{fbText}"
                      </p>
                      <div className="flex items-center justify-between border-t border-secondary/10 pt-2 text-[11px]">
                        <div>
                          <span className="font-extrabold text-stone-800">{fbName}</span>
                          <span className="text-[10px] text-stone-400 flex items-center space-x-0.5">
                            <MapPin className="h-2.5 w-2.5 text-secondary shrink-0" />
                            <span>{fbCity}</span>
                          </span>
                        </div>
                        <div className="text-accent tracking-tighter text-[10px]">
                          {"★".repeat(fbRating)}
                          <span className="text-[9px] text-stone-400 font-bold ml-1">({fbRating}/5)</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Mini sleek inline feedback registration card */}
            <div className="lg:col-span-5 bg-cream/35 p-5 rounded-2xl border border-secondary/15 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-black text-stone-900 uppercase tracking-wide">
                  {lang === 'en' ? 'Share Your Success Review' : 'तुमचा अभिप्राय नोंदवा'}
                </h4>
                <p className="text-[11px] text-stone-500 leading-normal">
                  {lang === 'en' ? 'Help local Maharashtra farmers choose the right direct bypass maize pellet nutrients.' : 'दुग्धऊर्जा संतुलित पशू खाद्य वैशिष्ठ्ये किंवा इतर फायदे लिहून इतर दूध उत्पादक शेतकऱ्यांना मदत करा.'}
                </p>
              </div>

              {feedbackSuccessMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg flex items-start space-x-1.5 shadow-xs"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>{feedbackSuccessMsg}</span>
                </motion.div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      {lang === 'en' ? 'Your Name *' : 'तुमचे नाव *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={feedbackForm.fullName}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, fullName: e.target.value })}
                      placeholder={lang === 'en' ? 'Your Name' : 'तुमचे नाव'}
                      className="w-full px-3 py-1.5 border border-secondary/20 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      {lang === 'en' ? 'Mobile Number *' : 'मोबाईल नंबर *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={feedbackForm.mobile}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="e.g. 9834534812"
                      className="w-full px-3 py-1.5 border border-secondary/20 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      {lang === 'en' ? 'Village / Town *' : 'गाव / शहर *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={feedbackForm.village}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, village: e.target.value })}
                      placeholder={lang === 'en' ? 'Village Name' : 'गाव / शहर'}
                      className="w-full px-3 py-1.5 border border-secondary/20 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      {lang === 'en' ? 'District *' : 'जिल्हा *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={feedbackForm.district}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, district: e.target.value })}
                      placeholder={lang === 'en' ? 'e.g. Pune' : 'उदा. पुणे'}
                      className="w-full px-3 py-1.5 border border-secondary/20 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      {lang === 'en' ? 'Rating' : 'श्रेणी'}
                    </label>
                    <select
                      value={feedbackForm.rating}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-secondary/20 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value={5}>★★★★★ (5/5)</option>
                      <option value={4}>★★★★☆ (4/5)</option>
                      <option value={3}>★★★☆☆ (3/5)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <span className="text-[9px] text-[#2E7D32] bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100 font-bold block w-full text-center">
                      ✓ Verified Buyer
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    {lang === 'en' ? 'Review Text *' : 'अभिप्राय / प्रतिक्रिया *'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={feedbackForm.review}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, review: e.target.value })}
                    placeholder={lang === 'en' ? 'Doodhurja maize pellets showed excellent results on milk fats...' : 'दुग्धऊर्जा संतुलित मका पेंड वापरल्याने जनावरांचे दूध व फॅट वाढले...'}
                    className="w-full px-3 py-1.5 border border-secondary/20 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-transparent transition-all outline-hidden bg-white resize-none"
                  ></textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  id="submit-compact-feedback-btn"
                  className="w-full py-2.5 bg-button text-white font-black rounded-lg text-xs shadow-md hover:brightness-105 active:brightness-95 transition-all text-center uppercase tracking-widest"
                >
                  {lang === 'en' ? 'Submit Review' : 'अभिप्राय नोंदवा'}
                </motion.button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
