# FlowPilot 🚀

> A collaborative team task management platform built for high-velocity engineering teams.

![FlowPilot Dashboard](docs/screenshots/dashboard-placeholder.png)

## Features

- **Workspaces** — Gradient-avatar team spaces with role-based access (Admin / Member)
- **Projects** — Color-coded projects with status tracking and progress bars
- **Kanban Board** — Drag-and-drop task management with animated transitions
- **Priority Heat** — Visual task priority indicators (Low → Critical)
- **Focus Meter** — Productivity score based on completion vs. overdue ratio
- **Daily Momentum** — 7-day rolling task streak tracker
- **Risk Alerts** — Automatic project health warnings for overdue spikes
- **Activity Timeline** — Chronological team event log per workspace
- **JWT Auth** — Access + refresh token strategy with auto-rotation

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21 · Spring Boot 3 · Spring Security |
| ORM | Spring Data JPA · Hibernate |
| Database | PostgreSQL |
| Auth | JWT (JJWT) · BCrypt |
| Frontend | React 18 · Next.js 15 (App Router) |
| State | Zustand |
| Forms | React Hook Form · Zod |
| Animation | Framer Motion |
| Drag & Drop | @hello-pangea/dnd |
| Build | Maven |
| Deploy | Railway (API + DB) · Vercel (Frontend) |

## Project Structure

```
flowpilot/
├── backend/
│   ├── src/main/java/com/flowpilot/
│   │   ├── config/          # Security, CORS, DataSeeder
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Request & response records
│   │   ├── entity/          # JPA entities
│   │   ├── enums/           # Domain enumerations
│   │   ├── exception/       # Custom exceptions + global handler
│   │   ├── repository/      # Spring Data JPA repos
│   │   ├── security/        # JWT provider + auth filter
│   │   ├── service/         # Business logic
│   │   └── util/            # Slug, avatar, auth helpers
│   └── src/main/resources/
│       └── application.yml
└── frontend/
    └── src/
        ├── app/             # Next.js pages
        ├── components/      # Reusable UI components
        ├── hooks/           # Custom hooks
        ├── lib/             # API client, utilities
        ├── store/           # Zustand stores
        └── types/           # TypeScript interfaces
```

## Local Setup

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL 15+
- Node.js 20+

### Backend

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run (schema auto-creates, demo data seeds on first start)
mvn spring-boot:run
```

API available at `http://localhost:8080`

### Frontend

```bash
cd frontend

cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080

npm install
npm run dev
```

App available at `http://localhost:3000`

### Demo Credentials

| User | Email | Password |
|------|-------|----------|
| Alice Chen (Admin) | alice@flowpilot.dev | demo1234 |
| Bob Marsh | bob@flowpilot.dev | demo1234 |
| Diana Park | diana@flowpilot.dev | demo1234 |

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive tokens |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke all refresh tokens |
| GET | `/api/auth/me` | Current user profile |

### Workspaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces` | List my workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/workspaces/:slug` | Get by slug |
| PUT | `/api/workspaces/:id` | Update |
| GET | `/api/workspaces/:id/members` | List members |
| POST | `/api/workspaces/:id/members` | Invite member |
| DELETE | `/api/workspaces/:id/members/:memberId` | Remove member |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:wid/projects` | List projects |
| POST | `/api/workspaces/:wid/projects` | Create project |
| GET | `/api/workspaces/:wid/projects/:id` | Get project |
| PUT | `/api/workspaces/:wid/projects/:id` | Update |
| DELETE | `/api/workspaces/:wid/projects/:id` | Delete |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:wid/projects/:pid/tasks` | List tasks (filter: status, priority, q) |
| POST | `/api/workspaces/:wid/projects/:pid/tasks` | Create task |
| PUT | `/api/.../tasks/:id` | Update task |
| PATCH | `/api/.../tasks/:id/move` | Move task (Kanban) |
| DELETE | `/api/.../tasks/:id` | Delete task |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:wid/dashboard` | Stats, FocusMeter, RiskAlerts, Activity |

## Railway Deployment

### Backend

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Create project
railway init

# Add PostgreSQL plugin in Railway dashboard
# Set environment variables in Railway dashboard:
# DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD, JWT_SECRET, CORS_ORIGINS

# Deploy
railway up
```

### Frontend (Vercel)

```bash
npm install -g vercel
cd frontend
vercel

# Set env vars in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
```

## Demo Script (2 min)

1. **(0:00)** Open app, show landing. Click "Sign in" → use alice@flowpilot.dev
2. **(0:20)** Dashboard → point out Focus Meter score, Risk Alerts, Activity Timeline
3. **(0:40)** Projects → show "Mobile App Revamp" card with progress bar and overdue badge
4. **(0:55)** Click project → Kanban opens. Drag a TODO card to IN_PROGRESS, watch it animate
5. **(1:15)** Return to Dashboard → show activity feed updated instantly
6. **(1:30)** Show workspace switcher in sidebar → gradient avatars
7. **(1:50)** Wrap — mention: Spring Boot backend, JWT auth, Zustand state, Framer Motion

## Resume Description

**FlowPilot** — Full-stack team task management platform built with **Java 21 + Spring Boot 3** (REST API, Spring Security, JPA/Hibernate, PostgreSQL) and **React/Next.js 15** (Zustand, Framer Motion, drag-and-drop Kanban). Features JWT access/refresh token auth, role-based workspace permissions, animated Kanban board, productivity scoring (FocusMeter), and automated risk detection. Deployed to Railway and Vercel.
