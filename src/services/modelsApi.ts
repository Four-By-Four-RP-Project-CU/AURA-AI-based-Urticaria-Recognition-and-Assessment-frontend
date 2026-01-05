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
}

export type RetrainResponse = {
  retrainJobId: string,
  candidateModelVersion: string,
  status: ModelStatus,
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

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

const mapModelMetrics = (source?: Record<string, unknown>): ModelMetrics | undefined => {
  if (!source) return undefined
  const accuracy = toNumber(source.accuracy ?? source.acc)
  const macro_f1 = toNumber(source.macro_f1 ?? source.macroF1)
  const step_accuracy = toNumber(source.step_accuracy ?? source.stepAccuracy)
  if (accuracy === undefined && macro_f1 === undefined && step_accuracy === undefined) {
    return undefined
  }
  return {
    accuracy,
    macro_f1,
    step_accuracy,
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
      toNumber(item.trained_on_cases) ??
      toNumber(item.trainingCases) ??
      toNumber(item.caseCount),
    featureColumns:
      (item.featureColumns as string[]) ||
      (item.features as string[]) ||
      (item.feature_columns as string[]),
    metrics,
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
  return mapModelRegistryItem(payload)
}
