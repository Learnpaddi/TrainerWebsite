// Courses Utils - SHARED
// src/shared/firebase/courses.js

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  getDocs, 
  getDoc, 
  onSnapshot,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { db } from './config.js';
import { enrollCourse, getEnrollment, enrollIfNotExists } from './enrollments.js';
import { generateCertificate } from './certificates.js';

export async function getCourses() {
  const q = query(collection(db, 'courses'));
  const snapshot = await getDocs(q);
  let courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  if (courses.length === 0) {
    console.log('No courses found. Auto-seeding samples...');
    // Import sample data logic here if needed
  }
  return courses;
}

export async function createCourse(courseData) {
  return await addDoc(collection(db, 'courses'), { 
    ...courseData, 
    updatedAt: serverTimestamp() 
  });
}

export async function updateCourse(courseId, courseData) {
  await updateDoc(doc(db, 'courses', courseId), { 
    ...courseData, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteCourse(courseId) {
  await deleteDoc(doc(db, 'courses', courseId));
}

export async function getTotalLessons(courseId) {
  const courseSnap = await getDoc(doc(db, 'courses', courseId));
  if (!courseSnap.exists()) return 0;
  const course = courseSnap.data();
  return course.modules ? course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 1), 0) : 0;
}
