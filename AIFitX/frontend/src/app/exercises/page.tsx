'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { exercises as exercisesApi } from '@/lib/api'
import type { ExerciseResponse, MuscleGroup } from '@/lib/types'
import { Search } from 'lucide-react'

const MUSCLE_GROUPS: { value: MuscleGroup | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'CHEST', label: 'Chest' },
  { value: 'BACK', label: 'Back' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'ARMS', label: 'Arms' },
  { value: 'CORE', label: 'Core' },
  { value: 'LEGS', label: 'Legs' },
  { value: 'GLUTES', label: 'Glutes' },
  { value: 'FULL_BODY', label: 'Full Body' },
  { value: 'CARDIO', label: 'Cardio' },
]

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  CHEST: 'bg-red-100 text-red-700',
  BACK: 'bg-blue-100 text-blue-700',
  SHOULDERS: 'bg-purple-100 text-purple-700',
  ARMS: 'bg-orange-100 text-orange-700',
  CORE: 'bg-yellow-100 text-yellow-700',
  LEGS: 'bg-green-100 text-green-700',
  GLUTES: 'bg-pink-100 text-pink-700',
  FULL_BODY: 'bg-indigo-100 text-indigo-700',
  CARDIO: 'bg-cyan-100 text-cyan-700',
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'ALL'>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = {
      ...(query.trim() ? { query: query.trim() } : {}),
      ...(muscleGroup !== 'ALL' ? { muscleGroup } : {}),
    }
    exercisesApi.list(params as Parameters<typeof exercisesApi.list>[0])
      .then(setExercises)
      .finally(() => setLoading(false))
  }, [query, muscleGroup])

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Exercises</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and search the exercise library</p>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search exercises…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {MUSCLE_GROUPS.map((mg) => (
              <button
                key={mg.value}
                onClick={() => setMuscleGroup(mg.value as MuscleGroup | 'ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  muscleGroup === mg.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {mg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">No exercises found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div key={ex.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ex.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${MUSCLE_COLORS[ex.muscleGroup]}`}>
                      {ex.muscleGroup.replace('_', ' ')}
                    </span>
                  </div>
                  {ex.equipment && (
                    <p className="text-xs text-gray-500 mb-3">Equipment: {ex.equipment}</p>
                  )}
                  {ex.instructions && (
                    <>
                      <button
                        onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        {expanded === ex.id ? 'Hide instructions' : 'View instructions'}
                      </button>
                      {expanded === ex.id && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{ex.instructions}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && exercises.length > 0 && (
          <p className="text-xs text-gray-400 mt-4">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </AppLayout>
  )
}
