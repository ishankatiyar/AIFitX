'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/AppLayout'
import { workoutPlans as plansApi, exercises as exercisesApi } from '@/lib/api'
import type { ExerciseResponse, PlanResponse, UpsertPlanRequest } from '@/lib/types'
import { Plus, Trash2, ChevronRight, ClipboardList } from 'lucide-react'

interface PlanItemForm {
  exerciseId: string
  sets: string
  reps: string
  targetWeightKg: string
  restSeconds: string
}

interface PlanForm {
  name: string
  description: string
  items: PlanItemForm[]
}

const emptyItem = (): PlanItemForm => ({
  exerciseId: '',
  sets: '3',
  reps: '10',
  targetWeightKg: '',
  restSeconds: '60',
})

const emptyPlan = (): PlanForm => ({
  name: '',
  description: '',
  items: [emptyItem()],
})

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<PlanResponse[]>([])
  const [exercises, setExercises] = useState<ExerciseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PlanForm>(emptyPlan())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    plansApi.list().then(setPlans).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    exercisesApi.list().then(setExercises)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload: UpsertPlanRequest = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        items: form.items
          .filter((i) => i.exerciseId)
          .map((i) => ({
            exerciseId: i.exerciseId,
            sets: Number(i.sets),
            reps: Number(i.reps),
            targetWeightKg: i.targetWeightKg ? Number(i.targetWeightKg) : undefined,
            restSeconds: i.restSeconds ? Number(i.restSeconds) : undefined,
          })),
      }
      await plansApi.create(payload)
      setForm(emptyPlan())
      setShowForm(false)
      load()
    } catch {
      setError('Failed to create plan')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    await plansApi.delete(id)
    load()
  }

  function updateItem(idx: number, field: keyof PlanItemForm, value: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }))
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workout Plans</h1>
            <p className="text-gray-500 text-sm mt-1">Build and manage your training programs</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            New plan
          </button>
        </div>

        {/* Create plan modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Workout Plan</h2>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Plan name *</label>
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Push Day"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    maxLength={500}
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional description…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">Exercises *</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, items: [...form.items, emptyItem()] })}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      + Add exercise
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <select
                            required
                            value={item.exerciseId}
                            onChange={(e) => updateItem(idx, 'exerciseId', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select exercise…</option>
                            {exercises.map((ex) => (
                              <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                          </select>
                          {form.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {([
                            ['sets', 'Sets'],
                            ['reps', 'Reps'],
                            ['targetWeightKg', 'Weight (kg)'],
                            ['restSeconds', 'Rest (s)'],
                          ] as const).map(([field, label]) => (
                            <div key={field}>
                              <label className="block text-xs text-gray-500 mb-1">{label}</label>
                              <input
                                type="number"
                                min="0"
                                value={item[field]}
                                onChange={(e) => updateItem(idx, field, e.target.value)}
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
                    {submitting ? 'Creating…' : 'Create plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm(emptyPlan()) }}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No workout plans yet</p>
            <p className="text-sm mt-1">Create your first plan to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {plan.description && (
                  <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                )}
                <p className="text-xs text-gray-400 mb-4 mt-auto">
                  {plan.items.length} exercise{plan.items.length !== 1 ? 's' : ''}
                </p>
                <Link
                  href={`/workout-plans/${plan.id}`}
                  className="flex items-center justify-between text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View details
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
