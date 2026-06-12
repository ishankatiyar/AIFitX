# AIFitX Backend

Spring Boot REST API for a fitness application. It includes:

- JWT registration and login
- User fitness profiles
- Searchable seeded exercise catalog
- Workout plan CRUD
- Completed workout logging
- Daily calorie and macro tracking
- Body measurement history
- Dashboard summary

## Requirements

- Java 21
- Maven 3.9+
- PostgreSQL 16 for production (H2 is the zero-setup default)

## Run locally

```powershell
mvn spring-boot:run
```

The API starts on `http://localhost:8080`. Data is stored in `./data` using H2 unless database environment variables are supplied.

To use PostgreSQL:

```powershell
docker compose up -d
$env:DB_URL="jdbc:postgresql://localhost:5432/aifitx"
$env:DB_USERNAME="aifitx"
$env:DB_PASSWORD="aifitx"
$env:JWT_SECRET="replace-with-a-long-random-secret"
mvn spring-boot:run
```

## Main API routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account and receive a JWT |
| POST | `/api/auth/login` | Sign in |
| GET/PUT | `/api/users/me` | Read or update the current profile |
| GET | `/api/exercises` | List/filter the exercise catalog |
| GET/POST | `/api/workout-plans` | List or create plans |
| GET/PUT/DELETE | `/api/workout-plans/{id}` | Manage a plan |
| GET/POST | `/api/workout-sessions` | List or log workouts |
| GET/DELETE | `/api/workout-sessions/{id}` | Read or delete a workout |
| GET/POST | `/api/nutrition` | Daily nutrition summary or food logging |
| DELETE | `/api/nutrition/{id}` | Delete a food entry |
| GET/POST | `/api/progress` | Measurement history or new measurement |
| DELETE | `/api/progress/{id}` | Delete a measurement |
| GET | `/api/dashboard` | Current user summary |
| GET | `/api/health` | Public health check |

Authenticated requests use:

```text
Authorization: Bearer <accessToken>
```

## Test

```powershell
mvn test
```
