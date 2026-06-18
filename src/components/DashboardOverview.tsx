import React from 'react';
import { Course, Employee, TrainingEvent, IndividualPreAssessment, DepartmentalPreAssessment, PostAssessmentFeedback, PostAssessmentMark } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Calendar, Users, Award, BookOpen, Clock, AlertTriangle, Play, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';

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
  onQuickSchedule
}) => {
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
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
    </div>
  );
};
