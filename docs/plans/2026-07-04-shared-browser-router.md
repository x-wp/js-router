# Shared Browser Router Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the UMD/browser API reuse one global `window.wpRouter` registration surface while automatically firing only newly registered route handlers.

**Architecture:** Extend `WpRouter` so a route key can hold multiple route factories, each with its own instance and fired-event state. Update the browser entry to expose a callable shared API that reuses an existing compatible global and registers routes without replacing shared state.

**Tech Stack:** TypeScript, Jest, Rollup UMD output.

---

### Task 1: Shared Route Registrations

**Files:**
- Modify: `tests/wp-router.test.ts`
- Modify: `lib/wp-router.ts`
- Modify: `lib/interfaces/class-list.interface.ts`
- Modify: `lib/interfaces/route-list.interface.ts`

**Step 1: Write failing tests**

Add tests proving that `register()` allows multiple handlers for the same route key, `loadEvents()` fires each registration only once, and old handlers are not re-fired after later registrations.

**Step 2: Run tests to verify failure**

Run: `npm test -- tests/wp-router.test.ts`
Expected: FAIL because `register()` does not exist and duplicate route registrations are not supported.

**Step 3: Implement route registrations**

Represent registered route handlers as per-route arrays. Store each registration's factory, optional instance, and fired event flags. Add `register(routes)`, update `fire()` to run pending handlers for a route/event, and keep constructor compatibility by registering initial routes.

**Step 4: Run tests to verify pass**

Run: `npm test -- tests/wp-router.test.ts`
Expected: PASS.

### Task 2: Browser Shared Global

**Files:**
- Modify: `tests/browser.test.ts`
- Modify: `lib/browser.ts`

**Step 1: Write failing tests**

Add tests proving that the browser default export returns a callable shared API, auto-loads newly registered routes, and reuses an existing compatible global instead of replacing it.

**Step 2: Run tests to verify failure**

Run: `npm test -- tests/browser.test.ts`
Expected: FAIL because the browser entry currently creates a fresh `WpRouter` instance for every call.

**Step 3: Implement shared browser API**

Create a callable browser API with `register`, `loadEvents`, `fire`, and `router` properties. On each call, register routes and automatically load pending events. If `globalThis.wpRouter` already looks compatible, reuse it.

**Step 4: Run tests to verify pass**

Run: `npm test -- tests/browser.test.ts`
Expected: PASS.

### Task 3: Build Verification

**Files:**
- Verify generated artifacts only.

**Step 1: Run quality gates**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: PASS and UMD output assigns/reuses the shared browser API.

**Step 2: Inspect UMD wrapper**

Run: `sed -n '1,40p' dist/index.umd.js`
Expected: Browser global assignment still targets `wpRouter`; the exported function internally preserves an existing compatible global.
