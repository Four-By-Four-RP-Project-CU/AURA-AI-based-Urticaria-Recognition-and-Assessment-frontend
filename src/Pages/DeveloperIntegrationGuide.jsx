import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "architecture", label: "Architecture" },
  { id: "quickstart", label: "Quickstart" },
  { id: "api", label: "API" },
  { id: "sequence", label: "Sequence" },
  { id: "promotion", label: "Promotion" },
  { id: "multimodel", label: "Multi-model" },
  { id: "config", label: "Config" },
  { id: "security", label: "Security" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "commercial", label: "Commercial" },
];

const lifecycleSteps = [
  "Predict",
  "Sample for Review",
  "Submit Review",
  "Retrain",
  "Promote",
  "Predict with current",
];

const architectureComponents = [
  {
    title: "Inference API",
    description:
      "Serves online predictions with model metadata and trace IDs for auditability.",
  },
  {
    title: "Review Queue",
    description:
      "Collects sampled low-confidence cases and routes them for clinician review.",
  },
  {
    title: "Admin Labeling",
    description:
      "Provides controlled workflows for clinicians and admins to submit validated labels.",
  },
  {
    title: "Retraining Engine",
    description:
      "Builds candidate model versions from newly reviewed cases and evaluates quality gates.",
  },
  {
    title: "Model Registry (models/current)",
    description:
      "Tracks model versions, status, metrics, and promotion outputs with lineage.",
  },
  {
    title: "Monitoring",
    description:
      "Observes confidence drift, queue aging, callback failures, and deployment outcomes.",
  },
];

const quickstartTabs = ["API Mode", "CLI Mode"];

const endpointRows = [
  { method: "GET", path: "/health", purpose: "Service and dependency health" },
  {
    method: "GET",
    path: "/model/status",
    purpose: "Current model status and deployment metadata",
  },
  { method: "POST", path: "/predict", purpose: "Run inference on incoming payload" },
  {
    method: "POST",
    path: "/sample-for-review",
    purpose: "Push low-confidence cases into review queue",
  },
  {
    method: "POST",
    path: "/submit-review",
    purpose: "Submit clinician/admin review outcomes",
  },
  { method: "POST", path: "/retrain", purpose: "Trigger retraining pipeline" },
];

const endpointDetails = [
  {
    title: "GET /health",
    method: "GET",
    request: `curl -X GET https://api.example.com/health`,
    response: `{
  "status": "ok",
  "service": "active-learning-api",
  "version": "1.0.0"
}`,
  },
  {
    title: "GET /model/status",
    method: "GET",
    request: `curl -X GET https://api.example.com/model/status`,
    response: `{
  "model_version": "model_2026_03_08_01",
  "promotion_status": "promoted",
  "trained_at": "2026-03-08T04:00:00Z"
}`,
  },
  {
    title: "POST /predict",
    method: "POST",
    request: `{
  "image_id": "img_001",
  "patient_id": "pat_8821",
  "features": { "age": 39, "lesion_area": 14.2 }
}`,
    response: `{
  "prediction": "chronic_urticaria",
  "confidence": 0.84,
  "model_version": "model_2026_03_08_01",
  "trace_id": "trc_99121"
}`,
  },
  {
    title: "POST /sample-for-review",
    method: "POST",
    request: `{
  "trace_id": "trc_99121",
  "reason": "low_confidence",
  "score": 0.58
}`,
    response: `{
  "queued": true,
  "queue_id": "rq_3341",
  "queue_length": 108
}`,
  },
  {
    title: "POST /submit-review",
    method: "POST",
    request: `{
  "queue_id": "rq_3341",
  "reviewer_id": "clinician_12",
  "final_label": "acute_urticaria",
  "notes": "Verified with chart"
}`,
    response: `{
  "saved": true,
  "review_id": "rev_991",
  "total_reviewed": 800
}`,
  },
  {
    title: "POST /retrain",
    method: "POST",
    request: `{
  "min_new_samples": 200,
  "train_force": false,
  "callback_url": "https://ops.example.com/pipeline-callback"
}`,
    response: `{
  "accepted": true,
  "job_id": "rt_781",
  "status": "queued"
}`,
  },
];

