import React from 'react';

export interface TeamStatsCardProps {
  teamName: string;
  teamColor: 'orange' | 'blue';
  playerStats: Array<{
    name: string;
    average: string | number;
    gameAverage: number;
    pointsScored: number;
    isAbsent: boolean;
  }>;
  teamAverage: number;
}

export const TeamStatsCard: React.FC<TeamStatsCardProps> = ({
  teamName,
  teamColor,
  playerStats,
  teamAverage,
}) => {
  const titleColor = teamColor === 'orange' ? 'text-orange-500' : 'text-blue-400';
  const bgColor = teamColor === 'orange' ? 'bg-orange-600' : 'bg-blue-600';

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className={`bowling-title ${titleColor} text-xl mb-4 text-center`}>
        {teamName}
      </div>
      <div className="space-y-2">
        {playerStats.map((player, idx) => (
          <div key={idx} className={`bg-gray-700 rounded p-3 ${player.isAbsent ? 'opacity-60 bg-red-900' : ''}`}>
            <div className="grid grid-cols-4 gap-3 items-center h-14">
              <div className="col-span-2">
                <div className="text-white font-semibold text-lg">{player.name}</div>
              </div>
              {player.isAbsent ? (
                <div className="col-span-2 text-center">
                  <div className="text-red-400 font-bold">ABSENT</div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs font-semibold">3-Game Avg</div>
                    <div className={`font-bold ${parseInt(String(player.average)) <= player.gameAverage ? 'text-green-400' : 'text-red-400'}`}>
                      {player.gameAverage.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 text-xs font-semibold">Points Earned</div>
                    <div className="text-green-400 font-bold">{player.pointsScored}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div className={`${bgColor} rounded p-3 h-14`}>
          <div className="grid grid-cols-4 gap-3 items-center h-full">
            <div className="col-span-2">
              <div className="text-white font-semibold text-lg">TEAM TOTAL</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs font-semibold">Team Average</div>
              <div className="text-white font-bold">{teamAverage.toFixed(1)}</div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
