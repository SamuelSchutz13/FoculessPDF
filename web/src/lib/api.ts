import axios, { AxiosError } from 'axios'
import { i18n } from '@/i18n'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
})

/** Must match the API's MAX_FILE_SIZE_MB; checked here to skip uploads that would be rejected. */
export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? 50)

const { t } = i18n.global

export interface ToolResult {
  blob: Blob
  filename: string
}

/** Error with the API's message list, ready to show to the user. */
export class ApiError extends Error {
  readonly messages: string[]

  constructor(messages: string[]) {
    super(messages.join('\n'))
    this.messages = messages
  }
}

/** Uploads the form to a tool endpoint and returns the processed file. */
export async function runTool(
  endpoint: string,
  form: FormData,
  onProgress?: (percent: number) => void,
): Promise<ToolResult> {
  try {
    const response = await api.post<Blob>(endpoint, form, {
      responseType: 'blob',
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress?.(Math.round((loaded / total) * 100))
      },
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition']) ?? 'resultado',
    }
  } catch (error) {
    throw new ApiError(await errorMessages(error))
  }
}

export function filenameFrom(contentDisposition?: string): string | undefined {
  return /filename="([^"]+)"/.exec(contentDisposition ?? '')?.[1]
}

export async function errorMessages(error: unknown): Promise<string[]> {
  if (!(error instanceof AxiosError)) return [t('api.unexpected')]
  if (!error.response) return [t('api.unreachable')]

  // With responseType "blob", error bodies arrive as a Blob too, so the JSON is read back.
  const data: unknown = error.response.data
  try {
    const body = JSON.parse(data instanceof Blob ? await data.text() : JSON.stringify(data))
    if (Array.isArray(body?.message)) return body.message
  } catch {
    // Not JSON (e.g. a proxy error page): fall through to the generic message.
  }
  return [t('api.status', { status: error.response.status })]
}
