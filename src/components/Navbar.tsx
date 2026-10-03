import { Link, NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const loc = useLocation();
  const isPaymentPage = loc.pathname.startsWith("/payment");

  if (isPaymentPage) {
    return null;
  }

  return (
    <header className={`no-print sticky top-0 z-40 bg-white/70 backdrop-blur border-b ${isPaymentPage ? "border-transparent" : "border-slate-100"}`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-slate-900">Secure Invoicing <span className="text-sky-500">Pro</span></Link>
        <nav className="flex items-center gap-6 text-sm">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}>Invoices</NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"}>Settings</NavLink>
          <a href="https://developer.paypal.com/home" target="_blank" className="text-slate-500 hover:text-slate-900">PayPal Docs</a>
        </nav>
      </div>
    </header>
  );
}