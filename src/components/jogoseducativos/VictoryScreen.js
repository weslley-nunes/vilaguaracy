import React, { useEffect, useState } from 'react';
import { Award, Star } from 'lucide-react';

export default function VictoryScreen({ selectedCharacter, score, onFinish }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    // In a real app, we'd trigger a react-confetti here
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 font-pixel bg-gradient-to-b from-slate-900 to-black text-white">
      {/* Dynamic Background Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="w-full h-full bg-[url('/bg_jalapao.jpg')] bg-cover bg-center animate-pulse blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-black/80 border-4 border-amber-500 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
        
        {/* Title */}
        <div className="flex items-center gap-4 mb-6">
          <Star className="text-amber-400 w-8 h-8 animate-spin-slow" />
          <h1 className="text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 font-bold">
            VITÓRIA ÉPICA!
          </h1>
          <Star className="text-amber-400 w-8 h-8 animate-spin-slow" />
        </div>

        {/* Character Avatar */}
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-amber-400 overflow-hidden mb-6 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce">
          <img 
            src={selectedCharacter?.image} 
            alt={selectedCharacter?.name} 
            className="w-full h-full object-cover" 
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <p className="text-amber-300 text-lg mb-2 uppercase">Pontuação Final: <span className="text-white text-2xl font-bold">{score}</span></p>

        {/* The Teachers Message */}
        <div className="bg-slate-800/80 border-l-4 border-amber-500 p-6 rounded-r-lg mt-6 text-sm md:text-base leading-relaxed text-gray-200 shadow-inner text-left w-full relative">
          <Award className="absolute -top-4 -left-4 w-8 h-8 text-amber-500 bg-slate-900 rounded-full p-1" />
          <p className="italic mb-4">
            "Parabéns, {selectedCharacter?.gender === 'M' ? 'Herói' : 'Heroína'}! O Sistema ruiu diante da sua força. 
            O conhecimento é a sua maior arma contra a violência e a desigualdade. 
            Lembre-se sempre de que você não está {selectedCharacter?.gender === 'M' ? 'sozinho' : 'sozinha'} e que a {selectedCharacter?.gender === 'M' ? 'nossa aliança é essencial' : 'sua autonomia é inegociável'}. 
            Continuem mudando o mundo e construindo uma sociedade mais justa!"
          </p>
          <p className="font-bold text-amber-400 text-right text-xs">
            - Com orgulho, Professores Alexandre e Weslley
          </p>
        </div>

        <button 
          onClick={onFinish}
          className="mt-10 bg-amber-600 hover:bg-amber-500 text-white border-2 border-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 w-full md:w-auto"
        >
          VER O RANKING FINAL
        </button>
      </div>
    </div>
  );
}
