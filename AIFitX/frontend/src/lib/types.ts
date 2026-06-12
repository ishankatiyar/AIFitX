export type FitnessGoal = 'LOSE_WEIGHT' | 'BUILD_MUSCLE' | 'IMPROVE_ENDURANCE' | 'MAINTAIN_FITNESS'
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'
export type MuscleGroup = 'CHEST' | 'BACK' | 'SHOULDERS' | 'ARMS' | 'CORE' | 'LEGS' | 'GLUTES' | 'FULL_BODY' | 'CARDIO'
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export interface UserResponse {
  id: string
  email: string
  displayName: string
  dateOfBirth?: string
  heightCm?: number
  targetWeightKg?: number
  fitnessGoal?: FitnessGoal
  activityLevel?: ActivityLevel
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: UserResponse
}

export interface ExerciseResponse {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  instructions: string
}

export interface NutritionRequest {
  consumedOn: string
  mealType: MealType
  foodName: string
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export interface NutritionResponse {
  id: string
  consumedOn: string
  mealType: MealType
  foodName: string
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export interface DailyNutritionResponse {
  date: string
  totalCalories: number
  totalProteinGrams: number
  totalCarbsGrams: number
  totalFatGrams: number
  entries: NutritionResponse[]
}

export interface MeasurementRequest {
  measuredOn: string
  weightKg: number
  bodyFatPercent?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  armCm?: number
  thighCm?: number
}

export interface MeasurementResponse {
  id: string
  measuredOn: string
  weightKg: number
  bodyFatPercent?: number
  chestCm?: number
  waistCm?: number
  hipsCm?: number
  armCm?: number
  thighCm?: number
}

export interface PlanItemRequest {
  exerciseId: string
  sets: number
  reps: number
  targetWeightKg?: number
  restSeconds?: number
}

export interface PlanItemResponse {
  id: string
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
  targetWeightKg?: number
  restSeconds?: number
}

export interface UpsertPlanRequest {
  name: string
  description?: string
  items: PlanItemRequest[]
}

export interface PlanResponse {
  id: string
  name: string
  description?: string
  items: PlanItemResponse[]
}

export interface SessionExerciseRequest {
  exerciseId: string
  setsCompleted: number
  repsPerSet?: number
  weightKg?: number
  durationSeconds?: number
}

export interface CreateSessionRequest {
  planId?: string
  name: string
  completedAt?: string
  durationMinutes?: number
  caloriesBurned?: number
  notes?: string
  exercises: SessionExerciseRequest[]
}

export interface SessionExerciseResponse {
  exerciseId: string
  exerciseName: string
  setsCompleted: number
  repsPerSet?: number
  weightKg?: number
  durationSeconds?: number
}

export interface SessionResponse {
  id: string
  planId?: string
  name: string
  completedAt: string
  durationMinutes?: number
  caloriesBurned?: number
  notes?: string
  exercises: SessionExerciseResponse[]
}

export interface DashboardResponse {
  workoutPlanCount: number
  workoutsLast7Days: number
  caloriesToday: number
  latestWeightKg?: number
}

export interface UpdateProfileRequest {
  displayName: string
  dateOfBirth?: string
  heightCm?: number
  targetWeightKg?: number
  fitnessGoal?: FitnessGoal
  activityLevel?: ActivityLevel
}
