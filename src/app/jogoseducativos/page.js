"use client";

import React, { useState } from 'react';
import CharacterSelection from '@/components/jogoseducativos/CharacterSelection';
import GameDashboard from '@/components/jogoseducativos/GameDashboard';

import PlayerNameInput from '@/components/jogoseducativos/PlayerNameInput';

import PathSelection from '@/components/jogoseducativos/PathSelection';
import { femaleCharacters, maleCharacters } from '@/components/jogoseducativos/GameData';

export default function JogosEducativosPage() {
  const [playerName, setPlayerName] = useState(null);
  const [pathType, setPathType] = useState(null); // 'F' or 'M'
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleRestart = () => {
    setSelectedCharacter(null);
    setPathType(null); // optionally clear path as well
  };

  const getCharacters = () => {
    return pathType === 'F' ? femaleCharacters : maleCharacters;
  };

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-purple-300">
      {!playerName ? (
        <PlayerNameInput onNameSubmit={setPlayerName} />
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
