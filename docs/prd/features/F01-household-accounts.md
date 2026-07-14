# F01 — Household accounts & membership

**Status:** ready-for-build  
**Priority:** P0  
**Depends on:** none  
**Master PRD:** ../MASTER_PRD.md  

## 1. Problem
Two adults need one shared household space with secure, low-friction access (magic link). Without this, no shared data exists.

## 2. User stories
- As an adult, I want to sign in with a magic link so I don't manage passwords.
- As household creator, I want to invite my partner by email so we share one calendar space.
- As a member, I want only our household data visible.

## 3. Functional requirements
1. Magic-link auth via Supabase Auth (email OTP / magic link).
2. On first login: if user has no household, prompt **Create household** (name default "Our Home").
3. Creator is `role=owner`. Can invite second adult by email → `role=adult` when they accept.
4. v1 max 2 adults (enforce in app logic; schema may allow more later).
5. Each user belongs to exactly one household in v1.
6. Session persists across browser restarts (Supabase session).
7. Sign out clears session.
8. Protected routes redirect unauthenticated users to `/login`.
9. Invite flow: generate invite token or use Supabase invite; invitee joins existing household.

## 4. UX
- `/login` — email field, “Send magic link”, success state.
- `/onboarding` — create household OR enter invite code/link.
- `/settings/household` — members list, invite form, leave (if not sole owner).
- Empty/error: invalid email, expired link, already in household.

## 5. Data model
```ts
// households: id uuid pk, name text, created_at
// profiles: id uuid pk references auth.users, display_name text, email text, color text, created_at
// household_members: household_id, user_id, role enum('owner','adult'), joined_at, unique(user_id) // one household v1
// invites: id, household_id, email, token, expires_at, accepted_at null
```
RLS: members only see their household rows.

## 6. API
- Supabase Auth magic link
- Server actions / route handlers: createHousehold, inviteMember, acceptInvite, getMyMembership

## 7. Business rules
- Cannot invite if household already has 2 adults.
- Owner cannot leave if another adult exists without transfer (v1: block leave).

## 8. Edge cases
- Magic link opened on different device; expired link; invite to existing user already in another household; concurrent create.

## 9. Acceptance criteria
- [ ] Magic link login works in local env with Supabase
- [ ] Create household assigns owner
- [ ] Invite + accept joins second adult
- [ ] RLS blocks cross-household reads
- [ ] Unauthenticated users cannot access `/app/*`
- [ ] Test: `npm test` or smoke script for auth helpers

## 10. Out of scope
Kids accounts, multi-household, OAuth providers (except future).

## 11. Open questions
None blocking.

## 12. Grok Build notes
- Paths under `/home/carl/Projects/household-calendar`
- Use `@supabase/ssr` + `@supabase/supabase-js`
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Do not ask for confirmation; implement + test
