const SESSION_KEY = "restaurant_client_session";

export interface ClientSession {
  restaurantId: string;
  tableId: string;
  tableNumero: number;
}

export function getClientSession(): ClientSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as ClientSession) : null;
  } catch {
    return null;
  }
}

export function setClientSession(session: ClientSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearClientSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionForRestaurant(
  restaurantId: string,
): ClientSession | null {
  const session = getClientSession();
  if (!session || session.restaurantId !== restaurantId) return null;
  return session;
}
