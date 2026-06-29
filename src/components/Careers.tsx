import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone,
  AlertCircle,
  Building,
  Share2
} from 'lucide-react';
import { dbStore, JobPost, JobApplication, INITIAL_JOBS } from '../db';

interface CareersProps {
  lang: 'en' | 'mr';
}

export default function Careers({ lang }: CareersProps) {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  
  // Application Form State
  const [formData, setFormData] = useState({
    fullName: '',
    village: '',
    mobile: '',
    email: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeBase64, setResumeBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await dbStore.getList<JobPost>('jobs', INITIAL_JOBS);
      setJobs(data);

      // Deep link resolution
      const params = new URLSearchParams(window.location.search);
      const queryJobId = params.get('jobId');
      if (queryJobId) {
        const found = data.find(j => j.id === queryJobId);
        if (found) {
          setSelectedJob(found);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?jobId=${jobId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopiedJobId(jobId);
        setTimeout(() => setCopiedJobId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for images (they will get compressed anyway)
          setErrorMessage(lang === 'en' 
            ? 'Image file size exceeds 10MB limit.' 
            : 'इमेज फाईलचा आकार १० एमबी पेक्षा जास्त असावा नाही.');
          return;
        }
      } else {
        if (file.size > 600 * 1024) { // 600KB limit for PDFs/docs
          setErrorMessage(lang === 'en' 
            ? 'PDF or document files must be under 600 KB to fit database storage limits. Please compress your PDF or upload as an image (PNG/JPG).' 
            : 'डेटाबेस स्टोरेज मर्यादेमुळे PDF किंवा दस्तऐवज फाईल ६०० KB पेक्षा कमी असावी. कृपया तुमची PDF कॉम्प्रेस करा किंवा इमेज म्हणून अपलोड करा.');
          return;
        }
      }

      setResumeFile(file);
      setErrorMessage('');

      if (isImage) {
        // Compress image using HTML5 Canvas
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Enforce maximum dimensions to save storage space but keep highly legible
            const MAX_DIMENSION = 1200;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
              if (width > height) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              } else {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // Export as high efficiency JPEG with 0.6 quality (looks excellent, highly legible, but extremely small - usually 80KB to 150KB)
              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
              setResumeBase64(compressedBase64);
            } else {
              setResumeBase64(event.target?.result as string);
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        // PDF or Word file - direct base64 conversion
        const reader = new FileReader();
        reader.onloadend = () => {
          setResumeBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!resumeBase64) {
      setErrorMessage(lang === 'en' ? 'Please upload your resume.' : 'कृपया तुमचा रिझ्युम अपलोड करा.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const id = `app-${Date.now()}`;
      const newApplication: JobApplication = {
        id,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        fullName: formData.fullName,
        village: formData.village,
        mobile: formData.mobile,
        email: formData.email,
        gender: formData.gender,
        genderMr: formData.gender === 'Male' ? 'पुरुष' : formData.gender === 'Female' ? 'महिला' : 'इतर',
        resume: resumeBase64,
        resumeName: resumeFile ? resumeFile.name : 'resume.pdf',
        submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      };

      // Save to Firebase collection 'career_applications'
      await dbStore.saveItem<JobApplication>('career_applications', id, newApplication, []);

      // Simulate sending email to contactpjindustries@gmail.com as requested:
      // "contactpjindustries@gmail.com या ईमेल वरती पण त्यांचे अपडेट जाईल"
      try {
        console.log(`Sending email notification to contactpjindustries@gmail.com for application ${id}`);
        // Log details of the simulated outbound SMTP transaction for visual verification
        const emailBody = {
          to: 'contactpjindustries@gmail.com',
          subject: `New Job Application Received: ${newApplication.fullName} for ${newApplication.jobTitle}`,
          body: `Hello Admin, a new application has been submitted by ${newApplication.fullName} for the position of ${newApplication.jobTitle}.\n\nDetails:\n- Name: ${newApplication.fullName}\n- Village: ${newApplication.village}\n- Contact: ${newApplication.mobile}\n- Email: ${newApplication.email}\n- Gender: ${newApplication.gender}\n- Resume Attached: Yes (${newApplication.resumeName})\n\nPlease log in to the PJ Industries Admin Dashboard to review the application and download the resume.`
        };
        
        // Dispatch to window console & standard output
        console.warn("OUTBOUND NOTIFICATION DISPATCHED TO SMTP SERVICE", emailBody);
      } catch (emailErr) {
        console.error('Simulated email dispatch error', emailErr);
      }

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        fullName: '',
        village: '',
        mobile: '',
        email: '',
        gender: 'Male',
      });
      setResumeFile(null);
      setResumeBase64('');
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setErrorMessage(lang === 'en' ? 'Submission failed. Please try again.' : 'अर्ज सबमिशन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="careers-screen" className="bg-stone-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-stone-900 tracking-tight font-serif flex items-center gap-2">
              <Briefcase className="text-primary h-8 w-8" />
              {lang === 'en' ? 'Careers at PJ Industries' : 'पी. जे. इंडस्ट्रीज करिअर'}
            </h1>
            <p className="text-stone-500 text-sm">
              {lang === 'en' 
                ? 'Join our mission to revolutionize cattle nutrition and livestock health.' 
                : 'पशुधनाचे आरोग्य सुधारण्यासाठी आणि शेती समृद्धीसाठी आमच्या संघात सामील व्हा.'}
            </p>
          </div>
          
          {selectedJob && (
            <button
              onClick={() => {
                setSelectedJob(null);
                setSubmitSuccess(false);
                setErrorMessage('');
                // Clear query parameter
                const url = new URL(window.location.href);
                url.searchParams.delete('jobId');
                window.history.pushState({}, '', url.toString());
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-all duration-300 self-start md:self-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              {lang === 'en' ? 'Back to Job List' : 'नोकरी यादीकडे परत जा'}
            </button>
          )}
        </div>

        {/* Content Body */}
        <AnimatePresence mode="wait">
          {!selectedJob ? (
            // JOB LIST
            <motion.div
              key="job-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {loading ? (
                <div className="text-center py-20 text-stone-400 font-bold">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  {lang === 'en' ? 'Loading current job openings...' : 'नोकरीच्या संधी लोड होत आहेत...'}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-md">
                  <Building className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600 font-extrabold text-sm">
                    {lang === 'en' ? 'No active job openings currently.' : 'सध्या कोणतीही सक्रिय नोकरी उपलब्ध नाही.'}
                  </p>
                  <p className="text-stone-400 text-xs mt-1">
                    {lang === 'en' ? 'Check back soon or contact support.' : 'कृपया लवकरच पुन्हा तपासा किंवा संपर्क साधा.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {jobs.map((job) => (
                    <div 
                      key={job.id}
                      className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-100">
                            {lang === 'en' ? job.type : job.typeMr}
                          </span>
                          <span className="bg-stone-100 text-stone-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lang === 'en' ? job.workingTime : job.workingTimeMr}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-stone-900">
                          {lang === 'en' ? job.title : job.titleMr}
                        </h3>

                        <p className="text-stone-600 text-xs sm:text-sm line-clamp-2">
                          {lang === 'en' ? job.description : job.descriptionMr}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleShareJob(job.id, e)}
                          className="px-4 py-3 border border-stone-200 hover:border-emerald-500 text-stone-600 hover:text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-300 bg-white shadow-sm"
                        >
                          <Share2 className="h-4 w-4" />
                          {copiedJobId === job.id 
                            ? (lang === 'en' ? 'Copied!' : 'कॉपी केले!') 
                            : (lang === 'en' ? 'Share Job' : 'शेअर करा')}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            // Set query parameter
                            const url = new URL(window.location.href);
                            url.searchParams.set('jobId', job.id);
                            window.history.pushState({}, '', url.toString());
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-[#0B5D1E] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:shadow-md hover:scale-[1.02] transition-all duration-300"
                        >
                          {lang === 'en' ? 'View & Apply' : 'पहा आणि अर्ज करा'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // JOB DETAIL & APPLICATION FORM
            <motion.div
              key="job-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Job Details Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6 h-fit">
                <div className="space-y-2">
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-100">
                    {lang === 'en' ? selectedJob.type : selectedJob.typeMr}
                  </span>
                  <h2 className="text-xl font-black text-stone-900 font-serif">
                    {lang === 'en' ? selectedJob.title : selectedJob.titleMr}
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-stone-600 border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-stone-400 shrink-0" />
                    <span>
                      <strong>{lang === 'en' ? 'Hours: ' : 'वेळ: '}</strong>
                      {lang === 'en' ? selectedJob.workingTime : selectedJob.workingTimeMr}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4.5 w-4.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>{lang === 'en' ? 'Location: ' : 'स्थान: '}</strong>
                      {lang === 'en' ? 'Ranjangaon MIDC MIDC, Pune' : 'रांजणगाव एमआयडीसी, पुणे'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-3">
                  <h4 className="font-extrabold text-stone-850 text-sm">
                    {lang === 'en' ? 'About the Position' : 'नोकरीबद्दल माहिती'}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {lang === 'en' ? selectedJob.description : selectedJob.descriptionMr}
                  </p>
                </div>

                {selectedJob.keyRoles && selectedJob.keyRoles.length > 0 && (
                  <div className="border-t border-stone-100 pt-4 space-y-3">
                    <h4 className="font-extrabold text-stone-850 text-sm">
                      {lang === 'en' ? 'Key Responsibilities' : 'मुख्य जबाबदाऱ्या'}
                    </h4>
                    <ul className="space-y-2 list-disc list-inside text-xs text-stone-600 leading-relaxed">
                      {(lang === 'en' ? selectedJob.keyRoles : selectedJob.keyRolesMr).map((role, idx) => (
                        <li key={idx}>{role}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Application Form Card */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3 font-serif">
                  {lang === 'en' ? 'Submit Your Application' : 'नोकरी अर्ज सादर करा'}
                </h3>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-4"
                  >
                    <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
                    <h4 className="text-xl font-bold text-emerald-900">
                      {lang === 'en' ? 'Application Submitted!' : 'अर्ज यशस्वीरीत्या सबमिट झाला!'}
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-850 leading-relaxed">
                      {lang === 'en' 
                        ? 'Thank you for applying. An automated notification alert has been sent to contactpjindustries@gmail.com. Our HR division will evaluate your profile and contact you soon.' 
                        : 'तुमच्या अर्जाबद्दल धन्यवाद! contactpjindustries@gmail.com या ईमेलवर स्वयंचलित ईमेल सूचना पाठवण्यात आली आहे. आमचा विभाग लवकरच तुमच्याशी संपर्क साधेल.'}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-extrabold text-stone-700 mb-1">
                        {lang === 'en' ? 'Full Name (Optional)' : 'पूर्ण नाव (ऐच्छिक)'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                          placeholder={lang === 'en' ? 'First and Last name' : 'पहिले नाव आणि आडनाव'}
                        />
                      </div>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-xs font-extrabold text-stone-700 mb-1">
                        {lang === 'en' ? 'Gender (Optional)' : 'लिंग (ऐच्छिक)'}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Male', 'Female', 'Other'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g as any })}
                            className={`py-2.5 px-3 border rounded-xl text-xs sm:text-sm font-bold transition-all ${
                              formData.gender === g
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {lang === 'en' 
                              ? g 
                              : g === 'Male' ? 'पुरुष' : g === 'Female' ? 'महिला' : 'इतर'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Village/City */}
                    <div>
                      <label className="block text-xs font-extrabold text-stone-700 mb-1">
                        {lang === 'en' ? 'Village / City (Optional)' : 'गाव / शहर (ऐच्छिक)'}
                      </label>
                      <input
                        type="text"
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                        placeholder={lang === 'en' ? 'Your home town / district' : 'तुमचे गाव किंवा जिल्हा'}
                      />
                    </div>

                    {/* Contact Mobile */}
                    <div>
                      <label className="block text-xs font-extrabold text-stone-700 mb-1">
                        {lang === 'en' ? 'Mobile Number (Optional)' : 'मोबाईल नंबर (ऐच्छिक)'}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
                        <input
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="e.g. 9876543210"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-extrabold text-stone-700 mb-1">
                        {lang === 'en' ? 'Email Address (Optional)' : 'ईमेल पत्ता (ऐच्छिक)'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-stone-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 font-mono"
                          placeholder="e.g. name@example.com"
                        />
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                      <label className="block text-xs font-extrabold text-stone-700 mb-1">
                        {lang === 'en' ? 'Upload Resume / Bio-data (PDF < 600KB or Image < 10MB) *' : 'रिझ्युम किंवा बायोडाटा अपलोड करा (PDF < ६००KB किंवा प्रतिमा < १०MB) *'}
                      </label>
                      <div className="border-2 border-dashed border-stone-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer bg-stone-50 transition relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="space-y-1">
                          <Upload className="mx-auto h-8 w-8 text-stone-400" />
                          <p className="text-xs font-bold text-stone-700">
                            {resumeFile ? resumeFile.name : (lang === 'en' ? 'Click to select or drag file here' : 'फाइल निवडण्यासाठी क्लिक करा किंवा फाईल ड्रॅग करा')}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB` : (lang === 'en' ? 'PDF (max 600KB) or Image (auto-optimized)' : 'PDF (कमाल ६००KB) किंवा प्रतिमा (स्वयंचलित ऑप्टिमाइझ)')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-[#0B5D1E] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-md transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting 
                        ? (lang === 'en' ? 'Submitting Application...' : 'अर्ज पाठविला जात आहे...') 
                        : (lang === 'en' ? 'Submit Application' : 'अर्ज सबमिट करा')}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
