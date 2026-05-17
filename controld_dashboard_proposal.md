# Control D Self-Hosted Dashboard — Proposal

## The Problem

Control D is a powerful DNS-based content filtering service, but it has a critical gap: **there is no native mobile or desktop app**. Every configuration change — whether it's blocking a new service, adjusting a family member's profile, or checking what's being filtered — requires opening a browser, navigating to the Control D website, logging in, and navigating through their web interface. For a personal/family user who might want to quickly toggle a restriction, check device status, or review what's being blocked, this friction adds up quickly. A self-hosted dashboard solves this by giving you a fast, dedicated interface that lives on your own infrastructure and talks directly to Control D's API.

---

## What the API Gives Us

After reviewing the full Control D API reference, here is everything we can tap into:

| API Section | Available Operations | Family Use Case |
|------------|---------------------|-----------------|
| **Profiles** | List, create, modify, delete profiles; manage filters (native & 3rd-party blocklists), services, custom rules, rule folders, default rules | Set up per-family-member profiles (e.g., "Kids," "Parents," "Guest") and toggle their restrictions |
| **Devices** | List, create, modify, delete endpoints (resolvers); view device types | See which devices are connected, assign profiles to devices, manage router/user endpoints |
| **Access** | List known IPs, learn new IPs, delete learned IPs | Monitor and manage which IP addresses are authorized to query your resolvers |
| **Services** | Browse service categories (social media, streaming, gaming, etc.) and toggle blocking per service | One-click block/unblock TikTok, YouTube, Netflix, Steam, etc. by category |
| **Analytics** | View log levels and storage regions | Understand what logging is enabled and where data is stored |
| **Account** | View user data and account info | Display account status, email, activity info |
| **Misc** | IP lookup, network stats across POPs | Show which datacenter is handling your DNS, view service health |

**Authentication** is straightforward: a Bearer token generated from the Control D dashboard with either **Read** or **Write** permissions. For a family dashboard, you'd want a **Write** token so the app can actually make changes.

---

## Proposed Dashboard: "Control D Home"

A clean, self-hosted web dashboard designed specifically for personal and family use. Think of it as a "mission control" for your home network's DNS filtering. Here are the key screens and features:

### 1. Overview / Home Screen
A quick-glance dashboard showing the state of your Control D setup at a glance:
- **Active profiles** with their current restriction level (strict, moderate, permissive)
- **Connected devices** and which profile each is using
- **Recently blocked services** or top blocked categories
- **Quick toggles** for common actions (e.g., "Turn on Kids Mode," "Block Social Media")
- **Account health** — token status, last sync time, any API errors

### 2. Profiles Manager
The heart of the dashboard. Control D profiles are how you apply different filtering rules to different people or devices.
- **List all profiles** with visual cards showing their configured restrictions
- **Edit a profile** — toggle native filters (malware, ads, trackers), manage 3rd-party blocklists, set the default rule (block/allow/bypass)
- **Service blocking per profile** — a visual grid of service categories (Social Media, Streaming, Gaming, Adult Content, etc.) with on/off toggles. Want to block TikTok and Instagram for the kids' profile? Two clicks.
- **Custom rules** — view, add, edit, and delete custom DNS rules (e.g., block `example.com` or redirect `old-router.local` to a new IP)
- **Rule folders** — organize custom rules into folders for easier management

### 3. Devices Screen
See and manage every device on your network that uses Control D:
- **Device list** with name, type (router, user device), assigned profile, and last activity
- **Reassign profiles** — move a device from one profile to another with a dropdown
- **Add new device** — generate a new resolver endpoint with a specific profile
- **Access IPs** — view the last 50 IPs that queried each device, authorize new IPs, revoke old ones

### 4. Services Directory
A browsable catalog of all the services Control D can block:
- **Category view** — browse by category (Social Media, Streaming, Communication, Games, etc.)
- **Search** — find a specific service quickly
- **Per-profile blocking** — see which services are blocked on which profiles, toggle directly from this view

