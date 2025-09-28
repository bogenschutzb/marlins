export interface PlayerSummary {
  id?: number;
  fullName?: string;
  link?: string;
  primaryPosition?: { abbreviation?: string; type?: string; code?: string } | null;
}

export interface TeamDetails {
  id?: number;
  abbreviation?: string;
  name?: string;
  teamName?: string;
}

export function safeNumber(n: unknown): number | undefined {
  if (typeof n === 'number') return n;
  if (typeof n === 'string' && n.trim() !== '') {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function buildPlayersMap(rawPlayers: any): Record<string, PlayerSummary> {
  const map: Record<string, PlayerSummary> = {};
  if (!rawPlayers || typeof rawPlayers !== 'object') return map;

  for (const key of Object.keys(rawPlayers)) {
    const p = rawPlayers[key];
    // MLB feed often has player keyed by 'IDxxxx' or numeric keys with a person object
    const person = p?.person ?? p;
    const id = person?.id ?? (p?.id ?? undefined);
    map[String(id)] = {
      id,
      fullName: person?.fullName ?? p?.fullName,
      link: person?.link ?? p?.link,
      primaryPosition: p?.position ?? person?.primaryPosition ?? null,
    };
  }

  return map;
}

export function findPlayerById(players: Record<string, PlayerSummary>, id?: number | string) {
  if (id == null) return undefined;
  const byKey = players[String(id)];
  if (byKey) return byKey;
  // fallback: search values
  return Object.values(players).find((p) => p.id === Number(id));
}
