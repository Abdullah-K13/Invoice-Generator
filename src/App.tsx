import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import BuilderPage from "./pages/Builder";
import SettingsPage from "./pages/Settings";
import PaymentPage from "./pages/Payment";

export default function App() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<BuilderPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/p/:data" element={<PaymentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* <footer className="no-print py-10 text-center text-sm text-slate-500">
        Built with ♥ — Secure Invoicing Pro
      </footer> */}
    </div>
  );
}