### 5. Quick Actions / Focus Mode
A dedicated screen for common one-tap actions that families actually need:
- **"Dinner Time"** — temporarily block social media and streaming on kids' profiles for a set duration, then auto-restore
- **"Homework Mode"** — block games and social media, allow educational sites
- **"Bedtime"** — stricter blocking schedule (this would require scheduling logic in the dashboard)
- **"Guest Wi-Fi"** — quickly spin up a permissive profile and assign it to a guest device

### 6. Network Health
- **Current POP/datacenter** — which Control D location is handling your DNS
- **Network stats** — service availability across different points of presence
- **Response time indicators** — how fast your DNS queries are being resolved

---

## Technical Architecture

Since you want this self-hosted, here is a practical stack:

| Layer | Technology | Reasoning |
|-------|-----------|-----------|
| **Frontend** | React + TypeScript + Tailwind CSS | Modern, responsive, easy to maintain |
| **Backend / API Proxy** | Node.js/Express or Python/FastAPI | Proxies requests to Control D's API, handles auth, optional caching |
| **Authentication** | Simple session-based or API key | Since it's self-hosted, no complex auth needed — just secure the token |
| **Configuration** | Environment variables or config file | Store your Control D API token, dashboard settings |
| **Deployment** | Docker container | Single-command deploy: `docker run -p 3000:3000 -e CTRLD_TOKEN=xxx controld-home` |

**Why a backend proxy instead of calling Control D directly from the browser?** Two reasons: (1) you don't want to expose your API token in client-side JavaScript, and (2) a backend can cache responses (Control D doesn't have aggressive rate limits, but caching makes the dashboard feel snappier) and handle request batching.

---

## Feature Priority: MVP vs. Full Build

### MVP (Minimum Viable Product)
A useful dashboard you could start using immediately:
1. **Overview screen** — active profiles, device count, quick stats
2. **Profiles list** with basic details
3. **Service toggles** per profile — the most common family use case
4. **Devices list** with profile assignment
5. **Simple configuration** — enter your API token via UI or env var

### Full Build
Everything in the MVP plus:
1. **Custom rules management** — full CRUD for DNS rules
2. **Rule folders** — organize rules
3. **Access IP management** — view and manage authorized IPs
4. **Focus Mode / Quick Actions** — dinner time, homework mode, etc.
5. **Services directory** with search and browsable categories
6. **Network health screen**
7. **Dark mode** (because obviously)
8. **Profile creation/deletion**
9. **Device creation/deletion**
10. **Analytics/logging overview**

---

## What Makes This Worth Building

| Without Dashboard | With Dashboard |
|------------------|----------------|
| Open browser → navigate to controld.com → log in → navigate to profiles → find the right profile → scroll to services → toggle → save | Open dashboard → tap profile card → toggle service → done (3 seconds) |
| No visibility into what each family member's device is using | Instant view: "Kid's iPad is on 'Strict' profile, Living Room TV is on 'Standard'" |
| Want to block TikTok at dinner? Same multi-step web flow every time | One-tap "Dinner Mode" that blocks social media for 60 minutes, auto-restores |
| No easy way to see all your custom rules in one place | Full rule manager with search, folders, and quick edits |
| Adding a guest device means going through the web setup wizard | Quick device creation with QR code or copy-paste DNS settings |

---

## Next Steps

If this sounds useful, here's how we proceed:

1. **I can build the full dashboard** as a self-hosted web application with the complete feature set outlined above
2. **You provide your Control D API token** (Write permission) so the app can actually manage your profiles and devices
3. **I deliver** a Docker container you can run on any machine in your home network (Raspberry Pi, NAS, old laptop, cloud VM — whatever you prefer)
4. **You access it** at `http://your-machine:3000` from any device on your network

The dashboard would be designed specifically for the "family network admin" use case — clean, fast, mobile-friendly, and focused on the actions you actually do every day rather than every feature Control D supports.

Does this match what you had in mind? And would you like me to proceed with building it?
