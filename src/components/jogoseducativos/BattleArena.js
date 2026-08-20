import React, { useState, useEffect } from 'react';
import { obstacles } from './GameData';

export default function BattleArena({ character, onRestart }) {
  const [currentObstacleIndex, setCurrentObstacleIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const maxPlayerHp = 100;
  const [obstacleHp, setObstacleHp] = useState(obstacles[0].hp);
  
  const [logs, setLogs] = useState([{ text: `VOCE ENCONTROU O ${obstacles[0].name.toUpperCase()}!`, type: 'info' }]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const currentObstacle = obstacles[currentObstacleIndex];

  const addLog = (text, type) => {
    setLogs(prev => [...prev, { text, type }]);
  };

  const handleSkill = (skill) => {
    if (!isPlayerTurn || gameOver || victory) return;

    if (skill.type === 'attack') {
      const newHp = Math.max(0, obstacleHp - skill.power);
      setObstacleHp(newHp);
      addLog(`VOCE USOU "${skill.name.toUpperCase()}"! INIMIGO PERDEU ${skill.power} HP.`, 'player');
      
      if (newHp === 0) {
        handleObstacleDefeated();
        return;
      }
    } else if (skill.type === 'heal') {
      const healAmount = skill.power;
      const newHp = Math.min(maxPlayerHp, playerHp + healAmount);
      setPlayerHp(newHp);
      addLog(`VOCE USOU "${skill.name.toUpperCase()}" E RECUPEROU HP!`, 'player');
    }

    setIsPlayerTurn(false);
  };

  const handleObstacleDefeated = () => {
    addLog(`INIMIGO DERROTADO!`, 'success');
    if (currentObstacleIndex + 1 < obstacles.length) {
      setTimeout(() => {
        const nextIdx = currentObstacleIndex + 1;
        setCurrentObstacleIndex(nextIdx);
        setObstacleHp(obstacles[nextIdx].hp);
        addLog(`ATENCAO! SURGIU: ${obstacles[nextIdx].name.toUpperCase()}!`, 'info');
        setIsPlayerTurn(true);
      }, 2000);
    } else {
      setVictory(true);
      addLog(`PARABENS! JORNADA CONCLUIDA!`, 'success');
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && !victory && obstacleHp > 0) {
      const timer = setTimeout(() => {
        const attack = currentObstacle.attacks[Math.floor(Math.random() * currentObstacle.attacks.length)];
        const newHp = Math.max(0, playerHp - attack.damage);
        setPlayerHp(newHp);
        
        addLog(`INIMIGO: ${attack.message.toUpperCase()} (-${attack.damage} HP)`, 'enemy');
        
        if (newHp === 0) {
          setGameOver(true);
          addLog(`GAME OVER. NUNCA DESISTA!`, 'error');
        } else {
          setIsPlayerTurn(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, victory, obstacleHp, playerHp, currentObstacle]);

  useEffect(() => {
    const logContainer = document.getElementById('battle-logs');
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-pixel">
      <div className="max-w-5xl w-full bg-black border-8 border-white p-4 md:p-8 flex flex-col h-[85vh] shadow-[16px_16px_0_0_rgba(0,0,0,0.5)] relative">
        
        {/* Arena Top (Enemy) */}
        <div className="flex justify-between items-start mb-8">
           <div className="bg-white border-4 border-black p-4 w-64 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)]">
              <h3 className="text-[10px] text-black font-bold mb-2 uppercase">{currentObstacle.name}</h3>
              <div className="w-full bg-slate-300 h-4 border-2 border-black mb-1">
                <div 
                  className="bg-red-500 h-full transition-all duration-300" 
                  style={{ width: `${(obstacleHp / currentObstacle.maxHp) * 100}%` }}
                ></div>
              </div>
              <p className="text-[8px] text-right text-black">HP: {obstacleHp}/{currentObstacle.maxHp}</p>
           </div>
           
           <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-white bg-slate-800 overflow-hidden relative">
              {!victory && (
                <img 
                    src={currentObstacle.image} 
                    alt={currentObstacle.name} 
                    className={`w-full h-full object-cover pixelated ${!isPlayerTurn && !gameOver && obstacleHp > 0 ? 'animate-bounce' : ''}`}
                    style={{ imageRendering: 'pixelated' }}
                />
              )}
           </div>
        </div>

        {/* Arena Center (Spacing) */}
        <div className="flex-1"></div>

        {/* Arena Bottom (Player) */}
        <div className="flex justify-between items-end mb-8 relative">
           <div className="w-32 h-32 md:w-48 md:h-48 border-4 border-white bg-slate-800 overflow-hidden relative shadow-[8px_8px_0_0_rgba(255,255,255,0.2)]">
               <img 
                    src={character.image} 
                    alt={character.name} 
                    className={`w-full h-full object-cover pixelated ${isPlayerTurn ? 'animate-pulse' : ''}`}
                    style={{ imageRendering: 'pixelated' }}
               />
           </div>

           <div className="bg-white border-4 border-black p-4 w-64 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] relative top-4">
              <h3 className="text-[10px] text-black font-bold mb-2 uppercase">{character.name}</h3>
              <div className="w-full bg-slate-300 h-4 border-2 border-black mb-1">
                <div 
                  className="bg-green-500 h-full transition-all duration-300" 
                  style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                ></div>
              </div>
              <p className="text-[8px] text-right text-black">HP: {playerHp}/{maxPlayerHp}</p>
           </div>
        </div>

        {/* Dialog / Action Menu */}
        <div className="w-full bg-white border-8 border-black p-1 md:p-2 flex flex-col md:flex-row min-h-[160px]">
           {/* Logs Panel */}
           <div id="battle-logs" className="flex-1 p-4 overflow-y-auto max-h-[120px] md:max-h-[140px] text-[10px] md:text-xs leading-loose text-black border-b-4 md:border-b-0 md:border-r-4 border-black">
              {logs.map((log, idx) => (
                <p key={idx} className={`mb-2 ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-green-600' : 'text-black'}`}>
                  * {log.text}
                </p>
              ))}
           </div>
           
           {/* Actions Panel */}
           <div className="w-full md:w-1/3 p-2 flex flex-col gap-2 justify-center">
              {!victory && !gameOver ? (
                  character.skills.map(skill => (
                    <button
                      key={skill.id}
                      disabled={!isPlayerTurn}
                      onClick={() => handleSkill(skill)}
                      className={`text-[8px] md:text-[10px] text-left p-3 border-4 border-black bg-slate-200 hover:bg-yellow-400 active:bg-yellow-500 transition-colors ${
                        !isPlayerTurn ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {skill.name.toUpperCase()}
                    </button>
                  ))
              ) : (
                  <button 
                    onClick={onRestart}
                    className="text-[10px] text-center p-4 border-4 border-black bg-yellow-400 hover:bg-yellow-500 uppercase"
                  >
                    JOGAR NOVAMENTE
                  </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
