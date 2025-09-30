import { loadSettings } from "./storage";

let scriptLoading: Promise<void> | null = null;

export function loadPayPalSdk(currency: string = "USD", extra = ""): Promise<void> {
  if (scriptLoading) return scriptLoading;
  const { paypalClientId } = loadSettings();
  return (scriptLoading = new Promise((resolve, reject) => {
    if (!paypalClientId) {
      resolve();
      return;
    }
    const exists = document.querySelector('script[data-sip-paypal]');
    if (exists) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalClientId)}&currency=${currency}&components=buttons,messages&enable-funding=paylater,card${extra}`;
    s.async = true;
    s.setAttribute("data-sip-paypal", "1");
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.head.appendChild(s);
  }));
}