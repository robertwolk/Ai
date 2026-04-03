import { Sidebar } from "@/components/sidebar";
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
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
