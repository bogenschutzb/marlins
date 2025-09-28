import { GameNotStartedDetails } from '../../lib/mlbNotStarted';
import type { GameSummary } from '../../lib/mlbScheduled';

type Props = {
    game: GameSummary;
    details?: GameNotStartedDetails;
    loading?: boolean;    
};

export default function NotStartedCard({ game, details, loading}: Props) {       
    return (
        <div>
            {loading ? (
                <div className="text-sm text-muted-foreground">Loading data...</div>                   
                ) : !loading && game && details ? (
                    <div className="flex items-center justify-between">
                        {/* Miami Team & Probable Pitcher */}
                        <div className="flex-1 mr-1">
                            <div className="flex items-start gap-4">
                                <h3 className="text-2xl md:text-2xl font-normal">
                                    { game.isMiamiBaseballHome ? `${details.homeTeamSummary?.teamName} ${game.home.parentOrg?.abbr ? game.home.parentOrg?.abbr === 'MIA' ? '' : `(${game.home.parentOrg?.abbr})`  : ''}` : 
                                        `${details.awayTeamSummary?.teamName} ${game.away.parentOrg?.abbr ? game.away.parentOrg?.abbr === 'MIA' ? '' : `(${game.away.parentOrg?.abbr})`  : ''}`
                                }    
                                </h3>                                                                
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                { game.isMiamiBaseballHome ? (                                
                                    <span>{details?.probablePitchers?.home?.fullName ? `PP: ${details?.probablePitchers?.home?.fullName}` : ''}</span>                                                                           
                                ) : (
                                    <span>{details?.probablePitchers?.away?.fullName ? `PP: ${details?.probablePitchers?.away?.fullName}` : ''}</span>                                
                                )}
                            </div>
                        </div>
                        {/* Competing Team & Probable Pitcher */}
                        <div className="flex-1">
                            <div className="flex items-start gap-4">
                                <h3 className="text-2xl md:text-2xl font-normal">
                                    { game.isMiamiBaseballHome ? `vs ${details.awayTeamSummary?.abbreviation} ${details.awayTeamSummary?.teamName} ${game.away.parentOrg?.abbr ? game.away.parentOrg?.abbr === 'MIA' ? '' : `(${game.away.parentOrg?.abbr})`  : ''}` : 
                                        `@ ${details.homeTeamSummary?.abbreviation}  ${details.homeTeamSummary?.teamName} ${game.home.parentOrg?.abbr ? game.home.parentOrg?.abbr === 'MIA' ? '' : `(${game.home.parentOrg?.abbr})`  : ''}`
                                }    
                                </h3>                                                                     
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                { game.isMiamiBaseballHome ? (                                
                                    <span>{details?.probablePitchers?.away?.fullName ? `PP: ${details?.probablePitchers?.away?.fullName}` : ''}</span>
                                ) : (
                                    <span>{details?.probablePitchers?.home?.fullName ? `PP: ${details?.probablePitchers?.home?.fullName}` : ''}</span>                                                                                                     
                                )}                                                                                                           
                            </div>
                        </div>
                        {/* Game Time & Location */}
                        <div className="flex-1 items-center justify-end gap-2">
                            <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                                <span className="text-sm text-muted-foreground text-right">
                                    {game.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>            
                            { details?.venue && details.venue.country && details.venue.country !== 'USA' ? (
                                <span className='text-right'> {details?.venue ? details.venue.name : '' }{ details?.venue?.country ? `, ${details.venue.country}` : ''} </span>
                            ) : (
                                <span className='text-right'> {details?.venue ? details.venue.name : '' }{ details?.venue?.city ? `, ${details.venue.city}` : ''}{ details?.venue?.state ? `, ${details.venue.state}` : ''}</span> 
                            )
                            }
                            </div>
                        </div>
                    </div>
            ) : (
                    <div className="text-sm text-muted-foreground">No data available.</div>
            )}
        </div>
    );
}