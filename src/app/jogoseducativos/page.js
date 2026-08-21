"use client";

import React, { useState } from 'react';
import CharacterSelection from '@/components/jogoseducativos/CharacterSelection';
import GameDashboard from '@/components/jogoseducativos/GameDashboard';

export default function JogosEducativosPage() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const handleRestart = () => {
    setSelectedCharacter(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-purple-300">
      {!selectedCharacter ? (
        <CharacterSelection onSelect={setSelectedCharacter} />
      ) : (
        <GameDashboard selectedCharacter={selectedCharacter} onBackToSelection={handleRestart} />
      )}
    </main>
  );
}
