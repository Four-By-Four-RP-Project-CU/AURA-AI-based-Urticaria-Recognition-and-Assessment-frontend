import { Button, Modal } from "flowbite-react"
import StatusPill from "./StatusPill"
import type { ModelInfo } from "../../services/modelsApi"

const formatDateTime = (value?: string) => {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

type ModelDetailsDrawerProps = {
  model: ModelInfo | null,
  open: boolean,
  onClose: () => void,
  onDeploy?: (model: ModelInfo) => void,
  onArchive?: (model: ModelInfo) => void,
}

const ModelDetailsDrawer = ({
  model,
  open,
  onClose,
  onDeploy,
  onArchive,
}: ModelDetailsDrawerProps) => {
  const metricsJson = model?.metrics ? JSON.stringify(model.metrics, null, 2) : "{}"

  const canDeploy = model?.status === "READY"
  const canArchive =
    model?.status !== "DEPLOYED" && model?.status !== "RETRAINING"

  return (
    <Modal show={open} onClose={onClose} size="lg">
      <Modal.Header>Model Details</Modal.Header>
      <Modal.Body>
        {!model ? (
          <p className="text-sm text-slate-500">No model selected</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Version
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {model.modelVersion}
                </p>
              </div>
              <StatusPill status={model.status} />
            </div>

            <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Trained At
                </p>
                <p className="font-medium text-slate-900">
                  {formatDateTime(model.trainedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Trained On Cases
                </p>
                <p className="font-medium text-slate-900">
                  {model.trainedOnCases ?? "Not available"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Metrics
              </p>
              <pre className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                {metricsJson}
              </pre>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Feature Columns
              </p>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {(model.featureColumns || []).map((column) => (
                  <div
                    key={column}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1"
                  >
                    {column}
                  </div>
                ))}
                {(!model.featureColumns || model.featureColumns.length === 0) && (
                  <p className="text-sm text-slate-500">No columns recorded</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              color="info"
              disabled={!model || !canDeploy}
              onClick={() => model && onDeploy?.(model)}
            >
              Deploy
            </Button>
            <Button
              color="gray"
              disabled={!model || !canArchive}
              onClick={() => model && onArchive?.(model)}
            >
              Archive
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ModelDetailsDrawer
