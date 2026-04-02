// Enrollments Utils - SHARED
// src/shared/firebase/enrollments.js

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  arrayUnion,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from './config.js';
import { getTotalLessons } from './courses.js';
import { generateCertificate } from './certificates.js';
import { getUserDoc } from './users.js';

export async function enrollCourse(userId, courseId) {
  const totalLessons = await getTotalLessons(courseId);
  
  const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
    userId,
    courseId,
    progress: 0,
    completed: false,
    quizUnlocked: false,
    completedLessons: [],
    totalLessons,
    quizAttempts: [],
    enrolledAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, 'users', userId), {
    enrolledCourses: arrayUnion(enrollmentRef.id)
  });
  
  return { id: enrollmentRef.id, totalLessons };
}

export async function getEnrollment(userId, courseId) {
  const q = query(
    collection(db, 'enrollments'), 
    where('userId', '==', userId),
    where('courseId', '==', courseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}

export async function enrollIfNotExists(userId, courseId) {
  let enrollment = await getEnrollment(userId, courseId);
  if (!enrollment) {
    enrollment = await enrollCourse(userId, courseId);
  }
  return enrollment;
}

export async function updateProgress(enrollmentId, progress) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), { progress });
}

export async function completeLesson(enrollmentId, lessonIndex) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    completedLessons: arrayUnion(lessonIndex)
  });
}

export async function unlockQuiz(enrollmentId) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), { quizUnlocked: true });
}
