import { useQuery } from '@tanstack/react-query';
import { buildScheduleUrl, mapScheduleToGameSummaries, ApiScheduleResponse, GameSummary } from '../lib/mlbScheduled';

export function useSchedule(date: string) {
  const url = buildScheduleUrl(date);  

  return useQuery<GameSummary[], Error>({
    queryKey: ['schedule', date],
    queryFn: async () => {
      const res = await fetch(url);

      if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status} ${res.statusText}`);
      const api: ApiScheduleResponse = await res.json();

      // mapScheduleToGameSummaries is async (fetches team parentOrg info)
      return await mapScheduleToGameSummaries(api);
    },
    staleTime: 60_000,
    refetchInterval: 30_000, // refresh while games are live
  });
}
