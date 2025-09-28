import { PlayerSummary, buildPlayersMap, findPlayerById, TeamDetails } from './mlb';

export interface ApiLiveFeedResponse {
  gameData?: any;
  liveData?: any;
}

export interface GameNotStartedDetails {  
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
  probablePitchers?: { home?: PlayerSummary; away?: PlayerSummary };

  //Raw feed for reference/debugging
  //raw?: ApiLiveFeedResponse;
}


export function mapLiveFeedToGameDetails(feed: ApiLiveFeedResponse): GameNotStartedDetails {
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

    const probableRaw = gameData?.probablePitchers ?? liveData?.probablePitchers ?? {};
    const probable = {
        home: findPlayerById(players, probableRaw?.home?.id) ?? undefined,
        away: findPlayerById(players, probableRaw?.away?.id) ?? undefined,
    };

    return {
        venue,       
        players,
        gameDateTime,    
        homeTeamSummary,
        awayTeamSummary,     
        probablePitchers: probable,
        //raw: feed,
    };
}