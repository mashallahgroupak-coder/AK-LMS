import React, { useState } from 'react';
import { Course } from '../types';
import { BookOpen, Search, Plus, SlidersHorizontal, Layers, GraduationCap, Clock, HelpCircle, X, Edit3, Trash2, ExternalLink } from 'lucide-react';

interface TrainingLibraryProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export const TrainingLibrary: React.FC<TrainingLibraryProps> = ({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Unified modal state
  const [formCrs, setFormCrs] = useState({
    id: '',
    name: '',
    trainer: 'Subject Matter Expert',
    department: 'Quality',
    frequency: 'Biannually',
    topicsConcat: '',
    scope: 'Professional/Technical' as any,
    method: 'Lecture/Presentation' as any,
    durationMinutes: 180
  });

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormCrs({
      id: '',
      name: '',
      trainer: 'Subject Matter Expert',
      department: 'Quality',
      frequency: 'Biannually',
      topicsConcat: '',
      scope: 'Professional/Technical',
      method: 'Lecture/Presentation',
      durationMinutes: 180
    });
    setShowModal(true);
  };

  const handleOpenEdit = (crs: Course) => {
    setEditingCourse(crs);
    setFormCrs({
      id: crs.id,
      name: crs.name,
      trainer: crs.trainer,
      department: crs.department,
      frequency: crs.frequency,
      topicsConcat: crs.topics.join(', '),
      scope: crs.scope,
      method: crs.method,
      durationMinutes: crs.durationMinutes || (crs.durationHours * 60)
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`⚠️ Admin Command: Are you sure you want to delete the course "${name}" (ID: ${id})? This is irreversible and will purge associated skill records.`)) {
      onDeleteCourse(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topicsArr = formCrs.topicsConcat.split(',').map(t => t.trim()).filter(t => t !== '');
    const minutes = Number(formCrs.durationMinutes);
    const hours = Number((minutes / 60).toFixed(2));

    if (editingCourse) {
      // Editing existing course
      const updatedCourse: Course = {
        id: editingCourse.id,
        name: formCrs.name,
        trainer: formCrs.trainer,
        department: formCrs.department,
        frequency: formCrs.frequency,
        topics: topicsArr.length > 0 ? topicsArr : ["Overview guidelines", "Standard compliance checklists"],
        scope: formCrs.scope,
        method: formCrs.method,
        durationHours: hours,
        durationMinutes: minutes
      };
      onEditCourse(updatedCourse);
    } else {
      // Adding new course
      const nextNum = courses.length > 0 ? Math.max(...courses.map(c => parseInt(c.id.replace(/[^\d]/g, '')) || 0)) + 1 : 1;
      const courseId = `TRG-${nextNum.toString().padStart(2, '0')}`;
      const newCourse: Course = {
        id: courseId,
        name: formCrs.name,
        trainer: formCrs.trainer,
        department: formCrs.department,
        frequency: formCrs.frequency,
        topics: topicsArr.length > 0 ? topicsArr : ["Overview guidelines", "Standard compliance checklists"],
        scope: formCrs.scope,
        method: formCrs.method,
        durationHours: hours,
        durationMinutes: minutes
      };
      onAddCourse(newCourse);
    }

    setShowModal(false);
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
          <h2 className="text-xl font-bold font-sans text-slate-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>Training Curriculum Syllabus manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Syllabi lists and courses authorized under Artistic Garment Industries. Admins can edit & delete any syllabus.</p>
        </div>
        <button
          onClick={handleOpenAdd}
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
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none cursor-pointer text-slate-800 font-medium"
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
            className="bg-white border border-slate-150 p-5 rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 relative group"
          >
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono px-2 py-0.5 bg-slate-950 text-white rounded text-[9px] font-bold">
                  {crs.id}
                </span>
                
                {/* Admin direct edit controls floating in each card */}
                <div className="flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => handleOpenEdit(crs)}
                    className="p-1.5 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                    title={`Edit ${crs.name}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(crs.id, crs.name)}
                    className="p-1.5 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                    title={`Delete ${crs.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-905 leading-snug">
                  {crs.name}
                </h3>
                <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Trainer: {crs.trainer} • {crs.department}</span>
                </div>
              </div>

              {/* Badges details layout */}
              <div className="flex flex-wrap gap-1">
                <span className="text-[9px] bg-slate-100 text-slate-705 px-2 py-0.5 rounded-full font-semibold font-mono">
                  {crs.scope}
                </span>
                <span className="text-[9px] bg-sky-50 text-sky-850 px-2 py-0.5 rounded-full font-semibold font-mono">
                  {crs.method}
                </span>
                <span className="text-[9px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-semibold font-mono">
                  {crs.frequency}
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

              {/* Linked Google Drive E-Learning Assets */}
              {(crs as any).driveAttachments && (crs as any).driveAttachments.length > 0 && (
                <div className="pt-2.5 mt-2 border-t border-dashed border-slate-105 space-y-1.5">
                  <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1 leading-none">
                    <span>📁</span>
                    <span>Live Learning Material ({ (crs as any).driveAttachments.length } files):</span>
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {(crs as any).driveAttachments.map((att: any) => (
                      <a
                        key={att.fileId}
                        href={att.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between text-[10px] bg-indigo-50/50 hover:bg-slate-100 text-indigo-700 font-bold p-1.5 rounded-lg border border-indigo-100/50 truncate transition-all leading-tight"
                        title={`Click to read ${att.fileName}`}
                      >
                        <span className="truncate pr-1">🗂️ {att.fileName}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <div className="flex flex-col text-slate-500 font-mono text-[11px] space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Duration: {crs.durationMinutes || (crs.durationHours * 60)} mins</span>
                </div>
                <div className="text-[10px] text-slate-400 pl-5">
                  Equivalent to {crs.durationHours} hrs
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-extrabold font-mono uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded leading-none">
                 ✓ Active
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

      {/* MODAL: Unified Add / Edit Course subject */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <span className="text-[9px] font-mono tracking-widest font-bold text-amber-400 uppercase leading-none block">AGI DENIM Admin Desk</span>
                <h2 className="text-base font-bold mt-1">
                  {editingCourse ? `✏️ Modify Course - ${editingCourse.id}` : '➕ Register New Training Curriculum'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 shrink-0" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-755">Curriculum Subject Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Defect Calibration Standard Checklist"
                  value={formCrs.name}
                  onChange={e => setFormCrs({ ...formCrs, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-755">Course Department Target *</label>
                  <input
                    type="text"
                    value={formCrs.department}
                    onChange={e => setFormCrs({ ...formCrs, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-755">Frequency Track *</label>
                  <select
                    value={formCrs.frequency}
                    onChange={e => setFormCrs({ ...formCrs, frequency: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer"
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
                <label className="text-xs font-semibold text-slate-755">Syllabus Outlines (Comma separated values) *</label>
                <textarea
                  rows={2}
                  placeholder="Light box calibration specifications, major vs minor defects classification, light wavelengths..."
                  value={formCrs.topicsConcat}
                  onChange={e => setFormCrs({ ...formCrs, topicsConcat: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-755">Scope Type *</label>
                  <select
                    value={formCrs.scope}
                    onChange={e => setFormCrs({ ...formCrs, scope: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer"
                    required
                  >
                    <option value="Professional/Technical">Professional/Technical</option>
                    <option value="Systems/Sustainability">Systems/Sustainability</option>
                    <option value="Social Compliance">Social Compliance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-755">Instruction Method *</label>
                  <select
                    value={formCrs.method}
                    onChange={e => setFormCrs({ ...formCrs, method: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer"
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
                  <label className="text-xs font-semibold text-slate-755">Course Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="10"
                    max="1440"
                    value={formCrs.durationMinutes}
                    onChange={e => setFormCrs({ ...formCrs, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                  <p className="text-[10px] text-slate-400">
                    Equivalent to {Number((formCrs.durationMinutes / 60).toFixed(2))} hours
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-755">Course Facilitator *</label>
                  <input
                    type="text"
                    value={formCrs.trainer}
                    onChange={e => setFormCrs({ ...formCrs, trainer: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 border border-slate-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow hover:bg-slate-850"
                >
                  {editingCourse ? 'Save Changes' : 'Authorize Syllabus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
