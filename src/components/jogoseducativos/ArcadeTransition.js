import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

export default function ArcadeTransition({ selectedCharacter, onWin, onLose }) {
  const canvasRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Game state refs (avoid React renders for 60 FPS)
  const gameState = useRef({
    player: { x: 400, y: 500, size: 40, speed: 5 },
    enemies: [],
    items: [],
    keys: {},
    lastFrameTime: 0,
    score: 0,
    hp: 100
  });

  const playerImgRef = useRef(null);
  const bgImgRef = useRef(null);
  const goodImgRef = useRef(null);
  const badImgRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Initialize images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = 4;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) setImagesLoaded(true);
    };

    const pImg = new Image();
    pImg.src = selectedCharacter.image;
    pImg.onload = () => { playerImgRef.current = pImg; checkAllLoaded(); };

    const bImg = new Image();
    bImg.src = '/arcade_bg.jpg';
    bImg.onload = () => { bgImgRef.current = bImg; checkAllLoaded(); };

    const gImg = new Image();
    gImg.src = '/arcade_item_good.png';
    gImg.onload = () => { goodImgRef.current = gImg; checkAllLoaded(); };

    const bdImg = new Image();
    bdImg.src = '/arcade_item_bad.png';
    bdImg.onload = () => { badImgRef.current = bdImg; checkAllLoaded(); };
  }, [selectedCharacter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameState.current.keys[e.key] = true;
    };
    const handleKeyUp = (e) => {
      gameState.current.keys[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    gameState.current.hp = 100;
    gameState.current.score = 0;
    gameState.current.enemies = [];
    gameState.current.items = [];
    setTimeLeft(15);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          onWin(gameState.current.score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawner = setInterval(() => {
      const isEnemy = Math.random() > 0.4;
      if (isEnemy) {
        gameState.current.enemies.push({
          x: Math.random() * 750,
          y: -50,
          size: 30,
          speed: 2 + Math.random() * 3
        });
      } else {
        gameState.current.items.push({
          x: Math.random() * 750,
          y: -50,
          size: 25,
          speed: 2 + Math.random() * 2
        });
      }
    }, 800);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [isPlaying, onWin]);

  useEffect(() => {
    if (isPlaying) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let animationFrameId;
      
      let bgOffsetY = 0;

      const render = (time) => {
        const state = gameState.current;
        
        // Draw scrolling background
        if (bgImgRef.current) {
          bgOffsetY += 1;
          if (bgOffsetY >= canvas.height) bgOffsetY = 0;
          
          // Draw two copies for seamless loop
          ctx.drawImage(bgImgRef.current, 0, bgOffsetY, canvas.width, canvas.height);
          ctx.drawImage(bgImgRef.current, 0, bgOffsetY - canvas.height, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Update player
        if (state.keys['ArrowLeft'] && state.player.x > 0) state.player.x -= state.player.speed;
        if (state.keys['ArrowRight'] && state.player.x < canvas.width - state.player.size) state.player.x += state.player.speed;
        if (state.keys['ArrowUp'] && state.player.y > 0) state.player.y -= state.player.speed;
        if (state.keys['ArrowDown'] && state.player.y < canvas.height - state.player.size) state.player.y += state.player.speed;

        // Draw Player
        if (playerImgRef.current) {
          ctx.drawImage(playerImgRef.current, state.player.x, state.player.y, state.player.size, state.player.size);
        } else {
          ctx.fillStyle = 'blue';
          ctx.fillRect(state.player.x, state.player.y, state.player.size, state.player.size);
        }

        // Draw and update Enemies (Bad items)
        for (let i = state.enemies.length - 1; i >= 0; i--) {
          let e = state.enemies[i];
          e.y += e.speed;
          
          if (badImgRef.current) {
            ctx.drawImage(badImgRef.current, e.x, e.y, e.size + 15, e.size + 15);
          } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(e.x, e.y, e.size, e.size);
          }
          
          // Collision
          if (e.x < state.player.x + state.player.size &&
              e.x + e.size > state.player.x &&
              e.y < state.player.y + state.player.size &&
              e.size + e.y > state.player.y) {
                state.hp -= 10; // lose HP
                state.enemies.splice(i, 1);
                if (state.hp <= 0) {
                  setIsPlaying(false);
                  onLose();
                }
          } else if (e.y > canvas.height) {
            state.enemies.splice(i, 1);
          }
        }

        // Draw and update Items (Good items)
        for (let i = state.items.length - 1; i >= 0; i--) {
          let item = state.items[i];
          item.y += item.speed;
          
          if (goodImgRef.current) {
            ctx.drawImage(goodImgRef.current, item.x, item.y, item.size + 10, item.size + 10);
          } else {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(item.x + item.size/2, item.y + item.size/2, item.size/2, 0, 2*Math.PI);
            ctx.fill();
          }

          // Collision
          if (item.x < state.player.x + state.player.size &&
              item.x + item.size > state.player.x &&
              item.y < state.player.y + state.player.size &&
              item.size + item.y > state.player.y) {
                state.score += 5; // gain points
                state.items.splice(i, 1);
          } else if (item.y > canvas.height) {
            state.items.splice(i, 1);
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isPlaying, onLose, onWin]);

  return (
    <div className="flex flex-col items-center justify-center font-pixel h-full w-full bg-slate-900 rounded-xl border-4 border-amber-500 overflow-hidden relative shadow-2xl p-6">
      {!isPlaying && timeLeft === 15 ? (
        <div className="text-center text-white">
          <h2 className="text-3xl text-amber-400 mb-6">A CAMINHO DA PRÓXIMA FASE...</h2>
          <p className="text-sm mb-6 leading-loose max-w-lg mx-auto">
            Use as <strong>SETAS DO TECLADO</strong> para movimentar o seu personagem.<br/><br/>
            Desvie da desinformação e machismo (Vermelhos) e colete conhecimento e empatia (Amarelos).
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-slate-800 p-3 rounded"><ArrowUp /></div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="bg-slate-800 p-3 rounded"><ArrowLeft /></div>
                <div className="bg-slate-800 p-3 rounded"><ArrowDown /></div>
                <div className="bg-slate-800 p-3 rounded"><ArrowRight /></div>
              </div>
            </div>
          </div>
          <button 
            onClick={startGame}
            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-lg border-b-4 border-amber-800 font-bold text-xl transition-transform active:translate-y-1 active:border-b-0"
          >
            INICIAR
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-between w-full max-w-[800px] mb-4">
            <div className="text-amber-400 text-xl">TEMPO: {timeLeft}s</div>
            <div className="text-white text-xl flex gap-4">
               <span>PONTOS: {gameState.current.score}</span>
               <span className={`${gameState.current.hp > 50 ? 'text-green-400' : 'text-red-400'}`}>HP: {gameState.current.hp}%</span>
            </div>
          </div>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            className="bg-slate-800 border-4 border-slate-700 rounded shadow-lg max-w-full"
          />
        </div>
      )}
    </div>
  );
}
