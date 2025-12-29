import React from "react";

const DashboardShell = ({
  header,
  sidebar,
  children,
  className = "",
  maxWidth = "max-w-screen-2xl",
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`mx-auto ${maxWidth} px-4 sm:px-6 lg:px-8 py-8 lg:py-10`}>
        {header}
        {sidebar ? (
          <div className={`grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] ${className}`}>
            <aside className="order-2 lg:order-1">{sidebar}</aside>
            <section className="order-1 lg:order-2">{children}</section>
          </div>
        ) : (
          <div className={className}>{children}</div>
        )}
      </div>
    </div>
  );
};

export default DashboardShell;
