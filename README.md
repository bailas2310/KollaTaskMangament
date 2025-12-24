# Kolla Task Management System

A task management app built with Vue 3, TypeScript, and Tailwind CSS. It handles task prioritization, role-based dashboards, real-time updates, and some pretty charts. Currently runs on mock data, but it's set up to easily switch to a real backend when you're ready.

## What's Inside

**Task Management**

- Create, view, edit, and delete tasks
- Automatic priority calculation based on deadlines (immediate ≤8h, medium 8-32h, long >32h)
- Manual priority override for managers
- Task status tracking (pending, in progress, completed)

**Role-Based Dashboards**

- **Actor Dashboard**: Personal task list with stats, auto-refreshes every 30 seconds
- **Manager Dashboard**: Full overview with charts, advanced table, activity feed, refreshes every 20 seconds

**Real-Time Features**

- Auto-refreshing dashboards with live indicators
- Activity feed showing recent actions
- Notifications for task completions
- Optimistic UI updates

**Charts** (Chart.js)

- Task progress over time (line chart)
- Priority distribution (doughnut chart)
- Task status breakdown (bar chart)
- Team workload tracking (line chart)

**UI Stuff**

- Teal gradient theme (#025240 → #49C4A6)
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Modern card-based design

## Getting Started

You'll need Node.js 18+ and a package manager (npm, yarn, or pnpm).

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

**Demo Accounts:**

- Actor: `mohamed@kolla.com` (select "Actor" role)
- Manager: `alice@kolla.com` (select "Manager" role)

No password needed for login (it's mock data), but if you use the register form, use `password123`.

## Project Structure

```
src/
├── api/              # API layer - mock repos and real API adapters
│   ├── adapters/     # Converts API calls to match repository interface
│   ├── services/     # Axios-based API clients
│   └── config.ts      # Toggle between mock/real API
├── components/       # Vue components
│   └── charts/       # Chart.js wrappers
├── controllers/      # Handle user interactions
├── models/           # TypeScript interfaces
├── services/         # Business logic
├── store/            # Pinia stores
└── views/           # Page components
```

The architecture follows MVC pattern - models define data structures, views handle UI, controllers manage interactions, and services contain business logic. The API layer uses an adapter pattern so you can switch between mock and real data without changing the rest of the code.

## Using the App

**Login/Register**

- Toggle between login and register tabs
- For login: just enter email and select your role
- For register: fill in name, email, password, and role

**Actor Dashboard**

- See your assigned tasks sorted by priority
- Stats show open tasks, due today, and overdue
- Click any task card to see details
- Change task status via dropdown
- Auto-refreshes every 30 seconds

**Manager Dashboard**

- Four charts showing different metrics
- Advanced task table with sorting, filtering, search, and pagination
- Activity feed on the side
- Create new tasks with the "Create Task" button
- Override task priorities manually
- Bulk actions on selected tasks
- Auto-refreshes every 20 seconds

**Task Management**

- Click any task to open detail modal
- Managers can override priorities
- Change status from the dropdown in cards or detail modal
- Managers can create new tasks

## Configuration

**Mock vs Real API**

Right now it's using mock data. To switch to a real backend:

1. Open `src/api/config.ts` and set `useMock: false`
2. Create a `.env` file with your API URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
3. Make sure your backend implements the expected endpoints (see below)

**Expected API Endpoints**

When you're ready to connect a real backend, it should have:

- `POST /auth/login` - Returns user and token
- `POST /auth/register` - Creates user, returns user and token
- `GET /auth/me` - Get current user (needs Authorization header)
- `POST /auth/logout` - Logout

- `GET /tasks` - Get all tasks (query params: tenantId, role, userId)
- `GET /tasks/:id` - Get single task
- `POST /tasks` - Create task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

- `GET /notifications` - Get notifications (query: userId, tenantId)
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

- `GET /activities` - Get activity feed (query: tenantId, limit)

The Axios client automatically adds the auth token to requests and handles 401 errors by logging out.

## Design System

**Colors**

- Primary gradient: `#025240` → `#49C4A6`
- Success: `#10b981`
- Warning: `#f59e0b`
- Danger: `#ef4444`
- Neutral grays: `#f8fafc`, `#e2e8f0`, `#64748b`, `#1e293b`

**Typography**

- Font: Inter (from Google Fonts)
- Weights: 300, 400, 500, 600, 700

**Components**

- Buttons: 8px border radius
- Cards: 12px border radius
- Shadows: Soft shadows with hover effects
- Transitions: 250ms smooth animations

## Development

**Available Scripts**

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint (if configured)
```

**Adding Features**

The codebase is organized by concern:

- New models go in `src/models/`
- Business logic in `src/services/`
- UI components in `src/components/`
- Pages in `src/views/` (don't forget to add routes)
- State management in `src/store/` using Pinia

**Mock Data**

The mock data includes:

- Two demo users (Mohamed as Actor, Alice as Manager)
- 45+ tasks with various statuses and priorities
- Sample notifications and activities

Mock repositories are in `src/api/Mock*Repository.ts`. They generate realistic data for development and testing.

## Troubleshooting

**Port already in use?**

```bash
npm run dev -- --port 3001
```

**Type errors?**

```bash
npm run type-check
```

**Build failing?**
Try clearing cache:

```bash
rm -rf node_modules dist
npm install
npm run build
```

**Charts not showing?**

- Check browser console for errors
- Make sure Chart.js is installed (`npm install`)
- Verify mock data is being generated (check network tab)

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia (state management)
- Vue Router
- Tailwind CSS
- Chart.js
- Axios

## Deployment

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## Notes

This is a frontend-only prototype. Everything works with mock data right now, which makes it easy to develop and test without a backend. When you're ready to connect a real API, just flip the `useMock` flag and make sure your backend matches the expected endpoints.

The code follows MVC architecture with clear separation between models, views, controllers, and services. The API layer uses adapters so switching between mock and real data doesn't require changing business logic.

---

