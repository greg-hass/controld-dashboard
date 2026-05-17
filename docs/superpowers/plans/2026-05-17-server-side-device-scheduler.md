# Server-Side Device Scheduler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a device be soft-disabled for a chosen duration with the restore timer owned by the Docker container, not the browser.

**Architecture:** Add a tiny Node server to the production image that serves the built SPA, proxies `Control D` API traffic, and owns a persistent schedule store on disk. The React app will sync the API token to that local server, request temporary device disables/restores through it, and poll its schedule state so badges and countdowns survive refreshes and container restarts.

**Tech Stack:** Vite/React frontend, TypeScript, Node 20 built-in `http`/`fetch`, JSON file persistence, Docker, Dockge.

---

### Task 1: Add a local scheduler server

**Files:**
- Create: `app/server/control-d-server.mjs`
- Modify: `app/Dockerfile`
- Modify: `app/docker-compose.yml`
- Modify: `app/vite.config.ts`

- [ ] **Step 1: Write the server skeleton**

```js
import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
```

- [ ] **Step 2: Run it and verify the process starts**

Run: `node app/server/control-d-server.mjs`
Expected: server listens on a local port and serves a health endpoint.

- [ ] **Step 3: Implement production container startup**

```dockerfile
CMD ["node", "/app/server/control-d-server.mjs"]
```

- [ ] **Step 4: Verify build still succeeds**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/server/control-d-server.mjs app/Dockerfile app/docker-compose.yml app/vite.config.ts
git commit -m "feat: add container scheduler server"
```

### Task 2: Move temporary disable/restore into the server

**Files:**
- Modify: `app/src/store/appStore.ts`
- Modify: `app/src/screens/Devices.tsx`
- Create: `app/src/services/scheduler.ts`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Add client helpers for scheduler endpoints**

```ts
export async function disableDeviceTemporarily(deviceId: string, durationMinutes: number) { ... }
```

- [ ] **Step 2: Wire token sync on app startup and save**

```ts
useEffect(() => {
  syncSchedulerToken(settings.apiToken);
}, [settings.apiToken]);
```

- [ ] **Step 3: Update the Devices card actions to call the scheduler service**

```tsx
<DropdownMenuItem onSelect={() => handleTempDisable(device.PK, device.name, minutes)}>
```

- [ ] **Step 4: Verify the UI still renders and the action menu works**

Run: `npm run build`
Expected: PASS, then check the Devices page in the browser.

- [ ] **Step 5: Commit**

```bash
git add app/src/store/appStore.ts app/src/screens/Devices.tsx app/src/services/scheduler.ts app/src/App.tsx
git commit -m "feat: route temporary device disable through server"
```

### Task 3: Persist and display scheduled pauses

**Files:**
- Modify: `app/src/store/appStore.ts`
- Modify: `app/src/screens/Devices.tsx`
- Modify: `app/src/screens/Settings.tsx`

- [ ] **Step 1: Load active schedules from the server**

```ts
await loadDeviceSchedules();
```

- [ ] **Step 2: Show countdown / restored state in the Devices UI**

```tsx
{suspension && <span>Resumes in {remainingLabel}</span>}
```

- [ ] **Step 3: Sync after a manual restore or a save**

```ts
await refreshDevices();
await loadDeviceSchedules();
```

- [ ] **Step 4: Verify schedules survive a browser refresh**

Run: open the app, pause a device, reload the page.
Expected: the pause still shows in the UI.

- [ ] **Step 5: Commit**

```bash
git add app/src/store/appStore.ts app/src/screens/Devices.tsx app/src/screens/Settings.tsx
git commit -m "feat: persist temporary device disables"
```

### Task 4: Verify the deployed image

**Files:**
- None

- [ ] **Step 1: Build the app**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 2: Verify browser behavior**

Run: open the Devices page and test a temporary disable.
Expected: the device goes soft-disabled immediately and restores on schedule.

- [ ] **Step 3: Push the branch**

Run: `git push origin main`
Expected: GH Actions publishes a new image.

