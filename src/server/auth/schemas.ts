import { z } from "zod";
import { LANGUAGES } from "@/server/admin/userPolicy";

export const MINUTE = 60_000;

export const email = z.string().trim().toLowerCase().email("Please provide a valid email address.");
export const optionalText = z.string().trim().optional().transform((value) => value || undefined);
export const language = z.enum(LANGUAGES);

const mustAccept = z.literal(true, { errorMap: () => ({ message: "You must accept the Terms of Service and Privacy Policy." }) });

export const loginBody = z.object({
  email,
  password: z.string().min(1, "Please provide both email and password."),
  rememberMe: z.coerce.boolean().default(false),
});

export const registerBody = z
  .object({
    email,
    password: z.string(),
    confirmPassword: z.string().optional(),
    fullName: optionalText,
    name: optionalText,
    fatherName: optionalText,
    motherName: optionalText,
    phone: optionalText,
    dateOfBirth: optionalText,
    preferredLanguage: language.catch("en"),
    gender: optionalText,
    region: optionalText,
    city: optionalText,
    // Enhancement — location resolution on registration
    geoLat: z.coerce.number().optional(),
    geoLng: z.coerce.number().optional(),
    consentLocation: z.coerce.boolean().optional().default(false),
    birthLocation: optionalText,
    acceptTerms: mustAccept,
    acceptPrivacy: mustAccept,
  })
  .refine((body) => !body.confirmPassword || body.confirmPassword === body.password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .transform(({ fullName, name, fatherName, motherName, confirmPassword: _confirm, acceptTerms: _terms, acceptPrivacy: _privacy, ...rest }) => ({
    ...rest,
    name: fullName ?? (fatherName && name ? `${name} ${fatherName}` : (name ?? fatherName)),
    fatherName,
    motherName,
  }));


export const verifyBody = z
  .object({ code: optionalText, otpCode: optionalText, token: optionalText, email: z.string().trim().toLowerCase().optional() })
  .transform(({ otpCode, code, ...rest }) => ({ ...rest, code: code ?? otpCode }));

export const resetBody = z
  .object({
    token: z.string().trim().min(1, "Reset token is required."),
    password: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .transform(({ token, password, newPassword, confirmPassword }) => ({ token, password: password ?? newPassword ?? "", confirmPassword }))
  .refine((body) => !body.confirmPassword || body.confirmPassword === body.password, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordBody = z
  .object({
    currentPassword: z.string().min(1, "Please supply your current password and new password."),
    newPassword: z.string().min(1, "Please supply your current password and new password."),
    confirmPassword: z.string().optional(),
  })
  .refine((body) => !body.confirmPassword || body.confirmPassword === body.newPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

const text = z.string().trim().optional();
export const ownAccountBody = z.object({
  name: text,
  phone: text,
  preferredLanguage: language.optional().catch(undefined),
  region: text,
  city: text,
  gender: text,
  dateOfBirth: text,
});
