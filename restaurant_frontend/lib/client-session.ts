const SESSION_KEY = "restaurant_client_session";

export interface ClientSession {
  restaurantId: string;
  tableId: string;
  tableNumero: number;
  occupationId: string;
  nombreDePlaces: number;
}

export function getClientSession(): ClientSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<ClientSession>;
    if (!session.restaurantId || !session.tableId || !session.occupationId) {
      return null;
    }
    return session as ClientSession;
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
