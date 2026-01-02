import { Badge } from "flowbite-react"
import type { ModelStatus } from "../../services/modelsApi"

const STATUS_CONFIG: Record<
  ModelStatus,
  { label: string, badgeColor: string, dotClass: string, pulse: boolean }
> = {
  DEPLOYED: {
    label: "DEPLOYED",
    badgeColor: "success",
    dotClass: "bg-emerald-500",
    pulse: false,
  },
  READY: {
    label: "READY",
    badgeColor: "info",
    dotClass: "bg-sky-500",
    pulse: false,
  },
  RETRAINING: {
    label: "RETRAINING",
    badgeColor: "warning",
    dotClass: "bg-amber-400",
    pulse: true,
  },
  FAILED: {
    label: "FAILED",
    badgeColor: "failure",
    dotClass: "bg-rose-500",
    pulse: false,
  },
  ARCHIVED: {
    label: "ARCHIVED",
    badgeColor: "gray",
    dotClass: "bg-slate-400",
    pulse: false,
  },
}

type StatusPillProps = {
  status: ModelStatus
}

const StatusPill = ({ status }: StatusPillProps) => {
  const config = STATUS_CONFIG[status]
  return (
    <Badge color={config.badgeColor} className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${config.dotClass} ${
          config.pulse ? "animate-pulse" : ""
        }`}
      />
      <span className="text-xs font-semibold tracking-wide">{config.label}</span>
    </Badge>
  )
}

export default StatusPill
