import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="text-center space-y-8 max-w-2xl px-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight">
          CRM Hub
        </h1>

        <p className="text-xl text-blue-200/80 leading-relaxed">
          A comprehensive CRM with integrated multi-platform ad management,
          social media studio, and AI-powered lead generation.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm text-left max-w-md mx-auto">
          {[
            "Contact Management",
            "Deal Pipeline",
            "Multi-Platform Ads",
            "Social Studio",
            "Lead Generation",
            "Analytics & Reports",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-blue-200/70">
              <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-colors"
        >
          Open Dashboard
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
