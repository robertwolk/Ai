'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, DollarSign, Activity, BarChart3,
  Megaphone, Calendar, Zap, Target, FileText, Settings,
  ChevronRight, Bot, Globe, Mail, TrendingUp, Search,
  Instagram, Youtube, Linkedin
} from 'lucide-react'

const navigation = [
  {
    section: 'CRM',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Pipeline', href: '/pipeline', icon: DollarSign },
      { name: 'Activities', href: '/activities', icon: Activity },
    ]
  },
  {
    section: 'Advertising',
    items: [
      { name: 'Ad Dashboard', href: '/ads', icon: BarChart3 },
      { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
      { name: 'Attribution', href: '/attribution', icon: Target },
      { name: 'AI Optimizer', href: '/optimizer', icon: Zap },
    ]
  },
  {
    section: 'Social Media',
    items: [
      { name: 'Content Calendar', href: '/social', icon: Calendar },
      { name: 'AI Generator', href: '/social/create', icon: Bot },
      { name: 'Analytics', href: '/social/analytics', icon: TrendingUp },
    ]
  },
  {
    section: 'Growth',
    items: [
      { name: 'Lead Generation', href: '/lead-gen', icon: Search },
      { name: 'Landing Pages', href: '/landing-pages', icon: Globe },
      { name: 'Email Sequences', href: '/email', icon: Mail },
    ]
  },
  {
    section: 'Settings',
    items: [
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
]

const platformLinks = [
  { name: 'Google', color: '#4285f4', href: '/ads/google' },
  { name: 'Meta', color: '#1877f2', href: '/ads/meta' },
  { name: 'TikTok', color: '#ff0050', href: '/ads/tiktok' },
  { name: 'LinkedIn', color: '#0a66c2', href: '/ads/linkedin' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-60 flex-shrink-0 bg-slate-950 flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">CRM AI Hub</p>
            <p className="text-slate-500 text-xs">Powered by Claude</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navigation.map((group) => (
          <div key={group.section}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 pt-4 pb-1.5">
              {group.section}
            </p>
            {group.items.map((item) => {
              const active = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-150',
                    active
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.name}
                  {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Platform quick links */}
      <div className="px-3 pb-3 border-t border-slate-800 pt-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 pb-2">
          Platforms
        </p>
        <div className="grid grid-cols-4 gap-1">
          {platformLinks.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-bold"
                style={{ background: p.color }}
              >
                {p.name[0]}
              </div>
              <span className="text-slate-500 text-[10px]">{p.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            R
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Robert Wolk</p>
            <p className="text-slate-500 text-[10px] truncate">Admin</p>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}
