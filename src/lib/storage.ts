import LZString from "lz-string";
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
  const settings = loadSettings();
  // PayPal client ID is now stored in COMPANIES — no need to include in URL
  const payload = {
    cn: inv.clientName,
    bn: inv.businessName,
    e: inv.email,
    p: inv.phone || "",
    s: inv.service,
    pd: inv.projectDetails || "",
    a: inv.amount,
    c: inv.currency,
    i: inv.invoiceNo,
  };
  const json = JSON.stringify(payload);
  // Prefix "z" flags lz-string compression so the decoder knows which path to take
  const encoded = "z" + LZString.compressToEncodedURIComponent(json);
  const url = new URL(baseUrl || window.location.origin);
  url.pathname = "/p/" + encoded;
  return url.toString();
}