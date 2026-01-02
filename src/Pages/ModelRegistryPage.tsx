import { useEffect, useMemo, useState } from "react"
import {
  Button,
  Card,
  Spinner,
  Table,
} from "flowbite-react"
import { FaBars, FaSyncAlt, FaTimes, FaEye } from "react-icons/fa"
import ActiveLearningSidebar from "../components/active-learning/ActiveLearningSidebar"
import DashboardShell from "../components/active-learning/DashboardShell"
import PageHeader from "../components/active-learning/PageHeader"
import StatusPill from "../components/models/StatusPill"
import FeatureColumnsAccordion from "../components/models/FeatureColumnsAccordion"
import ModelDetailsDrawer from "../components/models/ModelDetailsDrawer"
import {
  getCurrentModel,
  listModels,
  type ModelInfo,
} from "../services/modelsApi"

const mockCurrentModel: ModelInfo = {
  modelVersion: "v1.0.3",
  status: "DEPLOYED",
  trainedAt: "2025-12-29T18:12:34.857Z",
  trainedOnCases: 1240,
  featureColumns: [
    "patient_age",
    "gender_male",
    "uct_total_score",
    "aect_total_score",
    "confidence_predicted_drug_step",
    "risk_count",
    "risk_max",
    "risk_avg",
  ],
  metrics: {
    accuracy: 0.5,
    macro_f1: 0.3333333333333333,
    step_accuracy: 0.5,
  },
}

const mockModels: ModelInfo[] = [
  {
    modelVersion: "v1.0.4",
    status: "READY",
    trainedAt: "2026-01-06T10:22:11.000Z",
    trainedOnCases: 1290,
    featureColumns: mockCurrentModel.featureColumns,
    metrics: {
      accuracy: 0.56,
      macro_f1: 0.41,
      step_accuracy: 0.54,
    },
  },
  {
    modelVersion: "v1.0.3",
    status: "DEPLOYED",
    trainedAt: "2025-12-29T18:12:34.857Z",
    trainedOnCases: 1240,
    featureColumns: mockCurrentModel.featureColumns,
    metrics: {
      accuracy: 0.5,
      macro_f1: 0.3333333333333333,
      step_accuracy: 0.5,
    },
  },
  {
    modelVersion: "v1.0.2",
    status: "ARCHIVED",
    trainedAt: "2025-12-10T09:05:00.000Z",
    trainedOnCases: 1180,
    featureColumns: mockCurrentModel.featureColumns,
    metrics: {
      accuracy: 0.48,
      macro_f1: 0.31,
      step_accuracy: 0.47,
    },
  },
]

const formatDateTime = (value?: string) => {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatMetric = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available"
  return `${Math.round(value * 100)}%`
}

const toPercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null
  return Math.round(value * 100)
}

