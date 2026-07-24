import type { AuthUserResponse } from "@/lib/types";

const AUTH_USER_KEY = "restaurant_auth_user";
const AUTH_TOKEN_KEY = "restaurant_auth_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUserResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as Partial<AuthUserResponse>;
    if (!user.id || !user.nom) return null;
    return user as AuthUserResponse;
  } catch {
    return null;
  }
}

export function getAuthUserForRestaurant(
  restaurantId: string,
): AuthUserResponse | null {
  const user = getAuthUser();
  if (!user || user.restaurant_id !== restaurantId) return null;
  return user;
}

export function setAuthSession(
  user: AuthUserResponse,
  accessToken: string,
): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
}

/** Met à jour l'user sans toucher au token (ex: change-restaurant). */
export function setAuthUser(user: AuthUserResponse): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
