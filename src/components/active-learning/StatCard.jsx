import React from "react";

const StatCard = ({ label, title, children, className = "" }) => {
  return (
    <div
      className={`h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {label && <p className="text-sm text-slate-500">{label}</p>}
      {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
      {children}
    </div>
  );
};

export default StatCard;
