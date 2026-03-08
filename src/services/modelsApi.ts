/// <reference types="vite/client" />

export type ModelStatus = "DEPLOYED" | "READY" | "RETRAINING" | "FAILED" | "ARCHIVED"

export type ModelMetrics = {
  accuracy?: number,
  macro_f1?: number,
  step_accuracy?: number,
}

export type ModelInfo = {
  id?: string,
  modelVersion: string,
  status: ModelStatus,
  trainedAt?: string,
  trainedOnCases?: number,
  featureColumns?: string[],
  metrics?: ModelMetrics,
  promoted?: boolean,
}

export type RetrainResponse = {
  retrainJobId: string,
  candidateModelVersion: string,
  status: ModelStatus,
}

export type RetrainingCoverageInsight = {
  retrainedCases: number,
  targetCases: number,
  progressPercent: number,
  eligibleReviewedCases: number,
  currentModelVersion: string,
  confidenceTargetPercent: number,
  lastUpdatedAt?: string,
}

export type DatasetReadinessInsight = {
  reviewedCases: number,
  totalCases: number,
  coverageRatePercent: number,
  correctionsLogged: number,
  acceptedPredictions: number,
  targetRangeStart: number,
  targetRangeEnd: number,
  minimumMet: boolean,
  lastUpdatedAt?: string,
}

export type RecentActivityInsight = {
  reviewedThisCycle: number,
  acceptedCount: number,
  correctedCount: number,
  rejectedCount: number,
  lastUpdatedAt?: string,
}

export type LabelCoverageInsight = {
  reviewedCases: number,
  targetReviewedCases: number,
  acceptedCount: number,
  correctedCount: number,
  rejectedCount: number,
  readyForRetraining: boolean,
  lastUpdatedAt?: string,
}

export type DashboardInsights = {
  retrainingCoverage: RetrainingCoverageInsight,
  datasetReadiness: DatasetReadinessInsight,
  recentActivity: RecentActivityInsight,
  labelCoverage: LabelCoverageInsight,
}

export type RedeploymentStatusInsight = {
  currentModelVersion: string,
  isLive: boolean,
  eligibleReviewedCases: number,
  confidenceTargetPercent: number,
  updatedModelDeployed: boolean,
  activeLearningEnabled: boolean,
  redeploymentStatusMessage: string,
  lastUpdatedAt?: string,
}

