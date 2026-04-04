'use client'

import { Bell, Search, Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function TopBar() {
    return (
          <header className="h-14 border-b bg-background flex items-center justify-between px-6 flex-shrink-0">
            {/* Search */}
                <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                                    placeholder="Search contacts, deals, campaigns..." 
                          className="pl-9 h-8 text-sm bg-muted/40 border-0 focus-visible:ring-1"
                                  />
                </div>div>
          
            {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Quick add */}
                        <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 gap-1.5">
                                  <Plus className="w-3.5 h-3.5" />
                                  Quick Add
                        </Button>Button>
                
                  {/* Notifications */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                                  <Bell className="w-4 h-4" />
                                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>Button>
                </div>div>
          </header>header>
        )
}</header>