const ModelRegistryPage = () => {
  const [currentModel, setCurrentModel] = useState<ModelInfo | null>(
    mockCurrentModel
  )
  const [models, setModels] = useState<ModelInfo[]>(mockModels)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailsModel, setDetailsModel] = useState<ModelInfo | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  const hasRetraining = useMemo(() => {
    if (currentModel?.status === "RETRAINING") return true
    return models.some((model) => model.status === "RETRAINING")
  }, [currentModel, models])

  const loadModels = async (signal?: AbortSignal) => {
    const [current, list] = await Promise.all([
      getCurrentModel(signal),
      listModels(signal),
    ])
    setCurrentModel(current)
    setModels(list)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    const controller = new AbortController()
    try {
      await loadModels(controller.signal)
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load models"
      setError(message)
      setCurrentModel(mockCurrentModel)
      setModels(mockModels)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        await loadModels(controller.signal)
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load models"
        setError(message)
        setCurrentModel(mockCurrentModel)
        setModels(mockModels)
      } finally {
        setLoading(false)
      }
    }

    init()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!hasRetraining) return
    const interval = setInterval(() => {
      handleRefresh()
    }, 5000)
    return () => clearInterval(interval)
  }, [hasRetraining])

  const header = (
    <PageHeader
      eyebrow="Admin Dashboard"
      title="Model Retraining and Registry"
      subtitle="Monitor retraining jobs and manage deployable model versions"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button color="gray" onClick={handleRefresh} disabled={refreshing}>
            <span className="sr-only">
              {refreshing ? "Refreshing" : "Refresh"}
            </span>
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          </Button>
          <Button
            color="gray"
            pill
            onClick={() => setShowSidebar((prev) => !prev)}
            aria-label={showSidebar ? "Hide navigation" : "Show navigation"}
          >
            {showSidebar ? <FaTimes /> : <FaBars />}
          </Button>
        </div>
      }
    />
  )

  const contentClassName = showSidebar
    ? "mx-auto w-full max-w-6xl space-y-6 px-4 py-6"
    : "w-full space-y-6 px-2 py-6"

  return (
    <DashboardShell
      header={header}
      sidebar={showSidebar ? <ActiveLearningSidebar /> : null}
    >
      <div className={contentClassName}>
        {error && (
          <Card className="border border-rose-200 bg-rose-50 text-rose-700">
            {error}
          </Card>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner size="sm" /> Loading models
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Current Deployed Model
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {currentModel?.modelVersion || "Not available"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Trained at {formatDateTime(currentModel?.trainedAt)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Trained on {currentModel?.trainedOnCases ?? "Not available"} cases
                  </p>
                </div>
                {currentModel && <StatusPill status={currentModel.status} />}
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Metrics Overview
                  </p>
                  <p className="text-xs text-slate-500">Percent</p>
                </div>
                <div className="mt-3 flex flex-col gap-3 text-sm text-slate-600">
                  {[
                    { label: "Accuracy", value: toPercent(currentModel?.metrics?.accuracy) },
                    { label: "Macro F1", value: toPercent(currentModel?.metrics?.macro_f1) },
                    { label: "Step Accuracy", value: toPercent(currentModel?.metrics?.step_accuracy) },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center gap-3">
                      <span className="w-28 text-xs uppercase tracking-wide text-slate-500">
                        {metric.label}
                      </span>
                      <div className="h-2 w-full max-w-[320px] rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-sky-400"
                          style={{ width: `${metric.value ?? 0}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm text-slate-700">
                        {metric.value === null ? "N/A" : `${metric.value}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <FeatureColumnsAccordion columns={currentModel?.featureColumns} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  All Models
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Registry
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {models.length} total models
              </p>
            </div>

            {models.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No models available</p>
            ) : (
                <div className="mt-4 overflow-x-auto">
                  <Table>
                  <Table.Head>
                    <Table.HeadCell>Version</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Trained At</Table.HeadCell>
                    <Table.HeadCell>Trained On Cases</Table.HeadCell>
                    <Table.HeadCell>Metrics</Table.HeadCell>
                    <Table.HeadCell>Macro F1</Table.HeadCell>
                    <Table.HeadCell>Step Accuracy</Table.HeadCell>
                    <Table.HeadCell />
                  </Table.Head>
                    <Table.Body className="divide-y">
                      {models.map((model) => (
                        <Table.Row key={model.modelVersion}>
                          <Table.Cell className="font-semibold text-slate-900">
                            {model.modelVersion}
                          </Table.Cell>
                          <Table.Cell>
                            <StatusPill status={model.status} />
                          </Table.Cell>
                          <Table.Cell>{formatDateTime(model.trainedAt)}</Table.Cell>
                        <Table.Cell>
                          {model.trainedOnCases ?? "Not available"}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col gap-2 text-xs text-slate-500">
                            {[
                              { label: "Acc", value: toPercent(model.metrics?.accuracy) },
                              { label: "F1", value: toPercent(model.metrics?.macro_f1) },
                              { label: "Step", value: toPercent(model.metrics?.step_accuracy) },
                            ].map((metric) => (
                              <div key={metric.label} className="flex items-center gap-2">
                                <span className="w-8">{metric.label}</span>
                                <div className="h-2 w-24 rounded-full bg-slate-100">
                                  <div
                                    className="h-2 rounded-full bg-sky-400"
                                    style={{
                                      width: `${metric.value ?? 0}%`,
                                    }}
                                  />
                                </div>
                                <span className="w-10 text-slate-600">
                                  {metric.value === null ? "N/A" : `${metric.value}%`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          {formatMetric(model.metrics?.macro_f1)}
                        </Table.Cell>
                          <Table.Cell>
                            {formatMetric(model.metrics?.step_accuracy)}
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              color="gray"
                              size="xs"
                              onClick={() => setDetailsModel(model)}
                              aria-label={`View details for ${model.modelVersion}`}
                            >
                              <FaEye />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        )}

        <ModelDetailsDrawer
          model={detailsModel}
          open={Boolean(detailsModel)}
          onClose={() => setDetailsModel(null)}
        />
      </div>
    </DashboardShell>
  )
}

export default ModelRegistryPage
