import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Scoreboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('jornada_ranking') || '[]');
    // Sort by score descending
    savedScores.sort((a, b) => b.score - a.score);
    setScores(savedScores);
  }, []);

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-300" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-pixel text-gray-500 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-900/80 p-6 rounded-xl border-4 border-amber-900/50 text-white shadow-2xl">
      <h2 className="text-2xl font-pixel text-center mb-6 text-amber-400">Ranking das Heroínas</h2>
      
      {scores.length === 0 ? (
        <p className="text-center font-pixel text-gray-400 text-sm">Ainda não há heroínas no ranking. Seja a primeira!</p>
      ) : (
        <div className="space-y-4">
          {scores.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border-2 border-gray-700 hover:border-amber-500 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 flex justify-center">
                  {getRankIcon(idx)}
                </div>
                <div>
                  <h3 className="font-pixel text-sm">{entry.playerName || 'Anônima'}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-pixel">Personagem: {entry.characterName}</p>
                </div>
              </div>
              <div className="font-pixel text-amber-400">
                {entry.score} pts
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
