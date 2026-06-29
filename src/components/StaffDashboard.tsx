import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Sparkles, 
  Calendar, 
  FileText, 
  User, 
  MapPin, 
  LogOut, 
  Clipboard, 
  Send, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { 
  dbStore, 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  EodReport, 
  DEFAULT_DEPT_FORMS,
  DepartmentConfig,
  calculateHoursBetween,
  formatPreciseDuration
} from '../db';

interface StaffDashboardProps {
  lang: 'en' | 'mr';
  currentStaff: Employee | null;
  onLogout: () => void;
  onRefreshData: () => void;
}

export default function StaffDashboard({ lang, currentStaff, onLogout, onRefreshData }: StaffDashboardProps) {
  if (!currentStaff) return null;

  // Real-time Clock display
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // System States
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [eodHistory, setEodHistory] = useState<EodReport[]>([]);
  const [deptForm, setDeptForm] = useState<DepartmentConfig | null>(null);

  // Form Application States
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    reason: '',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });
  
  // Dynamic EOD form answers answers
  const [eodAnswers, setEodAnswers] = useState<Record<string, string>>({});

  const [punchState, setPunchState] = useState<'Out' | 'In' | 'Completed'>('Out');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);

  // Month selection & search query for all-month EOD reports
  const [selectedEodMonth, setSelectedEodMonth] = useState<string>('all');
  const [searchEodKeywords, setSearchEodKeywords] = useState<string>('');

  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'leaves' | 'eod'>('attendance');
  const [bannerMsg, setBannerMsg] = useState('');

  // Fetch data
  const fetchData = async () => {
    const allAtt = await dbStore.getList<AttendanceRecord>('attendance', []);
    const myAtt = allAtt.filter(x => x.employeeId === currentStaff.id);
    setAttendanceList(myAtt);

    // Calculate today's status
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRec = myAtt.find(x => x.date === todayStr);
    
    if (todayRec) {
      setTodayRecord(todayRec);
      if (todayRec.punchOut) {
        setPunchState('Completed');
      } else {
        setPunchState('In');
      }
    } else {
      setTodayRecord(null);
      setPunchState('Out');
    }

    const allLeaves = await dbStore.getList<LeaveRequest>('leaves', []);
    setLeaveHistory(allLeaves.filter(x => x.employeeId === currentStaff.id));

    const allEod = await dbStore.getList<EodReport>('eod_reports', []);
    setEodHistory(allEod.filter(x => x.employeeId === currentStaff.id));

    // Load department EOD form questions config
    const customForms = await dbStore.getList<DepartmentConfig>('department_configs', DEFAULT_DEPT_FORMS);
    const myConfig = customForms.find(f => f.id === currentStaff.department);
    if (myConfig) {
      setDeptForm(myConfig);
    } else {
      // fallback
      setDeptForm({ id: currentStaff.department, questions: ['Hourly tasks description', 'Tomorrow Planning', 'Issues', 'Remarks'] });
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentStaff]);

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 4000);
  };

  // Punch In Handler
  const handlePunchIn = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString();

    const newRecord: AttendanceRecord = {
      id: `att-${currentStaff.id}-${todayStr}`,
      employeeId: currentStaff.id,
      employeeName: currentStaff.fullName,
      department: currentStaff.department,
      date: todayStr,
      punchIn: nowTimeStr,
      punchOut: '',
      totalHours: 0
    };

    await dbStore.saveItem<AttendanceRecord>('attendance', newRecord.id, newRecord, []);
    showBanner(lang === 'en' ? 'Punched In Successfully!' : 'दिवसाची सुरुवात (पंच-इन) नोंदवली गेली आहे!');
    fetchData();
    onRefreshData();
  };

  // Punch Out Handler
  const handlePunchOut = async () => {
    if (!todayRecord) return;
    const nowTimeStr = new Date().toLocaleTimeString();
    
    // Calculate total hours
    const pinStr = todayRecord.punchIn;
    const hrs = calculateHoursBetween(pinStr, nowTimeStr);

    const updated: AttendanceRecord = {
      ...todayRecord,
      punchOut: nowTimeStr,
      totalHours: hrs
    };

    await dbStore.saveItem<AttendanceRecord>('attendance', updated.id, updated, []);
    showBanner(lang === 'en' ? 'Punched Out. Good Job Today!' : 'दिवसाचा शेवट (पंच-आऊट) नोंदवला गेला आहे!');
    fetchData();
    onRefreshData();
  };

  // Apply Leave Handler
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason) {
      alert(lang === 'en' ? 'Please supply a brief leave reason.' : 'कृपया सुट्टीचे कारण लिहा.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `leave-${currentStaff.id}-${Date.now()}`,
      employeeId: currentStaff.id,
      employeeName: currentStaff.fullName,
      department: currentStaff.department,
      leaveType: leaveForm.leaveType,
      reason: leaveForm.reason,
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      status: 'Pending',
      submittedAt: new Date().toLocaleDateString()
    };

    await dbStore.saveItem<LeaveRequest>('leaves', newRequest.id, newRequest, []);
    showBanner(lang === 'en' ? 'Leave Request submitted to Admin.' : 'सुट्टीचा अर्ज यशस्वरित्या पाठवला गेला आहे!');
    
    setLeaveForm({
      leaveType: 'Casual Leave',
      reason: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0]
    });
    fetchData();
    onRefreshData();
  };

  // EOD custom report Submit
  const handleEodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm) return;

    // Build answers
    const answersList = deptForm.questions.map(q => ({
      question: q,
      answer: eodAnswers[q] || 'Completed'
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    const newReport: EodReport = {
      id: `eod-${currentStaff.id}-${todayStr}`,
      employeeId: currentStaff.id,
      employeeName: currentStaff.fullName,
      department: currentStaff.department,
      date: todayStr,
      answers: answersList,
      submittedAt: new Date().toLocaleTimeString()
    };

    await dbStore.saveItem<EodReport>('eod_reports', newReport.id, newReport, []);
    showBanner(lang === 'en' ? 'EOD Daily Work Report saved.' : 'दैनिक कामाचा अहवाल यशस्वीरीत्या जतन केला!');
    
    // reset form
    setEodAnswers({});
    fetchData();
    onRefreshData();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Alert Toast */}
        {bannerMsg && (
          <div className="fixed top-24 right-5 z-40 bg-zinc-900 border-l-4 border-emerald-500 text-white rounded-xl shadow-2xl px-6 py-4 flex items-center space-x-3.5 animate-bounce">
            <span className="text-emerald-400 font-black">✓</span>
            <span className="text-sm font-bold">{bannerMsg}</span>
          </div>
        )}

        {/* 1. EMPLOYEE CONSOLE PROFILE SUMMARY */}
        <div className="bg-gradient-to-r from-[#0B5D1E] to-[#6AAE2C] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-stretch gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full z-0 transform translate-x-20 -translate-y-20"></div>
          
          <div className="flex items-center space-x-5 z-10">
            <div className="w-20 h-20 rounded-2xl border-4 border-[#FFC107] overflow-hidden bg-white shadow-md flex-shrink-0">
              <img
                src={currentStaff.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
                alt={currentStaff.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-1.5Scale">
              <span className="bg-[#FFC107] text-[#222222] text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                {currentStaff.department}
              </span>
              <h2 className="text-2.5xl font-black tracking-tight">{currentStaff.fullName}</h2>
              <p className="text-xs text-emerald-100 flex items-center space-x-1.5 font-mono">
                <span>ID: {currentStaff.id}</span>
                <span>•</span>
                <span>Designation: {currentStaff.designation}</span>
              </p>
            </div>
          </div>

          {/* Punch Realtime indicator inside Header display */}
          <div className="bg-[#222222]/30 border border-white/10 p-4 rounded-2xl flex flex-col justify-between items-center md:items-end min-w-[200px] z-10 backdrop-blur-xs">
            <div className="text-center md:text-right">
              <span className="text-3xs uppercase tracking-wider text-amber-300 font-extrabold block">RanjanGaon MIDC Time Clock</span>
              <span className="text-xl font-black font-mono tracking-widest text-[#FFC107]">{timeStr}</span>
            </div>
            <button
              onClick={onLogout}
              className="mt-3 text-2xs uppercase tracking-wider font-extrabold text-red-300 hover:text-white flex items-center space-x-1 leading-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{lang === 'en' ? 'Log Out' : 'लॉग आउट व्हा'}</span>
            </button>
          </div>
        </div>

        {/* 2. DOCK TAB TOGGLES */}
        <div className="flex border-b border-gray-200 bg-white p-2 rounded-xl border">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center space-x-2 ${
              activeSubTab === 'attendance' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{lang === 'en' ? 'Attendance & Punching' : 'उपस्थिती आणि पंच'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center space-x-2 ${
              activeSubTab === 'leaves' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{lang === 'en' ? 'Leave Applications' : 'सुट्टी अर्ज'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('eod')}
            className={`flex-1 py-3 text-center rounded-lg text-sm font-black transition-all flex items-center justify-center space-x-2 ${
              activeSubTab === 'eod' ? 'bg-[#0B5D1E] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{lang === 'en' ? 'EOD Work Report' : 'कामाचा दैनिक रिपोर्ट'}</span>
          </button>
        </div>

        {/* 3. DYNAMIC CONTENT INNER BOARD */}

        {/* --- MAIN TAB: ATTENDANCE --- */}
        {activeSubTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* INCOMING ACTION CARD */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-[#0B5D1E] flex items-center justify-center">
                  <Timer className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-gray-800">
                  {lang === 'en' ? 'Immediate Verification Gate' : 'उपस्थिती पंच कार्ड'}
                </h3>
                <p className="text-xs text-gray-400">
                  Daily shifts are tracked based on official stamp check-ins.
                </p>
              </div>

              {/* Status Banner */}
              <div className="bg-gray-50 p-4.5 rounded-xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Today Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-3xs font-black uppercase ${
                    punchState === 'Completed' ? 'bg-indigo-100 text-indigo-700' :
                    punchState === 'In' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-red-100 text-red-700'
                  }`}>
                    {punchState === 'Completed' ? 'Completed' : punchState === 'In' ? 'Punched In' : 'Absent/Not Punched'}
                  </span>
                </div>

                {todayRecord && (
                  <div className="space-y-1 text-xs border-t border-gray-200 pt-2 font-mono">
                    <p className="text-zinc-600">Punch In Timestamp: <strong>{todayRecord.punchIn}</strong></p>
                    {todayRecord.punchOut && <p className="text-zinc-600">Punch Out Timestamp: <strong>{todayRecord.punchOut}</strong></p>}
                    {todayRecord.totalHours > 0 && (
                      <p className="text-[#0B5D1E] font-bold">
                        Total Work Duration: {todayRecord.totalHours.toFixed(2)} Hrs
                        <span className="block text-[10px] text-gray-500 font-sans font-medium mt-1">
                          ({formatPreciseDuration(todayRecord.punchIn, todayRecord.punchOut)})
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Functional Punch Buttons */}
              <div className="space-y-3">
                {punchState === 'Out' && (
                  <button
                    onClick={handlePunchIn}
                    className="w-full h-13 bg-gradient-to-r from-[#0B5D1E] to-[#6AAE2C] text-white font-black rounded-xl shadow-md cursor-pointer hover:opacity-95 text-sm uppercase tracking-wider"
                  >
                    🚀 Punch In (सुरुवात)
                  </button>
                )}

                {punchState === 'In' && (
                  <button
                    onClick={handlePunchOut}
                    className="w-full h-13 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black rounded-xl shadow-md cursor-pointer hover:opacity-95 text-sm uppercase tracking-wider"
                  >
                    🛑 Punch Out (समाप्ती)
                  </button>
                )}

                {punchState === 'Completed' && (
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs text-center font-bold rounded-lg leading-relaxed">
                    🎉 You have completed your shift tracking for today. Go home and spend time with family!
                  </div>
                )}
              </div>
            </div>

            {/* PRESENT CALENDAR LOGS PANEL */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{lang === 'en' ? 'Attendance Monthly History' : 'मागील उपस्थिती रेकॉर्ड'}</h3>
                  <p className="text-2xs text-gray-400">Aggregated calendar logs for {currentStaff.fullName}</p>
                </div>

                {/* Score badge summary */}
                <div className="flex space-x-2">
                  <div className="px-3 py-1.5 bg-emerald-50 rounded-lg text-center border border-emerald-100">
                    <span className="text-sm font-black text-[#0B5D1E] block leading-none">{attendanceList.length}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-black">Days</span>
                  </div>
                </div>
              </div>

              {attendanceList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No attendance punches recorded yet. Use the card to compile your first punch.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Date</th>
                        <th className="pb-3 font-bold">Punch In</th>
                        <th className="pb-3 font-bold">Punch Out</th>
                        <th className="pb-3 font-bold">Total Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {attendanceList.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="py-3.5 font-bold text-gray-800 font-mono">{rec.date}</td>
                          <td className="py-3.5 text-zinc-600 font-mono">{rec.punchIn}</td>
                          <td className="py-3.5 text-zinc-600 font-mono">{rec.punchOut || 'Active...'}</td>
                          <td className="py-3.5 font-black text-[#0B5D1E] font-mono">
                            {rec.totalHours > 0 ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-800">{formatPreciseDuration(rec.punchIn, rec.punchOut)}</span>
                                <span className="text-[10px] text-zinc-400 font-sans font-medium">({rec.totalHours.toFixed(2)} hrs)</span>
                              </div>
                            ) : 'Counting'}
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

        {/* --- MAIN TAB: LEAVES --- */}
        {activeSubTab === 'leaves' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* COMPACT SUBMISSION FORM */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md">
              <h3 className="text-lg font-black text-gray-900 mb-4">{lang === 'en' ? 'Apply For Leave' : 'नवीन सुट्टी अर्ज नोंदवा'}</h3>
              
              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Leave Category</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B5D1E]"
                  >
                    <option value="Casual Leave">Casual Leave (किरकोळ सुट्टी)</option>
                    <option value="Sick Leave">Sick Leave (वैद्यकीय सुट्टी)</option>
                    <option value="Privilege Leave">Privilege Leave (हक्काची सुट्टी)</option>
                    <option value="Emergency Leave">Emergency Leave (तात्काळ सुट्टी)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">From Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">To Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Reason / Justification</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Enter domestic emergency or medical reasons."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B5D1E]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#0B5D1E] text-white font-extrabold uppercase tracking-wide text-xs rounded-xl"
                >
                  Apply Now
                </button>
              </form>
            </div>

            {/* SUBMISSION HISTORY PROGRESS */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-black text-gray-900">{lang === 'en' ? 'Leave Inquiries & Status' : 'सुट्टी अर्जांचे स्टेटस'}</h3>
                <p className="text-2xs text-gray-400">Previous history tracked by the corporate HR team</p>
              </div>

              {leaveHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No previous leave requests submitted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-bold">Dates</th>
                        <th className="pb-3 font-bold">Category</th>
                        <th className="pb-3 font-bold">Reason</th>
                        <th className="pb-3 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaveHistory.map((leave) => (
                        <tr key={leave.id} className="hover:bg-slate-50">
                          <td className="py-3.5 font-bold text-gray-800 font-mono leading-tight">
                            {leave.fromDate} <span className="text-[10px] text-gray-400 block font-normal">to {leave.toDate}</span>
                          </td>
                          <td className="py-3.5 text-zinc-600 font-semibold">{leave.leaveType}</td>
                          <td className="py-3.5 text-zinc-500 max-w-xs truncate">{leave.reason}</td>
                          <td className="py-3.5 text-right font-bold">
                            {leave.status === 'Approved' ? (
                              <span className="text-xs font-black inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-150">
                                <CheckCircle className="h-3 w-3 mr-1" /> Approved
                              </span>
                            ) : leave.status === 'Rejected' ? (
                              <span className="text-xs font-black inline-flex items-center text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-150">
                                <XCircle className="h-3 w-3 mr-1" /> Rejected
                              </span>
                            ) : (
                              <span className="text-xs font-black inline-flex items-center text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-150 animate-pulse">
                                <AlertCircle className="h-3 w-3 mr-1" /> Pending
                              </span>
                            )}
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

        {/* --- MAIN TAB: EOD --- */}
        {activeSubTab === 'eod' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* DYNAMIC EOD CHASSIS BLOCK */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-4">
              <div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                  ACTIVE QUESTION SHEET
                </span>
                <h3 className="text-lg font-black text-gray-900 mt-2">
                  {lang === 'en' ? 'End Of Day Form' : 'दैनिक काम अहवाल सादर करा'}
                </h3>
                <p className="text-2xs text-gray-400">
                  Daily tasks sheet customized explicitly for your department: <strong>{currentStaff.department}</strong>
                </p>
              </div>

              {deptForm && (
                <form onSubmit={handleEodSubmit} className="space-y-4.5 pt-2">
                  {deptForm.questions.map((q) => (
                    <div key={q}>
                      <label id={`lbl-q-${q}`} className="block text-xs font-extrabold text-gray-700 mb-1.5 leading-tight">
                        {q} *
                      </label>
                      <input
                        type="text"
                        required
                        value={eodAnswers[q] || ''}
                        onChange={(e) => setEodAnswers({ ...eodAnswers, [q]: e.target.value })}
                        placeholder="Write your input detail..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B5D1E]"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-[#0B5D1E] to-[#6AAE2C] text-white font-black uppercase text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit EOD Report</span>
                  </button>
                </form>
              )}
            </div>

            {/* PREVIOUS EOD LOGS COMPACT */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-950">
                    {lang === 'en' ? 'All Month EOD Labor Work Reports' : 'सर्व महिन्यांचे ईओडी कामाचे रिपोर्ट (EOD)'}
                  </h3>
                  <p className="text-2xs text-gray-400">
                    {lang === 'en' ? 'Filter and review your submitted shift logs' : 'तुमचे जमा केलेले सर्व शिफ्ट लॉग महिन्यांप्रमाणे फिल्टर करा'}
                  </p>
                </div>

                {/* Export self EOD button */}
                <button
                  type="button"
                  onClick={() => {
                    const filtered = eodHistory.filter(rep => {
                      if (selectedEodMonth !== 'all') {
                        const m = rep.date.split('-')[1];
                        if (m !== selectedEodMonth) return false;
                      }
                      if (searchEodKeywords.trim()) {
                        const q = searchEodKeywords.toLowerCase();
                        const matchesContent = rep.answers.some(
                          ans => ans.question.toLowerCase().includes(q) || ans.answer.toLowerCase().includes(q)
                        );
                        if (!matchesContent) return false;
                      }
                      return true;
                    });

                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "ID,Date,Submitted At,Questions & Answers\n"
                      + filtered.map(e => `"${e.id}","${e.date}","${e.submittedAt}","${e.answers.map(a => `${a.question}: ${a.answer}`).join(' | ')}"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `My_EOD_Report_${currentStaff.fullName.replace(/\s+/g, '_')}_${selectedEodMonth === 'all' ? 'AllMonths' : `Month_${selectedEodMonth}`}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-1.5 bg-[#0B5D1E]/10 hover:bg-[#0B5D1E]/15 text-[#0B5D1E] text-4xs uppercase font-black tracking-wider rounded-xl transition-all border border-[#0B5D1E]/20 self-start sm:self-auto cursor-pointer"
                >
                  {lang === 'en' ? 'Export CSV' : 'सीएसव्ही डाउनलोड'}
                </button>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-50/50 p-3 rounded-xl border border-gray-150">
                <div>
                  <label className="block text-4xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    {lang === 'en' ? 'Select Month / महिना निवडा' : 'महिना निवडा'}
                  </label>
                  <select
                    value={selectedEodMonth}
                    onChange={(e) => setSelectedEodMonth(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800"
                  >
                    <option value="all">{lang === 'en' ? 'All Months' : 'सर्व महिने'}</option>
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

                <div>
                  <label className="block text-4xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                    {lang === 'en' ? 'Search Answers / उत्तरे शोधा' : 'कीवर्ड शोधा'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? "Search in answers..." : "अहवालात शोधा..."}
                    value={searchEodKeywords}
                    onChange={(e) => setSearchEodKeywords(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs bg-white text-gray-800 font-sans"
                  />
                </div>
              </div>

              {/* List Display */}
              {(() => {
                const filteredList = eodHistory.filter(rep => {
                  if (selectedEodMonth !== 'all') {
                    const m = rep.date.split('-')[1];
                    if (m !== selectedEodMonth) return false;
                  }
                  if (searchEodKeywords.trim()) {
                    const q = searchEodKeywords.toLowerCase();
                    const matchesContent = rep.answers.some(
                      ans => ans.question.toLowerCase().includes(q) || ans.answer.toLowerCase().includes(q)
                    );
                    if (!matchesContent) return false;
                  }
                  return true;
                });

                if (filteredList.length === 0) {
                  return (
                    <div className="text-center py-10 bg-slate-50 border text-gray-400 text-xs rounded-xl">
                      {lang === 'en' ? 'No matching EOD reports logged inside system.' : 'या कालखंडासाठी कोणताही अहवाल उपलब्ध नाही.'}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {filteredList.map((rep) => (
                      <div key={rep.id} className="p-4 bg-gray-50/60 hover:bg-gray-50 rounded-xl border border-gray-150 space-y-2.5 text-xs transition-colors">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#0B5D1E] font-extrabold pb-1.5 border-b border-gray-200">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                            Date: {rep.date}
                          </span>
                          <span className="font-mono text-gray-400">Submitted at {rep.submittedAt}</span>
                        </div>
                        
                        <div className="space-y-2.5 pt-0.5 font-sans">
                          {rep.answers.map((ans, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 flex flex-col justify-between shadow-3xs">
                              <span className="font-black text-zinc-400 text-3xs uppercase tracking-wider block mb-1">{ans.question}:</span>
                              <span className="text-gray-800 font-mono text-[11px] leading-relaxed block">{ans.answer}</span>
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

      </div>
    </div>
  );
}
