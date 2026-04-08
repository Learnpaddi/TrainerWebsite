export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        corporate: {
          primary: '#1E293B',
          secondary: '#334155',
          accent: '#2563EB',
          background: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
        },
        primary: '#2563EB',
        accent: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
