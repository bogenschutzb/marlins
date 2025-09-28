import { useQuery } from '@tanstack/react-query';
import { mapLiveFeedToGameDetails, ApiLiveFeedResponse, GameNotStartedDetails } from '../lib/mlbNotStarted';

export function buildLiveFeedUrl(gamePk: number | string) {
  return `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
}

export function useGameNotStarted(gamePk?: number | string) {
  return useQuery<GameNotStartedDetails, Error>({
    queryKey: ['gameLive', gamePk],
    enabled: !!gamePk,
    queryFn: async () => {
      const url = buildLiveFeedUrl(gamePk as number | string);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch live feed: ${res.status} ${res.statusText}`);
      const json: ApiLiveFeedResponse = await res.json();
      return mapLiveFeedToGameDetails(json);
    },
    staleTime: 60_000,
    refetchInterval: 30_000, // Refresh every 30 seconds, while waiting for game to start.
  });
}
