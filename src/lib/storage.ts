import type { InvoiceData, Settings } from "../types";

const SETTINGS_KEY = "sip:settings";
const INVOICES_KEY = "sip:invoices";

export function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadInvoices(): Record<string, InvoiceData> {
  const raw = localStorage.getItem(INVOICES_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveInvoices(all: Record<string, InvoiceData>) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(all));
}

export function putInvoice(inv: InvoiceData) {
  const all = loadInvoices();
  all[inv.invoiceNo] = inv;
  saveInvoices(all);
}

export function getInvoice(invoiceNo: string): InvoiceData | null {
  const all = loadInvoices();
  return all[invoiceNo] ?? null;
}

export function makeShareLink(inv: InvoiceData, baseUrl?: string): string {
  const payload = {
    clientName: inv.clientName,
    businessName: inv.businessName,
    email: inv.email,
    phone: inv.phone || "",
    service: inv.service,
    projectDetails: inv.projectDetails || "",
    amount: inv.amount,
    currency: inv.currency,
    invoice: inv.invoiceNo,
    logo: inv.logoDataUrl || "",
  };
  const json = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const url = new URL(baseUrl || window.location.origin);
  url.pathname = "/payment";
  url.searchParams.set("data", encoded);
  return url.toString();
}