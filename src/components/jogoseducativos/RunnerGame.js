import React, { useState, useEffect, useRef } from 'react';
import { Heart, Skull, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

const LANE_COUNT = 3;
const GAME_DURATION = 30; // seconds
const OBSTACLE_SPEED = 2; // Speed percentage per frame

export default function RunnerGame({ selectedCharacter, obstacle, onVictory, onDefeat }) {
  const [lane, setLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [gameObstacles, setGameObstacles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hp, setHp] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isHit, setIsHit] = useState(false);

  const requestRef = useRef();
  const lastObstacleTime = useRef(0);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') {
        setLane((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setLane((prev) => Math.min(LANE_COUNT - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = (time) => {
      // Spawn new obstacles
      if (time - lastObstacleTime.current > 800) { // spawn every 800ms
        const randomLane = Math.floor(Math.random() * LANE_COUNT);
        const types = ['Fofoca', 'Mentira', 'Ameaça'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        setGameObstacles((prev) => [
          ...prev,
          { id: Date.now(), lane: randomLane, top: 0, type: randomType, passed: false }
        ]);
        lastObstacleTime.current = time;
      }

      // Move obstacles and check collisions
      setGameObstacles((prev) => {
        let hitDetected = false;
        const updated = prev.map((obs) => {
          const newTop = obs.top + OBSTACLE_SPEED;
          
          // Collision box: top between 80% and 95%, same lane, not already passed
          if (newTop > 80 && newTop < 95 && obs.lane === lane && !obs.passed && !isHit) {
            hitDetected = true;
            obs.passed = true;
          } else if (newTop >= 95) {
            obs.passed = true; // successfully avoided or already hit
          }
          return { ...obs, top: newTop };
        }).filter((obs) => obs.top < 100);

        if (hitDetected) {
          handleHit();
        }

        return updated;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, lane, isHit]);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          handleVictory();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleHit = () => {
    if (isHit) return;
    setIsHit(true);
    setHp((prev) => {
      const newHp = prev - 1;
      if (newHp <= 0) {
        setIsPlaying(false);
        setTimeout(onDefeat, 1500);
      }
      return newHp;
    });
    // Invulnerability frames
    setTimeout(() => {
      setIsHit(false);
    }, 1000);
  };

  const handleVictory = () => {
    // Add remaining HP as bonus points
    setTimeout(() => {
      onVictory(100 + (hp * 20));
    }, 1500);
  };

  const startGame = () => {
    setShowInstructions(false);
    setIsPlaying(true);
  };

  const moveLeft = () => setLane((prev) => Math.max(0, prev - 1));
  const moveRight = () => setLane((prev) => Math.min(LANE_COUNT - 1, prev + 1));

  return (
    <div className="flex items-center justify-center font-pixel h-full w-full">
      <div className={`w-full max-w-md h-full max-h-[90vh] bg-slate-900 border-[12px] border-slate-800 rounded-[3rem] relative shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${isHit ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.8)]' : ''}`}>
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>

        {/* HUD */}
        <div className="absolute top-8 left-0 w-full px-6 flex justify-between items-center z-20 text-white drop-shadow-md">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`w-5 h-5 ${i < hp ? 'fill-red-500 text-red-500' : 'text-gray-500'} ${isHit && i === hp - 1 ? 'animate-ping' : ''}`} />
            ))}
          </div>
          <div className="text-xl font-bold font-mono bg-black/50 px-3 py-1 rounded">
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Game Area (3D perspective illusion) */}
        <div className="flex-1 relative overflow-hidden perspective-[800px] bg-gradient-to-b from-slate-800 to-slate-950">
          
          {/* Sr Seboso Background Threat */}
          <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 opacity-30 transition-transform duration-500 ${isHit ? 'scale-125 opacity-70' : 'scale-100'} pointer-events-none`}>
            <img src={obstacle?.image || '/sprite_seboso.png'} alt="Sr Seboso" className="w-full h-full object-contain animate-bounce" style={{ imageRendering: 'pixelated' }} />
          </div>

          {/* Road/Lanes */}
          <div className="absolute bottom-0 w-[200%] left-[-50%] h-full" style={{ transform: 'rotateX(60deg)', transformOrigin: 'bottom center' }}>
            <div className="w-full h-full flex border-x-4 border-amber-500/50 bg-slate-800/80">
              <div className="flex-1 border-r-2 border-dashed border-white/30"></div>
              <div className="flex-1 border-r-2 border-dashed border-white/30"></div>
              <div className="flex-1"></div>
            </div>
            {/* Road lines moving illusion */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjAgaDEwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] animate-[slideDown_1s_linear_infinite]"></div>
          </div>

          {/* Obstacles */}
          {gameObstacles.map((obs) => (
            <div
              key={obs.id}
              className="absolute w-16 h-16 -ml-8 transition-transform"
              style={{
                top: `${obs.top}%`,
                left: `${16.66 + (obs.lane * 33.33)}%`,
                transform: `scale(${0.5 + (obs.top / 100)})`, // Perspective scaling
                zIndex: Math.floor(obs.top)
              }}
            >
              <div className="bg-red-900 border-2 border-red-500 rounded-lg w-full h-full flex items-center justify-center shadow-lg shadow-red-900/50 flex-col">
                <AlertTriangle className="text-amber-500 w-6 h-6" />
                <span className="text-[8px] text-white font-bold">{obs.type}</span>
              </div>
            </div>
          ))}

          {/* Player */}
          <div 
            className={`absolute bottom-8 w-20 h-20 -ml-10 transition-all duration-200 z-50 ${isHit ? 'opacity-50 animate-pulse' : ''}`}
            style={{ left: `${16.66 + (lane * 33.33)}%` }}
          >
            <img 
              src={selectedCharacter?.image} 
              alt="Player" 
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Screens (Instructions / Game Over / Win) */}
          {showInstructions && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-6 text-center">
              <Skull className="text-red-500 w-16 h-16 mb-4 animate-bounce" />
              <h2 className="text-2xl text-red-500 font-bold mb-2">FUGA DO SR. SEBOSO!</h2>
              <p className="text-white text-xs leading-relaxed mb-6">
                Ele não desiste! Corra por 30 segundos e desvie das armadilhas do machismo estrutural.<br/><br/>
                Use as <b>SETAS</b> do teclado ou os <b>BOTÕES</b> para desviar. Três colisões e você é capturad{selectedCharacter?.gender === 'M' ? 'o' : 'a'}.
              </p>
              <button onClick={startGame} className="bg-green-600 text-white px-6 py-3 rounded-xl border-b-4 border-green-800 active:border-b-0 hover:bg-green-500">
                CORRER!
              </button>
            </div>
          )}

          {!isPlaying && !showInstructions && hp <= 0 && (
            <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-50 p-6 text-center">
              <h2 className="text-3xl text-white font-bold mb-2">CAPTURAD{selectedCharacter?.gender === 'M' ? 'O' : 'A'}!</h2>
              <p className="text-red-200 text-xs mb-6">O Sr. Seboso te alcançou.</p>
            </div>
          )}

          {!isPlaying && !showInstructions && hp > 0 && timeLeft <= 0 && (
            <div className="absolute inset-0 bg-green-900/90 flex flex-col items-center justify-center z-50 p-6 text-center">
              <h2 className="text-3xl text-white font-bold mb-2">ESCAPOU!</h2>
              <p className="text-green-200 text-xs mb-6">Você superou mais essa armadilha.</p>
            </div>
          )}
        </div>

        {/* Mobile Controls Overlay */}
        <div className="h-24 bg-slate-900 border-t-2 border-slate-700 flex justify-center items-center gap-8 p-4">
          <button 
            onClick={moveLeft}
            disabled={!isPlaying || lane === 0}
            className="bg-slate-800 p-4 rounded-full border-2 border-slate-600 text-white disabled:opacity-50 active:bg-slate-700"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={moveRight}
            disabled={!isPlaying || lane === LANE_COUNT - 1}
            className="bg-slate-800 p-4 rounded-full border-2 border-slate-600 text-white disabled:opacity-50 active:bg-slate-700"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>

        {/* Global CSS for sliding background */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideDown {
            from { background-position: 0 0; }
            to { background-position: 0 40px; }
          }
        `}} />
      </div>
    </div>
  );
}
