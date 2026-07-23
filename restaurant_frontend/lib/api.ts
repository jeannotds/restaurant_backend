import type {
  AuthUserChangeRestaurant,
  AuthUserCreate,
  AuthUserLogin,
  AuthUserResponse,
  ImageReplacement,
  ProduitImage,
  TableEndOccupationResponse,
  TableJoinRequest,
  TableJoinResponse,
} from "@/lib/types";

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
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      let detail: unknown = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail ?? detail;
      } catch {
        // ignore
      }
      const message = Array.isArray(detail)
        ? detail
            .map((item) =>
              typeof item === "object" && item && "msg" in item
                ? String((item as { msg: string }).msg)
                : String(item),
            )
            .join(" · ")
        : String(detail);
      throw new ApiError(message, res.status);
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
  upload: <T>(path: string, file: File, fieldName = "file") => {
    const formData = new FormData();
    formData.append(fieldName, file);
    return request<T>(path, { method: "POST", body: formData });
  },
  uploadPut: <T>(
    path: string,
    file: File,
    extraFields?: Record<string, string>,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (extraFields) {
      Object.entries(extraFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }
    return request<T>(path, { method: "PUT", body: formData });
  },
};

export async function uploadProduitImages(
  produitId: string,
  files: File[],
): Promise<void> {
  for (const file of files) {
    await api.upload(`/produits/${produitId}/images`, file);
  }
}

export async function replaceProduitImage(
  produitId: string,
  replacement: ImageReplacement,
): Promise<ProduitImage> {
  return api.uploadPut<ProduitImage>(
    `/produits/${produitId}/images/${replacement.imageId}`,
    replacement.file,
    { public_id: replacement.publicId },
  );
}

export async function syncProduitImagesOnUpdate(
  produitId: string,
  options: {
    replacements: ImageReplacement[];
    newFiles: File[];
  },
): Promise<void> {
  for (const replacement of options.replacements) {
    await replaceProduitImage(produitId, replacement);
  }
  if (options.newFiles.length > 0) {
    await uploadProduitImages(produitId, options.newFiles);
  }
}

export async function joinTable(
  tableId: string,
  data: TableJoinRequest,
): Promise<TableJoinResponse> {
  return api.post<TableJoinResponse>(`/tables/${tableId}/join`, data);
}

export async function endOccupation(
  occupationId: string,
): Promise<TableEndOccupationResponse> {
  return api.post<TableEndOccupationResponse>(
    `/tables/occupations/${occupationId}/end`,
    {},
  );
}

export async function signup(
  data: AuthUserCreate,
): Promise<AuthUserResponse> {
  return api.post<AuthUserResponse>("/auth/signup", data);
}

export async function login(
  data: AuthUserLogin,
): Promise<AuthUserResponse> {
  return api.post<AuthUserResponse>("/auth/login", data);
}

export async function changeRestaurant(
  data: AuthUserChangeRestaurant,
): Promise<AuthUserResponse> {
  return api.put<AuthUserResponse>("/auth/change-restaurant", data);
}

export { ApiError, resolveApiUrl as getApiUrl };
