# AIFitX

An AI-powered fitness tracker with a Spring Boot REST API backend and a Next.js frontend.

## Project structure

```
AIFitX/
├── backend/    # Spring Boot REST API (Java 21)
└── frontend/   # Next.js web app (TypeScript + Tailwind CSS)
```

## Quick start

### 1. Start the backend

```powershell
cd AIFitX/backend
mvn spring-boot:run
```

API runs on `http://localhost:8080`. Uses H2 (file-based) by default — no database setup needed.

### 2. Start the frontend

```powershell
cd AIFitX/frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Features

- JWT authentication (register / login)
- User fitness profiles (height, weight goal, activity level, fitness goal)
- Searchable exercise catalog with muscle group filtering
- Workout plan builder (create, edit, delete)
- Workout session logger
- Daily nutrition tracker with macro breakdown
- Body measurement history
- Dashboard with weekly summary

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security, JPA/Hibernate |
| Database | H2 (dev) / PostgreSQL 16 (prod) |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Auth | JWT (Bearer token) |

## Environment variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `DB_URL` | H2 file | JDBC connection URL |
| `DB_USERNAME` | `sa` | Database username |
| `DB_PASSWORD` | _(empty)_ | Database password |
| `JWT_SECRET` | dev secret | Must be 32+ bytes in production |
| `JWT_EXPIRATION` | `86400000` | Token expiry in ms (24 h) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend base URL |

## Production (PostgreSQL)

```powershell
cd AIFitX/backend
docker compose up -d
$env:DB_URL="jdbc:postgresql://localhost:5432/aifitx"
$env:DB_USERNAME="aifitx"
$env:DB_PASSWORD="aifitx"
$env:JWT_SECRET="replace-with-a-long-random-secret"
mvn spring-boot:run
```
