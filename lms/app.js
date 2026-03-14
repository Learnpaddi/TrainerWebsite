// LMS App Core - Routing, Auth Guard, UI Utils
// /lms/app.js

import * as firebase from './firebase.js';

// Simple Hash Router
const routes = {
  '/': '/lms/index.html',
  '/auth': '/lms/auth.html',
  '/dashboard': '/lms/dashboard.html',
  '/course/:id': '/lms/course.html',
  '/admin': '/lms/admin.html',
  '/verify': '/lms/verify.html'
};

function router() {
  const path = window.location.hash.slice(1) || '/';
  const route = routes[path.split('/')[0]] || '/lms/index.html';
  loadPage(route);
}

function loadPage(url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
      initPage();
    });
}

// Auth Guard
firebase.onAuthChange(async (user) => {
  const navUser = document.getElementById('nav-user');
  if (user) {
    if (navUser) navUser.textContent = user.displayName || user.email;
    // Hide login, show dashboard link
    toggleAuthUI(false);
  } else {
    toggleAuthUI(true);
  }
  router(); // Re-route on auth change
});

function toggleAuthUI(showLogin) {
  const loginLinks = document.querySelectorAll('.login-link');
  const dashboardLinks = document.querySelectorAll('.dashboard-link');
  loginLinks.forEach(l => l.style.display = showLogin ? 'block' : 'none');
  dashboardLinks.forEach(l => l.style.display = showLogin ? 'none' : 'block');
}

// Init current page scripts
function initPage() {
  // Re-init modals, etc.
  if (window.location.hash.includes('auth')) initAuth();
  if (window.location.hash.includes('dashboard')) initDashboard();
  // etc.
}

// UI Utils
export function showModal(id) {
  document.getElementById(id).classList.add('show');
}

export function hideModal(id) {
  document.getElementById(id).classList.remove('show');
}

export function showNotification(msg, type = 'success') {
  // Toast notification
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Event Listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Navbar click handlers (delegate)
document.addEventListener('click', (e) => {
  if (e.target.matches('.nav-login')) window.location.hash = '/auth';
  if (e.target.matches('.nav-dashboard')) window.location.hash = '/dashboard';
  if (e.target.matches('.nav-logout')) firebase.logout();
});

// Export for pages
window.appUtils = { showModal, hideModal, showNotification };
