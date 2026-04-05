'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Heart, Wind, BookOpen, Timer, Hand,
  Phone, ChevronDown, ChevronUp, Play, Pause,
  Square, Plus, X, Check, Coffee,
  Moon, Sun, Smile, Apple, Users
} from 'lucide-react'

const meditations = [
  { id: 1, title: 'Morning Serenity', duration: 300, icon: Sun, color: 'bg-amber-50 text-amber-600',
    steps: ['Find a comfortable position', 'Close your eyes gently', 'Breathe deeply 3 times',
      'Set your intention for today', 'Repeat: I am grateful for this new day',
      'Breathe naturally for 2 minutes', 'Open your eyes slowly'] },
  { id: 2, title: 'Letting Go', duration: 600, icon: Wind, color: 'bg-blue-50 text-blue-600',
    steps: ['Sit comfortably and close your eyes', 'Notice any tension in your body',
      'With each exhale, release that tension', 'Think of something you want to let go of',
      'Imagine placing it in a balloon', 'Watch the balloon float away',
      'Return to your breath'] },
  { id: 3, title: 'Gratitude Practice', duration: 420, icon: Heart, color: 'bg-pink-50 text-pink-600',
    steps: ['Close your eyes and breathe deeply', 'Think of 3 things you are grateful for',
      'Feel the warmth of gratitude in your chest', 'Send thanks to someone who helped you',
      'Appreciate your own strength', 'Smile gently', 'Open your eyes'] },
  { id: 4, title: 'Evening Reflection', duration: 600, icon: Moon, color: 'bg-indigo-50 text-indigo-600',
    steps: ['Lie down or sit comfortably', 'Review your day without judgment',
      'Acknowledge your victories, no matter how small', 'Accept any mistakes with compassion',
      'Set a positive intention for tomorrow', 'Breathe deeply and relax into rest'] },
]

const readings = [
  { title: 'Serenity Prayer', text: 'God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference.' },
  { title: 'Third Step Prayer', text: 'God, I offer myself to Thee — to build with me and to do with me as Thou wilt. Relieve me of the bondage of self, that I may better do Thy will.' },
  { title: 'Seventh Step Prayer', text: 'My Creator, I am now willing that you should have all of me, good and bad. I pray that you now remove from me every single defect of character which stands in the way of my usefulness to you and my fellows.' },
  { title: 'The Promises', text: 'If we are painstaking about this phase of our development, we will be amazed before we are half way through. We are going to know a new freedom and a new happiness. We will not regret the past nor wish to shut the door on it.' },
  { title: 'Just For Today', text: 'Just for today I will try to live through this day only, and not tackle my whole life problem at once. Just for today I will be happy. Just for today I will adjust myself to what is, and not try to adjust everything to my own desires.' },
  { title: 'A Vision For You', text: 'We shall be with you in the Fellowship of the Spirit, and you will surely meet some of us as you trudge the Road of Happy Destiny. May God bless you and keep you — until then.' },
]

const haltChecks = [
  { letter: 'H', label: 'Hungry', icon: Apple, color: 'bg-orange-50 text-orange-600', suggestion: 'Eat something nutritious. Low blood sugar can trigger cravings.' },
  { letter: 'A', label: 'Angry', icon: Wind, color: 'bg-red-50 text-red-600', suggestion: 'Take 10 deep breaths. Call your sponsor. Write about it.' },
  { letter: 'L', label: 'Lonely', icon: Users, color: 'bg-blue-50 text-blue-600', suggestion: 'Call someone in your circle. Go to a meeting. You are not alone.' },
  { letter: 'T', label: 'Tired', icon: Moon, color: 'bg-indigo-50 text-indigo-600', suggestion: 'Rest if you can. Fatigue weakens resolve. Be gentle with yourself.' },
]

