'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { workoutSessions as sessionsApi, workoutPlans as plansApi, exercises as exercisesApi } from '@/lib/api'
import type { CreateSessionRequest, ExerciseResponse, PlanResponse, SessionResponse } from '@/lib/types'
import { Plus, Trash2, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface ExerciseForm {
  exerciseId: string
  setsCompleted: string
  repsPerSet: string
  weightKg: string
  durationSeconds: string
}

interface SessionForm {
  name: string
  planId: string
  durationMinutes: string
  caloriesBurned: string
  notes: string
  exercises: ExerciseForm[]
}

const emptyExercise = (): ExerciseForm => ({
  exerciseId: '',
  setsCompleted: '3',
  repsPerSet: '10',
  weightKg: '',
  durationSeconds: '',
})

const emptyForm = (): SessionForm => ({
  name: '',
  planId: '',
  durationMinutes: '',
  caloriesBurned: '',
  notes: '',
  exercises: [emptyExercise()],
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WorkoutSessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [plans, setPlans] = useState<PlanResponse[]>([])
  const [exercises, setExercises] = useState<ExerciseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SessionForm>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  function load() {
    setLoading(true)
    sessionsApi.list().then(setSessions).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    plansApi.list().then(setPlans)
    exercisesApi.list().then(setExercises)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload: CreateSessionRequest = {
        name: form.name.trim(),
        planId: form.planId || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        caloriesBurned: form.caloriesBurned ? Number(form.caloriesBurned) : undefined,
        notes: form.notes.trim() || undefined,
        exercises: form.exercises
          .filter((ex) => ex.exerciseId)
          .map((ex) => ({
            exerciseId: ex.exerciseId,
            setsCompleted: Number(ex.setsCompleted),
            repsPerSet: ex.repsPerSet ? Number(ex.repsPerSet) : undefined,
            weightKg: ex.weightKg ? Number(ex.weightKg) : undefined,
            durationSeconds: ex.durationSeconds ? Number(ex.durationSeconds) : undefined,
          })),
      }
      await sessionsApi.create(payload)
      setForm(emptyForm())
      setShowForm(false)
      load()
    } catch {
      setError('Failed to log session')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    await sessionsApi.delete(id)
    load()
  }

  function updateExercise(idx: number, field: keyof ExerciseForm, value: string) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)),
    }))
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workout Sessions</h1>
            <p className="text-gray-500 text-sm mt-1">Log and review your workouts</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Log session
          </button>
        </div>

        {/* Log session modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Workout Session</h2>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Session name *</label>
                    <input
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Morning Push"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Based on plan</label>
                    <select
                      value={form.planId}
                      onChange={(e) => setForm({ ...form, planId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">None</option>
                      {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={form.durationMinutes}
                      onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Calories burned</label>
                    <input
                      type="number"
                      min="0"
                      value={form.caloriesBurned}
                      onChange={(e) => setForm({ ...form, caloriesBurned: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Exercises *</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, exercises: [...form.exercises, emptyExercise()] })}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      + Add exercise
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.exercises.map((ex, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <select
                            required
                            value={ex.exerciseId}
                            onChange={(e) => updateExercise(idx, 'exerciseId', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select exercise…</option>
                            {exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                          {form.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== idx) })}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {([
                            ['setsCompleted', 'Sets done'],
                            ['repsPerSet', 'Reps/set'],
                            ['weightKg', 'Weight kg'],
                            ['durationSeconds', 'Duration s'],
                          ] as const).map(([field, label]) => (
                            <div key={field}>
                              <label className="block text-xs text-gray-500 mb-1">{label}</label>
                              <input
                                type="number"
                                min="0"
                                value={ex[field]}
                                onChange={(e) => updateExercise(idx, field, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Saving…' : 'Log session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm(emptyForm()) }}
                    className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <PlayCircle size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No sessions logged yet</p>
            <p className="text-sm mt-1">Log your first workout session</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === session.id ? null : session.id)}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{session.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(session.completedAt)}
                      {session.durationMinutes && ` · ${session.durationMinutes} min`}
                      {session.caloriesBurned && ` · ${session.caloriesBurned} kcal`}
                      {` · ${session.exercises.length} exercise${session.exercises.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(session.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                    {expanded === session.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {expanded === session.id && (
                  <div className="border-t border-gray-50">
                    {session.notes && (
                      <p className="px-5 py-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">{session.notes}</p>
                    )}
                    <div className="divide-y divide-gray-50">
                      {session.exercises.map((ex, idx) => (
                        <div key={idx} className="flex items-center gap-4 px-5 py-3">
                          <span className="text-xs font-bold text-gray-300 w-4">{idx + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{ex.exerciseName}</p>
                            <p className="text-xs text-gray-400">
                              {ex.setsCompleted} sets
                              {ex.repsPerSet && ` × ${ex.repsPerSet} reps`}
                              {ex.weightKg && ` · ${ex.weightKg} kg`}
                              {ex.durationSeconds && ` · ${ex.durationSeconds}s`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
