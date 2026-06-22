const REQUEST_TIMEOUT_MS = 20_000;

function isLocalhostUrl(url: string): boolean {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url);
}

function resolveApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

  if (typeof window !== "undefined") {
    const onRemoteHost =
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1";

    // Sur mobile (IP locale), ignorer un NEXT_PUBLIC_API_URL pointant vers localhost
    if (envUrl && !(onRemoteHost && isLocalhostUrl(envUrl))) {
      return envUrl;
    }
    return "/api";
  }

  return envUrl ?? backendUrl;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${resolveApiUrl()}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail ?? detail;
      } catch {
        // ignore
      }
      throw new ApiError(String(detail), res.status);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "Délai dépassé. Vérifiez que le backend tourne sur le Mac.",
        0,
      );
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "Connexion impossible. Vérifiez le Wi‑Fi et que les serveurs tournent.",
      0,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError, resolveApiUrl as getApiUrl };
