// src/types.ts
export type Money = {
  currency: string;
  value: string;
};

export type InvoiceItem = {
  id: string;
  name: string;
  description?: string;
  qty: number;
  unitPrice: number;
};

export type InvoiceData = {
  invoiceNo: string;
  issueDate: string;
  dueDate?: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  clientName: string;
  email: string;
  phone?: string;
  service: string;
  projectDetails?: string;
  currency: string;
  items: InvoiceItem[];
  taxPercent?: number;
  discount?: number;
  notes?: string;
  logoDataUrl?: string;
  amount: string;
  status?: "UNPAID" | "PAID";
};

export type Settings = {
  paypalClientId?: string;
  /** WARNING: Do not use in production-only frontend. Provided for your requested UI. */
  paypalClientSecret?: string;
  /** Optional PayPal.Me username (e.g. yourbusiness) */
  paypalMeUsername?: string;
  themeColor?: string;
  logoDataUrl?: string;
};
