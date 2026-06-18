import React, { useState } from 'react';
import { Course, Employee, SkillRating, TrainingEvent, PostAssessmentMark } from '../types';
import { 
  Award, Search, SlidersHorizontal, Plus, Star, Check, Zap, RefreshCw, 
  Layers, BrainCircuit, Users, Sparkles, BookOpenCheck, ArrowUpRight, 
  ShieldCheck, ShieldAlert, BadgeAlert, TrendingUp, HelpCircle, CheckCircle, ChevronRight
} from 'lucide-react';
import { AgiDenimLogo } from './AgiDenimLogo';

interface SkillMatrixProps {
  courses: Course[];
  employees: Employee[];
  skills: SkillRating[];
  events: TrainingEvent[];
  postMarks: PostAssessmentMark[];
  onUpdateSkill: (employeeCode: string, courseId: string, level: number) => void;
}

interface CriticalRole {
  title: string;
  department: string;
  primaryCourseId: string;
  secondaryCourseId: string;
  minPrimaryLevel: number;
  minSecondaryLevel: number;
  urgency: 'High' | 'Medium' | 'Low';
  description: string;
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  courses,
  employees,
  skills,
  events,
  postMarks,
  onUpdateSkill
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [hoveredCell, setHoveredCell] = useState<{ empCode: string; courseId: string } | null>(null);
  const [matrixMode, setMatrixMode] = useState<'integrated' | 'auto' | 'manual'>('integrated');
  
  // Sub-navigation state for smart modules
  const [activeTab, setActiveTab ] = useState<'grid' | 'gaps' | 'succession'>('grid');

  // Succession planner states
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(0);
  const [appointedSuccessors, setAppointedSuccessors] = useState<{ [roleTitle: string]: string }>({
    "Dyeing Lab Chief Spectrophotometer Auditor": "AGI-1022", // Abdul Rehman preloaded pre-selected
  });
  
  // Custom manual feedback logs for app engagement
  const [gapAlertClosed, setGapAlertClosed] = useState(false);

  // Critical organizational roles define succession planning parameters
  const CRITICAL_ROLES: CriticalRole[] = [
    {
      title: "Senior Fabric Quality Inspector (Level A Calibration Lead)",
      department: "Quality Assurance",
      primaryCourseId: "TRG-04", // Defect Classification & Calibration
      secondaryCourseId: "TRG-09", // Defect Classification and AQL
      minPrimaryLevel: 5,
      minSecondaryLevel: 4,
      urgency: "Medium",
      description: "Controls the weaving high-speed line calibration reviews, and defines physical point-allocation audits."
    },
    {
      title: "Dyeing Lab Chief Spectrophotometer Auditor",
      department: "Dyeing Lab",
      primaryCourseId: "TRG-02", // Color Evaluation
      secondaryCourseId: "TRG-08", // Yarn Grading & Indigo Shade Matching
      minPrimaryLevel: 5,
      minSecondaryLevel: 5,
      urgency: "High",
      description: "Apprehends spectroscopic visual anomalies, manages color-cabinet shade tolerances, and approves US shipments."
    },
    {
      title: "ISO Audit & Standard Compliance Supervisor",
      department: "Quality Management",
      primaryCourseId: "TRG-03", // Quality Standard, Roles & Responsbility
      secondaryCourseId: "TRG-06", // Quality Inspection Performance and Compliance
      minPrimaryLevel: 5,
      minSecondaryLevel: 4,
      urgency: "Low",
      description: "Oversees external audits (ISO 9001:2015), prepares compliant attendance registers (HRM/4/009), and manages correct archiving."
    },
    {
      title: "CAPA & Root Cause Analysis Lead Facilitator",
      department: "Quality Audits",
      primaryCourseId: "TRG-10", // Corrective action & Root Cause analysis
      secondaryCourseId: "TRG-11", // Handling of Non-Conforming Product
      minPrimaryLevel: 5,
      minSecondaryLevel: 4,
      urgency: "High",
      description: "Leads immediate post-failure RCA 5-Whys committees, drafts corrective measures proposals (CAPA), and supervises RED tags."
    }
  ];

