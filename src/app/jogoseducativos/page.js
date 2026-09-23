"use client";

import React, { useState } from 'react';
import CharacterSelection from '@/components/jogoseducativos/CharacterSelection';
import GameDashboard from '@/components/jogoseducativos/GameDashboard';
import PlayerNameInput from '@/components/jogoseducativos/PlayerNameInput';
import PathSelection from '@/components/jogoseducativos/PathSelection';
import Scoreboard from '@/components/jogoseducativos/Scoreboard';
import { femaleCharacters, maleCharacters } from '@/components/jogoseducativos/GameData';

export default function JogosEducativosPage() {
  const [playerName, setPlayerName] = useState(null);
  const [pathType, setPathType] = useState(null); // 'F' or 'M'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showLiveRanking, setShowLiveRanking] = useState(false);

  const handleRestart = () => {
    setSelectedCharacter(null);
    setPathType(null); // optionally clear path as well
  };

  const getCharacters = () => {
    return pathType === 'F' ? femaleCharacters : maleCharacters;
  };

  if (showLiveRanking) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-4 selection:bg-purple-300">
        <button 
          onClick={() => setShowLiveRanking(false)}
          className="mb-8 font-pixel text-amber-500 hover:text-amber-400 underline decoration-dashed"
        >
          {'< VOLTAR AO INÍCIO'}
        </button>
        <Scoreboard />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-purple-300">
      {!playerName ? (
        <PlayerNameInput 
          onNameSubmit={setPlayerName} 
          onShowRanking={() => setShowLiveRanking(true)}
        />
      ) : !pathType ? (
        <PathSelection onSelectPath={setPathType} />
      ) : !selectedCharacter ? (
        <CharacterSelection 
          characters={getCharacters()} 
          pathType={pathType} 
          onSelect={setSelectedCharacter} 
        />
      ) : (
        <GameDashboard 
          playerName={playerName} 
          selectedCharacter={selectedCharacter} 
          onBackToSelection={handleRestart} 
        />
      )}
    </main>
  );
}
