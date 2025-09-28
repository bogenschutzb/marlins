import { safeNumber } from './mlb';

export const TEAM_PARAM_STRING = 'teamId=146&teamId=385&teamId=467&teamId=564&teamId=554&teamId=619&teamId=3276&teamId=4124&teamId=3277&teamId=479&teamId=2127';
export const SPORT_PARAM_STRING = 'sportId=1&sportId=21&sportId=16&sportId=11&sportId=13&sportId=12&sportId=14';
export const SCHEDULE_BASE = 'https://statsapi.mlb.com/api/v1/schedule';
export const API_BASE = 'https://statsapi.mlb.com';

export function buildScheduleUrl(date: string) {
  const params = `${TEAM_PARAM_STRING}&${SPORT_PARAM_STRING}&date=${encodeURIComponent(date)}`;
  return `${SCHEDULE_BASE}?${params}`;
}

export interface ApiScheduleResponse {
  copyright?: string;
  totalItems?: number;
  totalGames?: number;
  dates?: ApiDate[];
}

export interface ApiDate {
  date: string; // YYYY-MM-DD
  totalItems?: number;
  totalGames?: number;
  totalGamesInProgress?: number;
  games?: ApiGame[];
  events?: unknown[];
}

export interface ApiGame {
  gamePk: number;
  gameGuid?: string;
  link?: string;
  gameType?: string;
  season?: string;
  gameDate?: string; // ISO date-time
  officialDate?: string;
  status?: ApiStatus;
  teams?: {
    away?: ApiTeamInfo;
    home?: ApiTeamInfo;
  };
  venue?: { id?: number; name?: string; link?: string };
  content?: { link?: string };
  gameNumber?: number;
  publicFacing?: boolean;
  doubleHeader?: string;
  gamedayType?: string;
  calendarEventID?: string;
  seasonDisplay?: string;
  dayNight?: string;
  description?: string;
  scheduledInnings?: number;
  seriesDescription?: string;
}

export interface ApiStatus {
  abstractGameState?: string;
  codedGameState?: string;
  detailedState?: string;
  statusCode?: string;
  startTimeTBD?: boolean;
  abstractGameCode?: string;
}

export interface ApiTeamInfo {
  leagueRecord?: { wins?: number; losses?: number; pct?: string };
  score?: number;
  team?: { id?: number; name?: string; link?: string };
  splitSquad?: boolean;
  seriesNumber?: number;
}

export interface TeamSummary {
  id?: number;
  name?: string;
  score?: number | null;
  leagueRecord?: { wins?: number; losses?: number; pct?: string };
  splitSquad?: boolean;
  parentOrg?: { id?: number; name?: string; link?: string; abbr?: string } | undefined;
}

export interface GameSummary {
  id: number; // gamePk
  gameGuid?: string;
  link?: string;
  date: Date;
  officialDate?: string;
  gameType?: string;
  season?: string;
  status: {
    abstractGameState?: string;
    detailedState?: string;
    codedGameState?: string;
    isLive: boolean;
  };
  home: TeamSummary;
  away: TeamSummary;
  venueName?: string;
  description?: string;
  scheduledInnings?: number;
  seriesDescription?: string;
  isPublic?: boolean;
  isMiamiBaseballHome?: boolean;
}

