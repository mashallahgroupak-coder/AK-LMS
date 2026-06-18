import { useState } from 'react';
import { getLMSData, saveLMSData, INITIAL_COURSES, INITIAL_EMPLOYEES, INITIAL_EVENTS, INITIAL_SKILLS, INITIAL_INDIVIDUAL_PRE_ASSESSMENTS, INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS, INITIAL_FEEDBACKS, INITIAL_POST_MARKS } from './data';
import { Course, Employee, TrainingEvent, SkillRating, IndividualPreAssessment, DepartmentalPreAssessment, PostAssessmentFeedback, PostAssessmentMark } from './types';
import { DashboardOverview } from './components/DashboardOverview';
import { PreAssessment } from './components/PreAssessment';
import { SkillMatrix } from './components/SkillMatrix';
import { TrainingCalendar } from './components/TrainingCalendar';
import { TrainingLibrary } from './components/TrainingLibrary';
import { NominationForm } from './components/NominationForm';
import { AttendanceSheet } from './components/AttendanceSheet';
import { UnitStatsAnalysis } from './components/UnitStatsAnalysis';
import { PostAssessment } from './components/PostAssessment';
import { TrainingReports } from './components/TrainingReports';
import { AgiDenimLogo } from './components/AgiDenimLogo';

import { 
  Building2, LayoutDashboard, FileCheck2, Grid, CalendarDays, BookOpenText, 
  SendToBack, ClipboardList, BarChart4, ClipboardCheck, FileSpreadsheet, RefreshCw 
} from 'lucide-react';