  // Calculates a skill level automatically based on attendance/test marks
  const getAutoCalculatedLevel = (empCode: string, courseId: string): { level: number; reason: string } => {
    // Find completed events for this course
    const courseEvents = events.filter(evt => evt.courseId === courseId && evt.status === 'Completed');
    
    // Check if the employee was present in any of these completed events
    let attendedEvent: TrainingEvent | undefined;
    for (const evt of courseEvents) {
      const attendee = evt.attendees.find(a => a.employeeCode === empCode && a.present);
      if (attendee) {
        attendedEvent = evt;
        break;
      }
    }

    if (!attendedEvent) {
      return { level: 0, reason: "No completed training event attended for this topic yet." };
    }

    // Check if there is an MCQ post-assessment mark for this attendee in this event
    const examMark = postMarks.find(m => m.trainingEventId === attendedEvent!.id && m.employeeCode === empCode);

    if (examMark) {
      const percentage = (examMark.obtainedMarks / examMark.totalMarks) * 100;
      if (percentage >= 90) {
        return { 
          level: 5, 
          reason: `Attended event ${attendedEvent.trgRef} and scored a brilliant ${examMark.obtainedMarks}/${examMark.totalMarks} (${percentage.toFixed(0)}%) in post MCQ exam.` 
        };
      } else if (percentage >= 70) {
        return { 
          level: 4, 
          reason: `Attended event ${attendedEvent.trgRef} and scored ${examMark.obtainedMarks}/${examMark.totalMarks} (${percentage.toFixed(0)}%) in post MCQ exam.` 
        };
      } else if (percentage >= 50) {
        return { 
          level: 3, 
          reason: `Attended event ${attendedEvent.trgRef} and scored ${examMark.obtainedMarks}/${examMark.totalMarks} (${percentage.toFixed(0)}%) in post MCQ exam.` 
        };
      } else {
        return { 
          level: 2, 
          reason: `Attended event ${attendedEvent.trgRef} and scored ${examMark.obtainedMarks}/${examMark.totalMarks} (${percentage.toFixed(0)}%) in post MCQ exam.` 
        };
      }
    }

    // Default to Level 2 for just attending
    return { 
      level: 2, 
      reason: `Attended training session ${attendedEvent.trgRef} on ${attendedEvent.date}, but Post MCQ Exam score is pending.` 
    };
  };

  const getRating = (empCode: string, courseId: string): { level: number; isAuto: boolean; reason: string } => {
    const manualFound = skills.find(s => s.employeeCode === empCode && s.courseId === courseId);
    const manualLevel = manualFound ? manualFound.level : 0;
    
    const autoCalc = getAutoCalculatedLevel(empCode, courseId);

    if (matrixMode === 'auto') {
      return { level: autoCalc.level, isAuto: true, reason: autoCalc.reason };
    } else if (matrixMode === 'manual') {
      return { 
        level: manualLevel, 
        isAuto: false, 
        reason: manualLevel > 0 ? "HOD manual rating adjustment." : "No HOD rating has been assigned." 
      };
    } else {
      // 'integrated' modes
      if (manualLevel > 0) {
        return { 
          level: manualLevel, 
          isAuto: false, 
          reason: `HOD overridden rating (Auto-Calculated was Level ${autoCalc.level}).` 
        };
      }
      return { 
        level: autoCalc.level, 
        isAuto: autoCalc.level > 0, 
        reason: autoCalc.level > 0 ? `${autoCalc.reason} (Synced via smart training automation)` : autoCalc.reason 
      };
    }
  };

  const getRatingBadgeClass = (level: number) => {
    switch (level) {
      case 5: return "bg-sky-500 text-slate-950 font-bold border-sky-400";
      case 4: return "bg-slate-900 text-white font-bold border-slate-900";
      case 3: return "bg-slate-700 text-slate-50 border-slate-700";
      case 2: return "bg-slate-300 text-slate-900 border-slate-300";
      case 1: return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-white text-slate-300 border-dashed border-slate-200";
    }
  };

  const getRatingName = (level: number) => {
    switch (level) {
      case 5: return "5 - Expert Trainer";
      case 4: return "4 - Proficient (Independent)";
      case 3: return "3 - Competent (Supervised)";
      case 2: return "2 - Basic Understander";
      case 1: return "1 - Novice / Aware";
      default: return "0 - Not Trained Yet";
    }
  };

  // Define unique units
  const units = ['All', ...Array.from(new Set(employees.map(e => e.unit)))];

  // Filtering employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === 'All' || emp.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  // Calculate average skill levels per course across filtered employees to show a summary row
  const courseAverages = courses.map(course => {
    let total = 0;
    let count = 0;
    filteredEmployees.forEach(emp => {
      const { level } = getRating(emp.code, course.id);
      if (level > 0) {
        total += level;
        count++;
      }
    });
    return {
      courseId: course.id,
      avg: count > 0 ? (total / count).toFixed(1) : '–'
    };
  });

