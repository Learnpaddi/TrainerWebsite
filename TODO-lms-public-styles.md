# LMS Styles + Public Pages Bridge - TODO

## Status: Planning ✅

**Goal**: Adapt public pre-login pages (index.html, login.html, register.html, aboutus.html, careers.html, contact.html) to use LMS styles/header for seamless transition.

### Steps:
1. [x] **css/lms.css**: Add `.public-mode` support (hide sidebar, full-width main).
2. [x] **lms/_header.html**: Detect public mode (no sidebar/auth), adjust topbar.
3. [x] **Public pages**: Add LMS header fetch + lms.css link + .public-mode class.
   - index.html ✅
   - login.html ✅, register.html ✅
   - aboutus.html ✅, careers.html ✅, contact.html ✅
4. [ ] **Redirects**: Post-auth → lms/dashboard.html (already in scripts).
5. [ ] **Test**: `npx live-server .` check public → login → LMS flow.
6. [ ] **Demo**: `open index.html` + `open lms/dashboard.html`.

### Progress Tracking:
- Batch 1-2 complete: Core public (index/login/register) adapted.
- Next batch: aboutus/careers/contact.

### Progress Tracking:
- Planning complete.
- Next: Implement css/lms.css public-mode.

**Ready for batch edits after confirmation.**
