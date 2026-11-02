"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { FileText, Search, Filter, Clock, Eye, X, Terminal, ArrowRight, ArrowLeft } from "lucide-react";
import { withBasePath } from '@/lib/base-path';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Inspector Modal
  const [inspectEvent, setInspectEvent] = useState<any>(null);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        action: actionFilter,
      });
      const res = await fetch(withBasePath(`/api/admin/audit?${query.toString()}`));
      const data = await res.json();
      if (data.success && data.data) {
        setLogs(data.data.logs || []);
        setTotal(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, actionFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  }

  const actionColors: Record<string, string> = {
    user_login: "text-brand-strong bg-brand-soft border-brand/30",
    user_registered: "text-info-strong bg-info-soft border-info/30",
    user_created: "text-info-strong bg-info-soft border-info/30",
    user_updated: "text-gold-strong bg-gold-soft border-gold/30",
    user_deleted: "text-danger-strong bg-danger-soft border-danger/30",
    user_status_suspended: "text-danger-strong bg-danger-soft border-danger/30",
    user_impersonated: "text-plum-strong bg-plum-soft border-plum/30",
    role_created: "text-brand-strong bg-brand-soft border-brand/30",
    role_permissions_updated: "text-gold-strong bg-gold-soft border-gold/30",
    password_reset_completed: "text-info-strong bg-info-soft border-info/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Trail & Compliance Log</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable trace of administrative interventions, scientific evaluations, and authorization events.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-3.5 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-colors"
        >
          Refresh Log
        </button>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full md:w-80 relative">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, IP, or resource..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground text-xs focus:outline-none focus:border-brand placeholder:text-subtle"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter size={13} />
            <span>Action Type:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-sunken/80 border border-border text-xs text-foreground focus:outline-none focus:border-brand"
          >
            <option value="all">All Events</option>
            <option value="user_login">User Login</option>
            <option value="user_registered">User Registration</option>
            <option value="user_created">Admin User Creation</option>
            <option value="user_status_suspended">User Suspension</option>
            <option value="user_role_changed">Role Assignment</option>
            <option value="user_impersonated">Impersonation</option>
            <option value="role_created">Role Creation</option>
            <option value="role_permissions_updated">Permissions Update</option>
            <option value="admin_password_reset">Password Reset</option>
            <option value="system_initialized">System Initialization</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-border overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-soft">
            <thead className="bg-sunken/80 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const eventName = log.action || log.eventType || "system_event";
                  const colorClass = actionColors[eventName] || "text-soft bg-foreground/5 border-border";
                  return (
                    <tr key={log.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
                          {eventName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-soft">
                        {log.userName ? (
                          <div>
                            <span className="font-semibold text-foreground">{log.userName}</span>
                            <span className="text-[10px] text-subtle block">{log.userEmail}</span>
                          </div>
                        ) : log.userEmail ? (
                          log.userEmail
                        ) : (
                          <span className="text-subtle">System Root</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-soft">
                        {log.resourceType || "platform"}
                        {log.resourceId && <span className="text-subtle block text-[10px]">{log.resourceId}</span>}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{log.ipAddress || "127.0.0.1"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectEvent(log)}
                          className="px-2.5 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border text-[11px] text-soft hover:text-foreground flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Eye size={12} />
                          <span>Payload</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing <span className="text-foreground font-mono">{logs.length}</span> of{" "}
            <span className="text-foreground font-mono">{total}</span> audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border disabled:opacity-40 disabled:pointer-events-none text-soft"
            >
              Previous
            </button>
            <span className="font-mono text-soft">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border disabled:opacity-40 disabled:pointer-events-none text-soft"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* PAYLOAD INSPECTOR MODAL */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl border border-border shadow-raised relative text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-brand" />
                <h2 className="text-sm font-bold text-foreground font-mono">
                  Event: {inspectEvent.action || inspectEvent.eventType}
                </h2>
              </div>
              <button onClick={() => setInspectEvent(null)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-sunken/80 border border-border">
                <div>
                  <span className="text-subtle block">ID</span>
                  <span className="text-soft">{inspectEvent.id}</span>
                </div>
                <div>
                  <span className="text-subtle block">Timestamp</span>
                  <span className="text-soft">{new Date(inspectEvent.createdAt).toISOString()}</span>
                </div>
                <div>
                  <span className="text-subtle block">User Email</span>
                  <span className="text-soft">{inspectEvent.userEmail || "System"}</span>
                </div>
                <div>
                  <span className="text-subtle block">IP / User Agent</span>
                  <span className="text-soft truncate block">{inspectEvent.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1 font-sans text-xs font-semibold">
                  Payload & Telemetry JSON:
                </span>
                <pre className="p-3.5 rounded-xl bg-sunken/80 border border-border text-brand text-[11px] overflow-x-auto max-h-60">
                  {JSON.stringify(inspectEvent.details || inspectEvent.payload || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border text-right">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-soft font-medium"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
