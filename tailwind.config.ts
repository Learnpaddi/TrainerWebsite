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
          primary: '#10233F',
          secondary: '#35506E',
          accent: '#0F6EFB',
          background: '#F3F7FC',
          surface: '#FFFFFF',
          text: '#102033',
          muted: '#69809A',
          success: '#138A65',
          warning: '#F29A2E',
          error: '#D64545',
          border: '#D9E3EF',
          sky: '#D9EEFF',
          navy: '#0D1B2A',
          mint: '#D8F7E8',
        },
        primary: '#0F6EFB',
        accent: '#12B3A8',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 50px rgba(15, 110, 251, 0.18)',
        panel: '0 24px 60px rgba(16, 32, 51, 0.08)',
      },
    },
  },
  plugins: [],
}
