'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
                <Sidebar />
                
            {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        <TopBar />
                        <main className="flex-1 overflow-y-auto p-6">
                          {children}
                        </main>main>
                </div>div>
          </div>div>
        )
}</div>
