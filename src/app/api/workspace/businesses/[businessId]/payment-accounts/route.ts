import { z } from "zod";
import { defineRoute } from "@/lib/api/route";
import { paymentAccountsInput, updatePaymentAccounts } from "@/server/marketplace/businesses";

export const PUT = defineRoute({
  access: "user",
  params: z.object({ businessId: z.string().uuid() }),
  body: paymentAccountsInput,
  handler: ({ user, params, body }) => updatePaymentAccounts(user, params.businessId, body),
  audit: { action: "business_payment_accounts_updated", resourceType: "business", resourceId: ({ params }) => params.businessId },
});
