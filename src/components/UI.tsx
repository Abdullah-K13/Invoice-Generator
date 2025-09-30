import React from "react";

export const Container: React.FC<React.PropsWithChildren<{className?: string}>> = ({ className = "", children }) => (
  <div className={`max-w-6xl mx-auto px-4 ${className}`}>{children}</div>
);

export const Card: React.FC<React.PropsWithChildren<{className?: string}>> = ({ className = "", children }) => (
  <div className={`bg-white rounded-2xl shadow-soft border border-slate-100 ${className}`}>{children}</div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200 ${className}`}
    {...props}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = "", ...props }) => (
  <textarea
    className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200 ${className}`}
    {...props}
  />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = "", ...props }) => (
  <label className={`block text-sm font-medium text-slate-700 ${className}`} {...props} />
);