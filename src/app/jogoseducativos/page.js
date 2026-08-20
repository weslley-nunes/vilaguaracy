"use client";

import React, { useState } from 'react';
import CharacterSelection from '@/components/jogoseducativos/CharacterSelection';
import BattleArena from '@/components/jogoseducativos/BattleArena';

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
        <BattleArena character={selectedCharacter} onRestart={handleRestart} />
      )}
    </main>
  );
}
