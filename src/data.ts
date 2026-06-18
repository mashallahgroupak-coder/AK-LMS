import { Course, Employee, TrainingEvent, SkillRating, IndividualPreAssessment, DepartmentalPreAssessment, PostAssessmentFeedback, PostAssessmentMark, MCQQuestion } from './types';

export const INITIAL_COURSES: Course[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_EVENTS: TrainingEvent[] = [];
export const INITIAL_SKILLS: SkillRating[] = [];
export const INITIAL_INDIVIDUAL_PRE_ASSESSMENTS: IndividualPreAssessment[] = [];
export const INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS: DepartmentalPreAssessment[] = [];
export const INITIAL_FEEDBACKS: PostAssessmentFeedback[] = [];
export const INITIAL_POST_MARKS: PostAssessmentMark[] = [];
export const INITIAL_QUESTIONS: MCQQuestion[] = [];

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
    questions: getOrSet('agi_lms_questions', INITIAL_QUESTIONS),
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
  questions: MCQQuestion[];
}) {
  localStorage.setItem('agi_lms_courses', JSON.stringify(data.courses));
  localStorage.setItem('agi_lms_employees', JSON.stringify(data.employees));
  localStorage.setItem('agi_lms_events', JSON.stringify(data.events));
  localStorage.setItem('agi_lms_skills', JSON.stringify(data.skills));
  localStorage.setItem('agi_lms_individual_pre', JSON.stringify(data.individualPre));
  localStorage.setItem('agi_lms_departmental_pre', JSON.stringify(data.departmentalPre));
  localStorage.setItem('agi_lms_feedbacks', JSON.stringify(data.feedbacks));
  localStorage.setItem('agi_lms_post_marks', JSON.stringify(data.postMarks));
  localStorage.setItem('agi_lms_questions', JSON.stringify(data.questions));
}
