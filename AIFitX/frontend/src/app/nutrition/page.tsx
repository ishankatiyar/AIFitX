'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { nutrition as nutritionApi } from '@/lib/api'
import type { DailyNutritionResponse, MealType, NutritionResponse } from '@/lib/types'
import { Plus, Trash2, ChevronDown } from 'lucide-react'

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

interface EntryFormState {
  mealType: MealType
  foodName: string
  calories: string
  proteinGrams: string
  carbsGrams: string
  fatGrams: string
}

const emptyForm = (): EntryFormState => ({
  mealType: 'BREAKFAST',
  foodName: '',
  calories: '',
  proteinGrams: '',
  carbsGrams: '',
  fatGrams: '',
})

function MacroBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`text-center px-3 py-2 rounded-lg ${color}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-sm font-bold">{value.toFixed(1)}g</p>
    </div>
  )
}

export default function NutritionPage() {
  const [date, setDate] = useState(todayStr())
  const [data, setData] = useState<DailyNutritionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<EntryFormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    nutritionApi.daily(date)
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await nutritionApi.create({
        consumedOn: date,
        mealType: form.mealType,
        foodName: form.foodName.trim(),
        calories: Number(form.calories),
        proteinGrams: Number(form.proteinGrams),
        carbsGrams: Number(form.carbsGrams),
        fatGrams: Number(form.fatGrams),
      })
      setForm(emptyForm())
      setShowForm(false)
      load()
    } catch {
      setError('Failed to add entry')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    await nutritionApi.delete(id)
    load()
  }

  const byMeal = MEAL_TYPES.reduce<Record<MealType, NutritionResponse[]>>((acc, m) => {
    acc[m] = data?.entries.filter((e) => e.mealType === m) ?? []
    return acc
  }, {} as Record<MealType, NutritionResponse[]>)

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
            <p className="text-gray-500 text-sm mt-1">Track your daily food intake</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Daily totals */}
        {data && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total calories</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalCalories.toLocaleString()}</p>
              </div>
              <span className="text-xs text-gray-400">kcal</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MacroBadge label="Protein" value={data.totalProteinGrams} color="bg-blue-50 text-blue-800" />
              <MacroBadge label="Carbs" value={data.totalCarbsGrams} color="bg-amber-50 text-amber-800" />
              <MacroBadge label="Fat" value={data.totalFatGrams} color="bg-rose-50 text-rose-800" />
            </div>
          </div>
        )}

        {/* Add entry form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-between w-full px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" />
              Add food entry
            </span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showForm ? 'rotate-180' : ''}`} />
          </button>

          {showForm && (
            <form onSubmit={handleAdd} className="border-t border-gray-100 p-5 space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meal type</label>
                  <select
                    value={form.mealType}
                    onChange={(e) => setForm({ ...form, mealType: e.target.value as MealType })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MEAL_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Food name *</label>
                  <input
                    required
                    maxLength={120}
                    value={form.foodName}
                    onChange={(e) => setForm({ ...form, foodName: e.target.value })}
                    placeholder="e.g. Chicken breast"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {(['calories', 'proteinGrams', 'carbsGrams', 'fatGrams'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                      {field === 'calories' ? 'Calories' : field.replace('Grams', ' (g)')}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Adding…' : 'Add entry'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm()) }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Entries by meal */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {MEAL_TYPES.map((meal) => {
              const entries = byMeal[meal]
              if (entries.length === 0) return null
              return (
                <div key={meal} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">{meal}</h3>
                    <span className="text-xs text-gray-400">
                      {entries.reduce((s, e) => s + e.calories, 0)} kcal
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{entry.foodName}</p>
                          <p className="text-xs text-gray-400">
                            {entry.calories} kcal · P {entry.proteinGrams}g · C {entry.carbsGrams}g · F {entry.fatGrams}g
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {data?.entries.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="font-medium">No entries for this day</p>
                <p className="text-sm mt-1">Add your first meal above</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
