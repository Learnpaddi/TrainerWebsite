// LMS Auth Guard - Modular Firebase
// Redirect unauth to /login.html

if (window.location.pathname.startsWith('/lms/') && window.location.pathname !== '/lms/login.html' && window.location.pathname !== '/lms/register.html') {
import('./firebase.js').then(({ auth, onAuthChange }) => {
    onAuthChange((user) => {
      if (!user) {
        window.location.href = '/login.html';
      }
    });
  }).catch(() => {
    // Fallback
  });
}