const envRows = [
  ["MODELS_DIR", "Directory holding model versions and models/current symlink"],
  ["PROCESSED_CSV", "Location of processed training-ready dataset"],
  ["REVIEWED_CASES_JSON", "Path to approved clinician reviewed cases"],
  ["REVIEW_QUEUE_JSON", "Path to pending review queue state"],
  ["MIN_NEW_SAMPLES", "Minimum reviewed samples before retraining"],
  ["TRAIN_SEED", "Deterministic seed for reproducible training"],
  ["TRAIN_FORCE", "Force retraining even if thresholds are unmet"],
  ["SAMPLE_SIZE", "Absolute sample count for review selection"],
  ["SAMPLE_RANDOM_FRACTION", "Random fraction used in uncertain-case sampling"],
  ["CALLBACK_URL", "Endpoint notified on retrain/promotion completion"],
  ["CALLBACK_AUTH", "Authorization header/token for callback requests"],
];

const serviceYaml = `pipeline:
  mode: api
  models_dir: ./models
  review:
    queue_file: ./data/review_queue.json
    reviewed_file: ./data/reviewed_cases.json
  retraining:
    min_new_samples: 200
    sample_size: 150
    random_fraction: 0.25
  callbacks:
    url: https://ops.example.com/pipeline-callback
    auth_env: CALLBACK_AUTH`;

const quickstartApi = [
  "cp .env.example .env",
  "./start.sh",
  "docker build -t active-learning-pipeline:1.0 .",
  "docker run -p 8000:8000 --env-file .env active-learning-pipeline:1.0",
  "curl -s http://localhost:8000/health",
];

const quickstartCli = [
  "cp .env.example .env",
  "./start.sh --mode cli",
  "python -m app.cli sample-for-review",
  "python -m app.cli retrain",
  "python -m app.cli promote",
];

const sectionVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function StatusBadge({ value }) {
  const styles = {
    promoted: "bg-emerald-100 text-emerald-800",
    not_promoted: "bg-amber-100 text-amber-800",
    skipped: "bg-slate-200 text-slate-700",
    error: "bg-rose-100 text-rose-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
        styles[value] || "bg-slate-100 text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}

function CodeBlock({ language = "bash", code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <span className="text-xs uppercase tracking-wide text-slate-400">{language}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      variants={sectionVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
    >
      <header className="space-y-1">
        <h2 id={`${id}-title`} className="text-2xl font-semibold text-slate-900">
          {title}
        </h2>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </header>
      {children}
    </motion.section>
  );
}

function SidebarNav({ items, activeId, open, onToggle, isDesktop }) {
  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      onToggle(false);
    }
  };

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="guide-sidebar"
          onClick={() => onToggle(!open)}
          className="mb-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {open ? "Close Menu" : "Section Menu"}
        </button>
      </div>

      <AnimatePresence>
        {(open || isDesktop) && (
          <motion.aside
            id="guide-sidebar"
            className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                On this page
              </p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = activeId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full rounded-lg px-2 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                          active
                            ? "bg-sky-50 font-semibold text-sky-700"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
            {endpoint.method}
          </span>
          <h3 className="font-medium text-slate-900">{endpoint.title}</h3>
        </div>
        <span className="text-sm text-slate-600">{open ? "Hide" : "Show"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 overflow-hidden border-t border-slate-200 p-4 lg:grid-cols-2"
          >
            <CodeBlock language="json" code={endpoint.request} />
            <CodeBlock language="json" code={endpoint.response} />
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function ConfigTable({ rows, headers }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            {headers.map((head) => (
              <th key={head} className="px-4 py-3 font-semibold">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white text-slate-700">
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-slate-200 align-top">
              <td className="px-4 py-3 font-mono text-xs text-slate-900">{row[0]}</td>
              <td className="px-4 py-3">{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TroubleshootingAccordion() {
  const items = [
    {
      title: "No current model found",
      body: "Validate models/current points to a valid model directory. Run registry sync and confirm model artifacts are present.",
    },
    {
      title: "Not enough new samples",
      body: "Check MIN_NEW_SAMPLES and reviewed queue counts. Lower threshold only with governance approval.",
    },
    {
      title: "Callback failed",
      body: "Verify CALLBACK_URL reachability, CALLBACK_AUTH token, TLS certificates, and retry/backoff configuration.",
    },
    {
      title: "FastAPI import/dependency issues",
      body: "Recreate virtual environment, reinstall pinned dependencies, and confirm PYTHONPATH/module entrypoints.",
    },
  ];

  const [active, setActive] = useState(0);

  const onKeyDown = (event, idx) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((idx + 1) % items.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((idx - 1 + items.length) % items.length);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = active === idx;
        return (
          <div key={item.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setActive(isOpen ? -1 : idx)}
              onKeyDown={(event) => onKeyDown(event, idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {item.title}
              <span className="text-slate-500">{isOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-slate-200"
                >
                  <p className="px-4 py-3 text-sm text-slate-600">{item.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Name</span>
          <input
            required
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Company</span>
          <input
            required
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Work Email</span>
          <input
            required
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Use Case</span>
          <input
            required
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          />
        </label>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        Submit
      </button>
      {submitted ? <p className="text-sm text-emerald-700">Request submitted (mock frontend only).</p> : null}
    </form>
  );
}

const DeveloperIntegrationGuide = () => {
  const [activeTab, setActiveTab] = useState("API Mode");
  const [activeSection, setActiveSection] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateDesktop = () => {
      setIsDesktop(media.matches);
      if (media.matches) {
        setMenuOpen(true);
      } else {
        setMenuOpen(false);
      }
    };
    updateDesktop();
    media.addEventListener("change", updateDesktop);
    return () => media.removeEventListener("change", updateDesktop);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.2, 0.4, 0.65],
      }
    );

    NAV_ITEMS.forEach((item) => {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const activeQuickstartCommands = useMemo(
    () => (activeTab === "API Mode" ? quickstartApi : quickstartCli),
    [activeTab]
  );

  const smoothScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTabKeydown = (event, currentIndex) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + quickstartTabs.length) % quickstartTabs.length;
    setActiveTab(quickstartTabs[nextIndex]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white px-3 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[16rem_1fr]">
        <SidebarNav
          items={NAV_ITEMS}
          activeId={activeSection}
          open={menuOpen}
          onToggle={setMenuOpen}
          isDesktop={isDesktop}
        />

        <div className="space-y-6">
          <Section
            id="overview"
            title="Active Learning Pipeline - Developer Integration Guide"
            subtitle="Enterprise integration reference for Human-in-the-Loop model operations"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                v1.0
              </span>
              <p className="text-sm text-slate-600">
                Production-ready guidance for deployment, governance, and model lifecycle operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => smoothScrollTo("quickstart")}
                className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => smoothScrollTo("api")}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                View API Spec
              </button>
              <button
                type="button"
                onClick={() => smoothScrollTo("commercial")}
                className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Contact Sales
              </button>
            </div>
          </Section>

          <Section id="lifecycle" title="Lifecycle" subtitle="Predict to promotion loop">
            <div className="md:hidden">
              <ol className="space-y-3">
                {lifecycleSteps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <motion.ol
              className="hidden grid-cols-6 gap-3 md:grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {lifecycleSteps.map((step, idx) => (
                <motion.li
                  key={step}
                  variants={staggerItem}
                  className="relative rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">Step {idx + 1}</span>
                  <p className="mt-1 text-sm font-medium text-slate-800">{step}</p>
                </motion.li>
              ))}
            </motion.ol>
          </Section>

          <Section id="architecture" title="Architecture" subtitle="Core platform components">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {architectureComponents.map((component) => (
                <motion.article
                  key={component.title}
                  variants={staggerItem}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="font-semibold text-slate-900">{component.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{component.description}</p>
                </motion.article>
              ))}
            </motion.div>
            <pre className="mermaid overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
              {`flowchart LR
  A[Inference API] --> B[Sample for Review]
  B --> C[Review Queue]
  C --> D[Admin Labeling]
  D --> E[Retraining Engine]
  E --> F[Model Registry]
  F --> G[models/current]
  G --> A`}
            </pre>
          </Section>

          <Section id="quickstart" title="Quickstart" subtitle="Bootstrap in API or CLI mode">
            <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              {["Docker 24+", "Python 3.11+", "POSIX shell", "Configured .env values"].map((item) => (
                <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="mr-2 text-emerald-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div>
              <div role="tablist" aria-label="Quickstart mode" className="flex flex-wrap gap-2">
                {quickstartTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`panel-${tab}`}
                    id={`tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    onKeyDown={(event) =>
                      handleTabKeydown(event, quickstartTabs.indexOf(tab))
                    }
                    className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      activeTab === tab
                        ? "bg-sky-700 text-white"
                        : "border border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                className="mt-4 space-y-3"
              >
                {activeQuickstartCommands.map((command) => (
                  <CodeBlock key={command} language="bash" code={command} />
                ))}
              </div>
            </div>
          </Section>

          <Section id="api" title="API Reference" subtitle="Endpoints and examples">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Method</th>
                    <th className="px-4 py-3 font-semibold">Path</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {endpointRows.map((row) => (
                    <tr key={row.path} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                          {row.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-800">{row.path}</td>
                      <td className="px-4 py-3 text-slate-600">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3">
              {endpointDetails.map((endpoint) => (
                <EndpointCard key={endpoint.title} endpoint={endpoint} />
              ))}
            </div>
          </Section>

          <Section id="sequence" title="Sequence" subtitle="Human-in-the-loop interaction flow">
            <pre className="mermaid overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">
              {`sequenceDiagram
  participant Client
  participant API as Inference API
  participant Queue as Review Queue
  participant Clinician
  participant Trainer as Retraining Engine
  participant Registry as Model Registry

  Client->>API: POST /predict
  API-->>Client: prediction + confidence
  API->>Queue: POST /sample-for-review
  Clinician->>Queue: POST /submit-review
  Queue->>Trainer: reviewed cases
  Trainer->>Registry: candidate model metrics
  Registry-->>API: promote -> models/current
  Client->>API: POST /predict (new model)`}
            </pre>
          </Section>

          <Section id="promotion" title="Promotion Outcomes" subtitle="Possible pipeline outputs">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {["promoted", "not_promoted", "skipped", "error"].map((status) => (
                <div key={status} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <StatusBadge value={status} />
                  <p className="mt-2 text-sm text-slate-600">
                    {status === "promoted" &&
                      "Candidate met quality gates and is now active."}
                    {status === "not_promoted" &&
                      "Candidate trained but failed thresholds."}
                    {status === "skipped" &&
                      "Run skipped due to policy or insufficient deltas."}
                    {status === "error" && "Run failed and requires operator intervention."}
                  </p>
                </div>
              ))}
            </div>
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              All inference traffic resolves through <code className="font-mono">models/current</code> after promotion.
            </p>
          </Section>

          <Section
            id="multimodel"
            title="Multi-model Comparison"
            subtitle="Model A vs Model B vs Active Learned Model"
          >
            <p className="text-sm text-slate-600">
              For controlled rollouts, score each case with three models and capture clinician adjudication for objective offline evaluation.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Model A</th>
                    <th className="px-4 py-3">Model B</th>
                    <th className="px-4 py-3">Active Learned Model</th>
                    <th className="px-4 py-3">Clinician Final Label</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-slate-700">
                  {[
                    ["case_001", "chronic (0.81)", "acute (0.66)", "chronic (0.89)", "chronic"],
                    ["case_002", "acute (0.54)", "acute (0.71)", "acute (0.83)", "acute"],
                    ["case_003", "chronic (0.63)", "chronic (0.68)", "acute (0.74)", "acute"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t border-slate-200">
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="config" title="Configuration" subtitle="Service YAML and environment variables">
            <CodeBlock language="yaml" code={serviceYaml} />
            <ConfigTable rows={envRows} headers={["Variable", "Description"]} />
          </Section>

          <Section id="security" title="Security" subtitle="Authentication, callbacks, and audit trail">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">Auth and Callback Guidance</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>Require bearer auth or mTLS for all mutation endpoints.</li>
                  <li>Sign callback payloads and validate timestamp/replay window.</li>
                  <li>Scope callback tokens to least-privilege notification actions.</li>
                </ul>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">Audit Trail Recommendations</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>Record clinician and admin actor IDs for every review action.</li>
                  <li>Persist before/after labels, timestamps, and source trace IDs.</li>
                  <li>Include promotion decision metadata for compliance checks.</li>
                </ul>
              </article>
            </div>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting" subtitle="Common operational issues">
            <TroubleshootingAccordion />
          </Section>

          <Section
            id="commercial"
            title="Commercial"
            subtitle="Enterprise integration, SLA options, and support onboarding"
          >
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-700 to-blue-700 p-5 text-white">
              <h3 className="text-xl font-semibold">Enterprise Active Learning Enablement</h3>
              <p className="mt-1 text-sm text-sky-50">
                Get integration architecture support, production SLA, and dedicated model operations guidance.
              </p>
            </div>
            <ContactForm />
          </Section>
        </div>
      </div>
    </main>
  );
};

export default DeveloperIntegrationGuide;
