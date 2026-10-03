import React from "react";
import type { InvoiceData } from "../types";

type Props = { data: InvoiceData };

export default function InvoicePaper({ data }: Props) {
  const total = calcTotal(data);

  return (
    <div className="invoice-paper bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Professional Header with Gradient */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-10 py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-indigo-500/10"></div>
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{data.businessName}</h1>
            {data.businessAddress && (
              <p className="text-slate-200 text-sm flex items-center gap-2 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {data.businessAddress}
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-3">
              {data.businessEmail && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white font-medium text-sm">{data.businessEmail}</span>
                </div>
              )}
              {data.businessPhone && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                  <svg className="w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white font-medium text-sm">{data.businessPhone}</span>
                </div>
              )}
            </div>
          </div>
          {data.logoDataUrl && (
            <img
              src={data.logoDataUrl}
              alt="logo"
              className="w-28 h-28 object-contain rounded-xl bg-white/10 backdrop-blur-sm p-3 border border-white/20 shadow-lg ml-6"
            />
          )}
        </div>
      </div>

      {/* Invoice Info Bar */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-10 py-6 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Invoice Number</p>
            <p className="text-lg font-bold text-slate-900">{data.invoiceNo}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date Issued</p>
            <p className="text-lg font-semibold text-slate-700">{formatDate(data.issueDate)}</p>
            {data.dueDate && (
              <p className="text-sm text-slate-600 mt-1">Due: {formatDate(data.dueDate)}</p>
            )}
          </div>
          <div className="flex items-start justify-end">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm ${data.status === "PAID"
              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
              : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
              }`}>
              <span className={`w-2 h-2 rounded-full ${data.status === "PAID" ? "bg-white" : "bg-white"} animate-pulse`}></span>
              {data.status ?? "UNPAID"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-10 py-8">
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-100">
            <h3 className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Billed To
            </h3>
            <p className="text-xl font-bold text-slate-900 mb-3">{data.clientName}</p>
            {data.email && (
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-base font-medium text-slate-800">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-base font-medium text-slate-800">{data.phone}</span>
              </div>
            )}
          </div>

          {data.projectDetails && (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
              <h3 className="text-xs font-bold text-violet-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Project Details
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{data.projectDetails}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Invoice Items</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700 to-slate-600 text-white">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Quantity</th>
                  {/* <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Unit Price</th> */}
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.items.map((it, idx) => (
                  <tr key={it.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{it.name}</div>
                      {it.description && <div className="text-sm text-slate-600 mt-1">{it.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-700 font-medium">{it.qty}</td>
                    {/* <td className="px-6 py-4 text-right text-slate-700 font-medium">{fmtMoney(data.currency, it.unitPrice)}</td> */}
                    <td className="px-6 py-4 text-right text-slate-900 font-bold">{fmtMoney(data.currency, it.qty * it.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-96 space-y-3">
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm font-medium text-slate-600">Subtotal</span>
              <span className="text-lg font-semibold text-slate-900">{fmtMoney(data.currency, total.subtotal)}</span>
            </div>

            {/* One-time Charges */}
            {total.oneTime.map((charge) => (
              <div key={charge.id} className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">
                  {charge.name} {charge.type === "percent" && `(${charge.value}%)`}
                </span>
                <span className="text-base font-semibold text-slate-700">
                  {fmtMoney(
                    data.currency,
                    charge.type === "percent"
                      ? (total.subtotal * charge.value) / 100
                      : charge.value
                  )}
                </span>
              </div>
            ))}

            {/* Legacy Tax Support */}
            {(!data.charges || data.charges.length === 0) && typeof data.taxPercent === "number" && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-600">Tax ({data.taxPercent}%)</span>
                <span className="text-base font-semibold text-slate-700">{fmtMoney(data.currency, total.taxLegacy)}</span>
              </div>
            )}

            {/* Recurring Charges */}
            {total.recurring.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-300">
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recurring (Monthly)
                </p>
                {total.recurring.map((charge) => (
                  <div key={charge.id} className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">
                      {charge.name} {charge.type === "percent" && `(${charge.value}%)`}
                    </span>
                    <span className="text-base font-semibold text-slate-700">
                      {fmtMoney(
                        data.currency,
                        charge.type === "percent"
                          ? (total.subtotal * charge.value) / 100
                          : charge.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Discount */}
            {typeof data.discount === "number" && data.discount > 0 && (
              <div className="flex justify-between items-center py-2 border-t border-slate-200">
                <span className="text-sm font-medium text-green-700">Discount</span>
                <span className="text-base font-semibold text-green-700">-{fmtMoney(data.currency, data.discount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="mt-4 pt-4 border-t-2 border-slate-300 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">Total Amount Due</span>
                <span className="text-2xl font-bold text-white">{fmtMoney(data.currency, total.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-6">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Notes
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{data.notes}</p>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Instructions
          </h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p>• Click the PayPal button to pay securely online with your PayPal account or credit card</p>
            <p>• Payment is processed in <strong>{data.currency}</strong></p>
            <p>• You will receive a payment confirmation upon successful transaction</p>
            <p>• For questions regarding this invoice, please contact us using the details above</p>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t-2 border-slate-200 pt-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Terms & Conditions</h3>
          <div className="text-xs text-slate-600 leading-relaxed space-y-1">
            <p>• Payment is due upon receipt unless otherwise specified</p>
            <p>• Late payments may be subject to additional fees or interest charges</p>
            <p>• All prices are in {data.currency} and are non-refundable unless otherwise agreed</p>
            <p>• Services will commence upon receipt of payment or as per agreed schedule</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Thank you for your business! We appreciate the opportunity to serve you.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            This is an electronically generated invoice and is valid without a signature.
          </p>
        </div>
      </div>
    </div>
  );
}

function calcTotal(data: InvoiceData) {
  const subtotal = data.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  const charges = data.charges || [];
  const getVal = (c: any) => (c.type === "percent" ? (subtotal * c.value) / 100 : c.value);

  const oneTime = charges.filter((c) => !c.recurring);
  const recurring = charges.filter((c) => c.recurring);

  const oneTimeTotal = oneTime.reduce((s, c) => s + getVal(c), 0);
  const recurringTotal = recurring.reduce((s, c) => s + getVal(c), 0);

  // Fallback for legacy tax data
  const taxLegacy =
    (!data.charges || data.charges.length === 0) && typeof data.taxPercent === "number"
      ? (subtotal * data.taxPercent) / 100
      : 0;

  const discount = data.discount || 0;

  // Total includes current due (one-time + first month recurring + tax - discount)
  const total = Math.max(0, subtotal + oneTimeTotal + recurringTotal + taxLegacy - discount);

  return { subtotal, oneTime, recurring, taxLegacy, total };
}

function fmtMoney(currency: string, value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(value);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}