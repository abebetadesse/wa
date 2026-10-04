import { getSystemConfig } from "@/lib/config/systemConfig";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const configuredEmail = getSystemConfig().platform.supportEmail.trim();
  const domain = configuredEmail.split("@")[1]?.toLowerCase();
  const isPlaceholder = !domain || domain.endsWith(".example");

  return <ForgotPasswordForm supportEmail={isPlaceholder ? null : configuredEmail} />;
}
