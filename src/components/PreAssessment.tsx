import React, { useState } from 'react';
import { Course, Employee, IndividualPreAssessment, DepartmentalPreAssessment } from '../types';
import { FileText, Plus, CheckCircle, HelpCircle, User, Star, Award, ChevronRight, X } from 'lucide-react';

interface PreAssessmentProps {
  employees: Employee[];
  individualPre: IndividualPreAssessment[];
  departmentalPre: DepartmentalPreAssessment[];
  onAddIndividual: (tna: IndividualPreAssessment) => void;
  onAddDepartmental: (tna: DepartmentalPreAssessment) => void;
  onEvaluateIndividual: (id: string, scores: any, rating: any, evaluator: string, designation: string, date: string) => void;
  onEvaluateDepartmental: (id: string, scores: any, rating: any, evaluator: string, designation: string, date: string) => void;
}

export const PreAssessment: React.FC<PreAssessmentProps> = ({
  employees,
  individualPre,
  departmentalPre,
  onAddIndividual,
  onAddDepartmental,
  onEvaluateIndividual,
  onEvaluateDepartmental
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'individual' | 'departmental'>('individual');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState<{ type: 'individual' | 'departmental'; id: string } | null>(null);

  // New individual TNA state
  const [newInd, setNewInd] = useState({
    employeeCode: employees[0]?.code || '',
    purpose: 'New Employee' as any,
    otherPurposeDetail: '',
    trainingSubject: '',
    topics: ['', '', ''] as string[],
    scope: 'Professional/Technical' as any,
    method: 'Lecture/Presentation' as any,
    assessedByName: 'Sajid Mahmood',
    assessedByDesignation: 'HOD Quality',
    assessedByDate: new Date().toISOString().split('T')[0]
  });

  // New departmental TNA state
  const [newDept, setNewDept] = useState({
    department: 'Quality Assurance',
    purpose: 'Career Planning & Development' as any,
    otherPurposeDetail: '',
    trainingSubject: '',
    scope: 'Professional/Technical' as any,
    method: 'Lecture/Presentation' as any,
    assessedByName: 'Tariq Siddiqui',
    assessedByDesignation: 'QA Manager',
    assessedByDate: new Date().toISOString().split('T')[0]
  });

  // Evaluate scores state
  const [evalScores, setEvalScores] = useState({
    s1: 5,
    s2: 5,
    s3: 5,
    s4: 5,
    s5: 5,
    s6: 5,
    hodRating: 'Excellent' as any,
    evalName: 'Sajid Mahmood',
    evalDesignation: 'HOD Quality',
    evalDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTopics = newInd.topics.filter(t => t.trim() !== '');
    const newTna: IndividualPreAssessment = {
      id: `IND-TNA-${Date.now().toString().slice(-4)}`,
      employeeCode: newInd.employeeCode,
      purpose: newInd.purpose,
      otherPurposeDetail: newInd.purpose === 'Other' ? newInd.otherPurposeDetail : '',
      trainingSubject: newInd.trainingSubject,
      topicsNeedToBeCovered: cleanTopics,
      scope: newInd.scope,
      method: newInd.method,
      externalLearningTransferred: false,
      assessedByName: newInd.assessedByName,
      assessedByDesignation: newInd.assessedByDesignation,
      assessedByDate: newInd.assessedByDate,
      isEvaluated: false
    };
    onAddIndividual(newTna);
    setShowLogModal(false);
    // Reset
    setNewInd({
      employeeCode: employees[0]?.code || '',
      purpose: 'New Employee',
      otherPurposeDetail: '',
      trainingSubject: '',
      topics: ['', '', ''],
      scope: 'Professional/Technical',
      method: 'Lecture/Presentation',
      assessedByName: 'Sajid Mahmood',
      assessedByDesignation: 'HOD Quality',
      assessedByDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateDepartmental = (e: React.FormEvent) => {
    e.preventDefault();
    const newTna: DepartmentalPreAssessment = {
      id: `DEP-TNA-${Date.now().toString().slice(-4)}`,
      department: newDept.department,
      purpose: newDept.purpose,
      otherPurposeDetail: newDept.purpose === 'Other' ? newDept.otherPurposeDetail : '',
      trainingSubject: newDept.trainingSubject,
      scope: newDept.scope,
      method: newDept.method,
      assessedByName: newDept.assessedByName,
      assessedByDesignation: newDept.assessedByDesignation,
      assessedByDate: newDept.assessedByDate,
      isEvaluated: false
    };
    onAddDepartmental(newTna);
    setShowLogModal(false);
    // Reset
    setNewDept({
      department: 'Quality Assurance',
      purpose: 'Career Planning & Development',
      otherPurposeDetail: '',
      trainingSubject: '',
      scope: 'Professional/Technical',
      method: 'Lecture/Presentation',
      assessedByName: 'Tariq Siddiqui',
      assessedByDesignation: 'QA Manager',
      assessedByDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleEvaluateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEvalModal) return;

    const scores = {
      theoreticalImprovement: evalScores.s1,
      performanceImprovement: evalScores.s2,
      metExpectations: evalScores.s3,
      contentUpToMark: evalScores.s4,
      styleEffective: evalScores.s5,
      recommendInFuture: evalScores.s6,
    };

    if (showEvalModal.type === 'individual') {
      onEvaluateIndividual(
        showEvalModal.id,
        scores,
        evalScores.hodRating,
        evalScores.evalName,
        evalScores.evalDesignation,
        evalScores.evalDate
      );
    } else {
      // For departmental, map direct scores
      const deptScores = {
        theoreticalKnowledge: evalScores.s1,
        departmentalPerformance: evalScores.s2,
        metExpectations: evalScores.s3,
        contentUpToMark: evalScores.s4,
        styleEffective: evalScores.s5,
        recommendInFuture: evalScores.s6,
      };
      onEvaluateDepartmental(
        showEvalModal.id,
        deptScores,
        evalScores.hodRating,
        evalScores.evalName,
        evalScores.evalDesignation,
        evalScores.evalDate
      );
    }
    setShowEvalModal(null);
  };

  return (
    <div className="space-y-6" id="preassessment-container">
      {/* Upper bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900">Pre-Assessment Module (TNA)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Dual-mode Training Needs Assessment capturing individual and departmental triggers prior to course schedules.</p>
        </div>
        <button
          onClick={() => {
            setShowLogModal(true);
          }}
          className="px-4 py-2 bg-slate-900 border border-slate-950 hover:bg-slate-800 active:bg-slate-950 text-white font-medium rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
          id="btn-log-tna"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Assess New Need</span>
        </button>
      </div>

      {/* Selector Subtabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('individual')}
          className={`pb-3 px-5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeSubTab === 'individual' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Individual TNA Form (ISO Code: HRM/4/008)
          {activeSubTab === 'individual' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 transition-all rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('departmental')}
          className={`pb-3 px-5 text-sm font-semibold transition-all relative cursor-pointer ${
            activeSubTab === 'departmental' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Departmental TNA Form (HRM/4/08b)
          {activeSubTab === 'departmental' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 transition-all rounded-full" />
          )}
        </button>
      </div>

      {/* Main List */}
      <div className="grid grid-cols-1 gap-4">
        {activeSubTab === 'individual' ? (
          individualPre.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center text-slate-400 text-sm">
              No individual Needs Assessments found. Use the &quot;Assess New Need&quot; button to create one.
            </div>
          ) : (
            individualPre.map(item => {
              const emp = employees.find(e => e.code === item.employeeCode);
              return (
                <div key={item.id} className="bg-white border border-slate-150 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-50">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-mono font-medium text-slate-400 leading-none">
                          REF: {item.id}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-850">
                          {item.purpose}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {item.scope}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{item.trainingSubject}</h3>
                      
                      <div className="flex items-center space-x-2 text-xs text-slate-500 pt-0.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-semibold text-slate-800">{emp?.name || item.employeeCode}</span>
                        <span>•</span>
                        <span>{emp?.designation} ({emp?.unit})</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-stretch md:self-auto justify-end">
                      {item.isEvaluated ? (
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 font-sans">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Effectiveness Verified
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 font-semibold">HOD Rating: {item.evaluationHODRating}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEvalScores(prev => ({ ...prev, evalName: item.assessedByName, evalDesignation: item.assessedByDesignation }));
                            setShowEvalModal({ type: 'individual', id: item.id });
                          }}
                          className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-xs leading-none cursor-pointer"
                        >
                          Verify Effectiveness
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="px-5 py-4 md:px-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Assessed Topics:</h4>
                      <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                        {item.topicsNeedToBeCovered.map((topic, index) => (
                          <li key={index} className="truncate">{topic}</li>
                        ))}
                        {item.topicsNeedToBeCovered.length === 0 && <span className="text-slate-400">Standard course guidelines</span>}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Assessment Info:</h4>
                      <p className="text-slate-700">
                        <strong>Assessed By:</strong> {item.assessedByName} ({item.assessedByDesignation})<br />
                        <strong>Assessed Date:</strong> {item.assessedByDate}<br />
                        <strong>Method:</strong> {item.method}
                      </p>
                    </div>

                    {item.isEvaluated && item.evaluationScores && (
                      <div className="md:border-l border-slate-200 md:pl-4">
                        <h4 className="font-semibold text-emerald-600 uppercase tracking-wider text-[9px] mb-1">Post-Training Scores (1-5):</h4>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700 font-mono">
                          <div>Theoretical: {item.evaluationScores.theoreticalImprovement}/5</div>
                          <div>Performance: {item.evaluationScores.performanceImprovement}/5</div>
                          <div>Met Expectations: {item.evaluationScores.metExpectations}/5</div>
                          <div>Trainer Rating: {item.evaluationScores.styleEffective}/5</div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate">By: {item.evaluatedByName} on {item.evaluatedByDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )
        ) : (
          departmentalPre.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center text-slate-400 text-sm">
              No departmental Needs Assessments found. Use the &quot;Assess New Need&quot; button to create one.
            </div>
          ) : (
            departmentalPre.map(item => (
              <div key={item.id} className="bg-white border border-slate-150 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-mono font-medium text-slate-400 leading-none">
                        REF: {item.id}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-850">
                        {item.purpose}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                        {item.scope}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{item.trainingSubject}</h3>
                    <p className="text-xs text-slate-500 font-semibold pt-0.5">Department: {item.department}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-stretch md:self-auto justify-end">
                    {item.isEvaluated ? (
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 font-sans">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Effectiveness Verified
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 font-semibold">HOD Rating: {item.evaluationHODRating}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEvalScores(prev => ({ ...prev, evalName: item.assessedByName, evalDesignation: item.assessedByDesignation }));
                          setShowEvalModal({ type: 'departmental', id: item.id });
                        }}
                        className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-xs leading-none cursor-pointer"
                      >
                        Verify Effectiveness
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="px-5 py-4 md:px-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Departmental Assessment Info:</h4>
                    <p className="text-slate-700 font-sans">
                      <strong>Assessed By:</strong> {item.assessedByName} ({item.assessedByDesignation})<br />
                      <strong>Assessed Date:</strong> {item.assessedByDate}<br />
                      <strong>Training Scope:</strong> {item.scope}<br />
                      <strong>Method:</strong> {item.method}
                    </p>
                  </div>

                  {item.isEvaluated && item.evaluationScores && (
                    <div className="md:border-l border-slate-200 md:pl-4">
                      <h4 className="font-semibold text-emerald-600 uppercase tracking-wider text-[9px] mb-1">Post-Training Scores (1-5):</h4>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-700 font-mono">
                        <div>Theoretical Knowledge: {item.evaluationScores.theoreticalKnowledge}/5</div>
                        <div>Dept Performance: {item.evaluationScores.departmentalPerformance}/5</div>
                        <div>Met Expectations: {item.evaluationScores.metExpectations}/5</div>
                        <div>Trainer Delivery: {item.evaluationScores.styleEffective}/5</div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold truncate">By: {item.evaluatedByName} on {item.evaluatedByDate}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* MODAL: Log New Pre-Assessment */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-mono tracking-wider font-bold text-slate-400 uppercase leading-none">artistic l&d systems</h3>
                <h2 className="text-base font-bold text-slate-900 mt-1">Log Pre-Assessment Needs (TNA)</h2>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch modal layout based on active tabs */}
            <div className="flex border-b border-slate-100 text-xs px-5">
              <button
                type="button"
                onClick={() => setActiveSubTab('individual')}
                className={`py-3.5 px-3 font-semibold relative cursor-pointer ${activeSubTab === 'individual' ? 'text-slate-900' : 'text-slate-400'}`}
              >
                Individual Needs (HRM/4/008)
                {activeSubTab === 'individual' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('departmental')}
                className={`py-3.5 px-3 font-semibold relative cursor-pointer ${activeSubTab === 'departmental' ? 'text-slate-900' : 'text-slate-400'}`}
              >
                Departmental Needs (HRM/4/08b)
                {activeSubTab === 'departmental' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />}
              </button>
            </div>

            <form onSubmit={activeSubTab === 'individual' ? handleCreateIndividual : handleCreateDepartmental} className="p-5 overflow-y-auto space-y-4">
              {activeSubTab === 'individual' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Select Employee Code *</label>
                      <select
                        value={newInd.employeeCode}
                        onChange={e => setNewInd({ ...newInd, employeeCode: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      >
                        {employees.map(emp => (
                          <option key={emp.code} value={emp.code}>
                            {emp.code} - {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">TNA Purpose Trigger *</label>
                      <select
                        value={newInd.purpose}
                        onChange={e => setNewInd({ ...newInd, purpose: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      >
                        <option value="New Employee">New Employee</option>
                        <option value="Career Planning & development">Career Planning & development</option>
                        <option value="Induction of new machinery / method / system">Induction of machinery/system</option>
                        <option value="Audit / frequent Non-conformity">Audit/Non-conformity</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {newInd.purpose === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Specify Other Purpose Details *</label>
                      <input
                        type="text"
                        value={newInd.otherPurposeDetail}
                        onChange={e => setNewInd({ ...newInd, otherPurposeDetail: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Training Subject / Course Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ring Yarn Grading, Indigo Shade Calibration"
                      value={newInd.trainingSubject}
                      onChange={e => setNewInd({ ...newInd, trainingSubject: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Core Topics to Cover (Up to 3 topics) *</label>
                    <div className="space-y-1.5">
                      {newInd.topics.map((t, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={`Topic ${i + 1}`}
                          value={t}
                          onChange={e => {
                            const updated = [...newInd.topics];
                            updated[i] = e.target.value;
                            setNewInd({ ...newInd, topics: updated });
                          }}
                          className="w-full px-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                          required={i === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Scope of Training *</label>
                      <select
                        value={newInd.scope}
                        onChange={e => setNewInd({ ...newInd, scope: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      >
                        <option value="Professional/Technical">Professional/Technical</option>
                        <option value="Systems/Sustainability">Systems/Sustainability</option>
                        <option value="Social Compliance">Social Compliance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Training Method *</label>
                      <select
                        value={newInd.method}
                        onChange={e => setNewInd({ ...newInd, method: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
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
                      <label className="text-xs font-semibold text-slate-700">Assessed By (Name) *</label>
                      <input
                        type="text"
                        value={newInd.assessedByName}
                        onChange={e => setNewInd({ ...newInd, assessedByName: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Assessed Date *</label>
                      <input
                        type="date"
                        value={newInd.assessedByDate}
                        onChange={e => setNewInd({ ...newInd, assessedByDate: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Select Department *</label>
                      <select
                        value={newDept.department}
                        onChange={e => setNewDept({ ...newDept, department: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      >
                        <option value="Quality Assurance">Quality Assurance</option>
                        <option value="QA Testing Lab">QA Testing Lab</option>
                        <option value="Dyeing Lab">Dyeing Lab</option>
                        <option value="Finishing Quality">Finishing Quality</option>
                        <option value="Denim Weaving">Denim Weaving</option>
                        <option value="Dyeing">Dyeing</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">TNA Purpose Trigger *</label>
                      <select
                        value={newDept.purpose}
                        onChange={e => setNewDept({ ...newDept, purpose: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      >
                        <option value="Career Planning & Development">Career Planning & Development</option>
                        <option value="Induction of New Machinery / Method / System">Induction of machinery/method</option>
                        <option value="Audit / Frequent Non-Conformity">Audit / Frequent Non-Conformity</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {newDept.purpose === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Specify Other Purpose Details *</label>
                      <input
                        type="text"
                        value={newDept.otherPurposeDetail}
                        onChange={e => setNewDept({ ...newDept, otherPurposeDetail: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Training Subject / Course Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Corrective Action & Root Cause Analysis (CAPA)"
                      value={newDept.trainingSubject}
                      onChange={e => setNewDept({ ...newDept, trainingSubject: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Scope of Training *</label>
                      <select
                        value={newDept.scope}
                        onChange={e => setNewDept({ ...newDept, scope: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                        required
                      >
                        <option value="Professional/Technical">Professional/Technical</option>
                        <option value="Systems/Sustainability">Systems/Sustainability</option>
                        <option value="Social Compliance">Social Compliance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Training Method *</label>
                      <select
                        value={newDept.method}
                        onChange={e => setNewDept({ ...newDept, method: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
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
                      <label className="text-xs font-semibold text-slate-700">Assessed By (Name) *</label>
                      <input
                        type="text"
                        value={newDept.assessedByName}
                        onChange={e => setNewDept({ ...newDept, assessedByName: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Assessed Date *</label>
                      <input
                        type="date"
                        value={newDept.assessedByDate}
                        onChange={e => setNewDept({ ...newDept, assessedByDate: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 active:bg-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Save Assessment Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Post-Training Effectiveness Evaluation */}
      {showEvalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50 rounded-t-2xl">
              <div>
                <h3 className="text-sm font-mono tracking-wider font-bold text-emerald-700 uppercase leading-none">effectiveness check • hrm/4/008</h3>
                <h2 className="text-base font-bold text-slate-900 mt-1">HOD Post-Training Evaluation</h2>
              </div>
              <button 
                onClick={() => setShowEvalModal(null)}
                className="p-1 hover:bg-slate-200 text-slate-400 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5 animate-none shrink-0" />
              </button>
            </div>

            <form onSubmit={handleEvaluateSubmit} className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-500 bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-medium">
                Please assess the trainee(s) based on the scale of <strong>1 to 5</strong> where 1 is Poor and 5 is Excellent as detailed on the physical ISO Quality sheet.
              </p>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">a. Trainee shown improvement in theoretical knowledge?</span>
                  <select 
                    value={evalScores.s1} 
                    onChange={e => setEvalScores({...evalScores, s1: Number(e.target.value)})}
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-xs w-16"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">b. Trainee&apos;s performance improved after training?</span>
                  <select 
                    value={evalScores.s2} 
                    onChange={e => setEvalScores({...evalScores, s2: Number(e.target.value)})}
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-xs w-16"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">c. Has the course met standard expectations?</span>
                  <select 
                    value={evalScores.s3} 
                    onChange={e => setEvalScores({...evalScores, s3: Number(e.target.value)})}
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-xs w-16"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">d. Was training content robust and up to mark?</span>
                  <select 
                    value={evalScores.s4} 
                    onChange={e => setEvalScores({...evalScores, s4: Number(e.target.value)})}
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-xs w-16"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">e. Training delivery mode and trainer style effective?</span>
                  <select 
                    value={evalScores.s5} 
                    onChange={e => setEvalScores({...evalScores, s5: Number(e.target.value)})}
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-xs w-16"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 font-semibold">f. Will you recommend repeating this training?</span>
                  <select 
                    value={evalScores.s6} 
                    onChange={e => setEvalScores({...evalScores, s6: Number(e.target.value)})}
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-xs w-16"
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">HOD Compliance Rating *</label>
                    <select
                      value={evalScores.hodRating}
                      onChange={e => setEvalScores({ ...evalScores, hodRating: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      required
                    >
                      <option value="Excellent">Excellent (Above 85%)</option>
                      <option value="Good">Good (66% - 85%)</option>
                      <option value="Satisfactory">Satisfactory (50% - 65%)</option>
                      <option value="Unsatisfactory">Unsatisfactory (Below 50%)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Evaluated By (HOD Name) *</label>
                    <input
                      type="text"
                      value={evalScores.evalName}
                      onChange={e => setEvalScores({ ...evalScores, evalName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">HOD Designation *</label>
                    <input
                      type="text"
                      value={evalScores.evalDesignation}
                      onChange={e => setEvalScores({ ...evalScores, evalDesignation: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Evaluation Date *</label>
                    <input
                      type="date"
                      value={evalScores.evalDate}
                      onChange={e => setEvalScores({ ...evalScores, evalDate: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(null)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Confirm Compliance Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
