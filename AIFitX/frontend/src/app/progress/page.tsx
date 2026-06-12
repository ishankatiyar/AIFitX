'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { progress as progressApi } from '@/lib/api'
import type { MeasurementResponse } from '@/lib/types'
import { Plus, Trash2, Scale } from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

interface FormState {
  measuredOn: string
  weightKg: string
  bodyFatPercent: string
  chestCm: string
  waistCm: string
  hipsCm: string
  armCm: string
  thighCm: string
}

const emptyForm = (): FormState => ({
  measuredOn: todayStr(),
  weightKg: '',
  bodyFatPercent: '',
  chestCm: '',
  waistCm: '',
  hipsCm: '',
  armCm: '',
  thighCm: '',
})

export default function ProgressPage() {
  const [measurements, setMeasurements] = useState<MeasurementResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    progressApi.list().then(setMeasurements).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await progressApi.create({
        measuredOn: form.measuredOn,
        weightKg: Number(form.weightKg),
        bodyFatPercent: form.bodyFatPercent ? Number(form.bodyFatPercent) : undefined,
        chestCm: form.chestCm ? Number(form.chestCm) : undefined,
        waistCm: form.waistCm ? Number(form.waistCm) : undefined,
        hipsCm: form.hipsCm ? Number(form.hipsCm) : undefined,
        armCm: form.armCm ? Number(form.armCm) : undefined,
        thighCm: form.thighCm ? Number(form.thighCm) : undefined,
      })
      setForm(emptyForm())
      setShowForm(false)
      load()
    } catch {
      setError('Failed to save measurement')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    await progressApi.delete(id)
    load()
  }

  const latest = measurements[0]

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
            <p className="text-gray-500 text-sm mt-1">Track your body measurements over time</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Log measurement
          </button>
        </div>

        {/* Latest stats */}
        {latest && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="text-xs font-medium text-gray-500 mb-3">Latest — {latest.measuredOn}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{latest.weightKg}</p>
                <p className="text-xs text-gray-400">kg</p>
              </div>
              {latest.bodyFatPercent && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{latest.bodyFatPercent}%</p>
                  <p className="text-xs text-gray-400">body fat</p>
                </div>
              )}
              {latest.waistCm && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{latest.waistCm}</p>
                  <p className="text-xs text-gray-400">waist (cm)</p>
                </div>
              )}
              {latest.chestCm && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{latest.chestCm}</p>
                  <p className="text-xs text-gray-400">chest (cm)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Measurement</h2>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.measuredOn}
                    onChange={(e) => setForm({ ...form, measuredOn: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    min="25"
                    max="400"
                    step="0.1"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ['bodyFatPercent', 'Body fat %'],
                    ['chestCm', 'Chest (cm)'],
                    ['waistCm', 'Waist (cm)'],
                    ['hipsCm', 'Hips (cm)'],
                    ['armCm', 'Arm (cm)'],
                    ['thighCm', 'Thigh (cm)'],
                  ] as const).map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input
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
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Saving…' : 'Save'}
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

        {/* History */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            ))}
          </div>
        ) : measurements.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Scale size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No measurements yet</p>
            <p className="text-sm mt-1">Log your first measurement to start tracking progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {measurements.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.measuredOn}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {m.weightKg} kg
                    {m.bodyFatPercent && ` · ${m.bodyFatPercent}% BF`}
                    {m.waistCm && ` · ${m.waistCm}cm waist`}
                    {m.chestCm && ` · ${m.chestCm}cm chest`}
                    {m.armCm && ` · ${m.armCm}cm arm`}
                    {m.thighCm && ` · ${m.thighCm}cm thigh`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