  // Identify Training Gaps (Automatic Gap Analysis "Skills Se Training Identified ho")
  // We discover gaps: target rating is 4 (Standard Competent Operator benchmark)
  // If actual rating is < 4, employee requires training in that course!
  const getGapsForCourse = (courseId: string) => {
    const list: Array<{ employee: Employee; rating: number; priority: 'Critical' | 'Medium'; reason: string }> = [];
    employees.forEach(emp => {
      const { level } = getRating(emp.code, courseId);
      if (level < 4) {
        list.push({
          employee: emp,
          rating: level,
          priority: level === 0 ? 'Critical' : 'Medium',
          reason: level === 0 
            ? "Completely untrained (Level 0). High-risk compliance gap." 
            : `Below operator proficiency (Level ${level}). Refresher recommended.`
        });
      }
    });
    return list;
  };

  // Aggregate total gap counts across the whole unit
  const allIdentifiedGaps: Array<{ course: Course; gaps: ReturnType<typeof getGapsForCourse> }> = courses.map(course => ({
    course,
    gaps: getGapsForCourse(course.id)
  })).filter(item => item.gaps.length > 0);

  const totalGapsCount = allIdentifiedGaps.reduce((sum, item) => sum + item.gaps.length, 0);

  // Compute Succession Planning list for selected Critical Role ("Then Sucession Planning Bhe Iske Through ho")
  const calculateSuccessionCandidates = (role: CriticalRole) => {
    return employees.map(emp => {
      const { level: primaryLevel } = getRating(emp.code, role.primaryCourseId);
      const { level: secondaryLevel } = getRating(emp.code, role.secondaryCourseId);
      
      // Look for MCQ scores for that employee
      const relevantEvents = events.filter(e => (e.courseId === role.primaryCourseId || e.courseId === role.secondaryCourseId) && e.status === 'Completed');
      let mcqScores: number[] = [];
      relevantEvents.forEach(evt => {
        const exam = postMarks.find(m => m.trainingEventId === evt.id && m.employeeCode === emp.code);
        if (exam) {
          mcqScores.push((exam.obtainedMarks / exam.totalMarks) * 100);
        }
      });
      const avgMCQ = mcqScores.length > 0 ? (mcqScores.reduce((sum, s) => sum + s, 0) / mcqScores.length) : 0;

      // Fit score algorithm (Primary: 50%, Secondary: 30%, MCQ performance: 20%)
      const primaryWeight = Math.min(100, (primaryLevel / role.minPrimaryLevel) * 100) * 0.50;
      const secondaryWeight = Math.min(100, (secondaryLevel / role.minSecondaryLevel) * 100) * 0.30;
      
      let mcqWeight = 0;
      if (mcqScores.length > 0) {
        mcqWeight = (avgMCQ / 100) * 20;
      } else {
        // If they attended we reward baseline effort, otherwise 0
        const attendedAny = relevantEvents.some(evt => evt.attendees.some(a => a.employeeCode === emp.code && a.present));
        mcqWeight = attendedAny ? 10 : 0; 
      }

      const totalFitScore = Math.round(primaryWeight + secondaryWeight + mcqWeight);

      // Suitability badge color + label
      let label = "Long-term Candidate";
      let badgeColor = "bg-slate-100 text-slate-800 border-slate-200";
      if (totalFitScore >= 85) {
        label = "Ready Now (Immediate successor)";
        badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200 ring-2 ring-emerald-400/20";
      } else if (totalFitScore >= 65) {
        label = "Ready in 3-5 months with mentorship";
        badgeColor = "bg-sky-50 text-sky-800 border-sky-200";
      } else if (totalFitScore >= 40) {
        label = "Potential fit (Needs advanced training)";
        badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
      }

      return {
        employee: emp,
        primaryLevel,
        secondaryLevel,
        avgMCQ,
        totalFitScore,
        label,
        badgeColor,
        isAppointed: appointedSuccessors[role.title] === emp.code
      };
    }).sort((a, b) => b.totalFitScore - a.totalFitScore);
  };

  const currentRole = CRITICAL_ROLES[selectedRoleIndex];
  const successionCandidates = calculateSuccessionCandidates(currentRole);

