import { Course, Employee, TrainingEvent, SkillRating, IndividualPreAssessment, DepartmentalPreAssessment, PostAssessmentFeedback, PostAssessmentMark } from './types';

export const INITIAL_COURSES: Course[] = [
  {
    id: "TRG-01",
    name: "Factors affecting Fabric Quality",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Yarn quality standards", "Weaving loom adjustments", "Moisture and humidity controls", "Sizing and tensioning factors"],
    scope: "Professional/Technical",
    method: "Lecture/Presentation",
    durationHours: 3,
    durationMinutes: 180
  },
  {
    id: "TRG-02",
    name: "Color Evaluation (Pre & Post Wash)",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Yearly \\DOR",
    topics: ["Spectrophotometer operation", "Munsell color matching", "Post-wash shrinkage shading", "Chemical impact on indigo dyes"],
    scope: "Professional/Technical",
    method: "Practical/Demonstration",
    durationHours: 4,
    durationMinutes: 240
  },
  {
    id: "TRG-03",
    name: "Quality Standard , Roles & Responsblity",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["ISO 9001:2015 HRM integrations", "Inspection SOPs", "SOP escalation protocols", "Defect reporting standards"],
    scope: "Systems/Sustainability",
    method: "Lecture/Presentation",
    durationHours: 2,
    durationMinutes: 120
  },
  {
    id: "TRG-04",
    name: "Defect Classification & Calibration",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Major vs. Minor defects", "Point-allocation standard metric", "Machine-vision calibration calibration", "Standardized light box usage"],
    scope: "Professional/Technical",
    method: "Practical/Demonstration",
    durationHours: 4,
    durationMinutes: 240
  },
  {
    id: "TRG-05",
    name: "Quality General Awareness",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Continuous improvement mindset", "5S housekeeping standards", "Defect prevention concepts", "Traceability principles"],
    scope: "Systems/Sustainability",
    method: "Lecture/Presentation",
    durationHours: 2,
    durationMinutes: 120
  },
  {
    id: "TRG-06",
    name: "Quality Inspection Performance and Compliance",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Auditor ethics", "Random sampling frameworks", "Compliance checklists for major retail buyers", "Record keeping standards"],
    scope: "Social Compliance",
    method: "Lecture/Presentation",
    durationHours: 3,
    durationMinutes: 180
  },
  {
    id: "TRG-07",
    name: "QC Lab & Customer Assurance",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Lab testing methods for crocking/bleeding", "Tensile strength thresholds", "Customer audit readiness", "Product specification sheets"],
    scope: "Professional/Technical",
    method: "Practical/Demonstration",
    durationHours: 5,
    durationMinutes: 300
  },
  {
    id: "TRG-08",
    name: "Yarn Grading & Indigo Shade Matching",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Yearly \\DOR",
    topics: ["Ring-spun yarn imperfections", "Indigo dye bath concentration checks", "Shade-band reference guides", "Spectroscopic verification"],
    scope: "Professional/Technical",
    method: "Practical/Demonstration",
    durationHours: 3,
    durationMinutes: 180
  },
  {
    id: "TRG-09",
    name: "Training on Defect Classification and AQL",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Acceptance Quality Limit (AQL) 1.5/2.5", "MIL-STD-105E compliance", "Sampling size calculations", "Lot acceptance-rejection criteria"],
    scope: "Systems/Sustainability",
    method: "Lecture/Presentation",
    durationHours: 3,
    durationMinutes: 180
  },
  {
    id: "TRG-10",
    name: "Training on Corrective action and Root Cause analysis",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["5-Whys methodology", "Fishbone (Ishikawa) diagrams", "Corrective Action & Preventive Action (CAPA)", "Validation of solutions"],
    scope: "Professional/Technical",
    method: "Lecture/Presentation",
    durationHours: 4,
    durationMinutes: 240
  },
  {
    id: "TRG-11",
    name: "Training on Handling of Non-Conforming Product & hold Product",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Identification and segregation tags", "Quarantine area procedures", "Disposition board decisions", "Re-inspection protocols"],
    scope: "Systems/Sustainability",
    method: "Practical/Demonstration",
    durationHours: 3,
    durationMinutes: 180
  },
  {
    id: "TRG-12",
    name: "Training on Product risk assessment",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Chemical restricted substances list (RSL)", "Physical safety (pins, needles, sharp metal containment)", "FMEA for products"],
    scope: "Systems/Sustainability",
    method: "Lecture/Presentation",
    durationHours: 3,
    durationMinutes: 180
  },
  {
    id: "TRG-13",
    name: "Training on Process risk assessment",
    trainer: "Subject Matter Expert",
    department: "Quality",
    frequency: "Biannually",
    topics: ["Process FMEA (PFMEA)", "High temperature hazard evaluation", "High pressure wash cycle risks", "Control plans for critical points"],
    scope: "Systems/Sustainability",
    method: "Lecture/Presentation",
    durationHours: 3,
    durationMinutes: 180
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { code: "AGI-1021", name: "Muhammad Naveed", email: "mnaveed@agidenim.com", designation: "Quality Inspector", department: "Quality Assurance", unit: "Unit 1", hodName: "Sajid Mahmood", hodEmail: "smahmood@agidenim.com" },
  { code: "AGI-1022", name: "Abdul Rehman", email: "arehman@agidenim.com", designation: "Senior Colorist", department: "Dyeing Lab", unit: "Unit 1", hodName: "Sajid Mahmood", hodEmail: "smahmood@agidenim.com" },
  { code: "AGI-1023", name: "Kashif Ali", email: "kali@agidenim.com", designation: "QC Executive", department: "Quality Assurance", unit: "Unit 2", hodName: "Tariq Siddiqui", hodEmail: "tsiddiqui@agidenim.com" },
  { code: "AGI-1024", name: "Zainab Fatima", email: "zfatima@agidenim.com", designation: "Lab Analyst", department: "QA Testing Lab", unit: "Unit 1", hodName: "Sajid Mahmood", hodEmail: "smahmood@agidenim.com" },
  { code: "AGI-1025", name: "Imran Khan", email: "ikhan@agidenim.com", designation: "Quality Auditor", department: "Finishing Quality", unit: "Unit 2", hodName: "Tariq Siddiqui", hodEmail: "tsiddiqui@agidenim.com" },
  { code: "AGI-1026", name: "Haris Sohail", email: "hsohail@agidenim.com", designation: "Weaving Supervisor", department: "Denim Weaving", unit: "Unit 3", hodName: "Nadeem Anwar", hodEmail: "nanwar@agidenim.com" },
  { code: "AGI-1027", name: "Asma Bi", email: "abi@agidenim.com", designation: "QA Inspector", department: "Quality Assurance", unit: "Unit 3", hodName: "Nadeem Anwar", hodEmail: "nanwar@agidenim.com" },
  { code: "AGI-1028", name: "Siddique Ahmed", email: "sahmed@agidenim.com", designation: "Assistant Dyeing Master", department: "Dyeing", unit: "Unit 2", hodName: "Tariq Siddiqui", hodEmail: "tsiddiqui@agidenim.com" }
];

// Let's create realistic pre-scheduled events matching the Nov, Sep, Dec schedules of Document 1
export const INITIAL_EVENTS: TrainingEvent[] = [
  {
    id: "EVT-2025-01",
    courseId: "TRG-02", // Color Evaluation
    date: "2025-11-12",
    time: "10:00 AM - 02:00 PM",
    trgRef: "TRG/REF-2025/1102",
    sheetNo: "HRM/4/009-S01",
    isTNA: true,
    isRefresher: false,
    status: 'Completed',
    attendees: [
      { employeeCode: "AGI-1021", reportingTime: "09:55 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1022", reportingTime: "09:48 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1024", reportingTime: "10:02 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1025", reportingTime: "09:50 AM", present: true, signature: "Signed" }
    ],
    trainerSignature: "SME_SIG",
    hodSignature: "Sajid_Mahmood_SIG",
    gmSignature: "GM_SIG"
  },
  {
    id: "EVT-2025-02",
    courseId: "TRG-03", // Quality Standard, Roles & Responsbility
    date: "2025-11-20",
    time: "02:00 PM - 04:00 PM",
    trgRef: "TRG/REF-2025/1103",
    sheetNo: "HRM/4/009-S02",
    isTNA: true,
    isRefresher: false,
    status: 'Completed',
    attendees: [
      { employeeCode: "AGI-1021", reportingTime: "01:50 PM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1023", reportingTime: "01:58 PM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1025", reportingTime: "01:45 PM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1027", reportingTime: "01:59 PM", present: true, signature: "Signed" }
    ],
    trainerSignature: "SME_SIG",
    hodSignature: "Tariq_Siddiqui_SIG",
    gmSignature: "GM_SIG"
  },
  {
    id: "EVT-2025-03",
    courseId: "TRG-06", // Quality Inspection Performance and Compliance
    date: "2025-09-15",
    time: "11:00 AM - 02:00 PM",
    trgRef: "TRG/REF-2025/0906",
    sheetNo: "HRM/4/009-S03",
    isTNA: true,
    isRefresher: false,
    status: 'Completed',
    attendees: [
      { employeeCode: "AGI-1021", reportingTime: "10:55 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1023", reportingTime: "10:45 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1024", reportingTime: "11:01 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1026", reportingTime: "11:05 AM", present: false, signature: "" },
      { employeeCode: "AGI-1027", reportingTime: "10:52 AM", present: true, signature: "Signed" }
    ],
    trainerSignature: "SME_SIG",
    hodSignature: "Nadeem_Anwar_SIG",
    gmSignature: "GM_SIG"
  },
  {
    id: "EVT-2025-04",
    courseId: "TRG-05", // Quality General Awareness
    date: "2025-11-28",
    time: "09:00 AM - 11:00 AM",
    trgRef: "TRG/REF-2025/1105",
    sheetNo: "HRM/4/009-S04",
    isTNA: false,
    isRefresher: true,
    status: 'Completed',
    attendees: [
      { employeeCode: "AGI-1022", reportingTime: "08:50 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1024", reportingTime: "08:55 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1026", reportingTime: "09:03 AM", present: true, signature: "Signed" },
      { employeeCode: "AGI-1028", reportingTime: "08:45 AM", present: true, signature: "Signed" }
    ],
    trainerSignature: "SME_SIG",
    hodSignature: "Sajid_Mahmood_SIG",
    gmSignature: "GM_SIG"
  },
  {
    id: "EVT-2025-05",
    courseId: "TRG-04", // Defect Classification & Calibration
    date: "2025-12-10",
    time: "10:00 AM - 02:00 PM",
    trgRef: "TRG/REF-2025/1204",
    sheetNo: "HRM/4/009-S05",
    isTNA: true,
    isRefresher: false,
    status: 'Scheduled',
    attendees: [
      { employeeCode: "AGI-1021", reportingTime: "", present: false, signature: "" },
      { employeeCode: "AGI-1023", reportingTime: "", present: false, signature: "" },
      { employeeCode: "AGI-1025", reportingTime: "", present: false, signature: "" },
      { employeeCode: "AGI-1027", reportingTime: "", present: false, signature: "" }
    ]
  },
  {
    id: "EVT-2026-01",
    courseId: "TRG-01", // Factors affecting Fabric Quality
    date: "2026-06-25",
    time: "10:30 AM - 01:30 PM",
    trgRef: "TRG/REF-2026/0601",
    sheetNo: "HRM/4/009-S06",
    isTNA: true,
    isRefresher: false,
    status: 'Scheduled',
    attendees: [
      { employeeCode: "AGI-1021", reportingTime: "", present: false, signature: "" },
      { employeeCode: "AGI-1022", reportingTime: "", present: false, signature: "" },
      { employeeCode: "AGI-1026", reportingTime: "", present: false, signature: "" }
    ]
  }
];

export const INITIAL_SKILLS: SkillRating[] = [
  // Navid
  { employeeCode: "AGI-1021", courseId: "TRG-01", level: 4 },
  { employeeCode: "AGI-1021", courseId: "TRG-02", level: 5 },
  { employeeCode: "AGI-1021", courseId: "TRG-03", level: 3 },
  { employeeCode: "AGI-1021", courseId: "TRG-04", level: 4 },
  { employeeCode: "AGI-1021", courseId: "TRG-05", level: 4 },
  // Rehman
  { employeeCode: "AGI-1022", courseId: "TRG-02", level: 5 },
  { employeeCode: "AGI-1022", courseId: "TRG-05", level: 3 },
  { employeeCode: "AGI-1022", courseId: "TRG-08", level: 4 },
  // Kashif
  { employeeCode: "AGI-1023", courseId: "TRG-03", level: 4 },
  { employeeCode: "AGI-1023", courseId: "TRG-06", level: 4 },
  // Zainab
  { employeeCode: "AGI-1024", courseId: "TRG-02", level: 4 },
  { employeeCode: "AGI-1024", courseId: "TRG-05", level: 4 },
  { employeeCode: "AGI-1024", courseId: "TRG-07", level: 5 },
  // Imran
  { employeeCode: "AGI-1025", courseId: "TRG-02", level: 3 },
  { employeeCode: "AGI-1025", courseId: "TRG-03", level: 4 },
  // Haris
  { employeeCode: "AGI-1026", courseId: "TRG-05", level: 4 },
  { employeeCode: "AGI-1026", courseId: "TRG-01", level: 3 },
  // Asma
  { employeeCode: "AGI-1027", courseId: "TRG-03", level: 4 },
  { employeeCode: "AGI-1027", courseId: "TRG-06", level: 3 },
  // Siddique
  { employeeCode: "AGI-1028", courseId: "TRG-05", level: 4 },
  { employeeCode: "AGI-1028", courseId: "TRG-08", level: 5 }
];

export const INITIAL_INDIVIDUAL_PRE_ASSESSMENTS: IndividualPreAssessment[] = [
  {
    id: "IND-TNA-001",
    employeeCode: "AGI-1021",
    purpose: "Career Planning & development",
    trainingSubject: "Advanced Color Evaluation",
    topicsNeedToBeCovered: ["Colormetric formulas dE*", "Shade matching instrumentation", "Standardizing light temperatures"],
    scope: "Professional/Technical",
    method: "Practical/Demonstration",
    externalLearningTransferred: true,
    assessedByName: "Sajid Mahmood",
    assessedByDesignation: "HOD Quality",
    assessedByDate: "2025-10-15",
    isEvaluated: true,
    evaluationScores: {
      theoreticalImprovement: 5,
      performanceImprovement: 4,
      metExpectations: 5,
      contentUpToMark: 5,
      styleEffective: 4,
      recommendInFuture: 5
    },
    evaluationHODRating: "Excellent",
    evaluatedByName: "Sajid Mahmood",
    evaluatedByDesignation: "HOD Quality",
    evaluatedByDate: "2025-11-25"
  },
  {
    id: "IND-TNA-002",
    employeeCode: "AGI-1024",
    purpose: "New Employee",
    trainingSubject: "Basic Quality Standards & Awareness",
    topicsNeedToBeCovered: ["ISO 9001 checklists", "Cleanliness & 5S basics", "Standard escalation matrices"],
    scope: "Systems/Sustainability",
    method: "Lecture/Presentation",
    externalLearningTransferred: false,
    assessedByName: "Sajid Mahmood",
    assessedByDesignation: "HOD Quality",
    assessedByDate: "2025-11-02",
    isEvaluated: false
  }
];

export const INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS: DepartmentalPreAssessment[] = [
  {
    id: "DEP-TNA-001",
    department: "Quality Assurance",
    purpose: "Audit / Frequent Non-Conformity",
    trainingSubject: "Corrective Action & Root Cause Analysis (CAPA)",
    scope: "Professional/Technical",
    method: "Lecture/Presentation",
    assessedByName: "Tariq Siddiqui",
    assessedByDesignation: "QA Manager",
    assessedByDate: "2025-10-01",
    isEvaluated: true,
    evaluationScores: {
      theoreticalKnowledge: 4,
      departmentalPerformance: 5,
      metExpectations: 4,
      contentUpToMark: 4,
      styleEffective: 5,
      recommendInFuture: 5
    },
    evaluationHODRating: "Good",
    evaluatedByName: "Tariq Siddiqui",
    evaluatedByDesignation: "QA Manager",
    evaluatedByDate: "2025-11-15"
  }
];

export const INITIAL_FEEDBACKS: PostAssessmentFeedback[] = [
  {
    id: "FB-001",
    trainingEventId: "EVT-2025-01", // Color Evaluation
    employeeCode: "AGI-1021",
    scores: {
      topicAdequacy: 5,
      trainingAids: 4,
      trainerKnowledge: 5,
      trainerAudibility: 5,
      materialUsefulness: 5,
      traineeParticipation: 4,
      workshopLength: 4,
      locationConvenience: 5,
      overallAssessment: 5
    },
    coveredBest: "Differentiate pre-wash and post-wash color shading on jeans.",
    needsImprovement: "Need more sample fabric varieties to practice on.",
    moreEffectiveBy: "Adding real-world customer return shade-out examples.",
    applicationPlan: "Will immediately apply the spectrophotometer procedures on the next denim batch shipment.",
    shouldRepeat: true,
    repeatFrequency: "Biannually",
    additionalTrainingHelpful: "Spectroscopic data analytics software courses.",
    generalSuggestions: "Excellent, well organized and very professional.",
    submittedAt: "2025-11-12T16:00:00Z"
  },
  {
    id: "FB-002",
    trainingEventId: "EVT-2025-01",
    employeeCode: "AGI-1022",
    scores: {
      topicAdequacy: 5,
      trainingAids: 5,
      trainerKnowledge: 5,
      trainerAudibility: 4,
      materialUsefulness: 5,
      traineeParticipation: 5,
      workshopLength: 4,
      locationConvenience: 4,
      overallAssessment: 5
    },
    coveredBest: "Pre and post wash color comparisons and shade bands.",
    needsImprovement: "Room was a bit crowded.",
    moreEffectiveBy: "Hands-on calibration sessions for every attendee.",
    applicationPlan: "Assisting in establishing standardized shade templates for our lab.",
    shouldRepeat: true,
    repeatFrequency: "Yearly",
    additionalTrainingHelpful: "Indigo shade variations during continuous dyeing.",
    generalSuggestions: "Great coordination by HOD HR.",
    submittedAt: "2025-11-12T16:15:00Z"
  }
];

export const INITIAL_POST_MARKS: PostAssessmentMark[] = [
  // For Color Evaluation (EVT-2025-01) - 4 attendees
  { id: "M-001", trainingEventId: "EVT-2025-01", employeeCode: "AGI-1021", obtainedMarks: 85, totalMarks: 100 },
  { id: "M-002", trainingEventId: "EVT-2025-01", employeeCode: "AGI-1022", obtainedMarks: 92, totalMarks: 100 },
  { id: "M-003", trainingEventId: "EVT-2025-01", employeeCode: "AGI-1024", obtainedMarks: 78, totalMarks: 100 },
  { id: "M-004", trainingEventId: "EVT-2025-01", employeeCode: "AGI-1025", obtainedMarks: 88, totalMarks: 100 },

  // For Quality Standard, Roles & Responsbility (EVT-2025-02) - 4 attendees
  { id: "M-005", trainingEventId: "EVT-2025-02", employeeCode: "AGI-1021", obtainedMarks: 90, totalMarks: 100 },
  { id: "M-006", trainingEventId: "EVT-2025-02", employeeCode: "AGI-1023", obtainedMarks: 82, totalMarks: 100 },
  { id: "M-007", trainingEventId: "EVT-2025-02", employeeCode: "AGI-1025", obtainedMarks: 62, totalMarks: 100 }, // Satisfactory
  { id: "M-008", trainingEventId: "EVT-2025-02", employeeCode: "AGI-1027", obtainedMarks: 45, totalMarks: 100 }, // Unsatisfactory

  // For Quality Inspection Performance & Compliance (EVT-2025-03)
  { id: "M-009", trainingEventId: "EVT-2025-03", employeeCode: "AGI-1021", obtainedMarks: 80, totalMarks: 100 },
  { id: "M-010", trainingEventId: "EVT-2025-03", employeeCode: "AGI-1023", obtainedMarks: 88, totalMarks: 100 },
  { id: "M-011", trainingEventId: "EVT-2025-03", employeeCode: "AGI-1024", obtainedMarks: 84, totalMarks: 100 },
  { id: "M-012", trainingEventId: "EVT-2025-03", employeeCode: "AGI-1027", obtainedMarks: 76, totalMarks: 100 }
];

export function getLMSData() {
  const getOrSet = (key: string, defaultVal: any) => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing key " + key, e);
      }
    }
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  };

  return {
    courses: getOrSet('agi_lms_courses', INITIAL_COURSES),
    employees: getOrSet('agi_lms_employees', INITIAL_EMPLOYEES),
    events: getOrSet('agi_lms_events', INITIAL_EVENTS),
    skills: getOrSet('agi_lms_skills', INITIAL_SKILLS),
    individualPre: getOrSet('agi_lms_individual_pre', INITIAL_INDIVIDUAL_PRE_ASSESSMENTS),
    departmentalPre: getOrSet('agi_lms_departmental_pre', INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS),
    feedbacks: getOrSet('agi_lms_feedbacks', INITIAL_FEEDBACKS),
    postMarks: getOrSet('agi_lms_post_marks', INITIAL_POST_MARKS),
  };
}

export function saveLMSData(data: {
  courses: Course[];
  employees: Employee[];
  events: TrainingEvent[];
  skills: SkillRating[];
  individualPre: IndividualPreAssessment[];
  departmentalPre: DepartmentalPreAssessment[];
  feedbacks: PostAssessmentFeedback[];
  postMarks: PostAssessmentMark[];
}) {
  localStorage.setItem('agi_lms_courses', JSON.stringify(data.courses));
  localStorage.setItem('agi_lms_employees', JSON.stringify(data.employees));
  localStorage.setItem('agi_lms_events', JSON.stringify(data.events));
  localStorage.setItem('agi_lms_skills', JSON.stringify(data.skills));
  localStorage.setItem('agi_lms_individual_pre', JSON.stringify(data.individualPre));
  localStorage.setItem('agi_lms_departmental_pre', JSON.stringify(data.departmentalPre));
  localStorage.setItem('agi_lms_feedbacks', JSON.stringify(data.feedbacks));
  localStorage.setItem('agi_lms_post_marks', JSON.stringify(data.postMarks));
}
