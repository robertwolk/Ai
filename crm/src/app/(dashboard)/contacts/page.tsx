'use client'

import { useState } from 'react'
import {
  Users, Plus, Search, Filter, Import, Download,
  Mail, Phone, MoreHorizontal, ChevronDown, Zap, Tag,
  ArrowUpDown, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Mock contacts data
const contacts = [
  {
    id: '1', firstName: 'Sarah', lastName: 'Chen', email: 'sarah@acmecorp.com',
    company: 'Acme Corp', jobTitle: 'CEO', phone: '+1 555-0101',
    source: 'GOOGLE_ADS', lifecycleStage: 'SQL', leadScore: 87,
    tags: ['hot-lead', 'enterprise'], createdAt: '2026-03-15'
  },
  {
    id: '2', firstName: 'Marcus', lastName: 'Rivera', email: 'marcus@techflow.io',
    company: 'TechFlow Inc', jobTitle: 'CMO', phone: '+1 555-0102',
    source: 'META_ADS', lifecycleStage: 'MQL', leadScore: 72,
    tags: ['saas', 'warm'], createdAt: '2026-03-18'
  },
  {
    id: '3', firstName: 'Emma', lastName: 'Walsh', email: 'emma@growthhub.com',
    company: 'GrowthHub', jobTitle: 'Head of Marketing', phone: '+1 555-0103',
    source: 'LINKEDIN_ADS', lifecycleStage: 'OPPORTUNITY', leadScore: 91,
    tags: ['vip', 'hot-lead', 'enterprise'], createdAt: '2026-03-20'
  },
  {
    id: '4', firstName: 'Jake', lastName: 'Morrison', email: 'jake@datastream.co',
    company: 'DataStream', jobTitle: 'Founder', phone: '+1 555-0104',
    source: 'ORGANIC', lifecycleStage: 'LEAD', leadScore: 54,
    tags: ['startup'], createdAt: '2026-03-22'
  },
  {
    id: '5', firstName: 'Priya', lastName: 'Sharma', email: 'priya@nexusdigital.com',
    company: 'Nexus Digital', jobTitle: 'VP Sales', phone: '+1 555-0105',
    source: 'TIKTOK_ADS', lifecycleStage: 'SQL', leadScore: 83,
    tags: ['agency', 'warm'], createdAt: '2026-03-24'
  },
  {
    id: '6', firstName: 'Carlos', lastName: 'Torres', email: 'carlos@brandmax.io',
    company: 'BrandMax', jobTitle: 'Director of Growth', phone: '+1 555-0106',
    source: 'COLD_EMAIL', lifecycleStage: 'MQL', leadScore: 68,
    tags: ['cold-email', 'ecommerce'], createdAt: '2026-03-25'
  },
  {
    id: '7', firstName: 'Aisha', lastName: 'Patel', email: 'aisha@cloudventures.com',
    company: 'Cloud Ventures', jobTitle: 'CTO', phone: '+1 555-0107',
    source: 'REFERRAL', lifecycleStage: 'CUSTOMER', leadScore: 95,
    tags: ['vip', 'customer', 'expansion'], createdAt: '2026-01-10'
  },
]

const sourceColors: Record<string, string> = {
  GOOGLE_ADS: 'bg-blue-50 text-blue-700 border-blue-200',
  META_ADS: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  TIKTOK_ADS: 'bg-pink-50 text-pink-700 border-pink-200',
  LINKEDIN_ADS: 'bg-sky-50 text-sky-700 border-sky-200',
  ORGANIC: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COLD_EMAIL: 'bg-amber-50 text-amber-700 border-amber-200',
  REFERRAL: 'bg-purple-50 text-purple-700 border-purple-200',
}

const stageColors: Record<string, string> = {
  SUBSCRIBER: 'bg-slate-100 text-slate-600',
  LEAD: 'bg-blue-100 text-blue-700',
  MQL: 'bg-purple-100 text-purple-700',
  SQL: 'bg-orange-100 text-orange-700',
  OPPORTUNITY: 'bg-yellow-100 text-yellow-700',
  CUSTOMER: 'bg-emerald-100 text-emerald-700',
  EVANGELIST: 'bg-green-100 text-green-700',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-700 bg-emerald-50' :
    score >= 60 ? 'text-blue-700 bg-blue-50' :
      score >= 40 ? 'text-yellow-700 bg-yellow-50' : 'text-red-700 bg-red-50'
  return (
    <div className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', color)}>
      <div className="w-1.5 h-1.5 rounded-full bg-current" />
      {score}
    </div>
  )
}

export default function ContactsPage() {
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  const filtered = contacts.filter(c => {
    const matchSearch = !search ||
      `${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase())
    const matchStage = !selectedStage || c.lifecycleStage === selectedStage
    return matchSearch && matchStage
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{contacts.length} total contacts · {contacts.filter(c => c.lifecycleStage === 'SQL').length} SQL</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Import className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Stage filter chips */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'LEAD', 'MQL', 'SQL', 'OPPORTUNITY', 'CUSTOMER'].map(stage => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage === 'All' ? null : stage)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              (stage === 'All' && !selectedStage) || selectedStage === stage
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-background border-border text-muted-foreground hover:border-violet-300'
            )}
          >
            {stage === 'All' ? `All (${contacts.length})` :
              `${stage} (${contacts.filter(c => c.lifecycleStage === stage).length})`}
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
        <Button variant="outline" size="sm" className="h-9">
          <ArrowUpDown className="w-4 h-4 mr-2" /> Sort
        </Button>
        <Button variant="outline" size="sm" className="h-9 text-violet-600 border-violet-200 hover:bg-violet-50">
          <Zap className="w-4 h-4 mr-2" /> AI Segment
        </Button>
      </div>

      {/* Contacts table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="w-8 py-3 px-4">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Contact</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Company</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Stage</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Score</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Source</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Tags</th>
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">Added</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium">{contact.company}</p>
                        <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stageColors[contact.lifecycleStage])}>
                        {contact.lifecycleStage}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <ScoreBadge score={contact.leadScore} />
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', sourceColors[contact.source])}>
                        {contact.source.replace('_ADS', '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">
                            +{contact.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Mail className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Phone className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing {filtered.length} of {contacts.length} contacts</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
