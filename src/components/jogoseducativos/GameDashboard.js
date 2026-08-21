import React, { useState } from 'react';
import { Map, Trophy, LogOut, User, Volume2, VolumeX } from 'lucide-react';
import TrailMap from './TrailMap';
import Scoreboard from './Scoreboard';
import BattleArena from './BattleArena';
import GameIntro from './GameIntro';
import VictoryScreen from './VictoryScreen';

export default function GameDashboard({ selectedCharacter, onBackToSelection }) {
  const [currentView, setCurrentView] = useState('trail');
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const handleSelectStage = (stageIndex) => {
    if (stageIndex === currentStage) {
      setIsModalOpen(true);
    }
  };

  const handleVictory = (pointsGained) => {
    const newScore = score + pointsGained;
    setScore(newScore);
    setIsModalOpen(false);
    
    const nextStage = currentStage + 1;
    setCurrentStage(nextStage);

    // If all 6 stages are cleared
    if (nextStage >= 6) {
      setGameFinished(true);
      saveScore(newScore);
    }
  };

  const handleDefeat = () => {
    setIsModalOpen(false);
    // On defeat, can retry the stage or lose points. Let's just close modal for now.
    // Real punishment logic can be added later.
  };

  const saveScore = (finalScore) => {
    const savedScores = JSON.parse(localStorage.getItem('jornada_ranking') || '[]');
    savedScores.push({
      playerName: 'Heroína', // Could be dynamic
      characterName: selectedCharacter.name,
      score: finalScore,
      date: new Date().toISOString()
    });
    localStorage.setItem('jornada_ranking', JSON.stringify(savedScores));
  };

  const menuItems = [
    { id: 'trail', label: 'Trilha', icon: Map },
    { id: 'ranking', label: 'Ranking', icon: Trophy }
  ];

  if (showIntro) {
    return <GameIntro selectedCharacter={selectedCharacter} onFinishIntro={() => setShowIntro(false)} />;
  }

  if (gameFinished && currentView !== 'ranking') {
    return <VictoryScreen selectedCharacter={selectedCharacter} score={score} onFinish={() => setCurrentView('ranking')} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex text-white font-pixel selection:bg-amber-500 selection:text-white">
      {/* Background Audio */}
      <audio autoPlay loop muted={isMuted} src="/suspense.mp3" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r-4 border-amber-900/50 p-6 flex flex-col relative">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Profile Card */}
        <div className="bg-gray-700 rounded-xl p-4 mb-8 border-2 border-gray-600 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 mb-3 bg-white">
            <img 
              src={selectedCharacter.image} 
              alt={selectedCharacter.name}
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-sm font-bold mb-1">{selectedCharacter.name}</h3>
          <p className="text-[10px] text-gray-300 text-center mb-3 leading-tight">{selectedCharacter.description}</p>
          
          <div className="w-full bg-gray-900 rounded px-3 py-2 flex justify-between items-center border border-gray-600">
            <span className="text-[10px] text-amber-400">PONTOS</span>
            <span className="text-sm">{score}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm
                ${currentView === item.id 
                  ? 'bg-amber-600 text-white' 
                  : 'hover:bg-gray-700 text-gray-300'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button 
          onClick={onBackToSelection}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-900/50 text-red-400 transition-colors mt-auto text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Trocar Herói</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 relative overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl text-amber-500">
            {currentView === 'trail' ? 'Trilha da Autonomia' : 'Ranking das Heroínas'}
          </h1>
          {gameFinished && currentView === 'trail' && (
            <div className="bg-green-600 px-4 py-2 rounded border-2 border-green-400 text-xs animate-bounce">
              🎉 JORNADA CONCLUÍDA! 🎉
            </div>
          )}
        </header>

        {currentView === 'trail' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <TrailMap 
              currentStage={currentStage} 
              onSelectStage={handleSelectStage} 
            />
          </div>
        )}

        {currentView === 'ranking' && (
          <Scoreboard />
        )}

        {/* Battle Arena Modal */}
        {isModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl h-[90vh]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-amber-500 font-pixel text-sm"
              >
                FECHAR [X]
              </button>
              {/* Note: BattleArena needs to be updated to receive these props and render correctly in this space */}
              <BattleArena 
                selectedCharacter={selectedCharacter}
                obstacleIndex={currentStage}
                onVictory={handleVictory}
                onDefeat={handleDefeat}
                isModal={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
