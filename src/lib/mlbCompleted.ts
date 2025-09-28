import { safeNumber, PlayerSummary, buildPlayersMap, findPlayerById, TeamDetails } from './mlb';

export interface ApiLiveFeedResponse {
  gameData?: any;
  liveData?: any;
}

export interface GameCompletedDetails {
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

  finalScore?: { home?: number | null; away?: number | null };
  winningPitcher?: PlayerSummary | null;
  losingPitcher?: PlayerSummary | null;
  savePitcher?: PlayerSummary | null;
  
  //Raw feed for reference/debugging
  //raw?: ApiLiveFeedResponse;
}

export function mapLiveFeedToGameDetails(feed: ApiLiveFeedResponse): GameCompletedDetails {
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

      const finalScore = {
          home: safeNumber(liveData?.linescore?.teams?.home?.runs) ?? safeNumber(gameData?.linescore?.teams?.home?.runs) ?? undefined,
          away: safeNumber(liveData?.linescore?.teams?.away?.runs) ?? safeNumber(gameData?.linescore?.teams?.away?.runs) ?? undefined,
      };

      const decisions = liveData?.decisions ?? gameData?.decisions ?? {};
      const winningPitcher = decisions?.winner ? findPlayerById(players, decisions.winner?.id) ?? { id: decisions.winner?.id, fullName: decisions.winner?.fullName } : null;
      const losingPitcher = decisions?.loser ? findPlayerById(players, decisions.loser?.id) ?? { id: decisions.loser?.id, fullName: decisions.loser?.fullName } : null;
      const savePitcher = decisions?.save ? findPlayerById(players, decisions.save?.id) ?? { id: decisions.save?.id, fullName: decisions.save?.fullName } : null;

      return {
          venue,
          players,
          gameDateTime, 
          homeTeamSummary,
          awayTeamSummary,
          finalScore,
          winningPitcher,
          losingPitcher,
          savePitcher,
          //raw: feed,
      };
}