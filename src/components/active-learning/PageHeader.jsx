import React from "react";

const PageHeader = ({ eyebrow, title, subtitle, actions }) => {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          {eyebrow}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;
