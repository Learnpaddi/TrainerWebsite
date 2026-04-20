export const demoCourses = [
  {
    title: 'Frontend Systems for Product Teams',
    description:
      'Ship polished React interfaces with component patterns, UX decision-making, and real delivery workflows.',
    price: 0,
    examAvailable: true,
    lessons: [
      { title: 'Designing resilient component APIs', duration: '18 min' },
      { title: 'State boundaries and data loading', duration: '22 min' },
      { title: 'Shipping accessible interactions', duration: '16 min' }
    ],
    exam: {
      title: 'Frontend Systems Assessment',
      timeLimitMinutes: 12,
      passingScore: 70,
      questions: [
        {
          prompt: 'Which pattern keeps data-fetching concerns isolated from presentational components?',
          options: ['Container and presentational split', 'Inline mutation everywhere', 'Duplicated request logic', 'Global DOM querying'],
          correctOption: 0,
        },
        {
          prompt: 'What is the main benefit of accessible button labeling?',
          options: ['Smaller bundles', 'Improved SEO only', 'Clear interaction for assistive tech users', 'Automatic backend validation'],
          correctOption: 2,
        },
        {
          prompt: 'Why should loading and error states be designed intentionally?',
          options: ['They never happen in production', 'They shape perceived reliability and clarity', 'They remove the need for APIs', 'They are required by MongoDB'],
          correctOption: 1,
        }
      ],
    },
  },
  {
    title: 'Node.js API Architecture Masterclass',
    description:
      'Build maintainable backend services with Express, MongoDB, authentication, payment flows, and domain-driven controllers.',
    price: 3999,
    examAvailable: true,
    lessons: [
      { title: 'Structuring controllers and services', duration: '24 min' },
      { title: 'Securing routes with JWT', duration: '19 min' },
      { title: 'Payment orchestration and webhooks', duration: '21 min' }
    ],
    exam: {
      title: 'Backend Architecture Exam',
      timeLimitMinutes: 15,
      passingScore: 75,
      questions: [
        {
          prompt: 'Which middleware concern should run before protected business controllers?',
          options: ['CSS minification', 'JWT authentication', 'Static image optimization', 'Tailwind compilation'],
          correctOption: 1,
        },
        {
          prompt: 'What should an enrollment record store for paid exam gating?',
          options: ['Only the course title', 'Only the user email', 'Progress and payment status', 'Client browser version'],
          correctOption: 2,
        },
        {
          prompt: 'Why verify a gateway signature server-side?',
          options: ['To trust payment completion securely', 'To change Tailwind themes', 'To create MongoDB indexes', 'To reduce question count'],
          correctOption: 0,
        },
        {
          prompt: 'What is the best response if a user completed a paid course but has not paid?',
          options: ['Allow the exam immediately', 'Delete the enrollment', 'Block exam access until payment succeeds', 'Reset course progress'],
          correctOption: 2,
        }
      ],
    },
  }
];
