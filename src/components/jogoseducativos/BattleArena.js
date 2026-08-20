import React, { useState, useEffect } from 'react';
import { obstacles } from './GameData';
import { Shield, Sparkles, AlertTriangle, ArrowRight, RefreshCcw } from 'lucide-react';

export default function BattleArena({ character, onRestart }) {
  const [currentObstacleIndex, setCurrentObstacleIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const maxPlayerHp = 100;
  const [obstacleHp, setObstacleHp] = useState(obstacles[0].hp);
  
  const [logs, setLogs] = useState([{ text: `Você encontrou o ${obstacles[0].name}!`, type: 'info' }]);
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
      addLog(`${character.name} usou "${skill.name}"! ${currentObstacle.name} perdeu ${skill.power} de força.`, 'player');
      
      if (newHp === 0) {
        handleObstacleDefeated();
        return;
      }
    } else if (skill.type === 'heal') {
      const healAmount = skill.power;
      const newHp = Math.min(maxPlayerHp, playerHp + healAmount);
      setPlayerHp(newHp);
      addLog(`${character.name} usou "${skill.name}" e recuperou ${newHp - playerHp} de energia!`, 'player');
    }

    setIsPlayerTurn(false);
  };

  const handleObstacleDefeated = () => {
    addLog(`Você superou o ${currentObstacle.name}!`, 'success');
    if (currentObstacleIndex + 1 < obstacles.length) {
      setTimeout(() => {
        const nextIdx = currentObstacleIndex + 1;
        setCurrentObstacleIndex(nextIdx);
        setObstacleHp(obstacles[nextIdx].hp);
        addLog(`Atenção! Você encontrou a ${obstacles[nextIdx].name}!`, 'info');
        setIsPlayerTurn(true);
      }, 2000);
    } else {
      setVictory(true);
      addLog(`Parabéns! Você concluiu a Jornada da Autonomia e provou sua força!`, 'success');
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && !victory && obstacleHp > 0) {
      const timer = setTimeout(() => {
        const attack = currentObstacle.attacks[Math.floor(Math.random() * currentObstacle.attacks.length)];
        const newHp = Math.max(0, playerHp - attack.damage);
        setPlayerHp(newHp);
        
        addLog(`${currentObstacle.name} atacou: ${attack.message} (Perdeu ${attack.damage} de energia)`, 'enemy');
        
        if (newHp === 0) {
          setGameOver(true);
          addLog(`Sua energia esgotou. Lembre-se, pedir ajuda não é fraqueza. Tente novamente!`, 'error');
        } else {
          setIsPlayerTurn(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, victory, obstacleHp, playerHp, currentObstacle]);

  // Scroll to bottom of logs
  useEffect(() => {
    const logContainer = document.getElementById('battle-logs');
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col md:flex-row h-[80vh]">
        
        {/* Left Panel: Arena */}
        <div className="flex-1 p-8 flex flex-col justify-between relative bg-gradient-to-b from-slate-800 to-slate-900">
          {/* Obstacle Stats */}
          <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-xl border border-slate-600 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${currentObstacle.color} flex items-center justify-center border-2 border-slate-500`}>
                <AlertTriangle className="text-white w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentObstacle.name}</h3>
                <p className="text-slate-400 text-sm max-w-[200px] truncate">{currentObstacle.description}</p>
              </div>
            </div>
            <div className="w-32 md:w-48">
              <div className="flex justify-between text-xs text-white mb-1">
                <span>Força</span>
                <span>{obstacleHp} / {currentObstacle.maxHp}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${(obstacleHp / currentObstacle.maxHp) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Arena Visualizer */}
          <div className="flex-1 flex items-center justify-center my-8">
             <div className="text-center relative">
               {!victory && !gameOver && (
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-12 transition-all`}>
                      {/* Character Sprite Placeholder */}
                      <div className={`w-24 h-32 ${character.color} rounded-t-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center animate-pulse`}>
                         <Shield className="w-10 h-10 text-white/50" />
                      </div>
                      <ArrowRight className={`w-8 h-8 text-slate-500 ${isPlayerTurn ? 'opacity-100 rotate-0' : 'opacity-100 rotate-180'} transition-transform duration-500`} />
                      {/* Obstacle Sprite Placeholder */}
                      <div className={`w-24 h-32 ${currentObstacle.color} rounded-md shadow-2xl flex items-center justify-center ${!isPlayerTurn ? 'animate-bounce' : ''}`}>
                         <AlertTriangle className="w-10 h-10 text-white/30" />
                      </div>
                  </div>
               )}
               {victory && (
                 <div className="flex flex-col items-center animate-bounce">
                    <Sparkles className="w-20 h-20 text-yellow-400 mb-4" />
                    <h2 className="text-4xl font-black text-white text-center">Vitória!</h2>
                 </div>
               )}
               {gameOver && (
                 <div className="flex flex-col items-center">
                    <RefreshCcw className="w-16 h-16 text-slate-500 mb-4 cursor-pointer hover:text-white transition-colors" onClick={onRestart} />
                    <h2 className="text-3xl font-bold text-white text-center">Nunca desista.</h2>
                 </div>
               )}
             </div>
          </div>

          {/* Player Stats */}
          <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors duration-300 ${isPlayerTurn ? character.borderColor + ' bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}>
            <div className="w-32 md:w-48">
              <div className="flex justify-between text-xs text-white mb-1">
                <span>Sua Energia</span>
                <span>{playerHp} / {maxPlayerHp}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div 
                  className={`${character.color} h-3 rounded-full transition-all duration-500`} 
                  style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <h3 className="text-xl font-bold text-white">{character.name}</h3>
                <p className={`text-sm ${character.iconColor}`}>{isPlayerTurn ? 'Seu turno' : 'Aguarde...'}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${character.color} flex items-center justify-center border-2 border-white/20`}>
                <Shield className="text-white w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Actions and Logs */}
        <div className="w-full md:w-[350px] bg-slate-900 border-l border-slate-700 flex flex-col">
          {/* Logs */}
          <div id="battle-logs" className="flex-1 p-6 overflow-y-auto space-y-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Histórico de Batalha</h3>
            {logs.map((log, idx) => (
              <div key={idx} className={`p-3 rounded-lg text-sm border-l-4 ${
                log.type === 'player' ? `bg-slate-800/80 ${character.borderColor} text-slate-200` :
                log.type === 'enemy' ? 'bg-red-900/20 border-red-500 text-red-200' :
                log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-300 font-semibold' :
                log.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-100 font-semibold' :
                'bg-slate-800 border-slate-500 text-slate-400'
              }`}>
                {log.text}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-800 border-t border-slate-700">
             <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                Ações de Empoderamento
             </h3>
             <div className="grid grid-cols-1 gap-3">
                {!victory && !gameOver ? (
                  character.skills.map(skill => (
                    <button
                      key={skill.id}
                      disabled={!isPlayerTurn}
                      onClick={() => handleSkill(skill)}
                      className={`text-left p-3 rounded-lg border-2 transition-all duration-200 group ${
                        isPlayerTurn 
                          ? `border-slate-600 hover:${character.borderColor} bg-slate-700 hover:bg-slate-600` 
                          : 'border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">{skill.name}</span>
                        <span className={`text-xs px-2 py-1 rounded bg-slate-800 ${skill.type === 'attack' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {skill.type === 'attack' ? 'Confrontar' : 'Fortalecer'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{skill.description}</p>
                    </button>
                  ))
                ) : (
                  <button 
                    onClick={onRestart}
                    className={`p-4 rounded-xl text-white font-bold ${character.color} ${character.hoverColor} transition-colors flex items-center justify-center gap-2`}
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Jogar Novamente
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
