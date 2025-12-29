import React, { useMemo, useState, useEffect } from "react";
import { Badge, Button, TextInput } from "flowbite-react";
import {
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { mockActiveLearningCases } from "../../data/mockActiveLearningCases";
import { getUncertaintyLevel } from "../../utils/activeLearningUtils";
import ActiveLearningSidebar from "../../components/active-learning/ActiveLearningSidebar";
import DashboardShell from "../../components/active-learning/DashboardShell";
import PageHeader from "../../components/active-learning/PageHeader";
import Dropdown from "../../components/active-learning/Dropdown";

const OVERRIDES_KEY = "activeLearningCaseOverrides";

const ReviewQueuePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [uncertaintyFilter, setUncertaintyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("LOWEST_CONFIDENCE");
  const [expandedRows, setExpandedRows] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [activePanel, setActivePanel] = useState("queue");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const mergedCases = useMemo(() => {
    const overrides = JSON.parse(
      window.localStorage.getItem(OVERRIDES_KEY) || "{}"
    );
    return mockActiveLearningCases.map((item) => ({
      ...item,
      ...overrides[item.caseId],
    }));
  }, []);

  const visibleCases = useMemo(() => {
    let filtered = mergedCases.filter(
      (item) => item.confidence < item.threshold
    );

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.caseId.toLowerCase().includes(term) ||
          item.predictedLabel.toLowerCase().includes(term)
      );
    }

    if (uncertaintyFilter !== "ALL") {
      filtered = filtered.filter(
        (item) => getUncertaintyLevel(item.confidence) === uncertaintyFilter
      );
    }

    if (sortBy === "LOWEST_CONFIDENCE") {
      filtered = [...filtered].sort((a, b) => a.confidence - b.confidence);
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    }

    return filtered;
  }, [mergedCases, searchTerm, uncertaintyFilter, sortBy]);

  useEffect(() => {
    if (!selectedCaseId && visibleCases.length > 0) {
      setSelectedCaseId(visibleCases[0].caseId);
    }
    if (selectedCaseId && !visibleCases.find((item) => item.caseId === selectedCaseId)) {
      setSelectedCaseId(visibleCases[0]?.caseId || null);
    }
  }, [visibleCases, selectedCaseId]);

  const selectedCase = useMemo(
    () => mergedCases.find((item) => item.caseId === selectedCaseId) || null,
    [mergedCases, selectedCaseId]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(visibleCases.length / rowsPerPage)
  );

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return visibleCases.slice(start, start + rowsPerPage);
  }, [visibleCases, currentPage, rowsPerPage]);

  const pageRange = useMemo(() => {
    if (visibleCases.length === 0) return [];
    const pages = [];
    const maxButtons = 5;
    const siblingCount = 1;
    const showLeftEllipsis = currentPage > siblingCount + 2;
    const showRightEllipsis = currentPage < totalPages - (siblingCount + 1);

    if (!showLeftEllipsis && showRightEllipsis) {
      for (let i = 1; i <= maxButtons; i += 1) pages.push(i);
      pages.push("ellipsis-right");
      pages.push(totalPages);
      return pages;
    }

    if (showLeftEllipsis && !showRightEllipsis) {
      pages.push(1);
      pages.push("ellipsis-left");
      for (let i = totalPages - (maxButtons - 1); i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    if (showLeftEllipsis && showRightEllipsis) {
      pages.push(1);
      pages.push("ellipsis-left");
      for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i += 1) {
        pages.push(i);
      }
      pages.push("ellipsis-right");
      pages.push(totalPages);
      return pages;
    }

    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages, visibleCases.length]);

  const rangeStart = visibleCases.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const rangeEnd = Math.min(currentPage * rowsPerPage, visibleCases.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, uncertaintyFilter, sortBy, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusColor = (status) => {
    if (status === "REVIEWED") return "success";
    if (status === "RETRAINED") return "info";
    return "warning";
  };

  const toggleRow = (caseId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const handleSelectCase = (caseId) => {
    setSelectedCaseId(caseId);
    setActivePanel("details");
  };

  const header = (
    <PageHeader
      eyebrow="Review Dashboard"
      title="Review Queue"
      subtitle="Cases flagged for clinician review and uncertainty handling."
      actions={
        <Button
          color="gray"
          pill
          onClick={() => setShowSidebar((prev) => !prev)}
          aria-label={showSidebar ? "Hide navigation" : "Show navigation"}
        >
          {showSidebar ? <FaTimes /> : <FaBars />}
        </Button>
      }
    />
  );

  return (
    <DashboardShell
      header={header}
      sidebar={showSidebar ? <ActiveLearningSidebar /> : null}
    >
      <div className="mb-4 flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setActivePanel("queue")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
            activePanel === "queue"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Queue
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("details")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
            activePanel === "details"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Case Details
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div
          className={`lg:col-span-4 ${
            activePanel === "queue" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="sticky top-0 z-10 rounded-t-xl border-b border-slate-100 bg-white p-4">
              <div className="flex flex-col gap-3">
                <TextInput
                  className="w-full"
                  theme={{
                    field: { input: { withAddon: { off: "rounded-full" } } },
                  }}
                  placeholder="Enter Case ID or Label"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Dropdown
                    value={uncertaintyFilter}
                    onChange={setUncertaintyFilter}
                    options={[
                      { value: "ALL", label: "All Uncertainty Levels" },
                      { value: "High", label: "High Uncertainty" },
                      { value: "Medium", label: "Medium Uncertainty" },
                    ]}
                  />
                  <Dropdown
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: "LOWEST_CONFIDENCE", label: "Lowest confidence first" },
                      { value: "LATEST_FIRST", label: "Latest first" },
                    ]}
                  />
                </div>
                <div className="text-sm text-slate-600">
                  {visibleCases.length} case
                  {visibleCases.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-220px)] overflow-y-auto p-4">
              {visibleCases.length === 0 && (
                <p className="text-sm text-slate-500">
                  No cases match the current filters.
                </p>
              )}

              <div className="space-y-3">
                {paginatedCases.map((item) => {
                  const isSelected = item.caseId === selectedCaseId;
                  return (
                    <div
                      key={item.caseId}
                      className={`rounded-lg border ${
                        isSelected
                          ? "border-blue-300 bg-blue-50/40"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectCase(item.caseId)}
                        className="flex w-full items-start justify-between gap-3 px-3 py-3 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.caseId}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.predictedLabel}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span>{item.age} / {item.sex}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {item.confidence}%
                          </span>
                          <Badge
                            color={
                              getUncertaintyLevel(item.confidence) === "High"
                                ? "failure"
                                : "warning"
                            }
                          >
                            {getUncertaintyLevel(item.confidence)}
                          </Badge>
                        </div>
                      </button>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
                        <Badge color={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="xs"
                            color="info"
                            onClick={() =>
                              navigate(`/active-learning/review/${item.caseId}`)
                            }
                            aria-label="View case"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            size="xs"
                            color="gray"
                            onClick={() => toggleRow(item.caseId)}
                            aria-label={
                              expandedRows[item.caseId]
                                ? "Hide details"
                                : "Show details"
                            }
                          >
                            {expandedRows[item.caseId] ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </Button>
                        </div>
                      </div>
                      {expandedRows[item.caseId] && (
                        <div className="border-t border-slate-100 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Hospital
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.hospital}
                              </p>
                              <p className="mt-1">Symptoms: {item.symptoms}</p>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Inference
                              </p>
                              <p>ID: {item.inferenceId}</p>
                              <p>Run: {new Date(item.runAt).toLocaleString()}</p>
                              <p>Model: {item.modelName}</p>
                              <p>Threshold: {item.threshold}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {visibleCases.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                <span>
                  Showing {rangeStart} to {rangeEnd} of {visibleCases.length}{" "}
                  entries in {totalPages} page{totalPages === 1 ? "" : "s"}.
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <Dropdown
                      value={rowsPerPage}
                      onChange={setRowsPerPage}
                      options={[
                        { value: 5, label: "5" },
                        { value: 10, label: "10" },
                        { value: 20, label: "20" },
                        { value: 50, label: "50" },
                      ]}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50"
                      aria-label="Previous page"
                    >
                      ‹
                    </button>
                    {pageRange.map((page) => {
                      if (page === "ellipsis-left" || page === "ellipsis-right") {
                        return (
                          <span
                            key={page}
                            className="px-2 text-slate-400"
                          >
                            …
                          </span>
                        );
                      }
                      const isActive = page === currentPage;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold ${
                            isActive
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50"
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`lg:col-span-8 ${
            activePanel === "details" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Selected Case</p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {selectedCase?.caseId || "No case selected"}
                  </h2>
                </div>
                {selectedCase && (
                  <Button
                    color="gray"
                    pill
                    className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() =>
                      navigate(`/active-learning/review/${selectedCase.caseId}`)
                    }
                  >
                    View Full Case
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Review case summary, model confidence, and next actions.
              </p>
              <div className="mt-3 flex gap-2 lg:hidden">
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setActivePanel("queue")}
                >
                  Back to Queue
                </Button>
              </div>
            </div>

            <div className="grid gap-6 p-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Clinical Summary
                  </p>
                  {selectedCase ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Patient</span>
                        <span className="font-semibold text-slate-900">
                          {selectedCase.age} / {selectedCase.sex}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hospital</span>
                        <span className="font-semibold text-slate-900">
                          {selectedCase.hospital}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Symptoms</span>
                        <span className="font-semibold text-slate-900">
                          {selectedCase.symptoms}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Select a case to view summary details.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Prediction & Confidence
                  </p>
                  {selectedCase ? (
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Prediction</span>
                        <span className="font-semibold text-slate-900">
                          {selectedCase.predictedLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Confidence</span>
                        <span className="font-semibold text-slate-900">
                          {selectedCase.confidence}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Uncertainty</span>
                        <Badge
                          color={
                            getUncertaintyLevel(selectedCase.confidence) ===
                            "High"
                              ? "failure"
                              : "warning"
                          }
                        >
                          {getUncertaintyLevel(selectedCase.confidence)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Select a case to view prediction summary.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Inference Details
                </p>
                {selectedCase ? (
                  <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Model
                      </p>
                      <p className="font-semibold text-slate-900">
                        {selectedCase.modelName} {selectedCase.modelVersion}
                      </p>
                      <p className="mt-1">Run: {new Date(selectedCase.runAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Threshold & Status
                      </p>
                      <p className="mt-1">Threshold: {selectedCase.threshold}%</p>
                      <Badge color={getStatusColor(selectedCase.status)}>
                        {selectedCase.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Select a case to view inference metadata.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default ReviewQueuePage;
