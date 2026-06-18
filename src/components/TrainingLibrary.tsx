import React, { useState } from 'react';
import { Course } from '../types';
import { BookOpen, Search, Plus, SlidersHorizontal, Layers, GraduationCap, Clock, HelpCircle, X } from 'lucide-react';

interface TrainingLibraryProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

export const TrainingLibrary: React.FC<TrainingLibraryProps> = ({
  courses,
  onAddCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New course state
  const [newCrs, setNewCrs] = useState({
    name: '',
    trainer: 'Subject Matter Expert',
    department: 'Quality',
    frequency: 'Biannually',
    topicsConcat: '',
    scope: 'Professional/Technical' as any,
    method: 'Lecture/Presentation' as any,
    durationMinutes: 180
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topicsArr = newCrs.topicsConcat.split(',').map(t => t.trim()).filter(t => t !== '');
    const courseId = `TRG-${(courses.length + 1).toString().padStart(2, '0')}`;
    
    const minutes = Number(newCrs.durationMinutes);
    const hours = Number((minutes / 60).toFixed(2));
    
    const course: Course = {
      id: courseId,
      name: newCrs.name,
      trainer: newCrs.trainer,
      department: newCrs.department,
      frequency: newCrs.frequency,
      topics: topicsArr.length > 0 ? topicsArr : ["Overview guidelines", "Standard compliance checklists"],
      scope: newCrs.scope,
      method: newCrs.method,
      durationHours: hours,
      durationMinutes: minutes
    };

    onAddCourse(course);
    setShowAddModal(false);
    // Reset
    setNewCrs({
      name: '',
      trainer: 'Subject Matter Expert',
      department: 'Quality',
      frequency: 'Biannually',
      topicsConcat: '',
      scope: 'Professional/Technical',
      method: 'Lecture/Presentation',
      durationMinutes: 180
    });
  };

  const filteredCourses = courses.filter(crs => {
    const matchesSearch = crs.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          crs.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod === 'All' || crs.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6" id="training-library-container">
      {/* Upper header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900">Training Library / catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">Syllabi lists and courses authorized under Artistic Garment Industries (AQL/ISO checklist standards).</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-slate-900 border border-slate-950 hover:bg-slate-800 active:bg-slate-950 text-white font-medium rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
          id="btn-add-course"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid Settings & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subjects by index or curriculum keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex space-x-2 shrink-0">
          <select
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none cursor-pointer"
          >
            <option value="All">All Instruction Methods</option>
            <option value="Lecture/Presentation">Lecture/Presentation</option>
            <option value="Practical/Demonstration">Practical/Demonstration</option>
            <option value="Associating with senior">Associating with senior</option>
          </select>
        </div>
      </div>

      {/* Grid List layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="library-curriculum-grid">
        {filteredCourses.map(crs => (
          <div 
            key={crs.id} 
            className="bg-white border border-slate-150 p-5 rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono px-2 py-0.5 bg-slate-950 text-white rounded text-[9px] font-bold">
                  {crs.id}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  {crs.frequency}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 leading-snug hover:text-sky-650 transition-colors">
                  {crs.name}
                </h3>
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Trainer: {crs.trainer} • {crs.department}</span>
                </div>
              </div>

              {/* Badges details layout */}
              <div className="flex flex-wrap gap-1">
                <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold font-mono">
                  {crs.scope}
                </span>
                <span className="text-[9px] bg-sky-50 text-sky-850 px-2 py-0.5 rounded-full font-semibold font-mono">
                  {crs.method}
                </span>
              </div>

              {/* Syllabus points */}
              <div className="pt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Syllabus Outlines:</h4>
                <ul className="space-y-1 text-slate-600 pl-1.5 list-disc list-inside text-xs leading-normal">
                  {crs.topics.map((tp, idx) => (
                    <li key={idx} className="truncate" title={tp}>{tp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 flex justify-between items-center text-xs">
              <div className="flex flex-col text-slate-500 font-mono text-[11px] space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Duration: {crs.durationMinutes || (crs.durationHours * 60)} mins</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-5">
                  Equivalent to {crs.durationHours} hrs
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold font-mono uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded leading-none">
                 Approved
              </span>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            No courses found matching search criteria.
          </div>
        )}
      </div>

      {/* MODAL: Add Course subjects */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-mono tracking-wider font-bold text-slate-400 uppercase leading-none font-sans">Artistic Denim Curriculum</h3>
                <h2 className="text-base font-bold text-slate-900 mt-1">Register New Training Curriculum</h2>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 rounded-lg cursor-pointer animate-none"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Curriculum Subject Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Defect Calibration Standard Checklist"
                  value={newCrs.name}
                  onChange={e => setNewCrs({ ...newCrs, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Course Department Target *</label>
                  <input
                    type="text"
                    value={newCrs.department}
                    onChange={e => setNewCrs({ ...newCrs, department: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Frequency Track *</label>
                  <select
                    value={newCrs.frequency}
                    onChange={e => setNewCrs({ ...newCrs, frequency: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="Biannually">Biannually</option>
                    <option value="Yearly \DOR">Yearly \DOR</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Syllabus Outlines (Comma separated values) *</label>
                <textarea
                  rows={2}
                  placeholder="Light box calibration specifications, major vs minor defects classification, light wavelengths..."
                  value={newCrs.topicsConcat}
                  onChange={e => setNewCrs({ ...newCrs, topicsConcat: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Scope Type *</label>
                  <select
                    value={newCrs.scope}
                    onChange={e => setNewCrs({ ...newCrs, scope: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer"
                    required
                  >
                    <option value="Professional/Technical">Professional/Technical</option>
                    <option value="Systems/Sustainability">Systems/Sustainability</option>
                    <option value="Social Compliance">Social Compliance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Instruction Method *</label>
                  <select
                    value={newCrs.method}
                    onChange={e => setNewCrs({ ...newCrs, method: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer"
                    required
                  >
                    <option value="Lecture/Presentation">Lecture/Presentation</option>
                    <option value="Practical/Demonstration">Practical/Demonstration</option>
                    <option value="Associating with senior">Associating with senior</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Course Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="10"
                    max="1440"
                    value={newCrs.durationMinutes}
                    onChange={e => setNewCrs({ ...newCrs, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                  <p className="text-[10px] text-slate-400">
                    Equivalent to {Number((newCrs.durationMinutes / 60).toFixed(2))} hours
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Course Facilitator *</label>
                  <input
                    type="text"
                    value={newCrs.trainer}
                    onChange={e => setNewCrs({ ...newCrs, trainer: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer animate-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 border border-slate-950 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Authorize Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
