import type { ModelMetrics } from "../../services/modelsApi"

const formatMetric = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available"
  return `${Math.round(value * 100)}%`
}

type MetricsGridProps = {
  metrics?: ModelMetrics
}

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">Accuracy</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {formatMetric(metrics?.accuracy)}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">Macro F1</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {formatMetric(metrics?.macro_f1)}
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Step Accuracy
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {formatMetric(metrics?.step_accuracy)}
        </p>
      </div>
    </div>
  )
}

export default MetricsGrid
