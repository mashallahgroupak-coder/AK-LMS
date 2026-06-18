import React, { useState } from 'react';
import { Course, Employee, TrainingEvent, PostAssessmentMark } from '../types';
import { Save, AlertCircle, FileCheck, CheckCircle2, Award, Printer, ShieldAlert } from 'lucide-react';

interface AttendanceSheetProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  postMarks?: PostAssessmentMark[];
  onSaveAttendance: (
    eventId: string, 
    attendeeUpdates: { employeeCode: string; reportingTime: string; present: boolean; signature: string }[],
    trainerSig: string,
    hodSig: string,
    gmSig: string
  ) => void;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  courses,
  employees,
  events,
  postMarks = [],
  onSaveAttendance
}) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  
  // Custom form bindings
  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];
  const activeCourse = activeEvent ? courses.find(c => c.id === activeEvent.courseId) : null;

  // Dynamic L&D metrics for attendance minutes, hours, and man-hours calculations
  const durationMins = activeCourse ? (activeCourse.durationMinutes || (activeCourse.durationHours * 60)) : 0;
  const durationHours = activeCourse ? (activeCourse.durationHours || Number((durationMins / 60).toFixed(2))) : 0;
  const presentCount = activeEvent ? activeEvent.attendees.filter(a => presenceStates[a.employeeCode]).length : 0;
  const manHours = Number((presentCount * durationHours).toFixed(1));
  const trainingType = activeCourse?.trainer ? (activeCourse.trainer.toLowerCase().includes('external') ? 'External' : 'Internal') : 'Internal';
  
  const eventMarks = activeEvent ? postMarks.filter(m => m.trainingEventId === activeEvent.id) : [];
  const avgScoreString = eventMarks.length > 0 
    ? `${(eventMarks.reduce((acc, current) => acc + current.obtainedMarks, 0) / eventMarks.length).toFixed(0)}%`
    : "Not Graded Yet";

  // Track editable state internally
  const [reportingTimes, setReportingTimes] = useState<{ [code: string]: string }>({});
  const [presenceStates, setPresenceStates] = useState<{ [code: string]: boolean }>({});
  const [signaturesStates, setSignaturesStates] = useState<{ [code: string]: string }>({});

  const [trainerSignature, setTrainerSignature] = useState('Subject Matter Expert');
  const [hodSignature, setHodSignature] = useState('Sajid Mahmood (HOD Quality)');
  const [gmSignature, setGmSignature] = useState('General Manager QA');

  // Trigger sync state when active event changes
  React.useEffect(() => {
    if (activeEvent) {
      const times: { [code: string]: string } = {};
      const presence: { [code: string]: boolean } = {};
      const sigs: { [code: string]: string } = {};

      activeEvent.attendees.forEach(a => {
        times[a.employeeCode] = a.reportingTime || '09:55 AM';
        presence[a.employeeCode] = a.present;
        sigs[a.employeeCode] = a.signature || (a.present ? 'Signed' : '');
      });

      setReportingTimes(times);
      setPresenceStates(presence);
      setSignaturesStates(sigs);

      setTrainerSignature(activeEvent.trainerSignature || 'Subject Matter Expert');
      setHodSignature(activeEvent.hodSignature || 'Sajid Mahmood (HOD Quality)');
      setGmSignature(activeEvent.gmSignature || 'General Manager QA');
    }
  }, [selectedEventId, activeEvent]);

  if (!activeEvent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400">
        Please schedule a training event under the Calendar tab prior to launching the Attendance sheet.
      </div>
    );
  }

  const handleCheckboxChange = (code: string, checked: boolean) => {
    setPresenceStates(prev => ({ ...prev, [code]: checked }));
    if (checked) {
      setReportingTimes(prev => ({ ...prev, [code]: prev[code] || '09:55 AM' }));
      setSignaturesStates(prev => ({ ...prev, [code]: 'Signed' }));
    } else {
      setReportingTimes(prev => ({ ...prev, [code]: '' }));
      setSignaturesStates(prev => ({ ...prev, [code]: '' }));
    }
  };

  const handleSave = () => {
    const list = activeEvent.attendees.map(a => ({
      employeeCode: a.employeeCode,
      reportingTime: reportingTimes[a.employeeCode] || '',
      present: !!presenceStates[a.employeeCode],
      signature: signaturesStates[a.employeeCode] || ''
    }));

    onSaveAttendance(
      activeEvent.id, 
      list, 
      trainerSignature, 
      hodSignature, 
      gmSignature
    );
    alert("ISO Attendance Sheet saved & locked successfully!");
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="attendance-container">
      {/* Top action selectors */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-sans text-slate-900">Attendance Register & Sheets</h2>
          <p className="text-xs text-slate-500">Live roster matching formal ISO HRM/4/009 documents. Record attendance prior to submitting grades.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-350 rounded-xl text-xs focus:outline-none focus:ring-0 cursor-pointer text-slate-900 font-medium"
          >
            {events.map(evt => {
              const crs = courses.find(c => c.id === evt.courseId);
              return (
                <option key={evt.id} value={evt.id}>
                  {evt.status === 'Completed' ? '✓ ' : '⏳ '}{evt.trgRef} - {crs?.name}
                </option>
              );
            })}
          </select>

          <button
            onClick={triggerPrint}
            className="px-4 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* ISO HRM/4/009 sheet layout replica */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 mx-auto max-w-4xl font-sans relative">
        <div className="absolute top-4 right-4 text-[9px] font-mono border border-slate-300 px-2 py-0.5 rounded uppercase font-bold text-slate-400 no-print">
           System Replica
        </div>

        {/* ISO Code Headers */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-4 gap-4">
          <div className="flex items-center space-x-3.5">
            {/* Logo placeholder as shown in PDFs */}
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center font-bold font-sans text-center shrink-0">
              <span className="text-xs">AGI</span>
              <span className="text-[6px] tracking-widest leading-none font-mono">DENIM</span>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">Artistic Garment Industries</p>
              <p className="text-[10px] text-slate-500 font-semibold font-mono uppercase tracking-widest mt-0.5">(AGI DENIM) (Private) Limited.</p>
            </div>
          </div>

          <div className="text-right sm:text-right text-xs">
            <p className="font-bold text-slate-900">TRAINING ATTENDANCE SHEET</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">ISO Code: <strong>HRM/4/009</strong></p>
          </div>
        </div>

        {/* Form Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm pt-2">
          <div className="space-y-2 border-r border-slate-200 pr-4">
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-xs text-slate-500 font-semibold">TRG: Ref:</span>
              <span className="font-mono font-bold text-slate-900">{activeEvent.trgRef}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-xs text-slate-500 font-semibold">DATE:</span>
              <span className="font-mono font-bold text-slate-900">{activeEvent.date}</span>
            </div>
          </div>

          <div className="space-y-2 border-r border-slate-200 pr-4">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 py-1 border-b border-dashed border-slate-300 pb-1.5">
              <span>Triggers:</span>
              <label className="flex items-center space-x-1 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded font-bold">
                <input 
                  type="checkbox" 
                  checked={activeEvent.isTNA} 
                  disabled 
                  className="rounded text-slate-900 focus:ring-0 scale-75 cursor-not-allowed" 
                />
                <span className="text-[10px]">TNA Assessment Based</span>
              </label>
              <label className="flex items-center space-x-1 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded font-bold">
                <input 
                  type="checkbox" 
                  checked={activeEvent.isRefresher} 
                  disabled 
                  className="rounded text-slate-900 focus:ring-0 scale-75 cursor-not-allowed" 
                />
                <span className="text-[10px]">Refresher</span>
              </label>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-xs text-slate-500 font-semibold">SHEET NO:</span>
              <span className="font-mono font-bold text-slate-900">{activeEvent.sheetNo}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-xs text-slate-500 font-semibold">TRAINING TIME:</span>
              <span className="font-mono font-bold text-slate-900">{activeEvent.time}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
              <span className="text-xs text-slate-500 font-semibold">TRAINING SUBJECT:</span>
              <span className="font-bold text-slate-900 truncate max-w-[160px]" title={activeCourse?.name}>{activeCourse?.name || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* L&D KPIs: Duration, Training Hours, Man Hours, Type, and Assessment Score */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 no-print">
          <div className="text-center p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col justify-between h-full min-h-[56px] shadow-sm">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Duration (Mins)</p>
            <p className="text-sm font-black text-slate-900 tracking-tight font-mono mt-1">{durationMins} mins</p>
          </div>
          <div className="text-center p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col justify-between h-full min-h-[56px] shadow-sm">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Training Hours</p>
            <p className="text-sm font-black text-slate-900 tracking-tight font-mono mt-1">{durationHours} hrs</p>
          </div>
          <div className="text-center p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col justify-between h-full min-h-[56px] shadow-sm">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Man Hours</p>
            <p className="text-sm font-black text-emerald-705 tracking-tight font-mono mt-1">{manHours} M-Hrs</p>
            <p className="text-[8px] text-slate-400 font-medium leading-none mt-1">({presentCount} present × {durationHours}h)</p>
          </div>
          <div className="text-center p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col justify-between h-full min-h-[56px] shadow-sm">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Type (Int/Ext)</p>
            <p className="text-sm font-black text-blue-705 tracking-tight mt-1">{trainingType}</p>
          </div>
          <div className="text-center p-2.5 bg-white rounded-lg border border-slate-200/60 flex flex-col justify-between h-full min-h-[56px] shadow-sm col-span-2 md:col-span-1">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Assessment Score</p>
            <p className="text-sm font-black text-indigo-705 tracking-tight font-mono mt-1">{avgScoreString}</p>
          </div>
        </div>

        {/* Main Table replica matching AGI Denim HRM/4/009 */}
        <div className="border border-slate-900 rounded-xl overflow-hidden mt-4">
          <table className="min-w-full divide-y-2 divide-slate-900 text-xs font-sans">
            <thead className="bg-slate-50">
              <tr className="divide-x divide-slate-400">
                <th className="p-3 text-center font-bold text-slate-900 w-12">SRL #</th>
                <th className="p-3 text-left font-bold text-slate-900 w-24">EMP #</th>
                <th className="p-3 text-left font-bold text-slate-900">TRAINEES’ NAME</th>
                <th className="p-3 text-left font-bold text-slate-900 w-36">DESIGNATION</th>
                <th className="p-3 text-left font-bold text-slate-900 w-32">DEPARTMENT</th>
                <th className="p-3 text-center font-bold text-slate-900 w-24">REPORT CLOCK</th>
                <th className="p-3 text-center font-bold text-slate-900 w-20">STATUS</th>
                <th className="p-3 text-left font-bold text-slate-900 w-28">SIGNATURE</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-300">
              {activeEvent.attendees.map((att, idx) => {
                const emp = employees.find(e => e.code === att.employeeCode);
                const srlNum = (idx + 1).toString().padStart(2, '0');
                if (!emp) return null;

                const isPresent = !!presenceStates[att.employeeCode];

                return (
                  <tr key={att.employeeCode} className="divide-x divide-slate-300 align-middle">
                    <td className="p-3 text-center font-mono font-semibold text-slate-500">{srlNum}</td>
                    <td className="p-3 font-mono font-bold text-slate-950">{emp.code}</td>
                    <td className="p-3 font-bold text-slate-900">{emp.name}</td>
                    <td className="p-3 text-slate-700 font-medium">{emp.designation}</td>
                    <td className="p-3 text-slate-650 font-medium">{emp.department}</td>
                    <td className="p-3 text-center">
                      <input
                        type="text"
                        value={reportingTimes[att.employeeCode] || ''}
                        onChange={e => setReportingTimes(prev => ({ ...prev, [att.employeeCode]: e.target.value }))}
                        className="w-16 px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[10px] text-center bg-transparent focus:outline-none focus:border-slate-800"
                        placeholder="e.g. 09:55 AM"
                        disabled={!isPresent}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isPresent}
                        onChange={e => handleCheckboxChange(att.employeeCode, e.target.checked)}
                        className="rounded text-slate-900 focus:ring-0 scale-105 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={signaturesStates[att.employeeCode] || ''}
                        onChange={e => setSignaturesStates(prev => ({ ...prev, [att.employeeCode]: e.target.value }))}
                        className="w-full px-1.5 py-0.5 border border-slate-200 rounded bg-transparent focus:outline-none text-[10px] italic font-semibold"
                        placeholder="Signature Label"
                        disabled={!isPresent}
                      />
                    </td>
                  </tr>
                );
              })}

              {activeEvent.attendees.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-450 text-xs">
                     Please select candidate nominees in the Nomination Panel to populate the list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Signatures Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 text-xs text-slate-800 border-t-2 border-slate-900">
          <div className="space-y-2 text-center md:text-left">
            <input
              type="text"
              value={trainerSignature}
              onChange={e => setTrainerSignature(e.target.value)}
              className="w-full text-center md:text-left font-serif italic font-bold border-b border-dashed border-slate-300 pb-1 focus:outline-none font-semibold text-slate-900"
            />
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mt-1">Trainer’s Signature</p>
          </div>

          <div className="space-y-2 text-center">
            <input
              type="text"
              value={hodSignature}
              onChange={e => setHodSignature(e.target.value)}
              className="w-full text-center font-serif italic font-bold border-b border-dashed border-slate-300 pb-1 focus:outline-none font-semibold text-slate-900"
            />
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mt-1">HOD HR / Quality Signature</p>
          </div>

          <div className="space-y-2 text-center md:text-right">
            <input
              type="text"
              value={gmSignature}
              onChange={e => setGmSignature(e.target.value)}
              className="w-full text-center md:text-right font-serif italic font-bold border-b border-dashed border-slate-300 pb-1 focus:outline-none font-semibold text-slate-900"
            />
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mt-1">General Manager Signature</p>
          </div>
        </div>

        {/* Save/Submit Trigger Action */}
        <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-150 rounded-xl text-xs gap-4 no-print mt-6">
          <div className="flex items-center space-x-2 text-slate-500 font-medium">
            <AlertCircle className="w-5 h-5 text-sky-600 shrink-0" />
            <span>Marking sheet attendance & saving locks this class training slot, marking it <strong>Completed</strong> inside the calendar stats automatically.</span>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-slate-950 border border-slate-950 hover:bg-slate-850 text-white font-bold rounded-xl flex items-center space-x-2 cursor-pointer transition-all uppercase tracking-wider font-semibold shadow shrink-0"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Save & Lock Sheet</span>
          </button>
        </div>

        {/* Review notice footer */}
        <div className="text-center pt-2 text-[9px] text-slate-400 font-mono flex items-center justify-center space-x-2 select-none border-t border-slate-100">
          <span>Document/Record: Review date: 01.06.2023</span>
          <span>•</span>
          <span>Issue # 02</span>
          <span>•</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