export async function mapScheduleToGameSummaries(api: ApiScheduleResponse): Promise<GameSummary[]> {
  if (!api?.dates?.length) return [];

  const games: GameSummary[] = [];

  // collect unique team ids to fetch parentOrg once per team
  const teamIds = new Set<number>();
  for (const d of api.dates || []) {
    for (const g of d.games || []) {
      const homeId = g.teams?.home?.team?.id;
      const awayId = g.teams?.away?.team?.id;
      if (typeof homeId === 'number') teamIds.add(homeId);
      if (typeof awayId === 'number') teamIds.add(awayId);
    }
  }

  const teamParentMap: Record<number, { id?: number; name?: string; link?: string; abbr?: string } | undefined> = {};

  // fetch team details in parallel and attempt to resolve parentOrg abbreviation
  await Promise.allSettled(Array.from(teamIds).map(async (tid) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/teams/${tid}`);
      if (!res.ok) return;
      const payload = await res.json();
      const teamObj = Array.isArray(payload?.teams) ? payload.teams[0] : payload?.teams;
      
      // canonicalize basic parent info
      const parentId = teamObj?.parentOrgId ?? teamObj?.parentOrg?.id;
      const parentName = teamObj?.parentOrgName ?? teamObj?.parentOrg?.name;
      const parentLink = teamObj?.parentOrgId ? `${API_BASE}/api/v1/teams/${teamObj?.parentOrgId}` : undefined;

      const entry: { id?: number; name?: string; link?: string; abbr?: string } = {
        id: parentId,
        name: parentName,
        link: parentLink,
      };     

      //If there is a parent link, try to fetch it and extract a likely abbreviation
      try {        
        if (parentLink) {                  
          const pres = await fetch(parentLink);
          if (pres.ok) {
            const parentPayload = await pres.json();
            const parentObj = Array.isArray(parentPayload?.teams) ? parentPayload.teams[0] : parentPayload?.teams;
            
            const abbr = parentObj?.abbreviation;
            if (abbr && typeof abbr === 'string') entry.abbr = abbr;          
          }
        }      
      } catch (err) {
        // ignore parent org fetch errors
      }

      teamParentMap[tid] = entry;
    } catch (err) {
      // ignore fetch errors and continue without parentOrg for this team
      return;
    }
  }));

  for (const d of api.dates || []) {
    const dateStr = d.date;
    if (!d.games?.length) continue;

    for (const g of d.games) {
      try {
        const id = g.gamePk;
        if (typeof id !== 'number') continue;

        const gameDate = g.gameDate ? new Date(g.gameDate) : (dateStr ? new Date(dateStr) : new Date(NaN));

        const homeApi = g.teams?.home;
        const awayApi = g.teams?.away;

        const homeId = homeApi?.team?.id;
        const awayId = awayApi?.team?.id;

        const home: TeamSummary = {
          id: homeId,
          name: homeApi?.team?.name,
          score: safeNumber(homeApi?.score) ?? null,
          leagueRecord: homeApi?.leagueRecord,
          splitSquad: !!homeApi?.splitSquad,
          parentOrg: typeof homeId === 'number' ? teamParentMap[homeId] : undefined,
        };

        const away: TeamSummary = {
          id: awayId,
          name: awayApi?.team?.name,
          score: safeNumber(awayApi?.score) ?? null,
          leagueRecord: awayApi?.leagueRecord,
          splitSquad: !!awayApi?.splitSquad,
          parentOrg: typeof awayId === 'number' ? teamParentMap[awayId] : undefined,
        };

        const status = {
          abstractGameState: g.status?.abstractGameState,
          detailedState: g.status?.detailedState,
          codedGameState: g.status?.codedGameState,
          isLive:
            String(g.status?.abstractGameState || '').toLowerCase() === 'live' ||
            String(g.status?.detailedState || '').toLowerCase().includes('progress') ||
            String(g.status?.codedGameState || '').toUpperCase() === 'I',
        };

        games.push({
          id,
          gameGuid: g.gameGuid,
          link: g.link,
          date: gameDate,
          officialDate: g.officialDate,
          gameType: g.gameType,
          season: g.season,
          status,
          home,
          away,
          venueName: g.venue?.name,
          description: g.description,
          scheduledInnings: safeNumber(g.scheduledInnings),
          seriesDescription: g.seriesDescription,
          isPublic: !!g.publicFacing,
          isMiamiBaseballHome: home?.parentOrg?.abbr === 'MIA' || homeId === 146 ? true : false,
        }); 
      } catch (err) {
        // skip malformed game
        // console.warn('Failed to map game', g?.gamePk, err);
        continue;
      }
    }
  }

  return games;
}


