import React, { useState } from 'react';
import { Course, Employee, TrainingEvent, IndividualPreAssessment, DepartmentalPreAssessment, PostAssessmentFeedback, PostAssessmentMark } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { 
  Calendar, Users, Award, BookOpen, Clock, AlertTriangle, Play, Sparkles, 
  TrendingUp, RefreshCw, Trash2, Upload, FileText, Plus, Database, Check, 
  Edit3, Save, X, Info 
} from 'lucide-react';

interface OverviewProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  individualPre: IndividualPreAssessment[];
  departmentalPre: DepartmentalPreAssessment[];
  feedbacks: PostAssessmentFeedback[];
  postMarks: PostAssessmentMark[];
  onNavigate: (tab: string) => void;
  onQuickSchedule: () => void;
  onAddEmployee: (emp: Employee) => void;
  onImportEmployees: (emps: Employee[]) => void;
  onImportCourses: (courses: Course[]) => void;
  onClearData: () => void;
  onResetData: () => void;
  onDeleteEmployee: (code: string) => void;
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip next slot
      }
      row.push(currentVal.trim());
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal !== '' || row.length > 0) {
    row.push(currentVal.trim());
    lines.push(row);
  }
  return lines;
}

export const DashboardOverview: React.FC<OverviewProps> = ({
  courses,
  employees,
  events,
  individualPre,
  departmentalPre,
  feedbacks,
  postMarks,
  onNavigate,
  onQuickSchedule,
  onAddEmployee,
  onImportEmployees,
  onImportCourses,
  onClearData,
  onResetData,
  onDeleteEmployee
}) => {
  // Administrative Roster and Custom Seeding UI State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'employees_bulk' | 'courses_bulk' | 'employees_manual' | 'reset'>('employees_bulk');

  // Employee manual add form state
  const [newEmpCode, setNewEmpCode] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDesg, setNewEmpDesg] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Quality Assurance');
  const [newEmpUnit, setNewEmpUnit] = useState('Unit 1');
  const [newEmpHOD, setNewEmpHOD] = useState('HOD QA');
  const [newEmpHODEmail, setNewEmpHODEmail] = useState('hod.qa@agidenim.com');

  // CSV file paste inputs
  const [csvEmployeesText, setCsvEmployeesText] = useState('');
  const [csvCoursesText, setCsvCoursesText] = useState('');

  // Drag and drop states
  const [isDraggingEmp, setIsDraggingEmp] = useState(false);
  const [isDraggingCrs, setIsDraggingCrs] = useState(false);

  const handleCSVEmployeeSubmit = () => {
    if (!csvEmployeesText.trim()) {
      alert("Please paste some employee CSV text first!");
      return;
    }
    try {
      const rows = parseCSV(csvEmployeesText);
      if (rows.length === 0) {
        alert("Could not parse any valid rows. Please check format.");
        return;
      }
      
      const parsedEmployees: Employee[] = [];
      let startIndex = 0;
      
      // check if first row is header
      const firstRowStr = rows[0].join(',').toLowerCase();
      if (firstRowStr.includes('code') || firstRowStr.includes('name') || firstRowStr.includes('designation')) {
        startIndex = 1;
      }
      
      for (let i = startIndex; i < rows.length; i++) {
        const r = rows[i];
        if (r.length < 2) continue;
        const code = r[0]?.trim();
        const name = r[1]?.trim();
        if (!code || !name) continue;
        
        parsedEmployees.push({
          code,
          name,
          email: r[2]?.trim() || `${code.toLowerCase()}@agidenim.com`,
          designation: r[3]?.trim() || 'QA Technician',
          department: r[4]?.trim() || 'Quality Assurance',
          unit: r[5]?.trim() || 'Unit 1',
          hodName: r[6]?.trim() || 'HOD QA',
          hodEmail: r[7]?.trim() || 'hod.qa@agidenim.com'
        });
      }
      
      if (parsedEmployees.length === 0) {
        alert("No valid employee rows parsed. Ensure at least Code and Name exist!");
        return;
      }
      
      onImportEmployees(parsedEmployees);
      setCsvEmployeesText('');
    } catch (e) {
      alert("Error parsing CSV: " + (e as Error).length);
    }
  };

  const handleCSVCourseSubmit = () => {
    if (!csvCoursesText.trim()) {
      alert("Please paste some course CSV text first!");
      return;
    }
    try {
      const rows = parseCSV(csvCoursesText);
      if (rows.length === 0) {
        alert("Could not parse any valid rows. Please check format.");
        return;
      }
      
      const parsedCourses: Course[] = [];
      let startIndex = 0;
      const firstRowStr = rows[0].join(',').toLowerCase();
      if (firstRowStr.includes('id') || firstRowStr.includes('name') || firstRowStr.includes('scope')) {
        startIndex = 1;
      }
      
      for (let i = startIndex; i < rows.length; i++) {
        const r = rows[i];
        if (r.length < 2) continue;
        const id = r[0]?.trim() || `TRG-${Date.now()}-${i}`;
        const name = r[1]?.trim();
        if (!name) continue;
        
        const durationHours = Number(r[6]?.trim()) || 3;
        const scopeStr = r[5]?.trim() || 'Professional/Technical';
        let scope: Course['scope'] = 'Professional/Technical';
        if (scopeStr.toLowerCase().includes('system') || scopeStr.toLowerCase().includes('sustain')) {
          scope = 'Systems/Sustainability';
        } else if (scopeStr.toLowerCase().includes('social') || scopeStr.toLowerCase().includes('compli')) {
          scope = 'Social Compliance';
        } else if (scopeStr.toLowerCase().includes('other')) {
          scope = 'Other';
        }
        
        parsedCourses.push({
          id,
          name,
          trainer: r[2]?.trim() || 'Subject Matter Expert',
          department: r[3]?.trim() || 'Quality',
          frequency: r[4]?.trim() || 'Biannually',
          topics: r[7] ? r[7].split(';').map(t => t.trim()).filter(Boolean) : ["SOP adherence", "Quality Standard Check"],
          scope,
          method: 'Lecture/Presentation',
          durationHours,
          durationMinutes: durationHours * 60
        });
      }
      
      if (parsedCourses.length === 0) {
        alert("No valid courses parsed. Ensure at least Name exists!");
        return;
      }
      
      onImportCourses(parsedCourses);
      setCsvCoursesText('');
    } catch (e) {
      alert("Error parsing CSV: " + (e as Error).message);
    }
  };

  const handleManualEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpCode.trim() || !newEmpName.trim()) {
      alert("Employee Code and Full Name are required!");
      return;
    }
    
    // Check duplication
    if (employees.some(emp => emp.code.toLowerCase() === newEmpCode.trim().toLowerCase())) {
      alert(`An employee with code "${newEmpCode}" already exists!`);
      return;
    }
    
    onAddEmployee({
      code: newEmpCode.trim().toUpperCase(),
      name: newEmpName.trim(),
      email: newEmpEmail.trim() || `${newEmpCode.trim().toLowerCase()}@agidenim.com`,
      designation: newEmpDesg.trim() || 'QA Technician',
      department: newEmpDept,
      unit: newEmpUnit,
      hodName: newEmpHOD.trim() || 'HOD QA',
      hodEmail: newEmpHODEmail.trim() || 'hod.qa@agidenim.com'
    });
    
    // reset form
    setNewEmpCode('');
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpDesg('');
    alert(`Added employee ${newEmpName.trim()} successfully!`);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, type: 'emp' | 'crs') => {
    e.preventDefault();
    if (type === 'emp') setIsDraggingEmp(false);
    else setIsDraggingCrs(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          if (type === 'emp') setCsvEmployeesText(text);
          else setCsvCoursesText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculations
  const totalEmployees = employees.length;
  const totalCourses = courses.length;
  const completedEvents = events.filter(e => e.status === 'Completed');
  const upcomingEvents = events.filter(e => e.status === 'Scheduled');
  
  // Calculate total hours of training delivered
  // Total Hours = sum(event duration * number of present attendees)
  const totalHoursDelivered = completedEvents.reduce((acc, event) => {
    const course = courses.find(c => c.id === event.courseId);
    if (!course) return acc;
    const presentCount = event.attendees.filter(a => a.present).length;
    return acc + (course.durationHours * presentCount);
  }, 0);

  // Average feedback rating (score from 1-5 across all 9 questions)
  let totalFeedbackRating = 0;
  let feedbackCount = 0;
  feedbacks.forEach(f => {
    const vals = Object.values(f.scores) as number[];
    const sum = vals.reduce((a, b) => a + b, 0);
    totalFeedbackRating += sum / Object.keys(f.scores).length;
    feedbackCount++;
  });
  const avgFeedbackScore = feedbackCount > 0 ? (totalFeedbackRating / feedbackCount).toFixed(2) : "4.80";

  // Pending elements
  const pendingTnaCount = individualPre.filter(p => !p.isEvaluated).length + departmentalPre.filter(p => !p.isEvaluated).length;

  // Pie chart calculation: course distribution by type (scope)
  const scopeCounts = courses.reduce((acc: { [key: string]: number }, course) => {
    acc[course.scope] = (acc[course.scope] || 0) + 1;
    return acc;
  }, {});
  
  const scopeData = Object.entries(scopeCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569'];

  // Bar Chart data: Training completion rate by Unit (Unit 1, Unit 2, Unit 3, Weaving, etc.)
  // We look at completed attendees per Unit.
  const unitCounts: { [key: string]: { completed: number; names: Set<string> } } = {};
  
  // Initialize departments / units
  employees.forEach(emp => {
    if (!unitCounts[emp.unit]) {
      unitCounts[emp.unit] = { completed: 0, names: new Set() };
    }
  });

  completedEvents.forEach(event => {
    event.attendees.forEach(att => {
      if (att.present) {
        const emp = employees.find(e => e.code === att.employeeCode);
        if (emp) {
          const unit = emp.unit;
          if (!unitCounts[unit]) {
            unitCounts[unit] = { completed: 0, names: new Set() };
          }
          unitCounts[unit].completed++;
          unitCounts[unit].names.add(emp.code);
        }
      }
    });
  });

  const unitStatsData = Object.entries(unitCounts).map(([unit, val]) => ({
    name: unit,
    'Attendees Trained': val.completed,
    'Unique Trainees': val.names.size
  }));

  return (
    <div className="space-y-6" id="overview-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono">
            <Sparkles className="w-4 h-4" />
            <span>ARTISTIC GARMENT INDUSTRIES • LMS PORTAL</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans sm:text-4xl">
            L&D Performance & Insights
          </h1>
          <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
            Consolidated platform mapping training schedules, needs-assessments, live attendance tracks, and ISO-compliant post-assessment analytics for the Quality Assurance group.
          </p>
        </div>        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAdminOpen(prev => !prev)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-sky-400 transition-all flex items-center justify-center space-x-1.5 cursor-pointer no-print whitespace-nowrap"
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span>Manage Base / Uploads</span>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-750 rounded-xl text-xs font-medium text-slate-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            id="btn-view-schedule"
          >
            <Calendar className="w-4 h-4" />
            <span>Annual Schedule</span>
          </button>
          
          <button
            onClick={onQuickSchedule}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            id="btn-quick-schedule"
          >
            <Play className="w-4 h-4 text-slate-950 fill-current" />
            <span>Create Training Event</span>
          </button>
        </div>
      </div>

      {/* ZERO STATE CUSTOM SLATE CARD ADVISER */}
      {totalEmployees === 0 && totalCourses === 0 && (
        <div className="bg-sky-50 border border-sky-300 rounded-2xl p-6 shadow-sm text-slate-900 space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-sky-500 text-slate-950 rounded-xl mt-1 shrink-0">
              <Database className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                <span>L&D Database is Wiped (Zero State Slate)</span>
                <span className="px-2 py-0.5 bg-sky-200 text-sky-900 rounded-full text-[9px] font-mono tracking-wider font-extrabold uppercase">Ready for manual uploads</span>
              </h2>
              <p className="text-xs text-sky-950 leading-relaxed max-w-3xl font-sans font-medium">
                All mock baseline schedules, employee codes, matrices, and ISO evaluations have been completely deleted as requested. You now have a blank system. To begin scheduling evaluations, testing performance, or grading attendance:
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-white p-4 rounded-xl border border-sky-100 flex flex-col justify-between shadow-sm">
              <div>
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[8.5px] uppercase tracking-wide">Option A</span>
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide mt-1">Bulk Employee CSV</h4>
                <p className="text-[11px] text-slate-500 mt-1">Paste or drop an employee roster below to instantly register your entire team.</p>
              </div>
              <button 
                onClick={() => {
                  setIsAdminOpen(true);
                  setAdminTab('employees_bulk');
                  const el = document.getElementById('admin-console-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-3 w-full py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Open CSV Importer
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-sky-100 flex flex-col justify-between shadow-sm">
              <div>
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[8.5px] uppercase tracking-wide">Option B</span>
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide mt-1">Manual Data Entry</h4>
                <p className="text-[11px] text-slate-500 mt-1">Enter employees individually in the Admin panel and click the &quot;Training Library&quot; tab to define custom courses.</p>
              </div>
              <button 
                onClick={() => {
                  setIsAdminOpen(true);
                  setAdminTab('employees_manual');
                  const el = document.getElementById('admin-console-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-3 w-full py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Enter Manually
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-sky-100 flex flex-col justify-between shadow-sm">
              <div>
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[8.5px] uppercase tracking-wide">Option C</span>
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wide mt-1">Restore Demo Set</h4>
                <p className="text-[11px] text-slate-500 mt-1">Seed preloaded AGI Denim schedules and records if you want to explore the features.</p>
              </div>
              <button 
                onClick={onResetData}
                className="mt-3 w-full py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="metrics-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Courses Preloaded</p>
            <p className="text-2xl font-bold text-slate-900">{totalCourses}</p>
            <p className="text-[10px] text-emerald-600 font-mono mt-0.5">ISO HRM/4/010 Compliant</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Preloaded Employees</p>
            <p className="text-2xl font-bold text-slate-900">{totalEmployees}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Quality QA/Lab Teams</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Training Hours</p>
            <p className="text-2xl font-bold text-slate-900">{totalHoursDelivered} <span className="text-xs font-normal text-slate-500">hrs</span></p>
            <p className="text-[10px] text-sky-600 font-mono mt-0.5">Delivered Accumulative</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center space-x-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-800">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Avg Feedback Score</p>
            <p className="text-2xl font-bold text-slate-900">{avgFeedbackScore} <span className="text-xs font-normal text-slate-500">/ 5</span></p>
            <p className="text-[10px] text-emerald-600 font-mono mt-0.5">HRM/4/008(b) Standard</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-red-50 rounded-xl text-red-650">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Needs Evaluations</p>
            <p className="text-2xl font-bold text-red-650">{pendingTnaCount}</p>
            <p className="text-[10px] text-red-500 font-mono mt-0.5">Awaiting Effectiveness</p>
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-sectors">
        {/* Charts: Recharts Stats by Unit */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">Unit-wise Trained Attendance Volume</h3>
              <p className="text-xs text-slate-500">Accumulative metrics mapping trained attendees vs. uniqueness of worker pool per production block</p>
            </div>
          </div>
          
          <div className="h-72 w-full mt-2" id="unit-chart-container">
            {unitStatsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No training stats computed yet. Run events in Attendance!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Attendees Trained" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Unique Trainees" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie: Course Scope Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="space-y-1 pb-4 border-b border-slate-50">
            <h3 className="text-base font-bold text-slate-900 font-sans">Scope Classification</h3>
            <p className="text-xs text-slate-500">Distribution of preloaded L&D training subjects</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scopeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total course badge inside Pie */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-2xl font-bold text-slate-900">{totalCourses}</span>
              <span className="text-[10px] font-semibold text-slate-400">Total Matrix</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {scopeData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-600 truncate max-w-[120px]">{item.name}:</span>
                <span className="font-bold text-slate-800 font-mono ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-additional-panels">
        {/* Calendar / Upcoming Events list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">Scheduled L&D Calendar Tracks</h3>
              <p className="text-xs text-slate-500">Upcoming training slots scheduled by HRM/4/010</p>
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
            >
              Configure
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
              <span>All currently scheduled courses are completed.</span>
              <button 
                onClick={onQuickSchedule}
                className="text-sky-600 hover:underline font-semibold text-xs mt-1"
              >
                Schedule an event now
              </button>
            </div>
          ) : (
            <div className="space-y-3 cursor-pointer overflow-y-auto max-h-[220px]">
              {upcomingEvents.map(evt => {
                const crs = courses.find(c => c.id === evt.courseId);
                return (
                  <div 
                    key={evt.id} 
                    onClick={() => onNavigate('attendance')}
                    className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl transition-all"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono text-[9px] font-semibold">
                        {crs?.id || "N/A"}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {crs?.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">Ref: {evt.trgRef} | Time: {evt.time}</p>
                    </div>
                    <div className="text-right space-y-1 shrink-0 ml-4">
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        {evt.date}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-sky-100 text-sky-850 rounded text-[9px] font-semibold tracking-wider font-mono">
                        {evt.attendees.length} Nominated
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Needs evaluations (Pre assessment summary) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">Active Needs Assessment Logs</h3>
              <p className="text-xs text-slate-500">Individual & departmental assessments awaiting post-training evaluation</p>
            </div>
            <button 
              onClick={() => onNavigate('pre')}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
            >
              Open Module
            </button>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto">
            {individualPre.filter(p => !p.isEvaluated).map(ind => {
              const emp = employees.find(e => e.code === ind.employeeCode);
              return (
                <div key={ind.id} className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-bold tracking-wider uppercase font-mono mr-2">
                       Individual
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {ind.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{ind.trainingSubject}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">For Employee: {emp?.name || ind.employeeCode} ({emp?.designation})</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('pre')}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              );
            })}

            {departmentalPre.filter(p => !p.isEvaluated).map(dept => (
              <div key={dept.id} className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-850 rounded text-[9px] font-bold tracking-wider uppercase font-mono mr-2">
                     Dept
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: {dept.id}</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{dept.trainingSubject}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Department: {dept.department}</p>
                </div>
                <button 
                  onClick={() => onNavigate('pre')}
                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Verify
                </button>
              </div>
            ))}

            {pendingTnaCount === 0 && (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>All training need assessments successfully evaluated!</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">Perfect compliance status</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------ ADMINISTRATIVE slate CONSOLE & IMPORT UTILITY ------------------ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm no-print" id="admin-console-panel">
        <button 
          onClick={() => setIsAdminOpen(p => !p)}
          className="w-full flex items-center justify-between p-5 bg-slate-900 text-white rounded-t-2xl font-bold font-sans text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-800 transition"
        >
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-black tracking-tight text-white normal-case">⚙️ System Admin, Bulk Importers & Custom Roster Slate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-sky-400 text-slate-950 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest font-black uppercase">
              {isAdminOpen ? 'COLLAPSE PANEL' : 'EXPAND PANEL'}
            </span>
          </div>
        </button>

        {isAdminOpen && (
          <div className="p-6 space-y-6">
            {/* Tab selector */}
            <div className="flex flex-wrap border-b border-slate-200 gap-1">
              <button
                onClick={() => setAdminTab('employees_bulk')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${
                  adminTab === 'employees_bulk' 
                    ? 'border-slate-900 text-slate-900 bg-slate-50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                📥 Bulk Import Employees (CSV)
              </button>
              <button
                onClick={() => setAdminTab('courses_bulk')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${
                  adminTab === 'courses_bulk' 
                    ? 'border-slate-900 text-slate-900 bg-slate-50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                📥 Bulk Import Courses (CSV)
              </button>
              <button
                onClick={() => setAdminTab('employees_manual')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${
                  adminTab === 'employees_manual' 
                    ? 'border-slate-900 text-slate-900 bg-slate-50' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                👤 Manual Employee Roster ({totalEmployees})
              </button>
              <button
                onClick={() => setAdminTab('reset')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border-b-2 transition-all cursor-pointer ${
                  adminTab === 'reset' 
                    ? 'border-red-600 text-red-650 bg-red-50/40' 
                    : 'border-transparent text-slate-500 hover:text-red-650'
                }`}
              >
                🚨 Danger Zone / System Reset
              </button>
            </div>

            {/* Tab Contents: Employees Bulk */}
            {adminTab === 'employees_bulk' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-600">
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                    <Info className="w-4 h-4 text-slate-700" />
                    <span>How to use the Bulk Employee Loader</span>
                  </div>
                  <p>Prepare your personnel list in an Excel template and copy-paste it here. Columns must be in this sequence:</p>
                  <p className="font-mono bg-slate-200/50 p-2 rounded text-slate-900 tracking-wider">
                    Code, Name, Email, Designation, Department, Unit, [Optional HOD Name], [Optional HOD Email]
                  </p>
                  <p>Example columns block:</p>
                  <pre className="font-mono text-[10px] bg-slate-900 text-slate-300 p-3 rounded overflow-x-auto leading-relaxed">
                    AGI-001, Muhammad Ahmed, ahmed@agidenim.com, QA Executive, Quality Assurance, Unit 1{"\n"}
                    AGI-002, Sarah Khan, sarah@agidenim.com, Senior Inspector, Yarn Quality, Unit 1{"\n"}
                    AGI-003, Faisal Shah, faisal@agidenim.com, Fabric QA Manager, Dyeing Lab, Unit 2
                  </pre>
                </div>

                <div 
                  onDragOver={e => { e.preventDefault(); setIsDraggingEmp(true); }}
                  onDragLeave={() => setIsDraggingEmp(false)}
                  onDrop={e => handleFileDrop(e, 'emp')}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                    isDraggingEmp ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/20'
                  }`}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-800">Drag & Drop Employee CSV file here</p>
                  <p className="text-[10.5px] text-slate-500 mt-1">or paste the content details into the box below</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Paste Plaintext CSV/Tab-Separated Data:</label>
                  <textarea
                    rows={6}
                    value={csvEmployeesText}
                    onChange={e => setCsvEmployeesText(e.target.value)}
                    placeholder="Code, Name, Email, Designation, Department, Unit..."
                    className="w-full font-mono text-xs p-3.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setCsvEmployeesText('')}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Clear Input
                  </button>
                  <button
                    onClick={handleCSVEmployeeSubmit}
                    className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload & Register Employees</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab Contents: Courses Bulk */}
            {adminTab === 'courses_bulk' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-600">
                  <div className="flex items-center space-x-1.5 text-slate-900 font-bold">
                    <Info className="w-4 h-4 text-slate-700" />
                    <span>How to use the Bulk Training Course Loader</span>
                  </div>
                  <p>Prepare your course list and copy-paste it here. Columns must be in this sequence:</p>
                  <p className="font-mono bg-slate-200/50 p-2 rounded text-slate-900 tracking-wider">
                    ID, Course Name, Trainer Name, Department, Frequency, Scope, DurationHours
                  </p>
                  <p>Example course block:</p>
                  <pre className="font-mono text-[10px] bg-slate-900 text-slate-300 p-3 rounded overflow-x-auto leading-relaxed">
                    TRG-QA-01, Sewing Machine Operator Specs, Faisal Shah, Quality Assurance, Monthly, Professional/Technical, 2.5{"\n"}
                    TRG-QA-02, Chemical Risk Management, Sarah Khan, Dyeing Lab, Annually, Systems/Sustainability, 4.0{"\n"}
                    TRG-QA-03, Ethical Sourcing Standards, HR Dept, Corporate Welfare, Biannually, Social Compliance, 3.0
                  </pre>
                </div>

                <div 
                  onDragOver={e => { e.preventDefault(); setIsDraggingCrs(true); }}
                  onDragLeave={() => setIsDraggingCrs(false)}
                  onDrop={e => handleFileDrop(e, 'crs')}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                    isDraggingCrs ? 'border-sky-500 bg-sky-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/20'
                  }`}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-slate-800">Drag & Drop Course CSV file here</p>
                  <p className="text-[10.5px] text-slate-500 mt-1">or paste the content details into the box below</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Paste Plaintext Course CSV/Tab-Separated Data:</label>
                  <textarea
                    rows={6}
                    value={csvCoursesText}
                    onChange={e => setCsvCoursesText(e.target.value)}
                    placeholder="ID, Course Name, Trainer Name, Department, Frequency, Scope, DurationHours..."
                    className="w-full font-mono text-xs p-3.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-400 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setCsvCoursesText('')}
                    className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Clear Input
                  </button>
                  <button
                    onClick={handleCSVCourseSubmit}
                    className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload & Register Courses</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab Contents: Manual Employee Entry */}
            {adminTab === 'employees_manual' && (
              <div className="space-y-6">
                {/* Manual Add Form Grid */}
                <form onSubmit={handleManualEmployeeSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Register New Employee Manually</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Employee Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AGI-105"
                        value={newEmpCode}
                        onChange={e => setNewEmpCode(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none font-bold uppercase tracking-wider"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Faisal Shah"
                        value={newEmpName}
                        onChange={e => setNewEmpName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. faisal@agidenim.com"
                        value={newEmpEmail}
                        onChange={e => setNewEmpEmail(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. QC Senior Inspector"
                        value={newEmpDesg}
                        onChange={e => setNewEmpDesg(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Department</label>
                      <select
                        value={newEmpDept}
                        onChange={e => setNewEmpDept(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      >
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="Yarn Lab Quality">Yarn Lab Quality</option>
                        <option value="Dyeing Lab Quality">Dyeing Lab Quality</option>
                        <option value="Process Audit QA">Process Audit QA</option>
                        <option value="Weaving Group">Weaving Group</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Production Unit</label>
                      <select
                        value={newEmpUnit}
                        onChange={e => setNewEmpUnit(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      >
                        <option value="Unit 1">Unit 1</option>
                        <option value="Unit 2">Unit 2</option>
                        <option value="Unit 3">Unit 3</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Reporting HOD Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HOD QA Manager"
                        value={newEmpHOD}
                        onChange={e => setNewEmpHOD(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-600">Reporting HOD Email</label>
                      <input
                        type="email"
                        placeholder="e.g. hod.qa@agidenim.com"
                        value={newEmpHODEmail}
                        onChange={e => setNewEmpHODEmail(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 bg-white rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Register Manual Employee</span>
                    </button>
                  </div>
                </form>

                {/* Table list of database employees */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Current Staff Records List</h4>
                  {employees.length === 0 ? (
                    <div className="bg-slate-50 text-center py-8 border border-dashed rounded-xl text-slate-400 text-xs font-semibold">
                      No registered employees in local index. Ready for your manual custom slate upload!
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
                      <table className="w-full text-left text-xs bg-white">
                        <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold tracking-wider border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Full Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Designation</th>
                            <th className="px-4 py-3">Dept</th>
                            <th className="px-4 py-3">Unit</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {employees.map(emp => (
                            <tr key={emp.code} className="hover:bg-slate-50 font-medium">
                              <td className="px-4 py-2.5 font-mono text-slate-900 font-bold">{emp.code}</td>
                              <td className="px-4 py-2.5">{emp.name}</td>
                              <td className="px-4 py-2.5 text-slate-500 lowercase">{emp.email}</td>
                              <td className="px-4 py-2.5 text-slate-650">{emp.designation}</td>
                              <td className="px-4 py-2.5 text-slate-650">{emp.department}</td>
                              <td className="px-4 py-2.5 text-slate-550">{emp.unit}</td>
                              <td className="px-4 py-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete employee ${emp.name} (Code: ${emp.code})?`)) {
                                      onDeleteEmployee(emp.code);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors inline-flex cursor-pointer"
                                  title="Delete Employee"
                                >
                                  <Trash2 className="w-4 h-4" />
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

            {/* Tab Contents: Reset */}
            {adminTab === 'reset' && (
              <div className="bg-red-50/20 border border-red-200/50 p-6 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-sm font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <Trash2 className="w-5 h-5 text-red-650" />
                    <span>Danger Area: Database Reset Diagnostics</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Be very careful with the operations below. These direct commands affect your custom uploaded storage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-5 border border-red-200 rounded-xl space-y-3 shadow-sm">
                    <h4 className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-red-650" />
                      <span>Zero Out All Database Tables</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      This deletes all registered employees, custom training schedules, attendee marks, evaluations, and calendars. It initiates a perfect clean sheet.
                    </p>
                    <button
                      type="button"
                      onClick={onClearData}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-colors"
                    >
                      Make Data Zero
                    </button>
                  </div>

                  <div className="bg-white p-5 border border-slate-200 rounded-xl space-y-3 shadow-sm">
                    <h4 className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" style={{ animationDuration: '4s' }} />
                      <span>Restore Demo Baseline</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Instantly restores the complete set of AGI Denim preloaded specifications, calendars, skill profiles, and sample worker assessments.
                    </p>
                    <button
                      type="button"
                      onClick={onResetData}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-colors"
                    >
                      Preload Mock Defaults
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
