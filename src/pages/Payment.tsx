import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useLocation, useParams } from "react-router-dom";
import { Container, Card, Button } from "../components/UI";
import InvoicePaper from "../components/InvoicePaper";
import type { InvoiceData } from "../types";
import LZString from "lz-string";
import { loadPayPalSdk } from "../lib/paypal";
import { loadSettings } from "../lib/storage";
import { COMPANIES } from "../data/companies";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PaymentPage() {
  const { data: pathData } = useParams<{ data?: string }>();
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const [data, setData] = useState<InvoiceData | null>(null);
  const [paid, setPaid] = useState(false);
  const paypalRef = useRef<HTMLDivElement | null>(null);
  const settings = loadSettings();

  useEffect(() => {
    const enc = pathData || hash.slice(1) || params.get("data");
    if (!enc) return;
    try {
      let json: string;
      if (enc.startsWith("z")) {
        // lz-string compressed (new links)
        json = LZString.decompressFromEncodedURIComponent(enc.slice(1)) || "";
      } else {
        // legacy base64 (old links)
        const b64 = enc.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
        json = decodeURIComponent(escape(atob(padded)));
      }
      const raw = JSON.parse(json);

      // Support both short keys (new) and long keys (old links)
      const businessName = raw.bn || raw.businessName || "Business";
      const co = COMPANIES.find(c => c.name === businessName);

      const inv: InvoiceData = {
        invoiceNo: raw.i || raw.invoice || "INV-DEMO",
        issueDate: new Date().toISOString().slice(0, 10),
        businessName,
        businessEmail: raw.be || raw.businessEmail || co?.email,
        businessPhone: raw.bp || raw.businessPhone || co?.phone,
        businessAddress: raw.ba || raw.businessAddress || co?.address,
        clientName: raw.cn || raw.clientName || "Client",
        email: raw.e || raw.email || "",
        phone: raw.p || raw.phone || "",
        service: raw.s || raw.service || "Service",
        projectDetails: raw.pd || raw.projectDetails || "",
        currency: raw.c || raw.currency || "USD",
        items: [{ id: "one", name: raw.s || raw.service || "Service", qty: 1, unitPrice: Number(raw.a || raw.amount || "0") }],
        taxPercent: 0,
        discount: 0,
        notes: "",
        logoDataUrl: raw.logo || co?.logoDataUrl || settings.logoDataUrl,
        amount: String(raw.a || raw.amount || "0.00"),
        status: "UNPAID",
        paypalClientId: raw.pp || raw.paypalClientId || co?.paypalClientId || settings.paypalClientId || "",
      };
      setData(inv);
    } catch (e) {
      console.error(e);
    }
  }, [pathData, params, hash]);

  const amount = useMemo(() => Number(data?.amount || "0"), [data]);

  useEffect(() => {
    if (!data) return;
    loadPayPalSdk(data.currency, "", data.paypalClientId).then(() => {
      if (!window.paypal || !paypalRef.current) return;
      try {
        window.paypal.Buttons({
          style: { layout: "vertical", shape: "rect", label: "pay" },
          createOrder: (_: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: { value: amount.toFixed(2), currency_code: data.currency },
                description: `${data.service} — ${data.invoiceNo}`,
              }],
            });
          },
          onApprove: async (_: any, actions: any) => {
            const details = await actions.order.capture();
            console.log("Captured", details);
            setPaid(true);
          },
          onError: (err: any) => {
            console.error(err);
            alert("Payment error. See console for details.");
          }
        }).render(paypalRef.current);
      } catch (e) {
        console.error(e);
      }
    });
  }, [data, amount]);

  if (!data) return (
    <Container className="py-10">
      <p>Invalid payment link.</p>
    </Container>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InvoicePaper data={{ ...data, status: paid ? "PAID" : "UNPAID" }} />
          </div>
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">Pay Invoice</h2>
              <p className="text-sm text-slate-600">Amount due</p>
              <p className="text-2xl font-bold text-slate-900">{new Intl.NumberFormat(undefined, { style: "currency", currency: data.currency, currencyDisplay: "narrowSymbol" }).format(amount)}</p>
              <div className="mt-4" ref={paypalRef} />
              {!(data.paypalClientId || settings.paypalClientId) && (
                <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                  Add your PayPal Client ID in <b>Settings</b> to show the PayPal button.
                </div>
              )}
              {paid && <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">Payment captured successfully (client‑side demo).</div>}
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-slate-900">Other Options</h3>
              <p className="text-sm text-slate-600 mt-1">PayPal will offer Pay Later and Card options when eligible in your region.</p>
              <Button onClick={() => window.print()} className="mt-3 w-full">Print Invoice</Button>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}