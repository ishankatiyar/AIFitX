import type {
  AuthResponse,
  CreateSessionRequest,
  DailyNutritionResponse,
  DashboardResponse,
  ExerciseResponse,
  MeasurementRequest,
  MeasurementResponse,
  MuscleGroup,
  NutritionRequest,
  NutritionResponse,
  PlanResponse,
  SessionResponse,
  UpdateProfileRequest,
  UpsertPlanRequest,
  UserResponse,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 204) return undefined as T

  let data: unknown
  try {
    data = await res.json()
  } catch {
    if (!res.ok) throw new ApiError(res.status, res.statusText)
    return undefined as T
  }

  if (!res.ok) {
    const msg = (data as { message?: string })?.message || 'Request failed'
    throw new ApiError(res.status, msg)
  }

  return data as T
}

// Auth
export const auth = {
  register: (email: string, password: string, displayName: string) =>
    request<AuthResponse>('POST', '/api/auth/register', { email, password, displayName }),
  login: (email: string, password: string) =>
    request<AuthResponse>('POST', '/api/auth/login', { email, password }),
}

// User
export const user = {
  getProfile: () => request<UserResponse>('GET', '/api/users/me'),
  updateProfile: (data: UpdateProfileRequest) => request<UserResponse>('PUT', '/api/users/me', data),
}

// Exercises
export const exercises = {
  list: (params?: { query?: string; muscleGroup?: MuscleGroup }) => {
    const qs = new URLSearchParams()
    if (params?.query) qs.set('query', params.query)
    if (params?.muscleGroup) qs.set('muscleGroup', params.muscleGroup)
    const query = qs.toString()
    return request<ExerciseResponse[]>('GET', `/api/exercises${query ? `?${query}` : ''}`)
  },
}

// Nutrition
export const nutrition = {
  daily: (date?: string) => {
    const qs = date ? `?date=${date}` : ''
    return request<DailyNutritionResponse>('GET', `/api/nutrition${qs}`)
  },
  create: (data: NutritionRequest) => request<NutritionResponse>('POST', '/api/nutrition', data),
  delete: (id: string) => request<void>('DELETE', `/api/nutrition/${id}`),
}

// Progress
export const progress = {
  list: () => request<MeasurementResponse[]>('GET', '/api/progress'),
  create: (data: MeasurementRequest) => request<MeasurementResponse>('POST', '/api/progress', data),
  delete: (id: string) => request<void>('DELETE', `/api/progress/${id}`),
}

// Workout Plans
export const workoutPlans = {
  list: () => request<PlanResponse[]>('GET', '/api/workout-plans'),
  get: (id: string) => request<PlanResponse>('GET', `/api/workout-plans/${id}`),
  create: (data: UpsertPlanRequest) => request<PlanResponse>('POST', '/api/workout-plans', data),
  update: (id: string, data: UpsertPlanRequest) => request<PlanResponse>('PUT', `/api/workout-plans/${id}`, data),
  delete: (id: string) => request<void>('DELETE', `/api/workout-plans/${id}`),
}

// Workout Sessions
export const workoutSessions = {
  list: () => request<SessionResponse[]>('GET', '/api/workout-sessions'),
  get: (id: string) => request<SessionResponse>('GET', `/api/workout-sessions/${id}`),
  create: (data: CreateSessionRequest) => request<SessionResponse>('POST', '/api/workout-sessions', data),
  delete: (id: string) => request<void>('DELETE', `/api/workout-sessions/${id}`),
}

// Dashboard
export const dashboard = {
  get: () => request<DashboardResponse>('GET', '/api/dashboard'),
}
