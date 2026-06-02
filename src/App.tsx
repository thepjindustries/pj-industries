import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Products from './components/Products';
import About from './components/About';
import Dealer from './components/Dealer';
import Contact from './components/Contact';
import StaffDashboard from './components/StaffDashboard';
import AdminDashboard from './components/AdminDashboard';

import { 
  dbStore, 
  Product, 
  Employee, 
  ContactInquiry, 
  DealerInquiry, 
  AboutUsData,
  INITIAL_PRODUCTS,
  INITIAL_EMPLOYEES,
  DEFAULT_ABOUT_US
} from './db';
import { Landmark, ShieldAlert, Key, User } from 'lucide-react';

export default function App() {
  // Navigation & Localization
  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<'en' | 'mr'>('mr'); // default to Marathi for agrarian audience presence

  // Core synchronized databases
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [aboutUsData, setAboutUsData] = useState<AboutUsData>(DEFAULT_ABOUT_US);

  // Authentication Status
  const [currentStaff, setCurrentStaff] = useState<Employee | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<boolean>(false);

  // Sign In inputs
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState<string>('');

  // Loads synchronized records
  const loadDatabase = async () => {
    const listProds = await dbStore.getList<Product>('products', INITIAL_PRODUCTS);
    setProductsList(listProds);

    const listEmps = await dbStore.getList<Employee>('employees', INITIAL_EMPLOYEES);
    setEmployeesList(listEmps);

    const docAbt = await dbStore.getSingleDoc<AboutUsData>('about_us', DEFAULT_ABOUT_US);
    setAboutUsData(docAbt);
  };

  useEffect(() => {
    loadDatabase();
    
    // Auto-authenticate active sessions from localStorage fallback
    const savedStaffId = localStorage.getItem('pj_session_staff_id');
    if (savedStaffId) {
      dbStore.getList<Employee>('employees', INITIAL_EMPLOYEES).then(list => {
        const matching = list.find(x => x.id === savedStaffId);
        if (matching) setCurrentStaff(matching);
      });
    }

    if (localStorage.getItem('pj_session_admin') === 'true') {
      setCurrentAdmin(true);
    }
  }, []);

  const handleRefreshData = () => {
    loadDatabase();
  };

  // --- HANDLERS: USER DISPATCH SUBMISSIONS ---
  const handleContactSubmit = async (inquiry: Omit<ContactInquiry, 'id' | 'submittedAt' | 'status'>) => {
    const id = `query-${Date.now()}`;
    const newInquiry: ContactInquiry = {
      ...inquiry,
      id,
      submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      status: 'Unread'
    };

    await dbStore.saveItem<ContactInquiry>('contact_queries', id, newInquiry, []);
    loadDatabase();
  };

  const handleDealerSubmit = async (inquiry: Omit<DealerInquiry, 'id' | 'submittedAt' | 'status'>) => {
    const id = `dealer-${Date.now()}`;
    const newInquiry: DealerInquiry = {
      ...inquiry,
      id,
      submittedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      status: 'Pending'
    };

    await dbStore.saveItem<DealerInquiry>('dealer_queries', id, newInquiry, []);
    loadDatabase();
  };

  // --- HANDLERS: LOGIN ROUTER FORMS ---
  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    let matchUser = employeesList.find(
      (emp) => 
        emp.username.toLowerCase() === loginForm.username.toLowerCase() && 
        emp.password === loginForm.password
    );

    if (!matchUser && loginForm.username.toLowerCase() === 'prashant' && loginForm.password === 'Omkar@1') {
      matchUser = {
        id: 'PJ-EMP-100',
        fullName: 'Prashant Jagtap',
        email: 'prashant.j@pjintel.com',
        mobile: '9145687999',
        address: 'PJ Industries, Ranjangaon MIDC, Pune',
        dob: '1985-05-15',
        joiningDate: '2020-01-01',
        aadhaar: '1111-2222-3333',
        pan: 'PRVNJ1234T',
        bankDetails: { accountNo: '601245678900', ifsc: 'MAHB0001234', bankName: 'Bank of Maharashtra' },
        department: 'Operations',
        designation: 'Managing Director & Founder',
        salary: 120000,
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        username: 'prashant',
        password: 'Omkar@1'
      };
    }

    if (matchUser) {
      setCurrentStaff(matchUser);
      localStorage.setItem('pj_session_staff_id', matchUser.id);
      setLoginForm({ username: '', password: '' });
      setActiveTab('staff-dashboard');
    } else {
      setLoginError(lang === 'en' 
        ? 'Invalid Username or Password. Please try again.' 
        : 'वापरकर्ता नाव किंवा पासवर्ड चुकीचा आहे. कृपया पुन्हा प्रयत्न करा.'
      );
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginForm.username.toLowerCase() === 'prashant' && loginForm.password === 'Omkar@1') {
      setCurrentAdmin(true);
      localStorage.setItem('pj_session_admin', 'true');
      setLoginForm({ username: '', password: '' });
      setActiveTab('admin-dashboard');
    } else {
      setLoginError(lang === 'en' 
        ? 'Invalid Admin details. Please try again.' 
        : 'अ‍ॅडमिन आयडी किंवा पासवर्ड चुकीचा आहे.'
      );
    }
  };

  const handleLogout = () => {
    setCurrentStaff(null);
    setCurrentAdmin(false);
    localStorage.removeItem('pj_session_staff_id');
    localStorage.removeItem('pj_session_admin');
    setActiveTab('home');
  };

  return (
    <div className="flex flex-col min-h-screen text-[#222222] bg-gray-50 antialiased font-sans">
      
      {/* Dynamic Header Component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        currentStaff={currentStaff}
        currentAdmin={currentAdmin}
        onLogout={handleLogout}
      />

      {/* Main Board router container */}
      <main className="flex-1">
        
        {activeTab === 'home' && (
          <Home
            lang={lang}
            setActiveTab={setActiveTab}
            onContactSubmit={handleContactSubmit}
            products={productsList}
            aboutData={aboutUsData}
          />
        )}

        {activeTab === 'products' && (
          <Products
            lang={lang}
            products={productsList}
            onContactSubmit={handleContactSubmit}
          />
        )}

        {activeTab === 'about' && (
          <About 
            lang={lang} 
            aboutData={aboutUsData} 
          />
        )}

        {activeTab === 'dealer' && (
          <Dealer
            lang={lang}
            products={productsList}
            onDealerSubmit={handleDealerSubmit}
          />
        )}

        {activeTab === 'contact' && (
          <Contact
            lang={lang}
            products={productsList}
            onContactSubmit={handleContactSubmit}
          />
        )}

        {/* STAFF LOGIN VIEW PORT */}
        {activeTab === 'staff-login' && (
          <div className="py-20 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="mx-auto bg-emerald-50 text-[#0B5D1E] w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner">
                  <User className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  {lang === 'en' ? 'Employee Login Board' : 'कर्मचारी स्टाफ पोर्टल'}
                </h2>
                <p className="text-xs text-gray-400">
                  {lang === 'en' ? 'Enter your assigned credentials.' : 'तुमचे युझरनेम आणि पासवर्ड भरा.'}
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-750 font-bold text-xs rounded-xl">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-3xs font-black uppercase text-gray-500 mb-1">Username / वापरकर्ता नाव</label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm shadow-2xs"
                    placeholder="Username"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-black uppercase text-gray-500 mb-1 font-sans">Password / पासवर्ड</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm shadow-2xs"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-[#0B5D1E] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                >
                  {lang === 'en' ? 'Punch In Shift' : 'पोर्टल मध्ये लॉगीन करा'}
                </button>
              </form>

            </div>
          </div>
        )}

        {/* ADMIN LOGIN VIEW PORT */}
        {activeTab === 'admin-login' && (
          <div className="py-20 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 space-y-6">
              
              <div className="text-center space-y-2">
                <div className="mx-auto bg-amber-50 text-amber-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner">
                  <Key className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                  {lang === 'en' ? 'Administrative Log In' : 'अ‍ॅडमिन लॉगिन सिस्टम'}
                </h2>
                <p className="text-xs text-gray-400">
                  {lang === 'en' ? 'PJ Industries authorized business control' : 'पी. जे. मुख्य व्यवस्थापकीय विभाग प्रवेश'}
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-750 text-xs font-bold rounded-lg">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-3xs font-black uppercase text-gray-500 mb-1">Administrative USERNAME</label>
                  <input
                    type="text"
                    required
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                    placeholder="Username"
                  />
                </div>

                <div>
                  <label className="block text-3xs font-black uppercase text-gray-500 mb-1">Admin PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-indigo-950 text-white font-black text-xs uppercase tracking-wider rounded-xl"
                >
                  Authorize admin Console
                </button>
              </form>

            </div>
          </div>
        )}

        {/* LOGGED IN ACTIVE SCREENS SHUNT */}
        {activeTab === 'staff-dashboard' && currentStaff && (
          <StaffDashboard
            lang={lang}
            currentStaff={currentStaff}
            onLogout={handleLogout}
            onRefreshData={handleRefreshData}
          />
        )}

        {activeTab === 'admin-dashboard' && currentAdmin && (
          <AdminDashboard
            lang={lang}
            onRefreshData={handleRefreshData}
          />
        )}

      </main>

      {/* Corporate Fixed Footer */}
      <Footer 
        lang={lang} 
        setActiveTab={setActiveTab} 
      />

    </div>
  );
}
