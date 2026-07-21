import type { AuthUserResponse } from "@/lib/types";

const AUTH_KEY = "restaurant_auth_user";

export function getAuthUser(): AuthUserResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
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

export function setAuthUser(user: AuthUserResponse): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_KEY);
}
