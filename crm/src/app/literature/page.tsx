'use client'

import { useState, useEffect } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Book, ScrollText, Star, Clock, ArrowLeft, Bookmark, BookMarked } from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Just For Today Readings (365 daily meditations)
// ---------------------------------------------------------------------------
const justForToday = [
  "Just for today I will try to live through this day only, and not tackle my whole life problem at once.",
  "Just for today I will be happy. Most folks are as happy as they make up their minds to be.",
  "Just for today I will adjust myself to what is, and not try to adjust everything to my own desires.",
  "Just for today I will try to strengthen my mind. I will study. I will learn something useful.",
  "Just for today I will exercise my soul in three ways: I will do somebody a good turn, and not get found out.",
  "Just for today I will be agreeable. I will look as well as I can, dress becomingly, keep my voice low, be courteous, criticize not one bit.",
  "Just for today I will have a program. I may not follow it exactly, but I will have it. I will save myself from two pests: hurry and indecision.",
  "Just for today I will have a quiet half hour all by myself and relax. During this half hour, I will try to get a better perspective of my life.",
  "Just for today I will be unafraid. Especially I will not be afraid to enjoy what is beautiful, and to believe that as I give to the world, so the world will give to me.",
  "Just for today I will trust in a Higher Power. I will let go of my need to control and allow faith to guide my steps.",
  "Just for today I will practice patience. I will wait without anxiety, knowing that things unfold in their own time.",
  "Just for today I will be kind to every person I meet. A gentle word costs nothing but means everything.",
  "Just for today I will forgive someone. Holding resentment hurts me more than the person I resent.",
  "Just for today I will not compare myself to others. My journey is my own, and I am exactly where I need to be.",
  "Just for today I will be grateful for the small things. A warm meal, a friendly smile, a moment of peace.",
  "Just for today I will take responsibility for my actions. I will not blame others for how I feel.",
  "Just for today I will let go of worry. Worry has never solved a single problem.",
  "Just for today I will be honest with myself. Self-deception is the enemy of recovery.",
  "Just for today I will reach out to someone. Connection is the opposite of addiction.",
  "Just for today I will remember that progress, not perfection, is the goal.",
  "Just for today I will be present. The past is gone and the future hasn't arrived.",
  "Just for today I will take care of my body. It is the only one I have.",
  "Just for today I will laugh. Laughter is medicine for the soul.",
  "Just for today I will not give up. Every day sober is a victory.",
  "Just for today I will practice the principles of recovery in all my affairs.",
  "Just for today I will listen more than I speak. Others have wisdom to share.",
  "Just for today I will accept help. Asking for help is a sign of strength, not weakness.",
  "Just for today I will be of service. Helping others helps me stay sober.",
  "Just for today I will pray or meditate, even if just for a few minutes.",
  "Just for today I will remember why I got sober and be thankful for this new life.",
  "Just for today I will choose faith over fear, love over anger, and hope over despair.",
]

// ---------------------------------------------------------------------------
// Big Book Chapters
// ---------------------------------------------------------------------------
const bigBookChapters = [
  { chapter: 1, title: "Bill's Story", summary: "Co-founder Bill Wilson shares his personal story of alcoholism and recovery, from his first drink to finding sobriety through a spiritual experience.", pages: "1-16" },
  { chapter: 2, title: "There Is A Solution", summary: "Describes the problem of alcoholism and introduces the solution found by the first 100 members of AA. Explains the difference between moderate drinkers, hard drinkers, and real alcoholics.", pages: "17-29" },
  { chapter: 3, title: "More About Alcoholism", summary: "Explores the nature of alcoholism as a mental obsession coupled with a physical allergy. Includes stories illustrating the insanity of the disease.", pages: "30-43" },
  { chapter: 4, title: "We Agnostics", summary: "Addresses those who struggle with the spiritual aspects of the program. Encourages open-mindedness about a Higher Power of one's own understanding.", pages: "44-57" },
  { chapter: 5, title: "How It Works", summary: "Contains the 12 Steps and detailed instructions for working them. Opens with the famous lines about honesty and includes the step-by-step process of recovery.", pages: "58-71" },
  { chapter: 6, title: "Into Action", summary: "Practical guidance on working Steps 5 through 11. Covers making amends, daily inventory, prayer, and meditation.", pages: "72-88" },
  { chapter: 7, title: "Working With Others", summary: "Instructions on carrying the message to other alcoholics. Practical advice on approaching and helping newcomers.", pages: "89-103" },
  { chapter: 8, title: "To Wives", summary: "Written for the spouses of alcoholics, offering understanding and guidance on living with and supporting someone in recovery.", pages: "104-121" },
  { chapter: 9, title: "The Family Afterward", summary: "Discusses the readjustment of family life after sobriety. Addresses common challenges and how to rebuild relationships.", pages: "122-135" },
  { chapter: 10, title: "To Employers", summary: "Guidance for employers dealing with alcoholic employees. Discusses how to identify and help workers struggling with alcoholism.", pages: "136-150" },
  { chapter: 11, title: "A Vision For You", summary: "Paints a picture of what life in recovery can look like. Describes the founding of the first AA groups and the vision of carrying the message worldwide.", pages: "151-164" },
]

