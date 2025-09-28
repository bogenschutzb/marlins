import { useQuery } from '@tanstack/react-query';
import { mapLiveFeedToGameDetails, ApiLiveFeedResponse, GameLiveDetails } from '../lib/mlbLive';

export function buildLiveFeedUrl(gamePk: number | string) {
  return `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
}

export function useGameLive(gamePk?: number | string) {
  return useQuery<GameLiveDetails, Error>({
    queryKey: ['gameLive', gamePk],
    enabled: !!gamePk,
    queryFn: async () => {
      const url = buildLiveFeedUrl(gamePk as number | string);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch live feed: ${res.status} ${res.statusText}`);
      const json: ApiLiveFeedResponse = await res.json();
      return mapLiveFeedToGameDetails(json);
    },
    staleTime: 15_000,
    refetchInterval: 10_000, //Refresh every 10 seconds while game is live.
  });
}
