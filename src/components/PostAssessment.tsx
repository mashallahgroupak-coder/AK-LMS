import React, { useState, useEffect } from 'react';
import { Course, Employee, TrainingEvent, PostAssessmentFeedback, PostAssessmentMark, MCQQuestion } from '../types';
import { Award, Star, List, PenTool, CheckCircle, BrainCircuit, UserCheck, Scroll, Save, SmilePlus, Plus, BookOpen, Clock, ArrowRight, ArrowLeft, AlertCircle, Check, X, Edit3, Trash2 } from 'lucide-react';

interface PostAssessmentProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  feedbacks: PostAssessmentFeedback[];
  postMarks: PostAssessmentMark[];
  questions: MCQQuestion[];
  onAddFeedback: (fb: PostAssessmentFeedback) => void;
  onSaveMarks: (eventId: string, marks: { employeeCode: string; obtainedMarks: number; totalMarks: number }[]) => void;
  onSaveQuestion: (question: MCQQuestion) => void;
  onDeleteQuestion: (id: string) => void;
}

export const PostAssessment: React.FC<PostAssessmentProps> = ({
  courses,
  employees,
  events,
  feedbacks,
  postMarks,
  questions,
  onAddFeedback,
  onSaveMarks,
  onSaveQuestion,
  onDeleteQuestion
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'grades' | 'feedback' | 'log-feedback' | 'mcq' | 'mcq-admin'>('grades');
  const [selectedEventId, setSelectedEventId] = useState(events.filter(e => e.status === 'Completed')[0]?.id || events[0]?.id || '');

  const activeEvent = events.find(e => e.id === selectedEventId);
  const activeCourse = activeEvent ? courses.find(c => c.id === activeEvent.courseId) : null;
  const activeAttendees = activeEvent ? activeEvent.attendees.filter(a => a.present) : [];

  // Local state for grading paper inputs
  const [draftMarks, setDraftMarks] = useState<{ [code: string]: number }>({});

  // Local state for recording worker paper feedback
  const [newFb, setNewFb] = useState({
    employeeCode: employees[0]?.code || '',
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5,
    coveredBest: '',
    needsImprovement: '',
    moreEffectiveBy: '',
    applicationPlan: '',
    shouldRepeat: true,
    repeatFrequency: 'Biannually',
    additionalTrainingHelpful: '',
    generalSuggestions: ''
  });

  // MCQ Interactive States
  const [activeQuizEmployee, setActiveQuizEmployee] = useState<string>('');
  const [quizInProgress, setQuizInProgress] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(600); // countdown

  // MCQ Admin States
  const [editingQuestion, setEditingQuestion] = useState<MCQQuestion | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [formQ, setFormQ] = useState({
    courseId: 'default',
    question: '',
    questionUrdu: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctAnswerIdx: 0
  });

  // Simulated countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (quizInProgress && !quizCompleted) {
      interval = setInterval(() => {
        setQuizTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizInProgress, quizCompleted]);

  // Load existing grades if present when selected event changes
  useEffect(() => {
    if (selectedEventId) {
      const existing = postMarks.filter(m => m.trainingEventId === selectedEventId);
      const times: { [code: string]: number } = {};
      existing.forEach(e => {
        times[e.employeeCode] = e.obtainedMarks;
      });
      setDraftMarks(times);
    }
  }, [selectedEventId, postMarks]);

  const handleGradeChange = (code: string, val: number) => {
    setDraftMarks(prev => ({ ...prev, [code]: val }));
  };

  const getRatingLabel = (percent: number) => {
    if (percent < 50) return { label: 'Unsatisfactory', color: 'text-rose-700 bg-rose-50 border-rose-100' };
    if (percent <= 65) return { label: 'Satisfactory', color: 'text-orange-800 bg-orange-50 border-orange-150' };
    if (percent <= 85) return { label: 'Good', color: 'text-indigo-805 bg-indigo-50 border-indigo-150' };
    return { label: 'Excellent', color: 'text-emerald-700 bg-emerald-50 border-emerald-150' };
  };

  const handleSaveGradesSubmit = () => {
    const list = activeAttendees.map(att => ({
      employeeCode: att.employeeCode,
      obtainedMarks: Number(draftMarks[att.employeeCode] !== undefined ? draftMarks[att.employeeCode] : 80),
      totalMarks: 100
    }));

    onSaveMarks(selectedEventId, list);
    alert(`Grades for training program ${activeEvent?.trgRef} recorded successfully!`);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fb: PostAssessmentFeedback = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      trainingEventId: selectedEventId,
      employeeCode: newFb.employeeCode,
      scores: {
        topicAdequacy: newFb.q1,
        trainingAids: newFb.q2,
        trainerKnowledge: newFb.q3,
        trainerAudibility: newFb.q4,
        materialUsefulness: newFb.q5,
        traineeParticipation: newFb.q6,
        workshopLength: newFb.q7,
        locationConvenience: newFb.q8,
        overallAssessment: newFb.q9
      },
      coveredBest: newFb.coveredBest,
      needsImprovement: newFb.needsImprovement,
      moreEffectiveBy: newFb.moreEffectiveBy,
      applicationPlan: newFb.applicationPlan,
      shouldRepeat: newFb.shouldRepeat,
      repeatFrequency: newFb.repeatFrequency,
      additionalTrainingHelpful: newFb.additionalTrainingHelpful,
      generalSuggestions: newFb.generalSuggestions,
      submittedAt: new Date().toISOString()
    };

    onAddFeedback(fb);
    alert("Trainee feedback form submitted successfully!");
    setActiveSubTab('feedback');
    // Reset
    setNewFb({
      employeeCode: employees[0]?.code || '',
      q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5,
      coveredBest: '',
      needsImprovement: '',
      moreEffectiveBy: '',
      applicationPlan: '',
      shouldRepeat: true,
      repeatFrequency: 'Biannually',
      additionalTrainingHelpful: '',
      generalSuggestions: ''
    });
  };

  // MCQ Admin submission handler
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setFormQ({
      courseId: activeCourse?.id || 'default',
      question: '',
      questionUrdu: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctAnswerIdx: 0
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: MCQQuestion) => {
    setEditingQuestion(q);
    setFormQ({
      courseId: q.courseId,
      question: q.question,
      questionUrdu: q.questionUrdu || '',
      optA: q.options[0] || '',
      optB: q.options[1] || '',
      optC: q.options[2] || '',
      optD: q.options[3] || '',
      correctAnswerIdx: q.correctAnswerIdx
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = [formQ.optA.trim(), formQ.optB.trim(), formQ.optC.trim(), formQ.optD.trim()].filter(o => o !== '');
    if (options.length < 2) {
      alert("Please provide at least two valid options for this MCQ!");
      return;
    }

    const qId = editingQuestion ? editingQuestion.id : `Q-${Date.now().toString().slice(-6)}`;
    const freshQ: MCQQuestion = {
      id: qId,
      courseId: formQ.courseId,
      question: formQ.question,
      questionUrdu: formQ.questionUrdu || undefined,
      options,
      correctAnswerIdx: Number(formQ.correctAnswerIdx)
    };

    onSaveQuestion(freshQ);
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (id: string, text: string) => {
    if (confirm(`⚠️ Admin action: Are you sure you want to delete this question?\n"${text.slice(0, 60)}..."`)) {
      onDeleteQuestion(id);
    }
  };

  // Get active quiz questions from Firestore prop list
  const getQuizQuestions = () => {
    // Filter questions matching course, fallback to general/default MCQ questions
    const match = questions.filter(q => q.courseId === (activeCourse?.id || ''));
    if (match.length > 0) return match;
    return questions.filter(q => q.courseId === 'default' || !q.courseId);
  };

  // Compute stats for current grades sheet
  let totalObtained = 0;
  let totalPossible = 0;
  activeAttendees.forEach(att => {
    totalObtained += Number(draftMarks[att.employeeCode] || 0);
    totalPossible += 100;
  });
  const avgPercent = totalPossible > 0 ? (totalObtained / totalPossible * 100) : 0;
  const departmentalRatingObj = getRatingLabel(avgPercent);

  // Filter feedbacks belonging to selected course/event
  const filteredFeedbacks = feedbacks.filter(f => f.trainingEventId === selectedEventId);

  return (
    <div className="space-y-6" id="postassessment-container">
      {/* Upper bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900">Post-Assessment & Feedback Modules</h2>
          <p className="text-xs text-slate-500 mt-0.5">Dual assessments capturing Employee Assessment Scores (HRM/4/008d) and Training Feedback (HRM/4/008b).</p>
        </div>

        <div className="flex space-x-2 shrink-0">
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white font-medium rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
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
        </div>
      </div>

      {/* Sub tabs line */}
      <div className="flex border-b border-slate-200 text-sm flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab('grades')}
          className={`pb-3 px-4 font-semibold transition-all relative cursor-pointer ${
            activeSubTab === 'grades' ? 'text-slate-900 border-b-2 border-slate-950' : 'text-slate-400'
          }`}
        >
          Assessment Scores (HRM/4/008d)
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`pb-3 px-4 font-semibold transition-all relative cursor-pointer ${
            activeSubTab === 'feedback' ? 'text-slate-900 border-b-2 border-slate-950' : 'text-slate-400'
          }`}
        >
          Feedback Reviews (HRM/4/008b)
        </button>

        <button
          onClick={() => setActiveSubTab('log-feedback')}
          className={`pb-3 px-4 font-semibold text-sky-600 transition-all relative cursor-pointer ${
            activeSubTab === 'log-feedback' ? 'text-sky-900 border-b-2 border-sky-600' : 'text-slate-400 hover:text-sky-500'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <SmilePlus className="w-4 h-4 shrink-0" />
            Record Feedback Paper
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('mcq')}
          className={`pb-3 px-4 font-semibold text-emerald-600 transition-all relative cursor-pointer ${
            activeSubTab === 'mcq' ? 'text-emerald-900 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-emerald-500'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 shrink-0" />
            Online MCQ Exam Room
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('mcq-admin')}
          className={`pb-3 px-4 font-semibold text-amber-700 transition-all relative cursor-pointer ${
            activeSubTab === 'mcq-admin' ? 'text-amber-900 border-b-2 border-amber-600' : 'text-slate-400 hover:text-amber-600'
          }`}
        >
          <span className="flex items-center gap-1.5 font-bold animate-pulse">
            <span>🛡️</span>
            MCQ Admin Desk
          </span>
        </button>
      </div>

      {/* RENDER DYNAMIC MODULES */}
      {activeSubTab === 'grades' && (
        activeAttendees.length === 0 ? (
          <div className="bg-white rounded-2xl p-11 text-center border border-slate-100 text-slate-400 text-xs">
            No employees marked present for this event yet. Mark attendance and save sheet in the Attendance tab first.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border-2 border-slate-950 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase">Training Assessment Scores</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">ISO Standards Code: <strong>HRM/4/008(d)</strong></p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-500">Scheduled Date: <strong>{activeEvent?.date}</strong></p>
                  <p className="text-slate-500 mt-0.5">Event Ref: <strong className="font-mono">{activeEvent?.trgRef}</strong></p>
                </div>
              </div>

              {/* Assessment table */}
              <div className="border border-slate-400 rounded-xl overflow-hidden text-xs">
                <table className="min-w-full divide-y divide-slate-400">
                  <thead className="bg-slate-50">
                    <tr className="divide-x divide-slate-405">
                      <th className="p-3 text-center font-bold text-slate-900 w-12">S#</th>
                      <th className="p-3 text-left font-bold text-slate-900 w-28">Employee Code</th>
                      <th className="p-3 text-left font-bold text-slate-900">Name of Trainee</th>
                      <th className="p-3 text-left font-bold text-slate-900 w-36">Designation</th>
                      <th className="p-3 text-center font-bold text-slate-900 w-28">Obtained Marks</th>
                      <th className="p-3 text-center font-bold text-slate-900 w-24">Total Marks</th>
                      <th className="p-3 text-center font-bold text-slate-900 w-24">Percentage</th>
                      <th className="p-3 text-center font-bold text-slate-900 w-32">Rating</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 bg-white">
                    {activeAttendees.map((att, idx) => {
                      const emp = employees.find(e => e.code === att.employeeCode);
                      if (!emp) return null;

                      const marks = draftMarks[att.employeeCode] !== undefined ? draftMarks[att.employeeCode] : 0;
                      const percent = Math.min((marks / 100) * 100, 100);
                      const rObj = getRatingLabel(percent);

                      return (
                        <tr key={att.employeeCode} className="divide-x divide-slate-200">
                          <td className="p-3 text-center font-mono font-medium text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{emp.code}</td>
                          <td className="p-3 font-black text-slate-950">{emp.name}</td>
                          <td className="p-3 text-slate-600">{emp.designation}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={marks}
                              onChange={e => handleGradeChange(att.employeeCode, Number(e.target.value))}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded font-mono text-center bg-transparent text-xs font-bold"
                            />
                          </td>
                          <td className="p-3 text-center font-mono text-slate-505">100</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">{percent}%</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] border ${rObj.color}`}>
                              {rObj.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Department Aggregations */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Compliance & Benchmark Rating Rules</h4>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <div>&gt; 85%: Excellent Certificate</div>
                    <div>66% – 85%: Good Standing</div>
                    <div>50% – 65%: Satisfactory Pass</div>
                    <div>Below 50%: Unsatisfactory Fail</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2.5">
                  <h4 className="font-bold text-slate-900">Overall Department Results</h4>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Average Department Percentage:</span>
                    <span className="font-mono font-bold text-slate-900">{avgPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Rating Index:</span>
                    <span className={`font-bold font-mono uppercase text-[10px] px-2.5 py-0.5 border rounded-full ${departmentalRatingObj.color}`}>
                      {departmentalRatingObj.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks and Save */}
              <div className="pt-3 flex flex-col sm:flex-row justify-between items-center bg-slate-50 border p-4 rounded-xl text-xs gap-4 font-mono">
                <span className="text-slate-500">Verify assessment scores before recording into the database catalog.</span>
                <button
                  onClick={handleSaveGradesSubmit}
                  className="px-5 py-2.5 bg-slate-950 text-white font-bold rounded-xl flex items-center space-x-2 border border-slate-950 hover:bg-slate-850 transition-all cursor-pointer shadow"
                >
                  <Save className="w-4 h-4 text-white hover:text-white" />
                  <span>Save Grades sheet</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {activeSubTab === 'feedback' && (
        filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400 text-xs space-y-2">
            <div>No feedback surveys submitted yet for this completed event.</div>
            <button 
              onClick={() => setActiveSubTab('log-feedback')}
              className="px-3.5 py-1.5 bg-sky-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center mx-auto space-x-1 cursor-pointer"
            >
              <SmilePlus className="w-4 h-4 text-slate-950 animate-bounce" />
              <span>Record feedback survey now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="feedback-grid-display">
            {filteredFeedbacks.map(f => {
              const emp = employees.find(e => e.code === f.employeeCode);
              const vals = Object.values(f.scores) as number[];
              const sum = vals.reduce((a, b) => a + b, 0);
              const avg = (sum / Object.keys(f.scores).length).toFixed(1);

              return (
                <div key={f.id} className="bg-white border border-slate-150 p-5 rounded-2xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="truncate">
                        <h4 className="font-bold text-slate-900 truncate leading-none mb-1">{emp?.name || f.employeeCode}</h4>
                        <p className="text-[10px] text-slate-405 font-mono leading-none">ID: {f.id} • {emp?.designation} ({emp?.unit})</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 bg-sky-50 text-sky-850 rounded font-mono font-bold text-xs">
                          <Star className="w-3.5 h-3.5 mr-1 fill-sky-400 stroke-sky-500" />
                          {avg}/5.0
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs leading-relaxed text-slate-700">
                      <div>
                        <strong className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-0.5">Which area was covered best?</strong>
                        <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">&ldquo;{f.coveredBest || "N/A"}&rdquo;</p>
                      </div>

                      {f.needsImprovement && (
                        <div>
                          <strong className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-0.5">Areas demanding improvement:</strong>
                          <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">&ldquo;{f.needsImprovement}&rdquo;</p>
                        </div>
                      )}

                      {f.applicationPlan && (
                        <div>
                          <strong className="text-[10px] text-sky-600 uppercase tracking-widest block font-bold mb-0.5">Trainee Application Plan on Floor:</strong>
                          <p className="bg-sky-50/40 p-2.5 rounded-xl border border-sky-100/60 italic">&ldquo;{f.applicationPlan}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t text-[10px] text-slate-400 font-mono flex justify-between items-center uppercase font-bold">
                    <span>Submitted: {f.submittedAt.slice(0, 10)}</span>
                    <span className="text-emerald-600 font-semibold">{f.shouldRepeat ? `Repeats: ${f.repeatFrequency}` : "Repeat: No"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {activeSubTab === 'log-feedback' && (
        <div className="bg-white border border-slate-150 rounded-2xl max-w-2xl mx-auto shadow-m overflow-hidden shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
          <div className="p-5 border-b bg-sky-50/50 flex items-center space-x-2">
            <SmilePlus className="w-5 h-5 text-sky-700" />
            <div>
              <h3 className="font-bold text-slate-900 font-sans">Submit Paper Survey details (HRM/4/008b)</h3>
              <p className="text-xs text-slate-500">Mirror responses from physical feedback paper sheets handovers.</p>
            </div>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5 text-sm text-slate-900 bg-white">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705">Selecting Employee / Trainee *</label>
                <select
                  value={newFb.employeeCode}
                  onChange={e => setNewFb({ ...newFb, employeeCode: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none bg-white text-slate-900"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.code} value={emp.code}>
                      {emp.code} - {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <p className="text-[10px] text-slate-400 leading-snug">Feedback applies to currently selected course: <strong>{activeCourse?.name || "Program"}</strong></p>
              </div>
            </div>

            {/* Score grids */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Statements Assessments (1-5) where 5 is Strongly Agree, 1 is Strongly Disagree</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 text-xs text-slate-755 bg-slate-50 p-4 rounded-xl border">
                <div className="flex justify-between items-center">
                  <span>1. Course topic covered adequately?</span>
                  <select value={newFb.q1} onChange={e => setNewFb({...newFb, q1: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>2. Core learning aids were available?</span>
                  <select value={newFb.q2} onChange={e => setNewFb({...newFb, q2: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>3. Master trainer was knowledgeable?</span>
                  <select value={newFb.q3} onChange={e => setNewFb({...newFb, q3: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>4. Auditor/Trainer audibility good?</span>
                  <select value={newFb.q4} onChange={e => setNewFb({...newFb, q4: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>5. Presented syllabus useful for tasks?</span>
                  <select value={newFb.q5} onChange={e => setNewFb({...newFb, q5: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>6. Employee participation active?</span>
                  <select value={newFb.q6} onChange={e => setNewFb({...newFb, q6: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>7. Workshop length satisfactory?</span>
                  <select value={newFb.q7} onChange={e => setNewFb({...newFb, q7: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>8. Location setup/seating comfortable?</span>
                  <select value={newFb.q8} onChange={e => setNewFb({...newFb, q8: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white text-slate-900 font-mono font-bold">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center col-span-full border-t border-slate-200 border-dashed pt-2.5 mt-1.5">
                  <span className="font-extrabold text-slate-900">9. Overall Assessment score:</span>
                  <select value={newFb.q9} onChange={e => setNewFb({...newFb, q9: Number(e.target.value)})} className="px-3 py-1 border border-slate-350 font-black font-mono text-xs rounded bg-white text-slate-950">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Narratives */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Narrative open reviews</h4>
              
              <div className="space-y-3 text-xs bg-white">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Which area of training workshop was covered best?</label>
                  <input
                    type="text"
                    value={newFb.coveredBest}
                    onChange={e => setNewFb({ ...newFb, coveredBest: e.target.value })}
                    placeholder="e.g. Color calibration standards in American retail specs"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Which areas need improvement?</label>
                  <input
                    type="text"
                    value={newFb.needsImprovement}
                    onChange={e => setNewFb({ ...newFb, needsImprovement: e.target.value })}
                    placeholder="e.g. Add more fabric samples showing shade-guides"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">How do you plan to apply benefits on floor tasks?</label>
                  <textarea
                    rows={2}
                    value={newFb.applicationPlan}
                    onChange={e => setNewFb({ ...newFb, applicationPlan: e.target.value })}
                    placeholder="I will angle standard fabric panels at exactly 45 degrees inside our conditioning box."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('feedback')}
                className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-slate-950 hover:bg-slate-850 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 text-white hover:text-white" />
                <span>Submit Feedback Check</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === 'mcq' && (
        <div className="max-w-4xl mx-auto space-y-6" id="digital-mcq-exam-section">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">AGI Denim - Modern Post-Training Assessment</h3>
              </div>
              <p className="text-xs text-slate-300">
                Online testing room for Course: <strong className="text-emerald-400 font-semibold">{activeCourse?.name || "General Course"} ({activeCourse?.id || "GEN"})</strong>. Dual Urdu & English display for floor level inspectors.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs shrink-0 font-mono text-emerald-305 font-bold">
              Scheduled Event: <span className="text-emerald-450">{activeEvent?.trgRef || "Any"}</span>
            </div>
          </div>

          {!quizInProgress ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Shift Attendees Eligibility & Examination Status</h4>
              
              {activeAttendees.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No attendees marked present for this event. Record and save daily attendance sheet first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeAttendees.map(att => {
                    const emp = employees.find(e => e.code === att.employeeCode);
                    if (!emp) return null;

                    const mark = postMarks.find(m => m.trainingEventId === selectedEventId && m.employeeCode === emp.code);
                    const isPassed = mark && mark.obtainedMarks >= 50;

                    return (
                      <div key={emp.code} className="border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50/50 transition-all bg-white relative">
                        <div className="space-y-1 truncate pr-2">
                          <p className="font-bold text-slate-950 truncate">{emp.name}</p>
                          <p className="text-[10px] text-slate-450">{emp.designation} • <span className="font-mono font-bold text-blue-600">{emp.code}</span></p>
                          
                          {mark ? (
                            <div className="flex items-center space-x-1 mt-1">
                              <span className={`inline-block text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${
                                isPassed ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
                              }`}>
                                Score: {mark.obtainedMarks}% ({isPassed ? 'Passed' : 'Failed'})
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block text-[9px] font-medium font-sans px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100 mt-1">
                              ⏳ Pending Examination
                            </span>
                          )}
                        </div>

                        <div className="shrink-0 ml-1">
                          <button
                            onClick={() => {
                              const quizQuestions = getQuizQuestions();
                              if (quizQuestions.length === 0) {
                                alert("No questions available for this course! Please add them in MCQ Admin Desk tab.");
                                return;
                              }
                              setActiveQuizEmployee(emp.code);
                              setQuizInProgress(true);
                              setCurrentQIndex(0);
                              setSelectedAnswers({});
                              setQuizCompleted(false);
                              setQuizTimeRemaining(420); // 7 mins
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              mark 
                                ? 'bg-slate-100 hover:bg-slate-205 text-slate-650 border border-slate-200' 
                                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 border border-emerald-600 shadow-sm'
                            }`}
                          >
                            <span>{mark ? 'Re-take' : 'Launch Exam'}</span>
                            <ArrowRight className="w-3 h-3 text-slate-900" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE EXAM INTERACTIVE VIEWPORT */
            (() => {
              const quizQuestions = getQuizQuestions();
              const currentQuestion = quizQuestions[currentQIndex];
              const applicant = employees.find(e => e.code === activeQuizEmployee);
              
              const answeredCount = Object.keys(selectedAnswers).length;
              const formattedTime = `${Math.floor(quizTimeRemaining / 60)}:${String(quizTimeRemaining % 60).padStart(2, '0')}`;
              const progressPct = quizQuestions.length > 0 ? ((currentQIndex + 1) / quizQuestions.length) * 100 : 0;

              if (quizCompleted) {
                let correctCount = 0;
                quizQuestions.forEach(q => {
                  if (selectedAnswers[q.id] === q.correctAnswerIdx) {
                    correctCount++;
                  }
                });
                const percentage = Math.round((correctCount / quizQuestions.length) * 100);
                const isPassed = percentage >= 50;

                const handleCommitResult = () => {
                  const updatedDraft = { ...draftMarks, [activeQuizEmployee]: percentage };
                  setDraftMarks(updatedDraft);

                  const list = activeAttendees.map(att => {
                    const code = att.employeeCode;
                    const val = code === activeQuizEmployee ? percentage : (draftMarks[code] !== undefined ? draftMarks[code] : 0);
                    return {
                      employeeCode: code,
                      obtainedMarks: Number(val),
                      totalMarks: 100
                    };
                  });
                  onSaveMarks(selectedEventId, list);
                  alert(`Exam result committed! Raheel Iqbal / ${applicant?.name}'s skill matrix level is now updated!`);
                  setQuizInProgress(false);
                  setActiveQuizEmployee('');
                };

                return (
                  <div className="bg-white border-2 border-slate-950 rounded-2xl shadow-xl p-6 md:p-8 space-y-6" id="exam-scorecard-display">
                     <div className="text-center space-y-2 border-b pb-5">
                       <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                         <Award className="w-10 h-10 animate-bounce" />
                       </div>
                       <h3 className="text-lg font-extrabold text-slate-900 uppercase">MCQ Paper Evaluated</h3>
                       <p className="text-xs text-slate-500">Applicant: <strong>{applicant?.name} ({applicant?.code})</strong></p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                       <div className="bg-slate-50 p-6 rounded-2xl border text-center space-y-1 md:col-span-1 border-slate-205">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">SCORE OBTAINED</span>
                         <span className={`text-4xl font-extrabold font-mono block ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>{percentage}%</span>
                         <span className={`text-[10px] font-bold px-3 py-1 border rounded-full inline-block mt-1.5 ${isPassed ? 'bg-emerald-50 text-emerald-800 border-emerald-150' : 'bg-rose-50 text-rose-805 border-rose-150'}`}>
                           {isPassed ? 'PASSED BENCHMARK' : 'FAILED BENCHMARK'}
                         </span>
                         <p className="text-[10px] text-slate-450 mt-2 font-mono">Correct: {correctCount} of {quizQuestions.length} Questions</p>
                       </div>

                       <div className="md:col-span-2 space-y-3 font-mono text-xs text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-205">
                         <h5 className="font-bold text-slate-800 uppercase tracking-tight font-sans text-[10px] text-slate-400 leading-none">System Integration Impact</h5>
                         <p className="text-[11px] leading-relaxed">
                           ⚡ <strong>Skills Sync</strong>: Committing this scorecard immediately syncs with Quality Skill Matrix.
                         </p>
                         <p className="text-[11px] leading-relaxed">
                           📊 <strong>Compliance Metrics</strong>: Marks are cataloged into official ISO audits sheets under Standard Operations <strong>HRM/4/008d</strong>.
                         </p>
                         <p className="text-[11px] leading-relaxed">
                           🎖️ <strong>SME Clearance</strong>: Scorers achieving &gt;90% are provisionally tagged for Level 5 Trainer status.
                         </p>
                       </div>
                     </div>

                     <div className="space-y-3 pt-2">
                       <h4 className="text-xs font-bold text-slate-850 border-b pb-1.5 flex items-center gap-1">
                         <List className="w-4 h-4 text-slate-500" />
                         <span>Syllabus review scorecard details:</span>
                       </h4>

                       <div className="space-y-4">
                         {quizQuestions.map((q, idx) => {
                           const chosenIdx = selectedAnswers[q.id];
                           const isCorrect = chosenIdx === q.correctAnswerIdx;

                           return (
                             <div key={q.id} className="p-4 rounded-xl border border-slate-150 space-y-2 text-xs bg-slate-50/50">
                               <div className="flex items-start gap-2">
                                 <span className="font-bold font-mono text-slate-400 mt-0.5">{idx + 1}.</span>
                                 <div>
                                   <p className="font-extrabold text-slate-900 leading-snug">{q.question}</p>
                                   {q.questionUrdu && (
                                     <p className="text-xs text-rose-800 font-extrabold mt-0.5 text-right rtl leading-tight">{q.questionUrdu}</p>
                                   )}
                                 </div>
                               </div>

                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 mt-1 text-[11px]">
                                 {q.options.map((opt, oIdx) => {
                                   let bgClass = "bg-white text-slate-605 border border-slate-200";
                                   if (oIdx === q.correctAnswerIdx) {
                                     bgClass = "bg-emerald-50 text-emerald-990 border border-emerald-300 font-bold";
                                   } else if (oIdx === chosenIdx && !isCorrect) {
                                     bgClass = "bg-rose-50 text-rose-900 border border-rose-300 font-bold";
                                   }

                                   return (
                                     <div key={oIdx} className={`p-2 rounded-lg flex items-center justify-between ${bgClass}`}>
                                       <span>{opt}</span>
                                       {oIdx === q.correctAnswerIdx && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                                       {oIdx === chosenIdx && !isCorrect && <X className="w-3.5 h-3.5 text-rose-600 shrink-0 ml-1" />}
                                     </div>
                                   );
                                 })}
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>

                     <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center bg-slate-50 border p-4 rounded-xl text-xs gap-4 font-semibold">
                       <button
                         onClick={() => setQuizInProgress(false)}
                         className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] hover:text-slate-800 cursor-pointer"
                       >
                         ← Abandon Marks and Exit
                       </button>
                       
                       <button
                         onClick={handleCommitResult}
                         className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 text-slate-900 font-extrabold uppercase tracking-wider rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-m"
                       >
                         <CheckCircle className="w-4 h-4 text-slate-900" />
                         <span>Commit Grade & Sync Skills</span>
                       </button>
                     </div>
                  </div>
                );
              }

              return (
                <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-900 font-bold uppercase bg-emerald-105-50 px-2.5 py-1 rounded border border-emerald-200 bg-emerald-50">ACTIVE QUALITY CANDIDATE EXAM</span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{applicant?.name}</h4>
                      <p className="text-[10px] text-slate-450 font-mono">ID: {applicant?.code} • {applicant?.designation}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl font-mono text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        <span>{formattedTime}</span>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-650 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Q: {currentQIndex + 1} / {quizQuestions.length}
                      </span>
                    </div>
                  </div>

                  {/* Question Viewport */}
                  <div className="space-y-5 py-4 min-h-60" id="mcq-question-card">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-extrabold font-mono text-slate-400 mt-1 shrink-0">QUESTION:</span>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 leading-snug">{currentQuestion.question}</h4>
                          {currentQuestion.questionUrdu && (
                            <p className="text-sm text-rose-800 font-black mt-1.5 leading-snug text-right rtl" style={{ direction: 'rtl' }}>{currentQuestion.questionUrdu}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pl-8">
                        {currentQuestion.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[currentQuestion.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: oIdx }))}
                              className={`w-full text-left px-4 py-3.5 rounded-xl text-xs transition-all border flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-50 text-emerald-990 font-bold border-emerald-500 shadow-sm ring-1 ring-emerald-400' 
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-205 hover:border-slate-350'
                              }`}
                            >
                              <span className="font-semibold text-slate-850">{opt}</span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                                isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Flow controls */}
                  <div className="border-t pt-5 flex justify-between items-center text-xs">
                    <button
                      onClick={() => currentQIndex > 0 ? setCurrentQIndex(prev => prev - 1) : null}
                      disabled={currentQIndex === 0}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm ${
                        currentQIndex === 0 
                          ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-201 cursor-pointer'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <div className="text-[10px] text-slate-400 font-mono">
                      Answered {answeredCount} of {quizQuestions.length} Questions
                    </div>

                    {currentQIndex < quizQuestions.length - 1 ? (
                      <button
                        onClick={() => selectedAnswers[currentQuestion.id] !== undefined ? setCurrentQIndex(prev => prev + 1) : alert("Please select an option to advance!")}
                        className={`px-4 py-2 bg-slate-900 border border-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow cursor-pointer`}
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (selectedAnswers[currentQuestion.id] === undefined) {
                            alert("Please select an answer for this final question!");
                            return;
                          }
                          setQuizCompleted(true);
                        }}
                        className="px-5 py-2 hover:opacity-90 bg-emerald-500 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-2 shadow-sm cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Finish Exam</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* RENDER MCQ ADMINISTRATION DESK (FULL CRUD INSTRUCTIONS) */}
      {activeSubTab === 'mcq-admin' && (
        <div className="space-y-6" id="mcq-admin-desk">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5 uppercase leading-none">
                <span>🛡️</span>
                <span>AGI Denim MCQ Examination Pool manager</span>
              </h3>
              <p className="text-xs text-slate-550 mt-1">Authorized admin hub to edit, delete, and authorize exam questions tied to training indices.</p>
            </div>

            <button
              onClick={handleOpenAddQuestion}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md text-center"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create New MCQ</span>
            </button>
          </div>

          {/* Catalog Lists */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs text-slate-400 font-bold tracking-wider uppercase">
              <span>EXAMINATION QUESTIONS ({questions.length})</span>
              <span>FILTER: BY COURSE ID OR DEFAULT PRESETS</span>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {questions.map((q, idx) => {
                const targetCrs = courses.find(c => c.id === q.courseId);
                return (
                  <div key={q.id} className="p-5 flex flex-col md:flex-row justify-between items-start gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[9px] font-extrabold bg-slate-950 text-white px-2 py-0.5 rounded leading-none shadow-sm">{q.id}</span>
                        <span className="text-[10px] font-mono text-indigo-700 font-bold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded leading-none border border-indigo-150">
                          {q.courseId === 'default' ? 'General Baseline' : `Course: ${q.courseId} (${targetCrs?.name || "Unknown"})`}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-950 text-sm leading-tight">{idx + 1}. {q.question}</p>
                        {q.questionUrdu && (
                          <p className="text-xs text-rose-800 font-extrabold italic pr-1 tracking-tight" style={{ direction: 'rtl' }}>
                            {q.questionUrdu}
                          </p>
                        )}
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`p-2 rounded-lg border text-[11px] flex justify-between items-center ${
                              oIdx === q.correctAnswerIdx 
                                ? 'bg-emerald-50 text-emerald-990 border-emerald-300 font-bold' 
                                : 'bg-slate-50 text-slate-600 border-slate-150'
                            }`}
                          >
                            <span>Choice {String.fromCharCode(65 + oIdx)}: {opt}</span>
                            {oIdx === q.correctAnswerIdx && (
                              <span className="text-[9px] uppercase tracking-wide bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black font-sans leading-none flex items-center gap-0.5">
                                <Check className="w-3 h-3 text-emerald-700" /> Key
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 md:self-center">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1 px-3 border border-slate-205 rounded-lg bg-white hover:bg-slate-100 text-[10.5px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Edit Question Prompts"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id, q.question)}
                        className="p-1 px-3 border border-slate-201 hover:border-rose-201 rounded-lg bg-rose-50 hover:bg-rose-100 text-[10.5px] font-bold text-rose-600 flex items-center gap-1 cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {questions.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-xs">No questions loaded in database pool. Run reset to load baseline indices.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL (Unified Add/Edit layout) */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all flex flex-col my-8 max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl">
              <div>
                <span className="text-[9px] font-mono tracking-wider font-bold text-amber-400 uppercase leading-none block">AGI DENIM EXAMINATION POOL</span>
                <h2 className="text-base font-bold mt-1">
                  {editingQuestion ? `✏️ Adjust Question - ${editingQuestion.id}` : '➕ Add Examination Question Card'}
                </h2>
              </div>
              <button 
                onClick={() => setShowQuestionModal(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionSubmit} className="p-5 overflow-y-auto space-y-4 text-slate-900 bg-white">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-755">Target Training Index / Course *</label>
                <p className="text-[10px] text-slate-400">Questions will launch during assessments of the selected course, or general baseline queries.</p>
                <select
                  value={formQ.courseId}
                  onChange={e => setFormQ({ ...formQ, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-950 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer bg-white"
                  required
                >
                  <option value="default">General Baseline Core Questions</option>
                  {courses.map(crs => (
                    <option key={crs.id} value={crs.id}>{crs.id} - {crs.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-755">Question Prompt (English) *</label>
                <textarea
                  rows={2}
                  placeholder="Why is continuous learning important on the shift-floor?"
                  value={formQ.question}
                  onChange={e => setFormQ({ ...formQ, question: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs text-slate-950 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-755">Question (Urdu Optional Translation)</label>
                <textarea
                  rows={2}
                  placeholder="کام کی جگہ پر مسلسل سیکھنا کیوں ضروری ہے؟"
                  value={formQ.questionUrdu}
                  onChange={e => setFormQ({ ...formQ, questionUrdu: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs text-slate-950 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-right rtl"
                  style={{ direction: 'rtl' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-755">Four Multiple-Choice Options *</label>
                
                <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">A</span>
                    <input
                      type="text"
                      placeholder="It helps improve knowledge and skills"
                      value={formQ.optA}
                      onChange={e => setFormQ({ ...formQ, optA: e.target.value })}
                      className="flex-1 px-2.5 py-1 text-xs text-slate-950 border border-slate-300 rounded focus:outline-none bg-white font-semibold"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">B</span>
                    <input
                      type="text"
                      placeholder="It increases workload"
                      value={formQ.optB}
                      onChange={e => setFormQ({ ...formQ, optB: e.target.value })}
                      className="flex-1 px-2.5 py-1 text-xs text-slate-950 border border-slate-300 rounded focus:outline-none bg-white font-semibold"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">C</span>
                    <input
                      type="text"
                      placeholder="It creates confusion"
                      value={formQ.optC}
                      onChange={e => setFormQ({ ...formQ, optC: e.target.value })}
                      className="flex-1 px-2.5 py-1 text-xs text-slate-950 border border-slate-300 rounded focus:outline-none bg-white font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">D</span>
                    <input
                      type="text"
                      placeholder="It has no impact"
                      value={formQ.optD}
                      onChange={e => setFormQ({ ...formQ, optD: e.target.value })}
                      className="flex-1 px-2.5 py-1 text-xs text-slate-950 border border-slate-300 rounded focus:outline-none bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-755">Indicate Correct Answer Option Key *</label>
                <select
                  value={formQ.correctAnswerIdx}
                  onChange={e => setFormQ({ ...formQ, correctAnswerIdx: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 text-slate-950 rounded-lg focus:outline-none focus:border-slate-800 cursor-pointer bg-white font-mono font-bold"
                  required
                >
                  <option value={0}>Option A (First Choice)</option>
                  <option value={1}>Option B (Second Choice)</option>
                  <option value={2}>Option C (Third Choice)</option>
                  <option value={3}>Option D (Fourth Choice)</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2 mt-4 bg-white">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-semibold rounded-xl text-xs cursor-pointer animate-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-950 text-white font-bold rounded-xl text-xs cursor-pointer shadow-m text-center"
                >
                  {editingQuestion ? 'Save Question' : 'Authorize Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