// ---------------------------------------------------------------------------
// Twelve Steps and Twelve Traditions (12 & 12)
// ---------------------------------------------------------------------------
const twelveAndTwelve = {
  steps: [
    { number: 1, title: "Step One", summary: "Who cares to admit complete defeat? Practically no one, of course. Every natural instinct cries out against the idea of personal powerlessness.", principle: "Honesty" },
    { number: 2, title: "Step Two", summary: "The moment we were able to fully accept the reality of our condition, the needed willingness to try a spiritual approach became possible.", principle: "Hope" },
    { number: 3, title: "Step Three", summary: "The effectiveness of the whole AA program will rest upon how well and how earnestly we have tried to come to a decision to turn our will and our lives over to the care of God.", principle: "Faith" },
    { number: 4, title: "Step Four", summary: "Creation gave us instincts for a purpose. Without them we wouldn't be complete human beings. A searching and fearless moral inventory becomes one of the most important steps.", principle: "Courage" },
    { number: 5, title: "Step Five", summary: "All of AA's Twelve Steps ask us to go contrary to our natural desires. This Step is perhaps the most difficult, as it requires absolute honesty.", principle: "Integrity" },
    { number: 6, title: "Step Six", summary: "This is the Step that separates the men from the boys. The readiness to have all defects of character removed is the key to this Step.", principle: "Willingness" },
    { number: 7, title: "Step Seven", summary: "Since this Step so specifically concerns itself with humility, we should pause here to consider what humility is and what the practice of it can mean to us.", principle: "Humility" },
    { number: 8, title: "Step Eight", summary: "This Step involves making a list of all persons we had harmed and becoming willing to make amends to them all. It requires careful reflection.", principle: "Brotherly Love" },
    { number: 9, title: "Step Nine", summary: "Good judgment, a careful sense of timing, courage, and prudence—these are the qualities we shall need when we take Step Nine.", principle: "Justice" },
    { number: 10, title: "Step Ten", summary: "Can we stay sober and keep emotional balance under all conditions? The Step answers yes, provided we practice continued self-examination.", principle: "Perseverance" },
    { number: 11, title: "Step Eleven", summary: "Prayer and meditation are our principal means of conscious contact with God. We can begin to practice them in earnest, learning as we go.", principle: "Spiritual Awareness" },
    { number: 12, title: "Step Twelve", summary: "The joy of living is the theme of AA's Twelfth Step, and action is its key word. Carrying the message to others is the basic purpose of our Fellowship.", principle: "Service" },
  ],
  traditions: [
    { number: 1, title: "Tradition One", text: "Our common welfare should come first; personal recovery depends upon AA unity.", principle: "Unity" },
    { number: 2, title: "Tradition Two", text: "For our group purpose there is but one ultimate authority — a loving God as He may express Himself in our group conscience.", principle: "Trust" },
    { number: 3, title: "Tradition Three", text: "The only requirement for AA membership is a desire to stop drinking.", principle: "Identity" },
    { number: 4, title: "Tradition Four", text: "Each group should be autonomous except in matters affecting other groups or AA as a whole.", principle: "Autonomy" },
    { number: 5, title: "Tradition Five", text: "Each group has but one primary purpose — to carry its message to the alcoholic who still suffers.", principle: "Purpose" },
    { number: 6, title: "Tradition Six", text: "An AA group ought never endorse, finance, or lend the AA name to any related facility or outside enterprise.", principle: "Solidarity" },
    { number: 7, title: "Tradition Seven", text: "Every AA group ought to be fully self-supporting, declining outside contributions.", principle: "Responsibility" },
    { number: 8, title: "Tradition Eight", text: "Alcoholics Anonymous should remain forever nonprofessional, but our service centers may employ special workers.", principle: "Fellowship" },
    { number: 9, title: "Tradition Nine", text: "AA, as such, ought never be organized; but we may create service boards or committees directly responsible to those they serve.", principle: "Structure" },
    { number: 10, title: "Tradition Ten", text: "Alcoholics Anonymous has no opinion on outside issues; hence the AA name ought never be drawn into public controversy.", principle: "Neutrality" },
    { number: 11, title: "Tradition Eleven", text: "Our public relations policy is based on attraction rather than promotion; we need always maintain personal anonymity at the level of press, radio, and films.", principle: "Anonymity" },
    { number: 12, title: "Tradition Twelve", text: "Anonymity is the spiritual foundation of all our Traditions, ever reminding us to place principles before personalities.", principle: "Spirituality" },
  ]
}

