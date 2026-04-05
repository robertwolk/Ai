'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, ChevronDown, ChevronUp, Check, Circle, Phone, User,
  Plus, Trash2, Calendar, ClipboardList, Users, Heart, FileText,
  CheckCircle2, Clock, AlertCircle, XCircle, Save, Edit3
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Data & Types
// ---------------------------------------------------------------------------

interface StepData {
  status: 'not_started' | 'working' | 'completed'
  notes: string
}

interface SponsorAssignment {
  id: string
  text: string
  dueDate: string
  completed: boolean
  createdAt: string
}

interface SponsorInfo {
  name: string
  phone: string
}

interface InventoryEntry {
  id: string
  who: string
  cause: string
  affects: string[]
}

interface AmendsEntry {
  id: string
  person: string
  status: 'not_started' | 'in_progress' | 'completed' | 'not_possible'
  notes: string
}

const STEPS = [
  {
    number: 1,
    text: 'We admitted we were powerless over alcohol \u2014 that our lives had become unmanageable.',
    description: 'The foundation of recovery begins with honesty. This step asks us to acknowledge that our relationship with alcohol has become destructive and that we cannot control it through willpower alone.',
    principles: ['Honesty', 'Acceptance', 'Surrender'],
    questions: [
      'In what ways has alcohol made your life unmanageable?',
      'Can you identify times you tried to control your drinking and failed?',
      'What does powerlessness mean to you personally?',
    ],
  },
  {
    number: 2,
    text: 'Came to believe that a Power greater than ourselves could restore us to sanity.',
    description: 'This step introduces hope. After admitting powerlessness, we open ourselves to the possibility that help exists beyond our own limited resources.',
    principles: ['Hope', 'Open-mindedness', 'Faith'],
    questions: [
      'What does "a Power greater than ourselves" mean to you?',
      'Can you identify moments of insanity in your addiction?',
      'What gives you hope that recovery is possible?',
    ],
  },
  {
    number: 3,
    text: 'Made a decision to turn our will and our lives over to the care of God as we understood Him.',
    description: 'Step 3 is about letting go of the need to control everything. It is a decision to trust in something beyond ourselves and to stop trying to manage life solely on our own terms.',
    principles: ['Faith', 'Trust', 'Letting Go'],
    questions: [
      'What does turning your will over look like in daily life?',
      'What are you most afraid of letting go of?',
      'How do you understand your Higher Power?',
    ],
  },
  {
    number: 4,
    text: 'Made a searching and fearless moral inventory of ourselves.',
    description: 'This step requires courage. Like a business taking stock of its inventory, we examine our character \u2014 both assets and liabilities \u2014 with thoroughness and honesty.',
    principles: ['Courage', 'Thoroughness', 'Honesty'],
    questions: [
      'What resentments are you holding onto?',
      'What fears drive your behavior?',
      'What are your character assets and liabilities?',
    ],
  },
  {
    number: 5,
    text: 'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.',
    description: 'Sharing our inventory with another person breaks the isolation of addiction. This step brings our secrets into the light and begins the process of healing through vulnerability.',
    principles: ['Integrity', 'Vulnerability', 'Trust'],
    questions: [
      'Who would you trust to hear your Fifth Step?',
      'What secrets are you most afraid to share?',
      'How does keeping secrets affect your recovery?',
    ],
  },
  {
    number: 6,
    text: 'Were entirely ready to have God remove all these defects of character.',
    description: 'Readiness is the key to this step. We must become willing to let go of the character defects that have become familiar, even comfortable, parts of our lives.',
    principles: ['Willingness', 'Readiness', 'Humility'],
    questions: [
      'Which character defects are you most reluctant to let go of?',
      'What would your life look like without these defects?',
      'Are you entirely ready, or partially ready?',
    ],
  },
  {
    number: 7,
    text: 'Humbly asked Him to remove our shortcomings.',
    description: 'Humility is not thinking less of ourselves but thinking of ourselves less. This step is the spiritual action of asking for help in becoming a better person.',
    principles: ['Humility', 'Surrender', 'Spiritual Growth'],
    questions: [
      'What does humility mean to you?',
      'How do you practice asking for help?',
      'What shortcomings keep recurring in your life?',
    ],
  },
  {
    number: 8,
    text: 'Made a list of all persons we had harmed, and became willing to make amends to them all.',
    description: 'This step is about building the willingness to repair relationships damaged by our addiction. Making the list requires honesty; becoming willing requires compassion \u2014 for others and ourselves.',
    principles: ['Willingness', 'Compassion', 'Responsibility'],
    questions: [
      'Who have you harmed through your addiction?',
      'What barriers do you have to making amends?',
      'Can you include yourself on the list?',
    ],
  },
  {
    number: 9,
    text: 'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
    description: 'Taking action to repair harm requires wisdom and discernment. Some amends are direct, some are living amends, and some are best left unmade to avoid causing further harm.',
    principles: ['Justice', 'Discernment', 'Courage'],
    questions: [
      'Which amends can you make directly right now?',
      'Are there amends that might cause more harm?',
      'What does a living amend look like for you?',
    ],
  },
  {
    number: 10,
    text: 'Continued to take personal inventory and when we were wrong promptly admitted it.',
    description: 'Recovery is a daily practice. This step keeps us honest by encouraging ongoing self-examination and the prompt correction of mistakes.',
    principles: ['Perseverance', 'Vigilance', 'Self-awareness'],
    questions: [
      'How do you practice daily self-examination?',
      'How quickly do you admit when you are wrong?',
      'What triggers old patterns of behavior?',
    ],
  },
  {
    number: 11,
    text: 'Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out.',
    description: 'This step deepens our spiritual connection. Through prayer and meditation, we seek guidance and the strength to follow through, rather than asking for specific outcomes.',
    principles: ['Spiritual Awareness', 'Meditation', 'Seeking'],
    questions: [
      'What does your prayer or meditation practice look like?',
      'How do you discern your Higher Power\'s will?',
      'What role does quiet reflection play in your recovery?',
    ],
  },
  {
    number: 12,
    text: 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs.',
    description: 'The culmination of the steps is service and living by spiritual principles in everything we do. We keep what we have by giving it away.',
    principles: ['Service', 'Gratitude', 'Love'],
    questions: [
      'How has your spiritual life changed through the steps?',
      'In what ways can you carry the message to others?',
      'How do you practice these principles in all areas of life?',
    ],
  },
]