export default function ToolkitPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'meditate' | 'readings' | 'cravings'>('meditate')
  const [activeMeditation, setActiveMeditation] = useState<number | null>(null)
  const [meditationTime, setMeditationTime] = useState(0)
  const [meditationRunning, setMeditationRunning] = useState(false)
  const [expandedReading, setExpandedReading] = useState<number | null>(null)
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in')
  const [breathActive, setBreathActive] = useState(false)
  const [breathCount, setBreathCount] = useState(0)
  const [cravingTimer, setCravingTimer] = useState(0)
  const [cravingActive, setCravingActive] = useState(false)
  const [gratitudeList, setGratitudeList] = useState<string[]>([])
  const [gratitudeInput, setGratitudeInput] = useState('')
  const [activeHalt, setActiveHalt] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('gratitude-list')
    if (saved) setGratitudeList(JSON.parse(saved))
  }, [])

  // Meditation timer
  useEffect(() => {
    if (!meditationRunning) return
    const interval = setInterval(() => {
      setMeditationTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [meditationRunning])

  // Breathing exercise
  useEffect(() => {
    if (!breathActive) return
    const cycle = () => {
      setBreathPhase('in')
      setTimeout(() => setBreathPhase('hold'), 4000)
      setTimeout(() => {
        setBreathPhase('out')
        setBreathCount(c => c + 1)
      }, 7000)
    }
    cycle()
    const interval = setInterval(cycle, 11000)
    return () => clearInterval(interval)
  }, [breathActive])

  // Craving timer
  useEffect(() => {
    if (!cravingActive) return
    const interval = setInterval(() => {
      setCravingTimer(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [cravingActive])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const addGratitude = () => {
    if (!gratitudeInput.trim()) return
    const updated = [gratitudeInput.trim(), ...gratitudeList]
    setGratitudeList(updated)
    localStorage.setItem('gratitude-list', JSON.stringify(updated))
    setGratitudeInput('')
  }

  const removeGratitude = (i: number) => {
    const updated = gratitudeList.filter((_, idx) => idx !== i)
    setGratitudeList(updated)
    localStorage.setItem('gratitude-list', JSON.stringify(updated))
  }

  if (!mounted) return <div className="page-container"><div className="animate-pulse h-8 bg-muted rounded w-48 mb-4" /></div>

  const tabs = [
    { key: 'meditate' as const, label: 'Meditate', icon: Heart },
    { key: 'readings' as const, label: 'Readings', icon: BookOpen },
    { key: 'cravings' as const, label: 'Craving Tools', icon: Hand },
  ]

  return (
    <div className="page-container animate-fade-in">
      <h1 className="text-2xl font-bold mb-1">Toolkit</h1>
      <p className="text-sm text-muted-foreground mb-4">Your recovery tools, always within reach</p>

      {/* Breathing Exercise Card */}
      <div className="recovery-card-accent mb-4">
        <div className="text-center">
          <p className="text-white/70 text-xs font-medium mb-2">BREATHING EXERCISE</p>
          <div className={`w-24 h-24 mx-auto rounded-full border-4 border-white/30 flex items-center justify-center mb-3 transition-all duration-[4000ms] ${
            breathActive ? (breathPhase === 'in' ? 'scale-125 border-white/80' : breathPhase === 'hold' ? 'scale-125 border-white/60' : 'scale-100 border-white/30') : ''
          }`}>
            <span className="text-white font-medium text-sm">
              {breathActive ? (breathPhase === 'in' ? 'Breathe In' : breathPhase === 'hold' ? 'Hold' : 'Breathe Out') : 'Start'}
            </span>
          </div>
          {breathActive && <p className="text-white/60 text-xs mb-2">Cycles: {breathCount}</p>}
          <button
            onClick={() => { setBreathActive(!breathActive); setBreathCount(0) }}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
          >
            {breathActive ? 'Stop' : 'Begin 4-7-4 Breathing'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`chip whitespace-nowrap ${activeTab === tab.key ? 'chip-active' : 'chip-inactive'}`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Meditate Tab */}
      {activeTab === 'meditate' && (
        <div className="space-y-3">
          {activeMeditation !== null ? (
            <div className="recovery-card">
              {(() => {
                const med = meditations.find(m => m.id === activeMeditation)!
                const Icon = med.icon
                const stepIdx = Math.min(Math.floor(meditationTime / (med.duration / med.steps.length)), med.steps.length - 1)
                return (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`tool-icon ${med.color}`}><Icon size={20} /></div>
                      <div className="flex-1">
                        <p className="font-semibold">{med.title}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(meditationTime)} / {formatTime(med.duration)}</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min((meditationTime / med.duration) * 100, 100)}%` }} />
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 mb-4 text-center">
                      <p className="text-foreground font-medium">{med.steps[stepIdx]}</p>
                      <p className="text-xs text-muted-foreground mt-1">Step {stepIdx + 1} of {med.steps.length}</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setMeditationRunning(!meditationRunning)}
                        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                        {meditationRunning ? <Pause size={20} /> : <Play size={20} />}
                      </button>
                      <button onClick={() => { setActiveMeditation(null); setMeditationRunning(false); setMeditationTime(0) }}
                        className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                        <Square size={18} />
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            meditations.map(med => {
              const Icon = med.icon
              return (
                <button key={med.id} onClick={() => { setActiveMeditation(med.id); setMeditationTime(0); setMeditationRunning(true) }}
                  className="w-full recovery-card flex items-center gap-3 text-left hover:shadow-md transition-shadow">
                  <div className={`tool-icon ${med.color}`}><Icon size={20} /></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{med.title}</p>
                    <p className="text-xs text-muted-foreground">{Math.floor(med.duration / 60)} min</p>
                  </div>
                  <Play size={16} className="text-muted-foreground" />
                </button>
              )
            })
          )}
        </div>
      )}

      {/* Readings Tab */}
      {activeTab === 'readings' && (
        <div className="space-y-2">
          {readings.map((reading, i) => (
            <div key={i} className="recovery-card">
              <button onClick={() => setExpandedReading(expandedReading === i ? null : i)}
                className="w-full flex items-center justify-between text-left">
                <span className="font-medium text-sm">{reading.title}</span>
                {expandedReading === i ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>
              {expandedReading === i && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {reading.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Craving Tools Tab */}
      {activeTab === 'cravings' && (
        <div className="space-y-4">
          {/* Ride the Wave Timer */}
          <div className="recovery-card">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Timer size={16} className="text-primary" /> Ride the Wave
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Cravings peak around 20 minutes then fade. Start the timer and ride it out.
            </p>
            {cravingActive ? (
              <>
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-primary">{formatTime(cravingTimer)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cravingTimer < 600 ? 'Stay strong — the wave is building...' :
                     cravingTimer < 1200 ? 'You are near the peak — it gets easier from here!' :
                     'The wave is passing. You are doing amazing!'}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min((cravingTimer / 1800) * 100, 100)}%` }} />
                </div>
                <button onClick={() => { setCravingActive(false); setCravingTimer(0) }}
                  className="w-full py-2 bg-muted rounded-lg text-sm font-medium text-muted-foreground">
                  I made it through
                </button>
              </>
            ) : (
              <button onClick={() => { setCravingActive(true); setCravingTimer(0) }}
                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium">
                Start Timer
              </button>
            )}
          </div>

          {/* HALT Check */}
          <div className="recovery-card">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Hand size={16} className="text-primary" /> HALT Check
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Are you Hungry, Angry, Lonely, or Tired?</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {haltChecks.map((item, i) => {
                const Icon = item.icon
                return (
                  <button key={i} onClick={() => setActiveHalt(activeHalt === i ? null : i)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                      activeHalt === i ? 'border-primary bg-primary/5' : 'border-border'
                    }`}>
                    <Icon size={18} className={activeHalt === i ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-xs font-medium">{item.letter}</span>
                  </button>
                )
              })}
            </div>
            {activeHalt !== null && (
              <div className={`p-3 rounded-xl ${haltChecks[activeHalt].color.split(' ')[0]}`}>
                <p className="font-medium text-sm mb-1">{haltChecks[activeHalt].label}</p>
                <p className="text-xs text-muted-foreground">{haltChecks[activeHalt].suggestion}</p>
              </div>
            )}
          </div>

          {/* Gratitude List */}
          <div className="recovery-card">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Smile size={16} className="text-primary" /> Gratitude List
            </h3>
            <div className="flex gap-2 mb-3">
              <input value={gratitudeInput} onChange={e => setGratitudeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addGratitude()}
                placeholder="I am grateful for..."
                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background" />
              <button onClick={addGratitude}
                className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
            {gratitudeList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">Add things you are grateful for</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {gratitudeList.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-lg">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span className="flex-1">{item}</span>
                    <button onClick={() => removeGratitude(i)} className="text-muted-foreground hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Play the Tape Forward */}
          <div className="recovery-card">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Coffee size={16} className="text-primary" /> Play the Tape Forward
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Think through what happens next...</p>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-xs font-medium text-red-700 mb-1">If I pick up...</p>
                <p className="text-xs text-red-600">What happens tonight? Tomorrow? Next week? Think about the consequences you have lived through before.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs font-medium text-green-700 mb-1">If I stay the course...</p>
                <p className="text-xs text-green-600">Tomorrow I wake up sober. I keep my progress. I stay present for the people who matter. My future self will thank me.</p>
              </div>
            </div>
          </div>

          {/* Quick Call */}
          <div className="recovery-card">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Phone size={16} className="text-primary" /> Reach Out
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="tel:+18004574673" className="flex items-center gap-2 p-3 bg-muted rounded-xl text-sm font-medium">
                <Phone size={14} className="text-green-600" /> AA Helpline
              </a>
              <a href="/circle" className="flex items-center gap-2 p-3 bg-muted rounded-xl text-sm font-medium">
                <Users size={14} className="text-blue-600" /> My Circle
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