export default function App() {
  const [db, setDb] = useState(() => getLMSData());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isApkMode, setIsApkMode] = useState<boolean>(false);

  const updateDb = (updater: (prev: typeof db) => typeof db) => {
    setDb(prev => {
      const next = updater(prev);
      saveLMSData(next);
      return next;
    });
  };

  // State handles
  const handleAddCourse = (course: Course) => {
    updateDb(prev => ({
      ...prev,
      courses: [...prev.courses, course]
    }));
  };

  const handleAddIndividualPre = (tna: IndividualPreAssessment) => {
    updateDb(prev => ({
      ...prev,
      individualPre: [tna, ...prev.individualPre]
    }));
  };

  const handleAddDepartmentalPre = (tna: DepartmentalPreAssessment) => {
    updateDb(prev => ({
      ...prev,
      departmentalPre: [tna, ...prev.departmentalPre]
    }));
  };

  const handleEvaluateIndividual = (
    id: string, 
    scores: any, 
    rating: any, 
    evaluator: string, 
    designation: string, 
    date: string
  ) => {
    updateDb(prev => ({
      ...prev,
      individualPre: prev.individualPre.map(p => p.id === id ? {
        ...p,
        isEvaluated: true,
        evaluationScores: scores,
        evaluationHODRating: rating,
        evaluatedByName: evaluator,
        evaluatedByDesignation: designation,
        evaluatedByDate: date
      } : p)
    }));
  };

  const handleEvaluateDepartmental = (
    id: string, 
    scores: any, 
    rating: any, 
    evaluator: string, 
    designation: string, 
    date: string
  ) => {
    updateDb(prev => ({
      ...prev,
      departmentalPre: prev.departmentalPre.map(p => p.id === id ? {
        ...p,
        isEvaluated: true,
        evaluationScores: scores,
        evaluationHODRating: rating,
        evaluatedByName: evaluator,
        evaluatedByDesignation: designation,
        evaluatedByDate: date
      } : p)
    }));
  };

  const handleUpdateSkill = (employeeCode: string, courseId: string, level: number) => {
    updateDb(prev => {
      const filtered = prev.skills.filter(s => !(s.employeeCode === employeeCode && s.courseId === courseId));
      return {
        ...prev,
        skills: [...filtered, { employeeCode, courseId, level }]
      };
    });
  };

  const handleAddEvent = (evt: TrainingEvent) => {
    updateDb(prev => ({
      ...prev,
      events: [evt, ...prev.events]
    }));
  };

  const handleUpdateEventStatus = (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    updateDb(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, status } : e)
    }));
  };

  const handleNominateTrainee = (eventId: string, employeeCode: string) => {
    updateDb(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? {
        ...e,
        attendees: [...e.attendees, { employeeCode, reportingTime: '', present: false, signature: '' }]
      } : e)
    }));
  };

  const handleRemoveNomination = (eventId: string, employeeCode: string) => {
    updateDb(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? {
        ...e,
        attendees: e.attendees.filter(a => a.employeeCode !== employeeCode)
      } : e)
    }));
  };

  const handleSaveAttendance = (
    eventId: string, 
    attendeeUpdates: { employeeCode: string; reportingTime: string; present: boolean; signature: string }[],
    trainerSig: string,
    hodSig: string,
    gmSig: string
  ) => {
    updateDb(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === eventId ? {
        ...e,
        status: 'Completed',
        attendees: attendeeUpdates,
        trainerSignature: trainerSig,
        hodSignature: hodSig,
        gmSignature: gmSig
      } : e)
    }));
  };

  const handleAddFeedback = (fb: PostAssessmentFeedback) => {
    updateDb(prev => ({
      ...prev,
      feedbacks: [fb, ...prev.feedbacks]
    }));
  };

  const handleSaveMarks = (eventId: string, marks: { employeeCode: string; obtainedMarks: number; totalMarks: number }[]) => {
    updateDb(prev => {
      const filtered = prev.postMarks.filter(m => m.trainingEventId !== eventId);
      const newMarks = marks.map((m, i) => ({
        id: `M-${eventId}-${i}-${Date.now().toString().slice(-3)}`,
        trainingEventId: eventId,
        employeeCode: m.employeeCode,
        obtainedMarks: m.obtainedMarks,
        totalMarks: m.totalMarks
      }));

      return {
        ...prev,
        postMarks: [...filtered, ...newMarks]
      };
    });
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all data back to preloaded AGI Denim default schedules and values? All your modifications will be erased.")) {
      const defaultDb = {
        courses: INITIAL_COURSES,
        employees: INITIAL_EMPLOYEES,
        events: INITIAL_EVENTS,
        skills: INITIAL_SKILLS,
        individualPre: INITIAL_INDIVIDUAL_PRE_ASSESSMENTS,
        departmentalPre: INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS,
        feedbacks: INITIAL_FEEDBACKS,
        postMarks: INITIAL_POST_MARKS,
      };
      setDb(defaultDb);
      saveLMSData(defaultDb);
    }
  };

  const tabs = [
    { id: 'overview', name: 'L&D Dashboard', icon: LayoutDashboard },
    { id: 'pre', name: 'Pre Assessment (TNA)', icon: FileCheck2 },
    { id: 'skills', name: 'Skill Matrix', icon: Grid },
    { id: 'calendar', name: 'Training Calendar', icon: CalendarDays },
    { id: 'library', name: 'Training Library', icon: BookOpenText },
    { id: 'nomination', name: 'Nomination', icon: SendToBack },
    { id: 'attendance', name: 'Attendance', icon: ClipboardList },
    { id: 'unit-stats', name: 'Unit-wise Stats', icon: BarChart4 },
    { id: 'post', name: 'Post-Assessment', icon: ClipboardCheck },
    { id: 'reports', name: 'Training Reports', icon: FileSpreadsheet }
  ];

  if (isApkMode) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-3 relative overflow-y-auto font-sans text-slate-900" id="apk-mockup-wrapper">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Floating Top Control Panel */}
        <div className="mb-4 z-40 bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between gap-4 shadow-xl w-full max-w-[420px] no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-350 font-bold uppercase tracking-wider font-mono">AGI Android APK Mode</span>
          </div>
          <button
            onClick={() => setIsApkMode(false)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-xl cursor-pointer shadow-md shadow-blue-900/40 transition-all flex items-center gap-1.5"
          >
            🖥️ Desktop Hub
          </button>
        </div>

        {/* ANDROID DEVICE SHELL MOCKUP */}
        <div className="relative w-full max-w-[425px] h-[845px] rounded-[55px] border-[12px] border-slate-900 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden shrink-0 select-none">
          
          {/* CAMERA PUNCH HOLE / DETAILED NOTCH */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-14 border border-slate-850" />
          </div>

          {/* SIMULATED ANDROID STATUS BAR */}
          <div className="bg-slate-900 text-slate-100 h-8 px-6 pt-1 flex items-center justify-between text-[11px] font-bold tracking-wide shrink-0 font-mono z-40 select-none pointer-events-none">
            <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            <div className="flex items-center space-x-1.5 text-[10px]">
              <span>📶</span>
              <span>📶</span>
              <span className="font-sans">⚡ 100%</span>
            </div>
          </div>

          {/* SIMULATED MAIN VIEW CONTAINER (Inside Device Display) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full relative bg-slate-50/80">
            {/* ANDROID COMPLIANT APP TOP HEAD ("will be on top of every page" on Mobile APP) */}
            <div className="bg-white border-b border-slate-205 py-4 px-4 flex flex-col items-center justify-center shrink-0 shadow-sm relative no-print">
              <AgiDenimLogo size="xs" theme="light" />
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-extrabold font-mono mt-0.5">L&D Operational Android Module</p>
            </div>

            {/* MOBILE CONTENT CANVAS - SCROLLABLE */}
            <main className="flex-1 overflow-y-auto p-4 pb-20">
              <div className="max-w-full w-full">
                {activeTab === 'overview' && (
                  <DashboardOverview 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    individualPre={db.individualPre}
                    departmentalPre={db.departmentalPre}
                    feedbacks={db.feedbacks}
                    postMarks={db.postMarks}
                    onNavigate={setActiveTab}
                    onQuickSchedule={() => setActiveTab('calendar')}
                  />
                )}

                {activeTab === 'pre' && (
                  <PreAssessment 
                    employees={db.employees}
                    individualPre={db.individualPre}
                    departmentalPre={db.departmentalPre}
                    onAddIndividual={handleAddIndividualPre}
                    onAddDepartmental={handleAddDepartmentalPre}
                    onEvaluateIndividual={handleEvaluateIndividual}
                    onEvaluateDepartmental={handleEvaluateDepartmental}
                  />
                )}

                {activeTab === 'skills' && (
                  <SkillMatrix 
                    courses={db.courses}
                    employees={db.employees}
                    skills={db.skills}
                    events={db.events}
                    postMarks={db.postMarks}
                    onUpdateSkill={handleUpdateSkill}
                  />
                )}

                {activeTab === 'calendar' && (
                  <TrainingCalendar 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    onAddEvent={handleAddEvent}
                    onUpdateEventStatus={handleUpdateEventStatus}
                  />
                )}

                {activeTab === 'library' && (
                  <TrainingLibrary 
                    courses={db.courses}
                    onAddCourse={handleAddCourse}
                  />
                )}

                {activeTab === 'nomination' && (
                  <NominationForm 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    onNominateTrainee={handleNominateTrainee}
                    onRemoveNomination={handleRemoveNomination}
                  />
                )}

                {activeTab === 'attendance' && (
                  <AttendanceSheet 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    onSaveAttendance={handleSaveAttendance}
                  />
                )}

                {activeTab === 'unit-stats' && (
                  <UnitStatsAnalysis 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    postMarks={db.postMarks}
                  />
                )}

                {activeTab === 'post' && (
                  <PostAssessment 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    feedbacks={db.feedbacks}
                    postMarks={db.postMarks}
                    onAddFeedback={handleAddFeedback}
                    onSaveMarks={handleSaveMarks}
                  />
                )}

                {activeTab === 'reports' && (
                  <TrainingReports 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    feedbacks={db.feedbacks}
                    postMarks={db.postMarks}
                    individualPre={db.individualPre}
                  />
                )}
              </div>
            </main>
          </div>

          {/* SIMULATED BOTTOM TABS BAR IN ANDROID (Mobile packaged navigation layout with full touch targets) */}
          <div className="absolute bottom-5 left-0 right-0 h-[52px] bg-slate-950 border-t border-slate-900 flex items-center justify-around px-2.5 z-40 shadow-xl">
            {tabs.slice(0, 5).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-12 h-10 rounded-xl transition-all cursor-pointer ${
                    isActive ? 'text-sky-400 font-extrabold scale-110' : 'text-slate-450 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[7.5px] mt-0.5 max-w-[50px] font-sans truncate tracking-wider uppercase font-bold text-center leading-none">
                    {tab.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
            
            {/* Extended menu options popup */}
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="bg-slate-900 text-slate-300 rounded-lg text-[8px] font-bold uppercase tracking-wider py-1 px-1.5 border border-slate-800 outline-none w-14 cursor-pointer text-center"
              title="More L&D Operations modules"
            >
              <option disabled value="">More</option>
              {tabs.slice(5).map(tab => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* SIMULATED GESTURE INDICATOR PILL */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1/3 h-[4px] bg-slate-650 rounded-full z-50 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row" id="app-root">
      
      {/* Mobile Top Branding Roster with AGI Denim Logo */}
      <header className="flex md:hidden items-center justify-between bg-slate-950 text-white px-4 py-2 border-b border-slate-900 no-print shrink-0 shadow-md">
        <div className="flex items-center space-x-2">
          <AgiDenimLogo size="xs" theme="dark" className="flex-row items-center gap-1.5" />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApkMode(true)}
            className="text-[9px] font-extrabold text-emerald-450 hover:text-white border border-emerald-900/40 bg-emerald-950/40 px-2 py-1 rounded-lg cursor-pointer transition-all animate-pulse"
          >
            📱 APK
          </button>
          
          <button
            onClick={handleResetData}
            className="text-[9px] font-bold text-slate-400 hover:text-white border border-slate-850 px-2 py-1 rounded bg-slate-900 cursor-pointer transition-colors"
          >
            Reset Specs
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Tabs (only on smaller screens) */}
      <div className="flex md:hidden bg-slate-950 text-white px-2 py-1.5 overflow-x-auto gap-1 border-b border-slate-900 no-print shrink-0 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Desktop Sidebar with AGI Denim corporate branding */}
      <aside className="hidden md:flex w-64 bg-slate-950 flex-shrink-0 flex-col border-r border-slate-900 no-print">
        {/* Branding header in Sidebar using AGI Denim customized Logo component */}
        <div className="p-5 border-b border-slate-900 bg-slate-1000/30">
          <AgiDenimLogo size="sm" theme="dark" className="mr-auto items-start text-left" />
        </div>

        {/* Navigation list in sidebar */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold scale-[1.01]' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile Section at bottom of sidebar */}
        <div className="p-4 border-t border-slate-900 bg-slate-1000/40">
          <div className="bg-slate-900 hover:bg-slate-855 rounded-2xl p-3 flex items-center gap-3 transition-colors border border-slate-800/30">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-sm shadow-blue-900/30">
              SM
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-100 font-bold truncate">Sajid Mahmood</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">HOD QA Group</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full relative">
        
        {/* Desktop Top Header Bar with AGI Denim Mode selector and branding overview */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0 no-print">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight font-sans">L&D Operational Dashboard</h2>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-550">
              <span className="text-blue-600">UNIT 01: QA & AUDITS</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TOGGLE FOR APK PREVIEW APP */}
            <button
              onClick={() => setIsApkMode(true)}
              className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold tracking-tight hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
              title="Preview LMS App under simulated Android APK packaging environment"
            >
              <span className="text-base">📱</span>
              <span>View APK Module</span>
            </button>

            <button
              onClick={handleResetData}
              className="bg-slate-100 text-slate-650 px-3 py-1.5 rounded-lg border border-slate-205 text-xs font-bold uppercase tracking-tight hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Reset data back to preloaded defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            
            <button
              onClick={() => setActiveTab('nomination')}
              className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              New Nomination
            </button>
          </div>
        </header>

        {/* Dynamic scrollable canvas area for views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 pb-20">
          <div className="transition-opacity duration-200 mx-auto max-w-7xl w-full" id="current-active-view">
            
            {/* DYNAMIC TOP LOGO BRAND BOARD FOR EVERY PAGE CANVAS - Complying with "will be on top of every page" */}
            <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-center px-6 gap-3 no-print">
              <AgiDenimLogo size="xs" theme="light" className="flex-row items-center gap-2" />
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black tracking-widest text-slate-400 font-mono leading-none">AGI DENIM L&D OPERATIONS DEPT</p>
                <p className="text-[9px] text-emerald-600 font-semibold uppercase flex items-center justify-center sm:justify-end gap-1 mt-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                  <span>ISO 9001 SYSTEM COMPLIANT</span>
                </p>
              </div>
            </div>

            {activeTab === 'overview' && (
              <DashboardOverview 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                individualPre={db.individualPre}
                departmentalPre={db.departmentalPre}
                feedbacks={db.feedbacks}
                postMarks={db.postMarks}
                onNavigate={setActiveTab}
                onQuickSchedule={() => {
                  setActiveTab('calendar');
                }}
              />
            )}

            {activeTab === 'pre' && (
              <PreAssessment 
                employees={db.employees}
                individualPre={db.individualPre}
                departmentalPre={db.departmentalPre}
                onAddIndividual={handleAddIndividualPre}
                onAddDepartmental={handleAddDepartmentalPre}
                onEvaluateIndividual={handleEvaluateIndividual}
                onEvaluateDepartmental={handleEvaluateDepartmental}
              />
            )}

            {activeTab === 'skills' && (
              <SkillMatrix 
                courses={db.courses}
                employees={db.employees}
                skills={db.skills}
                events={db.events}
                postMarks={db.postMarks}
                onUpdateSkill={handleUpdateSkill}
              />
            )}

            {activeTab === 'calendar' && (
              <TrainingCalendar 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                onAddEvent={handleAddEvent}
                onUpdateEventStatus={handleUpdateEventStatus}
              />
            )}

            {activeTab === 'library' && (
              <TrainingLibrary 
                courses={db.courses}
                onAddCourse={handleAddCourse}
              />
            )}

            {activeTab === 'nomination' && (
              <NominationForm 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                onNominateTrainee={handleNominateTrainee}
                onRemoveNomination={handleRemoveNomination}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceSheet 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeTab === 'unit-stats' && (
              <UnitStatsAnalysis 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                postMarks={db.postMarks}
              />
            )}

            {activeTab === 'post' && (
              <PostAssessment 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                feedbacks={db.feedbacks}
                postMarks={db.postMarks}
                onAddFeedback={handleAddFeedback}
                onSaveMarks={handleSaveMarks}
              />
            )}

            {activeTab === 'reports' && (
              <TrainingReports 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                feedbacks={db.feedbacks}
                postMarks={db.postMarks}
                individualPre={db.individualPre}
              />
            )}
          </div>
        </main>
        
        {/* Floating live synchronization state badge (Design element) */}
        <div className="fixed bottom-4 right-6 bg-white shadow-xl hover:shadow-2xl border border-slate-200/80 rounded-full px-4 py-2 flex items-center gap-2 z-50 transition-all select-none no-print">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">Live L&D Sync Active</span>
        </div>

      </div>
    </div>
  );
}
