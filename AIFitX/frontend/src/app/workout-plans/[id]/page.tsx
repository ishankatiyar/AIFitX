'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/AppLayout'
import { workoutPlans as plansApi, exercises as exercisesApi } from '@/lib/api'
import type { ExerciseResponse, PlanResponse, UpsertPlanRequest } from '@/lib/types'
import { ArrowLeft, Pencil, Save, X, Plus, Trash2 } from 'lucide-react'

interface PlanItemForm {
  exerciseId: string
  sets: string
  reps: string
  targetWeightKg: string
  restSeconds: string
}

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [exercises, setExercises] = useState<ExerciseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<PlanItemForm[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([plansApi.get(id), exercisesApi.list()]).then(([p, exs]) => {
      setPlan(p)
      setExercises(exs)
    }).finally(() => setLoading(false))
  }, [id])

  function startEdit() {
    if (!plan) return
    setName(plan.name)
    setDescription(plan.description ?? '')
    setItems(plan.items.map((i) => ({
      exerciseId: i.exerciseId,
      sets: String(i.sets),
      reps: String(i.reps),
      targetWeightKg: i.targetWeightKg ? String(i.targetWeightKg) : '',
      restSeconds: i.restSeconds ? String(i.restSeconds) : '',
    })))
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload: UpsertPlanRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        items: items.filter((i) => i.exerciseId).map((i) => ({
          exerciseId: i.exerciseId,
          sets: Number(i.sets),
          reps: Number(i.reps),
          targetWeightKg: i.targetWeightKg ? Number(i.targetWeightKg) : undefined,
          restSeconds: i.restSeconds ? Number(i.restSeconds) : undefined,
        })),
      }
      const updated = await plansApi.update(id, payload)
      setPlan(updated)
      setEditing(false)
    } catch {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function updateItem(idx: number, field: keyof PlanItemForm, value: string) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="bg-white rounded-xl p-6 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!plan) {
    return (
      <AppLayout>
        <div className="text-center py-16 text-gray-500">Plan not found.</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/workout-plans" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b border-indigo-400 focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
            )}
          </div>
          {!editing ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <Pencil size={15} />
              Edit
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-5">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                rows={2}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Exercises</h3>
                <button
                  type="button"
                  onClick={() => setItems([...items, { exerciseId: '', sets: '3', reps: '10', targetWeightKg: '', restSeconds: '60' }])}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Add exercise
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
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
                      {items.length > 1 && (
                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(['sets', 'reps', 'targetWeightKg', 'restSeconds'] as const).map((field) => (
                        <div key={field}>
                          <label className="block text-xs text-gray-500 mb-1">
                            {field === 'targetWeightKg' ? 'Weight kg' : field === 'restSeconds' ? 'Rest s' : field.charAt(0).toUpperCase() + field.slice(1)}
                          </label>
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

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {plan.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">
                  {plan.items.length} exercise{plan.items.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {plan.items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="text-xs font-bold text-gray-300 w-5">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.exerciseName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.sets} sets × {item.reps} reps
                        {item.targetWeightKg && ` · ${item.targetWeightKg} kg`}
                        {item.restSeconds && ` · ${item.restSeconds}s rest`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
