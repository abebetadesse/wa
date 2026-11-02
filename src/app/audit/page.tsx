import { db } from "@/lib/db";
import { auditLog, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";

// Reads live data from the database; never prerender at build time.
export const dynamic = "force-dynamic";

export default async function AuditPage() {
  let logs: any[] = [];
  try {
    logs = await db
      .select({
        log: auditLog,
        user: users,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.userId, users.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(50);
  } catch (err) {
    console.error("Audit log query error:", err);
  }

  return (
    <div className="py-10">
      <div className="app-container">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="badge badge-safe mb-3">Enterprise Regulatory Governance</div>
          <h1 className="text-3xl font-extrabold text-foreground mb-3">
            Immutable Audit Trail &amp; Compliance Lineage
          </h1>
          <p className="text-sm text-soft leading-relaxed">
            Every execution of the evaluation engine, every intercepted traditional remedy, and every scientific report generation is permanently recorded in the append-only <code>audit_log</code> table. Rows in this table are immutable and cannot be updated or overwritten.
          </p>
        </div>

        {/* Governance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-4 rounded-xl bg-sunken/80 border border-border text-xs">
            <span className="text-brand font-semibold uppercase block mb-1">
              Data Proclamation Compliance
            </span>
            <p className="text-soft">
              Complies with Ethiopian Personal Data Protection Proclamation &amp; GDPR wellbeing data residency standards.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sunken/80 border border-border text-xs">
            <span className="text-gold font-semibold uppercase block mb-1">
              Deterministic Lineage
            </span>
            <p className="text-soft">
              Model version <code>eval-v3.0.0-deterministic+rules-2025</code> pinned with full reproducible audit trails.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sunken/80 border border-border text-xs">
            <span className="text-danger font-semibold uppercase block mb-1">
              Safety Intercept Logging
            </span>
            <p className="text-soft">
              Intercepted candidate remedies (e.g. Tena Adam with Warfarin) recorded for medical advisory review.
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Event Audit Log Entries ({logs.length})</h2>
            <Link href="/intake" className="btn-primary text-xs py-2 px-4">
              Trigger New Evaluation Event
            </Link>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No audit records currently found. Submit an intake assessment to generate initial audit entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-soft">
                <thead className="bg-foreground/5 uppercase text-[10px] text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">User / Client</th>
                    <th className="p-3">Audit Details &amp; Payload</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map(({ log, user }) => {
                    const payload = log.payload as any;
                    const reportId = payload?.reportId;

                    return (
                      <tr key={log.id} className="hover:bg-foreground/[0.02]">
                        <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`badge ${log.eventType === "gap_report_generated"
                              ? "badge-safe"
                              : log.eventType === "system_initialized"
                                ? "badge-low"
                                : "badge-moderate"
                              } text-[10px]`}
                          >
                            {log.eventType}
                          </span>
                        </td>
                        <td className="p-3 text-foreground font-medium">
                          {user?.name || "System Actor"}
                          {user?.email && <div className="text-[10px] text-subtle">{user.email}</div>}
                        </td>
                        <td className="p-3 max-w-md">
                          <div className="font-mono text-[11px] text-soft bg-sunken/80 p-2 rounded border border-border overflow-x-auto">
                            {JSON.stringify(payload)}
                          </div>
                        </td>
                        <td className="p-3">
                          {reportId && (
                            <Link
                              href={`/report/${reportId}`}
                              className="text-brand hover:text-brand font-semibold underline text-xs whitespace-nowrap"
                            >
                              View Report &rarr;
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