const AFFECTS_OPTIONS = [
  'Self-esteem',
  'Security',
  'Ambitions',
  'Personal Relations',
  'Sexual Relations',
  'Pride',
  'Finances',
  'Emotional Well-being',
]

const AMENDS_STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'text-muted-foreground', bg: 'bg-muted', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  not_possible: { label: 'Not Possible', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle },
}

type Tab = 'steps' | 'inventory' | 'amends' | 'sponsor'

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StepsPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('steps')

  // Steps state
  const [stepsData, setStepsData] = useState<Record<number, StepData>>({})
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  // Sponsor state
  const [sponsor, setSponsor] = useState<SponsorInfo>({ name: '', phone: '' })
  const [assignments, setAssignments] = useState<SponsorAssignment[]>([])
  const [newAssignment, setNewAssignment] = useState('')
  const [newAssignmentDate, setNewAssignmentDate] = useState('')
  const [editingSponsor, setEditingSponsor] = useState(false)

  // Inventory state
  const [inventory, setInventory] = useState<InventoryEntry[]>([])
  const [invWho, setInvWho] = useState('')
  const [invCause, setInvCause] = useState('')
  const [invAffects, setInvAffects] = useState<string[]>([])

  // Amends state
  const [amends, setAmends] = useState<AmendsEntry[]>([])
  const [newAmendsPerson, setNewAmendsPerson] = useState('')

  // Hydration guard
  const [mounted, setMounted] = useState(false)

  // Load from localStorage
  useEffect(() => {
    setStepsData(loadJSON('steps_data', {}))
    setSponsor(loadJSON('sponsor_info', { name: '', phone: '' }))
    setAssignments(loadJSON('sponsor_assignments', []))
    setInventory(loadJSON('step4_inventory', []))
    setAmends(loadJSON('amends_list', []))
    setMounted(true)
  }, [])

  // Persist helpers
  const updateStepsData = useCallback((next: Record<number, StepData>) => {
    setStepsData(next)
    saveJSON('steps_data', next)
  }, [])

  const updateAssignments = useCallback((next: SponsorAssignment[]) => {
    setAssignments(next)
    saveJSON('sponsor_assignments', next)
  }, [])

  const updateInventory = useCallback((next: InventoryEntry[]) => {
    setInventory(next)
    saveJSON('step4_inventory', next)
  }, [])

  const updateAmends = useCallback((next: AmendsEntry[]) => {
    setAmends(next)
    saveJSON('amends_list', next)
  }, [])

  // Derived
  const completedCount = Object.values(stepsData).filter(s => s.status === 'completed').length
  const workingCount = Object.values(stepsData).filter(s => s.status === 'working').length
  const progressPct = Math.round((completedCount / 12) * 100)

  // Step helpers
  const cycleStatus = (stepNum: number) => {
    const current = stepsData[stepNum]?.status || 'not_started'
    const next = current === 'not_started' ? 'working' : current === 'working' ? 'completed' : 'not_started'
    const updated = { ...stepsData, [stepNum]: { ...stepsData[stepNum], status: next, notes: stepsData[stepNum]?.notes || '' } }
    updateStepsData(updated)
  }

  const updateNotes = (stepNum: number, notes: string) => {
    const updated = { ...stepsData, [stepNum]: { ...stepsData[stepNum], status: stepsData[stepNum]?.status || 'not_started', notes } }
    updateStepsData(updated)
  }

  // Sponsor helpers
  const saveSponsor = () => {
    saveJSON('sponsor_info', sponsor)
    setEditingSponsor(false)
  }

  const addAssignment = () => {
    if (!newAssignment.trim()) return
    const a: SponsorAssignment = {
      id: uid(),
      text: newAssignment.trim(),
      dueDate: newAssignmentDate,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    updateAssignments([a, ...assignments])
    setNewAssignment('')
    setNewAssignmentDate('')
  }

  const toggleAssignment = (id: string) => {
    updateAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a))
  }

  const deleteAssignment = (id: string) => {
    updateAssignments(assignments.filter(a => a.id !== id))
  }

  // Inventory helpers
  const addInventoryEntry = () => {
    if (!invWho.trim()) return
    const entry: InventoryEntry = { id: uid(), who: invWho.trim(), cause: invCause.trim(), affects: invAffects }
    updateInventory([entry, ...inventory])
    setInvWho('')
    setInvCause('')
    setInvAffects([])
  }

  const deleteInventoryEntry = (id: string) => {
    updateInventory(inventory.filter(e => e.id !== id))
  }

  const toggleAffects = (item: string) => {
    setInvAffects(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item])
  }

  // Amends helpers
  const addAmend = () => {
    if (!newAmendsPerson.trim()) return
    const entry: AmendsEntry = { id: uid(), person: newAmendsPerson.trim(), status: 'not_started', notes: '' }
    updateAmends([entry, ...amends])
    setNewAmendsPerson('')
  }

  const updateAmendStatus = (id: string, status: AmendsEntry['status']) => {
    updateAmends(amends.map(a => a.id === id ? { ...a, status } : a))
  }

  const updateAmendNotes = (id: string, notes: string) => {
    updateAmends(amends.map(a => a.id === id ? { ...a, notes } : a))
  }

  const deleteAmend = (id: string) => {
    updateAmends(amends.filter(a => a.id !== id))
  }

  if (!mounted) {
    return <div className="page-container"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'steps', label: 'Steps', icon: <BookOpen size={16} /> },
    { id: 'inventory', label: 'Inventory', icon: <ClipboardList size={16} /> },
    { id: 'amends', label: 'Amends', icon: <Users size={16} /> },
    { id: 'sponsor', label: 'Sponsor', icon: <Heart size={16} /> },
  ]

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">12-Step Workbook</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal step work, inventory, and sponsor tools</p>
      </div>

      {/* Progress summary */}
      <div className="recovery-card mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Step Progress</span>
          <span className="text-sm font-bold text-primary">{progressPct}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>{completedCount} completed</span>
          <span>{workingCount} in progress</span>
          <span>{12 - completedCount - workingCount} remaining</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-muted rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'steps' && (
        <div className="space-y-3 animate-fade-in">
          {STEPS.map(step => {
            const data = stepsData[step.number] || { status: 'not_started', notes: '' }
            const isExpanded = expandedStep === step.number
            return (
              <div key={step.number} className="step-card flex-col !items-stretch">
                <div className="flex items-start gap-3">
                  {/* Status checkbox */}
                  <button
                    onClick={() => cycleStatus(step.number)}
                    className="flex-shrink-0 mt-0.5"
                    title={`Status: ${data.status.replace('_', ' ')}`}
                  >
                    {data.status === 'completed' ? (
                      <div className="step-number !bg-green-500">
                        <Check size={16} />
                      </div>
                    ) : data.status === 'working' ? (
                      <div className="step-number !bg-amber-500 animate-pulse-gentle">
                        <span>{step.number}</span>
                      </div>
                    ) : (
                      <div className="step-number">
                        <span>{step.number}</span>
                      </div>
                    )}
                  </button>

                  {/* Step text */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                      className="text-left w-full"
                    >
                      <p className={`text-sm leading-relaxed ${data.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {step.text}
                      </p>
                    </button>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs capitalize ${
                        data.status === 'completed' ? 'text-green-600' :
                        data.status === 'working' ? 'text-amber-600' : 'text-muted-foreground'
                      }`}>
                        {data.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                        className="text-muted-foreground hover:text-primary transition-colors ml-auto"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Description</h4>
                      <p className="text-sm text-foreground leading-relaxed">{step.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key Principles</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {step.principles.map(p => (
                          <span key={p} className="chip chip-active text-xs !py-1 !px-2.5">{p}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Reflection Questions</h4>
                      <ul className="space-y-1.5">
                        {step.questions.map((q, i) => (
                          <li key={i} className="text-sm text-foreground flex gap-2">
                            <span className="text-primary font-medium">{i + 1}.</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Personal Notes</h4>
                      <textarea
                        value={data.notes}
                        onChange={e => updateNotes(step.number, e.target.value)}
                        placeholder="Write your reflections, answers, and notes here..."
                        className="w-full min-h-[120px] p-3 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-5 animate-fade-in">
          <div className="recovery-card">
            <h2 className="section-title flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              Step 4 Inventory Worksheet
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              A searching and fearless moral inventory. Record resentments, their causes, and what they affect.
            </p>

            {/* Add form */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Who or What</label>
                <input
                  type="text"
                  value={invWho}
                  onChange={e => setInvWho(e.target.value)}
                  placeholder="Person, institution, or principle..."
                  className="w-full p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">The Cause</label>
                <input
                  type="text"
                  value={invCause}
                  onChange={e => setInvCause(e.target.value)}
                  placeholder="What happened? Why am I resentful?"
                  className="w-full p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Affects My...</label>
                <div className="flex flex-wrap gap-1.5">
                  {AFFECTS_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleAffects(opt)}
                      className={`chip text-xs ${invAffects.includes(opt) ? 'chip-active' : 'chip-inactive'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={addInventoryEntry}
                disabled={!invWho.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                Add Entry
              </button>
            </div>
          </div>

          {/* Inventory list */}
          {inventory.length > 0 && (
            <div>
              <h3 className="section-title">Entries ({inventory.length})</h3>
              <div className="space-y-3">
                {inventory.map(entry => (
                  <div key={entry.id} className="recovery-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{entry.who}</p>
                        {entry.cause && <p className="text-sm text-muted-foreground mt-1">{entry.cause}</p>}
                        {entry.affects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.affects.map(a => (
                              <span key={a} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteInventoryEntry(entry.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inventory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No inventory entries yet.</p>
              <p className="text-xs mt-1">Start by adding a resentment above.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'amends' && (
        <div className="space-y-5 animate-fade-in">
          <div className="recovery-card">
            <h2 className="section-title flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Steps 8 &amp; 9 \u2014 Amends List
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              List all persons you have harmed and track your amends progress.
            </p>

            {/* Add amend */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmendsPerson}
                onChange={e => setNewAmendsPerson(e.target.value)}
                placeholder="Person's name..."
                onKeyDown={e => e.key === 'Enter' && addAmend()}
                className="flex-1 p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <button
                onClick={addAmend}
                disabled={!newAmendsPerson.trim()}
                className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Amends summary */}
          {amends.length > 0 && (
            <div className="flex gap-2 text-xs">
              {(['not_started', 'in_progress', 'completed', 'not_possible'] as const).map(status => {
                const count = amends.filter(a => a.status === status).length
                if (count === 0) return null
                const cfg = AMENDS_STATUS_CONFIG[status]
                return (
                  <span key={status} className={`${cfg.bg} ${cfg.color} px-2.5 py-1 rounded-full font-medium`}>
                    {count} {cfg.label}
                  </span>
                )
              })}
            </div>
          )}

          {/* Amends list */}
          {amends.length > 0 && (
            <div className="space-y-3">
              {amends.map(entry => {
                const cfg = AMENDS_STATUS_CONFIG[entry.status]
                const StatusIcon = cfg.icon
                return (
                  <div key={entry.id} className="recovery-card">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={18} className={cfg.color} />
                        <p className="text-sm font-semibold text-foreground">{entry.person}</p>
                      </div>
                      <button
                        onClick={() => deleteAmend(entry.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Status selector */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(['not_started', 'in_progress', 'completed', 'not_possible'] as const).map(status => {
                        const s = AMENDS_STATUS_CONFIG[status]
                        return (
                          <button
                            key={status}
                            onClick={() => updateAmendStatus(entry.id, status)}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
                              entry.status === status
                                ? `${s.bg} ${s.color} border-current`
                                : 'border-border text-muted-foreground hover:border-primary/30'
                            }`}
                          >
                            {s.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Notes */}
                    <textarea
                      value={entry.notes}
                      onChange={e => updateAmendNotes(entry.id, e.target.value)}
                      placeholder="Notes about this amend..."
                      className="w-full min-h-[60px] p-2.5 text-sm rounded-lg border border-border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y placeholder:text-muted-foreground/60"
                    />
                  </div>
                )
              })}
            </div>
          )}

          {amends.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No amends entries yet.</p>
              <p className="text-xs mt-1">Add people you have harmed to begin working Steps 8 and 9.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sponsor' && (
        <div className="space-y-5 animate-fade-in">
          {/* Sponsor info */}
          <div className="recovery-card">
            <h2 className="section-title flex items-center gap-2">
              <User size={18} className="text-primary" />
              Sponsor Information
            </h2>

            {editingSponsor || (!sponsor.name && !sponsor.phone) ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Name</label>
                  <input
                    type="text"
                    value={sponsor.name}
                    onChange={e => setSponsor({ ...sponsor, name: e.target.value })}
                    placeholder="Sponsor's name"
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={sponsor.phone}
                    onChange={e => setSponsor({ ...sponsor, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <button
                  onClick={saveSponsor}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save size={16} />
                  Save Sponsor
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{sponsor.name}</p>
                  {sponsor.phone && (
                    <a href={`tel:${sponsor.phone}`} className="text-sm text-primary flex items-center gap-1 mt-1">
                      <Phone size={14} />
                      {sponsor.phone}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setEditingSponsor(true)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="recovery-card">
            <h2 className="section-title flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Sponsor Assignments
            </h2>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={newAssignment}
                onChange={e => setNewAssignment(e.target.value)}
                placeholder="New assignment from sponsor..."
                onKeyDown={e => e.key === 'Enter' && addAssignment()}
                className="w-full p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="date"
                    value={newAssignmentDate}
                    onChange={e => setNewAssignmentDate(e.target.value)}
                    className="w-full p-2.5 text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <button
                  onClick={addAssignment}
                  disabled={!newAssignment.trim()}
                  className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Assignment list */}
          {assignments.length > 0 && (
            <div>
              <h3 className="section-title">
                Assignments ({assignments.filter(a => !a.completed).length} pending)
              </h3>
              <div className="space-y-2">
                {assignments.map(a => (
                  <div
                    key={a.id}
                    className={`recovery-card flex items-start gap-3 ${a.completed ? 'opacity-60' : ''}`}
                  >
                    <button
                      onClick={() => toggleAssignment(a.id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {a.completed ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} className="text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${a.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {a.text}
                      </p>
                      {a.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          Due: {new Date(a.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteAssignment(a.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No assignments yet.</p>
              <p className="text-xs mt-1">Add assignments from your sponsor above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