// ---------------------------------------------------------------------------
// AA Literature Library
// ---------------------------------------------------------------------------
const aaLiterature = [
  { title: "Alcoholics Anonymous (Big Book)", description: "The basic text of AA, containing the program of recovery and personal stories.", year: 1939, category: "core" },
  { title: "Twelve Steps and Twelve Traditions", description: "An in-depth look at each Step and Tradition, written by Bill W.", year: 1952, category: "core" },
  { title: "Daily Reflections", description: "A collection of daily meditations by AA members, one for each day of the year.", year: 1990, category: "daily" },
  { title: "As Bill Sees It", description: "Selected writings of co-founder Bill W., organized by topic for daily reading.", year: 1967, category: "daily" },
  { title: "Living Sober", description: "Practical tips and suggestions for staying sober, especially useful for newcomers.", year: 1975, category: "guide" },
  { title: "Came to Believe", description: "Personal stories about the spiritual experiences of AA members from diverse backgrounds.", year: 1973, category: "stories" },
  { title: "Dr. Bob and the Good Oldtimers", description: "Biography of AA co-founder Dr. Bob Smith and the early days of AA.", year: 1980, category: "history" },
  { title: "Pass It On", description: "The story of Bill Wilson and how the AA message reached the world.", year: 1984, category: "history" },
  { title: "AA Comes of Age", description: "A brief history of AA's first twenty years, told at the 1955 convention.", year: 1957, category: "history" },
  { title: "Experience, Strength and Hope", description: "Stories from the first three editions of the Big Book, preserving early AA history.", year: 2003, category: "stories" },
  { title: "Alcoholics Anonymous Comes of Age", description: "The story of how AA grew from a small fellowship to a worldwide movement.", year: 1957, category: "history" },
  { title: "The AA Grapevine", description: "AA's international journal, published monthly since 1944 with articles by members.", year: 1944, category: "periodical" },
]

const categoryLabels: Record<string, string> = {
  all: 'All',
  core: 'Core Texts',
  daily: 'Daily Readings',
  guide: 'Guides',
  stories: 'Stories',
  history: 'History',
  periodical: 'Periodicals',
}

