import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { ADMIN_ROLES, LANGUAGES, USER_STATUSES } from "@/server/admin/userPolicy";
import { createUser, listUsers } from "@/server/admin/users";

const optionalText = z.string().trim().optional().transform((v) => v || undefined);

export const GET = defineRoute({
  access: { roles: ADMIN_ROLES },
  query: z.object({
    search: optionalText,
    role: optionalText,
    status: z.enum([...USER_STATUSES, "all"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
  handler: ({ query }) => listUsers(query),
});

export const POST = defineRoute({
  access: { roles: ADMIN_ROLES },
  status: 201,
  body: z
    .object({
      email: z.string().trim().toLowerCase().email("Valid email is required."),
      name: optionalText,
      fullName: optionalText,
      password: z.string().optional(),
      role: z.string().trim().min(1).default("user"),
      phone: optionalText,
      preferredLanguage: z.enum(LANGUAGES).catch("en"),
      region: optionalText,
      city: optionalText,
      gender: optionalText,
      dateOfBirth: optionalText,
      status: z.enum(USER_STATUSES).default("active"),
      notes: optionalText,
      tags: z.array(z.string()).default([]),
    })
    .transform(({ fullName, name, ...rest }) => ({ ...rest, name: name ?? fullName ?? "" }))
    .refine((input) => input.name.length > 0, { message: "Full Name is required.", path: ["name"] }),
  handler: ({ user, body }) => createUser(user, body),
  audit: {
    action: "user_created",
    resourceType: "user",
    resourceId: (_ctx, result) => result.user.id,
    details: ({ body }) => ({ createdUserEmail: body.email, role: body.role }),
  },
});
