import React from "react";
import { Link, useLocation } from "react-router-dom";

const ActiveLearningSidebar = () => {
  const path = useLocation().pathname;

  const links = [
    { label: "Review Queue", to: "/active-learning/review" },
    { label: "Status Overview", to: "/active-learning/status" },
  ];

  return (
    <div className="sticky top-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Review Dashboard
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Navigation</h3>
        <nav className="mt-4 space-y-1">
          {links.map((link) => {
            const isActive = path === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ActiveLearningSidebar;
