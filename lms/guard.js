// LMS Auth Guard - Modular Firebase
// Redirect unauth to /login.html

// Enhanced LMS Auth Guard with global currentUser
// Auto-protects all /lms/* pages except login/register

(async () => {
  if (!window.location.pathname.startsWith('/lms/') || 
      window.location.pathname === '/lms/login.html' || 
      window.location.pathname === '/lms/register.html') {
    return;
  }

  try {
    const { auth, onAuthChange, getUserDoc } = await import('./firebase.js');
    onAuthChange(async (user) => {
      window.currentUser = user;  // Global access
      
      if (!user) {
        window.location.href = '/login.html';
        return;
      }
      
      // Load user doc globally
      window.currentUserDoc = await getUserDoc(user.uid);
      console.log('Auth guard: User loaded', user.uid);
      
      // Admin portal protection
      if (window.location.pathname.startsWith('/admin/')) {
        const { isAdmin } = await import('./firebase.js');
        if (!isAdmin(user.email)) {
          window.location.href = window.currentUser ? '/lms/dashboard.html' : '/login.html';
          return;
        }
      }
      
      // Trigger app init if exists
      if (window.initApp) window.initApp(user);
    });
  } catch (error) {
    console.error('Guard init failed:', error);
    window.location.href = '/login.html';
  }
})();


