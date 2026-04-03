import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { requireAuth } from "@/lib/auth-helpers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <TopBar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