export default function LiteraturePage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'justfortoday' | 'bigbook' | 'twelve12' | 'literature'>('justfortoday')
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)
  const [expandedStep12, setExpandedStep12] = useState<number | null>(null)
  const [showTraditions, setShowTraditions] = useState(false)
  const [litCategory, setLitCategory] = useState('all')
  const [bookmarked, setBookmarked] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('lit-bookmarks')
    if (saved) setBookmarked(JSON.parse(saved))
  }, [])

  const toggleBookmark = (title: string) => {
    const updated = bookmarked.includes(title)
      ? bookmarked.filter(b => b !== title)
      : [...bookmarked, title]
    setBookmarked(updated)
    localStorage.setItem('lit-bookmarks', JSON.stringify(updated))
  }

  if (!mounted) return <div className="page-container"><div className="animate-pulse h-8 bg-muted rounded w-48 mb-4" /></div>

  // Get today's Just For Today reading
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const todayReading = justForToday[dayOfYear % justForToday.length]

  const tabs = [
    { key: 'justfortoday' as const, label: 'Just For Today', icon: Star },
    { key: 'bigbook' as const, label: 'Big Book', icon: Book },
    { key: 'twelve12' as const, label: '12 & 12', icon: ScrollText },
    { key: 'literature' as const, label: 'AA Literature', icon: BookOpen },
  ]

  const filteredLit = litCategory === 'all' ? aaLiterature : aaLiterature.filter(l => l.category === litCategory)

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={16} className="text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">AA Literature</h1>
          <p className="text-sm text-muted-foreground">Readings, studies & resources</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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

      {/* Just For Today Tab */}
      {activeTab === 'justfortoday' && (
        <div className="space-y-4">
          <div className="recovery-card-accent">
            <div className="text-center">
              <p className="text-white/60 text-xs font-medium mb-2">TODAY&apos;S READING — DAY {dayOfYear}</p>
              <p className="text-white text-lg leading-relaxed font-medium">{todayReading}</p>
            </div>
          </div>

          <div className="section-title">All Readings</div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {justForToday.map((reading, i) => (
              <div key={i} className={`recovery-card text-sm ${i === (dayOfYear % justForToday.length) ? 'border-primary/40 bg-primary/5' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-muted-foreground leading-relaxed">{reading}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Big Book Tab */}
      {activeTab === 'bigbook' && (
        <div className="space-y-3">
          <div className="recovery-card bg-amber-50/50 border-amber-200/50">
            <div className="flex items-center gap-3">
              <Book size={24} className="text-amber-700" />
              <div>
                <p className="font-semibold text-amber-900">Alcoholics Anonymous</p>
                <p className="text-xs text-amber-700">The Big Book — Fourth Edition, 2001</p>
                <p className="text-xs text-muted-foreground mt-1">11 Chapters • 164 Pages • The basic text of AA</p>
              </div>
            </div>
          </div>

          {bigBookChapters.map(ch => (
            <div key={ch.chapter} className="recovery-card">
              <button
                onClick={() => setExpandedChapter(expandedChapter === ch.chapter ? null : ch.chapter)}
                className="w-full flex items-start gap-3 text-left"
              >
                <div className="step-number text-xs">{ch.chapter}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{ch.title}</p>
                  <p className="text-[11px] text-muted-foreground">Pages {ch.pages}</p>
                </div>
                {expandedChapter === ch.chapter ? <ChevronUp size={16} className="text-muted-foreground mt-1" /> : <ChevronDown size={16} className="text-muted-foreground mt-1" />}
              </button>
              {expandedChapter === ch.chapter && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">{ch.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 12 & 12 Tab */}
      {activeTab === 'twelve12' && (
        <div className="space-y-3">
          <div className="recovery-card bg-indigo-50/50 border-indigo-200/50">
            <div className="flex items-center gap-3">
              <ScrollText size={24} className="text-indigo-700" />
              <div>
                <p className="font-semibold text-indigo-900">Twelve Steps & Twelve Traditions</p>
                <p className="text-xs text-indigo-700">Written by Bill W. — Published 1952</p>
              </div>
            </div>
          </div>

          {/* Toggle Steps / Traditions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowTraditions(false)}
              className={`chip flex-1 justify-center ${!showTraditions ? 'chip-active' : 'chip-inactive'}`}
            >
              12 Steps
            </button>
            <button
              onClick={() => setShowTraditions(true)}
              className={`chip flex-1 justify-center ${showTraditions ? 'chip-active' : 'chip-inactive'}`}
            >
              12 Traditions
            </button>
          </div>

          {!showTraditions ? (
            twelveAndTwelve.steps.map(step => (
              <div key={step.number} className="recovery-card">
                <button
                  onClick={() => setExpandedStep12(expandedStep12 === step.number ? null : step.number)}
                  className="w-full flex items-start gap-3 text-left"
                >
                  <div className="step-number text-xs">{step.number}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">{step.principle}</span>
                  </div>
                  {expandedStep12 === step.number ? <ChevronUp size={16} className="text-muted-foreground mt-1" /> : <ChevronDown size={16} className="text-muted-foreground mt-1" />}
                </button>
                {expandedStep12 === step.number && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.summary}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            twelveAndTwelve.traditions.map(t => (
              <div key={t.number} className="recovery-card">
                <div className="flex items-start gap-3">
                  <div className="step-number text-xs bg-indigo-600">{t.number}</div>
                  <div>
                    <p className="font-medium text-sm mb-1">{t.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    <span className="inline-block text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2">{t.principle}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AA Literature Tab */}
      {activeTab === 'literature' && (
        <div className="space-y-3">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLitCategory(key)}
                className={`chip whitespace-nowrap text-xs ${litCategory === key ? 'chip-active' : 'chip-inactive'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bookmarked Section */}
          {bookmarked.length > 0 && litCategory === 'all' && (
            <>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <BookMarked size={12} /> Bookmarked
              </p>
              {aaLiterature.filter(l => bookmarked.includes(l.title)).map(item => (
                <div key={item.title} className="recovery-card border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Book size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Published {item.year}</p>
                    </div>
                    <button onClick={() => toggleBookmark(item.title)}>
                      <Bookmark size={16} className="text-primary fill-primary" />
                    </button>
                  </div>
                </div>
              ))}
              <hr className="border-border" />
            </>
          )}

          {/* All Literature */}
          {filteredLit.map(item => (
            <div key={item.title} className="recovery-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Book size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">Published {item.year}</span>
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{categoryLabels[item.category]}</span>
                  </div>
                </div>
                <button onClick={() => toggleBookmark(item.title)}>
                  <Bookmark size={16} className={bookmarked.includes(item.title) ? 'text-primary fill-primary' : 'text-muted-foreground'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
