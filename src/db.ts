import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDoc,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Error handling types and helpers as mandated by Firebase integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Types for PJ Industries - DOODHURJA App

export interface Product {
  id: string;
  name: string;
  nameMr: string; // Marathi name
  image: string;
  description: string;
  descriptionMr: string;
  advantages: string[];
  advantagesMr: string[];
  ingredients: string[];
  ingredientsMr: string[];
  usage: string;
  usageMr: string;
  price: number;
  category: string;
  status: 'Available' | 'Out of Stock';
}

export interface Employee {
  id: string; // Employee ID e.g. PJ-EMP-101
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  dob: string;
  joiningDate: string;
  aadhaar: string;
  pan: string;
  bankDetails: {
    accountNo: string;
    ifsc: string;
    bankName: string;
  };
  department: string; // Accounts & Finance, HR & Admin, Marketing, NPD Department, Operations, Purchase Department, Sales Department
  designation: string;
  salary: number;
  profilePhoto: string;
  username: string;
  password: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  punchIn: string; // HH:MM:SS
  punchOut: string; // HH:MM:SS or ''
  totalHours: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string; // Sick Leave, Casual Leave, Paid Leave
  reason: string;
  fromDate: string;
  toDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface EodReport {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  answers: { question: string; answer: string }[];
  submittedAt: string;
}

export interface DepartmentConfig {
  id: string; // Department Name
  questions: string[];
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  productInquiry: string;
  message: string;
  submittedAt: string;
  status: 'Unread' | 'Reviewed' | 'Resolved';
}

export interface FarmerFeedback {
  id: string;
  fullName: string;
  mobile: string;
  village: string;
  district: string;
  rating: number;
  review: string;
  submittedAt: string;
}

export interface DealerInquiry {
  id: string;
  fullName: string;
  businessName: string;
  mobile: string;
  email: string;
  address: string;
  district: string;
  state: string;
  experience: string;
  interestedProduct: string;
  message: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AboutUsData {
  story: string;
  storyMr: string;
  mission: string;
  missionMr: string;
  vision: string;
  visionMr: string;
  foundationDate: string;
  founderName: string;
  founderBio: string;
  founderPhoto?: string;
  heroPhoto?: string;
  heroPhotos?: string[];
  productOverviewPhoto?: string;
  factoryDetails: string;
  productionProcess: string;
  certifications: string[];
  productionPhotos?: {
    url: string;
    captionEn: string;
    captionMr: string;
  }[];
}

// Default Pre-seeded high quality data
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-doodh-1',
    name: 'DOODHURJA Premium Cattle Feed (50 Bag)',
    nameMr: 'दुग्धऊर्जा मका पेंड प्रीमियम (50 किलो बॅग)',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=600',
    description: 'High-energy, protein-enriched steam-cooked cattle feed pellet specifically formulated to enhance lactation yield and cattle health. Formulated with balanced maize grains, bypass amino acids, and essential multi-minerals.',
    descriptionMr: 'दुभत्या जनावरांच्या दुधाची वाढ आणि आरोग्य उत्तम राखण्यासाठी खास तयार केलेले मका पेंड समृद्ध पशू खाद्य. यामध्ये योग्य प्रमाणात प्रथिने, विटामिन्स आणि खनिजे समाविष्ट आहेत.',
    advantages: [
      'Increases fat (FAT) and SNF content in milk up to 15%',
      'Improves digestion and overall biological health of the cow',
      'Provides bypass proteins for sustained energy supply',
      'Contains calcium, phosphorus, and essential vitamins to prevent milk fever'
    ],
    advantagesMr: [
      'दुधातील फॅट (FAT) आणि डिग्री (SNF) १५% पर्यंत वाढवते',
      'जनावरांची पचनक्रिया सुलभ आणि आरोग्य उत्तम राहते',
      'बायपास प्रोटीनमुळे जनावराला शाश्वत ऊर्जा मिळते',
      'कॅल्शियम आणि फॉस्फरसमुळे जनावरांचे हाडे बळकट होतात'
    ],
    ingredients: ['Select Yellow Maize Grounding', 'De-oiled Rice Bran', 'Mustard Extractions', 'Guar Korma', 'Premium Minerals & Vitamins Premix', 'Calcium Phosphates'],
    ingredientsMr: ['निवडक पिवळा मका', 'डी-ऑईल राईस ब्रान', 'मोहरी पेंड', 'गुआर कोरमा', 'खनिज मिश्रण आणि जीवनसत्त्वे', 'कॅल्शियम फॉस्फेट्स'],
    usage: 'Feed 2.5 kg to 3 kg daily for maintenance guidelines, plus 400g extra for every 1 kg milk produced.',
    usageMr: 'दररोज २.५ ते ३ किलो शारीरिक पोषणासाठी द्यावे, अधिक प्रत्येक १ लिटर दूध उत्पादनासाठी ४०० ग्रॅम ज्यादा द्यावे.',
    price: 1450,
    category: 'High Lactation',
    status: 'Available'
  },
  {
    id: 'prod-doodh-2',
    name: 'DOODHURJA Bypass Special Feed',
    nameMr: 'दुग्धऊर्जा बायपास स्पेशल पशू खाद्य',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600',
    description: 'Premium scientific feed loaded with escape (bypass) proteins that directly reach the lower intestine, avoiding rumen degradation. Guaranteed to boost peak milk curve and recovery after calving.',
    descriptionMr: 'विशेष शास्त्रीय पद्धतीने तयार केलेले सुवर्ण-पशू खाद्य जेथे बायपास प्रोटीन थेट पचनसंस्थेत शोषले जातात. प्रसूतीनंतर जनावराला त्वरित ताकद देण्यासाठी अत्यंत फायदेशीर.',
    advantages: [
      'Accelerates reproductive cycle & shortens dry periods',
      'Boosts peak lactation capacity of high yielding crossbred cows',
      'Prevents metabolic disorders like ketosis and acidosis',
      'Visible milk increase in 7 days of scheduled feeding'
    ],
    advantagesMr: [
      'प्रजनन चक्र सुरळीत करते आणि भाकड काळ कमी करते',
      'जास्त दूध देणाऱ्या गायी आणि म्हशींची कमाल उत्पादन क्षमता वाढवते',
      'केटोसिस सारख्या चयापचय आजारांपासून संरक्षण करते',
      'फक्त ७ दिवसात दूध उत्पादनात लक्षणीय वाढ दिसते'
    ],
    ingredients: ['De-oiled Soybean Meal', 'Maize Gluten Meal', 'Bypass Fats', 'Molasses', 'Active Yeast Culture', 'Cattle Salt & trace elements'],
    ingredientsMr: ['डी-ऑईल सोयाबीन मिल', 'मका ग्लुटेन मिल', 'बायपास फॅट', 'मळी', 'सक्रिय यीस्ट कल्चर', 'मीठ आणि खनिज द्रव्ये'],
    usage: 'Mix dry or soaked in warm water. Maintain 3-4 kg daily dose for high yield dairy cows.',
    usageMr: 'कोरडे किंवा कोमट पाण्यात भिजवून द्यावे. जास्त दूध देणाऱ्या गायींसाठी दररोज ३ ते ४ किलो प्रमाण ठेवावे.',
    price: 1680,
    category: 'XBreed Specialist',
    status: 'Available'
  },
  {
    id: 'prod-doodh-3',
    name: 'DOODHURJA Calf Growth Booster',
    nameMr: 'दुग्धऊर्जा कालवड वाढ विशेष',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600',
    description: 'High-protein baby calf starter to encourage early rumen deployment, solid grain consumption, and strong skeletal growth in emerging dairy heifers.',
    descriptionMr: 'लहान वासरांच्या सुरुवातीच्या जलद विकासासाठी डिझाईन केलेले उच्च प्रथिनयुक्त खाद्य. यामुळे वासरांची हाडे मजबूत होतात व ते लवकर गाभण राहण्यास सक्षम बनतात.',
    advantages: [
      'Promotes rapid body weight gain and robust structural stature',
      'Stimulates early rumen development allowing faster shifting to dry fodder',
      'Highly palatable to eliminate calf feeding friction',
      'Enriched with immunity boosters to protect against calf diarrhea'
    ],
    advantagesMr: [
      'कालवडीच्या वजनात वेगाने वाढ करून निरोगी अंगकाठी बनवते',
      'पचन संस्था (रूमेन) लवकर सक्रिय करते जेणेकरून सुका चारा खाण्यास मदत होते',
      'अतिशय चवदार असल्याने वासरे आवडीने खातात',
      'रोगप्रतिकारक शक्ती वाढवते व अतिसारात प्रतिबंध करते'
    ],
    ingredients: ['Maize Meal Flakes', 'Toasted Soybean Extrusion', 'Wheat Bran', 'Sweet Molasses Blend', 'Calf Vit-Phos Booster Premix', 'Toxin Binders'],
    ingredientsMr: ['मक्याचे बारीक तुकडे', 'टोस्टेड सोयाबीन एक्सट्रूजन', 'गव्हाचा कोंडा', 'गोड मळी मिश्रण', 'कालवड व्हिट-फॉस्फरस मिक्स', 'टॉक्सिन बाइंडर'],
    usage: 'Provide calf starter to calves from 2 weeks up to 6 months of age, rising up to 1-1.5 kg daily.',
    usageMr: 'कालवडीला वयाच्या २ ऱ्या आठवड्यापासून ६ महिन्यांपर्यंत दररोज १ ते १.५ किलोपर्यंत वाढवून द्यावे.',
    price: 1250,
    category: 'Heifer Growth',
    status: 'Available'
  }
];

