// LearnPaddi LMS - 50 Demo Courses Generator
// /lms/course-generator.js
// Generates 50 realistic courses (10 categories x 5) with full structure
// Import in seeder.html: import { generateAllDemoCourses, checkCoursesExist } from './course-generator.js';

import { db, doc, setDoc, serverTimestamp, collection, getDocs, query, limit } from './firebase.js';

const categories = [
  'Web Development', 'Programming', 'Data Science', 'AI & Machine Learning', 'Cloud Computing',
  'Cybersecurity', 'Mobile App Development', 'Digital Marketing', 'UI/UX Design', 'Business & Productivity'
];

const instructors = [
  'Ajitha S.', 'Anjali R.', 'Jothi K.', 'Saran M.', 'Thulasi V.', 'Ravi Kumar', 'Priya Sharma', 
  'Arun Patel', 'Meera Singh', 'Vikram Desai', 'Neha Gupta', 'Karthik Rao', 'Sneha Iyer', 'Devendra Joshi'
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const categoryTemplates = {
  'Web Development': {
    titles: ['HTML & CSS Fundamentals', 'JavaScript Mastery', 'React Complete Guide', 'Node.js & Express', 'Tailwind CSS Advanced'],
    lessonThemes: [
      [['HTML Basics', 'CSS Selectors', 'Responsive Design'], ['Flexbox', 'Grid Layout', 'Animations']],
      [['Variables & Functions', 'DOM Manipulation', 'Async JS'], ['ES6+ Features', 'Modules', 'Error Handling']],
      [['Components & Props', 'Hooks & State', 'Routing'], ['Context API', 'Redux', 'Performance']],
      [['REST APIs', 'Middleware', 'Authentication'], ['MongoDB', 'Deployment', 'Testing']]
    ]
  },
  'Programming': {
    titles: ['Python for Beginners', 'Java Fundamentals', 'C++ Mastery', 'GoLang Guide', 'Rust Programming'],
    lessonThemes: [
      [['Syntax Basics', 'Data Types', 'Control Flow'], ['Functions', 'Modules', 'File IO']],
      [['OOP Concepts', 'Collections', 'Exceptions'], ['Streams', 'Lambdas', 'Generics']]
    ]
  },
  'Data Science': {
    titles: ['Pandas & NumPy', 'Data Visualization with Matplotlib', 'SQL for Data Analysis', 'Machine Learning Basics', 'Big Data with Spark'],
    lessonThemes: [
      [['DataFrames', 'Cleaning', 'Indexing'], ['GroupBy', 'Merge', 'Visualization']]
    ]
  },
  'AI & Machine Learning': {
    titles: ['TensorFlow Fundamentals', 'PyTorch Guide', 'NLP with Transformers', 'Computer Vision', 'Reinforcement Learning'],
    lessonThemes: [
      [['Neural Networks', 'Training', 'Evaluation'], ['CNNs', 'Transfer Learning', 'Deployment']]
    ]
  },
  'Cloud Computing': {
    titles: ['AWS Certified Cloud Practitioner', 'Azure Fundamentals', 'Google Cloud Essentials', 'Docker & Kubernetes', 'DevOps CI/CD'],
    lessonThemes: [
      [['EC2 & S3', 'VPC Networking', 'IAM'], ['Lambda', 'RDS', 'CloudFormation']]
    ]
  },
  'Cybersecurity': {
    titles: ['Ethical Hacking Basics', 'Network Security', 'Penetration Testing', 'Cryptography', 'Incident Response'],
    lessonThemes: [
      [['Reconnaissance', 'Scanning', 'Exploitation'], ['Web Vulns', 'Password Cracking', 'Metasploit']]
    ]
  },
  'Mobile App Development': {
    titles: ['Flutter Cross-Platform', 'React Native Mobile', 'Swift iOS', 'Kotlin Android', 'Mobile UI/UX'],
    lessonThemes: [
      [['Widgets', 'State Management', 'Navigation'], ['Firebase Integration', 'Animations', 'Deployment']]
    ]
  },
  'Digital Marketing': {
    titles: ['SEO Fundamentals', 'Google Ads Mastery', 'Social Media Marketing', 'Content Strategy', 'Analytics & ROI'],
    lessonThemes: [
      [['Keyword Research', 'On-Page SEO', 'Technical SEO'], ['Link Building', 'Local SEO', 'Analytics']]
    ]
  },
  'UI/UX Design': {
    titles: ['Figma Prototyping', 'User Research Methods', 'Design Systems', 'Interaction Design', 'Accessibility'],
    lessonThemes: [
      [['Wireframing', 'Prototyping', 'Components'], ['User Flows', 'A/B Testing', 'Heuristics']]
    ]
  },
  'Business & Productivity': {
    titles: ['Career Skills Improvement', 'Leadership Mastery', 'Time Management Pro', 'Public Speaking', 'Entrepreneurship Basics'],
    lessonThemes: [
      [['Goal Setting', 'Resume Building', 'Interviews'], ['Negotiation', 'Networking', 'Personal Branding']]
    ]
  }
};

// Generate single course
function generateCourse(courseId, category, index = 0) {
  const template = categoryTemplates[category] || categoryTemplates['Web Development'];
  const title = template.titles[index % template.titles.length];
  const instructor = instructors[Math.floor(Math.random() * instructors.length)];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const lessonDuration = 25 + Math.floor(Math.random() * 25); // 25-50 mins
  const descriptions = {
    beginner: 'Perfect for complete beginners. No prior experience required.',
    intermediate: 'Build on basic knowledge with practical projects.',
    advanced: 'Deep dive into advanced concepts and best practices.'
  };

  // 3 modules x 3 lessons each
  const modules = [];
  let totalMinutes = 0;
  const availableThemes = template.lessonThemes.flat() || []; // Fallback

  for (let m = 0; m < 3; m++) {
    const modLessons = [];
    for (let l = 0; l < 3; l++) {
      const lessonTitle = availableThemes[m * 3 + l]?.[l] || `Lesson ${l + 1}`;
      const lessonDesc = `Learn ${lessonTitle.toLowerCase()} with hands-on examples and code walkthroughs.`;
      modLessons.push({
        title: lessonTitle,
        description: lessonDesc,
        duration: lessonDuration,
        videoUrl: `https://example.com/videos/${courseId}/m${m}l${l}.mp4` // Placeholder
      });
      totalMinutes += lessonDuration;
    }
    modules.push({
      title: `Module ${m + 1}: ${lessonTitle.split(' ')[0]} Fundamentals`,
      lessons: modLessons,
      duration: lessonDuration * 3
    });
  }

  // Simple quiz: 5 questions
  const quizQuestions = [
    { q: `What is the first topic in ${title}?`, options: ['Basics', 'Advanced', 'Project'], correct: 0 },
    { q: 'How many modules?', options: ['2', '3', '4'], correct: 1 },
    { q: `Best practice for ${category.toLowerCase()}?`, options: ['Plan', 'Copy', 'Skip'], correct: 0 },
    { q: 'Duration unit?', options: ['Hours', 'Seconds', 'Days'], correct: 0 },
    { q: 'Instructor role?', options: ['Teach', 'Watch', 'Ignore'], correct: 0 }
  ];

  const durationHours = Math.ceil(totalMinutes / 60);

  return {
    courseId,
    title,
    description: `${title}. ${descriptions[level.toLowerCase()]} ${Math.random() > 0.5 ? 'Includes projects, quizzes, and certificate.' : 'Hands-on coding and real-world examples.'}`,
    instructor,
    duration: `${durationHours} hours`,
    level,
    category,
    thumbnail: `https://picsum.photos/seed/${courseId}/600/400`,
    certificateEnabled: true,
    createdAt: serverTimestamp(),
    modules, // Matches course.html: array of {title, lessons?}, flatten if needed
    quiz: { questions: quizQuestions }
  };
}

// Check if demo courses exist
export async function checkCoursesExist() {
  const q = query(collection(db, 'courses'), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// Generate ALL 50 courses
export async function generateAllDemoCourses() {
  if (await checkCoursesExist()) {
    throw new Error('Courses already exist. Clear Firestore or rename.');
  }

  const courses = [];
  for (let catIndex = 0; catIndex < categories.length; catIndex++) {
    const category = categories[catIndex];
    for (let i = 0; i < 5; i++) {
      const courseId = `demo-${category.toLowerCase().replace(/ & /g, '').replace(/ /g, '-')}-${i + 1}`;
      const course = generateCourse(courseId, category, i);
      courses.push(course);
      
      // Write immediately (or batch for speed)
      await setDoc(doc(db, 'courses', courseId), course);
      console.log(`Generated: ${course.title} (${category})`);
    }
  }

  console.log('✅ Generated 50 demo courses!');
  return courses;
}

// For testing: generate single category
export async function generateCategoryCourses(category) {
  for (let i = 0; i < 5; i++) {
    const courseId = `demo-${category.toLowerCase().replace(/ /g, '-')}-${i + 1}`;
    const course = generateCourse(courseId, category, i);
    await setDoc(doc(db, 'courses', courseId), course);
  }
}

