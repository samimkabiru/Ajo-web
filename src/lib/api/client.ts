import { tokenStore } from "./token-store";
import { extractApiError } from "./errors";
import { AuthResponse } from "./types";

interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
  skipAuth?: boolean;
}

// Global in-flight singleton promise for token refresh
let refreshPromise: Promise<AuthResponse | null> | null = null;

/**
 * Maps an API path to the correct Next.js proxy route.
 * Auth routes MUST map to `/auth/*` to match the HttpOnly cookie's Path=/auth scope.
 * All other routes map to `/api-proxy/*`.
 */
export function resolveProxyUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized.startsWith("/auth/")) {
    return normalized;
  }

  if (normalized.startsWith("/actuator/")) {
    return `/api-proxy${normalized}`;
  }

  return `/api-proxy${normalized}`;
}

/**
 * Attempts a token refresh via POST /auth/refresh with credentials: 'include'.
 * Guarantees that only ONE refresh request is ever in-flight at any time (mutex).
 * Returns the AuthResponse ({ accessToken, user }) or null if refresh fails.
 */
export async function refreshAccessToken(): Promise<AuthResponse | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        tokenStore.clearToken();
        return null;
      }

      const data = (await res.json()) as AuthResponse;
      if (data.accessToken) {
        tokenStore.setToken(data.accessToken);
        return data;
      }

      tokenStore.clearToken();
      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      tokenStore.clearToken();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Unified API fetch wrapper with:
 * - Next.js rewrite proxy routing
 * - Automatic Authorization: Bearer <token>
 * - Concurrency-safe single-flight 401 token refresh queue
 * - Idempotency key forwarding
 * - RFC 7807 error extraction
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = resolveProxyUrl(path);
  const headers = new Headers(options.headers || {});

  // Add idempotency key if provided
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  // Content-Type default
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach access token from memory unless skipAuth is requested
  if (!options.skipAuth) {
    const currentToken = tokenStore.getToken();
    if (currentToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    }
  }

  // Always include credentials so cookies can be attached where needed
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized with token refresh and retry
  // (Skip 401 retry if this was an auth call itself, like login or refresh)
  const isAuthCall = path.startsWith("/auth/") && !path.includes("/auth/logout");
  if (response.status === 401 && !options.skipAuth && !isAuthCall) {
    const authData = await refreshAccessToken();

    if (authData?.accessToken) {
      headers.set("Authorization", `Bearer ${authData.accessToken}`);
      const retryRes = await fetch(url, { ...fetchOptions, headers });
      if (!retryRes.ok) {
        throw await extractApiError(retryRes);
      }
      if (retryRes.status === 204) {
        return undefined as T;
      }
      return (await retryRes.json()) as T;
    } else {
      // Refresh failed, session is dead
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ajo:auth-unauthorized"));
      }
      throw await extractApiError(response);
    }
  }

  if (!response.ok) {
    throw await extractApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
