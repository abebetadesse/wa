export type RoleName =
  | "super_admin"
  | "admin"
  | "premium"
  | "user"
  | "editor"
  | "reviewer"
  | "practitioner"
  | "analyst"
  | "guest";

export const PERMISSION_CATEGORIES = {
  PUBLIC: "Public & General",
  PROFILE: "User Profile",
  CASES: "Clinical Cases",
  PREMIUM_FEATURES: "Premium Features & AI",
  CONTENT: "Knowledge & Content Management",
  USER_MANAGEMENT: "User Management",
  ROLE_MANAGEMENT: "Role Management",
  AUDIT_ANALYTICS: "Audit & Analytics",
  SYSTEM: "System Administration",
  PRACTITIONER: "Practitioner Portal",
} as const;

export const ALL_PERMISSIONS = [
  // Public
  { key: "public:view", label: "View Public Pages", category: PERMISSION_CATEGORIES.PUBLIC },
  { key: "auth:register", label: "User Registration & Login", category: PERMISSION_CATEGORIES.PUBLIC },

  // Profile
  { key: "profile:view", label: "View Own Profile", category: PERMISSION_CATEGORIES.PROFILE },
  { key: "profile:edit", label: "Edit Own Profile", category: PERMISSION_CATEGORIES.PROFILE },

  // Cases
  { key: "cases:create", label: "Create health Cases", category: PERMISSION_CATEGORIES.CASES },
  { key: "cases:view", label: "View Own health Cases", category: PERMISSION_CATEGORIES.CASES },
  { key: "cases:edit", label: "Edit Own health Cases", category: PERMISSION_CATEGORIES.CASES },

  // Premium Features
  { key: "ai:chat", label: "Advanced AI Chat Engine", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  { key: "reports:full", label: "Full Multi-Disciplinary Reports", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  { key: "reports:basic", label: "Basic health Gap Reports", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },
  { key: "data:export", label: "Export health Data (JSON/CSV)", category: PERMISSION_CATEGORIES.PREMIUM_FEATURES },

  // Content
  { key: "content:view", label: "View Knowledge Base Items", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:edit", label: "Edit Knowledge Base Strands & Items", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:submit", label: "Submit Knowledge Content for Review", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:review", label: "Review Knowledge Content Submissions", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:approve", label: "Approve Knowledge Content", category: PERMISSION_CATEGORIES.CONTENT },
  { key: "content:publish", label: "Publish Knowledge Content", category: PERMISSION_CATEGORIES.CONTENT },

  // User Management
  { key: "users:view", label: "View User Directory", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:create", label: "Create Users", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:edit", label: "Edit User Information", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:delete", label: "Delete Users", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:suspend", label: "Suspend / Activate Users", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },
  { key: "users:impersonate", label: "Impersonate User Account", category: PERMISSION_CATEGORIES.USER_MANAGEMENT },

  // Role Management
  { key: "roles:view", label: "View Roles & Permissions", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  { key: "roles:create", label: "Create Custom Roles", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  { key: "roles:edit", label: "Edit Roles & Permissions", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },
  { key: "roles:delete", label: "Delete Custom Roles", category: PERMISSION_CATEGORIES.ROLE_MANAGEMENT },

  // Audit & Analytics
  { key: "audit:view", label: "View System Audit Logs", category: PERMISSION_CATEGORIES.AUDIT_ANALYTICS },
  { key: "analytics:view", label: "View Analytics & Statistics", category: PERMISSION_CATEGORIES.AUDIT_ANALYTICS },

  // System
  { key: "settings:manage", label: "Manage System Settings", category: PERMISSION_CATEGORIES.SYSTEM },

  // Practitioner
  { key: "practitioner:profile:manage", label: "Manage Verified Practitioner Profile", category: PERMISSION_CATEGORIES.PRACTITIONER },
  { key: "practitioner:consult", label: "Consult Users & Clinical Sessions", category: PERMISSION_CATEGORIES.PRACTITIONER },
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number]["key"] | "*";

/**
 * Default permission assignments matching Section 4.1 & 5.3 of specification.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  super_admin: ["*"],
  admin: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view", "cases:edit", "reports:basic", "reports:full",
    "ai:chat", "data:export",
    "content:view", "content:edit", "content:submit", "content:review", "content:approve", "content:publish",
    "users:view", "users:create", "users:edit", "users:delete", "users:suspend",
    "roles:view",
    "audit:view", "analytics:view",
    "practitioner:consult", "practitioner:profile:manage",
  ],
  premium: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view", "cases:edit", "reports:basic", "reports:full",
    "ai:chat", "data:export", "practitioner:consult",
  ],
  user: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view", "cases:edit", "reports:basic",
  ],
  editor: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view", "cases:edit", "reports:basic", "reports:full",
    "ai:chat", "data:export",
    "content:view", "content:edit", "content:submit",
  ],
  reviewer: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view", "cases:edit", "reports:basic", "reports:full",
    "ai:chat", "data:export",
    "content:view", "content:review", "content:approve",
  ],
  practitioner: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view", "cases:edit", "reports:basic", "reports:full",
    "ai:chat", "data:export",
    "practitioner:profile:manage", "practitioner:consult",
  ],
  analyst: [
    "public:view", "auth:register", "profile:view", "profile:edit",
    "cases:create", "cases:view",
    "audit:view", "analytics:view",
  ],
  guest: [
    "public:view", "auth:register",
  ],
};

export function roleHasPermission(rolePermissions: string[], permission: string): boolean {
  if (rolePermissions.includes("*")) return true;
  return rolePermissions.includes(permission);
}
