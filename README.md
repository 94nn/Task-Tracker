# Assignment Task Tracker

A calm, modern planner for university students. Track every assignment, break it into subtasks, watch deadlines, and see your overall progress at a glance. It runs entirely in the browser: no account, no server, and your data stays on your device.

**Live demo:** `https://USERNAME.github.io/REPOSITORY-NAME/`

## Features

- **Dashboard**: time-based greeting, live statistics (total, in progress, completed, overdue), a circular overall-progress ring with encouraging messages, upcoming deadlines and today's focus tasks
- **Assignments**: create, edit, duplicate, delete (with confirmation) and view details
- **Filters and search**: filter by status, priority and subject; sort by due date, priority, progress or recently added; search titles, subjects, descriptions and tags
- **Subtasks**: checklists with optional due dates, inline rename and delete. Progress is calculated automatically, and an assignment completes itself when every subtask is done
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
- **Persistent**: everything is saved to `localStorage`. Realistic sample data loads on first launch

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [React Router](https://reactrouter.com/) (hash routing)
- [Lucide React](https://lucide.dev/) icons
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
public/                        Static files (favicon)
src/
├── components/
│   ├── assignments/           Cards, form modal, filters, subtasks, actions menu
│   ├── calendar/              Month calendar grid
│   ├── dashboard/             Stat cards, progress ring card, deadlines, today's focus
│   ├── layout/                App shell, sidebar, header, mobile nav, search, notifications
│   ├── tasks/                 Task row
│   └── ui/                    Reusable building blocks (Button, Modal, Badge, ProgressBar…)
├── context/                   App state: assignments, settings, toasts, dialogs
├── data/sampleData.ts         First-launch example assignments
├── hooks/                     useAssignments, useSettings, useToast, useUI
├── pages/                     Dashboard, Assignments, AssignmentDetails, Tasks, Calendar, Completed, Settings
├── services/storage.ts        The only module that reads and writes localStorage
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

## Data & Privacy

All data lives in your browser's `localStorage` under the keys `att.assignments` and `att.settings`. Clearing your browser data or switching to a different browser or device starts fresh. To get the examples back, use **Settings → Restore sample data**.
