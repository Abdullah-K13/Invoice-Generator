// src/data/companies.ts

// Import your actual logo assets
import webnativeLogo from "../assets/logo2-web.svg";
import jetjamsLogo from "../assets/logo1.webp";

export type CompanyProfile = {
  id: "webnative" | "jetjams";
  name: string;
  email: string;
  phone: string;
  address: string;
  logoDataUrl: string; // image import or data URL
  accent: string; // brand color
};

// Use your real logos
export const COMPANIES: CompanyProfile[] = [
  {
    id: "webnative",
    name: "WebNative",
    email: "hello@webnative.dev",
    phone: "+1 (555) 201-1122",
    address: "1400 Market St, Suite 500, San Francisco, CA",
    logoDataUrl: webnativeLogo, // ✅ uses logo2-webnative.jpg
    accent: "#0ea5e9", // sky-500
  },
  {
    id: "jetjams",
    name: "JetJams Technologies",
    email: "contact@jetjams.io",
    phone: "+1 (555) 441-7788",
    address: "88 King Street, Floor 6, New York, NY",
    logoDataUrl: jetjamsLogo, // ✅ uses logo1.svg
    accent: "#10b981", // emerald-500
  },
];
