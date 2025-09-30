// src/pages/Settings.tsx
import { useEffect, useMemo, useState } from "react";
import { Container, Card, Button, Input, Label } from "../components/UI";
import { loadSettings, saveSettings } from "../lib/storage";
import type { Settings } from "../types";

function Badge({ ok, label, optional = false }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs border ${
        ok
          ? "bg-green-50 text-green-700 border-green-200"
          : optional
          ? "bg-slate-50 text-slate-600 border-slate-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? "bg-green-600" : optional ? "bg-slate-400" : "bg-amber-600"}`} />
      {label}
    </span>
  );
}

export default function SettingsPage() {
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalMeUsername, setPaypalMeUsername] = useState("");
  const [themeColor, setThemeColor] = useState("#1f2937");
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();

  useEffect(() => {
    const s = loadSettings();
    setPaypalClientId(s.paypalClientId || "");
    setPaypalClientSecret(s.paypalClientSecret || "");
    setPaypalMeUsername(s.paypalMeUsername || "");
    setThemeColor(s.themeColor || "#1f2937");
    setLogoDataUrl(s.logoDataUrl);
  }, []);

  const status = useMemo(
    () => ({
      id: Boolean(paypalClientId),
      secret: Boolean(paypalClientSecret),
      me: Boolean(paypalMeUsername),
    }),
    [paypalClientId, paypalClientSecret, paypalMeUsername]
  );

  function handleSave() {
    const payload: Settings = {
      paypalClientId: paypalClientId || undefined,
      paypalClientSecret: paypalClientSecret || undefined,
      paypalMeUsername: paypalMeUsername || undefined,
      themeColor,
      logoDataUrl,
    };
    saveSettings(payload);
    alert("Saved.");
  }

  function clearCredentialsOnly() {
    const existing = loadSettings();
    delete (existing as any).paypalClientId;
    delete (existing as any).paypalClientSecret;
    delete (existing as any).paypalMeUsername;
    saveSettings(existing);
    setPaypalClientId("");
    setPaypalClientSecret("");
    setPaypalMeUsername("");
    alert("Credentials cleared (theme & logo kept).");
  }

  async function onLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  }

  function clearLogo() {
    setLogoDataUrl(undefined);
  }

  return (
    <Container className="py-10">
      {/* Header / hero */}
      <div className="no-print relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-slate-300 mt-1">Configure PayPal and branding. All values are stored locally in your browser.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-400 text-white">Save Credentials</Button>
            <Button onClick={clearCredentialsOnly} className="bg-slate-700 hover:bg-slate-600 text-white">Clear Credentials</Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        {/* Left column: PayPal config */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">PayPal Configuration</h2>
            <p className="text-sm text-slate-600">Live Payment Integration</p>
            <p className="text-sm text-slate-600">
              This app uses PayPal&apos;s live SDK to process real payments directly to your PayPal account. All payments will be processed and
              transferred to your connected PayPal account.
            </p>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <b>Security Note:</b> For enhanced security in production, consider moving PayPal credentials to your backend server instead of
              localStorage.
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor="pp-id">PayPal Client ID</Label>
                <Input id="pp-id" placeholder="A...YourPayPalClientId..." value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pp-secret">PayPal Client Secret</Label>
                <Input id="pp-secret" placeholder="E...YourPayPalClientSecret..." value={paypalClientSecret} onChange={(e) => setPaypalClientSecret(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">Use only if you fully accept storing secrets in the browser for this prototype.</p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="pp-me">PayPal.Me Username (optional)</Label>
                <div className="flex items-center">
                  <span className="px-3 py-2 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">paypal.me/</span>
                  <Input
                    id="pp-me"
                    className="rounded-l-none"
                    placeholder="yourbusiness"
                    value={paypalMeUsername}
                    onChange={(e) => setPaypalMeUsername(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Creates cleaner payment links like: <b>paypal.me/yourbusiness/50</b></p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Setup Instructions</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
              <li>
                Go to <a className="text-sky-600 hover:underline" href="https://developer.paypal.com/home" target="_blank">PayPal Developer</a>
              </li>
              <li>Create or log in to your developer account</li>
              <li>Create a new app in <b>My Apps &amp; Credentials</b></li>
              <li>Copy the <b>Client ID</b> and <b>Client Secret</b> from your app</li>
              <li className="mt-2">
                <b>Important:</b> For payment links to work smoothly, also set up <b>PayPal.Me</b>
              </li>
            </ol>

            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-900">PayPal.Me Setup (Recommended)</h3>
              <p className="text-sm text-slate-600 mt-1">
                Go to <a className="text-sky-600 hover:underline" href="https://www.paypal.com/paypalme/" target="_blank">paypal.com/paypalme</a>, choose your custom link (e.g.
                <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">paypal.me/yourbusiness</code>), and enter the username above.
              </p>
            </div>
          </Card>
        </div>

        {/* Right column: Branding + Status */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Branding</h2>

            <div>
              <Label htmlFor="theme">Theme Color</Label>
              <Input id="theme" type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
            </div>

            <div>
              <Label>Business Logo (used on invoices)</Label>
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={onLogoPick} />
                {logoDataUrl && (
                  <Button type="button" className="bg-slate-700 hover:bg-slate-600 text-white" onClick={clearLogo}>
                    Remove
                  </Button>
                )}
              </div>
              {logoDataUrl && (
                <img
                  src={logoDataUrl}
                  alt="logo preview"
                  className="mt-3 h-16 object-contain border border-slate-200 rounded-md p-2 bg-white"
                />
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Current Status</h2>
            <div className="flex flex-wrap gap-2">
              <Badge ok={status.id} label={`Client ID: ${status.id ? "✓ Set" : "✗ Not set"}`} />
              <Badge ok={status.secret} label={`Client Secret: ${status.secret ? "✓ Set" : "✗ Not set"}`} />
              <Badge ok={status.me} label={`PayPal.Me Username: ${status.me ? "✓ Set" : "○ Optional"}`} optional />
            </div>

            <div className="text-xs text-slate-500">
              Tip: You can use only <b>Client ID</b> for PayPal Smart Buttons in a pure-frontend setup. Bring a backend later for webhooks & server verification.
            </div>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-400 text-white w-full">Save Credentials</Button>
            <Button onClick={clearCredentialsOnly} className="bg-slate-700 hover:bg-slate-600 text-white w-full">Clear Credentials</Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
