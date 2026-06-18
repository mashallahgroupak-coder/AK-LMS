import { useState, useEffect } from 'react';
import { getLMSData, saveLMSData, INITIAL_COURSES, INITIAL_EMPLOYEES, INITIAL_EVENTS, INITIAL_SKILLS, INITIAL_INDIVIDUAL_PRE_ASSESSMENTS, INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS, INITIAL_FEEDBACKS, INITIAL_POST_MARKS, INITIAL_QUESTIONS } from './data';
import { Course, Employee, TrainingEvent, SkillRating, IndividualPreAssessment, DepartmentalPreAssessment, PostAssessmentFeedback, PostAssessmentMark, MCQQuestion } from './types';
import { DashboardOverview } from './components/DashboardOverview';
import { PreAssessment } from './components/PreAssessment';
import { SkillMatrix } from './components/SkillMatrix';
import { TrainingCalendar } from './components/TrainingCalendar';
import { TrainingLibrary } from './components/TrainingLibrary';
import { NominationForm } from './components/NominationForm';
import { AttendanceSheet } from './components/AttendanceSheet';
import { UnitStatsAnalysis } from './components/UnitStatsAnalysis';
import { PostAssessment } from './components/PostAssessment';
import { TrainingReports } from './components/TrainingReports';
import { AgiDenimLogo } from './components/AgiDenimLogo';

import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db as firestoreDb, handleFirestoreError, OperationType, loginWithGoogle, logoutUser } from './firebase';

import { 
  Building2, LayoutDashboard, FileCheck2, Grid, CalendarDays, BookOpenText, 
  SendToBack, ClipboardList, BarChart4, ClipboardCheck, FileSpreadsheet, RefreshCw,
  Trash2, Database
} from 'lucide-react';

