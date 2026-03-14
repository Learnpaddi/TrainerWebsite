// Sample Data Seeder for LearnPaddi LMS
// Run once to populate Firestore. Console in browser or Node.

import * as firebase from './firebase.js';

const sampleCourses = [
  {
    title: 'Career Skills Improvement',
    description: 'Master essential career growth skills for job readiness and leadership.',
    thumbnail: 'https://via.placeholder.com/400x240?text=Career+Skills',
    instructor: 'Ajitha S.',
    duration: '8 hours',
    level: 'Beginner',
    modules: [
      { title: 'Introduction to Career Planning', videoUrl: '', duration: 30 },
      { title: 'Leadership Fundamentals', videoUrl: '', duration: 45 },
      { title: 'Problem Solving Techniques', videoUrl: '', duration: 60 }
    ],
    quiz: {
      questions: [
        { q: 'What is the first step in career planning?', options: ['A) Set goals', 'B) Find job', 'C) Quit current'], correct: 'A' }
      ]
    },
    certificateEnabled: true
  },
  {
    title: 'Soft Skills Lab',
    description: 'Develop communication, teamwork, and emotional intelligence.',
    thumbnail: 'https://via.placeholder.com/400x240?text=Soft+Skills',
    instructor: 'Anjali R.',
    duration: '6 hours',
    level: 'Intermediate',
    modules: [ /* similar */ ],
    certificateEnabled: true
  },
  // Add Digital Literacy, Industry Connect...
];

async function seedData() {
  try {
    // Add courses
    for (let course of sampleCourses) {
      await firebase.db.collection('courses').add(course);
      console.log(`Added course: ${course.title}`);
    }
    // Add admin (replace with your UID after login)
    // await setDoc(doc(db, 'admins', 'admin1'), { email: 'admin@learnpaddi.in' });
    
    console.log('✅ Sample data seeded!');
  } catch (error) {
    console.error('Seed error:', error);
  }
}

// Run: seedData();
export { seedData, sampleCourses };
