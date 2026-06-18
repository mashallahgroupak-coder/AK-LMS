import React, { useState, useEffect } from 'react';
import { Course, Employee, TrainingEvent, PostAssessmentFeedback, PostAssessmentMark } from '../types';
import { Award, Star, List, PenTool, CheckCircle, BrainCircuit, UserCheck, Scroll, Save, SmilePlus, Plus, BookOpen, Clock, ArrowRight, ArrowLeft, AlertCircle, Check, X } from 'lucide-react';

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIdx: number;
}

const FAQ_QUESTION_SETS: { [courseId: string]: MCQQuestion[] } = {
  "CRS-01": [
    {
      id: 1,
      question: "Which light source is standard in Artistic Garment color grading cabinets to evaluate American retail specs?",
      options: ["A Incandescent Light", "D65 light source (Simulated Daylight)", "UV Blacklight Filter", "Horizon Warm White"],
      correctAnswerIdx: 1
    },
    {
      id: 2,
      question: "On a spectrophotometer, what does a negative b* output directly represent?",
      options: ["Red tint deviation", "Yellow/Blue shade dominance (Blue shift)", "Starch concentration", "Weight distribution coefficient"],
      correctAnswerIdx: 1
    },
    {
      id: 3,
      question: "Why must test swatches be conditioned for 4 hours before visual assessment?",
      options: ["To stabilize moisture and temperature that change indigo light reflection properties", "To allow spin oil to evaporate completely", "To allow starch coating to crack", "To increase weaving tension"],
      correctAnswerIdx: 0
    },
    {
      id: 4,
      question: "What is Metamerism in textile color quality management?",
      options: ["Severe fabric shrink after five washes", "A mismatch where color matches under one light source but differs under another", "Dye bleeding in water baths", "Uneven thickness in yarn spinning"],
      correctAnswerIdx: 1
    },
    {
      id: 5,
      question: "Which of the following scales is standard to measure chemical staining and color bleeding?",
      options: ["GSM weighing scales", "Gray Scale for Staining and color transfer", "Warp Shrinkage grid ruler", "ASTM chemical index chart"],
      correctAnswerIdx: 1
    }
  ],
  "CRS-03": [
    {
      id: 1,
      question: "What is the primary objective of continuous quality audits under ISO 9001:2015 specifications?",
      options: ["Imposing fines on raw helper staff", "Establishing continuous improvement and preventing problems from occurring", "Speeding up visual scan times to 2 seconds", "Deleting outdated manufacturing logs"],
      correctAnswerIdx: 1
    },
    {
      id: 2,
      question: "On AGI production lines who has full operational authority to issue a HOLD quarantine tag on suspicious cargo?",
      options: ["Canteen food server assistants", "QA Inspector / QA Area Incharge", "Electrical motor helpers", "Mechanical maintenance apprentices"],
      correctAnswerIdx: 1
    },
    {
      id: 3,
      question: "If defect recurrence exceeds Acceptable Quality Limit (AQL) boundaries under SOPs, what action must occur?",
      options: ["Conceal the batch and load it into delivery trucks", "Release the consignment to save warehousing space", "Quarantine the lot, label with code, and submit a CAR (Corrective Action Request) to HOD", "Unplug the air compressor line"],
      correctAnswerIdx: 2
    },
    {
      id: 4,
      question: "Which standard form registers verified training attendee signatures?",
      options: ["HRM/4/008b (Feedback Survey)", "HRM/4/009 (Trainee Attendance Sheet)", "HRM/4/010 (Skills matrix grid handbook)", "QA/5/012 (Daily shade review sheet)"],
      correctAnswerIdx: 1
    },
    {
      id: 5,
      question: "Which phrase defines the structural difference between Quality Control (QC) and Quality Assurance (QA)?",
      options: ["QC is testing-focused inspection of parts; QA establishes systemic processes and training to prevent errors", "QA and QC are identical words in industrial manufacturing", "QA is only done exclusively during coffee breaks; QC is done at nights", "QA stands for Qualify Answer; QC stands for Quality Complaint"],
      correctAnswerIdx: 0
    }
  ],
  "CRS-04": [
    {
      id: 1,
      question: "In the 4-Point System of fabric inspection, what is the maximum permissible points that can be awarded to any single defect?",
      options: ["1 point", "2 points", "4 points", "10 points"],
      correctAnswerIdx: 2
    },
    {
      id: 2,
      question: "Under the standard 4-Point system, if an inspector finds a defect measuring 7 inches, how many points are recorded?",
      options: ["1 point", "2 points", "3 points", "4 points"],
      correctAnswerIdx: 1
    },
    {
      id: 3,
      question: "What is the core purpose of holding regular Quality Inspector 'Calibration' rounds?",
      options: ["Recalibrating high-speed metal cutting blades", "Removing subjective differences so inspectors assign the same grades to the same defects", "Refining yarn blending mixtures", "Measuring operator blood pressure"],
      correctAnswerIdx: 1
    },
    {
      id: 4,
      question: "A fabric defect spanning greater than 9 inches attracts how many inspection points under the 4-point rule?",
      options: ["1 point", "2 points", "3 points", "4 points"],
      correctAnswerIdx: 3
    },
    {
      id: 5,
      question: "Which defect type represents a critical filling failure in denim rolling?",
      options: ["Minor lint sticker easily brushed away", "Major continuous filling bands or warp stripes running face-wide", "Slight inner belt tag misprint", "A light thread tail"],
      correctAnswerIdx: 1
    }
  ]
};

