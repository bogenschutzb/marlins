import { GameLiveDetails } from '../../lib/mlbLive';
import type { GameSummary } from '../../lib/mlbScheduled';
import BaseballDiamond from './BaseballDiamond';

type Props = {
    game: GameSummary;
    details?: GameLiveDetails;
    loading?: boolean;    
};

export default function LiveCard({ game, details, loading}: Props) {       
    return (
        <div>
            { loading ? (
                <div className="text-sm text-muted-foreground">Loading data...</div>         
            ) : !loading && game && details ? (
                <div className="flex items-start justify-between">
                    {/* Miami Team & Winning Pitcher & Saving Pitcher */}
                    <div className="flex-1 mr-2">
                        <div className="flex items-start gap-2">
                            <h3 className="text-2xl md:text-2xl font-normal">
                                { game.isMiamiBaseballHome ? `${details.homeTeamSummary?.teamName} ${game.home.parentOrg?.abbr ? game.home.parentOrg?.abbr === 'MIA' ? '' : `(${game.home.parentOrg?.abbr})`  : ''}` : 
                                    `${details.awayTeamSummary?.teamName} ${game.away.parentOrg?.abbr ? game.away.parentOrg?.abbr === 'MIA' ? '' : `(${game.away.parentOrg?.abbr})`  : ''}`
                                }                                    
                            </h3> 
                            <h3 className="text-2xl md:text-2xl font-semibold"> 
                                { game.isMiamiBaseballHome ? `${details?.currentScore?.home ?? ''}` : 
                                    `${details?.currentScore?.away ?? ''}`
                                }      
                            </h3>                                                                        
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{details.batter ? `At Bat: ${details.batter.fullName}` : ''}</span>                                                                         
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">                        
                            <span>{details.batterUpNext ? `Batter Up Next: ${details.batterUpNext.fullName}` : ''}</span>                                                  
                        </div>
                    </div>                  
                    {/* Competing Team & Losing Pitcher */}
                    <div className="flex-1 mr-2">
                        <div className="flex items-start gap-2">
                            <h3 className="text-2xl md:text-2xl font-normal">                                
                                { game.isMiamiBaseballHome ? `vs ${details.awayTeamSummary?.abbreviation} ${details.awayTeamSummary?.teamName} ${game.away.parentOrg?.abbr ? game.away.parentOrg?.abbr === 'MIA' ? '' : `(${game.away.parentOrg?.abbr})`  : ''}` : 
                                    `@ ${details.homeTeamSummary?.abbreviation} ${details.homeTeamSummary?.teamName} ${game.home.parentOrg?.abbr ? game.home.parentOrg?.abbr === 'MIA' ? '' : `(${game.home.parentOrg?.abbr})`  : ''}`
                                }    
                            </h3>   
                            <h3 className="text-2xl md:text-2xl font-semibold"> 
                                { game.isMiamiBaseballHome ? `${details?.currentScore?.away ?? ''}` : 
                                    `${details?.currentScore?.home ?? ''}`
                                }                                        
                            </h3>                                                                  
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{details.pitcher ? `Pitcher: ${details.pitcher.fullName}` : ''}</span>                                                  
                        </div>                        
                    </div>     
                    {/* Inning & Outs & Bases & Location*/}
                    <div className="flex-1 items-center justify-end gap-2">
                        <div className="inline gap-2 text-sm text-muted-foreground min-w-[200px]">                           
                            <div className='flex flex-row items-center justify-end gap-2 space-x-4 mb-2'>                                    
                                <span className="flex-1 text-sm text-muted-foreground">
                                    {details.innings ? `${details.innings.inningState ?? ''} ${details.innings.current ?? '' }` : ''} 
                                </span>     
                                <span className="flex-1 text-sm text-muted-foreground">
                                    {details.outs ? details.outs === 1 ? `${details.outs} out` : `${details.outs} outs` : '0 outs'}
                                </span>   
                                <div className="flex-none">                                             
                                    {details?.baseRunners && (
                                        <BaseballDiamond baseRunners={details.baseRunners} />
                                    )}
                                </div>
                            </div>     
                            <div className="flex flex-col items-end text-sm text-muted-foreground">    
                                { details?.venue && details.venue.country && details.venue.country !== 'USA' ? (
                                    <span  className='text-right'> {details?.venue ? details.venue.name : '' }{ details?.venue?.country ? `, ${details.venue.country}` : ''} </span>
                                ) : (
                                    <span  className='text-right'> {details?.venue ? details.venue.name : '' }{ details?.venue?.city ? `, ${details.venue.city}` : ''}{ details?.venue?.state ? `, ${details.venue.state}` : ''}</span> 
                                )}     
                            </div>
                        </div>
                    </div>                    
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">No data available.</div>
            )}           
        </div>
    );
}