// Admin Guard - Extends LMS guard for admin/ paths
// Loads from lms/guard.js base logic

(async () => {
  if (window.location.pathname.startsWith('/admin/')) {
    try {
      const { auth, onAuthChange, isAdmin } = await import('../lms/firebase.js');
      onAuthChange(async (user) => {
        window.currentUser = user;
        
        if (!user) {
          window.location.href = '../login.html';
          return;
        }
        
        if (!isAdmin(user.email)) {
          window.location.href = '../lms/dashboard.html';
          return;
        }
        
        // Load user doc
        const { getUserDoc } = await import('../lms/firebase.js');
        window.currentUserDoc = await getUserDoc(user.uid);
        
        // Trigger admin page init
        if (window.initApp) window.initApp(user);
        
      });
    } catch (error) {
      console.error('Admin guard failed:', error);
      window.location.href = '../login.html';
    }
  }
})();

