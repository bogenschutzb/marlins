import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Icon, Calendar } from 'lucide-react';
import { baseball } from '@lucide/lab';
import { Input } from './ui/input';
import { useSchedule } from '../hooks/use-schedule';
import type { GameSummary } from '../lib/mlbScheduled';
import { useGameLive } from '../hooks/use-game-live';
import { useGameCompleted } from '../hooks/use-game-completed';
import { useGameNotStarted } from '../hooks/use-game-not-started';
import CompletedCard from './gameui/completedCard';
import LiveCard from './gameui/liveCard';
import NotStartedCard from './gameui/notstartedCard';

const GameStats = () => {
  const offset = new Date().getTimezoneOffset() * 60000;
  const [selectedDate, setSelectedDate] = useState<string>( new Date(Date.now() - offset).toISOString().substring(0, 10));
  const dateRef = React.createRef<HTMLInputElement>();

  const { data: games = [], isLoading, error, isFetching } = useSchedule(selectedDate);
  
  // Child component: renders a single game row and always shows expanded details.
  function GameRow({ game }: { game: GameSummary }) {
    const isLive = !!game?.status?.isLive;    
    const isCompleted = !!game && !isLive && game.status?.codedGameState === 'F' ? true : false;
    const isNotStarted = !!game && !isLive && !isCompleted;

    const liveQuery = useGameLive(isLive ? game.id : undefined);
    const completedQuery = useGameCompleted(isCompleted ? game.id : undefined);
    const notStartedQuery = useGameNotStarted(isNotStarted ? game.id : undefined);

    const details: any = liveQuery.data ?? completedQuery.data ?? notStartedQuery.data;
    const loading = liveQuery.isLoading || completedQuery.isLoading || notStartedQuery.isLoading;

    // Which query produced the data? Use these flags to show state-specific fields.
    const hasLiveData = !!liveQuery.data;
    const hasCompletedData = !!completedQuery.data;
    const hasNotStartedData = !!notStartedQuery.data;

    return (
      <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-smooth">
        { hasLiveData ? (
          <LiveCard game={game} details={details} loading={loading} />
        ) : hasCompletedData ? (
          <CompletedCard game={game} details={details} loading={loading} />
        ) : hasNotStartedData ? (
          <NotStartedCard game={game} details={details} loading={loading} />
        ) : (
            <div className="text-sm text-muted-foreground">No live data available.</div>
        )}      
      </div>
    );
  }

  return (
    <section id="gameStats" className="pt-24 pb-16 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-1 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-center">
                <h1 className="font-bold text-4xl md:text-4xl text-blue-400">Schedule and Results</h1>
              </div>
              <div className="flex justify-center">
                <Input
                  id="selectedDate"
                  ref={dateRef}
                  className="max-w-[150px] text-center invisible w-0"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <span>{new Date(selectedDate).toLocaleDateString('default', {  year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <Calendar
                  className="ml-2 w-6 h-6 text-primary hover:text-blue-600 cursor-pointer"
                  onClick={() => {
                    const el = dateRef.current;
                    if (!el) return;
                    if (typeof el.showPicker === 'function') el.showPicker();
                    else el.focus();
                  }}
                />
              </div>

              <Card className="shadow-card">
                <CardHeader />
                <CardContent>
                  <div className="space-y-4">
                    {isLoading || isFetching ? (
                      <div className="flex items-center justify-center min-h-[200px]">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p>Loading games...</p>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-destructive">Error loading games</div>
                    ) : (
                      <div className="space-y-4">
                        {games.map((g: GameSummary) => (
                          <GameRow key={g.id} game={g} />
                        ))}

                        {games.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Icon iconNode={baseball} className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>NO GAMES</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameStats;
export { GameStats };