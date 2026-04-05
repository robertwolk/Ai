'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, Wrench, BookOpen, Users, Book } from 'lucide-react'

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Meetings', href: '/meetings', icon: MapPin },
  { label: 'Toolkit', href: '/toolkit', icon: Wrench },
  { label: 'Literature', href: '/literature', icon: Book },
  { label: 'Steps', href: '/steps', icon: BookOpen },
  { label: 'Circle', href: '/circle', icon: Users },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href !== '/' && pathname.startsWith(tab.href))
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
