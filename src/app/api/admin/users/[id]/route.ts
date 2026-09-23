import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { ADMIN_ROLES, LANGUAGES } from "@/server/admin/userPolicy";
import { deleteUser, getUserDetail, updateUser } from "@/server/admin/users";

const params = z.object({ id: z.string().min(1) });
const text = z.string().trim().optional();

export const GET = defineRoute({
  access: { roles: ADMIN_ROLES },
  params,
  handler: ({ params }) => getUserDetail(params.id),
});

export const PUT = defineRoute({
  access: { roles: ADMIN_ROLES },
  params,
  body: z.object({
    name: text,
    phone: text,
    preferredLanguage: z.enum(LANGUAGES).optional().catch(undefined),
    region: text,
    city: text,
    gender: text,
    dateOfBirth: text,
    notes: text,
    tags: z.array(z.string()).optional(),
  }),
  handler: ({ user, params, body }) => updateUser(user, params.id, body),
  audit: {
    action: "user_updated",
    resourceType: "user",
    resourceId: ({ params }) => params.id,
    details: ({ body }) => ({ fieldsUpdated: Object.keys(body).filter((key) => body[key as keyof typeof body] !== undefined) }),
  },
});

export const DELETE = defineRoute({
  access: { roles: ["super_admin"] },
  params,
  handler: ({ user, params }) => deleteUser(user, params.id),
  audit: {
    action: "user_deleted",
    resourceType: "user",
    resourceId: ({ params }) => params.id,
    details: (_ctx, deleted) => ({ deletedEmail: deleted.email, deletedRole: deleted.role }),
  },
});
