import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
    }).format(value)
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`
}

export function formatROAS(value: number): string {
    return `${value.toFixed(1)}x`
}

export function getLeadGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'D': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
}

export function getPlatformColor(platform: string): string {
    const colors: Record<string, string> = {
          GOOGLE: '#4285f4',
          META: '#1877f2',
          TIKTOK: '#ff0050',
          X: '#000000',
          LINKEDIN: '#0a66c2',
          YOUTUBE: '#ff0000',
          INSTAGRAM: '#e1306c',
          FACEBOOK: '#1877f2',
    }
    return colors[platform.toUpperCase()] || '#6366f1'
}

export function getPlatformBadgeClass(platform: string): string {
    const classes: Record<string, string> = {
          GOOGLE: 'bg-blue-50 text-blue-700 border-blue-200',
          META: 'bg-blue-100 text-blue-800 border-blue-300',
          TIKTOK: 'bg-pink-50 text-pink-700 border-pink-200',
          X: 'bg-slate-50 text-slate-700 border-slate-200',
          LINKEDIN: 'bg-blue-50 text-blue-800 border-blue-300',
          ORGANIC: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          COLD_EMAIL: 'bg-amber-50 text-amber-700 border-amber-200',
          REFERRAL: 'bg-purple-50 text-purple-700 border-purple-200',
    }
    return classes[platform.toUpperCase()] || 'bg-gray-50 text-gray-700 border-gray-200'
}

export function getDealStageColor(stage: string): string {
    const colors: Record<string, string> = {
          LEAD: 'bg-slate-100 text-slate-700',
          QUALIFIED: 'bg-blue-100 text-blue-700',
          MEETING_BOOKED: 'bg-purple-100 text-purple-700',
          PROPOSAL_SENT: 'bg-amber-100 text-amber-700',
          NEGOTIATION: 'bg-orange-100 text-orange-700',
          WON: 'bg-emerald-100 text-emerald-700',
          LOST: 'bg-red-100 text-red-700',
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
}

export function timeAgo(date: Date | string): string {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'just now'
}

export function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim()
}
