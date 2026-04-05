'use client'

import { useState, useEffect } from 'react'
import { Award, Star, Trophy, Flame, Crown, Heart, Sparkles, Gem, Shield, Zap } from 'lucide-react'

interface Badge {
  days: number
  label: string
  icon: typeof Award
  color: string
  bg: string
  description: string
}

const badges: Badge[] = [
  { days: 1, label: '24 Hours', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', description: 'The most important day — today' },
  { days: 7, label: '1 Week', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', description: 'One full week of courage' },
  { days: 14, label: '2 Weeks', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', description: 'Building momentum' },
  { days: 30, label: '1 Month', icon: Award, color: 'text-teal-600', bg: 'bg-teal-50', description: 'A whole month of strength' },
  { days: 60, label: '2 Months', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-50', description: 'Proving it every day' },
  { days: 90, label: '90 Days', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'A cornerstone achievement' },
  { days: 180, label: '6 Months', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', description: 'Half a year of freedom' },
  { days: 365, label: '1 Year', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', description: 'An incredible milestone' },
  { days: 730, label: '2 Years', icon: Crown, color: 'text-indigo-600', bg: 'bg-indigo-50', description: 'Living the promises' },
  { days: 1825, label: '5 Years', icon: Gem, color: 'text-violet-600', bg: 'bg-violet-50', description: 'A life transformed' },
]

export default function MilestoneBadges() {
  const [soberDays, setSoberDays] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('soberDate')
    if (saved) {
      const start = new Date(saved)
      const now = new Date()
      const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      setSoberDays(diff)
    }
  }, [])

  if (!mounted) return null

  const earned = badges.filter(b => soberDays >= b.days)
  const next = badges.find(b => soberDays < b.days)

  return (
    <div className="space-y-3">
      <h3 className="section-title">Milestones</h3>

      {/* Next milestone */}
      {next && (
        <div className="recovery-card border-primary/20">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${next.bg} flex items-center justify-center opacity-40`}>
              <next.icon size={22} className={next.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{next.label}</p>
              <p className="text-xs text-muted-foreground">{next.days - soberDays} days to go</p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${(soberDays / next.days) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earned badges grid */}
      {earned.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {earned.reverse().map(badge => {
            const Icon = badge.icon
            return (
              <div key={badge.days} className="flex flex-col items-center gap-1 p-2">
                <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center shadow-sm`}>
                  <Icon size={20} className={badge.color} />
                </div>
                <span className="text-[10px] font-medium text-center">{badge.label}</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <Award size={32} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Set your sober date to start earning badges</p>
        </div>
      )}

      {/* Locked badges */}
      {badges.filter(b => soberDays < b.days).slice(1, 4).length > 0 && (
        <div className="flex gap-2 justify-center opacity-30">
          {badges.filter(b => soberDays < b.days).slice(1, 4).map(b => {
            const Icon = b.icon
            return (
              <div key={b.days} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Icon size={14} className="text-muted-foreground" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
