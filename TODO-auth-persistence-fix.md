# Auth Persistence Fix - TODO

## Steps

- [ ] 1. Edit `src/services/firebase/config.ts` — Add `setPersistence(auth, browserLocalPersistence)` and export `authReady` promise.
- [ ] 2. Edit `src/services/firebase/authService.ts` — Await `authReady` in `login()`, `googleSignIn()`, and `register()`.
- [ ] 3. Edit `src/hooks/useAuth.ts` — Add `authResolved` flag; prevent Firestore errors from nullifying user immediately.
- [ ] 4. Edit `src/components/ProtectedRoute.tsx` — Show error UI on `roleError` instead of redirecting.
- [ ] 5. Edit `src/App.tsx` — Change root `/` redirect from `/select-role?mode=login` to `/dashboard`.
- [ ] 6. Build/test to verify no TypeScript/lint errors.

