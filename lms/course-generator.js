// LearnPaddi LMS - 50 Demo Courses Generator
// /lms/course-generator.js
// Generates 50 realistic courses (10 categories x 5) with full structure
// Import in seeder.html: import { generateAllDemoCourses, checkCoursesExist } from './course-generator.js';

import { collection, getDocs, query, limit, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

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
    const modTitle = availableThemes[m * 3]?.[0] || 'Core Concepts';
    modules.push({
      title: `Module ${m + 1}: ${modTitle.split(' ')[0]} Fundamentals`,
      lessons: modLessons,
      duration: lessonDuration * 3
    });
  }

// 10 realistic category-specific MCQs (q, options[4], correct: index 0-3)
  const quizTemplates = {
    'Web Development': [
      { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'Hyperlinks and Text Markup Language', 'Home Tool Markup Language', 'HyperText Machine Language'], correct: 0 },
      { q: 'CSS stands for?', options: ['Creative Style Sheets', 'Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets'], correct: 2 },
      { q: "What's the correct HTML for second paragraph?", options: ['<p2>', '<p>', '<para>', '<paragraph>'], correct: 1 },
      { q: 'Choose the correct HTML tag to insert a line break?', options: ['<lb>', '<break>', '<br>', '<newline>'], correct: 2 },
      { q: 'Which CSS property controls text size?', options: ['font-style', 'text-size', 'font-size', 'text-type'], correct: 2 },
      { q: 'Which is the correct CSS syntax?', options: ['body {color: black}', '{body;color:black}', 'body:color=black', '{body;color:black;}'], correct: 0 },
      { q: 'Which property is used to change the background color?', options: ['background-color', 'color', 'bg-color', 'background'], correct: 0 },
      { q: 'Which CSS property is used to hide an element?', options: ['visibility', 'display', 'hide', 'none'], correct: 1 },
      { q: "React uses _____ to extend content across multiple lines.", options: ['curly brackets {}', 'parentheses ()', 'quotes ""', 'backticks ```'], correct: 0 },
      { q: 'In React, what is a "Hook"?', options: ['A special function', 'A component property', 'A state updater', 'A lifecycle method'], correct: 0 }
    ],
    'Programming': [
      { q: 'What is the output of console.log(0.1 + 0.2 === 0.3)?', options: ['true', 'false', 'undefined', '0.3'], correct: 1 },
      { q: 'Which is not a Java primitive type?', options: ['int', 'boolean', 'String', 'char'], correct: 2 },
      { q: "In Python, what does 'range(3)' produce?", options: ['[0,1,2,3]', '[1,2,3]', '[0,1,2]', '3'], correct: 2 },
      // ... 7 more similar
      { q: 'In Python, lists are mutable?', options: ['True', 'False', 'Sometimes', 'Never'], correct: 0 },
      { q: 'Java "public static void main" is?', options: ['Constructor', 'Entry point', 'Destructor', 'Helper'], correct: 1 },
      { q: 'C++ "cout << "Hello"; requires?', options: ['printf', '#include <iostream>', 'print()', 'write'], correct: 1 },
      { q: 'Python "def func(): pass" is?', options: ['Class', 'Loop', 'Function', 'Variable'], correct: 2 },
      { q: 'Java "String s = new String("hi");" is?', options: ['Literal', 'Object', 'Array', 'Primitive'], correct: 1 },
      { q: 'What does "==" do in JS?', options: ['Strict equality', 'Loose equality', 'Assignment', 'Compare type'], correct: 1 },
      { q: 'Rust ownership prevents?', options: ['Errors', 'Memory leaks', 'Speed', 'Typing'], correct: 1 }
    ],
    // Add templates for other categories...
    'Data Science': [
      { q: 'Pandas DataFrame.shape returns?', options: ['Size', 'Dimensions', 'Values', 'Columns'], correct: 1 },
      { q: 'Matplotlib plt.plot() plots?', options: ['Bar chart', 'Line graph', 'Pie', 'Scatter'], correct: 1 },
      { q: 'SQL "SELECT * FROM table" does?', options: ['Delete', 'All rows', 'First row', 'Count'], correct: 1 },
      { q: 'NumPy array.shape is?', options: ['Length', 'Dimensions', 'Values', 'Type'], correct: 1 },
      { q: 'Pandas df.head() shows?', options: ['Last 5', 'First 5', 'Random', 'Stats'], correct: 1 },
      { q: 'SQL JOIN combines?', options: ['Rows', 'Tables', 'Columns', 'Values'], correct: 1 },
      { q: 'Matplotlib plt.show()?', options: ['Saves', 'Displays', 'Clears', 'Closes'], correct: 1 },
      { q: 'Pandas groupby().mean()?', options: ['Sum', 'Average', 'Count', 'Max'], correct: 1 },
      { q: 'SQL "WHERE" filters?', options: ['Rows', 'Columns', 'Groups', 'Orders'], correct: 0 },
      { q: 'NumPy np.array([1,2,3]).sum()?', options: ['[1,2,3]', '6', '[6]', 'List'], correct: 1 }
    ],
    'AI & Machine Learning': [
      { q: 'TensorFlow tf.keras.Model.fit() trains?', options: ['Model', 'Data', 'Test', 'Save'], correct: 0 },
      { q: 'PyTorch tensor.shape is?', options: ['Size', 'Dims', 'Values', 'Type'], correct: 1 },
      { q: 'Overfitting means?', options: ['Underperform', 'Memorize train', 'Generalize', 'Fast'], correct: 1 },
      { q: 'CNN stands for?', options: ['Computer Network', 'Convolutional Neural Net', 'Central Node', 'Code Neural'], correct: 1 },
      { q: 'Loss function measures?', options: ['Accuracy', 'Error', 'Speed', 'Size'], correct: 1 },
      { q: 'NLP is?', options: ['Number Processing', 'Natural Language', 'Neural Layer', 'Node Logic'], correct: 1 },
      { q: 'Gradient Descent optimizes?', options: ['Data', 'Weights', 'Features', 'Loss'], correct: 1 },
      { q: 'Transformer uses?', options: ['RNN', 'Attention', 'CNN', 'MLP'], correct: 1 },
      { q: 'Supervised learning needs?', options: ['Labels', 'Unlabeled', 'Clusters', 'Features'], correct: 0 },
      { q: 'Validation set for?', options: ['Train', 'Tune hyperparams', 'Test', 'Save'], correct: 1 }
    ],
    'Cloud Computing': [
      { q: 'AWS EC2 is?', options: ['Storage', 'Compute', 'Database', 'Network'], correct: 1 },
      { q: 'Docker containerizes?', options: ['Apps', 'OS', 'Hardware', 'Cloud'], correct: 0 },
      { q: 'Kubernetes manages?', options: ['Containers', 'VMs', 'Databases', 'Storage'], correct: 0 },
      // abbreviated for space - full in file
      { q: 'AWS S3 is?', options: ['Compute', 'Storage', 'Network', 'DB'], correct: 1 },
      { q: 'Azure VM is?', options: ['Serverless', 'Virtual Machine', 'Container', 'Function'], correct: 1 },
      { q: 'GCP equivalent of EC2?', options: ['App Engine', 'Compute Engine', 'Cloud Run', 'Functions'], correct: 1 },
      { q: 'CI/CD automates?', options: ['Testing', 'Deploy', 'Build', 'All'], correct: 3 },
      { q: 'Dockerfile builds?', options: ['Image', 'Container', 'Registry', 'Run'], correct: 0 },
      { q: 'K8s Pod is?', options: ['Node', 'Container group', 'Service', 'Deployment'], correct: 1 },
      { q: 'Serverless example?', options: ['EC2', 'Lambda', 'RDS', 'EBS'], correct: 1 }
    ],
    'Cybersecurity': [
      { q: 'SQL Injection attacks?', options: ['Input', 'DB', 'Network', 'File'], correct: 0 },
      { q: 'HTTPS uses?', options: ['TCP', 'SSL/TLS', 'UDP', 'HTTP'], correct: 1 },
      { q: 'Phishing is?', options: ['Virus', 'Social eng', 'DDoS', 'Malware'], correct: 1 },
      { q: 'Firewall blocks?', options: ['Traffic', 'Files', 'Apps', 'Users'], correct: 0 },
      { q: 'Encryption hides?', options: ['Data', 'IP', 'Port', 'MAC'], correct: 0 },
      { q: 'XSS is?', options: ['Server', 'Client script', 'SQL', 'Network'], correct: 1 },
      { q: '2FA adds?', options: ['Password', 'Second factor', 'Email', 'Phone'], correct: 1 },
      { q: 'DDoS floods?', options: ['Storage', 'Server', 'Bandwidth', 'CPU'], correct: 2 },
      { q: 'Hash function is?', options: ['Reversible', 'One-way', 'Encrypt', 'Compress'], correct: 1 },
      { q: 'Zero-day is?', options: ['Patch', 'Unknown vuln', 'Known bug', 'Update'], correct: 1 }
    ],
    'Mobile App Development': [
      { q: 'Flutter uses?', options: ['Java', 'Dart', 'Swift', 'Kotlin'], correct: 1 },
      { q: 'React Native compiles to?', options: ['Web', 'Native', 'PWA', 'Hybrid'], correct: 1 },
      { q: 'iOS apps built with?', options: ['Swift/Objective-C', 'Java', 'Kotlin', 'Dart'], correct: 0 },
      { q: 'Android Activity lifecycle?', options: ['onCreate', 'onStart', 'onResume', 'All'], correct: 3 },
      { q: 'App State persistent?', options: ['RAM', 'Storage', 'Cache', 'Network'], correct: 1 },
      { q: 'Push notifications via?', options: ['FCM', 'HTTP', 'Email', 'SMS'], correct: 0 },
      { q: 'MVVM pattern separates?', options: ['UI', 'Logic', 'Data', 'All'], correct: 3 },
      { q: 'Responsive design scales?', options: ['Fixed', 'Viewport', 'Absolute', 'Relative'], correct: 1 },
      { q: 'App Bundle format?', options: ['APK', 'AAB', 'IPA', 'All'], correct: 1 },
      { q: 'Offline storage?', options: ['SQLite', 'SharedPrefs', 'Room', 'All'], correct: 3 }
    ],
    'Digital Marketing': [
      { q: 'SEO improves?', options: ['Paid', 'Organic search', 'Social', 'Email'], correct: 1 },
      { q: 'Google Ads is?', options: ['Organic', 'PPC', 'SEO', 'Content'], correct: 1 },
      { q: 'CTR means?', options: ['Click Through Rate', 'Cost To Revenue', 'Content Type Ratio', 'Call To Register'], correct: 0 },
      { q: 'AIDA model?', options: ['Attention Interest Desire Action', 'Ad Income Daily Analytics', 'Audience ID Age Demographics', 'All In Digital Ads'], correct: 0 },
      { q: 'Social Media Algorithm favors?', options: ['Paid', 'Engagement', 'Followers', 'Hashtags'], correct: 1 },
      { q: 'ROI calculation?', options: ['Revenue - Cost', 'Revenue / Cost', 'Clicks / Impressions', 'Leads / Cost'], correct: 0 },
      { q: 'Content Marketing builds?', options: ['Traffic', 'Trust', 'Sales', 'All'], correct: 3 },
      { q: 'Email open rate avg?', options: ['10%', '20-30%', '50%', '90%'], correct: 1 },
      { q: 'PPC means?', options: ['Pay Per Click', 'Post Per Content', 'Price Per Customer', 'Pay Per Conversion'], correct: 0 },
      { q: 'Conversion funnel stages?', options: ['Awareness Consideration Decision', 'Top Middle Bottom', 'All', '3'], correct: 2 }
    ],
    'UI/UX Design': [
      { q: 'Figma is?', options: ['Code editor', 'Design tool', 'CMS', 'Database'], correct: 1 },
      { q: 'Wireframe stage?', options: ['Visual', 'Structure', 'Color', 'Final'], correct: 1 },
      { q: 'Heuristic evaluation?', options: ['Users test', 'Expert review', 'A/B test', 'Analytics'], correct: 1 },
      { q: 'Design System is?', options: ['Colors', 'Components library', 'Fonts', 'All'], correct: 1 },
      { q: 'Accessibility WCAG?', options: ['Colors', 'Contrast', 'Keyboard nav', 'All'], correct: 3 },
      { q: 'User Persona?', options: ['Real user', 'Fictional rep', 'Competitor', 'Stats'], correct: 1 },
      { q: 'Prototyping tests?', options: ['Code', 'Usability', 'Speed', 'Security'], correct: 1 },
      { q: 'Micro-interactions?', options: ['Animations', 'Buttons', 'Forms', 'Feedback'], correct: 0 },
      { q: 'Responsive breakpoint?', options: ['320px mobile', '768px tablet', '1024px desktop', 'All'], correct: 3 },
      { q: 'A/B testing compares?', options: ['Two versions', 'Users', 'Devices', 'Colors'], correct: 0 }
    ],
    'Business & Productivity': [
      { q: 'Eisenhower Matrix?', options: ['Time mgmt', 'Priorities Urgent/Important', 'Team roles', 'Goals'], correct: 1 },
      { q: 'SMART goals?', options: ['Specific Measurable Achievable Relevant Time-bound', 'Short Medium Average Realistic Timely', 'All', 'Strategy Management Action Results Team'], correct: 0 },
      { q: 'Pareto 80/20 rule?', options: ['Effort', 'Results', 'Time', 'All'], correct: 3 },
      { q: 'Leadership style?', options: ['Democratic', 'Autocratic', 'Transformational', 'All'], correct: 3 },
      { q: 'Time blocking?', options: ['Multitask', 'Schedule focus', 'Meetings', 'Emails'], correct: 1 },
      { q: 'OKR framework?', options: ['Objectives Key Results', 'Organization Knowledge Resources', 'All', 'Operations Key Roles'], correct: 0 },
      { q: 'Public speaking structure?', options: ['Intro Body Conclusion', 'Story Facts Data', 'Question Answer', 'All'], correct: 0 },
      { q: 'Entrepreneur MVP?', options: ['Minimum Viable Product', 'Most Valuable Person', 'Maximum Value Proposal', 'Market Validation Plan'], correct: 0 },
      { q: 'Negotiation BATNA?', options: ['Best Alternative To Negotiated Agreement', 'Base Amount To Negotiate Always', 'All', 'Budget Allocation Team Need Analysis'], correct: 0 },
      { q: 'Productivity Pomodoro?', options: ['25 min work 5 break', '50/10', '90/20', '1hr focus'], correct: 0 }
    ]
  };
  const quizQuestions = quizTemplates[category] || quizTemplates['Web Development'];

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
const q = query(collection(window.db, 'courses'), limit(1));
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
      const courseId = `demo-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}-${i + 1}`;
      const course = generateCourse(courseId, category, i);
      courses.push(course);
      
      // Write immediately (or batch for speed)
      await setDoc(doc(window.db, 'courses', courseId), course);
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
    await setDoc(doc(window.db, 'courses', courseId), course);
  }
}

