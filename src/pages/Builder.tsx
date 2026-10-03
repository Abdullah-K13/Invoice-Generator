// src/pages/Builder.tsx
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Button, Input, Label, TextArea, Select } from "../components/UI";
import InvoicePaper from "../components/InvoicePaper";
import type { InvoiceData, InvoiceItem, AdditionalCharge } from "../types";
import { loadSettings, putInvoice, makeShareLink } from "../lib/storage";
import { COMPANIES } from "../data/companies";
import { CURRENCIES } from "../data/currencies";
import jetjamsLogo from "../assets/logo1.webp"; // or "../assets/jetjams-logo.webp"

function makeSingleItem(name: string, fee: number): InvoiceItem {
  return { id: crypto.randomUUID(), name, description: "Software project", qty: 1, unitPrice: fee || 0 };
}
function genInvoiceNo() {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `INV-${n}`;
}

export default function BuilderPage() {
  const settings = loadSettings();
  const [projectFee, setProjectFee] = useState<number>(0);

  // default company = WebNative
  const [companyId, setCompanyId] = useState<string>(COMPANIES[0].id);
  const activeCompany = COMPANIES.find((c) => c.id === companyId)!;

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNo: genInvoiceNo(),
    issueDate: new Date().toISOString().slice(0, 10),
    businessName: activeCompany.name,
    businessEmail: activeCompany.email,
    businessPhone: activeCompany.phone,
    businessAddress: activeCompany.address,
    clientName: "Client Name",
    email: "client@example.com",
    phone: "",
    service: "Custom Software Project",
    projectDetails:
      "Scope summary: features, platforms (web/mobile), milestones, deliverables, maintenance window, etc.",
    currency: "USD",
    items: [makeSingleItem("Custom Software Project", 0)],
    charges: [],
    taxPercent: 0,
    discount: 0,
    notes: "",
    logoDataUrl: jetjamsLogo,
    amount: "0.00",
    status: "UNPAID",
  });

  // Migrate legacy tax to charges if needed (on first load)
  useEffect(() => {
    if (invoice.taxPercent && (!invoice.charges || invoice.charges.length === 0)) {
      setInvoice(p => ({
        ...p,
        charges: [
          { id: crypto.randomUUID(), name: "Tax", type: "percent", value: p.taxPercent || 0 }
        ],
        taxPercent: 0 // clear legacy
      }));
    }
  }, []); // Only run on mount/init

  // sync company selection into invoice branding
  useEffect(() => {
    setInvoice((p) => ({
      ...p,
      businessName: activeCompany.name,
      businessEmail: activeCompany.email,
      businessPhone: activeCompany.phone,
      businessAddress: activeCompany.address,
      logoDataUrl: activeCompany.logoDataUrl,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // keep logo in sync if user set one in Settings
  useEffect(() => {
    setInvoice((p) => ({ ...p, logoDataUrl: settings.logoDataUrl || activeCompany.logoDataUrl }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.logoDataUrl]);

  // keep the single underlying item in sync with projectFee and service title
  useEffect(() => {
    setInvoice((p) => {
      const item = p.items[0] ?? makeSingleItem(p.service || "Software Project", projectFee);
      const updated: InvoiceItem = { ...item, name: p.service || "Software Project", unitPrice: projectFee, qty: 1 };
      return { ...p, items: [updated] };
    });
  }, [projectFee]);

  // also update item name if user changes the service field
  useEffect(() => {
    setInvoice((p) => {
      const item = p.items[0] ?? makeSingleItem(p.service || "Software Project", projectFee);
      const updated: InvoiceItem = { ...item, name: p.service || "Software Project" };
      return { ...p, items: [updated] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.service]);

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

    // Calculate charges
    const chargesTotal = (invoice.charges || []).reduce((sum, c) => {
      return sum + (c.type === "percent" ? (subtotal * c.value) / 100 : c.value);
    }, 0);

    const discount = invoice.discount || 0;
    const total = Math.max(0, subtotal + chargesTotal - discount);
    return { subtotal, chargesTotal, total };
  }, [invoice]);

  function set<K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) {
    setInvoice((prev) => ({ ...prev, [key]: val }));
  }

  function addCharge() {
    setInvoice((p) => ({
      ...p,
      charges: [...(p.charges || []), { id: crypto.randomUUID(), name: "Service Fee", type: "flat", value: 0 }],
    }));
  }

  function removeCharge(id: string) {
    setInvoice((p) => ({
      ...p,
      charges: (p.charges || []).filter((c) => c.id !== id),
    }));
  }

  function updateCharge(id: string, updates: Partial<AdditionalCharge>) {
    setInvoice((p) => ({
      ...p,
      charges: (p.charges || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }

  function handleCurrencyChange(newCurrency: string) {
    if (newCurrency === invoice.currency) return;

    // Simple prompt for now, could be a modal
    if (window.confirm(`Convert values from ${invoice.currency} to ${newCurrency}?`)) {
      // Mock conversion rate for demo relative to USD approx (base could be anything really, but let's just ask user for rate or do 1:1 if they cancel?)
      // Actually, easier to ask for a rate.
      const rateStr = window.prompt(`Enter exchange rate (1 ${invoice.currency} = ? ${newCurrency})`, "1.0");
      const rate = parseFloat(rateStr || "1");

      if (!isNaN(rate) && rate > 0) {
        convertValues(rate, newCurrency);
      } else {
        set("currency", newCurrency); // just change label
      }
    } else {
      set("currency", newCurrency); // just change label
    }
  }

  function convertValues(rate: number, newCurrency: string) {
    setInvoice(prev => {
      const newItems = prev.items.map(it => ({ ...it, unitPrice: it.unitPrice * rate }));
      const newCharges = (prev.charges || []).map(c =>
        c.type === "flat" ? { ...c, value: c.value * rate } : c
      );
      const newDiscount = (prev.discount || 0) * rate;

      setProjectFee(p => p * rate); // update local state too

      return {
        ...prev,
        currency: newCurrency,
        items: newItems,
        charges: newCharges,
        discount: newDiscount
      };
    });
  }

  function save() {
    const inv = { ...invoice, amount: totals.total.toFixed(2) };
    putInvoice(inv);
    alert("Invoice saved locally.");
  }
  function printPdf() {
    window.print();
  }
  function copyLink() {
    const inv = { ...invoice, amount: totals.total.toFixed(2) };
    const link = makeShareLink(inv);
    navigator.clipboard.writeText(link).then(() => alert("Payment link copied to clipboard."));
  }

  return (
    <Container className="py-10">
      {/* Hero / header */}
      <div className="no-print relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">New Invoice</h1>
            <p className="text-slate-300 mt-1">Choose a company, describe the project, set the fee — done.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Save */}
            <Button
              onClick={save}
              className="bg-sky-500 hover:bg-sky-400 text-white shadow-sm"
            >
              Save
            </Button>

            {/* Print / PDF */}
            <Button
              onClick={printPdf}
              className="bg-slate-700 hover:bg-slate-600 text-white shadow-sm"
            >
              Print / PDF
            </Button>

            {/* Copy Payment Link */}
            <Button
              onClick={copyLink}
              className="bg-black text-slate-900 hover:bg-black-100 shadow-sm"
            >
              Copy Payment Link
            </Button>
          </div>
        </div>
      </div>


      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        <div className="space-y-6">
          {/* Company selection */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-900">1. Company</h2>
            <p className="text-sm text-slate-600 mt-1">Pick which company issues this invoice.</p>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {COMPANIES.map((c) => {
                const active = c.id === companyId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCompanyId(c.id)}
                    className={`group w-full text-left rounded-2xl border p-4 transition shadow-soft
                      ${active ? "border-sky-300 ring-2 ring-sky-200 bg-sky-50/40" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.logoDataUrl} alt={c.name} className="h-12 w-12 rounded-lg border border-white/40 shadow" />
                      <div>
                        <div className="font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-600">{c.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-600">
                      {c.phone} • {c.address}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Client & Project */}
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">2. Client & Project</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Client Name</Label>
                <Input value={invoice.clientName} onChange={(e) => set("clientName", e.target.value)} />
              </div>
              <div>
                <Label>Client Email</Label>
                <Input value={invoice.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <Label>Client Phone</Label>
                <Input value={invoice.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="col-span-2">
                <Label>Project Title</Label>
                <Input
                  value={invoice.service}
                  onChange={(e) => set("service", e.target.value)}
                  placeholder="e.g., E-commerce Web App (React/Node)"
                />
              </div>
              <div className="col-span-2">
                <Label>Project Details</Label>
                <TextArea
                  rows={6}
                  value={invoice.projectDetails}
                  onChange={(e) => set("projectDetails", e.target.value)}
                  placeholder="Scope: features, platforms, milestones, delivery timeline, warranty/maintenance terms, etc."
                />
              </div>
            </div>
          </Card>

          {/* Financials */}
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">3. Financials</h2>

            {/* Currency */}
            <div>
              <Label>Currency</Label>
              <Select value={invoice.currency} onChange={(e) => handleCurrencyChange(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} - {c.symbol} - {c.name}</option>
                ))}
              </Select>
            </div>

            <div className="pt-2">
              <Label>Project Fee</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={projectFee}
                onChange={(e) => setProjectFee(Number(e.target.value))}
                placeholder="e.g., 5000"
              />
              <p className="text-xs text-slate-500 mt-1">
                One consolidated fee (design, development, testing, deployment, handover).
              </p>
            </div>

            {/* Additional Charges and Discount */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-900">Additional Charges</h3>
                <button type="button" onClick={addCharge} className="text-xs font-medium text-sky-600 hover:text-sky-500">+ Add Charge</button>
              </div>

              {(invoice.charges || []).map((charge, idx) => (
                <div key={charge.id} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Name (e.g. Tax, Service Fee)"
                      value={charge.name}
                      onChange={e => updateCharge(charge.id, { name: e.target.value })}
                      className="text-sm py-1.5"
                    />
                  </div>
                  <div className="w-24">
                    <Select
                      value={charge.type}
                      onChange={e => updateCharge(charge.id, { type: e.target.value as any })}
                      className="text-sm py-1.5"
                    >
                      <option value="percent">%</option>
                      <option value="flat">Flat</option>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={charge.value}
                      onChange={e => updateCharge(charge.id, { value: Number(e.target.value) })}
                      className="text-sm py-1.5"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-1 cursor-pointer select-none px-2" title="Recurring charge (e.g. monthly)">
                      <input
                        type="checkbox"
                        checked={!!charge.recurring}
                        onChange={e => updateCharge(charge.id, { recurring: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs text-slate-500">Recur</span>
                    </label>
                  </div>
                  <button
                    onClick={() => removeCharge(charge.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Label>Discount</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={invoice.discount ?? 0}
                  onChange={(e) => set("discount", Number(e.target.value))}
                />
                <span className="text-sm text-slate-500">Flat Amount in {invoice.currency}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label>Invoice No</Label>
                <Input value={invoice.invoiceNo} onChange={(e) => set("invoiceNo", e.target.value)} />
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input type="date" value={invoice.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
              </div>
            </div>
          </Card>
        </div>

        {/* Live Preview & Total */}
        <div className="space-y-4">
          <InvoicePaper data={invoice} />
          <Card className="p-4 flex items-center justify-between">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-xl font-semibold text-slate-900">
              {new Intl.NumberFormat(undefined, { style: "currency", currency: invoice.currency, currencyDisplay: "narrowSymbol" }).format(totals.total)}
            </span>
          </Card>
        </div>
      </div>
    </Container>
  );
}