export const DEFAULT_DEPARTMENTS = [
  'Accounts & Finance',
  'HR & Admin',
  'Marketing',
  'NPD Department',
  'Operations',
  'Purchase Department',
  'Sales Department'
];

export const DEFAULT_DEPT_FORMS: DepartmentConfig[] = [
  { id: 'Accounts & Finance', questions: ['Invoices processed count', 'Payments approved today', 'Pending collection reviews', 'Daily cash ledger matched?', 'Overdue accounts actions', 'Remarks'] },
  { id: 'HR & Admin', questions: ['Total attendance checked', 'Leave requests evaluated', 'Employee queries solved today', 'Office facility sanitization list', 'Pending recruitment coordination', 'Remarks'] },
  { id: 'Marketing', questions: ['Social media posts published', 'Farmer campaign click rate', 'New visual catalogs designed', 'Competitor pricing analysis', 'Dealer kit responses', 'Remarks'] },
  { id: 'NPD Department', questions: ['Laboratory grain moisture test status', 'New feed formulation protein ratio', 'Batch test results review', 'Fodder digestion trial logs', 'FSSAI compliance update', 'Remarks'] },
  { id: 'Operations', questions: ['Steam cooker boiler pressure logged', 'Total pellet production bags', 'Raw maize warehouse incoming tons', 'Machine maintenance routines', 'Dispatched truck serials', 'Remarks'] },
  { id: 'Purchase Department', questions: ['Maize lot orders finalized', 'Average procurement pricing per ton', 'Supplier payments pipeline', 'Empty bags bundle inventory count', 'Transport rates negotiate update', 'Remarks'] },
  { id: 'Sales Department', questions: ['Total ton-orders booked today', 'Outstanding payments collected', 'New dealer calls placed', 'Farmer complaints resolved count', 'Current season discount performance', 'Remarks'] }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
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
  },
  {
    id: 'PJ-EMP-101',
    fullName: 'Rahul Deshmukh',
    email: 'rahul.d@pjintel.com',
    mobile: '9850123456',
    address: 'Flat 402, Shiv Colony, Ranjangaon Gigan, Pune',
    dob: '1990-08-15',
    joiningDate: '2022-01-10',
    aadhaar: '1234-5678-9012',
    pan: 'ABCDE1234F',
    bankDetails: { accountNo: '601245678912', ifsc: 'MAHB0001234', bankName: 'Bank of Maharashtra' },
    department: 'HR & Admin',
    designation: 'Senior HR Administrator',
    salary: 45000,
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    username: 'rahul',
    password: 'password'
  },
  {
    id: 'PJ-EMP-102',
    fullName: 'Snehal Patil',
    email: 'snehal.patil@pjintel.com',
    mobile: '9156677889',
    address: 'Shanti Niwas, near Shirur Stand, Pune',
    dob: '1995-12-04',
    joiningDate: '2023-04-15',
    aadhaar: '9876-5432-1098',
    pan: 'WXYZP5678Q',
    bankDetails: { accountNo: '31314565789', ifsc: 'SBIN0004561', bankName: 'State Bank of India' },
    department: 'NPD Department',
    designation: 'Feed Formulation Scientist',
    salary: 58000,
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    username: 'snehal',
    password: 'password'
  },
  {
    id: 'PJ-EMP-103',
    fullName: 'Abhishek Shinde',
    email: 'abhishek.s@pjintel.com',
    mobile: '7755883391',
    address: 'Satyajit Housing, Wagholi, Pune',
    dob: '1993-05-22',
    joiningDate: '2021-11-01',
    aadhaar: '4561-2384-9041',
    pan: 'IOPKD9871M',
    bankDetails: { accountNo: '045100010123', ifsc: 'ICIC0000451', bankName: 'ICICI Bank' },
    department: 'Sales Department',
    designation: 'Zonal Sales Officer',
    salary: 40000,
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    username: 'abhishek',
    password: 'password'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Rahul Deshmukh (PJ-EMP-101) - May 2026 attendances
  { id: 'att-101-may25', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-05-25', punchIn: '09:05:00 AM', punchOut: '06:01:00 PM', totalHours: 8.93 },
  { id: 'att-101-may26', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-05-26', punchIn: '08:58:00 AM', punchOut: '05:45:00 PM', totalHours: 8.78 },
  { id: 'att-101-may27', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-05-27', punchIn: '09:02:00 AM', punchOut: '06:10:00 PM', totalHours: 9.13 },
  { id: 'att-101-may28', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-05-28', punchIn: '09:12:00 AM', punchOut: '05:58:00 PM', totalHours: 8.77 },
  // April 2026 attendances
  { id: 'att-101-apr28', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-04-28', punchIn: '09:00:00 AM', punchOut: '06:00:00 PM', totalHours: 9.00 },
  { id: 'att-101-apr29', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-04-29', punchIn: '09:15:00 AM', punchOut: '05:30:00 PM', totalHours: 8.25 },
  { id: 'att-101-apr30', employeeId: 'PJ-EMP-101', employeeName: 'Rahul Deshmukh', department: 'HR & Admin', date: '2026-04-30', punchIn: '09:05:00 AM', punchOut: '05:45:00 PM', totalHours: 8.67 },

  // Snehal Patil (PJ-EMP-102) - May 2026
  { id: 'att-102-may25', employeeId: 'PJ-EMP-102', employeeName: 'Snehal Patil', department: 'NPD Department', date: '2026-05-25', punchIn: '08:45:00 AM', punchOut: '05:30:00 PM', totalHours: 8.75 },
  { id: 'att-102-may26', employeeId: 'PJ-EMP-102', employeeName: 'Snehal Patil', department: 'NPD Department', date: '2026-05-26', punchIn: '09:10:00 AM', punchOut: '06:05:00 PM', totalHours: 8.92 },
  { id: 'att-102-may27', employeeId: 'PJ-EMP-102', employeeName: 'Snehal Patil', department: 'NPD Department', date: '2026-05-27', punchIn: '08:52:00 AM', punchOut: '05:15:00 PM', totalHours: 8.38 },
  // April 2026
  { id: 'att-102-apr29', employeeId: 'PJ-EMP-102', employeeName: 'Snehal Patil', department: 'NPD Department', date: '2026-04-29', punchIn: '09:00:00 AM', punchOut: '06:00:00 PM', totalHours: 9.00 },
  { id: 'att-102-apr30', employeeId: 'PJ-EMP-102', employeeName: 'Snehal Patil', department: 'NPD Department', date: '2026-04-30', punchIn: '08:55:00 AM', punchOut: '06:02:00 PM', totalHours: 9.12 },

  // Abhishek Shinde (PJ-EMP-103) - May 2025
  { id: 'att-103-may26', employeeId: 'PJ-EMP-103', employeeName: 'Abhishek Shinde', department: 'Sales Department', date: '2026-05-26', punchIn: '09:00:00 AM', punchOut: '06:00:00 PM', totalHours: 9.00 },
  { id: 'att-103-may27', employeeId: 'PJ-EMP-103', employeeName: 'Abhishek Shinde', department: 'Sales Department', date: '2026-05-27', punchIn: '09:02:00 AM', punchOut: '05:58:00 PM', totalHours: 8.93 }
];

export const DEFAULT_ABOUT_US: AboutUsData = {
  story: 'PJ INDUSTRIES was founded with a dedicated focus to revolutionize cattle nutrition in Maharashtra. Our flagship brand DOODHURJA (दुग्धऊर्जा) symbolises energy, health, and purity. We believe that raw nutrition coupled with standard scientific processing is key to sustaining dairy farmlands. Headquartered behind Yazaki Factory in Ranjangaon MIDC, our steam cooking plant manufactures balanced feed pellets for millions of healthy animals.',
  storyMr: 'महाराष्ट्रातील पशुधनाचा आहार आणि त्यांच्या आरोग्यात क्रांती घडवण्याच्या उद्दिष्टाने पी. जे. इंडस्ट्रीजची स्थापना करण्यात आली. आमचा मुख्य ब्रँड "दुग्धऊर्जा" हा ऊर्जा, आरोग्य आणि शुद्धतेचे प्रतीक मानला जातो. शास्त्रशुद्ध पद्धतीने तयार केलेले गुणवत्तापूर्ण खाद्यच शेतकऱ्यांच्या प्रगतीचा मार्ग आहे यावर आमचा विश्वास आहे. आमचा अत्याधुनिक प्लांट रांजणगाव एमआयडीसी (पुणे) येथे कार्यरत आहे.',
  mission: 'To empower rural cattle farmers with laboratory-tested, chemical-free balanced feed that increases bovine health, enhances daily milk production, and maximizes fair incomes sustainably.',
  missionMr: 'शाश्वत पद्धतीने जनावरांचे आरोग्य वाढवण्यासाठी, दैनंदिन दुग्ध उत्पादनात भर टाकण्यासाठी आणि शेतकऱ्यांचे उत्पन्न वाढवण्यासाठी प्रयोगशाळेत तपासलेले, रसायनमुक्त पशू खाद्य उपलब्ध करून देणे.',
  vision: 'To build a top-tier trusted agro-industrial network across India, recognized for engineering premium cattle diet feed that fosters organic livestock vitality and high milk fats.',
  visionMr: 'भारतभरात एक विश्वासू कृषी-औद्योगिक नेटवर्क तयार करणे, जे उत्तम पोषणमूल्ये पुरवून जनावरांची रोगप्रतिकारशक्ती आणि दुधाची गुणवत्ता वाढवण्यासाठी ओळखले जाईल.',
  foundationDate: '2020-10-15',
  founderName: 'Mr. Prashant Jagtap',
  founderBio: 'Mr. Prashant Jagtap, an expert in agro-chemistry and rural economics, established PJ Industries in Ranjangaon MIDC with a vision to substitute low-quality feed with scientific, direct-bypass pellet nutrients.',
  founderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  heroPhoto: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1200',
  heroPhotos: [
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=1200'
  ],
  productOverviewPhoto: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1200',
  factoryDetails: 'Spans 25,000 sq ft equipped with micro-processor controlled steam cookers and automatic twin-shaft extrusion, running on safe food-safety standard certified procedures.',
  productionProcess: 'Maize and grain cleaning → Magnetic sorting → Twin-shaft pulverizing → Precision vitamin liquid injection → Direct Steam Cooking pelletization → High throughput cooling → Clean bag stitching under strict quality control check-gates.',
  certifications: ['GST: 27APIPJ3647P2Z8 Registered', 'FSSAI Animal Feed safety standard standard compliance', 'ISO 9001:2015 Manufacturing Quality', 'Maharashtra Pollution Control Board Approved'],
  productionPhotos: [
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
  ]
};

export const INITIAL_SLIDERS = [
  {
    id: 'slide-1',
    title: 'निरोगी पशुधन, आरोग्यदायी दूध!',
    titleMr: 'निरोगी पशुधन, आरोग्यदायी दूध!',
    subtitle: 'DOODHURJA Cattle Feed - Balanced and Rich in Protein for Healthy Livestock.',
    subtitleMr: 'दुग्धऊर्जा पशू खाद्य - संपूर्ण समतोल आणि पोषक तत्वांनी परिपूर्ण!',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'slide-2',
    title: 'तुमच्या गाईंचं दूध वाढवा आजच!',
    titleMr: 'तुमच्या गाईंचं दूध वाढवा आजच!',
    subtitle: 'Increase fat percent and daily milk yield in crossbred cows in just 7 days.',
    subtitleMr: 'तुमच्या दुभत्या जनावरांचे दूध आणि फॅट गॅरंटीड वाढवा.',
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'slide-3',
    title: 'Balanced Nutrition For Healthy Cattle',
    titleMr: 'शेतकऱ्यांचा नंबर १ विश्वासू सोबती!',
    subtitle: 'Manufactured with high-tech steam-cooking machinery in Ranjangaon MIDC.',
    subtitleMr: 'रांजणगाव एमआयडीसी पुणे येथे प्रगत स्टीम कुकरद्वारे बनविलेले दर्जेदार मका पेंड.',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=1200'
  }
];

export const INITIAL_TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Balasaheb Thorat',
    location: 'Shirur, Pune',
    review: 'डी.डी. मका पेंड सुरू केल्यावर फक्त ८ दिवसात आमच्या जर्सी गाईचे दूध सकाळी २ लिटरने वाढले. फॅट पण ४.२ वरून ४.६ मिळाले आहे. अतिशय अप्रतिम परिणाम आहे!',
    rating: 5
  },
  {
    id: 'test-2',
    name: 'Vitthalrao Gawade',
    location: 'Ranjangaon, Pune',
    review: 'सगळ्यात महत्वाची गोष्ट म्हणजे गाईला अपचनाचा त्रास बिलकुल होत नाही. खाद्य खूप आवडीने खातात. दुग्धऊर्जा खरंच पशुधनासाठी ऊर्जा देणारे आहे.',
    rating: 5
  },
  {
    id: 'test-3',
    name: 'Sandip Gadekar',
    location: 'Khed, Pune',
    review: 'कालवड बूस्टर खाऊ घातल्याने नवजात कालवडीची वाढ खूप वेगाने झाली. वयाच्या १५ महिन्यातच ती योग्य वजनासह उत्तम तयार झाली. मी सर्व दूध उत्पादकांना दुग्धऊर्जा शिफारस करतो.',
    rating: 5
  }
];

export const STATE_DISTRICTS: Record<string, string[]> = {
  'Maharashtra': ['Pune', 'Ahmednagar', 'Satara', 'Sangli', 'Kolhapur', 'Nashik', 'Solapur', 'Aurangabad', 'Nanded', 'Amravati', 'Nagpur', 'Jalgaon', 'Latur', 'Osmanabad', 'Beed'],
  'Gujarat': ['Ahmedabad', 'Anand', 'Vadodara', 'Surat', 'Rajkot', 'Mehsana', 'Banaskantha'],
  'Karnataka': ['Belgaum', 'Bijapur', 'Gulbarga', 'Dharwad', 'Bagalkot', 'Kolar'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Dhar', 'Khargone']
};

class DualStoreManager {
  private firebaseApp: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private usingFirebase: boolean = false;

  constructor() {
    this.tryInitializeFirebase();
  }

  public tryInitializeFirebase(): boolean {
    try {
      // 1. Try automatic applet-level provisioned config first
      if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
        if (getApps().length === 0) {
          this.firebaseApp = initializeApp(firebaseConfig);
        } else {
          this.firebaseApp = getApp();
        }
        this.firestore = getFirestore(this.firebaseApp, firebaseConfig.firestoreDatabaseId);
        this.usingFirebase = true;
        console.log("Firebase auto-initialized using applet config: " + firebaseConfig.projectId);
        return true;
      }

      // 2. Fall back to custom locally-stored override configuration
      const configStr = localStorage.getItem('pj_firebase_config');
      if (configStr) {
        const config = JSON.parse(configStr);
        if (config && config.apiKey && config.projectId) {
          if (getApps().length === 0) {
            this.firebaseApp = initializeApp(config);
          } else {
            this.firebaseApp = getApp();
          }
          this.firestore = getFirestore(this.firebaseApp);
          this.usingFirebase = true;
          console.log("Firebase initialized successfully using saved custom settings.");
          return true;
        }
      }
    } catch (e) {
      console.warn("Could not auto-initialize Firebase safely, falling back to local simulation.", e);
    }
    this.firebaseApp = null;
    this.firestore = null;
    this.usingFirebase = false;
    return false;
  }

  public isUsingFirebase(): boolean {
    return this.usingFirebase;
  }

  public clearFirebaseConfig() {
    localStorage.removeItem('pj_firebase_config');
    this.firebaseApp = null;
    this.firestore = null;
    this.usingFirebase = false;
  }

  // Get data from localStorage cleanly
  private getLocalList<T>(key: string, defaultVal: T[]): T[] {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(data);
  }

  private setLocalList<T>(key: string, list: T[]) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  // Dual DB generic helpers
  public async getList<T>(collectionName: string, defaultVal: T[]): Promise<T[]> {
    if (this.usingFirebase && this.firestore) {
      try {
        const colRef = collection(this.firestore, collectionName);
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) {
          // pre-seed firestore with defaults
          for (const item of defaultVal) {
            const docId = (item as any).id || (item as any).name || 'default';
            try {
              await setDoc(doc(this.firestore, collectionName, docId), item as any);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
            }
          }
          return defaultVal;
        }
        const results: T[] = [];
        snapshot.forEach(docSnap => {
          results.push(docSnap.data() as T);
        });
        return results;
      } catch (err) {
        console.error(`Firebase fetch fell back due to error in ${collectionName}:`, err);
        handleFirestoreError(err, OperationType.LIST, collectionName);
        return this.getLocalList<T>(collectionName, defaultVal);
      }
    }
    return this.getLocalList<T>(collectionName, defaultVal);
  }

  public async saveItem<T>(collectionName: string, docId: string, item: T, defaultList: T[]): Promise<void> {
    if (this.usingFirebase && this.firestore) {
      try {
        const docRef = doc(this.firestore, collectionName, docId);
        await setDoc(docRef, item as any);
      } catch (err) {
        console.error(`Firebase write failed for ${collectionName}/${docId}:`, err);
        handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
      }
    }
    // Always write local so local state is fully synchronized fallback
    const list = this.getLocalList<T>(collectionName, defaultList);
    const existingIdx = list.findIndex(x => ((x as any).id === docId || (x as any).name === docId));
    if (existingIdx > -1) {
      list[existingIdx] = item;
    } else {
      list.push(item);
    }
    this.setLocalList(collectionName, list);
  }

  public async deleteItem<T>(collectionName: string, docId: string, defaultList: T[]): Promise<void> {
    if (this.usingFirebase && this.firestore) {
      try {
        const docRef = doc(this.firestore, collectionName, docId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error(`Firebase delete failed for ${collectionName}/${docId}:`, err);
        handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
      }
    }
    const list = this.getLocalList<T>(collectionName, defaultList);
    const filtered = list.filter(x => ((x as any).id !== docId && (x as any).name !== docId));
    this.setLocalList(collectionName, filtered);
  }

  // Specialized Single Document Access
  public async getSingleDoc<T>(docId: string, defaultVal: T): Promise<T> {
    if (this.usingFirebase && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'configs', docId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as T;
        } else {
          try {
            await setDoc(docRef, defaultVal as any);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `configs/${docId}`);
          }
          return defaultVal;
        }
      } catch (e) {
        console.error(`Firebase config read error for ${docId}:`, e);
        handleFirestoreError(e, OperationType.GET, `configs/${docId}`);
      }
    }
    const local = localStorage.getItem(`pj_config_${docId}`);
    if (!local) {
      localStorage.setItem(`pj_config_${docId}`, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(local);
  }

  public async saveSingleDoc<T>(docId: string, item: T): Promise<void> {
    if (this.usingFirebase && this.firestore) {
      try {
        const docRef = doc(this.firestore, 'configs', docId);
        await setDoc(docRef, item as any);
      } catch (e) {
        console.error(`Firebase config save error for ${docId}:`, e);
        handleFirestoreError(e, OperationType.WRITE, `configs/${docId}`);
      }
    }
    localStorage.setItem(`pj_config_${docId}`, JSON.stringify(item));
  }
}

export const dbStore = new DualStoreManager();

/**
 * Parses any time string (including formats with dots like 3.38, 3.39, colons like 03:38 PM, or 24-hour style) down to absolute seconds.
 */
export function parseToSeconds(timeStr: string): number | null {
  if (!timeStr) return null;
  const cleanStr = timeStr.trim().toUpperCase();
  const isPM = cleanStr.includes('PM');
  const isAM = cleanStr.includes('AM');
  
  // Replace time dots (e.g. 3.38 or 15.39) with colons so splitting parts is consistent
  let normalizedStr = cleanStr.replace(/\s+/g, ' ');
  normalizedStr = normalizedStr.replace(/(\d+)\.(\d+)/g, '$1:$2');
  
  // Remove non-digits and non-colons
  const baseTime = normalizedStr.replace(/[^\d:]/g, '').trim();
  const parts = baseTime.split(':');
  if (parts.length < 2) {
    const singleVal = parseInt(parts[0], 10);
    if (!isNaN(singleVal)) {
      let hours = singleVal;
      if (isPM && hours < 12) hours += 12;
      else if (isAM && hours === 12) hours = 0;
      return hours * 3600;
    }
    return null;
  }
  
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  let seconds = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  if (isNaN(seconds)) seconds = 0;
  
  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  }
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Utility to calculate the exact decimal hours between two time strings.
 * Supports "HH:MM:SS AM/PM", "HH:MM AM/PM", "HH:MM:SS", "HH:MM", 12-hour or 24-hour style, and decimal-dot style (e.g., 3.38 to 3.39).
 */
export function calculateHoursBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  
  const startSec = parseToSeconds(start);
  const endSec = parseToSeconds(end);
  
  if (startSec === null || endSec === null) return 8.0; // Safe default fallback
  
  let diffSec = endSec - startSec;
  if (diffSec < 0) {
    // Spans over midnight
    diffSec += 24 * 3600;
  }
  
  return parseFloat((diffSec / 3600).toFixed(4));
}

/**
 * Formats the exact duration between punch in and punch out in a highly legible way, e.g. "1 hr 12 mins 5 secs" or "1 min 0 secs".
 */
export function formatPreciseDuration(start: string, end: string): string {
  if (!start) return 'Counting...';
  if (!end) return 'Active Shift...';

  const startSec = parseToSeconds(start);
  const endSec = parseToSeconds(end);

  if (startSec === null || endSec === null) return '0 hrs 0 mins';

  let diffSec = endSec - startSec;
  if (diffSec < 0) {
    // Spans over midnight
    diffSec += 24 * 3600;
  }

  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  }
  // Always show seconds if duration is short, or if seconds are positive
  if (seconds > 0 || (hours === 0 && minutes === 0)) {
    parts.push(`${seconds} sec${seconds !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
}


