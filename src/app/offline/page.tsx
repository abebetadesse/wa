import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="app-container py-16">
      <div className="glass-panel max-w-xl mx-auto p-8 text-center border-t-2 border-t-amber-400">
        <div className="text-4xl mb-4">◌</div>
        <div className="badge badge-moderate mb-4">Offline mode</div>
        <h1 className="text-3xl font-extrabold text-white mb-3">You are temporarily offline</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Cached wellness and constitution tools remain available. Reconnect before submitting an intake or generating a Debral report.
        </p>
        <Link href="/wellness" className="btn-primary inline-flex text-sm py-2.5 px-5">Open cached wellness plan</Link>
      </div>
    </div>
  );
}
