import React, { useState } from 'react';
import { Course, Employee, TrainingEvent } from '../types';
import { Calendar as CalendarIcon, Clock, Plus, Tag, ChevronLeft, ChevronRight, CheckCircle, Clock5, FileSpreadsheet, X } from 'lucide-react';

interface TrainingCalendarProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  onAddEvent: (evt: TrainingEvent) => void;
  onUpdateEventStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  courses,
  employees,
  events,
  onAddEvent,
  onUpdateEventStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'events'>('timeline');

  // New event state
  const [newEvt, setNewEvt] = useState({
    courseId: courses[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 01:00 PM',
    trgRef: 'TRG/REF-2026/',
    sheetNo: 'HRM/4/009-S',
    isTNA: true,
    isRefresher: false,
    selectedCodes: [] as string[]
  });

  // Month labels matching fiscal/annual schedule starting July -> June
  const months = [
    { name: 'July', key: '-07-' },
    { name: 'August', key: '-08-' },
    { name: 'September', key: '-09-' },
    { name: 'October', key: '-10-' },
    { name: 'November', key: '-11-' },
    { name: 'December', key: '-12-' },
    { name: 'January', key: '-01-' },
    { name: 'February', key: '-02-' },
    { name: 'March', key: '-03-' },
    { name: 'April', key: '-04-' },
    { name: 'May', key: '-05-' },
    { name: 'June', key: '-06-' }
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const eventId = `EVT-${Date.now().toString().slice(-6)}`;
    
    const attendees = newEvt.selectedCodes.map(code => ({
      employeeCode: code,
      reportingTime: '',
      present: false,
      signature: ''
    }));

    const event: TrainingEvent = {
      id: eventId,
      courseId: newEvt.courseId,
      date: newEvt.date,
      time: newEvt.time,
      trgRef: newEvt.trgRef,
      sheetNo: newEvt.sheetNo,
      isTNA: newEvt.isTNA,
      isRefresher: newEvt.isRefresher,
      status: 'Scheduled',
      attendees: attendees.length > 0 ? attendees : employees.slice(0, 3).map(em => ({
        employeeCode: em.code,
        reportingTime: '',
        present: false,
        signature: ''
      }))
    };

    onAddEvent(event);
    setShowAddModal(false);
    // Reset
    setNewEvt({
      courseId: courses[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM',
      trgRef: 'TRG/REF-2026/',
      sheetNo: 'HRM/4/009-S',
      isTNA: true,
      isRefresher: false,
      selectedCodes: []
    });
  };

  const getEventsForMonth = (monthKey: string) => {
    return events.filter(evt => evt.date.includes(monthKey));
  };

  const getStatusBadge = (status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    switch (status) {
      case 'Completed': return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case 'Cancelled': return "bg-red-50 text-red-800 border-red-100";
      default: return "bg-sky-50 text-sky-850 border-sky-100";
    }
  };

  return (
    <div className="space-y-6" id="calendar-container">
      {/* Upper header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900">Training Schedule & Calendar</h2>
          <p className="text-xs text-slate-500 mt-0.5">Annual training timeline mapping July to June under ISO Code: HRM/4/010 regulations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-slate-900 border border-slate-950 hover:bg-slate-800 active:bg-slate-950 text-white font-medium rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
          id="btn-schedule-meeting"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Schedule New Slot</span>
        </button>
      </div>

      {/* Selector Subtabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 px-5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'timeline' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Annual Fiscal Timeline Tracker (July - June)
          {activeTab === 'timeline' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'events' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Detailed Scheduled Logs List
          {activeTab === 'events' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
          )}
        </button>
      </div>

      {/* Main timeline */}
      {activeTab === 'timeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="timeline-monthly-grid">
          {months.map(mon => {
            const monEvents = getEventsForMonth(mon.key);
            
            return (
              <div 
                key={mon.name} 
                className="bg-white border border-slate-150 rounded-2xl p-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-50 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{mon.name}</h3>
                    <span className="text-[10px] font-mono shrink-0 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-bold">
                       {monEvents.length} Slots
                    </span>
                  </div>

                  <div className="space-y-2.5 min-h-[140px]">
                    {monEvents.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-slate-300 font-medium text-[11px] border border-dashed border-slate-100 rounded-xl">
                        No trainings scheduled
                      </div>
                    ) : (
                      monEvents.map(evt => {
                        const crs = courses.find(c => c.id === evt.courseId);
                        return (
                          <div 
                            key={evt.id} 
                            className={`p-2 rounded-xl border text-[11px] space-y-1 relative group transition-all ${
                              evt.status === 'Completed' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' : 
                              evt.status === 'Cancelled' ? 'bg-red-50/20 border-red-100 text-slate-500' :
                              'bg-indigo-50/30 border-slate-200 text-slate-900 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex justify-between items-start font-semibold">
                              <span className="font-mono text-[9px] text-slate-400">{crs?.id || "TRG"}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${
                                evt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                                evt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-sky-100 text-sky-850'
                              }`}>
                                {evt.status}
                              </span>
                            </div>
                            
                            <h4 className="font-bold line-clamp-2 leading-tight">
                              {crs?.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-mono flex items-center pt-0.5">
                              <Clock className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                              {evt.date.slice(-2)}th • {evt.time}
                            </p>

                            <div className="pt-2 flex justify-end space-x-1 mt-1 border-t border-slate-100/40 opacity-90">
                              {evt.status === 'Scheduled' && (
                                <>
                                  <button
                                    onClick={() => onUpdateEventStatus(evt.id, 'Completed')}
                                    className="px-1.5 py-0.5 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 rounded text-[9px] transition-all cursor-pointer"
                                  >
                                    Done
                                  </button>
                                  <button
                                    onClick={() => onUpdateEventStatus(evt.id, 'Cancelled')}
                                    className="px-1.5 py-0.5 bg-white border border-slate-200 hover:border-red-300 hover:text-red-700 rounded text-[9px] transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List detailed view */
        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ref / Sheet</th>
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training Subject</th>
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule Details</th>
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendees Status</th>
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">TNA / Refresher</th>
                  <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {events.map(evt => {
                  const crs = courses.find(c => c.id === evt.courseId);
                  const presentCount = evt.attendees.filter(a => a.present).length;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/40">
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900 font-mono">{evt.trgRef}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{evt.sheetNo}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-1.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-mono font-bold leading-none mb-1">
                          {crs?.id || "N/A"}
                        </span>
                        <h4 className="font-bold text-slate-900 truncate max-w-xs">{crs?.name}</h4>
                        <p className="text-[10px] text-slate-400">Trainer: {crs?.trainer}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                          <Clock5 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono pl-5">{evt.time}</p>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800">
                          {evt.status === 'Completed' ? `${presentCount}/${evt.attendees.length} Present` : `${evt.attendees.length} Nominated`}
                        </span>
                        <div className="w-24 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                          <div 
                            className="bg-slate-900 h-1" 
                            style={{ width: `${(evt.status === 'Completed' ? presentCount : evt.attendees.length) / evt.attendees.length * 100}%` }} 
                          />
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap space-x-1">
                        {evt.isTNA && (
                          <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[9px] font-bold">TNA</span>
                        )}
                        {evt.isRefresher && (
                          <span className="inline-block px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-[9px] font-bold">Refresher</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <span className={`inline-block px-2 py-0.5 border text-[10px] rounded-full font-semibold ${getStatusBadge(evt.status)}`}>
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add Training Event / Scheduing Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-mono tracking-wider font-bold text-slate-400 uppercase leading-none">artistic l&d systems</h3>
                <h2 className="text-base font-bold text-slate-900 mt-1">Schedule Training Course (HRM/4/010)</h2>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Course Subject *</label>
                <select
                  value={newEvt.courseId}
                  onChange={e => setNewEvt({ ...newEvt, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                  required
                >
                  {courses.map(crs => (
                    <option key={crs.id} value={crs.id}>
                      {crs.id} - {crs.name} ({crs.frequency})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Scheduled Date *</label>
                  <input
                    type="date"
                    value={newEvt.date}
                    onChange={e => setNewEvt({ ...newEvt, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Class Hours / Timings *</label>
                  <input
                    type="text"
                    value={newEvt.time}
                    onChange={e => setNewEvt({ ...newEvt, time: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">TRG Reference Code *</label>
                  <input
                    type="text"
                    value={newEvt.trgRef}
                    onChange={e => setNewEvt({ ...newEvt, trgRef: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Attendance Sheet Code *</label>
                  <input
                    type="text"
                    value={newEvt.sheetNo}
                    onChange={e => setNewEvt({ ...newEvt, sheetNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newEvt.isTNA}
                    onChange={e => setNewEvt({ ...newEvt, isTNA: e.target.checked })}
                    className="rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>TNA needs-triggered slot</span>
                </label>

                <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newEvt.isRefresher}
                    onChange={e => setNewEvt({ ...newEvt, isRefresher: e.target.checked })}
                    className="rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span>Refresher training</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Select Nominated Trainees *</label>
                <p className="text-[10px] text-slate-400">Mark checkbox to nominate multiple QA inspectors instantly to attendance lists.</p>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2.5 divide-y divide-slate-100 text-xs">
                  {employees.map(emp => {
                    const selected = newEvt.selectedCodes.includes(emp.code);
                    return (
                      <label key={emp.code} className="flex items-center space-x-2 py-1.5 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const updated = selected ? 
                              newEvt.selectedCodes.filter(c => c !== emp.code) : 
                              [...newEvt.selectedCodes, emp.code];
                            setNewEvt({ ...newEvt, selectedCodes: updated });
                          }}
                          className="rounded focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-slate-400">{emp.code}</span>
                        <span className="font-semibold text-slate-800">{emp.name}</span>
                        <span className="text-[10px] text-slate-500">({emp.designation} • {emp.unit})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 active:bg-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Confirm Annual Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
