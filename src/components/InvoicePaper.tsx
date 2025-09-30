import React from "react";
import type { InvoiceData } from "../types";

type Props = { data: InvoiceData };

export default function InvoicePaper({ data }: Props) {
  const total = calcTotal(data);
  return (
    <div className="invoice-paper bg-white rounded-2xl shadow-soft border border-slate-100 p-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{data.businessName}</h1>
          {data.businessAddress && <p className="text-sm text-slate-600">{data.businessAddress}</p>}
          {(data.businessEmail || data.businessPhone) && (
            <p className="text-sm text-slate-600">{[data.businessEmail, data.businessPhone].filter(Boolean).join(" • ")}</p>
          )}
        </div>
        {data.logoDataUrl && <img src={data.logoDataUrl} alt="logo" className="w-24 h-24 object-contain rounded-md border border-slate-200" />}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-slate-500">Billed To</p>
          <p className="font-medium text-slate-900">{data.clientName}</p>
          <p className="text-sm text-slate-600">{data.email}{data.phone ? ` • ${data.phone}` : ""}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Invoice</p>
          <p className="font-medium text-slate-900">{data.invoiceNo}</p>
          <p className="text-sm text-slate-600">Issued {data.issueDate}{data.dueDate ? ` • Due ${data.dueDate}` : ""}</p>
          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${data.status === "PAID" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {data.status ?? "UNPAID"}
          </span>
        </div>
      </div>

      <div className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2">Item</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Unit</th>
              <th className="pb-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2">
                  <div className="font-medium text-slate-900">{it.name}</div>
                  {it.description && <div className="text-slate-500">{it.description}</div>}
                </td>
                <td className="py-2">{it.qty}</td>
                <td className="py-2">{fmtMoney(data.currency, it.unitPrice)}</td>
                <td className="py-2 text-right">{fmtMoney(data.currency, it.qty * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-start justify-end">
        <div className="w-full sm:w-80">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{fmtMoney(data.currency, total.subtotal)}</span>
          </div>
          {typeof data.taxPercent === "number" && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax ({data.taxPercent}%)</span>
              <span className="font-medium">{fmtMoney(data.currency, total.tax)}</span>
            </div>
          )}
          {typeof data.discount === "number" && data.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium">-{fmtMoney(data.currency, data.discount)}</span>
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-base">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-semibold">{fmtMoney(data.currency, total.total)}</span>
          </div>
          {data.notes && <p className="text-xs text-slate-500 mt-4">{data.notes}</p>}
        </div>
      </div>
    </div>
  );
}

function calcTotal(data: InvoiceData) {
  const subtotal = data.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const tax = typeof data.taxPercent === "number" ? (subtotal * data.taxPercent) / 100 : 0;
  const discount = data.discount || 0;
  const total = Math.max(0, subtotal + tax - discount);
  return { subtotal, tax, total };
}

function fmtMoney(currency: string, value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
}