// Design system theme extracted from Home/Login
export default {
  colors: {
    primary: {
      50: '#eef2ff',
      500: '#6366f1',
      600: '#4f46e5',
    },
    indigo: {
      50: '#eef2ff',
      100: '#e0e7ff',
      600: '#4f46e5',
    },
    blue: {
      50: '#eff6ff',
      600: '#2563eb',
    },
    purple: {
      600: '#9333ea',
    },
    emerald: {
      500: '#10b981',
    },
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
    },
  },
  spacing: {
    container: 'max-w-7xl mx-auto px-6 py-12',
    section: 'mb-16',
    card: 'p-8',
  },
  radius: {
    card: 'rounded-3xl',
    button: 'rounded-3xl',
  },
  shadows: {
    card: 'shadow-xl',
    hover: 'shadow-2xl hover:shadow-3xl',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
} as const;

