"use client";

import { createContext, useContext, type ReactNode } from "react";
import { roleCan, type Capability, type MemberRole } from "@/server/marketplace/roles";

export interface WorkspaceBusiness {
  id: string;
  slug: string;
  name: string;
  nameAm: string | null;
  tagline: string | null;
  description: string | null;
  categoryId: string;
  region: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  languages: string[];
  deliveryModes: string[];
  logoUrl: string | null;
  coverUrl: string | null;
  timezone: string;
  status: string;
  verification: { submittedAt?: string; reviewedAt?: string; notes?: string; credentials?: { label: string; issuer?: string; reference?: string }[] } | null;
  ratingAverage: string | null;
  ratingCount: number;
  paymentAccounts: {
    telebirr?: { name: string; phone: string } | null;
    banks?: { bank: string; accountName: string; accountNumber: string }[];
    acceptsCash?: boolean;
    instructions?: string;
  } | null;
  category: { id: string; name: string; sector: string };
  myRole: MemberRole;
}

interface WorkspaceValue {
  business: WorkspaceBusiness;
  reload: () => Promise<void>;
  can: (capability: Capability) => boolean;
  base: string;
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ business, reload, children }: { business: WorkspaceBusiness; reload: () => Promise<void>; children: ReactNode }) {
  const value: WorkspaceValue = {
    business,
    reload,
    can: (capability) => roleCan(business.myRole, capability),
    base: `/business/${business.id}`,
  };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside a business workspace");
  return context;
}
