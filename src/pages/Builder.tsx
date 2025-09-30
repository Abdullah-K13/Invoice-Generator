// src/pages/Builder.tsx
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Button, Input, Label, TextArea } from "../components/UI";
import InvoicePaper from "../components/InvoicePaper";
import type { InvoiceData, InvoiceItem } from "../types";
import { loadSettings, putInvoice, makeShareLink } from "../lib/storage";
import { COMPANIES } from "../data/companies";
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
  const activeCompany = COMPANIES.find(c => c.id === companyId)!;

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
    projectDetails: "Scope summary: features, platforms (web/mobile), milestones, deliverables, maintenance window, etc.",
    currency: "USD",
    items: [makeSingleItem("Custom Software Project", 0)],
    taxPercent: 0,
    discount: 0,
    notes: "",
    logoDataUrl: jetjamsLogo,
    amount: "0.00",
    status: "UNPAID",
  });

  // sync company selection into invoice branding
  useEffect(() => {
    setInvoice((p) => ({
      ...p,
      businessName: activeCompany.name,
      businessEmail: activeCompany.email,
      businessPhone: activeCompany.phone,
      businessAddress: activeCompany.address,
      logoDataUrl: jetjamsLogo,
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
      const item = (p.items[0] ?? makeSingleItem(p.service || "Software Project", projectFee));
      const updated: InvoiceItem = { ...item, name: p.service || "Software Project", unitPrice: projectFee, qty: 1 };
      return { ...p, items: [updated] };
    });
  }, [projectFee]);

  // also update item name if user changes the service field
  useEffect(() => {
    setInvoice((p) => {
      const item = (p.items[0] ?? makeSingleItem(p.service || "Software Project", projectFee));
      const updated: InvoiceItem = { ...item, name: p.service || "Software Project" };
      return { ...p, items: [updated] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.service]);

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const tax = (subtotal * (invoice.taxPercent || 0)) / 100;
    const total = Math.max(0, subtotal + tax - (invoice.discount || 0));
    return { subtotal, tax, total };
  }, [invoice]);

  function set<K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) {
    setInvoice((prev) => ({ ...prev, [key]: val }));
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Currency</Label>
                <Input value={invoice.currency} onChange={(e) => set("currency", e.target.value.toUpperCase())} />
              </div>
              <div>
                <Label>Tax %</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={invoice.taxPercent ?? 0}
                  onChange={(e) => set("taxPercent", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={invoice.discount ?? 0}
                  onChange={(e) => set("discount", Number(e.target.value))}
                />
              </div>
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
              {new Intl.NumberFormat(undefined, { style: "currency", currency: invoice.currency }).format(totals.total)}
            </span>
          </Card>
        </div>
      </div>
    </Container>
  );
}
