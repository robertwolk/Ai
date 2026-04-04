'use client'

import { useState } from 'react'
import { Plus, DollarSign, Zap, Filter, Calendar, MoreHorizontal, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const stages = [
  { id: 'LEAD', name: 'Lead', color: 'bg-slate-200', count: 0 },
  { id: 'QUALIFIED', name: 'Qualified', color: 'bg-blue-200', count: 0 },
  { id: 'MEETING_BOOKED', name: 'Meeting Booked', color: 'bg-purple-200', count: 0 },
  { id: 'PROPOSAL_SENT', name: 'Proposal Sent', color: 'bg-amber-200', count: 0 },
  { id: 'NEGOTIATION', name: 'Negotiation', color: 'bg-orange-200', count: 0 },
  { id: 'WON', name: 'Won', color: 'bg-emerald-200', count: 0 },
]

const deals = [
  { id: '1', title: 'Enterprise CRM License', contact: 'Sarah Chen', company: 'Acme Corp', value: 24500, stage: 'NEGOTIATION', probability: 75, source: 'GOOGLE', expectedClose: '2026-04-15', daysInStage: 5 },
  { id: '2', title: 'Marketing Suite Pro', contact: 'Marcus Rivera', company: 'TechFlow Inc', value: 18200, stage: 'PROPOSAL_SENT', probability: 50, source: 'META', expectedClose: '2026-04-20', daysInStage: 8 },
  { id: '3', title: 'Growth Platform', contact: 'Emma Walsh', company: 'GrowthHub', value: 31000, stage: 'MEETING_BOOKED', probability: 40, source: 'LINKEDIN', expectedClose: '2026-04-30', daysInStage: 2 },
  { id: '4', title: 'Analytics Starter', contact: 'Jake Morrison', company: 'DataStream', value: 9800, stage: 'QUALIFIED', probability: 30, source: 'ORGANIC', expectedClose: '2026-05-10', daysInStage: 3 },
  { id: '5', title: 'AI Content Suite', contact: 'Priya Sharma', company: 'Nexus Digital', value: 42600, stage: 'NEGOTIATION', probability: 80, source: 'TIKTOK', expectedClose: '2026-04-10', daysInStage: 12 },
  { id: '6', title: 'CRM Basic', contact: 'Carlos Torres', company: 'BrandMax', value: 6200, stage: 'LEAD', probability: 10, source: 'EMAIL', expectedClose: '2026-05-20', daysInStage: 1 },
  { id: '7', title: 'Platform Expansion', contact: 'Aisha Patel', company: 'Cloud Ventures', value: 58000, stage: 'WON', probability: 100, source: 'REFERRAL', expectedClose: '2026-04-01', daysInStage: 0 },
  { id: '8', title: 'SEO & Content Tools', contact: 'Ryan Chen', company: 'DigitalEdge', value: 14400, stage: 'QUALIFIED', probability: 35, source: 'GOOGLE', expectedClose: '2026-05-05', daysInStage: 6 },
  { id: '9', title: 'Social Media Pack', contact: 'Nina Rodgers', company: 'Bloom Creative', value: 8900, stage: 'MEETING_BOOKED', probability: 45, source: 'META', expectedClose: '2026-04-25', daysInStage: 4 },
]

const sourceColors: Record<string, string> = {
  GOOGLE: '#4285f4',
  META: '#1877f2',
  TIKTOK: '#ff0050',
  LINKEDIN: '#0a66c2',
  ORGANIC: '#10b981',
  REFERRAL: '#8b5cf6',
  EMAIL: '#f59e0b',
}

function DealCard({ deal }: { deal: typeof deals[0] }) {
  const probabilityColor = deal.probability >= 70 ? 'text-emerald-600' :
    deal.probability >= 40 ? 'text-amber-600' : 'text-slate-500'

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-violet-200 transition-all duration-150 group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{deal.title}</p>
          <p className="text-xs text-muted-foreground">{deal.contact} · {deal.company}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">${deal.value.toLocaleString()}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: sourceColors[deal.source] }} />
          <span className={cn('text-xs font-medium', probabilityColor)}>{deal.probability}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(deal.expectedClose).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {deal.daysInStage}d in stage
        </span>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const dealsByStage = stages.map(stage => ({
    ...stage,
    deals: deals.filter(d => d.stage === stage.id),
    totalValue: deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + d.value, 0),
  }))

  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0)
  const weightedValue = deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {deals.length} deals · ${(totalPipelineValue / 1000).toFixed(0)}K total · ${(weightedValue / 1000).toFixed(0)}K weighted
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="text-violet-600 border-violet-200 hover:bg-violet-50">
            <Zap className="w-4 h-4 mr-2" /> AI Forecast
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Add Deal
          </Button>
        </div>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Pipeline</p>
          <p className="text-xl font-bold">${(totalPipelineValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Weighted Forecast</p>
          <p className="text-xl font-bold text-violet-600">${(weightedValue / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Win Rate (30d)</p>
          <p className="text-xl font-bold text-emerald-600">34%</p>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {dealsByStage.map((stage) => (
          <div key={stage.id} className="flex flex-col gap-2 min-w-[260px] max-w-[280px] flex-shrink-0">
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                <span className="font-medium text-sm">{stage.name}</span>
                <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-full">
                  {stage.deals.length}
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                ${(stage.totalValue / 1000).toFixed(0)}K
              </span>
            </div>

            {/* Deal cards */}
            <div className="flex flex-col gap-2">
              {stage.deals.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>

            {/* Add deal button */}
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-violet-300 hover:text-violet-600 transition-colors">
              <Plus className="w-4 h-4" />
              Add deal
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