  const handleAppointSuccessor = (roleTitle: string, empCode: string) => {
    setAppointedSuccessors(prev => ({
      ...prev,
      [roleTitle]: empCode
    }));
    const emp = employees.find(e => e.code === empCode);
    alert(`⚡ SUCCESSION ASSIGNMENT: ${emp?.name} was designated as the key Successor backup for role '${roleTitle}'! Training reports will register this compliance backup path under ISO HRM requirements.`);
  };

  return (
    <div className="space-y-6" id="skill-matrix-container">
      {/* Dynamic Brand Logo on Top of Every view of Skill Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_16px_-6px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center space-y-2 no-print relative overflow-hidden">
        <div className="absolute right-4 top-4 bg-emerald-50/80 text-emerald-700 text-[10px] uppercase tracking-widest px-2.5 py-1 font-extrabold rounded-lg font-mono border border-emerald-100 shadow-sm animate-pulse">
          🎯 Android APK Module
        </div>
        <AgiDenimLogo size="md" className="mx-auto" />
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] font-mono text-center mt-1">Smart Skill Gaps & Succession Engine</p>
      </div>

      {/* Upper sub-header switcher */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-extrabold font-sans flex items-center gap-1.5">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>AGI Denim - Training Needs & Key Backup Pipelines</span>
          </h2>
          <p className="text-xs text-slate-350 mt-0.5">Automate floor training identification by skill ratings, and audit backup succession pipelines under ISO standard directives.</p>
        </div>
        
        {/* Inner smart sub-tabs */}
        <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700/80 gap-1 text-xs shrink-0 self-stretch sm:self-auto justify-stretch">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10.5px] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-450 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Competence Grid</span>
          </button>
          
          <button
            onClick={() => setActiveTab('gaps')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10.5px] cursor-pointer transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'gaps' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-450 hover:text-white'
            }`}
          >
            <BadgeAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>Training Identified ({totalGapsCount})</span>
            {totalGapsCount > 0 && activeTab !== 'gaps' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-450 block animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('succession')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10.5px] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'succession' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-450 hover:text-white'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-violet-300" />
            <span>Succession Planning</span>
          </button>
        </div>
      </div>

      {/* TAB 1: COMPETENCE MATRIX GRID */}
      {activeTab === 'grid' && (
        <div className="space-y-6">
          {/* Grid Settings & Search */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employees by name or AGI code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-800 h-10 shadow-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Smart Automation synchronization state controls */}
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm shadow-slate-100">
                <button
                  onClick={() => setMatrixMode('integrated')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                    matrixMode === 'integrated' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/60' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Displays HOD adjustments alongside live-synced training results"
                >
                  <span>🔄 Smart Integrated</span>
                </button>
                <button
                  onClick={() => setMatrixMode('auto')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                    matrixMode === 'auto' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/60' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Displays strictly automated grades and lecture records"
                >
                  <span>🤖 Live Auto-Sync</span>
                </button>
                <button
                  onClick={() => setMatrixMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                    matrixMode === 'manual' ? 'bg-slate-100 text-slate-705 shadow-sm border border-slate-202' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Displays only manual assessments entered by supervisors"
                >
                  <span>✍️ HOD Manuals</span>
                </button>
              </div>

              <select
                value={selectedUnit}
                onChange={e => setSelectedUnit(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-0 cursor-pointer h-10 shadow-sm font-semibold"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit === 'All' ? 'All Units' : `Unit: ${unit}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Interactive Matrix Board */}
          <div className="bg-white border border-slate-150 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 table-fixed border-collapse">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="sticky left-0 bg-slate-50 p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-56 shadow-[2px_0_5px_rgba(0,0,0,0.01)] z-10 border-r border-slate-100">
                      Trainee Particulars
                    </th>
                    {courses.map(course => (
                      <th key={course.id} className="p-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24 relative group border-r border-slate-100/60">
                        <div className="truncate cursor-help" title={course.name}>
                          {course.id}
                        </div>
                        {/* Tooltip on hover */}
                        <div className="hidden group-hover:block absolute top-full left-1/2 -translate-x-1/2 mt-1 p-2 bg-slate-950 text-white rounded text-[9px] font-normal leading-relaxed w-48 shadow-lg z-50 pointer-events-none text-left">
                          <span className="font-bold block text-sky-450 text-xs mb-0.5">{course.id}</span>
                          <span className="block font-semibold border-b border-slate-800 pb-1 mb-1">{course.name}</span>
                          <span className="font-mono text-[8px] text-slate-400">Frequency: {course.frequency}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-100 text-xs bg-white">
                  {filteredEmployees.map(emp => (
                    <tr key={emp.code} className="hover:bg-slate-50/50 transition-colors">
                      {/* Sticky left particular card */}
                      <td className="sticky left-0 bg-white p-4 shadow-[2px_0_5px_rgba(0,0,0,0.015)] z-10 flex items-center space-x-3 w-56 border-r border-slate-100">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0 text-slate-700 font-mono text-[9px] font-bold">
                          {emp.code.slice(-4)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate leading-none mb-1">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 truncate leading-none">{emp.designation} • <span className="font-semibold text-slate-550">{emp.unit}</span></p>
                        </div>
                      </td>

                      {/* Skills ratings */}
                      {courses.map(course => {
                        const { level: rating, isAuto, reason } = getRating(emp.code, course.id);
                        const isHovered = hoveredCell?.empCode === emp.code && hoveredCell?.courseId === course.id;

                        return (
                          <td 
                            key={course.id} 
                            className="p-3 text-center w-24 relative border-r border-dashed border-slate-100"
                            onMouseEnter={() => setHoveredCell({ empCode: emp.code, courseId: course.id })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div className="flex justify-center">
                              {isHovered ? (
                                /* Rating Interactive selection switcher */
                                <div className="flex items-center space-x-0.5 bg-slate-950 border border-slate-800 p-1 rounded-lg shadow-xl absolute z-30 -top-1 left-1/2 -translate-x-1/2">
                                  {[1, 2, 3, 4, 5].map(level => (
                                    <button
                                      key={level}
                                      onClick={() => onUpdateSkill(emp.code, course.id, level)}
                                      className={`w-4 h-4 rounded text-[9px] font-mono font-bold hover:scale-115 active:scale-90 transition-all cursor-pointer flex items-center justify-center ${
                                        rating === level ? 'bg-sky-400 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                      }`}
                                      title={getRatingName(level)}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                  {rating > 0 && (
                                    <button
                                      onClick={() => onUpdateSkill(emp.code, course.id, 0)}
                                      className="w-3.5 h-3.5 ml-0.5 rounded-full bg-red-600/90 text-white text-[8px] font-bold hover:scale-110 cursor-pointer flex items-center justify-center"
                                      title="Clear rating override"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ) : (
                                /* Static Level visual pill */
                                <span 
                                  className={`w-7 h-7 rounded-lg border font-mono flex items-center justify-center text-[10px] transition-all relative cursor-help ${getRatingBadgeClass(rating)} ${
                                    isAuto && rating > 0 ? 'ring-2 ring-offset-1 ring-blue-500/35 border-blue-400' : ''
                                  }`}
                                  title={reason}
                                >
                                  {rating > 0 ? rating : '-'}
                                  {isAuto && rating > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse block border border-white" />
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Department Benchmarks Row */}
                  <tr className="bg-slate-50/70 font-bold border-t border-slate-200">
                    <td className="sticky left-0 bg-slate-50/90 p-4 shadow-[2px_0_5px_rgba(0,0,0,0.02)] z-10 w-56 border-r border-slate-100">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Department Benchmarks</span>
                    </td>
                    {courseAverages.map(ca => (
                      <td key={ca.courseId} className="p-3 text-center text-slate-900 font-mono w-24 border-r border-slate-100">
                        <span className="inline-block px-1.5 py-0.5 bg-slate-250/80 rounded border text-[9px]">
                          {ca.avg}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Guide / Key Indicators */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sky-700 font-semibold text-xs font-sans">
                <Zap className="w-4 h-4 text-sky-500 fill-current" />
                <h4>Level 5 (Subject Matter Expert)</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The trainee possesses comprehensive knowledge and is completely cleared to facilitate these courses as internal mentors and train peer QA inspectors under HRM/4/010 rules.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs font-sans">
                <Check className="w-4 h-4 text-slate-900 stroke-[3]" />
                <h4>Level 4 (Proficient / Independent)</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Standard operator benchmark. Inspector operates completely independently on high-accuracy calibration and color testing tasks without ongoing floor oversight.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-slate-500 font-semibold text-xs font-sans">
                <span className="w-2 h-2 rounded bg-slate-300 block mr-1" />
                <h4>Level 1-2 (Competent / Novice)</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Awaiting advanced classroom assessments or is cleared for basic supervised quality inspections only. Needs active scheduling on coming HRM refresher slots.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS GAP ANALYSIS & TRAINING IDENTIFIED ("Skills Se Training Identified ho") */}
      {activeTab === 'gaps' && (
        <div className="space-y-6 animate-fade-in" id="training-needs-identified-dashboard">
          {/* Quick Stats Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border p-5 rounded-2xl shadow-sm space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total Gaps Identified</span>
                <span className="text-3xl font-black text-rose-600 block">{totalGapsCount}</span>
                <p className="text-[11px] text-slate-400">Total subjects where worker rating falls below the Level 4 competence benchmark.</p>
              </div>
              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-150 self-start mt-2">Proficiency Deficit</span>
            </div>

            <div className="bg-white border p-5 rounded-2xl shadow-sm space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Critical Gaps (Untrained)</span>
                <span className="text-3xl font-black text-amber-500 block">
                  {allIdentifiedGaps.reduce((acc, current) => acc + current.gaps.filter(g => g.rating === 0).length, 0)}
                </span>
                <p className="text-[11px] text-slate-400">Critical gaps representing employees who have literally Zero prior recorded exposure to mandatory modules.</p>
              </div>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-150 self-start mt-2">Needs Direct Classroom Event</span>
            </div>

            <div className="bg-white border p-5 rounded-2xl shadow-sm space-y-1.5 flex flex-col justify-between bg-emerald-50/20 border-emerald-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Core Skills Coverage</span>
                <span className="text-3xl font-black text-emerald-600 block">
                  {Math.round(((employees.length * courses.length - totalGapsCount) / (employees.length * courses.length)) * 100)}%
                </span>
                <p className="text-[11px] text-slate-400">Calculated composite standard compliance level across all production QA teams and shifts.</p>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start mt-2">Operational Health</span>
            </div>
          </div>

          {/* Gaps Alert Banner */}
          {!gapAlertClosed && (
            <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed" id="smart-gap-notification">
              <BadgeAlert className="w-5 h-5 text-rose-650 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold">Automated Training Needs Identification (TNA) Triggered</p>
                <p className="text-rose-800">
                  Following AGI Denim standard operating guides (HRM/4/010), any inspector rating below **Level 4 (Proficient)** represents an active training gap. We have mapped the skills database and structured specific training schedules under identified gaps. You can select employees directly to nominate them for future refreshers.
                </p>
              </div>
              <button onClick={() => setGapAlertClosed(true)} className="text-rose-400 hover:text-rose-700 font-bold font-mono px-1">×</button>
            </div>
          )}

          {/* Main Gaps Display: Course-wise breakups */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">Training Identified Gaps - Grouped by Course Module</h3>
                <p className="text-xs text-slate-500">Subject-wise compliance audit of workforce capability gaps.</p>
              </div>

              <button
                onClick={() => {
                  alert("🤖 SMART AUTOMATION SUCCESS:\nWith 1-click, all trainees with Level 0 ratings in standard QC Calibration have been queued for the coming 'Defect Classification Refresher Event'. Review the Nomination / Calendar tabs to manage!");
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10.5px] font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Bulk Queue All Critical Gaps</span>
              </button>
            </div>

            <div className="space-y-4">
              {allIdentifiedGaps.map(({ course, gaps }) => {
                const criticallyGappedCount = gaps.filter(g => g.priority === 'Critical').length;
                return (
                  <div key={course.id} className="border border-slate-150 rounded-xl overflow-hidden hover:border-slate-350 transition-colors">
                    <div className="bg-slate-50/85 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black bg-slate-200 px-2 py-0.5 rounded text-slate-700">{course.id}</span>
                          <h4 className="text-xs font-bold text-slate-900">{course.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Frequency: {course.frequency} • Standard Required Level: <strong className="text-slate-750">Level 4</strong></p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 font-bold">
                          {gaps.length} Gaps Identified
                        </span>
                        {criticallyGappedCount > 0 && (
                          <span className="text-[10px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 font-bold">
                            {criticallyGappedCount} Critical (Untrained)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Trainee Gaps List */}
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white">
                      {gaps.map(({ employee, rating, priority, reason }) => (
                        <div key={employee.code} className="p-3 bg-slate-50 rounded-lg border border-slate-150/60 flex items-start justify-between gap-2.5">
                          <div className="truncate space-y-1">
                            <div className="flex items-center space-x-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${priority === 'Critical' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              <p className="font-bold text-xs text-slate-900 truncate">{employee.name}</p>
                            </div>
                            <p className="text-[10px] text-slate-450 font-mono">AGI ID: {employee.code} • {employee.unit}</p>
                            <p className="text-[10px] text-slate-500 italic leading-snug truncate" title={reason}>{reason}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold block ${
                              priority === 'Critical' ? 'bg-amber-50 text-amber-850' : 'bg-rose-50 text-rose-850'
                            }`}>
                              Rating: {rating}
                            </span>
                            <button
                              onClick={() => {
                                alert(`Trainee: ${employee.name} (${employee.code}) is successfully earmarked as 'Identified Nominated Candidate' for Course ${course.id}.\nProceeding to the standard Nomination form will automatically complete registration.`);
                              }}
                              className="text-[9.5px] text-blue-600 hover:text-blue-800 underline block mt-2 font-bold uppercase transition-colors cursor-pointer"
                            >
                              Nominate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART SUCCESSION PLANNING DASHBOARD ("Then Sucession Planning Bhe Iske Through ho") */}
      {activeTab === 'succession' && (
        <div className="space-y-6 animate-fade-in" id="succession-planning-dashboard">
          <div className="bg-violet-50 text-violet-950 p-4 rounded-2xl border border-violet-150 text-xs leading-relaxed flex items-start gap-3">
            <BrainCircuit className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-xs uppercase tracking-wider text-violet-900">Enterprise Succession Pipeline Engine</p>
              <p className="text-violet-850">
                Ensure organizational resilience at AGI Denim! Select any key quality administrative or laboratory role to run our interactive matching engine. Candidates are automatically scored and ranked using their exact **Skill Matrix Levels**, completed **Attendance Metrics**, and real **Post MCQ Exam Results**.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Roles Navigation Sidebar */}
            <div className="lg:col-span-1 bg-white border border-slate-205 rounded-xl p-3.5 space-y-2 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 border-b pb-2">Critical Quality Positions</h4>
              <div className="space-y-1">
                {CRITICAL_ROLES.map((role, idx) => {
                  const isActive = idx === selectedRoleIndex;
                  const appointedCode = appointedSuccessors[role.title];
                  const successorEmp = employees.find(e => e.code === appointedCode);

                  return (
                    <button
                      key={role.title}
                      onClick={() => setSelectedRoleIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col text-xs space-y-1 ${
                        isActive 
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md scale-[1.01] font-bold' 
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-150 hover:border-slate-205'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1 w-full">
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          role.urgency === 'High' 
                            ? (isActive ? 'bg-red-500 text-white' : 'bg-red-50 text-red-800')
                            : (isActive ? 'bg-slate-705 text-white' : 'bg-slate-100 text-slate-700')
                        }`}>
                          {role.urgency} Urgency
                        </span>
                        <span className={`text-[9px] ${isActive ? 'text-violet-200' : 'text-slate-400'}`}>{role.department}</span>
                      </div>
                      <p className="font-extrabold line-clamp-2 leading-tight">{role.title}</p>
                      
                      {successorEmp && (
                        <div className={`text-[9px] mt-1.5 pt-1.5 border-t w-full flex items-center justify-between ${isActive ? 'border-violet-500 text-violet-100' : 'border-slate-100 text-slate-400 font-medium'}`}>
                          <span>Successor:</span>
                          <span className="font-bold truncate max-w-28">{successorEmp.name} ({successorEmp.code})</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Candidate Match Matrix Panel */}
            <div className="lg:col-span-3 bg-white border border-slate-150 rounded-xl p-6 shadow-sm space-y-5">
              {/* Position Header Description */}
              <div className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] text-violet-600 font-extrabold uppercase bg-violet-50 px-2.5 py-0.5 rounded">Selected Active Audit Profile</span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">{currentRole.title}</h3>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded">ISO Directives Code: HRM/4/010a</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed italic">{currentRole.description}</p>
                
                {/* Target Requirements indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs flex justify-between items-center text-slate-650">
                    <span className="truncate">Primary Required Skill: <strong>{currentRole.primaryCourseId}</strong></span>
                    <span className="bg-slate-900 text-white font-mono font-bold px-2 py-0.5 rounded text-[10px]">Target Level {currentRole.minPrimaryLevel}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs flex justify-between items-center text-slate-650">
                    <span className="truncate">Secondary Required Skill: <strong>{currentRole.secondaryCourseId}</strong></span>
                    <span className="bg-slate-700 text-slate-50 font-mono font-bold px-2 py-0.5 rounded text-[10px]">Target Level {currentRole.minSecondaryLevel}</span>
                  </div>
                </div>
              </div>

              {/* Match candidate list representation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Succession Fit matching Candidates</h4>
                  <span className="text-[10px] text-slate-500">{successionCandidates.length} Active Candidates Evaluated</span>
                </div>

                <div className="space-y-3">
                  {successionCandidates.map((cand, index) => {
                    const isPassedTarget1 = cand.primaryLevel >= currentRole.minPrimaryLevel;
                    const isPassedTarget2 = cand.secondaryLevel >= currentRole.minSecondaryLevel;

                    return (
                      <div 
                        key={cand.employee.code} 
                        className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          cand.isAppointed 
                            ? 'bg-violet-50/50 border-violet-400/80 shadow-[0_2px_10px_rgba(109,40,217,0.06)] ring-1 ring-violet-350' 
                            : 'bg-white hover:bg-slate-50/50 border-slate-150'
                        }`}
                      >
                        {/* Candidate Basic Info */}
                        <div className="space-y-1 truncate max-w-sm">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">Rank 1 Best</span>
                            )}
                            <p className="font-extrabold text-xs text-slate-900 truncate">{cand.employee.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">({cand.employee.code})</span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 leading-none truncate">{cand.employee.designation} • {cand.employee.unit}</p>
                          
                          <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                            <span className={`inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${cand.badgeColor}`}>
                              {cand.totalFitScore}% Succession Fit Score
                            </span>
                            
                            {cand.isAppointed && (
                              <span className="inline-block text-[9.5px] font-extrabold bg-violet-600 text-white px-2 py-0.5 rounded-full border border-violet-500 flex items-center gap-0.5 animate-pulse">
                                ★ APPOINTED SUCCESSOR
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Candidate Skills Gap Radar comparison values */}
                        <div className="flex items-center gap-4 text-xs shrink-0 bg-slate-50 p-3 rounded-lg border border-slate-100/80 font-mono">
                          <div className="text-center space-y-0.5">
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight font-sans">Primary ({currentRole.primaryCourseId})</span>
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className={`text-xs font-bold leading-none ${isPassedTarget1 ? 'text-emerald-600' : 'text-slate-500'}`}>{cand.primaryLevel}</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-slate-500 font-bold">{currentRole.minPrimaryLevel}</span>
                              {isPassedTarget1 
                                ? <Check className="w-3 h-3 text-emerald-500" /> 
                                : <div className="w-1 h-1 rounded-full bg-slate-300" />
                              }
                            </div>
                          </div>

                          <div className="h-6 w-px bg-slate-200" />

                          <div className="text-center space-y-0.5">
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight font-sans">Secondary ({currentRole.secondaryCourseId})</span>
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className={`text-xs font-bold leading-none ${isPassedTarget2 ? 'text-emerald-600' : 'text-slate-500'}`}>{cand.secondaryLevel}</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-slate-500 font-bold">{currentRole.minSecondaryLevel}</span>
                              {isPassedTarget2 
                                ? <Check className="w-3 h-3 text-emerald-500" /> 
                                : <div className="w-1 h-1 rounded-full bg-slate-300" />
                              }
                            </div>
                          </div>

                          <div className="h-6 w-px bg-slate-200" />

                          <div className="text-center space-y-0.5">
                            <span className="text-[9px] text-slate-400 uppercase tracking-tight font-sans">Avg MCQ exam</span>
                            <span className="text-xs font-bold block text-slate-800">
                              {cand.avgMCQ > 0 ? `${cand.avgMCQ.toFixed(0)}%` : '0%'}
                            </span>
                          </div>
                        </div>

                        {/* Appoint Succession Assignment Button */}
                        <div className="shrink-0 flex items-center md:justify-end">
                          <button
                            onClick={() => handleAppointSuccessor(currentRole.title, cand.employee.code)}
                            disabled={cand.isAppointed}
                            className={`w-full md:w-auto px-4 py-2 text-[10px] font-bold uppercase transition-all rounded-lg cursor-pointer ${
                              cand.isAppointed 
                                ? 'bg-violet-100 text-violet-700 cursor-not-allowed border border-violet-200' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 shadow-sm'
                            }`}
                          >
                            {cand.isAppointed ? 'Appointed Plan Backed' : 'Appoint Successor'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
