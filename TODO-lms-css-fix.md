# LMS CSS Fix - Clear Tailwind Conflicts & Unify Styles

Status: Planning Complete ✅ | Execution: 0/6

## Plan Summary
Remove Tailwind CDN conflicts from auth/public pages. Port to css/lms.css + public-mode class.
- Files: lms/login.html, lms/register.html, index.html (root)
- Result: Consistent SaaS styling across public → LMS flow

## Step-by-Step Execution
- [x] **1. Create TODO.md** - Tracking file created
- [x] **2. Edit lms/login.html** - Removed Tailwind CDN, added lms.css link
- [x] **3. Edit lms/register.html** - Removed Tailwind CDN, added lms.css link
- [x] **4. Edit index.html (root)** - Removed Tailwind CDN, added lms.css + public-mode class
 - [x] **5. Update TODO-lms-public-styles.md** - Marked public styles integration complete
 - [ ] **6. Test** - Live-server running, verify styles flow
- [ ] **6. Test** - `npx live-server .` + verify flow (Ctrl+F5 cache clear)
- [ ] **7. Complete** - attempt_completion w/ demo command

**Next:** Parallel edits to login/register.html
