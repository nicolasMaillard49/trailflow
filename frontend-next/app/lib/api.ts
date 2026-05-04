export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ApiInit<T> = RequestInit & {
  token?: string;
  /**
   * Validateur runtime pour la réponse JSON. Si fourni, le résultat passe
   * obligatoirement par `parse` — n'importe quelle réponse mal formée throw,
   * ce qui évite que le front rende avec des champs `undefined` sur lesquels
   * il appelle ensuite `.toFixed()`. Recommandé pour tout ce qui touche au
   * paiement et aux commandes.
   */
  parse?: (raw: unknown) => T;
};

export async function api<T = unknown>(
  path: string,
  init?: ApiInit<T>
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };
  if (init?.token) (headers as Record<string, string>).Authorization = `Bearer ${init.token}`;

  const res = await fetch(`${API_URL}/api${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} on ${path}: ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as unknown;
  if (init?.parse) return init.parse(json);
  // Sans parser, on garde l'ancien comportement : cast aveugle. À utiliser
  // uniquement pour des endpoints non-critiques (admin, listings).
  return json as T;
}
