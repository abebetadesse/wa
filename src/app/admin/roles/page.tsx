"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  KeyRound,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckSquare,
  Square,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES } from "@/lib/db/schema/rbac";
import { withBasePath } from '@/lib/base-path';

export default function RoleManagementPage() {
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Selected Role for Edit
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleDescription, setRoleDescription] = useState("");
  const [roleMembers, setRoleMembers] = useState<any[]>([]);

  // Add Form
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([
    "public:view",
    "profile:view",
    "cases:create",
    "cases:view",
  ]);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    setLoading(true);
    try {
      const res = await fetch(withBasePath("/api/admin/roles"));
      const data = await res.json();
      if (data.success && data.data) {
        setRolesList(data.data);
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    } finally {
      setLoading(false);
    }
  }

  function openEditRole(role: any) {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
    setRoleDescription(role.description || "");
    setShowEditModal(true);
  }

  async function openMembers(role: any) {
    setSelectedRole(role);
    setShowMembersModal(true);
    try {
      const res = await fetch(withBasePath(`/api/admin/roles/${role.id}/users`));
      const data = await res.json();
      if (data.success && data.data) {
        setRoleMembers(data.data.users || []);
      }
    } catch (err) {
      console.error("Error loading role members:", err);
    }
  }

  function togglePermission(key: string) {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function toggleNewPermission(key: string) {
    setNewRolePermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function handleSaveRole(e: FormEvent) {
    e.preventDefault();
    if (!selectedRole) return;
    try {
      const res = await fetch(withBasePath(`/api/admin/roles/${selectedRole.id}/permissions`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: selectedPermissions }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");

      // Also update description if changed
      await fetch(withBasePath(`/api/admin/roles/${selectedRole.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: roleDescription, permissions: selectedPermissions }),
      });

      setShowEditModal(false);
      setNotification({ type: "success", text: `Role '${selectedRole.name}' permissions updated successfully.` });
      fetchRoles();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error saving role." });
    }
  }

  async function handleCreateRole(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(withBasePath("/api/admin/roles"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: newRolePermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Create failed");

      setShowAddModal(false);
      setNotification({ type: "success", text: `Role '${newRoleName}' created.` });
      setNewRoleName("");
      setNewRoleDesc("");
      fetchRoles();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error creating role." });
    }
  }

  async function handleDeleteRole(role: any) {
    if (!confirm(`Are you sure you want to delete role '${role.name}'?`)) return;
    try {
      const res = await fetch(withBasePath(`/api/admin/roles/${role.id}`), { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");

      setNotification({ type: "success", text: `Role '${role.name}' deleted.` });
      fetchRoles();
    } catch (err) {
      setNotification({ type: "error", text: err instanceof Error ? err.message : "Error deleting role." });
    }
  }

  // Group permissions by category for organized rendering
  const permissionsByCategory = Object.values(PERMISSION_CATEGORIES).map((cat) => ({
    category: cat,
    items: ALL_PERMISSIONS.filter((p) => p.category === cat),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Role & Permissions Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure access control rules, capabilities, and scientific authority levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md"
          >
            <Plus size={15} />
            <span>Create Custom Role</span>
          </button>
          <button
            onClick={fetchRoles}
            className="px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border text-xs font-medium text-soft transition-colors"
          >
            Refresh
          </button>
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
            {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-muted-foreground text-xs">Loading roles...</div>
        ) : (
          rolesList.map((role) => (
            <div
              key={role.id}
              className="glass-panel p-5 rounded-2xl border border-border shadow-panel flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-soft border border-brand/40 flex items-center justify-center text-brand-strong shrink-0">
                      <KeyRound size={15} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground capitalize">{role.name.replace(/_/g, " ")}</h2>
                      <span className="text-[10px] text-muted-foreground font-mono">key: {role.name}</span>
                    </div>
                  </div>
                  {role.isSystemRole && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold-soft border border-gold/40 text-gold-strong">
                      System Role
                    </span>
                  )}
                </div>

                <p className="text-xs text-soft line-clamp-2 mt-2 leading-relaxed">
                  {role.description || "Custom enterprise permission group."}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  <button
                    onClick={() => openMembers(role)}
                    className="flex items-center gap-1.5 hover:text-brand transition-colors text-left"
                  >
                    <Users size={13} className="text-brand" />
                    <span>
                      <strong className="text-foreground font-mono">{role.userCount}</strong> assigned
                    </span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-gold" />
                    <span>
                      <strong className="text-foreground font-mono">{role.permissionsCount}</strong> permissions
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-5 pt-3 border-t border-border">
                <button
                  onClick={() => openEditRole(role)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-semibold text-soft border border-border flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit Permissions</span>
                </button>
                {!role.isSystemRole && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-2 rounded-xl bg-danger-soft hover:bg-danger-soft text-danger-strong border border-danger/20 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: EDIT ROLE & PERMISSIONS MATRIX */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl glass-panel p-6 rounded-2xl border border-border shadow-raised relative my-8">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <span className="text-[10px] text-brand uppercase tracking-wider">
                  Configuring Role: {selectedRole.name}
                </span>
                <h2 className="text-lg font-bold text-foreground capitalize">
                  Permissions Matrix: {selectedRole.name.replace(/_/g, " ")}
                </h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-5 text-xs">
              <div>
                <label className="block text-soft font-medium mb-1">Role Description</label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              {/* Special wildcard banner */}
              {selectedPermissions.includes("*") ? (
                <div className="p-3 bg-plum-soft border border-plum/40 rounded-xl text-plum-strong flex items-center gap-2">
                  <Sparkles size={16} />
                  <span>
                    This role holds the <strong>Wildcard (*) Permission</strong>: complete, unrestricted system access.
                  </span>
                </div>
              ) : null}

              {/* Categorized Permissions Grid */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {permissionsByCategory.map((catGroup) => (
                  <div key={catGroup.category} className="p-3.5 rounded-xl bg-sunken/80 border border-border">
                    <h3 className="text-xs font-bold text-brand uppercase tracking-wider mb-2">
                      {catGroup.category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catGroup.items.map((perm) => {
                        const isChecked =
                          selectedPermissions.includes("*") || selectedPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${isChecked
                                ? "bg-brand-soft border border-brand/30 text-soft"
                                : "hover:bg-foreground/5 text-muted-foreground"
                              }`}
                          >
                            <input
                              type="checkbox"
                              disabled={selectedPermissions.includes("*")}
                              checked={isChecked}
                              onChange={() => togglePermission(perm.key)}
                              className="mt-0.5 rounded border-border-strong bg-sunken/80 text-brand"
                            />
                            <div>
                              <span className="font-semibold block text-foreground">{perm.label}</span>
                              <span className="text-[10px] font-mono text-subtle">{perm.key}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-muted-foreground font-mono">
                  {selectedPermissions.length} permission(s) granted
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-soft font-medium"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-5 py-2 rounded-xl font-semibold">
                    Save Role Permissions
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ROLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl border border-border shadow-raised relative my-8">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus size={16} className="text-brand" />
                <span>Create Custom Enterprise Role</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-soft font-medium mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. scientific_evaluator"
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-soft font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Briefly describe the responsibilities of this role..."
                  className="w-full px-3 py-2 rounded-xl bg-sunken/80 border border-border text-foreground focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-soft font-medium mb-2">Select Initial Permissions</label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-sunken/50 rounded-xl border border-border">
                  {ALL_PERMISSIONS.slice(0, 15).map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 text-soft cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRolePermissions.includes(perm.key)}
                        onChange={() => toggleNewPermission(perm.key)}
                        className="rounded border-border-strong bg-sunken/80 text-brand"
                      />
                      <span>{perm.label}</span>
                      <span className="text-[10px] text-subtle font-mono ml-auto">{perm.key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-soft"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2 rounded-xl font-semibold">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW ROLE MEMBERS */}
      {showMembersModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-border shadow-raised relative text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h2 className="text-sm font-bold text-foreground">
                Members with Role: <span className="text-brand capitalize">{selectedRole.name}</span>
              </h2>
              <button onClick={() => setShowMembersModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {roleMembers.length === 0 ? (
                <div className="p-6 text-center text-subtle">No users currently assigned to this role.</div>
              ) : (
                roleMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-sunken/50 border border-border flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">{m.name || "Unnamed"}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{m.email}</span>
                    </div>
                    <span className="text-[10px] text-subtle font-mono">
                      Joined: {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border text-right">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-soft font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
