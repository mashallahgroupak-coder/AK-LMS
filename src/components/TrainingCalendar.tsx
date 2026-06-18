import React, { useState } from 'react';
import { Course, Employee, TrainingEvent } from '../types';
import { Calendar as CalendarIcon, Clock, Plus, Tag, ChevronLeft, ChevronRight, CheckCircle, Clock5, FileSpreadsheet, X, Edit3, Trash2 } from 'lucide-react';

interface TrainingCalendarProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  onAddEvent: (evt: TrainingEvent) => void;
  onEditEvent: (evt: TrainingEvent) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEventStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => void;
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  courses,
  employees,
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onUpdateEventStatus
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TrainingEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'events'>('timeline');

  // Unified form state
  const [formEvt, setFormEvt] = useState({
    courseId: courses[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM - 01:00 PM',
    trgRef: 'TRG/REF-2026/',
    sheetNo: 'HRM/4/009-S',
    isTNA: true,
    isRefresher: false,
    status: 'Scheduled' as 'Scheduled' | 'Completed' | 'Cancelled',
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

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormEvt({
      courseId: courses[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM - 01:00 PM',
      trgRef: `TRG/REF-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      sheetNo: `HRM/4/009-S${Math.floor(10 + Math.random() * 90)}`,
      isTNA: true,
      isRefresher: false,
      status: 'Scheduled',
      selectedCodes: employees.slice(0, 3).map(e => e.code)
    });
    setShowModal(true);
  };

  const handleOpenEdit = (evt: TrainingEvent) => {
    setEditingEvent(evt);
    setFormEvt({
      courseId: evt.courseId,
      date: evt.date,
      time: evt.time,
      trgRef: evt.trgRef,
      sheetNo: evt.sheetNo,
      isTNA: evt.isTNA,
      isRefresher: evt.isRefresher,
      status: evt.status,
      selectedCodes: evt.attendees.map(a => a.employeeCode)
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, ref: string) => {
    if (confirm(`⚠️ Admin Command: Are you sure you want to delete training slot [${ref}] (ID: ${id})? All student feedback & recorded post marks will be purged.`)) {
      onDeleteEvent(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      // Keep existing attendees with their present/times if already compiled
      const originalAttendees = editingEvent.attendees;
      const originalCodes = originalAttendees.map(a => a.employeeCode);

      // Map attendees correctly
      const mergedAttendees = formEvt.selectedCodes.map(code => {
        const found = originalAttendees.find(a => a.employeeCode === code);
        if (found) return found;
        return {
          employeeCode: code,
          reportingTime: '',
          present: false,
          signature: ''
        };
      });

      const updatedEvent: TrainingEvent = {
        ...editingEvent,
        courseId: formEvt.courseId,
        date: formEvt.date,
        time: formEvt.time,
        trgRef: formEvt.trgRef,
        sheetNo: formEvt.sheetNo,
        isTNA: formEvt.isTNA,
        isRefresher: formEvt.isRefresher,
        status: formEvt.status,
        attendees: mergedAttendees
      };

      onEditEvent(updatedEvent);
    } else {
      const eventId = `EVT-${Date.now().toString().slice(-6)}`;
      const attendees = formEvt.selectedCodes.map(code => ({
        employeeCode: code,
        reportingTime: '',
        present: false,
        signature: ''
      }));

      const newEvent: TrainingEvent = {
        id: eventId,
        courseId: formEvt.courseId,
        date: formEvt.date,
        time: formEvt.time,
        trgRef: formEvt.trgRef,
        sheetNo: formEvt.sheetNo,
        isTNA: formEvt.isTNA,
        isRefresher: formEvt.isRefresher,
        status: 'Scheduled',
        attendees: attendees.length > 0 ? attendees : employees.slice(0, 3).map(em => ({
          employeeCode: em.code,
          reportingTime: '',
          present: false,
          signature: ''
        }))
      };

      onAddEvent(newEvent);
    }

    setShowModal(false);
  };

  const getEventsForMonth = (monthKey: string) => {
    return events.filter(evt => evt.date.includes(monthKey));
  };

  const getStatusBadge = (status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    switch (status) {
      case 'Completed': return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case 'Cancelled': return "bg-rose-50 text-rose-800 border-rose-100";
      default: return "bg-sky-50 text-sky-850 border-sky-100";
    }
  };

  return (
    <div className="space-y-6" id="calendar-container">
      {/* Upper header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>Training Schedule & Calendar manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Annual training timeline mapping July to June under ISO Code: HRM/4/010 regulations. Admins can edit & delete slots.</p>
        </div>
        <button
          onClick={handleOpenAdd}
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
            activeTab === 'timeline' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Annual Fiscal Timeline Tracker (July - June)
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'events' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Detailed Scheduled Logs List
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
                        No scheduled logs
                      </div>
                    ) : (
                      monEvents.map(evt => {
                        const crs = courses.find(c => c.id === evt.courseId);
                        return (
                          <div 
                            key={evt.id} 
                            className={`p-3 rounded-xl border text-[11px] space-y-1 relative group transition-all ${
                              evt.status === 'Completed' ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' : 
                              evt.status === 'Cancelled' ? 'bg-rose-50/20 border-rose-100' :
                              'bg-indigo-50/30 border-slate-200 text-slate-900 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex justify-between items-start font-semibold">
                              <span className="font-mono text-[9px] text-slate-400">{crs?.id || "TRG"}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(evt)}
                                  className="p-1 hover:bg-slate-200 text-amber-700 hover:text-amber-800 rounded transition-colors"
                                  title="Edit slot details"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(evt.id, evt.trgRef)}
                                  className="p-1 hover:bg-slate-200 text-rose-600 hover:text-rose-700 rounded transition-colors"
                                  title="Delete slot"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                            
                            <h4 className="font-bold line-clamp-2 leading-tight">
                              {crs?.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-mono flex items-center pt-0.5 pb-1">
                              <Clock className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                              {evt.date.slice(-2)}th • {evt.time}
                            </p>

                            <div className="pt-2 flex justify-between items-center mt-1 border-t border-slate-100/45 text-[10px] font-semibold">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase leading-none ${
                                evt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                                evt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                                'bg-sky-100 text-sky-850'
                              }`}>
                                {evt.status}
                              </span>

                              {evt.status === 'Scheduled' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => onUpdateEventStatus(evt.id, 'Completed')}
                                    className="px-1 py-0.5 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 rounded text-[9px] transition-all cursor-pointer font-bold shrink-0"
                                  >
                                    Done
                                  </button>
                                  <button
                                    onClick={() => onUpdateEventStatus(evt.id, 'Cancelled')}
                                    className="px-1 py-0.5 bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-700 rounded text-[9px] transition-all cursor-pointer font-bold shrink-0"
                                  >
                                    Void
                                  </button>
                                </div>
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
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominees</th>
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trigger</th>
                  <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin action</th>
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
                        <p className="text-[10px] text-slate-405 font-mono">{evt.sheetNo}</p>
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
                            className="bg-slate-950 h-1" 
                            style={{ width: `${(evt.status === 'Completed' ? presentCount : evt.attendees.length) / evt.attendees.length * 100}%` }} 
                          />
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap space-x-1">
                        {evt.isTNA && (
                          <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-805 rounded font-mono text-[9px] font-bold">TNA</span>
                        )}
                        {evt.isRefresher && (
                          <span className="inline-block px-1.5 py-0.5 bg-indigo-100 text-indigo-805 rounded font-mono text-[9px] font-bold">Refresher</span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <span className={`inline-block px-2 py-0.5 border text-[10px] rounded-full font-semibold ${getStatusBadge(evt.status)}`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(evt)}
                            className="p-1 px-2.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 font-bold hover:border-slate-300 text-[10px] flex items-center space-x-1 text-slate-700 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(evt.id, evt.trgRef)}
                            className="p-1 px-2 border border-slate-200 bg-rose-50 rounded-lg hover:bg-rose-100 hover:border-rose-200 text-[10px] flex items-center space-x-1 text-rose-600 font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 shrink-0" />
                            <span>Purge</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Unified Add / Edit Training Event scheduling Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl">
              <div>
                <span className="text-[9px] font-mono tracking-wider font-bold text-amber-400 uppercase leading-none block">AGI DENIM Scheduler Desk</span>
                <h2 className="text-base font-bold mt-1">
                  {editingEvent ? `✏️ Adjust Scheduled Slot [ID: ${editingEvent.id}]` : '📅 Schedule Training Course (HRM/4/010)'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer animate-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-slate-900">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Course Subject *</label>
                <select
                  value={formEvt.courseId}
                  onChange={e => setFormEvt({ ...formEvt, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                  required
                >
                  {courses.map(crs => (
                    <option key={crs.id} value={crs.id}>
                      {crs.id} - {crs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Scheduled Date *</label>
                  <input
                    type="date"
                    value={formEvt.date}
                    onChange={e => setFormEvt({ ...formEvt, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs text-slate-950 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Class Hours / Timings *</label>
                  <input
                    type="text"
                    value={formEvt.time}
                    onChange={e => setFormEvt({ ...formEvt, time: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs text-slate-950 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">TRG Reference Code *</label>
                  <input
                    type="text"
                    value={formEvt.trgRef}
                    onChange={e => setFormEvt({ ...formEvt, trgRef: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs text-slate-950 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Attendance Sheet Code *</label>
                  <input
                    type="text"
                    value={formEvt.sheetNo}
                    onChange={e => setFormEvt({ ...formEvt, sheetNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs text-slate-950 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Audit Status Track *</label>
                  <select
                    value={formEvt.status}
                    onChange={e => setFormEvt({ ...formEvt, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 text-slate-950 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer"
                    required
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1 pt-4 text-xs">
                  <div className="grid grid-rows-2 gap-1 bg-slate-50 p-1.5 rounded border border-slate-150-100">
                    <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formEvt.isTNA}
                        onChange={e => setFormEvt({ ...formEvt, isTNA: e.target.checked })}
                        className="rounded text-slate-900 cursor-pointer"
                      />
                      <span>TNA triggered</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={formEvt.isRefresher}
                        onChange={e => setFormEvt({ ...formEvt, isRefresher: e.target.checked })}
                        className="rounded text-slate-900 cursor-pointer"
                      />
                      <span>Refresher</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Select Nominated Trainees *</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2.5 divide-y divide-slate-100 text-xs">
                  {employees.map(emp => {
                    const selected = formEvt.selectedCodes.includes(emp.code);
                    return (
                      <label key={emp.code} className="flex items-center space-x-2 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-900">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const updated = selected ? 
                              formEvt.selectedCodes.filter(c => c !== emp.code) : 
                              [...formEvt.selectedCodes, emp.code];
                            setFormEvt({ ...formEvt, selectedCodes: updated });
                          }}
                          className="rounded focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-slate-400">{emp.code}</span>
                        <span className="font-semibold text-slate-800">{emp.name}</span>
                        <span className="text-[10px] text-slate-500">({emp.designation} • {emp.department})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 border border-slate-950 text-white hover:bg-slate-850 active:bg-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  {editingEvent ? 'Save Modifications' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
