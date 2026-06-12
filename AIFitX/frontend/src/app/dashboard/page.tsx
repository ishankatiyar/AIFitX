'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { dashboard as dashboardApi } from '@/lib/api'
import type { DashboardResponse } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { ClipboardList, PlayCircle, Flame, Scale } from 'lucide-react'

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()}, {user?.displayName?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s your fitness overview</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-4 w-24" />
                <div className="h-8 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Workout Plans"
              value={data.workoutPlanCount}
              sub="Total plans created"
              icon={ClipboardList}
              color="bg-indigo-500"
            />
            <StatCard
              label="Sessions This Week"
              value={data.workoutsLast7Days}
              sub="Last 7 days"
              icon={PlayCircle}
              color="bg-emerald-500"
            />
            <StatCard
              label="Calories Today"
              value={data.caloriesToday.toLocaleString()}
              sub="kcal logged"
              icon={Flame}
              color="bg-orange-500"
            />
            <StatCard
              label="Current Weight"
              value={data.latestWeightKg ? `${data.latestWeightKg} kg` : '—'}
              sub={data.latestWeightKg ? 'Latest measurement' : 'No data yet'}
              icon={Scale}
              color="bg-sky-500"
            />
          </div>
        ) : null}

        {data && (
          <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a href="/workout-sessions" className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group">
                <PlayCircle size={20} className="text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-indigo-900">Log a session</p>
                  <p className="text-xs text-indigo-500">Record today&apos;s workout</p>
                </div>
              </a>
              <a href="/nutrition" className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Flame size={20} className="text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Track nutrition</p>
                  <p className="text-xs text-orange-500">Log your meals</p>
                </div>
              </a>
              <a href="/progress" className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                <Scale size={20} className="text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">Log progress</p>
                  <p className="text-xs text-emerald-500">Record measurements</p>
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
