# F11 — PWA / offline / iPhone delivery

**Status:** ready-for-build  
**Priority:** P0  
**Depends on:** app shell  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Both users are on iPhone; product must feel installable and usable without App Store for v1.

## 2. Functional requirements
1. Valid Web App Manifest: name Duet, theme color, icons 192/512, display standalone.
2. Service worker via next-pwa or Serwist: precache shell; runtime cache for GET APIs carefully.
3. “Add to Home Screen” guidance banner on iOS Safari when not standalone.
4. Viewport safe-area padding for notch/home indicator.
5. Offline: show cached shell + last data; banner “You’re offline”.
6. Web Push best-effort (may not work locked iOS); never block core UX.
7. Email reminders as reliable path for v1 (Resend or Supabase edge + SMTP later).

## 3. Acceptance criteria
- [ ] Lighthouse PWA installable on desktop Chrome
- [ ] Manifest serves at /manifest.webmanifest
- [ ] iOS Safari: instruction sheet for Add to Home Screen
- [ ] Standalone mode hides browser chrome (display-mode media query styles)

## 4. Out of scope
App Store, APNs, widgets (phase 2+).
