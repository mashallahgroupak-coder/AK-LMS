export interface Course {
  id: string;
  name: string;
  trainer: string;
  department: string;
  frequency: string;
  topics: string[];
  scope: 'Professional/Technical' | 'Systems/Sustainability' | 'Social Compliance' | 'Other';
  method: 'Lecture/Presentation' | 'Practical/Demonstration' | 'Associating with senior' | 'Other';
  durationHours: number;
  durationMinutes: number;
}

export interface Employee {
  code: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  unit: string;
  hodName?: string;
  hodEmail?: string;
}

export interface TrainingEvent {
  id: string;
  courseId: string;
  date: string;
  time: string;
  trgRef: string;
  sheetNo: string;
  isTNA: boolean;
  isRefresher: boolean;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  attendees: {
    employeeCode: string;
    reportingTime: string;
    present: boolean;
    signature: string; // "Signed" or empty
  }[];
  trainerSignature?: string;
  hodSignature?: string;
  gmSignature?: string;
}

export interface SkillRating {
  employeeCode: string;
  courseId: string;
  level: number; // 1 to 5 (or 0 if unrated)
}

export interface IndividualPreAssessment {
  id: string;
  employeeCode: string;
  purpose: 'New Employee' | 'Career Planning & development' | 'Induction of new machinery / method / system' | 'Audit / frequent Non-conformity' | 'Other';
  otherPurposeDetail?: string;
  trainingSubject: string;
  topicsNeedToBeCovered: string[];
  scope: 'Professional/Technical' | 'Systems/Sustainability' | 'Social Compliance' | 'Other';
  method: 'Lecture/Presentation' | 'Practical/Demonstration' | 'Associating with senior' | 'Other';
  externalLearningTransferred: boolean;
  assessedByName: string;
  assessedByDesignation: string;
  assessedByDate: string;
  isEvaluated: boolean; // Has post-training TNA evaluation been done?
  evaluationScores?: {
    theoreticalImprovement: number; // 1-5
    performanceImprovement: number; // 1-5
    metExpectations: number; // 1-5
    contentUpToMark: number; // 1-5
    styleEffective: number; // 1-5
    recommendInFuture: number; // 1-5
  };
  evaluationHODRating?: 'Unsatisfactory' | 'Satisfactory' | 'Good' | 'Excellent';
  evaluatedByName?: string;
  evaluatedByDesignation?: string;
  evaluatedByDate?: string;
}

export interface DepartmentalPreAssessment {
  id: string;
  department: string;
  purpose: 'Career Planning & Development' | 'Induction of New Machinery / Method / System' | 'Audit / Frequent Non-Conformity' | 'Other';
  otherPurposeDetail?: string;
  trainingSubject: string;
  scope: 'Professional/Technical' | 'Systems/Sustainability' | 'Social Compliance' | 'Other';
  method: 'Lecture/Presentation' | 'Practical/Demonstration' | 'Associating with senior' | 'Other';
  otherMethodDetail?: string;
  assessedByName: string;
  assessedByDesignation: string;
  assessedByDate: string;
  isEvaluated: boolean;
  evaluationScores?: {
    theoreticalKnowledge: number; // 1-5
    departmentalPerformance: number; // 1-5
    metExpectations: number;
    contentUpToMark: number;
    styleEffective: number;
    recommendInFuture: number;
  };
  evaluationHODRating?: 'Unsatisfactory' | 'Satisfactory' | 'Good' | 'Excellent';
  evaluatedByName?: string;
  evaluatedByDesignation?: string;
  evaluatedByDate?: string;
}

export interface PostAssessmentFeedback {
  id: string;
  trainingEventId: string;
  employeeCode: string;
  scores: {
    topicAdequacy: number; // 1-5
    trainingAids: number; // 1-5
    trainerKnowledge: number; // 1-5
    trainerAudibility: number; // 1-5
    materialUsefulness: number; // 1-5
    traineeParticipation: number; // 1-5
    workshopLength: number; // 1-5
    locationConvenience: number; // 1-5
    overallAssessment: number; // 1-5
  };
  coveredBest: string;
  needsImprovement: string;
  moreEffectiveBy: string;
  applicationPlan: string;
  shouldRepeat: boolean;
  repeatFrequency?: string;
  additionalTrainingHelpful?: string;
  generalSuggestions?: string;
  submittedAt: string;
}

export interface PostAssessmentMark {
  id: string;
  trainingEventId: string;
  employeeCode: string;
  obtainedMarks: number;
  totalMarks: number;
}

export interface MCQQuestion {
  id: string;
  courseId: string; // The course this MCQ belongs to, or "default"
  question: string; // English question
  questionUrdu?: string; // Urdu translation
  options: string[]; // Options array (usually A, B, C, D)
  correctAnswerIdx: number; // Index of correct option (0, 1, 2, 3)
}

