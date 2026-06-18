import React, { useState } from 'react';
import { Course, Employee, TrainingEvent } from '../types';
import { Mail, MessageSquare, Copy, Check, Users, ShieldAlert, Sparkles, Send } from 'lucide-react';

interface NominationFormProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  onNominateTrainee: (eventId: string, employeeCode: string) => void;
  onRemoveNomination: (eventId: string, employeeCode: string) => void;
}

export const NominationForm: React.FC<NominationFormProps> = ({
  courses,
  employees,
  events,
  onNominateTrainee,
  onRemoveNomination
}) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [selectedTraineeForPreview, setSelectedTraineeForPreview] = useState(employees[0]?.code || '');

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];
  const activeCourse = activeEvent ? courses.find(c => c.id === activeEvent.courseId) : null;
  const activeEmployeeForPreview = employees.find(e => e.code === selectedTraineeForPreview);

  if (!activeEvent) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400">
        Please schedule a training event in the Calendar tab prior to launching the Nomination Panel.
      </div>
    );
  }

  // Get codes of currently nominated attendees
  const nominatedCodes = activeEvent.attendees.map(a => a.employeeCode);

  // Filter employees who are NOT yet nominated
  const availableEmployees = employees.filter(emp => !nominatedCodes.includes(emp.code));

  // Generate invitation letter narrative
  const generateInviteText = (emp: Employee) => {
    return `*ARTISTIC GARMENT INDUSTRIES (AGI DENIM) (PVT) LTD.*
L&D Training nomination under ISO Code: *HRM/4/010*

Dear *${emp.name}* (${emp.designation}),

You have been officially nominated for our upcoming specialized industrial training session:

• *Course*: ${activeCourse?.name || 'Classroom Subject'}
• *Reference ID*: ${activeEvent.trgRef}
• *Scheduled Date*: ${activeEvent.date}
• *Hours/Timings*: ${activeEvent.time}
• *Trainer*: Subject Matter Expert (SME)
• *Venue*: HR Training Studio Floor

Please ensure punctual reporting. Your reporting and sheet entries are monitored under HRM/4/009 regulations.

Regards,
*HR Department (L&D Group)*
Artistic Garment Industries (AGI Denim)`;
  };

  const handleCopyToClipboard = (emp: Employee) => {
    const txt = generateInviteText(emp);
    navigator.clipboard.writeText(txt);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  // Mail link creation
  const getMailtoLink = (emp: Employee) => {
    const subject = encodeURIComponent(`L&D Nomination: ${activeCourse?.name || 'Training Program'}`);
    const body = encodeURIComponent(generateInviteText(emp));
    return `mailto:${emp.email}?subject=${subject}&body=${body}`;
  };

  // WhatsApp link creation
  const getWhatsAppLink = (emp: Employee) => {
    const text = encodeURIComponent(generateInviteText(emp));
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  return (
    <div className="space-y-6" id="nomination-container">
      {/* Header and top bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-bold font-sans text-slate-900">Worker Nomination Dispatch Panel</h2>
        <p className="text-xs text-slate-500 mt-0.5">Nominate plant floor inspectors, generate formal notices, and coordinate instantly via Email or WhatsApp alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left selector and nominee management list */}
        <div className="lg:col-span-2 space-y-5">
          {/* Selector card */}
          <div className="bg-white p-5 border border-slate-150 rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.02)] space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Select Scheduled Class Training</label>
              <select
                value={selectedEventId}
                onChange={e => {
                  setSelectedEventId(e.target.value);
                  // Update preview child state
                  const event = events.find(ev => ev.id === e.target.value);
                  if (event && event.attendees.length > 0) {
                    setSelectedTraineeForPreview(event.attendees[0].employeeCode);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-0 cursor-pointer"
              >
                {events.map(evt => {
                  const crs = courses.find(c => c.id === evt.courseId);
                  return (
                    <option key={evt.id} value={evt.id}>
                      {evt.trgRef} - {crs?.name} ({evt.date})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Event overview quick info */}
            {activeCourse && (
              <div className="grid grid-cols-3 gap-3 bg-slate-50/50 p-3.5 rounded-xl text-[11px] border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px] uppercase tracking-wider">Trainer</span>
                  <span className="font-bold text-slate-850 truncate block">{activeCourse.trainer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px] uppercase tracking-wider">Method</span>
                  <span className="font-bold text-slate-850 truncate block">{activeCourse.method}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[9px] uppercase tracking-wider">AQL / Scope</span>
                  <span className="font-bold text-slate-850 truncate block">{activeCourse.scope}</span>
                </div>
              </div>
            )}
          </div>

          {/* Manage list card */}
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-slate-800" />
                <span>Nominees List ({nominatedCodes.length})</span>
              </h3>
              <p className="text-[10px] text-slate-450 font-mono">HRM/4/009 Sheet Roster</p>
            </div>

            {/* List of currently nominated */}
            <div className="divide-y divide-slate-100 min-h-[160px] max-h-[300px] overflow-y-auto px-5">
              {activeEvent.attendees.map(attendee => {
                const emp = employees.find(e => e.code === attendee.employeeCode);
                if (!emp) return null;
                return (
                  <div key={attendee.employeeCode} className="py-3 flex justify-between items-center text-xs">
                    <div 
                      className="cursor-pointer space-y-0.5"
                      onClick={() => setSelectedTraineeForPreview(emp.code)}
                    >
                      <p className={`font-bold transition-colors ${selectedTraineeForPreview === emp.code ? 'text-sky-600' : 'text-slate-900'}`}>
                        {emp.name} <span className="text-[10px] font-mono text-slate-400 font-normal">({emp.code})</span>
                      </p>
                      <p className="text-[10px] text-slate-400">{emp.designation} • {emp.unit}</p>
                    </div>

                    <button
                      onClick={() => {
                        onRemoveNomination(activeEvent.id, emp.code);
                        if (selectedTraineeForPreview === emp.code) {
                          setSelectedTraineeForPreview('');
                        }
                      }}
                      className="text-red-650 hover:text-red-750 font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-[10px] cursor-pointer"
                    >
                      Deregister
                    </button>
                  </div>
                );
              })}

              {activeEvent.attendees.length === 0 && (
                <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                  Awaiting candidates roster. Click &quot;Add Nominees&quot; from available staff list.
                </div>
              )}
            </div>
          </div>

          {/* Available to nominate pool */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-[0_2px_6px_rgba(0,0,0,0.02)] space-y-3.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">Available Quality Staff Pool</h3>
              <p className="text-[11px] text-slate-400">Select other employees in QA who are not currently scheduled for this slot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {availableEmployees.map(emp => (
                <div 
                  key={emp.code} 
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{emp.designation} ({emp.unit})</p>
                  </div>
                  <button
                    onClick={() => {
                      onNominateTrainee(activeEvent.id, emp.code);
                      setSelectedTraineeForPreview(emp.code);
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] cursor-pointer shrink-0"
                  >
                    Nominate +
                  </button>
                </div>
              ))}

              {availableEmployees.length === 0 && (
                <div className="col-span-full text-center text-xs py-8 text-slate-450 border border-dashed border-slate-200 rounded-xl">
                  All active inspectors from our pool are currently nominated for this scheduled training session.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side invitation dispatcher with WhatsApp/Email hooks */}
        <div className="space-y-5">
          {activeEmployeeForPreview ? (
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-4 h-4 text-sky-400 animate-pulse stroke-[2.5]" />
                    <span className="text-[10px] font-mono tracking-widest font-bold text-sky-400 uppercase">Interactive Notice</span>
                  </div>
                  <span className="text-[9px] font-mono pr-1">Preview</span>
                </div>

                {/* Simulated message screen */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-200 space-y-1.5 overflow-hidden">
                  <p className="font-bold text-sky-400 border-b border-slate-850 pb-1.5 mb-1.5">TO: {activeEmployeeForPreview.name}</p>
                  <p className="font-bold uppercase text-slate-400">AGI DENIM HRM/4/010</p>
                  <p>Nominated for *{activeCourse?.name || 'Classroom Subject'}*</p>
                  <p>Time: <span className="text-slate-350">{activeEvent.time}</span></p>
                  <p>Date: <span className="text-slate-350">{activeEvent.date}</span></p>
                  <p>Please enter report entry on sheet {activeEvent.sheetNo}.</p>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="space-y-2.5">
                <button
                  onClick={() => handleCopyToClipboard(activeEmployeeForPreview)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  {copiedStatus ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500 animate-[bounce_0.5s_ease-in-out]" />
                      <span className="text-emerald-500">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copy Raw WhatsApp Text</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={getMailtoLink(activeEmployeeForPreview)}
                    className="py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all text-center"
                    title="Send formal email invitation"
                  >
                    <Mail className="w-4 h-4 text-slate-950" />
                    <span>Send Email</span>
                  </a>

                  <a
                    href={getWhatsAppLink(activeEmployeeForPreview)}
                    target="_blank"
                    rel="noreferrer referrer"
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all text-center"
                    title="Send WhatsApp invitation message notification"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 border border-dashed border-slate-300 p-8 rounded-3xl text-center text-xs text-slate-400 flex flex-col justify-center min-h-[300px]">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Please select or nominate at least one trainee in the list to reveal the interactive notices dispatcher.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
