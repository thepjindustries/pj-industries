import React from 'react';
import { 
  Building, 
  MapPin, 
  Compass, 
  Award, 
  Cpu, 
  Target, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { AboutUsData } from '../db';

interface AboutProps {
  lang: 'en' | 'mr';
  aboutData: AboutUsData;
}

export default function About({ lang, aboutData }: AboutProps) {
  
  // High quality Unsplash imagery simulating the Ranjangaon factory
  const galleryPhotos = aboutData.productionPhotos && aboutData.productionPhotos.length > 0 
    ? aboutData.productionPhotos 
    : [
        {
          url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=500',
          captionEn: 'Steam cooker & pellet milling unit',
          captionMr: 'स्टीम कुकर आणि पेलेट मिलिंग युनिट'
        },
        {
          url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=500',
          captionEn: 'Automated twin-shaft extrusion system',
          captionMr: 'स्वयंचलित ट्विन-शाफ्ट एक्सट्रूजन'
        },
        {
          url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=500',
          captionEn: 'Quality control batch evaluation desk',
          captionMr: 'गुणवत्ता नियंत्रण मापन केंद्र'
        }
      ];

  // Raw grain processing sequence
  const processSteps = [
    { step: '01', titleEn: 'Magnetic Sorting', titleMr: 'चुंबकीय पृथक्करण', descEn: 'Raw Maize grains are passed over heavy magnetic drums to isolate debris.', descMr: 'कच्चा मका चुंबकीय यंत्रावरून फिरवला जातो जेणेकरून धातूचे कण वगळले जातील.' },
    { step: '02', titleEn: 'Twinpulverizing', titleMr: 'मशरिन पल्व्हरायझिंग', descEn: 'Grinding of elements to a highly refined particle micrometric diameter.', descMr: 'मका आणि तृणधान्ये सूक्ष्म कणांमध्ये बारीक वाटली जातात.' },
    { step: '03', titleEn: 'Steam Treatment', titleMr: 'वाफेवर प्रक्रिया', descEn: 'Pressurized injection of 120°C clean steam to gelatinize starch.', descMr: '१२० अंश सेल्सिअस तापमानावर धान्यातील स्टार्च सुयोग्य पाचक बनवला जातो.' },
    { step: '04', titleEn: 'Liquid Injection', titleMr: 'खनिज द्रव्ये मिश्रण', descEn: 'Automated spray of liquid vitamins, bypass lipids & minerals.', descMr: 'द्रवरूप जीवनसत्त्वे, पोषक तत्त्वे आणि लोहाचे सुयोग्य प्रमाणात फवारणी.' },
    { step: '05', titleEn: 'Pellet Stitching', titleMr: 'पेलेट आणि बॅग पॅकिंग', descEn: 'Heavy duty pressure compression into pellets followed by clean stitching.', descMr: 'थ्रेड पॅकिंगसह सुरक्षित ५० किलो बॅग्समध्ये पॅकेजिंग पूर्ण केले जाते.' }
  ];

  // Motion states
  const cardHover = { y: -6, scale: 1.01 };
  const transitionSettings = { type: 'spring', stiffness: 200, damping: 20 };

  return (
    <div className="bg-cream py-12 min-h-screen text-darkgray font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 1. INTRO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-black uppercase tracking-wider text-primary bg-white px-4 py-1.5 rounded-full border border-secondary/15 shadow-xs">
            {lang === 'en' ? 'CORPORATE PROFILE' : 'अधिकृत पार्श्वभूमी'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
            {lang === 'en' ? 'PJ Industries - Designing Better Dairy Future' : 'पी. जे. इंडस्ट्रीज - पशुधनाचा शाश्वत समृद्ध आधार'}
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full"></div>
          <p className="text-sm text-stone-500 leading-relaxed">
            {lang === 'en'
              ? 'Providing certified standard industrial cattle feed under brand Doodhurja since 2020 behind Yazaki, Ranjangaon MIDC Pune.'
              : '२०२० पासून रांजणगाव एमआयडीसी (पुणे) येथून दुग्धऊर्जा यशाचा मार्ग म्हणून कार्यरत अत्याधुनिक मका पेंड प्लांट.'}
          </p>
        </motion.div>

        {/* 2. CHRONOLOGY AND FOUNDATION DETAIL CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Timeline story (LEFT) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={cardHover}
            className="lg:col-span-7 bg-white border border-secondary/15 p-6 sm:p-10 rounded-3xl shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Clock className="h-5 w-5" />
                <span className="font-extrabold tracking-wider uppercase text-xs">Our Founding Story</span>
              </div>
              
              <h3 className="text-2xl font-serif font-black text-stone-900">
                {lang === 'en' ? 'The Journey of DOODHURJA (दुग्धऊर्जा)' : 'दुग्धऊर्जा ब्रँडचा यशस्वी प्रवास'}
              </h3>
              
              <p className="text-stone-600 text-sm leading-relaxed text-justify">
                {lang === 'en' ? aboutData.story : aboutData.storyMr}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-secondary/10 text-center mt-6">
              <div className="p-3.5 bg-cream/30 rounded-xl border border-secondary/10">
                <span className="text-primary font-black text-xl block">2020</span>
                <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">{lang === 'en' ? 'Foundation' : 'स्थापना वर्ष'}</span>
              </div>
              <div className="p-3.5 bg-cream/30 rounded-xl border border-secondary/10">
                <span className="text-primary font-black text-sm sm:text-base block truncate">Ranjangaon</span>
                <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">{lang === 'en' ? 'Location' : 'प्लांट पत्ता'}</span>
              </div>
              <div className="p-3.5 bg-cream/30 rounded-xl border border-secondary/10">
                <span className="text-primary font-black text-xl block">10,000+</span>
                <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">{lang === 'en' ? 'Farmers' : 'नोंदणीकृत शेतकरी'}</span>
              </div>
            </div>
          </motion.div>

          {/* Founder focusing card (RIGHT) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={cardHover}
            className="lg:col-span-5 bg-gradient-to-br from-primary to-[#2c1d18] text-cream p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden border border-secondary/20"
          >
            <div className="absolute top-0 right-0 w-44 h-44 bg-accent/5 rounded-full"></div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-accent">
                <Briefcase className="h-4.5 w-4.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">FOUNDER PROFILE</span>
              </div>

              {/* Bio details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl border-2 border-accent overflow-hidden bg-white shrink-0 shadow-md">
                    <img
                      referrerPolicy="no-referrer"
                      src={aboutData.founderPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"}
                      alt={aboutData.founderName || "Mr. Prashant Jagtap"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white font-serif">{aboutData.founderName}</h4>
                    <span className="text-xs text-accent font-bold block">Managing Director, Founder</span>
                  </div>
                </div>

                <p className="text-xs text-cream/80 leading-relaxed pt-1.5 text-justify">
                  {aboutData.founderBio}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-2 mt-6">
              <span className="text-[10px] text-accent font-black uppercase tracking-wider block">Corporate Mission</span>
              <p className="text-xs text-cream/90 leading-relaxed italic">
                "{lang === 'en' ? aboutData.mission : aboutData.missionMr}"
              </p>
            </div>
          </motion.div>

        </div>

        {/* 3. CORE MISSION & VISION BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-white border border-secondary/15 shadow-xs space-y-4"
          >
            <div className="p-3 bg-cream text-primary rounded-xl inline-block border border-secondary/15">
              <Target className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-serif font-black text-stone-900">
              {lang === 'en' ? 'Our Mission Outline' : 'आमचे ध्येय'}
            </h4>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed text-justify">
              {lang === 'en' ? aboutData.mission : aboutData.missionMr}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-white border border-secondary/15 shadow-xs space-y-4"
          >
            <div className="p-3 bg-[#8D6E63]/10 text-[#8D6E63] rounded-xl inline-block border border-secondary/10">
              <Compass className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-serif font-black text-stone-900">
              {lang === 'en' ? 'Our Vision Outline' : 'आमचे भविष्यकालीन उद्दिष्ट'}
            </h4>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed text-justify">
              {lang === 'en' ? aboutData.vision : aboutData.visionMr}
            </p>
          </motion.div>

        </div>

        {/* 4. ADVANCED PELLET MANUFACTURING TIMELINE PROCESS */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="text-sm font-black text-primary uppercase tracking-widest bg-white px-3.5 py-1 rounded-full border border-secondary/15 shadow-3xs inline-block">
              {lang === 'en' ? 'OUR MODERN HIGH-TECH PLANT' : 'कारखान्याची प्रगत उत्पादन साखळी'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-snug">
              {lang === 'en' ? 'Processing Maize Grains to Balanced Pellets' : 'स्टीम कुकिंग पशू खाद्य बनवण्याची शास्त्रशुद्ध पद्धत'}
            </h2>
          </motion.div>

          <p className="text-sm text-stone-500 text-center max-w-3xl mx-auto leading-relaxed">
            {aboutData.factoryDetails}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-4">
            {processSteps.map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                whileHover={{ y: -4 }}
                className="bg-white/70 p-6 rounded-2xl border border-secondary/15 space-y-3 hover:bg-white hover:shadow-md transition-all relative group"
              >
                <span className="text-2xl font-black text-primary/10 absolute top-3 right-4 group-hover:text-primary/20">
                  {item.step}
                </span>

                <div className="bg-primary text-accent w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm">
                  {item.step}
                </div>

                <h4 className="font-extrabold text-sm text-stone-900 group-hover:text-primary transition-colors">
                  {lang === 'en' ? item.titleEn : item.titleMr}
                </h4>

                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {lang === 'en' ? item.descEn : item.descMr}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 5. REGULATORY LICENSING CERTIFICATES BOARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-3xl border border-secondary/15 shadow-sm space-y-6"
        >
          <div className="text-center space-y-1.5">
            <h4 className="text-base font-black text-primary uppercase tracking-wider">{lang === 'en' ? 'TRUSTED CREDENTIALS' : 'शासकीय परवाने आणि प्रमाणपत्रे'}</h4>
            <div className="w-12 h-0.5 bg-accent mx-auto rounded-full"></div>
            <p className="text-xs text-stone-400">PJ Industries operates under 100% compliant agro-industrial frameworks</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData.certifications.map((cert, index) => (
              <motion.div
                whileHover={{ scale: 1.03 }}
                key={index}
                className="bg-cream/40 p-5 rounded-2xl border border-secondary/15 flex items-center space-x-3.5 hover:border-primary transition-colors cursor-pointer"
              >
                <div className="p-2.5 bg-white text-primary rounded-xl shrink-0 shadow-3xs border border-secondary/10">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-black">Verified Status</span>
                  <span className="text-xs font-black text-stone-700 leading-tight block">{cert}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 6. PHOTO GALLERY GRID */}
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-black text-primary uppercase tracking-wider">{lang === 'en' ? 'PRODUCTION SNAPSHOTS' : 'उत्पादन प्रक्रिया छायाचित्रे'}</h3>
            <p className="text-xs text-stone-400">Live snapshots of raw grains handling and warehousing behind Yazaki Factory</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {galleryPhotos.map((photo, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                key={index} 
                whileHover={{ scale: 1.02 }}
                className="group relative h-48 bg-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <img
                  referrerPolicy="no-referrer"
                  src={photo.url}
                  alt="Factory"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 to-transparent p-4 text-cream">
                  <p className="text-xs font-black font-sans leading-tight">
                    {lang === 'en' ? photo.captionEn : photo.captionMr}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