const DEFAULT_QUESTIONS: MCQQuestion[] = [
  {
    id: 1,
    question: "What is the core purpose of conducting evaluations and assessments after quality training?",
    options: [
      "Securing compliance signatures for auditing record files only",
      "Measuring actual skill transfer, lessons absorption, and practical floor competence",
      "Calculating how to substitute raw fiber imports",
      "Drafting daily shift output logs blindly"
    ],
    correctAnswerIdx: 1
  },
  {
    id: 2,
    question: "In 5-Whys analysis (Root Cause Analysis - RCA), why is asking 'Why' multiple times critical?",
    options: [
      "To verify who made the mistake to distribute fines",
      "To pierce past superficial surface symptoms to discover the true underlying systemic cause",
      "To delay filling of incident paperwork metrics",
      "Because the auditor likes reading redundant data loops"
    ],
    correctAnswerIdx: 1
  },
  {
    id: 3,
    question: "What must be done immediately when an inspector spots a non-conformance lot?",
    options: [
      "Push it under passing fabric rolls to avoid record logs",
      "Segregate the cargo with a designated RED quarantine card and place it in hold quarantine",
      "Send it to shipment early before the HOD notices",
      "Discard the lot instantly without creating records"
    ],
    correctAnswerIdx: 1
  },
  {
    id: 4,
    question: "What does standard 'SOP' represent on industrial floor guides?",
    options: [
      "Standard Operating Procedure",
      "Special Optimization Policy",
      "Sector Organization Platform",
      "Series Output Projector"
    ],
    correctAnswerIdx: 0
  },
  {
    id: 5,
    question: "Which quality approach is highly cost-preventative in denim manufacturing?",
    options: [
      "Post-shipment customer claims reconciliation",
      "In-line error prevention and immediate correction training",
      "Reworking stitching defects post-fabrication",
      "Replacing complete rolling machines daily"
    ],
    correctAnswerIdx: 1
  }
];

interface PostAssessmentProps {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  feedbacks: PostAssessmentFeedback[];
  postMarks: PostAssessmentMark[];
  onAddFeedback: (fb: PostAssessmentFeedback) => void;
  onSaveMarks: (eventId: string, marks: { employeeCode: string; obtainedMarks: number; totalMarks: number }[]) => void;
}

