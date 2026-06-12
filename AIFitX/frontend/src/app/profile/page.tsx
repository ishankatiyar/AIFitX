'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { user as userApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import type { ActivityLevel, FitnessGoal } from '@/lib/types'
import { Save, User } from 'lucide-react'

const FITNESS_GOALS: { value: FitnessGoal; label: string }[] = [
  { value: 'LOSE_WEIGHT', label: 'Lose Weight' },
  { value: 'BUILD_MUSCLE', label: 'Build Muscle' },
  { value: 'IMPROVE_ENDURANCE', label: 'Improve Endurance' },
  { value: 'MAINTAIN_FITNESS', label: 'Maintain Fitness' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'SEDENTARY', label: 'Sedentary' },
  { value: 'LIGHT', label: 'Light (1–3 days/week)' },
  { value: 'MODERATE', label: 'Moderate (3–5 days/week)' },
  { value: 'ACTIVE', label: 'Active (6–7 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very Active (2× per day)' },
]

interface FormState {
  displayName: string
  dateOfBirth: string
  heightCm: string
  targetWeightKg: string
  fitnessGoal: FitnessGoal | ''
  activityLevel: ActivityLevel | ''
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState<FormState>({
    displayName: '',
    dateOfBirth: '',
    heightCm: '',
    targetWeightKg: '',
    fitnessGoal: '',
    activityLevel: '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName ?? '',
        dateOfBirth: user.dateOfBirth ?? '',
        heightCm: user.heightCm ? String(user.heightCm) : '',
        targetWeightKg: user.targetWeightKg ? String(user.targetWeightKg) : '',
        fitnessGoal: user.fitnessGoal ?? '',
        activityLevel: user.activityLevel ?? '',
      })
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)
    try {
      const updated = await userApi.updateProfile({
        displayName: form.displayName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        targetWeightKg: form.targetWeightKg ? Number(form.targetWeightKg) : undefined,
        fitnessGoal: form.fitnessGoal || undefined,
        activityLevel: form.activityLevel || undefined,
      })
      setUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Update your personal information and goals</p>
        </div>

        {/* Avatar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.displayName?.charAt(0).toUpperCase() ?? <User size={28} />}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.displayName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name *</label>
              <input
                required
                maxLength={80}
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  step="0.1"
                  value={form.heightCm}
                  onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target weight (kg)</label>
                <input
                  type="number"
                  min="25"
                  max="400"
                  step="0.1"
                  value={form.targetWeightKg}
                  onChange={(e) => setForm({ ...form, targetWeightKg: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fitness goal</label>
              <select
                value={form.fitnessGoal}
                onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value as FitnessGoal | '' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a goal…</option>
                {FITNESS_GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity level</label>
              <select
                value={form.activityLevel}
                onChange={(e) => setForm({ ...form, activityLevel: e.target.value as ActivityLevel | '' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a level…</option>
                {ACTIVITY_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
