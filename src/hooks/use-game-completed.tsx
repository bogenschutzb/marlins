import { useQuery } from '@tanstack/react-query';
import { mapLiveFeedToGameDetails, ApiLiveFeedResponse, GameCompletedDetails } from '../lib/mlbCompleted';

export function buildLiveFeedUrl(gamePk: number | string) {
  return `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
}

export function useGameCompleted(gamePk?: number | string) {
  return useQuery<GameCompletedDetails, Error>({
    queryKey: ['gameLive', gamePk],
    enabled: !!gamePk,
    queryFn: async () => {
      const url = buildLiveFeedUrl(gamePk as number | string);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch live feed: ${res.status} ${res.statusText}`);
      const json: ApiLiveFeedResponse = await res.json();
      return mapLiveFeedToGameDetails(json);
    },
    staleTime: 305_000,
    refetchInterval: 300_000, //Refresh every 5 minutes, as games are done.
  });
}
