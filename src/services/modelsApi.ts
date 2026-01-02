export type ModelStatus = "DEPLOYED" | "READY" | "RETRAINING" | "FAILED" | "ARCHIVED"

export type ModelMetrics = {
  accuracy: number,
  macro_f1: number,
  step_accuracy: number,
}

export type ModelInfo = {
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

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

export const triggerRetrain = async () => {
  const response = await fetch(buildUrl("/api/models/retrain"), {
    method: "POST",
  })
  return handleResponse<RetrainResponse>(response)
}
