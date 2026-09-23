import React, { useState } from 'react';
import { Map, Trophy, LogOut, User, Volume2, VolumeX } from 'lucide-react';
import TrailMap from './TrailMap';
import { obstacles, obstaclesBoys } from './GameData';
import Scoreboard from './Scoreboard';
import BattleArena from './BattleArena';
import RunnerGame from './RunnerGame';
import ArcadeTransition from './ArcadeTransition';
import GameIntro from './GameIntro';
import DataTutorial from './DataTutorial';
import VictoryScreen from './VictoryScreen';
import { db } from '@/services/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function GameDashboard({ playerName, selectedCharacter, onBackToSelection }) {
  const [currentView, setCurrentView] = useState('trail');
  const [currentStage, setCurrentStage] = useState(0);
  const [score, setScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // New States for continuous progression
  const [rankingDocId, setRankingDocId] = useState(null);
  const [currentStats, setCurrentStats] = useState({
    autoestima: selectedCharacter.stats.autoestima || 50,
    conhecimento: selectedCharacter.stats.conhecimento || 50,
    empatia: selectedCharacter.stats.empatia || 50,
    coragem: selectedCharacter.stats.coragem || 50,
    respeito: selectedCharacter.stats.respeito || 50
  });
  const [phaseState, setPhaseState] = useState('map'); // 'map', 'arcade', 'battle'

  const activeObstacles = selectedCharacter?.gender === 'M' ? obstaclesBoys : obstacles;

  React.useEffect(() => {
    const initRanking = async () => {
      if (!rankingDocId && playerName && selectedCharacter) {
        try {
          const docRef = await addDoc(collection(db, 'jogos_educativos_ranking'), {
            playerName: playerName || 'Anônimo',
            characterName: selectedCharacter.name,
            score: 0,
            date: new Date().toISOString(),
            gender: selectedCharacter.gender || 'F'
          });
          setRankingDocId(docRef.id);
        } catch (e) {
          console.error("Erro ao inicializar ranking:", e);
        }
      }
    };
    initRanking();
  }, [playerName, selectedCharacter, rankingDocId]);

  const updateRanking = async (newScore) => {
    if (rankingDocId) {
      try {
        const docRef = doc(db, 'jogos_educativos_ranking', rankingDocId);
        await updateDoc(docRef, { 
          score: newScore,
          date: new Date().toISOString()
        });
      } catch (e) {
        console.error("Erro ao atualizar ranking:", e);
      }
    }
    // Update local storage to keep sync
    const savedScores = JSON.parse(localStorage.getItem('jornada_ranking') || '[]');
    const existingIndex = savedScores.findIndex(s => s.docId === rankingDocId);
    const scoreObj = {
      docId: rankingDocId,
      playerName: playerName || 'Anônimo',
      characterName: selectedCharacter.name,
      score: newScore,
      date: new Date().toISOString()
    };
    if (existingIndex >= 0) {
      savedScores[existingIndex] = scoreObj;
    } else {
      savedScores.push(scoreObj);
    }
    localStorage.setItem('jornada_ranking', JSON.stringify(savedScores));
  };

  const handleSelectStage = (stageIndex) => {
    if (stageIndex === currentStage) {
      setPhaseState('arcade');
      setIsModalOpen(true);
    }
  };

  const handleVictory = (pointsGained, statBoosts = {}) => {
    const newScore = score + pointsGained;
    setScore(newScore);
    
    // Process Stat Boosts
    setCurrentStats(prev => ({
      autoestima: Math.min(100, prev.autoestima + (statBoosts.autoestima || 0)),
      conhecimento: Math.min(100, prev.conhecimento + (statBoosts.conhecimento || 0)),
      empatia: Math.min(100, prev.empatia + (statBoosts.empatia || 0)),
      coragem: Math.min(100, prev.coragem + (statBoosts.coragem || 0)),
      respeito: Math.min(100, prev.respeito + (statBoosts.respeito || 0))
    }));

    updateRanking(newScore);
    setIsModalOpen(false);
    
    const nextStage = currentStage + 1;
    setCurrentStage(nextStage);

    // If all 7 stages are cleared
    if (nextStage >= 7) {
      setGameFinished(true);
    }
  };

  const handleDefeat = () => {
    setIsModalOpen(false);
  };

  const menuItems = [
    { id: 'trail', label: 'Trilha', icon: Map },
    { id: 'ranking', label: 'Ranking', icon: Trophy }
  ];

  if (showIntro) {
    return <GameIntro selectedCharacter={selectedCharacter} onFinishIntro={() => setShowIntro(false)} />;
  }

  if (showTutorial) {
    return <DataTutorial onFinish={() => setShowTutorial(false)} />;
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
          
          <div className="w-full bg-gray-900 rounded px-3 py-2 flex justify-between items-center border border-gray-600 mb-3">
            <span className="text-[10px] text-amber-400">PONTOS</span>
            <span className="text-sm font-bold">{score}</span>
          </div>

          {/* Dynamic Stats */}
          <div className="w-full space-y-2 mt-2">
            {selectedCharacter.gender === 'F' ? (
              <>
                <div className="flex flex-col">
                  <div className="flex justify-between text-[8px] mb-1"><span className="text-white">AUTOESTIMA</span><span>{currentStats.autoestima}%</span></div>
                  <div className="w-full bg-gray-900 h-2 rounded"><div className="bg-pink-400 h-full rounded transition-all" style={{width: `${currentStats.autoestima}%`}}></div></div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between text-[8px] mb-1"><span className="text-white">SABEDORIA</span><span>{currentStats.conhecimento}%</span></div>
                  <div className="w-full bg-gray-900 h-2 rounded"><div className="bg-blue-400 h-full rounded transition-all" style={{width: `${currentStats.conhecimento}%`}}></div></div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col">
                  <div className="flex justify-between text-[8px] mb-1"><span className="text-white">CORAGEM</span><span>{currentStats.coragem}%</span></div>
                  <div className="w-full bg-gray-900 h-2 rounded"><div className="bg-orange-400 h-full rounded transition-all" style={{width: `${currentStats.coragem}%`}}></div></div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between text-[8px] mb-1"><span className="text-white">RESPEITO</span><span>{currentStats.respeito}%</span></div>
                  <div className="w-full bg-gray-900 h-2 rounded"><div className="bg-purple-400 h-full rounded transition-all" style={{width: `${currentStats.respeito}%`}}></div></div>
                </div>
              </>
            )}
            <div className="flex flex-col">
              <div className="flex justify-between text-[8px] mb-1"><span className="text-white">EMPATIA</span><span>{currentStats.empatia}%</span></div>
              <div className="w-full bg-gray-900 h-2 rounded"><div className="bg-green-400 h-full rounded transition-all" style={{width: `${currentStats.empatia}%`}}></div></div>
            </div>
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
            {currentView === 'trail' 
              ? (selectedCharacter.gender === 'M' ? 'Trilha dos Aliados' : 'Trilha da Autonomia') 
              : 'Ranking'}
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
              activeObstacles={activeObstacles}
              isMale={selectedCharacter.gender === 'M'} 
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
              
              {phaseState === 'arcade' ? (
                <ArcadeTransition 
                  selectedCharacter={selectedCharacter}
                  onWin={(points) => {
                     setScore(prev => prev + points);
                     setPhaseState('battle');
                  }}
                  onLose={() => setIsModalOpen(false)}
                />
              ) : activeObstacles[currentStage]?.type === 'runner' ? (
                <RunnerGame 
                  selectedCharacter={selectedCharacter}
                  obstacle={activeObstacles[currentStage]} 
                  onVictory={handleVictory} 
                  onDefeat={handleDefeat}
                />
              ) : (
                <BattleArena 
                  selectedCharacter={selectedCharacter}
                  obstacle={activeObstacles[currentStage]} 
                  onVictory={handleVictory} 
                  onDefeat={handleDefeat}
                  isModal={true}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
