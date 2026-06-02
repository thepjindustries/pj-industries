import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  ShoppingBag, 
  MapPin, 
  FileText, 
  CheckSquare, 
  Sliders, 
  FolderLock, 
  Database, 
  Award, 
  UserPlus, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit3,
  Landmark,
  Clock,
  Calendar,
  MessageSquare,
  Heart
} from 'lucide-react';
import { 
  dbStore, 
  Product, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  EodReport, 
  DepartmentConfig, 
  ContactInquiry, 
  DealerInquiry, 
  FarmerFeedback,
  AboutUsData,
  DEFAULT_DEPT_FORMS,
  INITIAL_PRODUCTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  DEFAULT_ABOUT_US,
  STATE_DISTRICTS,
  calculateHoursBetween,
  formatPreciseDuration
} from '../db';

interface AdminDashboardProps {
  lang: 'en' | 'mr';
  onRefreshData: () => void;
}

export default function AdminDashboard({ lang, onRefreshData }: AdminDashboardProps) {
  // Staff Core attendance & department-sorting state variables
  const [selectedStaffDept, setSelectedStaffDept] = useState<string>('All');
  const [groupStaffByDept, setGroupStaffByDept] = useState<boolean>(true);
  const [expandedEmpAttendance, setExpandedEmpAttendance] = useState<string | null>(null);

  // Deletion confirmation helper state
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState<string | null>(null);
  const [confirmDeleteEmpId, setConfirmDeleteEmpId] = useState<string | null>(null);
  const [confirmDeletePunchId, setConfirmDeletePunchId] = useState<string | null>(null);

  // Manual Punch Form State variables
  const [manualPunchForm, setManualPunchForm] = useState({
    date: new Date().toISOString().split('T')[0],
    punchIn: '09:00:00 AM',
    punchOut: '06:00:00 PM',
    totalHours: '9.0'
  });

  // Automatically calculate hours worked on the fly when times change
  useEffect(() => {
    const computed = calculateHoursBetween(manualPunchForm.punchIn, manualPunchForm.punchOut);
    if (!isNaN(computed)) {
      setManualPunchForm(prev => {
        if (prev.totalHours !== computed.toString()) {
          return { ...prev, totalHours: computed.toString() };
        }
        return prev;
      });
    }
  }, [manualPunchForm.punchIn, manualPunchForm.punchOut]);

  // Collections lists
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [eodReports, setEodReports] = useState<EodReport[]>([]);
  const [deptConfigs, setDeptConfigs] = useState<DepartmentConfig[]>([]);
  const [contactQueries, setContactQueries] = useState<ContactInquiry[]>([]);
  const [dealerQueries, setDealerQueries] = useState<DealerInquiry[]>([]);
  const [farmerFeedbacks, setFarmerFeedbacks] = useState<FarmerFeedback[]>([]);
  const [aboutUs, setAboutUs] = useState<AboutUsData | null>(null);

  // Connection Indicator
  const [firebaseStatus, setFirebaseStatus] = useState({ active: false, configExists: false });
  const [firebaseInputConfig, setFirebaseInputConfig] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  // Active Controller Tab
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'employees' | 'depts' | 'leaves' | 'dealers' | 'cms' | 'fb_integrate' | 'feedbacks'>('info');

  // Interactive Form States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    nameMr: '',
    image: '',
    description: '',
    descriptionMr: '',
    advantages: [],
    advantagesMr: [],
    ingredients: [],
    ingredientsMr: [],
    usage: '',
    usageMr: '',
    price: 1300,
    category: 'High Lactation',
    status: 'Available'
  });

  // Employee CRUD states
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<Omit<Employee, 'profilePhoto'>>({
    id: '',
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    dob: '1995-01-01',
    joiningDate: '2025-01-01',
    aadhaar: '',
    pan: '',
    bankDetails: { accountNo: '', ifsc: '', bankName: '' },
    department: 'HR & Admin',
    designation: '',
    salary: 25000,
    username: '',
    password: ''
  });

  // Active edit state for EOD questions
  const [selectedDeptConfig, setSelectedDeptConfig] = useState<DepartmentConfig | null>(null);
  const [newQuestionStr, setNewQuestionStr] = useState('');

  // New Production Photo States
  const [newProdPhotoUrl, setNewProdPhotoUrl] = useState('');
  const [newProdPhotoEn, setNewProdPhotoEn] = useState('');
  const [newProdPhotoMr, setNewProdPhotoMr] = useState('');

  // Month selection & search query for all-month EOD reports
  const [selectedEodMonth, setSelectedEodMonth] = useState<string>('all');
  const [searchEodText, setSearchEodText] = useState<string>('');

  // Status Response Toast
  const [adminToast, setAdminToast] = useState('');

  // Load everything
  const loadStats = async () => {
    const prods = await dbStore.getList<Product>('products', INITIAL_PRODUCTS);
    setProducts(prods);

    const emps = await dbStore.getList<Employee>('employees', INITIAL_EMPLOYEES);
    setEmployees(emps);

    const atts = await dbStore.getList<AttendanceRecord>('attendance', INITIAL_ATTENDANCE);
    setAttendance(atts);

    const lvs = await dbStore.getList<LeaveRequest>('leaves', []);
    setLeaves(lvs);

    const eods = await dbStore.getList<EodReport>('eod_reports', []);
    setEodReports(eods);

    const depts = await dbStore.getList<DepartmentConfig>('department_configs', DEFAULT_DEPT_FORMS);
    setDeptConfigs(depts);

    const conts = await dbStore.getList<ContactInquiry>('contact_queries', []);
    setContactQueries(conts);

    const deals = await dbStore.getList<DealerInquiry>('dealer_queries', []);
    setDealerQueries(deals);

    const fbs = await dbStore.getList<FarmerFeedback>('feedbacks', []);
    setFarmerFeedbacks(fbs);

    const abt = await dbStore.getSingleDoc<AboutUsData>('about_us', DEFAULT_ABOUT_US);
    setAboutUs(abt);

    // check firebase status
    const isFb = dbStore.isUsingFirebase();
    const diskConfig = localStorage.getItem('pj_firebase_config');
    setFirebaseStatus({ active: isFb, configExists: !!diskConfig });
    if (diskConfig) {
      try {
        setFirebaseInputConfig(JSON.parse(diskConfig));
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(''), 3500);
  };

  // --- ACTIONS: FIREBASE INTEGRATION SETUP ---
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseInputConfig.apiKey || !firebaseInputConfig.projectId) {
      alert("Missing required fields (API Key, Project ID)");
      return;
    }
    localStorage.setItem('pj_firebase_config', JSON.stringify(firebaseInputConfig));
    const initResponse = dbStore.tryInitializeFirebase();
    
    if (initResponse) {
      showToast("Firebase Config saved and Connection Initialized!");
    } else {
      showToast("Firebase saved with fallback local simulation. Please refresh workspace.");
    }
    loadStats();
    onRefreshData();
  };

  const handleClearFirebaseConfig = () => {
    dbStore.clearFirebaseConfig();
    setFirebaseInputConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
    showToast("Firebase disconnected. App returned to secure LocalStorage state!");
    loadStats();
    onRefreshData();
  };

  // --- ACTIONS: PRODUCTS CRUD ---
  const handleAddOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const pid = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    
    const formattedAdvEn = Array.isArray(productForm.advantages) ? productForm.advantages : String(productForm.advantages).split(',').map(x => x.trim());
    const formattedAdvMr = Array.isArray(productForm.advantagesMr) ? productForm.advantagesMr : String(productForm.advantagesMr).split(',').map(x => x.trim());
    
    const formattedIngEn = Array.isArray(productForm.ingredients) ? productForm.ingredients : String(productForm.ingredients).split(',').map(x => x.trim());
    const formattedIngMr = Array.isArray(productForm.ingredientsMr) ? productForm.ingredientsMr : String(productForm.ingredientsMr).split(',').map(x => x.trim());

    const item: Product = {
      ...productForm,
      id: pid,
      advantages: formattedAdvEn,
      advantagesMr: formattedAdvMr,
      ingredients: formattedIngEn,
      ingredientsMr: formattedIngMr
    };

    await dbStore.saveItem<Product>('products', pid, item, INITIAL_PRODUCTS);
    showToast(editingProduct ? "Product details updated!" : "New Cattle Feed Product added successfully!");
    
    // reset form
    setIsAddingProduct(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      nameMr: '',
      image: '',
      description: '',
      descriptionMr: '',
      advantages: [],
      advantagesMr: [],
      ingredients: [],
      ingredientsMr: [],
      usage: '',
      usageMr: '',
      price: 1300,
      category: 'High Lactation',
      status: 'Available'
    });
    loadStats();
    onRefreshData();
  };

  const handleDeleteProduct = async (prodId: string) => {
    await dbStore.deleteItem<Product>('products', prodId, INITIAL_PRODUCTS);
    showToast("Product deleted from database!");
    loadStats();
    onRefreshData();
  };

  // --- ACTIONS: EMPLOYEES CRUD ---
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.id || !employeeForm.fullName || !employeeForm.username) {
      alert("Please enter Employee ID, Full Name, and Username.");
      return;
    }

    const item: Employee = {
      ...employeeForm,
      profilePhoto: employeeForm.fullName.toLowerCase().includes('snehal') 
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    };

    await dbStore.saveItem<Employee>('employees', item.id, item, INITIAL_EMPLOYEES);
    showToast(`Staff member ${item.fullName} added to department!`);
    
    // reset form
    setIsAddingEmployee(false);
    setEmployeeForm({
      id: '',
      fullName: '',
      email: '',
      mobile: '',
      address: '',
      dob: '1995-01-01',
      joiningDate: '2025-01-01',
      aadhaar: '',
      pan: '',
      bankDetails: { accountNo: '', ifsc: '', bankName: '' },
      department: 'HR & Admin',
      designation: '',
      salary: 25000,
      username: '',
      password: ''
    });
    loadStats();
    onRefreshData();
  };

  const handleDeleteEmployee = async (empId: string) => {
    await dbStore.deleteItem<Employee>('employees', empId, INITIAL_EMPLOYEES);
    showToast("Staff deleted successfully.");
    loadStats();
    onRefreshData();
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProductForm(prev => ({ ...prev, image: base64String }));
      showToast("Selected image uploaded successfully inside System!");
    };
    reader.readAsDataURL(file);
  };

  const handleAddManualPunch = async (empId: string, empName: string, dept: string) => {
    const dateStr = manualPunchForm.date;
    const uniqId = `att-${empId}-${dateStr}-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: uniqId,
      employeeId: empId,
      employeeName: empName,
      department: dept,
      date: dateStr,
      punchIn: manualPunchForm.punchIn,
      punchOut: manualPunchForm.punchOut,
      totalHours: parseFloat(manualPunchForm.totalHours) || 8.0
    };

    await dbStore.saveItem<AttendanceRecord>('attendance', uniqId, newRecord, INITIAL_ATTENDANCE);
    showToast(`Added manual attendance timing record for ${empName}!`);
    loadStats();
    onRefreshData();
  };

  const handleDeleteManualPunch = async (recordId: string) => {
    await dbStore.deleteItem<AttendanceRecord>('attendance', recordId, INITIAL_ATTENDANCE);
    showToast("Timing record deleted.");
    loadStats();
    onRefreshData();
  };

  // --- ACTIONS: DEPARTMENTS SURVEY CONFIGS ---
  const handleSelectDeptConfig = (config: DepartmentConfig) => {
    setSelectedDeptConfig(config);
  };

  const handleAddQuestionToDept = async () => {
    if (!selectedDeptConfig || !newQuestionStr.trim()) return;
    const updatedQs = [...selectedDeptConfig.questions, newQuestionStr.trim()];
    const updatedConfig: DepartmentConfig = {
      ...selectedDeptConfig,
      questions: updatedQs
    };

    await dbStore.saveItem<DepartmentConfig>('department_configs', selectedDeptConfig.id, updatedConfig, DEFAULT_DEPT_FORMS);
    showToast(`Question added to ${selectedDeptConfig.id} EOD template!`);
    setNewQuestionStr('');
    
    // reload config in list
    const updatedList = deptConfigs.map(x => x.id === selectedDeptConfig.id ? updatedConfig : x);
    setDeptConfigs(updatedList);
    setSelectedDeptConfig(updatedConfig);
  };

  const handleRemoveQuestionFromDept = async (index: number) => {
    if (!selectedDeptConfig) return;
    const updatedQs = selectedDeptConfig.questions.filter((_, i) => i !== index);
    const updatedConfig: DepartmentConfig = {
      ...selectedDeptConfig,
      questions: updatedQs
    };

    await dbStore.saveItem<DepartmentConfig>('department_configs', selectedDeptConfig.id, updatedConfig, DEFAULT_DEPT_FORMS);
    showToast("Question removed from template.");
    
    const updatedList = deptConfigs.map(x => x.id === selectedDeptConfig.id ? updatedConfig : x);
    setDeptConfigs(updatedList);
    setSelectedDeptConfig(updatedConfig);
  };

  // --- ACTIONS: LEAVES APPROVE/REJECT ---
  const handleUpdateLeaveStatus = async (leaveId: string, status: 'Approved' | 'Rejected') => {
    const target = leaves.find(x => x.id === leaveId);
    if (!target) return;
    const updated: LeaveRequest = { ...target, status };
    
    await dbStore.saveItem<LeaveRequest>('leaves', leaveId, updated, []);
    showToast(`Leave request status modified to: ${status}!`);
    loadStats();
  };

  // --- ACTIONS: CMS GENERAL SAVE ---
  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutUs) return;
    await dbStore.saveSingleDoc<AboutUsData>('about_us', aboutUs);
    showToast("About Us Information has been updated dynamically!");
    loadStats();
    onRefreshData();
  };

  // --- DEALER OPERATIONS: STATUS TRIGGER ---
  const handleUpdateDealerStatus = async (dealerId: string, status: 'Approved' | 'Rejected') => {
    const target = dealerQueries.find(x => x.id === dealerId);
    if (!target) return;
    const updated: DealerInquiry = { ...target, status };

    await dbStore.saveItem<DealerInquiry>('dealer_queries', dealerId, updated, []);
    showToast(`Dealer application is now: ${status}!`);
    loadStats();
  };

  // Export Dealer Inquiries as clean formatted JSON file
  const handleExportDealers = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dealerQueries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PJ_DEALERS_EXPORT_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Dealer inquiries exported successfully!");
  };

  // Delete General Customer Inquiry
  const handleDeleteContactQuery = async (queryId: string) => {
    const isOk = window.confirm("Are you sure you want to delete this customer inquiry? (आपण ही चौकशी हटवू इच्छिता का?)");
    if (!isOk) return;
    await dbStore.deleteItem<ContactInquiry>('contact_queries', queryId, []);
    showToast("Customer inquiry deleted successfully.");
    loadStats();
  };

  // Delete Dealer Inquiry
  const handleDeleteDealerQuery = async (queryId: string) => {
    const isOk = window.confirm("Are you sure you want to delete this dealer application? (आपण हा अर्ज हटवू इच्छिता का?)");
    if (!isOk) return;
    await dbStore.deleteItem<DealerInquiry>('dealer_queries', queryId, []);
    showToast("Dealer application deleted successfully.");
    loadStats();
  };

  // Delete Farmer Feedback
  const handleDeleteFarmerFeedback = async (feedbackId: string) => {
    const isOk = window.confirm("Are you sure you want to delete this feedback? (आपण हा अभिप्राय हटवू इच्छिता का?)");
    if (!isOk) return;
    await dbStore.deleteItem<FarmerFeedback>('feedbacks', feedbackId, []);
    showToast("Feedback deleted successfully.");
    loadStats();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Dynamic Admin feedback alert bar */}
        {adminToast && (
          <div className="fixed bottom-10 right-10 z-50 bg-[#222222] border-l-4 border-[#FFC107] text-[#FFC107] rounded-xl shadow-2xl px-6 py-4 flex items-center space-x-3.5 animate-pulse">
            <span className="font-extrabold text-[#FFC107]">ADMIN:</span>
            <span className="text-sm font-bold text-gray-200">{adminToast}</span>
          </div>
        )}

        {/* 1. COMPACT BOARD TITLE SECTION */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-b-6 border-[#FFC107]">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-[#0B5D1E] text-white rounded-2xl shadow-md border border-[#6AAE2C]">
              <FolderLock className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#FFC107]">PJ Admin Portal</h1>
                <span className="text-[10px] font-black tracking-widest bg-[#0B5D1E] text-white px-2 py-0.5 rounded-full uppercase">SECURED</span>
              </div>
              <p className="text-xs text-gray-400">Dynamic Enterprise Command Panel for PJ Industries Doodhurja</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-zinc-800 p-3 rounded-xl border border-zinc-700">
            <span className={`w-3.5 h-3.5 rounded-full ${firebaseStatus.active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 hover:scale-105'}`}></span>
            <div className="text-left leading-none">
              <span className="text-[10px] text-gray-400 block font-bold leading-none mb-1">PERSISTENCE MODE</span>
              <span className="text-xs font-mono font-black">{firebaseStatus.active ? 'FireStore Sync API Active' : 'LocalStorage Simulator'}</span>
            </div>
          </div>
        </div>

        {/* 2. TAB CONTROLLERS SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inner Admin Menu tabs */}
          <div className="lg:col-span-3 bg-white p-4.5 rounded-2xl border border-gray-150 shadow-md space-y-1">
            <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold px-3.5 mb-2.5">
              MANAGEMENT DOMAINS
            </h4>

            <button
              onClick={() => setActiveTab('info')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'info' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>General Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'products' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Products CRUD ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('employees')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'employees' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Staff Core ({employees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('depts')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'depts' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              <span>EOD Question sheets</span>
            </button>

            <button
              onClick={() => setActiveTab('leaves')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'leaves' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="h-4 w-4 text-emerald-500" />
              <span>Leaves & All Month EOD ({leaves.filter(x => x.status === 'Pending').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dealers')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'dealers' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Dealer Inquiry ({dealerQueries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'cms' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Content Editor (CMS)</span>
            </button>

            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'feedbacks' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback Records ({farmerFeedbacks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('fb_integrate')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2.5 ${
                activeTab === 'fb_integrate' ? 'bg-[#0B5D1E] text-white shadow-[#FFC107]' : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Firebase Integrator</span>
            </button>
          </div>

          {/* 3. DYNAMIC TAB CONTAINER CONTENT AREA */}
          <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl border border-gray-150 shadow-md">

            {/* --- BLOCK 1: GENERAL STATS --- */}
            {activeTab === 'info' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Visual scorecard grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-1.5">
                    <span className="text-3xl font-black text-[#0B5D1E]">{products.length}</span>
                    <span className="text-[10px] text-gray-400 block uppercase font-extrabold">Active Cattle Feed</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-center space-y-1.5">
                    <span className="text-3xl font-black text-amber-700">{employees.length}</span>
                    <span className="text-[10px] text-gray-400 block uppercase font-extrabold">Registered Employees</span>
                  </div>
                  <div className="bg-red-50 border border-red-100 p-5 rounded-2xl text-center space-y-1.5">
                    <span className="text-3xl font-black text-red-600">{leaves.filter(x => x.status === 'Pending').length}</span>
                    <span className="text-[10px] text-gray-400 block uppercase font-extrabold">Pending Leaves</span>
                  </div>
                  <div className="bg-[#FFC107]/10 border border-[#FFC107]/30 p-5 rounded-2xl text-center space-y-1.5">
                    <span className="text-3xl font-black text-zinc-900">{dealerQueries.length}</span>
                    <span className="text-[10px] text-gray-400 block uppercase font-extrabold">Dealer Applications</span>
                  </div>
                </div>

                {/* General Inquiry Tables */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-lg text-gray-900">General Customer Inquiries</h3>
                      <p className="text-3xs text-gray-400">Captured from Quick Contact form section on customer front board</p>
                    </div>
                  </div>

                  {contactQueries.length === 0 ? (
                    <div className="bg-gray-50 border p-6 text-center text-xs text-gray-400 rounded-xl">
                      No customer inquiries registered. Try submitting a quick query on home page first.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="pb-2.5">Date</th>
                            <th className="pb-2.5">Candidate Details</th>
                            <th className="pb-2.5">Target Product</th>
                            <th className="pb-2.5">Full Message</th>
                            <th className="pb-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {contactQueries.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50">
                              <td className="py-3 font-bold text-gray-600 font-mono text-[11px]">{q.submittedAt}</td>
                              <td className="py-3">
                                <span className="font-black text-[#222222] block">{q.fullName}</span>
                                <span className="text-3xs text-gray-400 block font-mono">Mob: {q.mobile}</span>
                              </td>
                              <td className="py-3 font-semibold text-[#0B5D1E]">{q.productInquiry}</td>
                              <td className="py-3 text-zinc-500 max-w-xs">{q.message}</td>
                              <td className="py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContactQuery(q.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Inquiry"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* --- BLOCK 2: PRODUCTS CRUD LISTING AND FORMS --- */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">DOODHURJA Cattle Feed Records</h3>
                    <p className="text-3xs text-gray-400">Add, edit, or delete dynamic retail listings</p>
                  </div>

                  {!isAddingProduct && (
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsAddingProduct(true);
                      }}
                      className="px-4 py-2 bg-[#0B5D1E] text-white font-bold rounded-xl text-xs uppercase flex items-center space-x-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Product</span>
                    </button>
                  )}
                </div>

                {isAddingProduct ? (
                  <form onSubmit={handleAddOrUpdateProduct} className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-black uppercase text-[#0B5D1E]">
                        {editingProduct ? 'EDIT EXISTING PRODUCT' : 'NEW FEED DECLARATION FORM'}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingProduct(false)}
                        className="text-[#222222] font-bold text-lg hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">English Name *</label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="DOODHURJA Special"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Marathi Name *</label>
                        <input
                          type="text"
                          required
                          value={productForm.nameMr}
                          onChange={(e) => setProductForm({ ...productForm, nameMr: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="दुग्धऊर्जा मका पेंड"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                        >
                          <option value="High Lactation">High Lactation</option>
                          <option value="XBreed Specialist">XBreed Specialist</option>
                          <option value="Heifer Growth">Heifer Growth</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Retails Price (₹) per Bag *</label>
                        <input
                          type="number"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Stock Status</label>
                        <select
                          value={productForm.status}
                          onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                        >
                          <option value="Available">Available</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-gray-200 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <label className="block text-3xs font-extrabold uppercase tracking-wider text-[#0B5D1E]">
                            Add Product Image (Saved in System)
                          </label>
                          <p className="text-[10px] text-gray-400">Upload a file directly from your device, pick a preset, or specify a URL</p>
                        </div>
                        
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="system-image-picker"
                            className="hidden"
                            onChange={handleImageFileUpload}
                          />
                          <label
                            htmlFor="system-image-picker"
                            className="px-3.5 py-1.5 bg-[#0B5D1E] hover:bg-[#1E4625] text-white text-[11px] font-bold rounded-lg cursor-pointer inline-flex items-center space-x-1.5 uppercase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Upload File</span>
                          </label>
                        </div>
                      </div>

                      {/* Display Preview if present */}
                      {productForm.image && (
                        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-150">
                          <img 
                            src={productForm.image} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded-lg border shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-gray-400 block font-mono">Image Source Content</span>
                            <span className="text-xs text-[#0B5D1E] font-medium truncate block font-mono">
                              {productForm.image.startsWith('data:') ? 'uploaded_base64_data_file' : productForm.image}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProductForm(p => ({ ...p, image: '' }))}
                            className="text-red-500 font-bold px-2 hover:bg-red-50 rounded"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      {/* System presets picker list */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 block">
                          Or Choose from high-quality cattle feed presets:
                        </span>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { name: 'Maize Feed', url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=600' },
                            { name: 'Bypass Special', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600' },
                            { name: 'Calf Grow', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600' },
                            { name: 'Forage Green', url: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&q=80&w=600' },
                            { name: 'Dairy Farm', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600' }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setProductForm(prev => ({ ...prev, image: preset.url }));
                                showToast(`Selected "${preset.name}" preset!`);
                              }}
                              className={`group relative h-12 rounded-lg border overflow-hidden hover:border-[#0B5D1E] focus:outline-none transition-all ${
                                productForm.image === preset.url ? 'ring-2 ring-[#0B5D1E] border-transparent' : 'border-gray-200'
                              }`}
                              title={preset.name}
                            >
                              <img src={preset.url} alt={preset.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center">
                                <span className="text-[8px] text-white font-bold block truncate">{preset.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Direct Image URL fallback</span>
                        <input
                          type="text"
                          value={productForm.image}
                          onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                          placeholder="Paste custom link starting with http:// or https:// if preferred"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Description En *</label>
                        <textarea
                          rows={2}
                          required
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Description Mr *</label>
                        <textarea
                          rows={2}
                          required
                          value={productForm.descriptionMr}
                          onChange={(e) => setProductForm({ ...productForm, descriptionMr: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Advantages (comma-separated lists)</label>
                        <input
                          type="text"
                          value={Array.isArray(productForm.advantages) ? productForm.advantages.join(', ') : productForm.advantages}
                          onChange={(e) => setProductForm({ ...productForm, advantages: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="Rich protein, improves FAT"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Advantages Mr (comma-separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(productForm.advantagesMr) ? productForm.advantagesMr.join(', ') : productForm.advantagesMr}
                          onChange={(e) => setProductForm({ ...productForm, advantagesMr: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="फॅट वाढते, पचन सुलभ होते"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Ingredients (comma-separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(productForm.ingredients) ? productForm.ingredients.join(', ') : productForm.ingredients}
                          onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="Maize, vitamins, minerals"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Ingredients Mr (comma-separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(productForm.ingredientsMr) ? productForm.ingredientsMr.join(', ') : productForm.ingredientsMr}
                          onChange={(e) => setProductForm({ ...productForm, ingredientsMr: e.target.value as any })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="पिवळा मका, जीवनसत्त्वे"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Usage Instructions En</label>
                        <input
                          type="text"
                          value={productForm.usage}
                          onChange={(e) => setProductForm({ ...productForm, usage: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider mb-1 text-gray-500">Usage Mr</label>
                        <input
                          type="text"
                          value={productForm.usageMr}
                          onChange={(e) => setProductForm({ ...productForm, usageMr: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-700 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-[#0B5D1E] to-[#6AAE2C] text-white text-xs font-black uppercase rounded-lg"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map((p) => (
                      <div key={p.id} className="p-4 rounded-xl border border-gray-200 shadow-sm flex space-x-3.5 relative group">
                        <div className="w-20 h-20 bg-gray-150 rounded-xl overflow-hidden shrink-0">
                          <img src={p.image} className="w-full h-full object-cover" alt="feed" />
                        </div>
                        <div className="flex-1 space-y-1 minimum-w-0">
                          <h4 className="font-extrabold text-gray-900 truncate leading-tight">{p.name}</h4>
                          <span className="text-[10px] bg-slate-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold inline-block">{p.category}</span>
                          <p className="text-sm font-black text-[#0B5D1E] pt-1">₹{p.price} Bag</p>

                          <div className="flex items-center space-x-2.5 pt-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm(p);
                                setIsAddingProduct(true);
                              }}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              Edit details
                            </button>
                            <span className="text-gray-300">|</span>
                            {confirmDeleteProdId === p.id ? (
                              <div className="flex items-center space-x-1.5 bg-red-50 border border-red-150 rounded-lg px-2 py-0.5">
                                <span className="text-[10px] text-red-700 font-bold font-sans">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteProduct(p.id);
                                    setConfirmDeleteProdId(null);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white rounded px-1.5 py-0.5 text-[9px] font-black uppercase"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteProdId(null)}
                                  className="text-gray-500 hover:text-gray-700 text-[9px] font-bold px-1"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteProdId(p.id)}
                                className="text-xs font-bold text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- BLOCK 3: EMPLOYEE MANAGEMENT INTEGRATED --- */}
            {activeTab === 'employees' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Registered Corporate Staff Dashboard</h3>
                    <p className="text-3xs text-gray-400">Generate, assign, and customize staff accounts</p>
                  </div>

                  {!isAddingEmployee && (
                    <button
                      onClick={() => setIsAddingEmployee(true)}
                      className="px-4 py-2 bg-[#0B5D1E] text-white font-bold rounded-xl text-xs uppercase flex items-center space-x-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add Employee</span>
                    </button>
                  )}
                </div>

                {isAddingEmployee ? (
                  <form onSubmit={handleSaveEmployee} className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                    <span className="text-xs font-black uppercase text-[#0B5D1E] block pb-2 border-b">CREATE CORPORATE MEMBER PROFILE</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Employee ID *</label>
                        <input
                          type="text"
                          required
                          value={employeeForm.id}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, id: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="PJ-EMP-104"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={employeeForm.fullName}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[#434c5e] text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Mobile *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={employeeForm.mobile}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, mobile: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Department</label>
                        <select
                          value={employeeForm.department}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                          className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                        >
                          <option value="Accounts & Finance">Accounts & Finance</option>
                          <option value="HR & Admin">HR & Admin</option>
                          <option value="Marketing">Marketing</option>
                          <option value="NPD Department">NPD Department</option>
                          <option value="Operations">Operations</option>
                          <option value="Purchase Department">Purchase Department</option>
                          <option value="Sales Department">Sales Department</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Designation *</label>
                        <input
                          type="text"
                          required
                          value={employeeForm.designation}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Monthly Salary (₹) *</label>
                        <input
                          type="number"
                          required
                          value={employeeForm.salary}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, salary: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Aadhaar Card No</label>
                        <input
                          type="text"
                          value={employeeForm.aadhaar}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, aadhaar: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="e.g. 1234-5678-9012"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">PAN Number</label>
                        <input
                          type="text"
                          value={employeeForm.pan}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, pan: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                          placeholder="e.g. ABCDE1234F"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#0B5D1E] font-black block">National Bank Account Details</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-4xs font-black uppercase text-gray-500 mb-1">Account Number</label>
                          <input
                            type="text"
                            value={employeeForm.bankDetails.accountNo}
                            onChange={(e) => setEmployeeForm({ 
                              ...employeeForm, 
                              bankDetails: { ...employeeForm.bankDetails, accountNo: e.target.value } 
                            })}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-4xs font-black uppercase text-gray-500 mb-1">IFSC Identifier CODE</label>
                          <input
                            type="text"
                            value={employeeForm.bankDetails.ifsc}
                            onChange={(e) => setEmployeeForm({ 
                              ...employeeForm, 
                              bankDetails: { ...employeeForm.bankDetails, ifsc: e.target.value } 
                            })}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-4xs font-black uppercase text-gray-500 mb-1">Bank Name</label>
                          <input
                            type="text"
                            value={employeeForm.bankDetails.bankName}
                            onChange={(e) => setEmployeeForm({ 
                              ...employeeForm, 
                              bankDetails: { ...employeeForm.bankDetails, bankName: e.target.value } 
                            })}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                      <span className="text-[10px] uppercase tracking-wider font-black text-amber-800 block">Required Portal Credentials Setup</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-4xs font-black uppercase text-gray-550 mb-1">Username (login name)</label>
                          <input
                            type="text"
                            required
                            value={employeeForm.username}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, username: e.target.value })}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-4xs font-black uppercase text-gray-550 mb-1">Password</label>
                          <input
                            type="text"
                            required
                            value={employeeForm.password}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingEmployee(false)}
                        className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-700 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-indigo-700 text-white text-xs font-black uppercase rounded-lg"
                      >
                        Register Member Account
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Control section for department-wise sorting and filtering */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Department Filter Pills */}
                      <div className="space-y-1.5 flex-1 w-full">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block font-sans">
                          Filter Department Wise
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['All', ...DEFAULT_DEPT_FORMS.map(d => d.id)].map((dept) => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => {
                                setSelectedStaffDept(dept);
                                showToast(`Filtered roster for "${dept}"`);
                              }}
                              className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all ${
                                selectedStaffDept === dept 
                                  ? 'bg-[#0B5D1E] text-white shadow-xs' 
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Grouping switch */}
                      <div className="flex items-center space-x-3 shrink-0 bg-white p-2.5 rounded-lg border border-gray-150">
                        <input
                          type="checkbox"
                          id="group-by-dept-cb"
                          checked={groupStaffByDept}
                          onChange={(e) => {
                            setGroupStaffByDept(e.target.checked);
                            showToast(e.target.checked ? "Grouped roster by department" : "Plain list view active");
                          }}
                          className="w-4 h-4 text-[#0B5D1E] rounded focus:ring-[#0B5D1E]"
                        />
                        <label htmlFor="group-by-dept-cb" className="text-xs text-gray-700 font-bold select-none cursor-pointer">
                          Group Department Wise
                        </label>
                      </div>
                    </div>

                    {/* Rendering employees by groups or plain list */}
                    {(() => {
                      // Filtered list
                      const filteredEmps = employees.filter(emp => selectedStaffDept === 'All' || emp.department === selectedStaffDept);

                      if (filteredEmps.length === 0) {
                        return (
                          <div className="text-center p-12 bg-white rounded-2xl border border-gray-100">
                            <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-gray-500 font-bold text-xs">No employees found in the selected category.</p>
                          </div>
                        );
                      }

                      // Render card helper
                      const renderEmployeeCard = (emp: Employee) => {
                        // Gather attendance stats
                        const empAttDocs = attendance.filter(att => att.employeeId === emp.id);
                        const daysPresent = empAttDocs.length;
                        const totalHoursWorked = empAttDocs.reduce((sum, curr) => sum + (curr.totalHours || 0), 0);
                        const avgHours = daysPresent > 0 ? (totalHoursWorked / daysPresent).toFixed(1) : '0';

                        // Calculate Month Reports
                        const monthlyReports: { [key: string]: { days: number; hours: number; records: AttendanceRecord[] } } = {};
                        empAttDocs.forEach(att => {
                          const monthStr = (() => {
                            if (!att.date) return 'Active Month';
                            const pt = att.date.split('-');
                            if (pt.length >= 2) {
                              const mn = [
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                              ];
                              return `${mn[parseInt(pt[1], 10) - 1] || 'Month'} ${pt[0]}`;
                            }
                            return 'Active Month';
                          })();

                          if (!monthlyReports[monthStr]) {
                            monthlyReports[monthStr] = { days: 0, hours: 0, records: [] };
                          }
                          monthlyReports[monthStr].days += 1;
                          monthlyReports[monthStr].hours += att.totalHours || 0;
                          monthlyReports[monthStr].records.push(att);
                        });

                        const isExpanded = expandedEmpAttendance === emp.id;

                        return (
                          <div key={emp.id} className="border border-gray-150 rounded-2xl bg-white shadow-3xs overflow-hidden hover:shadow-xs transition-shadow">
                            {/* Card Top Header */}
                            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 bg-linear-to-r from-white to-slate-50">
                              <div className="flex items-center space-x-3.5">
                                <div className="w-12 h-12 bg-[#0B5D1E]/10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-[#0B5D1E]/20 text-[#0B5D1E] font-extrabold uppercase">
                                  {emp.fullName.split(' ').map(n=>n[0]).join('')}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[9px] bg-[#0B5D1E]/10 border border-[#0B5D1E]/20 text-[#0B5D1E] px-2 py-0.5 rounded-md font-sans block w-fit font-bold">
                                      {emp.department}
                                    </span>
                                    <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                                      {emp.designation}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-gray-900 leading-none mt-1.5 text-sm">{emp.fullName}</h4>
                                  <p className="text-[11px] text-gray-400 font-mono mt-1">
                                    ID: {emp.id} | Portal: <strong className="text-gray-700">{emp.username}</strong> / pass: <strong className="text-gray-700">{emp.password}</strong>
                                  </p>
                                </div>
                              </div>

                              {/* At-a-glance presence and actions */}
                              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                                <div className="text-left sm:text-right text-xs leading-none">
                                  <span className="text-gray-400 block pb-1 uppercase tracking-wider text-[9px] font-bold">Attendance Record</span>
                                  <div className="flex items-center space-x-2 font-bold text-gray-700 mt-1">
                                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-mono text-[10px]">{daysPresent} Days Present</span>
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-800 rounded font-mono text-[10px]">{totalHoursWorked.toFixed(1)} Hrs</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedEmpAttendance(isExpanded ? null : emp.id)}
                                    className={`px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase flex items-center space-x-1 transition-colors ${
                                      isExpanded 
                                        ? 'bg-[#0B5D1E] text-white border-[#0B5D1E]' 
                                        : 'bg-white text-gray-700 hover:bg-slate-50 border-gray-200'
                                    }`}
                                    title="View punch records and report summary details"
                                  >
                                    <Calendar className="h-3 w-3" />
                                    <span>{isExpanded ? 'Close Records' : 'View Timings'}</span>
                                  </button>
                                  {confirmDeleteEmpId === emp.id ? (
                                    <div className="flex items-center space-x-1 border border-red-250 bg-red-50 rounded-lg p-1">
                                      <span className="text-[9px] text-red-700 font-bold px-1">Delete profile?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleDeleteEmployee(emp.id);
                                          setConfirmDeleteEmpId(null);
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1 text-[9px] font-black uppercase"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteEmpId(null)}
                                        className="text-gray-550 hover:text-gray-700 text-[9px] font-bold px-1"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteEmpId(emp.id)}
                                      className="p-2 border border-red-200 text-red-650 rounded-lg hover:bg-red-50"
                                      title="Delete Member Profile"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Collapsible details for punch timings & reports section */}
                            {isExpanded && (
                              <div className="bg-slate-50 border-t p-5 space-y-6 animate-fade-in text-left">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                  
                                  {/* Left col: Monthly aggregated present report */}
                                  <div className="md:col-span-5 space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                                      <span className="text-[11px] font-black text-gray-750 uppercase tracking-wider block">
                                        All Month Reports
                                      </span>
                                      <span className="text-[10px] text-gray-400">Monthly Aggregations</span>
                                    </div>

                                    {Object.keys(monthlyReports).length === 0 ? (
                                      <div className="p-6 text-center bg-white border border-gray-150 rounded-xl text-xs text-gray-400">
                                        No aggregate monthly logs available for this staff.
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {Object.entries(monthlyReports).map(([mName, mData]) => {
                                          const monthHours = mData.hours;
                                          const monthDays = mData.days;
                                          return (
                                            <div key={mName} className="p-3 bg-white border border-gray-150 rounded-xl space-y-2">
                                              <div className="flex justify-between items-center">
                                                <span className="font-extrabold text-xs text-gray-800">{mName}</span>
                                                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold font-mono">
                                                  {monthDays} present
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-2 gap-2 text-[9px] uppercase text-gray-400 font-bold pt-1 border-t border-gray-100">
                                                <div>
                                                  <span>Present Ratio</span>
                                                  <span className="block text-xs font-black text-gray-800 font-mono mt-0.5">100% active</span>
                                                </div>
                                                <div>
                                                  <span>Total Shift Hours</span>
                                                  <span className="block text-xs font-black text-gray-800 font-mono mt-0.5">{monthHours.toFixed(1)} hrs</span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Manual Attendance Timing Injector Form */}
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-2.5">
                                      <span className="text-[10px] font-black text-[#0B5D1E] uppercase tracking-wider block">
                                        Log Overtime & Correction Timing
                                      </span>
                                      
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[8px] uppercase tracking-wider text-gray-500 font-extrabold mb-0.5">Date</label>
                                          <input
                                            type="date"
                                            value={manualPunchForm.date}
                                            onChange={(e) => setManualPunchForm({ ...manualPunchForm, date: e.target.value })}
                                            className="w-full px-2 py-1.5 text-xs border rounded bg-white text-gray-700"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] uppercase tracking-wider text-gray-500 font-extrabold mb-0.5">Hours Worked</label>
                                          <input
                                            type="number"
                                            step="0.1"
                                            value={manualPunchForm.totalHours}
                                            onChange={(e) => setManualPunchForm({ ...manualPunchForm, totalHours: e.target.value })}
                                            className="w-full px-2 py-1.5 text-xs border rounded bg-white text-gray-700 font-mono font-bold"
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[8px] uppercase tracking-wider text-gray-500 font-extrabold mb-0.5">Punch-In Time</label>
                                          <input
                                            type="text"
                                            value={manualPunchForm.punchIn}
                                            onChange={(e) => setManualPunchForm({ ...manualPunchForm, punchIn: e.target.value })}
                                            className="w-full px-2 py-1.5 text-xs border rounded bg-white text-gray-700 font-mono"
                                            placeholder="09:00:00 AM"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] uppercase tracking-wider text-gray-500 font-extrabold mb-0.5">Punch-Out Time</label>
                                          <input
                                            type="text"
                                            value={manualPunchForm.punchOut}
                                            onChange={(e) => setManualPunchForm({ ...manualPunchForm, punchOut: e.target.value })}
                                            className="w-full px-2 py-1.5 text-xs border rounded bg-white text-gray-700 font-mono"
                                            placeholder="06:00:00 PM"
                                          />
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleAddManualPunch(emp.id, emp.fullName, emp.department)}
                                        className="w-full py-2 bg-[#0B5D1E] hover:bg-[#1E4625] text-white text-[10px] uppercase font-black tracking-wider rounded-lg transition-colors mt-2 text-center"
                                      >
                                        Log Core Timing Session
                                      </button>
                                    </div>
                                  </div>

                                  {/* Right col: Attendance list (Punch-In & Punch-Out logs) */}
                                  <div className="md:col-span-7 space-y-3">
                                    <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                                      <span className="text-[11px] font-black text-gray-750 uppercase tracking-wider block font-sans">
                                        Shift Clock Timing Log History
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-mono font-bold">
                                        {empAttDocs.length} Attendance Records
                                      </span>
                                    </div>

                                    {empAttDocs.length === 0 ? (
                                      <div className="p-12 text-center bg-white border border-gray-150 rounded-xl text-xs text-gray-400">
                                        No daily shift sessions logged inside system memory.
                                      </div>
                                    ) : (
                                      <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                                        {empAttDocs.map((att) => (
                                          <div key={att.id} className="p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-between hover:border-gray-300 transition-colors">
                                            <div className="space-y-1">
                                              <span className="block text-xs font-black text-gray-800">
                                                {att.date}
                                              </span>
                                              <div className="flex flex-wrap items-center gap-3 text-3xs font-mono font-bold text-gray-400">
                                                <span className="flex items-center space-x-1">
                                                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                                  <span className="text-gray-500">PUNCH IN: {att.punchIn}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                  <Clock className="w-3 h-3 text-red-600 shrink-0" />
                                                  <span className="text-gray-500">PUNCH OUT: {att.punchOut || 'In-Progress'}</span>
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex flex-col items-end space-y-1 text-right">
                                              <span className="text-[11px] font-mono font-black text-[#0B5D1E] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                                {formatPreciseDuration(att.punchIn, att.punchOut)}
                                              </span>
                                              <span className="block text-[9px] text-gray-500 font-sans font-medium">
                                                ({att.totalHours.toFixed(2)} hrs)
                                              </span>
                                              {confirmDeletePunchId === att.id ? (
                                                <div className="flex items-center space-x-1 bg-red-55 px-1 py-0.5 rounded border border-red-200">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      handleDeleteManualPunch(att.id);
                                                      setConfirmDeletePunchId(null);
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded px-1 text-[8px] font-bold uppercase"
                                                    title="Confirm"
                                                  >
                                                    Yes
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => setConfirmDeletePunchId(null)}
                                                    className="text-gray-550 hover:text-gray-700 text-[8px] font-bold px-0.5"
                                                    title="Cancel"
                                                  >
                                                    No
                                                  </button>
                                                </div>
                                              ) : (
                                                <button
                                                  type="button"
                                                  onClick={() => setConfirmDeletePunchId(att.id)}
                                                  className="text-red-500 p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                  title="Delete Timing Register"
                                                >
                                                  <X className="h-3 w-3" />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      };

                      if (groupStaffByDept) {
                        // Group active employees by unique departments
                        const departmentsWithEmps = DEFAULT_DEPT_FORMS.filter(
                          dept => selectedStaffDept === 'All' || dept.id === selectedStaffDept
                        );

                        return (
                          <div className="space-y-8">
                            {departmentsWithEmps.map(dept => {
                              const deptEmployees = filteredEmps.filter(e => e.department === dept.id);
                              if (deptEmployees.length === 0) return null;

                              return (
                                <div key={dept.id} className="space-y-3">
                                  <div className="flex items-center space-x-2 border-b-2 border-slate-200 pb-1.5 mt-4">
                                    <span className="w-2.5 h-2.5 bg-[#0B5D1E] rounded-full"></span>
                                    <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider font-sans">
                                      {dept.id} Department ({deptEmployees.length})
                                    </h4>
                                  </div>

                                  <div className="space-y-4">
                                    {deptEmployees.map(renderEmployeeCard)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="space-y-4">
                            {filteredEmps.map(renderEmployeeCard)}
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* --- BLOCK 4: CUSTOMIZABLE DEPT QUESTIONS --- */}
            {activeTab === 'depts' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-black text-gray-900">Custom EOD Question Builder</h3>
                  <p className="text-3xs text-gray-400">Map custom lists of daily fields that employees submit at shift closure</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: list of departments */}
                  <div className="sm:col-span-5 space-y-2">
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-gray-400 block px-2">CHOOSE DEPARTMENT</span>
                    {deptConfigs.map((cfg) => (
                      <button
                        key={cfg.id}
                        onClick={() => handleSelectDeptConfig(cfg)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-between border ${
                          selectedDeptConfig?.id === cfg.id
                            ? 'bg-[#0B5D1E] text-white border-transparent shadow-xs'
                            : 'bg-white border-gray-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{cfg.id}</span>
                        <span className="text-[10px] opacity-75 font-mono">({cfg.questions.length} questions)</span>
                      </button>
                    ))}
                  </div>

                  {/* Right Column: Custom question builder for chosen department */}
                  <div className="sm:col-span-7 bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                    {selectedDeptConfig ? (
                      <div className="space-y-4">
                        <div className="border-b pb-2">
                          <span className="text-3xs text-gray-400 uppercase font-black block">EDITING DIVISION</span>
                          <h4 className="text-md font-black text-gray-900">{selectedDeptConfig.id} Daily Template</h4>
                        </div>

                        {/* List questions */}
                        <div className="space-y-2">
                          {selectedDeptConfig.questions.map((q, qK) => (
                            <div key={qK} className="p-3 bg-white rounded-lg border border-gray-150 flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-700">{q}</span>
                              <button
                                onClick={() => handleRemoveQuestionFromDept(qK)}
                                className="text-red-500 hover:text-red-700 font-extrabold font-mono text-sm block"
                                title="Remove question field"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Append form */}
                        <div className="pt-4 border-t border-gray-200 space-y-2.5">
                          <label className="block text-3xs font-extrabold uppercase text-gray-400">Append Custom Inquiry Question</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newQuestionStr}
                              onChange={(e) => setNewQuestionStr(e.target.value)}
                              placeholder="e.g. Average procurement price today"
                              className="flex-1 px-3 py-2 border bg-white rounded-lg text-xs"
                            />
                            <button
                              onClick={handleAddQuestionToDept}
                              className="px-4 py-2 bg-[#0B5D1E] text-white font-black text-xs uppercase rounded-lg"
                            >
                              Add Field
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-450 text-xs">
                        Select a department from left column to view or rebuild its custom daily closure report.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* --- BLOCK 5: LEAVES REVIEW SCREEN --- */}
            {activeTab === 'leaves' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Out of logs */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Pending Employee Leave Requests</h3>
                    <p className="text-3xs text-gray-400">Audit in real-time, click to Approve or Deny</p>
                  </div>

                  {leaves.filter(x => x.status === 'Pending').length === 0 ? (
                    <div className="p-6 bg-slate-50 border p-12 text-center text-xs text-gray-400 rounded-xl">
                      No active pending leaves. Excellent, all personnel on station!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leaves.filter(x => x.status === 'Pending').map((lv) => (
                        <div key={lv.id} className="p-5 border border-zinc-200 rounded-2xl bg-white shadow-sm flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2.5">
                              <span className="font-black text-gray-950 text-sm">{lv.employeeName}</span>
                              <span className="text-[9px] bg-slate-100 text-[#0B5D1E] px-2 py-0.5 rounded-md font-bold">{lv.department}</span>
                            </div>
                            <p className="text-xs font-semibold text-zinc-650">
                              Duration: <strong>{lv.fromDate}</strong> to <strong>{lv.toDate}</strong>
                            </p>
                            <p className="text-xs text-zinc-500 italic">"Reason: {lv.reason}"</p>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => handleUpdateLeaveStatus(lv.id, 'Approved')}
                              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                            >
                              <Check className="h-4 w-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(lv.id, 'Rejected')}
                              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                            >
                              <X className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* HISTORICAL WORKER REPORTS */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                        <FileText className="h-5 w-5 text-[#0B5D1E]" />
                        <span>All Month EOD Labor Work Reports (सर्व महिन्यांचे ईओडी रिपोर्ट)</span>
                      </h4>
                      <p className="text-3xs text-gray-400">Filter, search, and review shift logs submitted by all staff members</p>
                    </div>

                    {/* Export EOD Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = eodReports.filter(rep => {
                          if (selectedEodMonth !== 'all') {
                            const m = rep.date.split('-')[1];
                            if (m !== selectedEodMonth) return false;
                          }
                          if (searchEodText.trim()) {
                            const q = searchEodText.toLowerCase();
                            const matchesName = rep.employeeName.toLowerCase().includes(q);
                            const matchesDept = rep.department.toLowerCase().includes(q);
                            if (!matchesName && !matchesDept) return false;
                          }
                          return true;
                        });

                        const csvContent = "data:text/csv;charset=utf-8," 
                          + "ID,Name,Department,Date,Submitted At,Questions & Answers\n"
                          + filtered.map(e => `"${e.id}","${e.employeeName}","${e.department}","${e.date}","${e.submittedAt}","${e.answers.map(a => `${a.question}: ${a.answer}`).join(' | ')}"`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `PJ_Industries_EOD_Report_${selectedEodMonth === 'all' ? 'AllMonths' : `Month_${selectedEodMonth}`}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3.5 py-2 bg-emerald-700/10 hover:bg-emerald-700/20 text-[#0B5D1E] font-black text-3xs uppercase tracking-wider rounded-xl transition-all border border-emerald-700/20 self-start md:self-auto"
                    >
                      Export EODs (CSV)
                    </button>
                  </div>

                  {/* Filter Controls Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                    {/* Month Dropdown */}
                    <div>
                      <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Select Month / महिना निवडा</label>
                      <select
                        value={selectedEodMonth}
                        onChange={(e) => setSelectedEodMonth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 shadow-3xs"
                      >
                        <option value="all">All Months / सर्व महिने</option>
                        <option value="01">January / जानेवारी (01)</option>
                        <option value="02">February / फेब्रुवारी (02)</option>
                        <option value="03">March / मार्च (03)</option>
                        <option value="04">April / एप्रिल (04)</option>
                        <option value="05">May / मे (05)</option>
                        <option value="06">June / जून (06)</option>
                        <option value="07">July / जुलै (07)</option>
                        <option value="08">August / ऑगस्ट (08)</option>
                        <option value="09">September / सप्टेंबर (09)</option>
                        <option value="10">October / ऑक्टोबर (10)</option>
                        <option value="11">November / नोव्हेंबर (11)</option>
                        <option value="12">December / डिसेंबर (12)</option>
                      </select>
                    </div>

                    {/* Search Input */}
                    <div>
                      <label className="block text-3xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Search Staff / कर्मचाऱ्याचे नाव</label>
                      <input
                        type="text"
                        placeholder="Type staff name or department..."
                        value={searchEodText}
                        onChange={(e) => setSearchEodText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 shadow-3xs placeholder-gray-400 font-sans"
                      />
                    </div>
                  </div>

                  {/* Render filtered items */}
                  {(() => {
                    const filtered = eodReports.filter(rep => {
                      if (selectedEodMonth !== 'all') {
                        const m = rep.date.split('-')[1];
                        if (m !== selectedEodMonth) return false;
                      }
                      if (searchEodText.trim()) {
                        const q = searchEodText.toLowerCase();
                        const matchesName = rep.employeeName.toLowerCase().includes(q);
                        const matchesDept = rep.department.toLowerCase().includes(q);
                        if (!matchesName && !matchesDept) return false;
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 bg-slate-50 border text-center text-xs text-gray-400 rounded-xl">
                          No EOD reports registered matching these criteria.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {filtered.map((rep) => (
                          <div key={rep.id} className="p-4 bg-white border border-gray-200 hover:border-[#0B5D1E]/30 rounded-xl space-y-2.5 transition-all shadow-3xs">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-2xs uppercase tracking-wider text-[#0B5D1E] font-black border-b border-gray-150 pb-1.5 gap-1.5">
                              <span className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>
                                {rep.employeeName} ({rep.department})
                              </span>
                              <span className="font-mono text-gray-400">Submitted: {rep.date} @ {rep.submittedAt}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                              {rep.answers.map((ans, idx) => (
                                <div key={idx} className="bg-gray-55/40 p-2.5 rounded-lg border border-gray-100 flex flex-col justify-between">
                                  <span className="font-black text-zinc-400 text-3xs uppercase tracking-wider block mb-0.5">{ans.question}</span>
                                  <span className="text-gray-800 font-mono text-[11.5px] leading-relaxed block">{ans.answer}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}

            {/* --- BLOCK 6: DEALER INQUIRIES --- */}
            {activeTab === 'dealers' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="text-lg font-black text-gray-905">B2B Dealership Pipeline Applications</h3>
                    <p className="text-3xs text-gray-400">Candidate profiles requesting agency rights across Maharashtra</p>
                  </div>

                  <button
                    onClick={handleExportDealers}
                    className="px-3.5 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Dealer Data</span>
                  </button>
                </div>

                {dealerQueries.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    No dealership applications logged yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dealerQueries.map((deal) => (
                      <div key={deal.id} className="p-5 border border-zinc-200 rounded-2xl space-y-4 bg-white shadow-xs">
                        
                        {/* Summary Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-2">
                          <div>
                            <span className="bg-[#FFC107] text-[#222222] font-black text-3xs uppercase px-2 py-0.5 rounded-md inline-block mb-1">
                              {deal.businessName}
                            </span>
                            <h4 className="font-black text-[#222222] text-sm leading-tight">{deal.fullName}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-4xs font-black uppercase px-2 py-0.5 rounded-md ${
                              deal.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              deal.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Status: {deal.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteDealerQuery(deal.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Dealership Application"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Candidate fields mapping */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 block font-bold text-3xs uppercase">Primary Phone</span>
                            <span className="font-bold text-gray-800 block">{deal.mobile}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-bold text-3xs uppercase">District & State</span>
                            <span className="text-gray-800 block">{deal.district}, {deal.state}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-bold text-3xs uppercase">Experience Level</span>
                            <span className="text-gray-800 block">{deal.experience}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block font-bold text-3xs uppercase">Targeted feed</span>
                            <span className="text-gray-800 block font-bold text-[#0B5D1E]">{deal.interestedProduct}</span>
                          </div>
                        </div>

                        <div className="text-xs bg-gray-50 p-3 rounded-lg border border-gray-150 leading-relaxed text-zinc-650">
                          <strong>Address Details:</strong> {deal.address} <br />
                          <strong>Candidate Message:</strong> {deal.message}
                        </div>

                        {/* Decision actions */}
                        {deal.status === 'Pending' && (
                          <div className="flex items-center space-x-2 justify-end pt-2">
                            <button
                              onClick={() => handleUpdateDealerStatus(deal.id, 'Approved')}
                              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold leading-none"
                            >
                              Approve Dealership
                            </button>
                            <button
                              onClick={() => handleUpdateDealerStatus(deal.id, 'Rejected')}
                              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold leading-none"
                            >
                              Deny Application
                            </button>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- BLOCK 7: DYNAMIC CONTENT PANEL (CMS) --- */}
            {activeTab === 'cms' && aboutUs && (
              <form onSubmit={handleSaveCms} className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-black text-gray-901">Corporate Content Management (CMS)</h3>
                  <p className="text-3xs text-gray-400 font-sans">Modify primary About page texts, owner profile photo, and marketing missions on the fly</p>
                </div>

                {/* Company Story (En & Mr) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50">
                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Company Story (English)</label>
                    <textarea
                      rows={4}
                      value={aboutUs.story || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, story: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="Enter company story in English"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1 font-sans">Company Story (मराठी)</label>
                    <textarea
                      rows={4}
                      value={aboutUs.storyMr || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, storyMr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs mr-1"
                      placeholder="कंपनीची पार्श्वभूमी मराठीत लिहा"
                    />
                  </div>
                </div>

                {/* Mission & Vision Statements (En & Mr) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50">
                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1 font-sans">Mission statement En</label>
                    <textarea
                      rows={2}
                      value={aboutUs.mission || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, mission: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="Enter mission in English"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1 font-sans">Mission Statement Mr (मराठी)</label>
                    <textarea
                      rows={2}
                      value={aboutUs.missionMr || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, missionMr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="कंपनीचे ध्येय मराठीत लिहा"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50">
                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1 font-sans">Vision statement En</label>
                    <textarea
                      rows={2}
                      value={aboutUs.vision || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, vision: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="Enter vision in English"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1 font-sans">Vision Statement Mr (मराठी)</label>
                    <textarea
                      rows={2}
                      value={aboutUs.visionMr || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, visionMr: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="कंपनीचे उद्दिष्ट मराठीत लिहा"
                    />
                  </div>
                </div>

                {/* Founder Controls Container */}
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50 space-y-4">
                  <h4 className="text-2xs font-extrabold uppercase tracking-wider text-[#0B5D1E]">Founder & Owner Profile Settings</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Founder Full Name</label>
                      <input
                        type="text"
                        value={aboutUs.founderName || ''}
                        onChange={(e) => setAboutUs({ ...aboutUs, founderName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Foundation Date</label>
                      <input
                        type="date"
                        value={aboutUs.foundationDate || ''}
                        onChange={(e) => setAboutUs({ ...aboutUs, foundationDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="block text-3xs font-black uppercase text-gray-550">Company Owner Photo</label>
                      <div className="flex items-center space-x-3">
                        {/* Preview Circle */}
                        <div className="w-12 h-12 rounded-full border-2 border-[#FFC107] overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                          {aboutUs.founderPhoto ? (
                            <img
                              src={aboutUs.founderPhoto}
                              alt="Owner preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold">No Image</span>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          {/* File Uploader Button & Inputs */}
                          <div className="flex items-center space-x-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-[#0B5D1E] hover:bg-[#084817] text-white rounded text-[11px] font-bold transition-all duration-200 block text-center shadow-xs">
                              <span>Upload Photo File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const img = new Image();
                                    img.onload = () => {
                                      const canvas = document.createElement('canvas');
                                      const MAX_WIDTH = 300;
                                      const MAX_HEIGHT = 300;
                                      let width = img.width;
                                      let height = img.height;

                                      if (width > height) {
                                        if (width > MAX_WIDTH) {
                                          height *= MAX_WIDTH / width;
                                          width = MAX_WIDTH;
                                        }
                                      } else {
                                        if (height > MAX_HEIGHT) {
                                          width *= MAX_HEIGHT / height;
                                          height = MAX_HEIGHT;
                                        }
                                      }

                                      canvas.width = width;
                                      canvas.height = height;
                                      const ctx = canvas.getContext('2d');
                                      if (ctx) {
                                        ctx.drawImage(img, 0, 0, width, height);
                                        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                        setAboutUs({ ...aboutUs, founderPhoto: dataUrl });
                                      }
                                    };
                                    img.src = event.target?.result as string;
                                  };
                                  reader.readAsDataURL(file);
                                }}
                                className="hidden"
                              />
                            </label>

                            {aboutUs.founderPhoto && (
                              <button
                                type="button"
                                onClick={() => setAboutUs({ ...aboutUs, founderPhoto: '' })}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded text-[11px] font-bold border border-red-200 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          {/* Fallback Text Input for URL */}
                          <input
                            type="text"
                            value={aboutUs.founderPhoto || ''}
                            onChange={(e) => setAboutUs({ ...aboutUs, founderPhoto: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-[10px] font-mono text-gray-600 focus:outline-emerald-600"
                            placeholder="Or paste an image URL directly..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Founder Biography / Bio</label>
                    <textarea
                      rows={3}
                      value={aboutUs.founderBio || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, founderBio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="Enter founder's professional background and history"
                    />
                  </div>
                </div>

                {/* Homepage Dynamic Media Settings */}
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50 space-y-5">
                  <h4 className="text-2xs font-extrabold uppercase tracking-wider text-[#0B5D1E] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FFC107]"></span>
                    Homepage Dynamic Media & Image Sections
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-sans">
                    Upload beautiful and optimized cow images for the website, optimized dynamically for desktop and mobile layouts.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

                    {/* Hero Carousel Sliders Playlist (3-4 Carousel Photos) */}
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs md:col-span-2">
                      <label className="block text-3xs font-black uppercase tracking-wider text-gray-550 flex items-center justify-between">
                        <span>Hero Carousel Sliders Playlist (Recommend 3-4 High Resolution Photos)</span>
                        <span className="text-[#0B5D1E] bg-emerald-50 px-2.5 py-0.5 rounded-full text-[9px] font-bold">Active count: {aboutUs.heroPhotos?.length || 0}</span>
                      </label>
                      
                      {/* Flex grid of current slides */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(aboutUs.heroPhotos || []).map((slideUrl, sIdx) => (
                          <div key={sIdx} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-[16/10] bg-gray-50 flex flex-col justify-end shadow-xs">
                            <img
                              src={slideUrl}
                              alt={`Slide ${sIdx + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedPhotos = (aboutUs.heroPhotos || []).filter((_, filterIdx) => filterIdx !== sIdx);
                                  setAboutUs({ ...aboutUs, heroPhotos: updatedPhotos });
                                }}
                                className="px-3 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg shadow-md transition-all text-[10px] font-bold animate-fade-in"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="bg-stone-900/80 text-white text-[9px] font-bold text-center py-1 z-10 select-none">
                              Slide {sIdx + 1}
                            </div>
                          </div>
                        ))}

                        {/* Add Slide Trigger Button */}
                        {(!aboutUs.heroPhotos || aboutUs.heroPhotos.length < 5) && (
                          <label className="cursor-pointer border-2 border-dashed border-stone-300 hover:border-[#0B5D1E] rounded-xl flex flex-col items-center justify-center p-3 aspect-[16/10] bg-stone-50 hover:bg-stone-100/50 transition-colors group">
                            <Plus className="h-5 w-5 text-stone-400 group-hover:text-[#0B5D1E] mb-1" />
                            <span className="text-[10px] font-black uppercase text-stone-500 text-center leading-tight">Add Slide</span>
                            <span className="text-[9px] text-stone-400 leading-none mt-0.5">Max 5 images</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const MAX_WIDTH = 1200;
                                    const MAX_HEIGHT = 800;
                                    let width = img.width;
                                    let height = img.height;

                                    if (width > height) {
                                      if (width > MAX_WIDTH) {
                                        height *= MAX_WIDTH / width;
                                        width = MAX_WIDTH;
                                      }
                                    } else {
                                      if (height > MAX_HEIGHT) {
                                        width *= MAX_HEIGHT / height;
                                        height = MAX_HEIGHT;
                                      }
                                    }

                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0, width, height);
                                      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                                      const currentList = aboutUs.heroPhotos || [];
                                      setAboutUs({ ...aboutUs, heroPhotos: [...currentList, dataUrl] });
                                    }
                                  };
                                  img.src = event.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="text-[10px] text-stone-500 leading-normal bg-stone-100/50 p-2.5 rounded-lg">
                        Tip: Upload custom slides directly using the plus button. Images are automatically optimized and downscaled to stay fast and friendly on responsive mobile and desktop screen views.
                      </div>
                    </div>

                    {/* Product Overview Section Photo */}
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs">
                      <label className="block text-3xs font-black uppercase tracking-wider text-gray-550">
                        2. Natural Cattle Overview Photo
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-50 border border-stone-200 flex items-center justify-center shrink-0 shadow-inner">
                          {aboutUs.productOverviewPhoto ? (
                            <img
                              src={aboutUs.productOverviewPhoto}
                              alt="Overview preview"
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-[9px] text-gray-400 font-bold">No Image</span>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                          <label className="cursor-pointer px-3 py-2 bg-[#0B5D1E] hover:bg-[#084817] text-white rounded-lg text-[11px] font-bold transition-all block text-center shadow-xs">
                            <span>Upload Overview Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    const MAX_WIDTH = 800;
                                    const MAX_HEIGHT = 600;
                                    let width = img.width;
                                    let height = img.height;

                                    if (width > height) {
                                      if (width > MAX_WIDTH) {
                                        height *= MAX_WIDTH / width;
                                        width = MAX_WIDTH;
                                      }
                                    } else {
                                      if (height > MAX_HEIGHT) {
                                        width *= MAX_HEIGHT / height;
                                        height = MAX_HEIGHT;
                                      }
                                    }

                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0, width, height);
                                      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                      setAboutUs({ ...aboutUs, productOverviewPhoto: dataUrl });
                                    }
                                  };
                                  img.src = event.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="text"
                            value={aboutUs.productOverviewPhoto || ''}
                            onChange={(e) => setAboutUs({ ...aboutUs, productOverviewPhoto: e.target.value })}
                            className="w-full px-2 py-1.5 border border-stone-200 rounded-md text-[10px] font-mono text-gray-600 focus:outline-emerald-600"
                            placeholder="Or paste direct image URL..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Production Process Gallery Section / उत्पादन प्रक्रिया छायाचित्रे */}
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-stone-200/60 shadow-xs md:col-span-2">
                      <label className="block text-3xs font-black uppercase tracking-wider text-gray-550 flex items-center justify-between">
                        <span>3. Production Process Gallery / उत्पादन प्रक्रिया छायाचित्रे</span>
                        <span className="text-[#0B5D1E] bg-emerald-50 px-2.5 py-0.5 rounded-full text-[9px] font-bold">Active count: {(aboutUs.productionPhotos || []).length}</span>
                      </label>

                      {/* Flex grid of current gallery items */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(aboutUs.productionPhotos || []).map((photo, pIdx) => (
                          <div key={pIdx} className="relative rounded-xl overflow-hidden border border-stone-200 bg-gray-50 flex flex-col justify-between shadow-xs">
                            <div className="relative aspect-[4/3]">
                              <img
                                src={photo.url}
                                alt={`Process ${pIdx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedPhotos = (aboutUs.productionPhotos || []).filter((_, filterIdx) => filterIdx !== pIdx);
                                  setAboutUs({ ...aboutUs, productionPhotos: updatedPhotos });
                                }}
                                className="absolute top-2 right-2 px-2 py-1 bg-red-650 hover:bg-red-750 text-white rounded text-[9px] font-bold shadow transition-all"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="p-2 space-y-2 bg-stone-50 border-t border-stone-100">
                              <div>
                                <label className="block text-[9px] text-gray-500 font-extrabold uppercase mb-0.5">Caption (En)</label>
                                <input
                                  type="text"
                                  value={photo.captionEn}
                                  onChange={(e) => {
                                    const updated = [...(aboutUs.productionPhotos || [])];
                                    updated[pIdx] = { ...updated[pIdx], captionEn: e.target.value };
                                    setAboutUs({ ...aboutUs, productionPhotos: updated });
                                  }}
                                  className="w-full px-2 py-1 border border-stone-200 rounded text-[11px] font-sans"
                                  placeholder="English caption..."
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-gray-500 font-extrabold uppercase mb-0.5">Caption (मराठी)</label>
                                <input
                                  type="text"
                                  value={photo.captionMr}
                                  onChange={(e) => {
                                    const updated = [...(aboutUs.productionPhotos || [])];
                                    updated[pIdx] = { ...updated[pIdx], captionMr: e.target.value };
                                    setAboutUs({ ...aboutUs, productionPhotos: updated });
                                  }}
                                  className="w-full px-2 py-1 border border-stone-200 rounded text-[11px]"
                                  placeholder="मराठीत शीर्षक लिहा..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add new photo to process gallery widget */}
                      <div className="border border-dashed border-[#0B5D1E]/40 p-4 rounded-xl bg-emerald-50/20 space-y-3">
                        <span className="block text-2xs font-extrabold uppercase tracking-wide text-primary">Add a production process photo</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-3 flex flex-col space-y-1">
                            <label className="text-[10px] text-stone-500 font-extrabold uppercase">Upload Photo / URL</label>
                            
                            <div className="flex items-center space-x-2">
                              <label className="cursor-pointer px-2.5 py-1.5 bg-primary hover:bg-[#074817] text-white rounded text-[10px] font-bold transition-all text-center shrink-0 shadow-xs">
                                <span>Choose File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const img = new Image();
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        const MAX_WIDTH = 600;
                                        const MAX_HEIGHT = 450;
                                        let width = img.width;
                                        let height = img.height;

                                        if (width > height) {
                                          if (width > MAX_WIDTH) {
                                            height *= MAX_WIDTH / width;
                                            width = MAX_WIDTH;
                                          }
                                        } else {
                                          if (height > MAX_HEIGHT) {
                                            width *= MAX_HEIGHT / height;
                                            height = MAX_HEIGHT;
                                          }
                                        }

                                        canvas.width = width;
                                        canvas.height = height;
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                          ctx.drawImage(img, 0, 0, width, height);
                                          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                                          setNewProdPhotoUrl(dataUrl);
                                        }
                                      };
                                      img.src = event.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {newProdPhotoUrl && (
                                <div className="w-8 h-8 rounded border overflow-hidden shrink-0 bg-white">
                                  <img src={newProdPhotoUrl} alt="prev" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-[8px] sm:text-[9px] text-stone-500 font-extrabold uppercase mb-0.5">Or Paste Direct URL</label>
                            <input
                              type="text"
                              value={newProdPhotoUrl.startsWith('data:') ? '' : newProdPhotoUrl}
                              onChange={(e) => setNewProdPhotoUrl(e.target.value)}
                              className="w-full px-2 py-1.5 border border-stone-200 rounded text-xs"
                              placeholder="https://images.unsplash..."
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-[8px] sm:text-[9px] text-stone-500 font-extrabold uppercase mb-0.5">Caption (English)</label>
                            <input
                              type="text"
                              value={newProdPhotoEn}
                              onChange={(e) => setNewProdPhotoEn(e.target.value)}
                              className="w-full px-2 py-1.5 border border-stone-200 rounded text-xs"
                              placeholder="e.g. Twin-shaft extrusion"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[8px] sm:text-[9px] text-stone-500 font-extrabold uppercase mb-0.5">Caption (मराठी)</label>
                            <input
                              type="text"
                              value={newProdPhotoMr}
                              onChange={(e) => setNewProdPhotoMr(e.target.value)}
                              className="w-full px-2 py-1.5 border border-stone-200 rounded text-xs"
                              placeholder="शीर्षक भरा..."
                            />
                          </div>

                          <div className="md:col-span-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newProdPhotoUrl) {
                                  alert("Please upload an image or provide a valid URL.");
                                  return;
                                }
                                const current = aboutUs.productionPhotos || [];
                                const newItem = {
                                  url: newProdPhotoUrl,
                                  captionEn: newProdPhotoEn || "Factory processing",
                                  captionMr: newProdPhotoMr || "प्रक्रिया छायाचित्र"
                                };
                                setAboutUs({
                                  ...aboutUs,
                                  productionPhotos: [...current, newItem]
                                });
                                // Clear input states
                                setNewProdPhotoUrl('');
                                setNewProdPhotoEn('');
                                setNewProdPhotoMr('');
                                showToast("Photo added successfully to production process! Don't forget to click Save below.");
                              }}
                              className="w-full py-1.5 bg-primary text-white rounded font-bold text-xs"
                              title="Add to gallery list"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Technical / Factory Parameters */}
                <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/50 space-y-4">
                  <h4 className="text-2xs font-extrabold uppercase tracking-wider text-[#0B5D1E]">Manufacturing Plant Parameters</h4>

                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Manufacturing Plant Details</label>
                    <input
                      type="text"
                      value={aboutUs.factoryDetails || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, factoryDetails: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Production Process Steps</label>
                    <textarea
                      rows={2}
                      value={aboutUs.productionProcess || ''}
                      onChange={(e) => setAboutUs({ ...aboutUs, productionProcess: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="e.g. Grain sorting -> Steam Cooker pelletization..."
                    />
                  </div>

                  <div>
                    <label className="block text-3xs font-black uppercase text-gray-550 mb-1">Certifications & Licenses (comma-separated list)</label>
                    <input
                      type="text"
                      value={(aboutUs.certifications || []).join(', ')}
                      onChange={(e) => setAboutUs({ 
                        ...aboutUs, 
                        certifications: e.target.value.split(',').map(x => x.trim()).filter(Boolean) 
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                      placeholder="e.g. GST: 27APIPJ3647P2Z8 Registered, FSSAI compliance"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-sans">Separate multiple titles with a comma: "Cert A, Cert B, Cert C"</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0B5D1E] text-white font-black uppercase text-xs rounded-xl shadow-md cursor-pointer hover:bg-emerald-800 transition-colors duration-200"
                  >
                    Save All About Us Sections & Owner Photo
                  </button>
                </div>
              </form>
            )}

            {/* --- BLOCK 8: DYNAMIC FIREBASE INTEGRATOR CONNECT PANEL --- */}
            {activeTab === 'fb_integrate' && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-850 leading-relaxed space-y-1.5">
                  <span className="font-black flex items-center space-x-1 text-amber-900">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Real-time persistence configuration guide</span>
                  </span>
                  <p>
                    As requested, PJ INDUSTRIES website features full <strong>B2B dual-engine compatibility</strong>. If you have another custom Firebase Firestore database from *another email account*, you can paste its credentials below! 
                  </p>
                  <p className="font-bold">
                    Once saved, the React client automatically launches the real official Firebase SDK from your browser and binds reads & writes directly to your external cloud-based collections. If you clear the configuration, we return safely back to localStorage simulator state.
                  </p>
                </div>

                <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-500 mb-1">API KEY (apiKey)</label>
                      <input
                        type="password"
                        required
                        value={firebaseInputConfig.apiKey}
                        onChange={(e) => setFirebaseInputConfig({ ...firebaseInputConfig, apiKey: e.target.value })}
                        placeholder="AIzaSyA..."
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-500 mb-1">PROJECT ID (projectId)</label>
                      <input
                        type="text"
                        required
                        value={firebaseInputConfig.projectId}
                        onChange={(e) => setFirebaseInputConfig({ ...firebaseInputConfig, projectId: e.target.value })}
                        placeholder="pj-industries-doodhurja"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-500 mb-1">AUTH DOMAIN (authDomain)</label>
                      <input
                        type="text"
                        value={firebaseInputConfig.authDomain}
                        onChange={(e) => setFirebaseInputConfig({ ...firebaseInputConfig, authDomain: e.target.value })}
                        placeholder="pj-industries.firebaseapp.com"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-500 mb-1">APP ID (appId)</label>
                      <input
                        type="text"
                        value={firebaseInputConfig.appId}
                        onChange={(e) => setFirebaseInputConfig({ ...firebaseInputConfig, appId: e.target.value })}
                        placeholder="1:123456789:web:abcd"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-500 mb-1">STORAGE BUCKET</label>
                      <input
                        type="text"
                        value={firebaseInputConfig.storageBucket}
                        onChange={(e) => setFirebaseInputConfig({ ...firebaseInputConfig, storageBucket: e.target.value })}
                        placeholder="pj-industries.appspot.com"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-black uppercase text-gray-500 mb-1">SENDER ID (messagingSenderId)</label>
                      <input
                        type="text"
                        value={firebaseInputConfig.messagingSenderId}
                        onChange={(e) => setFirebaseInputConfig({ ...firebaseInputConfig, messagingSenderId: e.target.value })}
                        placeholder="4512348912"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-[#0B5D1E] text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Check className="h-4 w-4" />
                      <span>Bind Live Database Connection</span>
                    </button>

                    {firebaseStatus.configExists && (
                      <button
                        type="button"
                        onClick={handleClearFirebaseConfig}
                        className="w-full sm:w-auto px-6 py-3 bg-red-650 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Reset to LocalStorage Mode</span>
                      </button>
                    )}
                  </div>
                </form>

              </div>
            )}

            {activeTab === 'feedbacks' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      <MessageSquare className="h-5.5 w-5.5 text-[#0B5D1E]" />
                      <span>Farmer Feedbacks & Reviews Records</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      View all reviews submitted by farmers. As requested, names, mobile numbers, villages and district locations are displayed here, with delete capability.
                    </p>
                  </div>
                </div>

                {farmerFeedbacks.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-500">No feedbacks registered yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Submit feedbacks from the homepage Testimonials section to see them here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-150 rounded-2xl shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 font-black uppercase text-gray-500">
                          <th className="p-4">Farmer Name</th>
                          <th className="p-4">Mobile No</th>
                          <th className="p-4">Village</th>
                          <th className="p-4">District</th>
                          <th className="p-4">Rating</th>
                          <th className="p-4">Feedback / Review</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {farmerFeedbacks.map((fb) => (
                          <tr key={fb.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 font-extrabold text-gray-900">{fb.fullName}</td>
                            <td className="p-4 font-mono select-all text-[#0B5D1E] font-bold">{fb.mobile}</td>
                            <td className="p-4 text-gray-650">{fb.village}</td>
                            <td className="p-4 text-gray-650 font-bold">{fb.district}</td>
                            <td className="p-4 text-amber-500 font-extrabold text-sm">
                              {'★'.repeat(fb.rating || 5)}{'☆'.repeat(5 - (fb.rating || 5))} <span className="text-[10px] text-gray-400 font-normal">({fb.rating || 5}/5)</span>
                            </td>
                            <td className="p-4 text-gray-650 max-w-xs truncate" title={fb.review}>{fb.review}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteFarmerFeedback(fb.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold"
                                title="Delete Feedback"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
