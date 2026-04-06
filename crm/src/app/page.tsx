'use client'

import { useState, useEffect } from 'react'
import { Sun, Calendar, Phone, Heart, Clock, ArrowRight, Quote } from 'lucide-react'
import MoodTracker from '@/components/features/mood-tracker'
import MilestoneBadges from '@/components/features/milestone-badges'

// Daily reflections
const reflections = [
  { text: "One day at a time.", source: "AA Saying" },
  { text: "Progress, not perfection.", source: "AA Big Book" },
  { text: "Let go and let God.", source: "AA Saying" },
  { text: "We are only as sick as our secrets.", source: "AA Saying" },
  { text: "It works if you work it.", source: "AA Saying" },
  { text: "Easy does it.", source: "AA Saying" },
  { text: "First things first.", source: "AA Saying" },
  { text: "Keep it simple.", source: "AA Saying" },
  { text: "This too shall pass.", source: "AA Saying" },
  { text: "God grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference.", source: "Serenity Prayer" },
]

export default function RootPage() {
  const [soberDate, setSoberDate] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [days, setDays] = useState(0)
  const [reflection, setReflection] = useState(reflections[0])

  useEffect(() => {
    // Load sober date from localStorage
    const saved = localStorage.getItem('soberDate')
    if (saved) {
      setSoberDate(saved)
      const start = new Date(saved)
      const now = new Date()
      const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      setDays(diff)
    }
    // Pick daily reflection based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    setReflection(reflections[dayOfYear % reflections.length])
  }, [])

  const handleSetSoberDate = (date: string) => {
    localStorage.setItem('soberDate', date)
    setSoberDate(date)
    const start = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    setDays(diff)
    setShowDatePicker(false)
  }

  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  const remainingDays = days % 30

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recover Together</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sun className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Sober Day Counter */}
      <div className="recovery-card-accent mb-4">
        {soberDate ? (
          <div className="text-center">
            <p className="text-white/70 text-sm mb-1">Your Journey</p>
            <div className="text-5xl font-bold mb-2">{days}</div>
            <p className="text-white/80 text-sm">
              {years > 0 && `${years}y `}{months > 0 && `${months}m `}{remainingDays}d sober
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{years}</div>
                <div className="text-xs text-white/60">Years</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{months}</div>
                <div className="text-xs text-white/60">Months</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{remainingDays}</div>
                <div className="text-xs text-white/60">Days</div>
              </div>
            </div>
            <button
              onClick={() => setShowDatePicker(true)}
              className="mt-3 text-xs text-white/50 underline"
            >
              Update sober date
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Heart className="w-10 h-10 mx-auto mb-3 text-white/80" />
            <p className="text-white/90 font-medium mb-3">Start Your Journey</p>
            <p className="text-white/60 text-sm mb-4">Set your sobriety date to track your progress</p>
            <button
              onClick={() => setShowDatePicker(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Set Sober Date
            </button>
          </div>
        )}
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDatePicker(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Set Your Sobriety Date</h3>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              defaultValue={soberDate || ''}
              onChange={(e) => handleSetSoberDate(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 text-foreground bg-background"
            />
            <button
              onClick={() => setShowDatePicker(false)}
              className="mt-3 w-full text-center text-sm text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Daily Reflection */}
      <div className="recovery-card mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Quote className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Daily Reflection</p>
            <p className="text-foreground font-medium leading-relaxed">{reflection.text}</p>
            <p className="text-xs text-muted-foreground mt-1">— {reflection.source}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <a href="/meetings" className="recovery-card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Find Meeting</p>
            <p className="text-xs text-muted-foreground">Near you</p>
          </div>
        </a>
        <a href="tel:+18004574673" className="recovery-card flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium">AA Helpline</p>
            <p className="text-xs text-muted-foreground">1-800-457-4673</p>
          </div>
        </a>
      </div>

      {/* Next Meeting */}
      <div className="recovery-card mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="section-title mb-0">Upcoming</h3>
          <a href="/meetings" className="text-xs text-primary font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Find your next meeting</p>
            <p className="text-xs text-muted-foreground">Search meetings in your area</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* One-Tap Support */}
      <div className="section-title">Quick Support</div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a href="/toolkit" className="tool-card">
          <div className="tool-icon bg-purple-50">
            <Heart className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-xs font-medium text-center">Meditate</span>
        </a>
        <a href="/toolkit" className="tool-card">
          <div className="tool-icon bg-red-50">
            <Phone className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-xs font-medium text-center">Breathe</span>
        </a>
        <a href="/circle" className="tool-card">
          <div className="tool-icon bg-teal-50">
            <Heart className="w-5 h-5 text-teal-600" />
          </div>
          <span className="text-xs font-medium text-center">My Circle</span>
        </a>
      </div>

      {/* Mood Tracker */}
      <MoodTracker />

      {/* Milestone Badges */}
      <div className="mt-6">
        <MilestoneBadges />
      </div>
    </div>
  )
}