export default function App() {
  const [db, setDb] = useState(() => getLMSData());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isApkMode, setIsApkMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Synchronize Auth and load/write Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Force empty slate for local storage on first load after the code change
      if (!localStorage.getItem('agi_lms_force_slate_v3_local')) {
        localStorage.clear();
        localStorage.setItem('agi_lms_force_slate_v3_local', 'true');
        setDb({
          courses: [],
          employees: [],
          events: [],
          skills: [],
          individualPre: [],
          departmentalPre: [],
          feedbacks: [],
          postMarks: [],
          questions: []
        });
      }

      if (currentUser) {
        setIsSyncing(true);
        try {
          // Force wipe of old Firestore collections once to guarantee perfect clean sheet
          if (!localStorage.getItem('agi_lms_force_slate_v3_firestore')) {
            const collectionsToWipe = [
              'courses', 'employees', 'events', 'skills', 
              'individualPre', 'departmentalPre', 'feedbacks', 
              'postMarks', 'questions'
            ];
            for (const colName of collectionsToWipe) {
              const snap = await getDocs(collection(firestoreDb, colName));
              for (const d of snap.docs) {
                await deleteDoc(doc(firestoreDb, colName, d.id));
              }
            }
            await setDoc(doc(firestoreDb, 'config', 'status'), { initialized: true, wiped: true });
            localStorage.setItem('agi_lms_force_slate_v3_firestore', 'true');
          } else {
            const configSnap = await getDocs(collection(firestoreDb, 'config'));
            if (configSnap.empty) {
              await setDoc(doc(firestoreDb, 'config', 'status'), { initialized: true });
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'init-seed');
        } finally {
          setIsSyncing(false);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscriptions to Firestore collections
  useEffect(() => {
    if (!user) {
      // Revert to local storage state if guest/offline
      setDb(getLMSData());
      return;
    }

    const unsubscribes: (() => void)[] = [];

    const handleSnap = <T,>(collectionName: string, stateField: keyof typeof db, parser: (doc: any) => T) => {
      unsubscribes.push(
        onSnapshot(
          collection(firestoreDb, collectionName),
          (snap) => {
            const items = snap.docs.map(doc => parser(doc.data()));
            setDb(prev => ({
              ...prev,
              [stateField]: items
            }));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, collectionName);
          }
        )
      );
    };

    handleSnap('courses', 'courses', d => d);
    handleSnap('employees', 'employees', d => d);
    handleSnap('events', 'events', d => d);
    handleSnap('skills', 'skills', d => d);
    handleSnap('individualPre', 'individualPre', d => d);
    handleSnap('departmentalPre', 'departmentalPre', d => d);
    handleSnap('feedbacks', 'feedbacks', d => d);
    handleSnap('postMarks', 'postMarks', d => d);
    handleSnap('questions', 'questions', d => d);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  const updateDb = (updater: (prev: typeof db) => typeof db) => {
    setDb(prev => {
      const next = updater(prev);
      saveLMSData(next);
      return next;
    });
  };


  // State handles
  const handleAddCourse = async (course: Course) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'courses', course.id), course);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `courses/${course.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        courses: [...prev.courses, course]
      }));
    }
  };

  const handleEditCourse = async (course: Course) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'courses', course.id), course);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `courses/${course.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        courses: prev.courses.map(c => c.id === course.id ? course : c)
      }));
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(firestoreDb, 'courses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `courses/${id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        courses: prev.courses.filter(c => c.id !== id),
        // Clean up skills rating associated with course
        skills: prev.skills.filter(s => s.courseId !== id)
      }));
    }
  };

  const handleEditEvent = async (event: TrainingEvent) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'events', event.id), event);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${event.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === event.id ? event : e)
      }));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(firestoreDb, 'events', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== id),
        postMarks: prev.postMarks.filter(pm => pm.trainingEventId !== id),
        feedbacks: prev.feedbacks.filter(fb => fb.trainingEventId !== id)
      }));
    }
  };

  const handleSaveQuestion = async (question: MCQQuestion) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'questions', question.id), question);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `questions/${question.id}`);
      }
    } else {
      updateDb(prev => {
        const index = prev.questions ? prev.questions.findIndex(q => q.id === question.id) : -1;
        const questionsList = prev.questions ? [...prev.questions] : [];
        if (index >= 0) {
          questionsList[index] = question;
        } else {
          questionsList.push(question);
        }
        return {
          ...prev,
          questions: questionsList
        };
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(firestoreDb, 'questions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `questions/${id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        questions: (prev.questions || []).filter(q => q.id !== id)
      }));
    }
  };


  const handleAddIndividualPre = async (tna: IndividualPreAssessment) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'individualPre', tna.id), tna);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `individualPre/${tna.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        individualPre: [tna, ...prev.individualPre]
      }));
    }
  };

  const handleAddDepartmentalPre = async (tna: DepartmentalPreAssessment) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'departmentalPre', tna.id), tna);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `departmentalPre/${tna.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        departmentalPre: [tna, ...prev.departmentalPre]
      }));
    }
  };

  const handleEvaluateIndividual = async (
    id: string, 
    scores: any, 
    rating: any, 
    evaluator: string, 
    designation: string, 
    date: string
  ) => {
    if (user) {
      try {
        const item = db.individualPre.find(p => p.id === id);
        if (item) {
          const updated = {
            ...item,
            isEvaluated: true,
            evaluationScores: scores,
            evaluationHODRating: rating,
            evaluatedByName: evaluator,
            evaluatedByDesignation: designation,
            evaluatedByDate: date
          };
          await setDoc(doc(firestoreDb, 'individualPre', id), updated);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `individualPre/${id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        individualPre: prev.individualPre.map(p => p.id === id ? {
          ...p,
          isEvaluated: true,
          evaluationScores: scores,
          evaluationHODRating: rating,
          evaluatedByName: evaluator,
          evaluatedByDesignation: designation,
          evaluatedByDate: date
        } : p)
      }));
    }
  };

  const handleEvaluateDepartmental = async (
    id: string, 
    scores: any, 
    rating: any, 
    evaluator: string, 
    designation: string, 
    date: string
  ) => {
    if (user) {
      try {
        const item = db.departmentalPre.find(p => p.id === id);
        if (item) {
          const updated = {
            ...item,
            isEvaluated: true,
            evaluationScores: scores,
            evaluationHODRating: rating,
            evaluatedByName: evaluator,
            evaluatedByDesignation: designation,
            evaluatedByDate: date
          };
          await setDoc(doc(firestoreDb, 'departmentalPre', id), updated);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `departmentalPre/${id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        departmentalPre: prev.departmentalPre.map(p => p.id === id ? {
          ...p,
          isEvaluated: true,
          evaluationScores: scores,
          evaluationHODRating: rating,
          evaluatedByName: evaluator,
          evaluatedByDesignation: designation,
          evaluatedByDate: date
        } : p)
      }));
    }
  };

  const handleUpdateSkill = async (employeeCode: string, courseId: string, level: number) => {
    if (user) {
      try {
        const skillId = `${employeeCode}_${courseId}`;
         await setDoc(doc(firestoreDb, 'skills', skillId), { employeeCode, courseId, level });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `skills/${employeeCode}_${courseId}`);
      }
    } else {
      updateDb(prev => {
        const filtered = prev.skills.filter(s => !(s.employeeCode === employeeCode && s.courseId === courseId));
        return {
          ...prev,
          skills: [...filtered, { employeeCode, courseId, level }]
        };
      });
    }
  };

  const handleAddEvent = async (evt: TrainingEvent) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'events', evt.id), evt);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${evt.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: [evt, ...prev.events]
      }));
    }
  };

  const handleUpdateEventStatus = async (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled') => {
    if (user) {
      try {
        const item = db.events.find(e => e.id === id);
        if (item) {
          await setDoc(doc(firestoreDb, 'events', id), { ...item, status });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === id ? { ...e, status } : e)
      }));
    }
  };

  const handleNominateTrainee = async (eventId: string, employeeCode: string) => {
    if (user) {
      try {
        const item = db.events.find(e => e.id === eventId);
        if (item) {
          const updated = {
            ...item,
            attendees: [...item.attendees, { employeeCode, reportingTime: '', present: false, signature: '' }]
          };
          await setDoc(doc(firestoreDb, 'events', eventId), updated);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === eventId ? {
          ...e,
          attendees: [...e.attendees, { employeeCode, reportingTime: '', present: false, signature: '' }]
        } : e)
      }));
    }
  };

  const handleRemoveNomination = async (eventId: string, employeeCode: string) => {
    if (user) {
      try {
        const item = db.events.find(e => e.id === eventId);
        if (item) {
          const updated = {
            ...item,
            attendees: item.attendees.filter(a => a.employeeCode !== employeeCode)
          };
          await setDoc(doc(firestoreDb, 'events', eventId), updated);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === eventId ? {
          ...e,
          attendees: e.attendees.filter(a => a.employeeCode !== employeeCode)
        } : e)
      }));
    }
  };

  const handleSaveAttendance = async (
    eventId: string, 
    attendeeUpdates: { employeeCode: string; reportingTime: string; present: boolean; signature: string }[],
    trainerSig: string,
    hodSig: string,
    gmSig: string
  ) => {
    if (user) {
      try {
        const item = db.events.find(e => e.id === eventId);
        if (item) {
          const updated = {
            ...item,
            status: 'Completed' as const,
            attendees: attendeeUpdates,
            trainerSignature: trainerSig,
            hodSignature: hodSig,
            gmSignature: gmSig
          };
          await setDoc(doc(firestoreDb, 'events', eventId), updated);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `events/${eventId}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === eventId ? {
          ...e,
          status: 'Completed',
          attendees: attendeeUpdates,
          trainerSignature: trainerSig,
          hodSignature: hodSig,
          gmSignature: gmSig
        } : e)
      }));
    }
  };

  const handleAddFeedback = async (fb: PostAssessmentFeedback) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'feedbacks', fb.id), fb);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `feedbacks/${fb.id}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        feedbacks: [fb, ...prev.feedbacks]
      }));
    }
  };

  const handleSaveMarks = async (eventId: string, marks: { employeeCode: string; obtainedMarks: number; totalMarks: number }[]) => {
    if (user) {
      try {
        const newMarks = marks.map((m, i) => ({
          id: `M-${eventId}-${i}-${Date.now().toString().slice(-3)}`,
          trainingEventId: eventId,
          employeeCode: m.employeeCode,
          obtainedMarks: m.obtainedMarks,
          totalMarks: m.totalMarks
        }));
        
        for (const nm of newMarks) {
          await setDoc(doc(firestoreDb, 'postMarks', nm.id), nm);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `postMarks`);
      }
    } else {
      updateDb(prev => {
        const filtered = prev.postMarks.filter(m => m.trainingEventId !== eventId);
        const newMarks = marks.map((m, i) => ({
          id: `M-${eventId}-${i}-${Date.now().toString().slice(-3)}`,
          trainingEventId: eventId,
          employeeCode: m.employeeCode,
          obtainedMarks: m.obtainedMarks,
          totalMarks: m.totalMarks
        }));

        return {
          ...prev,
          postMarks: [...filtered, ...newMarks]
        };
      });
    }
  };

  const handleResetData = async () => {
    if (confirm("Are you sure you want to reset all data back to preloaded AGI Denim default schedules and values? All your modifications will be erased.")) {
      if (user) {
        setIsSyncing(true);
        try {
          const deleteCollection = async (colName: string) => {
            const snap = await getDocs(collection(firestoreDb, colName));
            for (const d of snap.docs) {
              await deleteDoc(doc(firestoreDb, colName, d.id));
            }
          };
          
          await deleteCollection('courses');
          await deleteCollection('employees');
          await deleteCollection('events');
          await deleteCollection('skills');
          await deleteCollection('individualPre');
          await deleteCollection('departmentalPre');
          await deleteCollection('feedbacks');
          await deleteCollection('postMarks');
          await deleteCollection('questions');

          // Seed baseline initial defaults
          for (const course of INITIAL_COURSES) {
            await setDoc(doc(firestoreDb, 'courses', course.id), course);
          }
          for (const emp of INITIAL_EMPLOYEES) {
            await setDoc(doc(firestoreDb, 'employees', emp.code), emp);
          }
          for (const ev of INITIAL_EVENTS) {
            await setDoc(doc(firestoreDb, 'events', ev.id), ev);
          }
          for (const sk of INITIAL_SKILLS) {
            const skillId = `${sk.employeeCode}_${sk.courseId}`;
            await setDoc(doc(firestoreDb, 'skills', skillId), sk);
          }
          for (const ind of INITIAL_INDIVIDUAL_PRE_ASSESSMENTS) {
            await setDoc(doc(firestoreDb, 'individualPre', ind.id), ind);
          }
          for (const dept of INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS) {
            await setDoc(doc(firestoreDb, 'departmentalPre', dept.id), dept);
          }
          for (const fb of INITIAL_FEEDBACKS) {
            await setDoc(doc(firestoreDb, 'feedbacks', fb.id), fb);
          }
          for (const pm of INITIAL_POST_MARKS) {
            await setDoc(doc(firestoreDb, 'postMarks', pm.id), pm);
          }
          for (const q of INITIAL_QUESTIONS) {
            await setDoc(doc(firestoreDb, 'questions', q.id), q);
          }
          // Set system state to initialized
          await setDoc(doc(firestoreDb, 'config', 'status'), { initialized: true });
        } catch (err) {
          console.error("Error resetting Firestore database:", err);
          alert("Failed to reset Firestore database.");
        } finally {
          setIsSyncing(false);
        }
      } else {
        const defaultDb = {
          courses: INITIAL_COURSES,
          employees: INITIAL_EMPLOYEES,
          events: INITIAL_EVENTS,
          skills: INITIAL_SKILLS,
          individualPre: INITIAL_INDIVIDUAL_PRE_ASSESSMENTS,
          departmentalPre: INITIAL_DEPARTMENTAL_PRE_ASSESSMENTS,
          feedbacks: INITIAL_FEEDBACKS,
          postMarks: INITIAL_POST_MARKS,
          questions: INITIAL_QUESTIONS,
        };
        setDb(defaultDb);
        saveLMSData(defaultDb);
      }
    }
  };

  const handleClearData = async () => {
    if (confirm("🚨 DANGER WIPE: Are you sure you want to delete ALL courses, employees, calendars, skill matrices, evaluations, and post-grades? This will clear the database to zero for your custom data. This cannot be undone!")) {
      if (user) {
        setIsSyncing(true);
        try {
          const deleteCollection = async (colName: string) => {
            const snap = await getDocs(collection(firestoreDb, colName));
            for (const d of snap.docs) {
              await deleteDoc(doc(firestoreDb, colName, d.id));
            }
          };
          
          await deleteCollection('courses');
          await deleteCollection('employees');
          await deleteCollection('events');
          await deleteCollection('skills');
          await deleteCollection('individualPre');
          await deleteCollection('departmentalPre');
          await deleteCollection('feedbacks');
          await deleteCollection('postMarks');
          await deleteCollection('questions');

          const emptyDb = {
            courses: [],
            employees: [],
            events: [],
            skills: [],
            individualPre: [],
            departmentalPre: [],
            feedbacks: [],
            postMarks: [],
            questions: []
          };
          setDb(emptyDb);
          
          // Mark system as initialized/wiped to prevent automatic default seeds
          await setDoc(doc(firestoreDb, 'config', 'status'), { initialized: true, wiped: true });
          alert("All database collections successfully wiped! Zero-data slate generated.");
        } catch (err) {
          console.error("Error clearing database:", err);
          alert("Database wipe failed.");
        } finally {
          setIsSyncing(false);
        }
      } else {
        const emptyDb = {
          courses: [],
          employees: [],
          events: [],
          skills: [],
          individualPre: [],
          departmentalPre: [],
          feedbacks: [],
          postMarks: [],
          questions: []
        };
        setDb(emptyDb);
        saveLMSData(emptyDb);
        alert("Local storage wiped successfully! Zero-data slate generated.");
      }
    }
  };

  const handleImportEmployees = async (newEmployees: Employee[]) => {
    if (user) {
      setIsSyncing(true);
      try {
        for (const emp of newEmployees) {
          await setDoc(doc(firestoreDb, 'employees', emp.code), emp);
        }
        alert(`Successfully uploaded ${newEmployees.length} employee records!`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'employees-bulk-import');
      } finally {
        setIsSyncing(false);
      }
    } else {
      updateDb(prev => {
        const existingCodes = new Set(prev.employees.map(e => e.code));
        const uniqueNew = newEmployees.filter(e => !existingCodes.has(e.code));
        const merged = [...prev.employees, ...uniqueNew];
        alert(`Successfully uploaded ${newEmployees.length} employee records offline!`);
        return {
          ...prev,
          employees: merged
        };
      });
    }
  };

  const hashCode = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  };

  const parseRawCSVDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const str = dateStr.trim().replace(/^"|"$/g, '');
    const parts = str.split(/[\s,]+/).filter(Boolean);
    
    let year = 2026;
    let month = 3; // April
    let day = 15;
    
    const monthMap: Record<string, number> = {
      jan: 0, january: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
      may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8, sept: 8,
      october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
    };
    
    for (const part of parts) {
      const valLow = part.toLowerCase();
      if (monthMap[valLow] !== undefined) {
        month = monthMap[valLow];
      } else if (/^\d{4}$/.test(part)) {
        year = parseInt(part, 10);
      } else if (/^\d{1,2}$/.test(part)) {
        day = parseInt(part, 10);
      }
    }
    
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const handleImportMasterAttendance = async (csvText: string) => {
    if (!csvText || !csvText.trim()) {
      alert("No data provided.");
      return;
    }

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let currentVal = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      result.push(currentVal.trim());
      return result;
    };

    const headerLine = lines[0];
    if (!headerLine.toLowerCase().includes("training topic") && !headerLine.toLowerCase().includes("employee")) {
      alert("Invalid format. Make sure columns match AGI Sheet (S#, EMPLOYEE ID, EMPLOYEE NAME, DESIGNATION, DEPARTMENT, SECTION / VENUE, DATE, TRAINING TOPIC, DURATION...)");
      return;
    }

    interface PendingRow {
      empId: string;
      empName: string;
      desg: string;
      dept: string;
      venue: string;
      parsedDate: string;
      rawTopic: string;
      durationMins: number;
      durationHrs: number;
      isInternal: boolean;
      score?: number;
    }

    const rows: PendingRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes("employee name") || line.toLowerCase().includes("s#")) continue;
      const parts = parseCSVLine(line);
      if (parts.length < 8) continue;

      let empId = parts[1] || '';
      const empName = parts[2] || '';
      const desg = parts[3] || '';
      const dept = parts[4] || '';
      const venue = parts[5] || '';
      const rawDate = parts[6] || '';
      const rawTopic = parts[7] || '';
      const durationMinsStr = parts[8] || '45';
      const durationHrsStr = parts[9] || '0.75';
      const intExtStr = parts[11] || 'Internal';
      const scoreStr = parts[12] || '';

      if (!empName && !rawTopic) continue;

      const durationMins = parseInt(durationMinsStr.replace(/[^\d]/g, ''), 10) || 45;
      const durationHrs = parseFloat(durationHrsStr) || 0.75;
      const isInternal = !intExtStr.toLowerCase().includes("external");
      const score = scoreStr.trim() ? parseInt(scoreStr.replace(/[^\d]/g, ''), 10) : undefined;
      const parsedDate = parseRawCSVDate(rawDate);

      if (!empId.trim()) {
        empId = `AGI-TEMP-${hashCode(empName)}`;
      }

      rows.push({
        empId: empId.trim(),
        empName: empName.trim(),
        desg: desg.trim(),
        dept: dept.trim(),
        venue: venue.trim(),
        parsedDate,
        rawTopic: rawTopic.trim().replace(/^"|"$/g, ''),
        durationMins,
        durationHrs,
        isInternal,
        score
      });
    }

    const courseMap = new Map<string, Course>();
    const employeeMap = new Map<string, Employee>();
    const sessionMap = new Map<string, {
      id: string;
      courseId: string;
      date: string;
      venue: string;
      dept: string;
      durationMins: number;
      attendeeRows: PendingRow[];
    }>();

    for (const r of rows) {
      if (!employeeMap.has(r.empId)) {
        employeeMap.set(r.empId, {
          code: r.empId,
          name: r.empName,
          email: `${r.empId.toLowerCase().replace(/[^a-z0-9]/g, '')}@agidenim.at`,
          designation: r.desg,
          department: r.dept || 'Production Department',
          unit: 'Unit 1',
          hodName: `HOD - ${r.dept || 'Production'}`,
          hodEmail: `hod.${(r.dept || 'Production').toLowerCase().replace(/[^a-z]/g, '')}@agidenim.at`
        });
      }

      const courseId = `CRS-${hashCode(r.rawTopic)}`;
      if (!courseMap.has(courseId)) {
        const tLow = r.rawTopic.toLowerCase();
        let scope: 'Professional/Technical' | 'Systems/Sustainability' | 'Social Compliance' | 'Other' = 'Professional/Technical';
        if (tLow.includes("safety") || tLow.includes("hazard") || tLow.includes("waste") || tLow.includes("etp") || tLow.includes("boiler") || tLow.includes("heat") || tLow.includes("risk") || tLow.includes("electrical")) {
          scope = 'Systems/Sustainability';
        } else if (tLow.includes("compliance") || tLow.includes("ethics") || tLow.includes("rights") || tLow.includes("discipline") || tLow.includes("ibad") || tLow.includes("ethics (coc)")) {
          scope = 'Social Compliance';
        } else if (tLow.includes("management") || tLow.includes("goal") || tLow.includes("soft") || tLow.includes("balance") || tLow.includes("intelligence") || tLow.includes("mind") || tLow.includes("culture")) {
          scope = 'Other';
        }

        courseMap.set(courseId, {
          id: courseId,
          name: r.rawTopic,
          trainer: r.isInternal ? 'Internal Subject Expert' : 'External Consultant',
          department: r.dept || 'General Plant',
          frequency: 'Annually',
          topics: [r.rawTopic],
          scope,
          method: 'Lecture/Presentation',
          durationHours: r.durationHrs,
          durationMinutes: r.durationMins
        });
      }

      const sessionId = `${r.parsedDate}_${courseId}_${hashCode(r.venue)}`;
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: `EV-${sessionId.replace(/[^a-zA-Z0-9]/g, '-')}`,
          courseId,
          date: r.parsedDate,
          venue: r.venue,
          dept: r.dept,
          durationMins: r.durationMins,
          attendeeRows: []
        });
      }
      sessionMap.get(sessionId)!.attendeeRows.push(r);
    }

    const employeesToSave = Array.from(employeeMap.values());
    const coursesToSave = Array.from(courseMap.values());
    const eventsToSave: TrainingEvent[] = [];
    const postMarksToSave: PostAssessmentMark[] = [];

    for (const s of sessionMap.values()) {
      const attendees = s.attendeeRows.map(att => ({
        employeeCode: att.empId,
        reportingTime: "09:00",
        present: true,
        signature: "Signed"
      }));

      eventsToSave.push({
        id: s.id,
        courseId: s.courseId,
        date: s.date,
        time: "09:00",
        trgRef: `TRG-${hashCode(s.id).slice(0, 4).toUpperCase()}`,
        sheetNo: `SH-${hashCode(s.id).slice(0, 4).toUpperCase()}`,
        isTNA: false,
        isRefresher: false,
        status: 'Completed',
        attendees,
        trainerSignature: "Signed",
        hodSignature: "Signed",
        gmSignature: "Signed"
      });

      for (const att of s.attendeeRows) {
        if (att.score !== undefined) {
          postMarksToSave.push({
            id: `MK-${hashCode(s.id + att.empId)}`,
            trainingEventId: s.id,
            employeeCode: att.empId,
            obtainedMarks: att.score,
            totalMarks: 100
          });
        }
      }
    }

    if (user) {
      setIsSyncing(true);
      try {
        for (const emp of employeesToSave) {
          await setDoc(doc(firestoreDb, 'employees', emp.code), emp);
        }
        for (const crs of coursesToSave) {
          await setDoc(doc(firestoreDb, 'courses', crs.id), crs);
        }
        for (const ev of eventsToSave) {
          await setDoc(doc(firestoreDb, 'events', ev.id), ev);
        }
        for (const m of postMarksToSave) {
          await setDoc(doc(firestoreDb, 'postMarks', m.id), m);
        }
        alert(`Successfully imported into Cloud DB!\n✔️ Registered employees: ${employeesToSave.length}\n✔️ Training Courses added: ${coursesToSave.length}\n✔️ Calendar events scheduled: ${eventsToSave.length}\n✔️ Post-Assessment scores updated: ${postMarksToSave.length}`);
      } catch (err) {
        console.error("Firestore master import error:", err);
        alert("Firestore save failed.");
      } finally {
        setIsSyncing(false);
      }
    } else {
      updateDb(prev => {
        const existingEmpCodes = new Set(prev.employees.map(e => e.code));
        const mergedEmps = [...prev.employees, ...employeesToSave.filter(e => !existingEmpCodes.has(e.code))];

        const existingCrsIds = new Set(prev.courses.map(c => c.id));
        const mergedCrs = [...prev.courses, ...coursesToSave.filter(c => !existingCrsIds.has(c.id))];

        const existingEvIds = new Set(prev.events.map(ev => ev.id));
        const mergedEvents = [...prev.events, ...eventsToSave.filter(ev => !existingEvIds.has(ev.id))];

        const existingMarkIds = new Set(prev.postMarks.map(m => m.id));
        const mergedMarks = [...prev.postMarks, ...postMarksToSave.filter(m => !existingMarkIds.has(m.id))];

        const nextDb = {
          ...prev,
          employees: mergedEmps,
          courses: mergedCrs,
          events: mergedEvents,
          postMarks: mergedMarks
        };

        saveLMSData(nextDb);
        alert(`Successfully imported into Local DB!\n✔️ Registered employees: ${employeesToSave.length}\n✔️ Training Courses added: ${coursesToSave.length}\n✔️ Calendar events scheduled: ${eventsToSave.length}\n✔️ Post-Assessment scores updated: ${postMarksToSave.length}`);
        return nextDb;
      });
    }
  };

  const handleImportCourses = async (newCourses: Course[]) => {
    if (user) {
      setIsSyncing(true);
      try {
        for (const crs of newCourses) {
          await setDoc(doc(firestoreDb, 'courses', crs.id), crs);
        }
        alert(`Successfully uploaded ${newCourses.length} course records!`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'courses-bulk-import');
      } finally {
        setIsSyncing(false);
      }
    } else {
      updateDb(prev => {
        const existingIds = new Set(prev.courses.map(c => c.id));
        const uniqueNew = newCourses.filter(c => !existingIds.has(c.id));
        const merged = [...prev.courses, ...uniqueNew];
        alert(`Successfully uploaded ${newCourses.length} course records offline!`);
        return {
          ...prev,
          courses: merged
        };
      });
    }
  };

  const handleAddEmployee = async (emp: Employee) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'employees', emp.code), emp);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `employees/${emp.code}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        employees: [...prev.employees, emp]
      }));
    }
  };

  const handleEditEmployee = async (emp: Employee) => {
    if (user) {
      try {
        await setDoc(doc(firestoreDb, 'employees', emp.code), emp);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `employees/${emp.code}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        employees: prev.employees.map(e => e.code === emp.code ? emp : e)
      }));
    }
  };

  const handleDeleteEmployee = async (code: string) => {
    if (user) {
      try {
        await deleteDoc(doc(firestoreDb, 'employees', code));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `employees/${code}`);
      }
    } else {
      updateDb(prev => ({
        ...prev,
        employees: prev.employees.filter(e => e.code !== code)
      }));
    }
  };

  const tabs = [
    { id: 'overview', name: 'L&D Dashboard', icon: LayoutDashboard },
    { id: 'pre', name: 'Pre Assessment (TNA)', icon: FileCheck2 },
    { id: 'skills', name: 'Skill Matrix', icon: Grid },
    { id: 'calendar', name: 'Training Calendar', icon: CalendarDays },
    { id: 'library', name: 'Training Library', icon: BookOpenText },
    { id: 'nomination', name: 'Nomination', icon: SendToBack },
    { id: 'attendance', name: 'Attendance', icon: ClipboardList },
    { id: 'unit-stats', name: 'Unit-wise Stats', icon: BarChart4 },
    { id: 'post', name: 'Post-Assessment', icon: ClipboardCheck },
    { id: 'reports', name: 'Training Reports', icon: FileSpreadsheet }
  ];

  if (isApkMode) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-3 relative overflow-y-auto font-sans text-slate-900" id="apk-mockup-wrapper">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Floating Top Control Panel */}
        <div className="mb-4 z-40 bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between gap-4 shadow-xl w-full max-w-[420px] no-print shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-350 font-bold uppercase tracking-wider font-mono">AGI Android APK Mode</span>
          </div>
          <button
            onClick={() => setIsApkMode(false)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-3.5 py-2 rounded-xl cursor-pointer shadow-md shadow-blue-900/40 transition-all flex items-center gap-1.5"
          >
            🖥️ Desktop Hub
          </button>
        </div>

        {/* ANDROID DEVICE SHELL MOCKUP */}
        <div className="relative w-full max-w-[425px] h-[845px] rounded-[55px] border-[12px] border-slate-900 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden shrink-0 select-none">
          
          {/* CAMERA PUNCH HOLE / DETAILED NOTCH */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-14 border border-slate-850" />
          </div>

          {/* SIMULATED ANDROID STATUS BAR */}
          <div className="bg-slate-900 text-slate-100 h-8 px-6 pt-1 flex items-center justify-between text-[11px] font-bold tracking-wide shrink-0 font-mono z-40 select-none pointer-events-none">
            <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            <div className="flex items-center space-x-1.5 text-[10px]">
              <span>📶</span>
              <span>📶</span>
              <span className="font-sans">⚡ 100%</span>
            </div>
          </div>

          {/* SIMULATED MAIN VIEW CONTAINER (Inside Device Display) */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full relative bg-slate-50/80">
            {/* ANDROID COMPLIANT APP TOP HEAD ("will be on top of every page" on Mobile APP) */}
            <div className="bg-white border-b border-slate-205 py-4 px-4 flex flex-col items-center justify-center shrink-0 shadow-sm relative no-print">
              <AgiDenimLogo size="xs" theme="light" />
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-extrabold font-mono mt-0.5">L&D Operational Android Module</p>
            </div>

            {/* MOBILE CONTENT CANVAS - SCROLLABLE */}
            <main className="flex-1 overflow-y-auto p-4 pb-20">
              <div className="max-w-full w-full">
                {activeTab === 'overview' && (
                  <DashboardOverview 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    individualPre={db.individualPre}
                    departmentalPre={db.departmentalPre}
                    feedbacks={db.feedbacks}
                    postMarks={db.postMarks}
                    onNavigate={setActiveTab}
                    onQuickSchedule={() => setActiveTab('calendar')}
                    onAddEmployee={handleAddEmployee}
                    onImportEmployees={handleImportEmployees}
                    onImportCourses={handleImportCourses}
                    onImportMasterAttendance={handleImportMasterAttendance}
                    onClearData={handleClearData}
                    onResetData={handleResetData}
                    onDeleteEmployee={handleDeleteEmployee}
                  />
                )}

                {activeTab === 'pre' && (
                  <PreAssessment 
                    employees={db.employees}
                    individualPre={db.individualPre}
                    departmentalPre={db.departmentalPre}
                    onAddIndividual={handleAddIndividualPre}
                    onAddDepartmental={handleAddDepartmentalPre}
                    onEvaluateIndividual={handleEvaluateIndividual}
                    onEvaluateDepartmental={handleEvaluateDepartmental}
                  />
                )}

                {activeTab === 'skills' && (
                  <SkillMatrix 
                    courses={db.courses}
                    employees={db.employees}
                    skills={db.skills}
                    events={db.events}
                    postMarks={db.postMarks}
                    onUpdateSkill={handleUpdateSkill}
                  />
                )}

                {activeTab === 'calendar' && (
                  <TrainingCalendar 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    onAddEvent={handleAddEvent}
                    onEditEvent={handleEditEvent}
                    onDeleteEvent={handleDeleteEvent}
                    onUpdateEventStatus={handleUpdateEventStatus}
                  />
                )}

                {activeTab === 'library' && (
                  <TrainingLibrary 
                    courses={db.courses}
                    onAddCourse={handleAddCourse}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                  />
                )}

                {activeTab === 'nomination' && (
                  <NominationForm 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    onNominateTrainee={handleNominateTrainee}
                    onRemoveNomination={handleRemoveNomination}
                  />
                )}

                {activeTab === 'attendance' && (
                  <AttendanceSheet 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    onSaveAttendance={handleSaveAttendance}
                  />
                )}

                {activeTab === 'unit-stats' && (
                  <UnitStatsAnalysis 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    postMarks={db.postMarks}
                  />
                )}

                {activeTab === 'post' && (
                  <PostAssessment 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    feedbacks={db.feedbacks}
                    postMarks={db.postMarks}
                    questions={db.questions || []}
                    onAddFeedback={handleAddFeedback}
                    onSaveMarks={handleSaveMarks}
                    onSaveQuestion={handleSaveQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                  />
                )}

                {activeTab === 'reports' && (
                  <TrainingReports 
                    courses={db.courses}
                    employees={db.employees}
                    events={db.events}
                    feedbacks={db.feedbacks}
                    postMarks={db.postMarks}
                    individualPre={db.individualPre}
                  />
                )}
              </div>
            </main>
          </div>

          {/* SIMULATED BOTTOM TABS BAR IN ANDROID (Mobile packaged navigation layout with full touch targets) */}
          <div className="absolute bottom-5 left-0 right-0 h-[52px] bg-slate-950 border-t border-slate-900 flex items-center justify-around px-2.5 z-40 shadow-xl">
            {tabs.slice(0, 5).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-12 h-10 rounded-xl transition-all cursor-pointer ${
                    isActive ? 'text-sky-400 font-extrabold scale-110' : 'text-slate-450 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[7.5px] mt-0.5 max-w-[50px] font-sans truncate tracking-wider uppercase font-bold text-center leading-none">
                    {tab.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
            
            {/* Extended menu options popup */}
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="bg-slate-900 text-slate-300 rounded-lg text-[8px] font-bold uppercase tracking-wider py-1 px-1.5 border border-slate-800 outline-none w-14 cursor-pointer text-center"
              title="More L&D Operations modules"
            >
              <option disabled value="">More</option>
              {tabs.slice(5).map(tab => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>

          {/* SIMULATED GESTURE INDICATOR PILL */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1/3 h-[4px] bg-slate-650 rounded-full z-50 pointer-events-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row" id="app-root">
      
      {/* Mobile Top Branding Roster with AGI Denim Logo */}
      <header className="flex md:hidden items-center justify-between bg-slate-950 text-white px-4 py-2 border-b border-slate-900 no-print shrink-0 shadow-md">
        <div className="flex items-center space-x-2">
          <AgiDenimLogo size="xs" theme="dark" className="flex-row items-center gap-1.5" />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsApkMode(true)}
            className="text-[9px] font-extrabold text-emerald-450 hover:text-white border border-emerald-900/40 bg-emerald-950/40 px-2 py-1 rounded-lg cursor-pointer transition-all animate-pulse"
          >
            📱 APK
          </button>
          
          <button
            onClick={handleClearData}
            className="text-[9px] font-bold text-red-400 hover:text-red-300 border border-red-950 px-2 py-1 rounded bg-slate-900 cursor-pointer transition-colors"
          >
            Make Data Zero
          </button>
          <button
            onClick={handleResetData}
            className="text-[9px] font-bold text-slate-400 hover:text-white border border-slate-850 px-2 py-1 rounded bg-slate-900 cursor-pointer transition-colors"
          >
            Reset Specs
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Navigation Tabs (only on smaller screens) */}
      <div className="flex md:hidden bg-slate-950 text-white px-2 py-1.5 overflow-x-auto gap-1 border-b border-slate-900 no-print shrink-0 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                isActive ? 'bg-blue-600 text-white shadow-md font-bold' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Desktop Sidebar with AGI Denim corporate branding */}
      <aside className="hidden md:flex w-64 bg-slate-950 flex-shrink-0 flex-col border-r border-slate-900 no-print">
        {/* Branding header in Sidebar using AGI Denim customized Logo component */}
        <div className="p-5 border-b border-slate-900 bg-slate-1000/30">
          <AgiDenimLogo size="sm" theme="dark" className="mr-auto items-start text-left" />
        </div>

        {/* Navigation list in sidebar */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer font-medium ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 font-bold scale-[1.01]' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile Section at bottom of sidebar */}
        <div className="p-4 border-t border-slate-900 bg-slate-1000/40">
          {user ? (
            <div className="bg-slate-900 rounded-2xl p-3 flex flex-col gap-2 border border-slate-800/30">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full object-cover shrink-0 border border-blue-500/50" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-sm shadow-blue-900/30">
                    {user.displayName?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <p className="text-xs text-slate-100 font-bold truncate">{user.displayName || "L&D User"}</p>
                  <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block shrink-0" />
                    <span>Firebase Synced</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => logoutUser()}
                className="w-full text-center text-[10px] text-slate-400 font-bold tracking-wider hover:text-white bg-slate-850 hover:bg-slate-800 py-1 rounded-lg transition-colors cursor-pointer border border-slate-800"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 hover:bg-slate-855 rounded-2xl p-3 flex flex-col gap-2 border border-slate-800/30">
              <p className="text-[10px] text-slate-400 font-bold text-center leading-normal">Operational records are stored locally.</p>
              <button 
                onClick={() => loginWithGoogle()}
                className="w-full text-center text-xs text-white font-black bg-blue-600 hover:bg-blue-700 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/20"
              >
                <span>🌐</span>
                <span>Connect Firebase</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full relative">
        
        {/* Desktop Top Header Bar with AGI Denim Mode selector and branding overview */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0 no-print">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight font-sans">L&D Operational Dashboard</h2>
            <div className="h-4 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-550">
              <span className="text-blue-600">UNIT 01: QA & AUDITS</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {isSyncing && (
                <span className="text-[10px] text-blue-500 font-mono animate-pulse ml-2 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Synchronizing Firestore...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* TOGGLE FOR APK PREVIEW APP */}
            <button
              onClick={() => setIsApkMode(true)}
              className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold tracking-tight hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
              title="Preview LMS App under simulated Android APK packaging environment"
            >
              <span className="text-base">📱</span>
              <span>View APK Module</span>
            </button>

            <button
              onClick={handleClearData}
              className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Wipe database to zero to upload your own custom data"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-650" />
              <span>Make Data Zero</span>
            </button>

            <button
              onClick={handleResetData}
              className="bg-slate-100 text-slate-650 px-3 py-1.5 rounded-lg border border-slate-205 text-xs font-bold uppercase tracking-tight hover:bg-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Reset data back to preloaded defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            
            <button
              onClick={() => setActiveTab('nomination')}
              className="bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              New Nomination
            </button>
          </div>
        </header>

        {/* Dynamic scrollable canvas area for views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 pb-20">
          <div className="transition-opacity duration-200 mx-auto max-w-7xl w-full" id="current-active-view">
            
            {/* DYNAMIC TOP LOGO BRAND BOARD FOR EVERY PAGE CANVAS - Complying with "will be on top of every page" */}
            <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-center px-6 gap-3 no-print">
              <AgiDenimLogo size="xs" theme="light" className="flex-row items-center gap-2" />
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-black tracking-widest text-slate-400 font-mono leading-none">AGI DENIM L&D OPERATIONS DEPT</p>
                <p className="text-[9px] text-emerald-600 font-semibold uppercase flex items-center justify-center sm:justify-end gap-1 mt-1 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block" />
                  <span>ISO 9001 SYSTEM COMPLIANT</span>
                </p>
              </div>
            </div>

            {activeTab === 'overview' && (
              <DashboardOverview 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                individualPre={db.individualPre}
                departmentalPre={db.departmentalPre}
                feedbacks={db.feedbacks}
                postMarks={db.postMarks}
                onNavigate={setActiveTab}
                onQuickSchedule={() => {
                  setActiveTab('calendar');
                }}
                onAddEmployee={handleAddEmployee}
                onImportEmployees={handleImportEmployees}
                onImportCourses={handleImportCourses}
                onClearData={handleClearData}
                onResetData={handleResetData}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {activeTab === 'pre' && (
              <PreAssessment 
                employees={db.employees}
                individualPre={db.individualPre}
                departmentalPre={db.departmentalPre}
                onAddIndividual={handleAddIndividualPre}
                onAddDepartmental={handleAddDepartmentalPre}
                onEvaluateIndividual={handleEvaluateIndividual}
                onEvaluateDepartmental={handleEvaluateDepartmental}
              />
            )}

            {activeTab === 'skills' && (
              <SkillMatrix 
                courses={db.courses}
                employees={db.employees}
                skills={db.skills}
                events={db.events}
                postMarks={db.postMarks}
                onUpdateSkill={handleUpdateSkill}
              />
            )}

            {activeTab === 'calendar' && (
              <TrainingCalendar 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onUpdateEventStatus={handleUpdateEventStatus}
              />
            )}

            {activeTab === 'library' && (
              <TrainingLibrary 
                courses={db.courses}
                onAddCourse={handleAddCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
              />
            )}

            {activeTab === 'nomination' && (
              <NominationForm 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                onNominateTrainee={handleNominateTrainee}
                onRemoveNomination={handleRemoveNomination}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceSheet 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                postMarks={db.postMarks}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeTab === 'unit-stats' && (
              <UnitStatsAnalysis 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                postMarks={db.postMarks}
              />
            )}

            {activeTab === 'post' && (
              <PostAssessment 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                feedbacks={db.feedbacks}
                postMarks={db.postMarks}
                questions={db.questions || []}
                onAddFeedback={handleAddFeedback}
                onSaveMarks={handleSaveMarks}
                onSaveQuestion={handleSaveQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />
            )}

            {activeTab === 'reports' && (
              <TrainingReports 
                courses={db.courses}
                employees={db.employees}
                events={db.events}
                feedbacks={db.feedbacks}
                postMarks={db.postMarks}
                individualPre={db.individualPre}
              />
            )}
          </div>
        </main>
        
        {/* Floating live synchronization state badge (Design element) */}
        <div className="fixed bottom-4 right-6 bg-white shadow-xl hover:shadow-2xl border border-slate-200/80 rounded-full px-4 py-2 flex items-center gap-2 z-50 transition-all select-none no-print">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">Live L&D Sync Active</span>
        </div>

      </div>
    </div>
  );
}
