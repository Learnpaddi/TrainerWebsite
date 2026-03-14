// Firebase Config & Utils for LearnPaddi LMS
// Place in /lms/firebase.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCPEap7ixlThhtBvPlUJaancN_hPsMNp8Q",
  authDomain: "learnpaddi-1aee9.firebaseapp.com",
  projectId: "learnpaddi-1aee9",
  storageBucket: "learnpaddi-1aee9.firebasestorage.app",
  messagingSenderId: "633908800301",
  appId: "1:633908800301:web:02bda958c51bf6b183c1a4"
};

// Initialize
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const ADMIN_EMAIL = 'thangadurai@learnpaddi.in';

// Providers
export const googleProvider = new GoogleAuthProvider();

// Auth Utils
export async function register(email, password, name) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setUserDoc(user.uid, { name, email });
    return user;
  } catch (error) {
    throw error;
  }
}

export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function googleLogin() {
  return await signInWithPopup(auth, googleProvider);
}

export async function logout() {
  await signOut(auth);
  window.location.href = '/login.html';
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// Firestore Utils
export async function setUserDoc(uid, data) {
  const role = data.email === ADMIN_EMAIL ? 'admin' : 'user';
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role,
    enrolledCourses: [],
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function getUserRole(uid) {
  const userDoc = await getUserDoc(uid);
  return userDoc?.role || 'user';
}

export async function getUserDoc(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

export async function enrollCourse(userId, courseId) {
  // Calculate totalLessons from course
  const totalLessons = await getTotalLessons(courseId);
  
  const enrollmentRef = await addDoc(collection(db, 'enrollments'), {
    userId,
    courseId,
    progress: 0,
    completed: false,
    quizUnlocked: false,
    completedLessons: [],
    totalLessons: totalLessons,
    quizAttempts: [],
    enrolledAt: serverTimestamp()
  });
  // Update user enrolledCourses
  await updateDoc(doc(db, 'users', userId), {
    enrolledCourses: arrayUnion(enrollmentRef.id)
  });
  return { id: enrollmentRef.id, totalLessons };
}

export async function updateProgress(enrollmentId, progress) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), { progress });
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

export async function getCourses() {
  const q = query(collection(db, 'courses'));
  const snapshot = await getDocs(q);
  let courses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  
  if (courses.length === 0) {
    console.log('No courses found. Auto-seeding samples...');
    const { sampleCourses } = await import('./sample-data.js');
    for (let course of sampleCourses.slice(0, 5)) {
      await addDoc(collection(db, 'courses'), course);
    }
    const newSnapshot = await getDocs(q);
    courses = newSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`Auto-seeded ${courses.length} courses!`);
  }
  return courses;
}

export async function getUserEnrollments(userId) {
  const q = query(collection(db, 'enrollments'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTotalLessons(courseId) {
  const courseSnap = await getDoc(doc(db, 'courses', courseId));
  if (!courseSnap.exists()) return 0;
  const course = courseSnap.data();
  return course.modules ? course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 1), 0) : 0;
}

export async function completeLesson(enrollmentId, lessonIndex) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    completedLessons: arrayUnion(lessonIndex)
  });
}

export async function unlockQuiz(enrollmentId) {
  await updateDoc(doc(db, 'enrollments', enrollmentId), { quizUnlocked: true });
}

// NEW: Get single enrollment
export async function getEnrollment(userId, courseId) {
  const q = query(
    collection(db, 'enrollments'), 
    where('userId', '==', userId),
    where('courseId', '==', courseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs[0] ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } : null;
}

// NEW: Enroll if not exists (idempotent)
export async function enrollIfNotExists(userId, courseId) {
  let enrollment = await getEnrollment(userId, courseId);
  if (!enrollment) {
    const newEnrollment = await enrollCourse(userId, courseId);
    enrollment = { id: newEnrollment.id, totalLessons: newEnrollment.totalLessons };
  }
  return enrollment;
}

// NEW: User certificates
export async function getUserCertificates(userId) {
  const q = query(
    collection(db, 'certificates'), 
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// NEW: Generate certificate
export async function generateCertificate(userId, courseId, courseTitle, userName) {
  const certId = `cert-${userId}-${courseId}-${Date.now()}`;
  await setDoc(doc(db, 'certificates', certId), {
    certificateId: certId,
    userId,
    userName,
    courseId,
    courseTitle,
    issuedDate: serverTimestamp(),
    verified: true
  });
  return certId;
}

// NEW: Submit quiz results (7/10 = 70% pass)
export async function submitQuiz(enrollmentId, score, totalQuestions) {
  const percentage = (score / totalQuestions) * 100;
  const attempt = { score, percentage, timestamp: serverTimestamp() };
  await updateDoc(doc(db, 'enrollments', enrollmentId), {
    quizScore: percentage,
    quizAttempts: arrayUnion(attempt),
    completed: percentage >= 70,
    completedAt: percentage >= 70 ? serverTimestamp() : null
  });
  
  if (percentage >= 70) {
    const enrollmentSnap = await getDoc(doc(db, 'enrollments', enrollmentId));
    const enr = { id: enrollmentId, ...enrollmentSnap.data() };
    const courseSnap = await getDoc(doc(db, 'courses', enr.courseId));
    const course = courseSnap.data();
    const userSnap = await getDoc(doc(db, 'users', enr.userId));
    const userData = userSnap.data();
    const certId = await generateCertificate(enr.userId, enr.courseId, course.title, userData.name);
    return { passed: true, certId };
  }
  return { passed: false };
}


// Realtime Listeners
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function onCollectionSnapshot(col, callback) {
  return onSnapshot(collection(db, col), callback);
}

// Storage Utils
export async function uploadFile(path, file) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
