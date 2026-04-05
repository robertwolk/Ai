'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Phone,
  MessageSquare,
  UserPlus,
  Heart,
  Trash2,
  Plus,
  Edit3,
  Save,
  X,
  Headphones,
  BookOpen,
  Star,
  StarOff,
  ExternalLink,
  Trophy,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  Link,
  Clock,
  Tag,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Sponsor {
  name: string
  phone: string
  meeting: string
}

interface TrustedContact {
  id: string
  name: string
  phone: string
  relationship: string
}

interface AnonymousWin {
  id: string
  text: string
  date: string
  milestone: string
  hearts: number
}

interface SpeakerItem {
  id: string
  title: string
  speaker: string
  duration: string
  description: string
  category: string
  link: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RELATIONSHIP_OPTIONS = [
  'Sponsor',
  'Accountability Partner',
  'Friend in Recovery',
  'Counselor / Therapist',
  'Family Member',
  'Fellow Group Member',
  'Other',
]

const MILESTONE_OPTIONS = [
  '',
  '24 Hours',
  '1 Week',
  '30 Days',
  '60 Days',
  '90 Days',
  '6 Months',
  '9 Months',
  '1 Year',
  '18 Months',
  '2 Years',
  '5 Years',
  '10 Years',
  '20+ Years',
]

const SPEAKER_CATEGORIES = ['All', 'AA Speakers', 'Big Book Studies', 'Step Studies', 'Personal Stories']

const SPEAKER_CONTENT: SpeakerItem[] = [
  {
    id: 's1',
    title: 'Joe & Charlie Big Book Study',
    speaker: 'Joe McQ. & Charlie P.',
    duration: '12 hrs (series)',
    description:
      'The classic and beloved Big Book study that has helped millions understand the program. Joe and Charlie walk through the text with humor and clarity.',
    category: 'Big Book Studies',
    link: '#',
  },
  {
    id: 's2',
    title: 'Sandy B - The AA Speaker',
    speaker: 'Sandy B.',
    duration: '1 hr 15 min',
    description:
      'One of the most popular AA speakers of all time shares his experience, strength, and hope with warmth and authenticity.',
    category: 'AA Speakers',
    link: '#',
  },
  {
    id: 's3',
    title: 'Father Martin - Chalk Talk',
    speaker: 'Father Joseph C. Martin',
    duration: '1 hr 30 min',
    description:
      'Father Martin\'s legendary "Chalk Talk on Alcohol" — an educational and deeply compassionate look at the disease of alcoholism.',
    category: 'AA Speakers',
    link: '#',
  },
  {
    id: 's4',
    title: 'Chris R - A Vision for You',
    speaker: 'Chris R.',
    duration: '55 min',
    description:
      'A powerful talk on finding hope through working the steps and trusting the process. Chris shares how recovery gave him a new vision for life.',
    category: 'Personal Stories',
    link: '#',
  },
  {
    id: 's5',
    title: 'Mark H - Steps and Traditions',
    speaker: 'Mark H.',
    duration: '1 hr 10 min',
    description:
      'An in-depth exploration of how the 12 Steps and 12 Traditions work together to build a strong foundation for lasting recovery.',
    category: 'Step Studies',
    link: '#',
  },
  {
    id: 's6',
    title: 'Bob D - The Steps We Took',
    speaker: 'Bob D.',
    duration: '1 hr 5 min',
    description:
      'A thorough and practical walkthrough of each step, with real-world examples and insights from decades of sobriety.',
    category: 'Step Studies',
    link: '#',
  },
  {
    id: 's7',
    title: 'Clancy I - Carrying the Message',
    speaker: 'Clancy I.',
    duration: '50 min',
    description:
      'Known for his direct style, Clancy shares hard-won wisdom about service, sponsorship, and what it truly means to carry the message.',
    category: 'AA Speakers',
    link: '#',
  },
  {
    id: 's8',
    title: 'Dr. Bob and the Good Old Timers',
    speaker: 'Various',
    duration: '2 hrs (series)',
    description:
      'Stories and recordings from the early days of AA, featuring the spirit and fellowship that started it all.',
    category: 'Personal Stories',
    link: '#',
  },
  {
    id: 's9',
    title: 'Back to Basics - Big Book Study',
    speaker: 'Wally P.',
    duration: '4 hrs (series)',
    description:
      'A structured study of the Big Book using the original approach from the 1940s, designed to help newcomers work the steps quickly.',
    category: 'Big Book Studies',
    link: '#',
  },
  {
    id: 's10',
    title: 'A New Pair of Glasses',
    speaker: 'Chuck C.',
    duration: '1 hr 20 min',
    description:
      'Chuck C. shares his profound experience of spiritual awakening and how recovery transformed the way he sees the world.',
    category: 'Personal Stories',
    link: '#',
  },
]

const RECOVERY_RESOURCES = [
  { label: 'AA.org Official Website', url: 'https://www.aa.org', description: 'Alcoholics Anonymous World Services' },
  { label: 'AA Big Book Online', url: 'https://www.aa.org/the-big-book', description: 'Read the Big Book for free' },
  {
    label: 'Daily Reflections',
    url: 'https://www.aa.org/daily-reflections',
    description: "Today's daily meditation",
  },
  { label: 'Local Intergroup', url: '#', description: 'Find your local AA intergroup office' },
  {
    label: 'SAMHSA Helpline',
    url: 'tel:1-800-662-4357',
    description: '1-800-662-4357 — Free, confidential, 24/7',
  },
  {
    label: '988 Suicide & Crisis Lifeline',
    url: 'tel:988',
    description: 'Call or text 988 — You are not alone',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CirclePage() {
  // --- Sponsor state ---
  const [sponsor, setSponsor] = useState<Sponsor | null>(null)
  const [editingSponsor, setEditingSponsor] = useState(false)
  const [sponsorDraft, setSponsorDraft] = useState<Sponsor>({ name: '', phone: '', meeting: '' })

  // --- Trusted Contacts state ---
  const [contacts, setContacts] = useState<TrustedContact[]>([])
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactDraft, setContactDraft] = useState({ name: '', phone: '', relationship: RELATIONSHIP_OPTIONS[0] })

  // --- Anonymous Wins state ---
  const [wins, setWins] = useState<AnonymousWin[]>([])
  const [showWinForm, setShowWinForm] = useState(false)
  const [winDraft, setWinDraft] = useState({ text: '', milestone: '' })

  // --- Speaker Content state ---
  const [speakerCategory, setSpeakerCategory] = useState('All')
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [speakerExpanded, setSpeakerExpanded] = useState<string | null>(null)

  // --- Section collapse ---
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // --- Hydration guard ---
  const [hydrated, setHydrated] = useState(false)

  // -----------------------------------------------------------------------
  // localStorage load
  // -----------------------------------------------------------------------
  useEffect(() => {
    try {
      const s = localStorage.getItem('circle-sponsor')
      if (s) setSponsor(JSON.parse(s))

      const c = localStorage.getItem('circle-contacts')
      if (c) setContacts(JSON.parse(c))

      const w = localStorage.getItem('circle-wins')
      if (w) setWins(JSON.parse(w))

      const f = localStorage.getItem('circle-speaker-favorites')
      if (f) setFavoriteIds(JSON.parse(f))
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // -----------------------------------------------------------------------
  // localStorage save helpers
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return
    if (sponsor) localStorage.setItem('circle-sponsor', JSON.stringify(sponsor))
    else localStorage.removeItem('circle-sponsor')
  }, [sponsor, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('circle-contacts', JSON.stringify(contacts))
  }, [contacts, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('circle-wins', JSON.stringify(wins))
  }, [wins, hydrated])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem('circle-speaker-favorites', JSON.stringify(favoriteIds))
  }, [favoriteIds, hydrated])

  // -----------------------------------------------------------------------
  // Handlers — Sponsor
  // -----------------------------------------------------------------------
  function startEditSponsor() {
    setSponsorDraft(sponsor ?? { name: '', phone: '', meeting: '' })
    setEditingSponsor(true)
  }

  function saveSponsor() {
    if (!sponsorDraft.name.trim()) return
    setSponsor({ ...sponsorDraft, name: sponsorDraft.name.trim(), phone: sponsorDraft.phone.trim(), meeting: sponsorDraft.meeting.trim() })
    setEditingSponsor(false)
  }

  function removeSponsor() {
    setSponsor(null)
    setEditingSponsor(false)
  }

  // -----------------------------------------------------------------------
  // Handlers — Contacts
  // -----------------------------------------------------------------------
  function addContact() {
    if (!contactDraft.name.trim() || !contactDraft.phone.trim()) return
    setContacts((prev) => [
      ...prev,
      {
        id: generateId(),
        name: contactDraft.name.trim(),
        phone: contactDraft.phone.trim(),
        relationship: contactDraft.relationship,
      },
    ])
    setContactDraft({ name: '', phone: '', relationship: RELATIONSHIP_OPTIONS[0] })
    setShowContactForm(false)
  }

  function deleteContact(id: string) {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  // -----------------------------------------------------------------------
  // Handlers — Wins
  // -----------------------------------------------------------------------
  function addWin() {
    if (!winDraft.text.trim()) return
    setWins((prev) => [
      {
        id: generateId(),
        text: winDraft.text.trim(),
        date: new Date().toISOString(),
        milestone: winDraft.milestone,
        hearts: 0,
      },
      ...prev,
    ])
    setWinDraft({ text: '', milestone: '' })
    setShowWinForm(false)
  }

  function heartWin(id: string) {
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, hearts: w.hearts + 1 } : w)))
  }

  function deleteWin(id: string) {
    setWins((prev) => prev.filter((w) => w.id !== id))
  }

  // -----------------------------------------------------------------------
  // Handlers — Speaker favorites
  // -----------------------------------------------------------------------
  function toggleFavorite(id: string) {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  function toggleSection(key: string) {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredSpeakers =
    speakerCategory === 'All' ? SPEAKER_CONTENT : SPEAKER_CONTENT.filter((s) => s.category === speakerCategory)

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  if (!hydrated) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-pulse-gentle text-muted-foreground text-sm">Loading your circle...</div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          My Circle
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your recovery community — the people and resources that keep you strong.
        </p>
      </div>

      {/* ================================================================
          1. MY SPONSOR
          ================================================================ */}
      <section className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <button
          onClick={() => toggleSection('sponsor')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="section-title mb-0 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            My Sponsor
          </h2>
          {collapsedSections.sponsor ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </button>

        {!collapsedSections.sponsor && (
          <>
            {editingSponsor ? (
              <div className="recovery-card space-y-3">
                <input
                  type="text"
                  placeholder="Sponsor's name"
                  value={sponsorDraft.name}
                  onChange={(e) => setSponsorDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={sponsorDraft.phone}
                  onChange={(e) => setSponsorDraft((d) => ({ ...d, phone: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Meeting they attend"
                  value={sponsorDraft.meeting}
                  onChange={(e) => setSponsorDraft((d) => ({ ...d, meeting: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="flex gap-2">
                  <button onClick={saveSponsor} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button onClick={() => setEditingSponsor(false)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
                {sponsor && (
                  <button onClick={removeSponsor} className="w-full text-center text-xs text-destructive hover:underline pt-1">
                    Remove sponsor info
                  </button>
                )}
              </div>
            ) : sponsor ? (
              <div className="recovery-card-accent space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">{sponsor.name}</p>
                    {sponsor.phone && <p className="text-white/80 text-sm">{sponsor.phone}</p>}
                    {sponsor.meeting && <p className="text-white/70 text-xs mt-0.5">Attends: {sponsor.meeting}</p>}
                  </div>
                  <button onClick={startEditSponsor} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                {sponsor.phone && (
                  <div className="flex gap-2">
                    <a
                      href={`tel:${sponsor.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 py-2.5 text-sm font-medium transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Call Sponsor
                    </a>
                    <a
                      href={`sms:${sponsor.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 py-2.5 text-sm font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Text Sponsor
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="recovery-card text-center space-y-3 py-8">
                <Shield className="w-10 h-10 text-primary/40 mx-auto" />
                <div>
                  <p className="font-medium text-foreground">No sponsor added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    A sponsor is someone who has walked this path before you. When you&apos;re ready, adding their info here makes it easy to reach out.
                  </p>
                </div>
                <button
                  onClick={startEditSponsor}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-4 h-4" /> Add Sponsor
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ================================================================
          2. TRUSTED CONTACTS
          ================================================================ */}
      <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => toggleSection('contacts')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="section-title mb-0 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Trusted Contacts
          </h2>
          {collapsedSections.contacts ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </button>

        {!collapsedSections.contacts && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground -mt-1 mb-2">
              In case of emergency, these are the people who have your back.
            </p>

            {contacts.map((c) => (
              <div key={c.id} className="recovery-card flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.relationship}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    aria-label={`Call ${c.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`sms:${c.phone}`}
                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    aria-label={`Text ${c.name}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`Remove ${c.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {contacts.length === 0 && !showContactForm && (
              <div className="recovery-card text-center py-6">
                <Users className="w-8 h-8 text-primary/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Add the people you trust in your recovery journey.
                </p>
              </div>
            )}

            {showContactForm ? (
              <div className="recovery-card space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={contactDraft.name}
                  onChange={(e) => setContactDraft((d) => ({ ...d, name: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={contactDraft.phone}
                  onChange={(e) => setContactDraft((d) => ({ ...d, phone: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <select
                  value={contactDraft.relationship}
                  onChange={(e) => setContactDraft((d) => ({ ...d, relationship: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {RELATIONSHIP_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={addContact} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                    <Save className="w-4 h-4" /> Save Contact
                  </button>
                  <button onClick={() => setShowContactForm(false)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            )}
          </div>
        )}
      </section>

      {/* ================================================================
          3. ANONYMOUS WINS
          ================================================================ */}
      <section className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <button
          onClick={() => toggleSection('wins')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="section-title mb-0 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Anonymous Wins
          </h2>
          {collapsedSections.wins ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </button>

        {!collapsedSections.wins && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground -mt-1 mb-2">
              Celebrate your milestones and victories. Every step forward matters.
            </p>

            {showWinForm ? (
              <div className="recovery-card space-y-3">
                <textarea
                  placeholder="Share a win... (e.g., '30 days sober!', 'Went to my first meeting')"
                  value={winDraft.text}
                  onChange={(e) => setWinDraft((d) => ({ ...d, text: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <select
                  value={winDraft.milestone}
                  onChange={(e) => setWinDraft((d) => ({ ...d, milestone: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">No milestone tag</option>
                  {MILESTONE_OPTIONS.filter(Boolean).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={addWin} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
                    <Sparkles className="w-4 h-4" /> Post Win
                  </button>
                  <button onClick={() => setShowWinForm(false)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWinForm(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" /> Share a Win
              </button>
            )}

            {wins.length === 0 && !showWinForm && (
              <div className="recovery-card text-center py-6">
                <Sparkles className="w-8 h-8 text-primary/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No wins posted yet. Every victory counts — big or small.
                </p>
              </div>
            )}

            {wins.map((w) => (
              <div key={w.id} className="recovery-card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground flex-1">{w.text}</p>
                  <button
                    onClick={() => deleteWin(w.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    aria-label="Delete win"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(w.date)}</span>
                    {w.milestone && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent/15 text-accent rounded-full px-2 py-0.5">
                        <Tag className="w-3 h-3" />
                        {w.milestone}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => heartWin(w.id)}
                    className="inline-flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${w.hearts > 0 ? 'fill-pink-500' : ''}`} />
                    {w.hearts > 0 && <span>{w.hearts}</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================================================
          4. SPEAKER CONTENT
          ================================================================ */}
      <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={() => toggleSection('speakers')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="section-title mb-0 flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            Speaker Content
          </h2>
          {collapsedSections.speakers ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </button>

        {!collapsedSections.speakers && (
          <div className="space-y-3">
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
              {SPEAKER_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSpeakerCategory(cat)}
                  className={`chip whitespace-nowrap flex-shrink-0 ${speakerCategory === cat ? 'chip-active' : 'chip-inactive'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredSpeakers.map((item) => {
              const isFav = favoriteIds.includes(item.id)
              const isExpanded = speakerExpanded === item.id

              return (
                <div key={item.id} className="recovery-card space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setSpeakerExpanded(isExpanded ? null : item.id)}
                        className="text-left w-full"
                      >
                        <p className="font-medium text-sm text-foreground leading-snug">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.speaker}</p>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFav ? <Star className="w-4 h-4 fill-yellow-500" /> : <StarOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-[52px] space-y-2 animate-fade-in">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      <a
                        href={item.link}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" /> Listen Now
                      </a>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredSpeakers.length === 0 && (
              <div className="recovery-card text-center py-6">
                <Headphones className="w-8 h-8 text-primary/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No content in this category yet.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ================================================================
          5. RECOVERY RESOURCES
          ================================================================ */}
      <section className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
        <button
          onClick={() => toggleSection('resources')}
          className="w-full flex items-center justify-between mb-3"
        >
          <h2 className="section-title mb-0 flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Recovery Resources
          </h2>
          {collapsedSections.resources ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </button>

        {!collapsedSections.resources && (
          <div className="space-y-2">
            {RECOVERY_RESOURCES.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target={r.url.startsWith('http') ? '_blank' : undefined}
                rel={r.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="recovery-card flex items-center gap-3 hover:shadow-md transition-shadow duration-200 no-underline"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {r.url.startsWith('tel:') ? (
                    <Phone className="w-4 h-4 text-primary" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{r.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Footer encouragement */}
      <div className="text-center py-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <p className="text-xs text-muted-foreground">
          You are not alone. Recovery is possible, one day at a time.
        </p>
      </div>
    </div>
  )
}
