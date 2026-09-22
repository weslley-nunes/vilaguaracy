"use client";

import React, { useState } from 'react';
import CharacterSelection from '@/components/jogoseducativos/CharacterSelection';
import GameDashboard from '@/components/jogoseducativos/GameDashboard';

import PlayerNameInput from '@/components/jogoseducativos/PlayerNameInput';

export default function JogosEducativosPage() {
  const [playerName, setPlayerName] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleRestart = () => {
    setSelectedCharacter(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-purple-300">
      {!playerName ? (
        <PlayerNameInput onNameSubmit={setPlayerName} />
      ) : !selectedCharacter ? (
        <CharacterSelection onSelect={setSelectedCharacter} />
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
