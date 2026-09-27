import { ProblemDetail } from "./types";

export class ApiError extends Error {
  status: number;
  title: string;
  detail: string;
  problem?: ProblemDetail;

  constructor(status: number, title: string, detail: string, problem?: ProblemDetail) {
    super(detail || title || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.problem = problem;
  }
}

/**
 * Extracts human-readable message from an API response according to RFC 7807.
 * Always prefers the backend's explicit 'detail' field.
 */
export async function extractApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json") || contentType.includes("application/problem+json")) {
    try {
      const data = (await response.json()) as ProblemDetail;
      const title = data.title || response.statusText || "Error";
      const detail = data.detail || (data as Record<string, string>).message || title;
      return new ApiError(status, title, detail, data);
    } catch {
      // Fall through to text parsing
    }
  }

  try {
    const text = await response.text();
    if (text) {
      return new ApiError(status, response.statusText || "Error", text);
    }
  } catch {
    // Ignore text parse error
  }

  return new ApiError(
    status,
    response.statusText || "Network Error",
    status === 404
      ? "The requested resource was not found."
      : status === 403
      ? "You do not have permission to perform this action."
      : status === 401
      ? "Your session has expired. Please log in again."
      : status >= 500
      ? "The server encountered a temporary issue. Please try again."
      : `Request failed with status ${status}.`
  );
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.detail;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred. Please try again.";
}
