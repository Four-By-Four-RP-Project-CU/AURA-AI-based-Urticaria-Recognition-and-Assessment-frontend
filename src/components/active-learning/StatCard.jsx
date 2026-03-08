import React from "react";

const StatCard = ({ label, title, children, className = "" }) => {
  const baseClassName = "h-full rounded-xl border p-6 shadow-sm";
  const defaultClassName = "border-slate-200 bg-white";
  return (
    <div
      className={`${baseClassName} ${className || defaultClassName}`}
    >
      {label && <p className="text-sm text-slate-500">{label}</p>}
      {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
      {children}
    </div>
  );
};

export default StatCard;
