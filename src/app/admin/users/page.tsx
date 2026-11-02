"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Edit2,
  Trash2,
  Shield,
  KeyRound,
  Eye,
  UserCheck,
  UserX,
  AlertTriangle,
  X,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { ETHIOPIAN_REGIONS } from "@/lib/location/regions";
import { withBasePath } from '@/lib/base-path';

export default function UserManagementPage() {
  const regions = ETHIOPIAN_REGIONS;
  const [usersList, setUsersList] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);

  // Add User Form State
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("+251 9");
  const [newRole, setNewRole] = useState("user");
  const [newStatus, setNewStatus] = useState("active");
  const [newLanguage, setNewLanguage] = useState("am");
  const [newRegion, setNewRegion] = useState("Addis Ababa");
  const [newNotes, setNewNotes] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Edit User Form State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLanguage, setEditLanguage] = useState("am");
  const [editRegion, setEditRegion] = useState("Addis Ababa");
  const [editNotes, setEditNotes] = useState("");

  // Status & Reset state
  const [suspensionReason, setSuspensionReason] = useState("");
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchUsers() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        role: roleFilter,
        status: statusFilter,
      });
      const res = await fetch(withBasePath(`/api/admin/users?${query.toString()}`));
      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(data.data.users || []);
        setTotalUsers(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  }

  async function openDetailModal(user: any) {
    setSelectedUser(user);
    setShowDetailModal(true);
    try {
      const res = await fetch(withBasePath(`/api/admin/users/${user.id}`));
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedUser(data.data);
        setUserStats(data.data.stats);
        setUserActivities(data.data.recentActivities || []);
      }
    } catch (err) {
      console.error("Error fetching user detail:", err);
    }
  }

  function openEditModal(user: any) {
    setSelectedUser(user);
    setEditName(user.name || "");
    setEditPhone(user.phone || "");
    setEditLanguage(user.preferredLanguage || "en");
    setEditRegion(user.region || "Addis Ababa");
    setEditNotes(user.notes || "");
    setShowEditModal(true);
  }

  async function handleAddUser(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch(withBasePath("/api/admin/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          fullName: newName,
          phone: newPhone,
          role: newRole,
          status: newStatus,
          preferredLanguage: newLanguage,
          region: newRegion,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create user");

      setShowAddModal(false);
      const tempPassword: string | undefined = data.data.temporaryPassword;
      setNotification({
        type: "success",
        text: tempPassword
          ? `User ${newEmail} created. Temporary password (share securely): ${tempPassword}`
          : `User ${newEmail} created successfully.`,
      });
      // Reset form
      setNewEmail("");
      setNewName("");
      setNewPhone("+251 9");
      fetchUsers();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error creating user." });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdateUser(e: FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      const res = await fetch(withBasePath(`/api/admin/users/${selectedUser.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          preferredLanguage: editLanguage,
          region: editRegion,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");

      setShowEditModal(false);
      setNotification({ type: "success", text: "User information updated." });
      fetchUsers();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error updating user." });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleStatusChange(status: "active" | "suspended" | "inactive") {
    if (!selectedUser) return;
    try {
      const res = await fetch(withBasePath(`/api/admin/users/${selectedUser.id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: suspensionReason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Status update failed");

      setShowStatusModal(false);
      setNotification({ type: "success", text: `User status changed to ${status}.` });
      fetchUsers();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error updating status." });
    }
  }

  async function handleResetPassword() {
    if (!selectedUser) return;
    try {
      const res = await fetch(withBasePath(`/api/admin/users/${selectedUser.id}/reset-password`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Reset failed");

      setTempPasswordResult(data.data.temporaryPassword);
      setNotification({ type: "success", text: "Password reset complete." });
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error resetting password." });
    }
  }

  async function handleImpersonate(userId: string) {
    try {
      const res = await fetch(withBasePath(`/api/admin/users/${userId}/impersonate`), { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Impersonation failed");
      window.location.href = withBasePath("/case");
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Impersonation failed." });
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;
    try {
      const res = await fetch(withBasePath(`/api/admin/users/${userId}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      setNotification({ type: "success", text: "User account deleted." });
      fetchUsers();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error deleting user." });
    }
  }

  const rolePillColors: Record<string, string> = {
    super_admin: "bg-plum-soft border-plum/40 text-plum-strong",
    admin: "bg-danger-soft border-danger/40 text-danger-strong",
    editor: "bg-info-soft border-info/40 text-info-strong",
    reviewer: "bg-info-soft border-info/40 text-info-strong",
    practitioner: "bg-info-soft border-info/40 text-info-strong",
    premium: "bg-gold-soft border-gold/40 text-gold-strong",
    user: "bg-brand-soft border-brand/40 text-brand-strong",
    analyst: "bg-muted border-border-strong text-soft",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">User Administration</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage registered Ethiopian wellbeing platform accounts, roles, access statuses, and sessions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Plus size={15} />
            <span>Add New User</span>
          </button>
          <a
            download="users_export.csv"
            href={withBasePath("/api/admin/users/export?format=csv")}
            className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-colors flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-medium border ${notification.type === "success"
              ? "bg-brand-soft border-brand/40 text-brand-strong"
              : "bg-danger-soft border-danger/40 text-danger-strong"
            }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground text-xs focus:outline-none focus:border-brand placeholder:text-subtle"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter size={13} />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-sunken/80 border border-border text-xs text-foreground focus:outline-none focus:border-brand"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="reviewer">Reviewer</option>
            <option value="practitioner">Practitioner</option>
            <option value="premium">Premium</option>
            <option value="user">User</option>
            <option value="analyst">Analyst</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-sunken/80 border border-border text-xs text-foreground focus:outline-none focus:border-brand"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-border overflow-hidden shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-soft">
            <thead className="bg-sunken/80 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Phone / Region</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    Loading users directory...
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    No users matching the criteria.
                  </td>
                </tr>
              ) : (
                usersList.map((user, idx) => {
                  const status = user.isSuspended ? "Suspended" : user.isActive ? "Active" : "Inactive";
                  return (
                    <tr key={user.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-subtle">{(page - 1) * limit + idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand/40 flex items-center justify-center font-bold text-brand-strong text-xs shrink-0">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{user.name || "Unnamed"}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-soft block">{user.phone || "—"}</span>
                          <span className="text-[11px] text-subtle">{user.region || "Ethiopia"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rolePillColors[user.role] || "bg-foreground/5 border-border text-soft"
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status === "Active"
                              ? "bg-brand-soft border-brand/40 text-brand-strong"
                              : status === "Suspended"
                                ? "bg-danger-soft border-danger/40 text-danger-strong"
                                : "bg-muted border-border-strong text-muted-foreground"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${status === "Active" ? "bg-brand" : status === "Suspended" ? "bg-danger" : "bg-muted-foreground"
                              }`}
                          />
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailModal(user)}
                            title="View Profile"
                            className="p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-soft hover:text-foreground border border-border"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            title="Edit User"
                            className="p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-soft hover:text-foreground border border-border"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowStatusModal(true);
                            }}
                            title="Change Status (Suspend/Activate)"
                            className="p-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-gold hover:text-gold-strong border border-border"
                          >
                            <Shield size={13} />
                          </button>
                          <button
                            onClick={() => handleImpersonate(user.id)}
                            title="Impersonate User"
                            className="p-1.5 rounded-lg bg-plum-soft hover:bg-plum-soft text-plum-strong border border-plum/20"
                          >
                            <ExternalLink size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                            className="p-1.5 rounded-lg bg-danger-soft hover:bg-danger-soft text-danger-strong hover:text-danger-strong border border-danger/20"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Showing <span className="text-foreground font-mono">{usersList.length}</span> of{" "}
            <span className="text-foreground font-mono">{totalUsers}</span> users
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

      {/* MODAL 1: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-border shadow-raised relative">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus size={16} className="text-brand" />
                <span>Add New Platform User</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-soft font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Tigist Mulugeta"
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-soft font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@ethio-wellness.org"
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-soft font-medium mb-1">Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  >
                    <option value="user">Standard User</option>
                    <option value="premium">Premium User</option>
                    <option value="practitioner">Wellbeing Practitioner</option>
                    <option value="editor">Content Editor</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-soft font-medium mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-soft font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-soft font-medium mb-1">Preferred Language</label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  >
                    <option value="am">አማርኛ (Amharic)</option>
                    <option value="om">Afaan Oromoo</option>
                    <option value="en">English</option>
                    <option value="ti">ትግርኛ (Tigrinya)</option>
                    <option value="so">Af-Soomaali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-soft font-medium mb-1">Region</label>
                <select
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                >
                  {!regions.includes(newRegion) && newRegion && <option value={newRegion}>{newRegion}</option>}
                  {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-soft font-medium mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Internal notes regarding this user account..."
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-soft"
                >
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary px-5 py-2 rounded-xl font-semibold">
                  {formLoading ? "Creating..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: USER DETAIL DRAWER */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-border shadow-raised relative">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <span className="text-[10px] text-brand uppercase tracking-wider">
                  USR-{selectedUser.id.slice(0, 8)}
                </span>
                <h2 className="text-lg font-bold text-foreground">{selectedUser.name || "User Profile"}</h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-sunken/80 border border-border flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-soft border border-brand/40 flex items-center justify-center text-xl font-bold text-brand-strong shrink-0">
                  {selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 w-full">
                  <div>
                    <span className="text-[11px] text-subtle block">Email Address</span>
                    <span className="text-soft font-mono">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-subtle block">Phone</span>
                    <span className="text-soft">{selectedUser.phone || "Not set"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-subtle block">Role</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rolePillColors[selectedUser.role] || "bg-foreground/5 text-soft"
                        }`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-subtle block">Status</span>
                    <span className="text-brand font-semibold">
                      {selectedUser.isSuspended ? "Suspended" : selectedUser.isActive ? "Active ✅" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-subtle block">Region</span>
                    <span className="text-soft">{selectedUser.region || "Ethiopia"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-subtle block">Language</span>
                    <span className="text-soft uppercase">{selectedUser.preferredLanguage || "en"}</span>
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-foreground/5 border border-border">
                  <span className="text-lg font-bold text-foreground block">{userStats?.casesCount || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Cases</span>
                </div>
                <div className="p-3 rounded-xl bg-foreground/5 border border-border">
                  <span className="text-lg font-bold text-brand block">{userStats?.sessionsCount || 1}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Sessions</span>
                </div>
                <div className="p-3 rounded-xl bg-foreground/5 border border-border">
                  <span className="text-lg font-bold text-gold block">{userStats?.reportsCount || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Reports</span>
                </div>
                <div className="p-3 rounded-xl bg-foreground/5 border border-border">
                  <span className="text-lg font-bold text-info block">{selectedUser.loginCount || 1}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Logins</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-semibold text-foreground mb-2">Recent User Activity</h3>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {userActivities.length === 0 ? (
                    <div className="p-2.5 text-center text-subtle">No recorded activities yet.</div>
                  ) : (
                    userActivities.map((act) => (
                      <div key={act.id} className="p-2 rounded-lg bg-sunken/50 border border-border flex justify-between">
                        <span className="text-soft">{act.description}</span>
                        <span className="text-[10px] text-subtle font-mono">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => handleImpersonate(selectedUser.id)}
                  className="px-3 py-2 rounded-xl bg-plum-soft hover:bg-plum-soft border border-plum/30 text-plum-strong font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Impersonate User</span>
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowResetModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-gold-soft hover:bg-gold-soft border border-gold/30 text-gold-strong font-semibold flex items-center gap-1.5"
                >
                  <KeyRound size={13} />
                  <span>Reset Password</span>
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowStatusModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-danger-soft hover:bg-danger-soft border border-danger/30 text-danger-strong font-semibold flex items-center gap-1.5"
                >
                  <Shield size={13} />
                  <span>Suspend Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-border shadow-raised relative">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-foreground">Edit User: {selectedUser.name || selectedUser.email}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-soft font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-soft font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-soft font-medium mb-1">Preferred Language</label>
                  <select
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  >
                    <option value="am">አማርኛ (Amharic)</option>
                    <option value="om">Afaan Oromoo</option>
                    <option value="en">English</option>
                    <option value="ti">ትግርኛ (Tigrinya)</option>
                    <option value="so">Af-Soomaali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-soft font-medium mb-1">Region</label>
                  <select
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                  >
                    {!regions.includes(editRegion) && editRegion && <option value={editRegion}>{editRegion}</option>}
                    {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-soft font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-soft"
                >
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary px-5 py-2 rounded-xl font-semibold">
                  {formLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SUSPEND / STATUS */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-border shadow-raised relative text-xs">
            <h2 className="text-sm font-bold text-foreground mb-2">Change User Access Status</h2>
            <p className="text-muted-foreground mb-4">
              Select access state for <strong className="text-soft">{selectedUser.name || selectedUser.email}</strong>.
            </p>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleStatusChange("active")}
                className="w-full py-2.5 px-3 rounded-xl bg-brand-soft hover:bg-brand-soft border border-brand/40 text-brand-strong font-semibold flex items-center justify-center gap-2"
              >
                <UserCheck size={14} />
                <span>Activate User</span>
              </button>
              <button
                onClick={() => handleStatusChange("suspended")}
                className="w-full py-2.5 px-3 rounded-xl bg-danger-soft hover:bg-danger-soft border border-danger/40 text-danger-strong font-semibold flex items-center justify-center gap-2"
              >
                <UserX size={14} />
                <span>Suspend User</span>
              </button>
              <button
                onClick={() => handleStatusChange("inactive")}
                className="w-full py-2.5 px-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-soft font-semibold"
              >
                Mark Inactive
              </button>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: RESET PASSWORD */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-border shadow-raised relative text-xs">
            <h2 className="text-sm font-bold text-foreground mb-2">Reset User Password</h2>
            <p className="text-muted-foreground mb-4">
              Generate a temporary password for <strong className="text-soft">{selectedUser.email}</strong>.
            </p>

            {tempPasswordResult ? (
              <div className="p-3 bg-brand-soft border border-brand/40 rounded-xl mb-4 text-brand-strong">
                <strong>New Temporary Password:</strong>
                <div className="font-mono text-sm bg-sunken/80 p-2 rounded mt-1 select-all">{tempPasswordResult}</div>
                <p className="text-[11px] text-muted-foreground mt-1">Please provide this code to the user securely.</p>
              </div>
            ) : null}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setTempPasswordResult(null);
                }}
                className="flex-1 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground"
              >
                Close
              </button>
              {!tempPasswordResult && (
                <button onClick={handleResetPassword} className="btn-primary flex-1 py-2 rounded-xl font-semibold">
                  Generate Temp Password
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
