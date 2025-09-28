import { safeNumber, PlayerSummary, buildPlayersMap, findPlayerById, TeamDetails } from './mlb';

export interface ApiLiveFeedResponse {
  gameData?: any;
  liveData?: any;
}

export interface GameLiveDetails {
  venue?: { id?: number; name?: string; link?: string; city?: string; state?: string; country?: string };
  players?: Record<string, PlayerSummary>;
  gameDateTime: {
    originalDate?: string;
    officialDate?: string;
    dayNight?: string;
    time?: string;
    ampm?: string;
  };
  homeTeamSummary?: TeamDetails;
  awayTeamSummary?: TeamDetails;
  currentScore?: { home?: number | null; away?: number | null };
  innings?: { current?: number; ordinal?: string; isTop?: boolean; inningState?: string; } | null;
  outs?: number | null;
  balls?: number | null;
  strikes?: number | null;  
  baseRunners?: { first?: PlayerSummary | null; second?: PlayerSummary | null; third?: PlayerSummary | null } | null;
  pitcher?: PlayerSummary | null;
  batter?: PlayerSummary | null;
  batterUpNext?: PlayerSummary | null;

  //Raw feed for reference/debugging
  //raw?: ApiLiveFeedResponse;
}

export function mapLiveFeedToGameDetails(feed: ApiLiveFeedResponse): GameLiveDetails {
    const gameData = feed?.gameData ?? {};
    const liveData = feed?.liveData ?? {};

    const players = buildPlayersMap(gameData?.players ?? liveData?.boxscore?.players ?? {});

    const venueRaw = gameData?.venue || undefined; 
    const venue = venueRaw
        ? {
            id: venueRaw?.id,
            name: venueRaw?.name,
            link: venueRaw?.link,
            city: venueRaw?.location?.city,
            state: venueRaw?.location?.stateAbbrev,
            country: venueRaw?.location?.country,
        }
        : undefined;

    const gameDateTime = {
        originalDate: gameData?.datetime?.originalDate,
        officialDate: gameData?.datetime?.officialDate,
        dayNight: gameData?.datetime?.dayNight,
        time: gameData?.datetime?.time,
        ampm: gameData?.datetime?.ampm,
    }

    const homeTeamSummary = {
        id: gameData?.teams?.home?.id,
        abbreviation: gameData?.teams?.home?.abbreviation,
        name: gameData?.teams?.home?.name,
        teamName: gameData?.teams?.home?.teamName,        
    };

    const awayTeamSummary = { 
        id: gameData?.teams?.away?.id,
        abbreviation: gameData?.teams?.away?.abbreviation,
        name: gameData?.teams?.away?.name,
        teamName: gameData?.teams?.away?.teamName,
    };

    const currentScore = {
        home: safeNumber(liveData?.linescore?.teams?.home?.runs) ?? safeNumber(gameData?.linescore?.teams?.home?.runs) ?? undefined,
        away: safeNumber(liveData?.linescore?.teams?.away?.runs) ?? safeNumber(gameData?.linescore?.teams?.away?.runs) ?? undefined,
    };
    
    const innings = liveData?.linescore
        ? {
            current: safeNumber(liveData.linescore.currentInning) ?? undefined,
            ordinal: liveData.linescore.currentInningOrdinal ?? liveData.linescore.inningState ?? undefined,
            isTop: !!liveData.linescore.isTopInning || (String(liveData.linescore.inningHalf || '').toLowerCase() === 'top'),
            inningState: liveData.linescore.inningState ?? '',
        }
        : undefined;            

    const count = liveData?.plays?.currentPlay?.count ?? liveData?.plays?.currentPlay?.details?.count ?? {};
    const balls = safeNumber(count?.balls) ?? null;
    const strikes = safeNumber(count?.strikes) ?? null;
    const outs = safeNumber(count?.outs) ?? null;

    // batter / pitcher / batterUpNext from currentPlay.matchup
    const matchup = liveData?.plays?.currentPlay?.matchup ?? liveData?.plays?.currentPlay?.matchup;

    // Base Runner Array
    const baseRunners: { first?: PlayerSummary | null; second?: PlayerSummary | null; third?: PlayerSummary | null } = {};

    // Base Runners
    if (matchup) {
        const post1 = (matchup as any)?.postOnFirst?.id ?? (matchup as any)?.postOnFirst ?? undefined;
        const post2 = (matchup as any)?.postOnSecond?.id ?? (matchup as any)?.postOnSecond ?? undefined;
        const post3 = (matchup as any)?.postOnThird?.id ?? (matchup as any)?.postOnThird ?? undefined;

        if (post1) baseRunners.first = findPlayerById(players, post1) ?? { id: Number(post1), fullName: undefined };
        if (post2) baseRunners.second = findPlayerById(players, post2) ?? { id: Number(post2), fullName: undefined };
        if (post3) baseRunners.third = findPlayerById(players, post3) ?? { id: Number(post3), fullName: undefined };
    }


    const batter = (matchup as any)?.batter ? findPlayerById(players, (matchup as any).batter?.id) ?? { id: (matchup as any).batter?.id, fullName: (matchup as any).batter?.fullName } : undefined;
    const pitcher = (matchup as any)?.pitcher ? findPlayerById(players, (matchup as any).pitcher?.id) ?? { id: (matchup as any).pitcher?.id, fullName: (matchup as any).pitcher?.fullName } : undefined;

    // Derive from team's batting order
    let batterUpNext: PlayerSummary | null = null;

    try {    
      const isTop = !!liveData?.plays?.currentPlay?.about?.isTopInning || !!liveData?.linescore?.isTopInning;
      const battingSideKey = isTop ? 'away' : 'home';
    
      const battingIds: Array<number | string> = liveData?.boxscore?.teams?.[battingSideKey]?.battingOrder;

      if (battingIds && battingIds.length > 0) {
        const currentId = (matchup as any)?.batter?.id ?? (matchup as any)?.batter;
        const idx = battingIds.findIndex((b: any) => String(b) === String(currentId));
        const nextIdx = idx >= 0 ? (idx + 1) % battingIds.length : 0;
        const nextId = battingIds[nextIdx];
        if (nextId != null) batterUpNext = findPlayerById(players, nextId) ?? { id: Number(nextId), fullName: undefined };
      }
    } catch (e) {
        // ignore and continue to fallback
    }

    return {
        venue,
        players,
        gameDateTime,         
        homeTeamSummary,
        awayTeamSummary,
        currentScore,
        innings,
        outs,
        balls,
        strikes,
        baseRunners,
        batter: batter ?? null,
        pitcher: pitcher ?? null,
        batterUpNext,
        //raw: feed,
    };
}