export const PostAssessment: React.FC<PostAssessmentProps> = ({
  courses,
  employees,
  events,
  feedbacks,
  postMarks,
  onAddFeedback,
  onSaveMarks
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'grades' | 'feedback' | 'log-feedback' | 'mcq'>('grades');
  const [selectedEventId, setSelectedEventId] = useState(events.filter(e => e.status === 'Completed')[0]?.id || events[0]?.id || '');

  const activeEvent = events.find(e => e.id === selectedEventId);
  const activeCourse = activeEvent ? courses.find(c => c.id === activeEvent.courseId) : null;
  const activeAttendees = activeEvent ? activeEvent.attendees.filter(a => a.present) : [];

  // Local state for grading paper inputs
  const [draftMarks, setDraftMarks] = useState<{ [code: string]: number }>({});
  const [draftRemarks, setDraftRemarks] = useState('');

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
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizTimeRemaining, setQuizTimeRemaining] = useState<number>(600); // 10 minutes simulated countdown

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
    if (percent < 50) return { label: 'Unsatisfactory', color: 'text-red-700 bg-red-50' };
    if (percent <= 65) return { label: 'Satisfactory', color: 'text-orange-850 bg-orange-50' };
    if (percent <= 85) return { label: 'Good', color: 'text-blue-800 bg-blue-50' };
    return { label: 'Excellent', color: 'text-emerald-700 bg-emerald-50' };
  };

  const handleSaveGradesSubmit = () => {
    const list = activeAttendees.map(att => ({
      employeeCode: att.employeeCode,
      obtainedMarks: Number(draftMarks[att.employeeCode] || 80),
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
            className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 bg-white font-medium rounded-xl text-xs focus:outline-none cursor-pointer"
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
      <div className="flex border-b border-slate-200 text-sm">
        <button
          onClick={() => setActiveSubTab('grades')}
          className={`pb-3 px-5 font-semibold transition-all relative cursor-pointer ${
            activeSubTab === 'grades' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          Assessment Scores sheet (HRM/4/008d)
          {activeSubTab === 'grades' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>

        <button
          onClick={() => setActiveSubTab('feedback')}
          className={`pb-3 px-5 font-semibold transition-all relative cursor-pointer ${
            activeSubTab === 'feedback' ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          Trainee Feedback Reviews (HRM/4/008b)
          {activeSubTab === 'feedback' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>

        <button
          onClick={() => setActiveSubTab('log-feedback')}
          className={`pb-3 px-5 font-semibold text-sky-600 transition-all relative cursor-pointer ${
            activeSubTab === 'log-feedback' ? 'text-sky-800' : 'text-sky-550 hover:text-sky-655'
          }`}
        >
          <span className="flex items-center">
            <SmilePlus className="w-4 h-4 mr-1 shrink-0" />
            Record Paper Feedback
          </span>
          {activeSubTab === 'log-feedback' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />}
        </button>

        <button
          onClick={() => setActiveSubTab('mcq')}
          className={`pb-3 px-5 font-semibold text-emerald-600 transition-all relative cursor-pointer ${
            activeSubTab === 'mcq' ? 'text-emerald-850' : 'text-emerald-500 hover:text-emerald-650'
          }`}
        >
          <span className="flex items-center">
            <BrainCircuit className="w-4 h-4 mr-1 shrink-0" />
            Online MCQ Exam Room
          </span>
          {activeSubTab === 'mcq' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>
      </div>

      {/* RENDER DYNAMIC MODULES */}
      {activeSubTab === 'grades' && (
        activeAttendees.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 text-slate-400 text-xs">
            No employees marked present for this event yet. Mark attendance and save sheet in the Attendance tab first.
          </div>
        ) : (
          <div className="space-y-6">
            {/* HRM/4/008(d) visual sheet replica */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-lg p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
              {/* Header */}
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
              <div className="border border-slate-900 rounded-xl overflow-hidden text-xs">
                <table className="min-w-full divide-y divide-slate-400">
                  <thead className="bg-slate-50">
                    <tr className="divide-x divide-slate-400">
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

                  <tbody className="divide-y divide-slate-200">
                    {activeAttendees.map((att, idx) => {
                      const emp = employees.find(e => e.code === att.employeeCode);
                      if (!emp) return null;

                      const marks = draftMarks[att.employeeCode] || 0;
                      const percent = (marks / 100) * 100;
                      const rObj = getRatingLabel(percent);

                      return (
                        <tr key={att.employeeCode} className="divide-x divide-slate-200">
                          <td className="p-3 text-center font-mono font-medium text-slate-550">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">{emp.code}</td>
                          <td className="p-3 font-black text-slate-950">{emp.name}</td>
                          <td className="p-3 text-slate-650">{emp.designation}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={marks}
                              onChange={e => handleGradeChange(att.employeeCode, Number(e.target.value))}
                              className="w-16 px-1.5 py-1 border border-slate-300 rounded font-mono text-center bg-transparent text-xs"
                            />
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500">100</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-900">{percent}%</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${rObj.color}`}>
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
                    <div>&gt; 85%: Excellent</div>
                    <div>66% – 85%: Good</div>
                    <div>50% – 65%: Satisfactory</div>
                    <div>Below 50%: Unsatisfactory</div>
                  </div>
                </div>

                <div className="bg-white border p-4 rounded-xl space-y-2.5">
                  <h4 className="font-bold text-slate-900">Overall Department Results</h4>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Average Department Percentage:</span>
                    <span className="font-mono font-bold text-slate-900">{avgPercent.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Rating Index:</span>
                    <span className={`font-bold font-mono uppercase text-[10px] px-2 py-0.5 rounded-full ${departmentalRatingObj.color}`}>
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
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl flex items-center space-x-2 border border-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow"
                >
                  <Save className="w-4 h-4 text-white" />
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
              <SmilePlus className="w-4 h-4 text-slate-950" />
              <span>Record feedback survey now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="feedback-grid-display">
            {filteredFeedbacks.map(f => {
              const emp = employees.find(e => e.code === f.employeeCode);
              // Calculate average evaluation score of 9 parameters
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

          <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705">Selecting Employee / Trainee *</label>
                <select
                  value={newFb.employeeCode}
                  onChange={e => setNewFb({ ...newFb, employeeCode: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg hover:border-slate-400 focus:outline-none"
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
                <p className="text-[10px] text-slate-400 leading-snug">Feedback applies to the currently selected course: <strong>{activeCourse?.name || "Program"}</strong></p>
              </div>
            </div>

            {/* Score grids matching parameters */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Statements Assessments (1-5) where 5 is Strongly Agree, 1 is Strongly Disagree</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 text-xs text-slate-755">
                <div className="flex justify-between items-center">
                  <span>1. The topic was covered adequately?</span>
                  <select value={newFb.q1} onChange={e => setNewFb({...newFb, q1: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>2. Required training aids were available?</span>
                  <select value={newFb.q2} onChange={e => setNewFb({...newFb, q2: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>3. The trainer was knowledgeable?</span>
                  <select value={newFb.q3} onChange={e => setNewFb({...newFb, q3: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>4. The trainer was easy to hear?</span>
                  <select value={newFb.q4} onChange={e => setNewFb({...newFb, q4: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>5. Presented materials useful for tasks?</span>
                  <select value={newFb.q5} onChange={e => setNewFb({...newFb, q5: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>6. Trainee participation was active?</span>
                  <select value={newFb.q6} onChange={e => setNewFb({...newFb, q6: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>7. Workshop length was satisfactory?</span>
                  <select value={newFb.q7} onChange={e => setNewFb({...newFb, q7: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>8. Location setup/conveniences good?</span>
                  <select value={newFb.q8} onChange={e => setNewFb({...newFb, q8: Number(e.target.value)})} className="px-2 py-0.5 border border-slate-300 text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex justify-between items-center col-span-full border-t border-dashed pt-2">
                  <span className="font-bold text-slate-800">9. Overall Assessment of value?</span>
                  <select value={newFb.q9} onChange={e => setNewFb({...newFb, q9: Number(e.target.value)})} className="px-3 py-1 border border-slate-300 font-bold font-mono text-xs rounded bg-white">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Narratives open parameters */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Narratives Reviews</h4>
              
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Which area of training workshop was covered best?</label>
                  <input
                    type="text"
                    value={newFb.coveredBest}
                    onChange={e => setNewFb({ ...newFb, coveredBest: e.target.value })}
                    placeholder="e.g. Spectrophotometer shading comparisons"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Which areas need improvement?</label>
                  <input
                    type="text"
                    value={newFb.needsImprovement}
                    onChange={e => setNewFb({ ...newFb, needsImprovement: e.target.value })}
                    placeholder="e.g. Add more live fabric samples"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">How do you plan to apply benefits on floor tasks?</label>
                  <textarea
                    rows={2}
                    value={newFb.applicationPlan}
                    onChange={e => setNewFb({ ...newFb, applicationPlan: e.target.value })}
                    placeholder="I will use the light box standardized angles during dye shadow audits."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
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
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1 border border-slate-900 hover:bg-slate-800 transition-all cursor-pointer shadow"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Submit Feedback Check</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubTab === 'mcq' && (
        <div className="max-w-4xl mx-auto space-y-6" id="digital-mcq-exam-section">
          {/* Main Info */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">AGI Denim - Dynamic Post-Training Examination</h3>
              </div>
              <p className="text-xs text-slate-300">
                Online testing room for Course: <strong className="text-white text-semibold">{activeCourse?.name} ({activeCourse?.id})</strong>. Must have been marked present in attendance sheets to start.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs shrink-0 font-mono">
              Event Ref: <span className="text-emerald-400 font-bold">{activeEvent?.trgRef}</span>
            </div>
          </div>

          {!quizInProgress ? (
            /* TRAINEES CHOOSE AND LAUNCH LIST */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attendee Eligibility & MCQ Status</h4>
              
              {activeAttendees.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No attendees marked present for this event. Record and save daily attendance first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {activeAttendees.map(att => {
                    const emp = employees.find(e => e.code === att.employeeCode);
                    if (!emp) return null;

                    const mark = postMarks.find(m => m.trainingEventId === selectedEventId && m.employeeCode === emp.code);
                    const isPassed = mark && mark.obtainedMarks >= 50;

                    return (
                      <div key={emp.code} className="border border-slate-150 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50/50 transition-all">
                        <div className="space-y-1 truncate">
                          <p className="font-bold text-slate-950 truncate">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.designation} • <span className="font-mono font-bold">{emp.code}</span></p>
                          
                          {/* Marks status badge */}
                          {mark ? (
                            <div className="flex items-center space-x-1 mt-1">
                              <span className={`inline-block text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                                isPassed ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
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

                        <div className="shrink-0 ml-3">
                          <button
                            onClick={() => {
                              setActiveQuizEmployee(emp.code);
                              setQuizInProgress(true);
                              setCurrentQIndex(0);
                              setSelectedAnswers({});
                              setQuizCompleted(false);
                              setQuizTimeRemaining(420); // Reset timer to 7 minutes
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              mark 
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-202' 
                                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-sm'
                            }`}
                          >
                            <span>{mark ? 'Re-take Exam' : 'Launch Exam'}</span>
                            <ArrowRight className="w-3 h-3" />
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
              const quizQuestions = FAQ_QUESTION_SETS[activeCourse?.id || ''] || DEFAULT_QUESTIONS;
              const currentQuestion = quizQuestions[currentQIndex];
              const applicant = employees.find(e => e.code === activeQuizEmployee);
              
              const answeredCount = Object.keys(selectedAnswers).length;
              const formattedTime = `${Math.floor(quizTimeRemaining / 60)}:${String(quizTimeRemaining % 60).padStart(2, '0')}`;
              const progressPct = quizQuestions.length > 0 ? ((currentQIndex + 1) / quizQuestions.length) * 100 : 0;

              if (quizCompleted) {
                // Compute Correct Responses
                let correctCount = 0;
                quizQuestions.forEach(q => {
                  if (selectedAnswers[q.id] === q.correctAnswerIdx) {
                    correctCount++;
                  }
                });
                const percentage = (correctCount / quizQuestions.length) * 100;
                const isPassed = percentage >= 50;

                const handleCommitResult = () => {
                  // Re-calc array of marks
                  const updatedDraft = { ...draftMarks, [activeQuizEmployee]: percentage };
                  setDraftMarks(updatedDraft);

                  const list = activeAttendees.map(att => {
                    const code = att.employeeCode;
                    const val = code === activeQuizEmployee ? percentage : (draftMarks[code] || 0);
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
                  <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6" id="exam-scorecard-display">
                    <div className="text-center space-y-2 border-b pb-5">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <Award className="w-10 h-10 animate-bounce" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 uppercase">MCQ Paper Evaluated</h3>
                      <p className="text-xs text-slate-500">Applicant: <strong>{applicant?.name} ({applicant?.code})</strong></p>
                    </div>

                    {/* Radial score box */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      <div className="bg-slate-50 p-6 rounded-2xl border text-center space-y-1 md:col-span-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">SCORE OBTAINED</span>
                        <span className={`text-4xl font-extrabold font-mono block ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{percentage}%</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${isPassed ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                          {isPassed ? 'PASSED BENCHMARK' : 'FAILED BENCHMARK'}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-2">Correct: {correctCount} of {quizQuestions.length} Questions</p>
                      </div>

                      <div className="md:col-span-2 space-y-3 font-mono text-xs text-slate-650 bg-slate-50 p-5 rounded-2xl border">
                        <h5 className="font-bold text-slate-800 uppercase tracking-tight font-sans text-[10px] text-slate-400">System Integration Impact</h5>
                        <p className="text-[11px] leading-relaxed">
                          ⚡ <strong>Skills Sync</strong>: Committing this scorecard immediately syncs with the Quality Skill Matrix.
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          📊 <strong>Compliance Metrics</strong>: Marks are cataloged into official ISO audits sheets under Standard Operations <strong>HRM/4/008d</strong>.
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          🎖️ <strong>SME Clearance</strong>: Scorers achieving &gt;90% are provisionally tagged for Level 5 Trainer status recommendations.
                        </p>
                      </div>
                    </div>

                    {/* Review list */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-850 border-b pb-1 flex items-center gap-1">
                        <List className="w-4 h-4 text-slate-500" />
                        <span>Interactive Question paper review:</span>
                      </h4>

                      <div className="space-y-4">
                        {quizQuestions.map((q, idx) => {
                          const chosenIdx = selectedAnswers[q.id];
                          const isCorrect = chosenIdx === q.correctAnswerIdx;

                          return (
                            <div key={q.id} className="p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-bold font-mono text-slate-400 mt-0.5">{idx + 1}.</span>
                                <p className="font-bold text-slate-900 leading-snug">{q.question}</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5 mt-1 text-[11px]">
                                {q.options.map((opt, oIdx) => {
                                  let bgClass = "bg-white text-slate-600 border border-slate-200";
                                  if (oIdx === q.correctAnswerIdx) {
                                    bgClass = "bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold";
                                  } else if (oIdx === chosenIdx && !isCorrect) {
                                    bgClass = "bg-red-50 text-red-900 border border-red-300";
                                  }

                                  return (
                                    <div key={oIdx} className={`p-2 rounded-lg flex items-center justify-between ${bgClass}`}>
                                      <span>{opt}</span>
                                      {oIdx === q.correctAnswerIdx && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                                      {oIdx === chosenIdx && !isCorrect && <X className="w-3.5 h-3.5 text-red-600 shrink-0 ml-1" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Commit Action buttons */}
                    <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center bg-slate-50 border p-4 rounded-xl text-xs gap-4">
                      <button
                        onClick={() => setQuizInProgress(false)}
                        className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        ← Abandon Marks and Exit
                      </button>
                      
                      <button
                        onClick={handleCommitResult}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-black uppercase tracking-wider rounded-xl flex items-center space-x-2 border border-emerald-500/30 transition-all cursor-pointer shadow-m"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-900" />
                        <span>Commit Grade to Database & Sync Skills</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white border-2 border-slate-900 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
                  {/* Participant and Timer row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">ACTIVE CANDIDATE EXAM APPLICANT</span>
                      <h4 className="text-sm font-extrabold text-slate-900">{applicant?.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {applicant?.code} • {applicant?.designation} ({applicant?.unit})</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Timer */}
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-xl font-mono text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                        <span>{formattedTime}</span>
                      </div>

                      {/* Question Tracker */}
                      <span className="text-xs font-mono font-bold text-slate-650 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Q: {currentQIndex + 1} / {quizQuestions.length}
                      </span>
                    </div>
                  </div>

                  {/* Question and Option list */}
                  <div className="space-y-5 py-4 min-h-60">
                    {/* Visual Progress Line */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-extrabold font-mono text-slate-400 mt-0.5">QUESTION 0{currentQIndex + 1}:</span>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{currentQuestion.question}</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pl-8">
                        {currentQuestion.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[currentQuestion.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: oIdx }))}
                              className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border flex items-center justify-between cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-50 text-emerald-990 font-bold border-emerald-500 shadow-sm ring-1 ring-emerald-400' 
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-201 hover:border-slate-300'
                              }`}
                            >
                              <span>{opt}</span>
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
                  <div className="border-t pt-5 flex justify-between items-center">
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
                        onClick={() => selectedAnswers[currentQuestion.id] !== undefined ? setCurrentQIndex(prev => prev + 1) : alert("Please select an answer to advance!")}
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
    </div>
  );
};