export type CurrentDeployedModelInsight = {
  modelVersion: string,
  modelStatus: ModelStatus,
  trainedAt?: string,
  trainedCases?: number,
  accuracyPercent?: number,
  macroF1Percent?: number,
  stepAccuracyPercent?: number,
  featureColumns?: string[],
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"
const DASHBOARD_REVIEW_BASIC_AUTH = import.meta.env.VITE_DASHBOARD_REVIEW_BASIC_AUTH

const buildAuthHeaders = () => {
  const headers: Record<string, string> = {}
  if (DASHBOARD_REVIEW_BASIC_AUTH) {
    headers.Authorization = `Basic ${DASHBOARD_REVIEW_BASIC_AUTH}`
  }
  return headers
}

const buildUrl = (path: string) => {
  if (!API_BASE_URL) return path
  if (API_BASE_URL.endsWith("/") && path.startsWith("/")) {
    return `${API_BASE_URL.slice(0, -1)}${path}`
  }
  if (!API_BASE_URL.endsWith("/") && !path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`
  }
  return `${API_BASE_URL}${path}`
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = `Request failed with ${response.status}`
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export const getCurrentModel = async (signal?: AbortSignal) => {
  const response = await fetch(buildUrl("/api/models/current"), { signal })
  return handleResponse<ModelInfo>(response)
}

export const listModels = async (signal?: AbortSignal) => {
  const response = await fetch(buildUrl("/api/models"), { signal })
  return handleResponse<ModelInfo[]>(response)
}

const mapRetrainResponse = (payload: Record<string, unknown>): RetrainResponse => {
  const retrainJobId =
    (payload.retrainJobId as string) ||
    (payload.jobId as string) ||
    (payload.job_id as string) ||
    (payload.id as string) ||
    "unknown"
  const candidateModelVersion =
    (payload.candidateModelVersion as string) ||
    (payload.modelVersion as string) ||
    (payload.version as string) ||
    "unknown"
  const status = normalizeStatus(payload.status as string) || "RETRAINING"
  return {
    retrainJobId,
    candidateModelVersion,
    status,
  }
}

export const triggerRetrain = async () => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/clinician-feedback-train-model"),
    {
      method: "POST",
      headers: buildAuthHeaders(),
    }
  )
  const payload = await handleResponse<Record<string, unknown>>(response)
  return mapRetrainResponse(payload)
}

const normalizeStatus = (value?: string): ModelStatus => {
  const normalized = (value || "").toUpperCase()
  if (["DEPLOYED", "READY", "RETRAINING", "FAILED", "ARCHIVED"].includes(normalized)) {
    return normalized as ModelStatus
  }
  return "READY"
}

const parseStatus = (value: unknown): ModelStatus | undefined => {
  if (typeof value !== "string") return undefined
  const normalized = value.toUpperCase()
  if (["DEPLOYED", "READY", "RETRAINING", "FAILED", "ARCHIVED"].includes(normalized)) {
    return normalized as ModelStatus
  }
  return undefined
}

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

const toRatio = (value: unknown) => {
  const numeric = toNumber(value)
  if (numeric === undefined) return undefined
  return numeric > 1 ? numeric / 100 : numeric
}

const mapModelMetrics = (source?: Record<string, unknown>): ModelMetrics | undefined => {
  if (!source) return undefined
  const accuracy = toRatio(source.accuracy ?? source.acc)
  const macro_f1 = toRatio(source.macro_f1 ?? source.macroF1)
  const step_accuracy = toRatio(source.step_accuracy ?? source.stepAccuracy)
  if (accuracy === undefined && macro_f1 === undefined && step_accuracy === undefined) {
    return undefined
  }
  return {
    accuracy,
    macro_f1,
    step_accuracy,
  }
}

const mapCurrentDeployedModel = (
  payload: CurrentDeployedModelInsight | Record<string, unknown>
): ModelInfo | null => {
  const item = payload as Record<string, unknown>
  const modelVersion =
    typeof item.modelVersion === "string" ? item.modelVersion.trim() : ""
  const status = parseStatus(item.modelStatus ?? item.status)

  // Empty payload means there is currently no deployed model.
  if (!modelVersion && !status) return null

  return {
    modelVersion: modelVersion || "Unknown",
    status: status || "READY",
    trainedAt: item.trainedAt as string,
    trainedOnCases: toNumber(item.trainedCases),
    featureColumns:
      (item.featureColumns as string[]) ||
      (item.feature_columns as string[]) ||
      [],
    metrics: {
      accuracy: toRatio(item.accuracyPercent),
      macro_f1: toRatio(item.macroF1Percent),
      step_accuracy: toRatio(item.stepAccuracyPercent),
    },
    promoted: true,
  }
}

const mapModelRegistryItem = (item: Record<string, unknown>): ModelInfo => {
  const modelVersion =
    (item.modelVersion as string) ||
    (item.version as string) ||
    (item.model_version as string) ||
    (item.name as string) ||
    "Unknown"
  const metrics = mapModelMetrics((item.metrics as Record<string, unknown>) || item)
  return {
    id: (item.id as string) || (item._id as string) || (item.modelId as string),
    modelVersion,
    status: normalizeStatus(item.status as string),
    trainedAt:
      (item.trainedAt as string) ||
      (item.trained_at as string) ||
      (item.createdAt as string),
    trainedOnCases:
      toNumber(item.trainedOnCases) ??
      toNumber(item.trainedCases) ??
      toNumber(item.trained_on_cases) ??
      toNumber(item.trainingCases) ??
      toNumber(item.caseCount),
    featureColumns:
      (item.featureColumns as string[]) ||
      (item.features as string[]) ||
      (item.feature_columns as string[]),
    metrics,
    promoted: Boolean(item.promoted),
  }
}

export const listModelRegistry = async (signal?: AbortSignal) => {
  const response = await fetch(buildUrl("/api/v1/dashboard-review/model-registry"), {
    headers: buildAuthHeaders(),
    signal,
  })
  const payload = await handleResponse<unknown>(response)
  const records = Array.isArray(payload)
    ? payload
    : (payload as { records?: unknown[]; data?: unknown[]; models?: unknown[] })
        ?.records ||
      (payload as { records?: unknown[]; data?: unknown[]; models?: unknown[] })?.data ||
      (payload as { records?: unknown[]; data?: unknown[]; models?: unknown[] })?.models ||
      []
  return (records as Record<string, unknown>[]).map((item) => mapModelRegistryItem(item))
}

export const getModelRegistryById = async (id: string, signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl(`/api/v1/dashboard-review/model-registry/${id}`),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  const payload = await handleResponse<Record<string, unknown>>(response)
  const record =
    (payload.record as Record<string, unknown>) ||
    (payload.data as Record<string, unknown>) ||
    payload
  return mapModelRegistryItem(record)
}

export const getDashboardInsights = async (signal?: AbortSignal) => {
  const response = await fetch(buildUrl("/api/v1/dashboard-review/insights"), {
    headers: buildAuthHeaders(),
    signal,
  })
  return handleResponse<DashboardInsights>(response)
}

export const getRetrainingCoverageInsights = async (signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/insights/retraining-coverage"),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  return handleResponse<RetrainingCoverageInsight>(response)
}

export const getDatasetReadinessInsights = async (signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/insights/dataset-readiness"),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  return handleResponse<DatasetReadinessInsight>(response)
}

export const getRecentActivityInsights = async (signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/insights/recent-activity"),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  return handleResponse<RecentActivityInsight>(response)
}

export const getLabelCoverageInsights = async (signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/insights/label-coverage"),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  return handleResponse<LabelCoverageInsight>(response)
}

export const getRedeploymentStatusInsights = async (signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/insights/redeployment-status"),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  return handleResponse<RedeploymentStatusInsight>(response)
}

export const getCurrentDeployedModelInsights = async (signal?: AbortSignal) => {
  const response = await fetch(
    buildUrl("/api/v1/dashboard-review/insights/current-deployed-model"),
    {
      headers: buildAuthHeaders(),
      signal,
    }
  )
  const payload = await handleResponse<CurrentDeployedModelInsight>(response)
  return mapCurrentDeployedModel(payload)
}
