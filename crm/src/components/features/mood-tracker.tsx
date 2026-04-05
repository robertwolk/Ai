'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Plus, Smile, Meh, Frown, Angry, Heart } from 'lucide-react'

type Mood = 'great' | 'good' | 'okay' | 'rough' | 'struggling'

interface MoodEntry {
  mood: Mood
  note: string
  date: string
  craving: number // 0-10
}

const moodConfig: Record<Mood, { icon: typeof Smile; label: string; color: string; bg: string }> = {
  great:      { icon: Heart,  label: 'Great',      color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
  good:       { icon: Smile,  label: 'Good',       color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-200' },
  okay:       { icon: Meh,    label: 'Okay',       color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200' },
  rough:      { icon: Frown,  label: 'Rough',      color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  struggling: { icon: Angry,  label: 'Struggling',  color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

const moods: Mood[] = ['great', 'good', 'okay', 'rough', 'struggling']

export default function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [note, setNote] = useState('')
  const [craving, setCraving] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('mood-entries')
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  const addEntry = () => {
    if (!selectedMood) return
    const entry: MoodEntry = {
      mood: selectedMood,
      note,
      date: new Date().toISOString(),
      craving,
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('mood-entries', JSON.stringify(updated))
    setShowAdd(false)
    setSelectedMood(null)
    setNote('')
    setCraving(0)
  }

  if (!mounted) return null

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayEntries = entries.filter(e => e.date.startsWith(dateStr))
    const avgMood = dayEntries.length > 0
      ? dayEntries.reduce((sum, e) => sum + (4 - moods.indexOf(e.mood)), 0) / dayEntries.length
      : -1
    const avgCraving = dayEntries.length > 0
      ? dayEntries.reduce((sum, e) => sum + e.craving, 0) / dayEntries.length
      : -1
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      mood: avgMood,
      craving: avgCraving,
      hasData: dayEntries.length > 0,
    }
  })

  const todayEntry = entries.find(e => e.date.startsWith(new Date().toISOString().split('T')[0]))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">Mood & Craving Tracker</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
          <Plus size={16} />
        </button>
      </div>

      {/* Quick Chart */}
      <div className="recovery-card">
        <p className="text-xs text-muted-foreground mb-2">Last 7 Days</p>
        <div className="flex items-end gap-1 h-20 mb-1">
          {last7.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              {day.hasData ? (
                <>
                  <div className="w-full bg-primary/20 rounded-t" style={{ height: `${(day.mood / 4) * 100}%` }}>
                    <div className="w-full h-full bg-primary rounded-t opacity-70" />
                  </div>
                </>
              ) : (
                <div className="w-full h-1 bg-muted rounded" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {last7.map((day, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[9px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] text-muted-foreground">Mood</span>
          </div>
        </div>
      </div>

      {/* Add Entry Form */}
      {showAdd && (
        <div className="recovery-card border-primary/30">
          <p className="font-medium text-sm mb-3">How are you feeling?</p>
          <div className="flex gap-2 mb-3">
            {moods.map(m => {
              const cfg = moodConfig[m]
              const Icon = cfg.icon
              return (
                <button key={m} onClick={() => setSelectedMood(m)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-colors ${
                    selectedMood === m ? cfg.bg : 'border-border'
                  }`}>
                  <Icon size={18} className={selectedMood === m ? cfg.color : 'text-muted-foreground'} />
                  <span className="text-[10px] font-medium">{cfg.label}</span>
                </button>
              )
            })}
          </div>
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1 block">Craving Level (0-10)</label>
            <input type="range" min="0" max="10" value={craving} onChange={e => setCraving(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>None</span><span>{craving}</span><span>Intense</span>
            </div>
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)"
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background mb-3" />
          <button onClick={addEntry} disabled={!selectedMood}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
            Log Entry
          </button>
        </div>
      )}

      {/* Today's Status */}
      {todayEntry && !showAdd && (
        <div className={`recovery-card ${moodConfig[todayEntry.mood].bg}`}>
          <div className="flex items-center gap-2">
            {(() => { const Icon = moodConfig[todayEntry.mood].icon; return <Icon size={18} className={moodConfig[todayEntry.mood].color} /> })()}
            <span className="text-sm font-medium">Today: {moodConfig[todayEntry.mood].label}</span>
            {todayEntry.craving > 0 && (
              <span className="text-xs text-muted-foreground ml-auto">Craving: {todayEntry.craving}/10</span>
            )}
          </div>
          {todayEntry.note && <p className="text-xs text-muted-foreground mt-1">{todayEntry.note}</p>}
        </div>
      )}

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">Recent</p>
          {entries.slice(0, 5).map((entry, i) => {
            const cfg = moodConfig[entry.mood]
            const Icon = cfg.icon
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
                <Icon size={14} className={cfg.color} />
                <span className="font-medium text-xs">{cfg.label}</span>
                {entry.note && <span className="text-xs text-muted-foreground truncate flex-1">{entry.note}</span>}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
