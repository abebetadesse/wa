"use client";

import { useEffect, useState, FormEvent } from "react";
import { FileText, Search, Filter, Clock, Eye, X, Terminal, ArrowRight, ArrowLeft } from "lucide-react";

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

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter]);

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        action: actionFilter,
      });
      const res = await fetch(`/api/admin/audit?${query.toString()}`);
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
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  }

  const actionColors: Record<string, string> = {
    user_login: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
    user_registered: "text-sky-400 bg-sky-950/60 border-sky-500/30",
    user_created: "text-indigo-400 bg-indigo-950/60 border-indigo-500/30",
    user_updated: "text-amber-400 bg-amber-950/60 border-amber-500/30",
    user_deleted: "text-rose-400 bg-rose-950/60 border-rose-500/30",
    user_status_suspended: "text-rose-400 bg-rose-950/60 border-rose-500/30",
    user_impersonated: "text-purple-400 bg-purple-950/60 border-purple-500/30",
    role_created: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
    role_permissions_updated: "text-amber-400 bg-amber-950/60 border-amber-500/30",
    password_reset_completed: "text-sky-400 bg-sky-950/60 border-sky-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail & Compliance Log</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable trace of administrative interventions, clinical evaluations, and authorization events.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
        >
          Refresh Log
        </button>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full md:w-80 relative">
          <Search size={15} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, IP, or resource..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter size={13} />
            <span>Action Type:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
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
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-black/40 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const eventName = log.action || log.eventType || "system_event";
                  const colorClass = actionColors[eventName] || "text-slate-300 bg-white/5 border-white/10";
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
                          {eventName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {log.userName ? (
                          <div>
                            <span className="font-semibold text-white">{log.userName}</span>
                            <span className="text-[10px] text-slate-500 block">{log.userEmail}</span>
                          </div>
                        ) : log.userEmail ? (
                          log.userEmail
                        ) : (
                          <span className="text-slate-500">System Root</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.resourceType || "platform"}
                        {log.resourceId && <span className="text-slate-500 block text-[10px]">{log.resourceId}</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{log.ipAddress || "127.0.0.1"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectEvent(log)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 ml-auto transition-colors"
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
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-mono">{logs.length}</span> of{" "}
            <span className="text-white font-mono">{total}</span> audit records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:pointer-events-none text-slate-300"
            >
              Previous
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 disabled:pointer-events-none text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* PAYLOAD INSPECTOR MODAL */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl relative text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-mono">
                  Event: {inspectEvent.action || inspectEvent.eventType}
                </h2>
              </div>
              <button onClick={() => setInspectEvent(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <span className="text-slate-500 block">ID</span>
                  <span className="text-slate-200">{inspectEvent.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Timestamp</span>
                  <span className="text-slate-200">{new Date(inspectEvent.createdAt).toISOString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">User Email</span>
                  <span className="text-slate-200">{inspectEvent.userEmail || "System"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IP / User Agent</span>
                  <span className="text-slate-200 truncate block">{inspectEvent.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-sans text-xs font-semibold">
                  Payload & Telemetry JSON:
                </span>
                <pre className="p-3.5 rounded-xl bg-black/70 border border-white/10 text-emerald-400 text-[11px] overflow-x-auto max-h-60">
                  {JSON.stringify(inspectEvent.details || inspectEvent.payload || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium"
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
