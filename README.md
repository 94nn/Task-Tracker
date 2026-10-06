# Assignment Task Tracker

A calm, modern planner for university students. Track every assignment, break it into subtasks, watch deadlines, and see your overall progress at a glance. Sign in with Google to sync your work across devices. There is no server to run: it's a static site on GitHub Pages, with Firebase for accounts and storage.

**Live demo:** `https://USERNAME.github.io/REPOSITORY-NAME/`

## Features

- **Dashboard**: time-based greeting, live statistics (total, in progress, completed, overdue), a circular overall-progress ring with encouraging messages, upcoming deadlines and today's focus tasks
- **Assignments**: create, edit, duplicate, delete (with confirmation) and view details
- **Filters and search**: filter by status, priority and subject; sort by due date, priority, progress or recently added; search titles, subjects, descriptions and tags
- **Subtasks**: checklists with optional due dates, inline rename and delete. Progress is calculated automatically, and an assignment completes itself when every subtask is done
- **PDF attachments**: attach the brief, rubric or notes when creating or editing an assignment (up to 10 PDFs, 5 MB each). Open them in a new tab from the assignment page. They sync to all your devices
- **Manual progress**: a slider for assignments without subtasks
- **Tasks page**: every subtask across all assignments, grouped into Today, Upcoming, All and Completed
- **Calendar**: a lightweight monthly calendar (no library) with deadline indicators coloured by urgency. Click a day to see what's due or to add an assignment on that date
- **Completed page**: finished work with completion date, final progress and subtask count
- **Settings**: name, light / dark / system theme, default priority and deadline notifications
- **Notifications**: a bell menu listing overdue and due-soon assignments
- **Quick search**: press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> or <kbd>/</kbd>. Press <kbd>N</kbd> to add a new assignment
- **Toast notifications**: shown when you create, update, delete or complete something
- **Responsive design**: desktop sidebar on large screens; on phones, a bottom tab bar, a slide-out menu and bottom-sheet modals
- **Accessible**: labelled buttons and form fields, keyboard-friendly dialogs and menus, and support for reduced-motion preferences
- **Google sign-up & login**: sign in with Gmail and your assignments and settings sync across laptop, tablet and phone, live and offline-friendly (Firebase). Data already in your browser moves into your account on first sign-in
- **Persistent**: if accounts aren't set up, everything is saved to `localStorage`. New users start with a clean, empty workspace

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [React Router](https://reactrouter.com/) (hash routing)
- [Lucide React](https://lucide.dev/) icons
- [Firebase](https://firebase.google.com/): Authentication (Google sign-in) and Cloud Firestore (sync)
- Browser `localStorage`
- GitHub Pages + GitHub Actions

## Getting Started

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173).

## Build

```bash
npm run build     # type-checks, then builds into dist/
npm run preview   # serves the production build locally
```

## Deployment

The project deploys to GitHub Pages automatically through GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

1. Push the project to a GitHub repository.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to the `main` branch, or run the workflow manually from the **Actions** tab.
5. When the workflow finishes, the site is live at `https://USERNAME.github.io/REPOSITORY-NAME/`.

**How the base path works:** GitHub Pages serves the site from `/REPOSITORY-NAME/`. The workflow passes `BASE_PATH=/<repository-name>/` to the build, and [vite.config.ts](vite.config.ts) uses it as Vite's `base`. You don't need to edit anything, even if you rename the repository.

**Why refreshing never 404s:** the app uses `HashRouter`, so routes look like `/REPOSITORY-NAME/#/tasks`. GitHub Pages only ever has to serve `index.html`, which means refreshing or sharing a link to any page always works.

## Project Structure

```
.github/workflows/deploy.yml   GitHub Pages deployment
firestore.rules                Database security rules (paste into Firebase)
public/                        Static files (favicon)
src/
├── components/
│   ├── assignments/           Cards, form modal, filters, subtasks, actions menu
│   ├── auth/                  Route guard and Google button
│   ├── calendar/              Month calendar grid
│   ├── dashboard/             Stat cards, progress ring card, deadlines, today's focus
│   ├── layout/                App shell, sidebar, header, mobile nav, search, notifications
│   ├── tasks/                 Task row
│   └── ui/                    Reusable building blocks (Button, Modal, Badge, ProgressBar…)
├── config/firebase.ts         Your Firebase project settings (paste them here)
├── context/                   App state: auth, assignments, settings, toasts, dialogs
├── hooks/                     useAuth, useAssignments, useSettings, useToast, useUI
├── pages/                     AuthPage (sign up / log in), Dashboard, Assignments, AssignmentDetails,
│                              Tasks, Calendar, Completed, Settings
├── services/                  storage.ts (localStorage), firebase.ts + cloud.ts (sign-in & sync, loaded on demand),
│                              files.ts (PDF attachments)
├── types/assignment.ts        TypeScript interfaces
├── utils/                     Date helpers, assignment logic (stats, sorting, progress)
├── App.tsx                    Routes and providers
├── main.tsx                   Entry point
└── index.css                  Tailwind setup, design tokens, animations
```

## Screenshots

> Replace these placeholders with your own screenshots, for example saved to `docs/screenshots/`.

| Dashboard | Assignments |
| --- | --- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Assignments](docs/screenshots/assignments.png) |

| Assignment details | Calendar |
| --- | --- |
| ![Assignment details](docs/screenshots/details.png) | ![Calendar](docs/screenshots/calendar.png) |

| Dark mode | Mobile |
| --- | --- |
| ![Dark mode](docs/screenshots/dark.png) | ![Mobile](docs/screenshots/mobile.png) |

## Accounts & sync (Google sign-in)

Visitors see a **Sign up** page on their first visit and a **Log in** page after that. Both use "Continue with Google": the first sign-in creates the account. Once signed in, assignments and settings are stored in Cloud Firestore and sync live between devices.

Until you add your own Firebase project, the app runs **without accounts** and stores data in the browser, so everything works before setup. Firebase is only downloaded once it is set up, so it adds nothing to the app until then.

### One-time setup (about 10 minutes, free)

1. **Create a project.** Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create a project** (Google Analytics is optional).
2. **Turn on Google sign-in.** Go to **Build → Authentication → Get started → Sign-in method → Google → Enable**, choose a support email, and save.
3. **Allow your website.** Go to **Authentication → Settings → Authorized domains → Add domain** and enter `USERNAME.github.io` (for example `94nn.github.io`). `localhost` is already allowed for local development.
4. **Create the database.** Go to **Build → Firestore Database → Create database**, pick a location near you, and start in **production mode**.
5. **Add the security rules.** In Firestore, open the **Rules** tab, replace everything with the contents of [firestore.rules](firestore.rules), and click **Publish**. These rules let each person read and write only their own data.
6. **Register the web app.** Go to **Project settings** (gear icon) → **General → Your apps → Web (`</>`)**, give it a name (skip Hosting), and copy the `firebaseConfig` values.
7. **Paste the config** into [src/config/firebase.ts](src/config/firebase.ts), replacing the placeholder values.
8. Commit and push. The GitHub Actions workflow redeploys, and sign-in is live.

> The Firebase config values are **not secret**. Every Firebase web app sends them to the browser. Your data is protected by the security rules from step 5, so don't skip that step.

### What syncs

Your assignments, subtasks, progress and attached PDFs, plus your name, theme, default priority and notification setting.

The free Firebase "Spark" plan is far more than one student (or a whole class) needs.

### Testing locally without a Firebase project

You can run the whole sign-in flow against the [Firebase emulators](https://firebase.google.com/docs/emulator-suite). This needs Java and the Firebase CLI (`npm install -g firebase-tools`):

```bash
firebase emulators:start --only auth,firestore --project demo-taskly
# in a second terminal (Git Bash / macOS / Linux):
VITE_FIREBASE_EMULATOR=true npm run dev
```

The emulator shows a fake Google sign-in window where you can create test accounts.

## Data & Privacy

- **Signed in:** your assignments and settings live in Cloud Firestore under `users/{your account id}`, readable only by you (see [firestore.rules](firestore.rules)). Attached PDFs are stored there too, split into ~900 KB pieces (Firestore documents max out at 1 MB); they count toward the free 1 GB, which fits roughly 200+ full-size PDFs. Firestore also keeps an offline copy in your browser so the app loads fast and works without a connection.
- **Without accounts set up:** all data lives in your browser's `localStorage` (`att.assignments`, `att.settings`). Clearing your browser data starts fresh.
