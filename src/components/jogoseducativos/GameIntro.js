import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function GameIntro({ selectedCharacter, onFinishIntro }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  
  const isMale = selectedCharacter?.gender === 'M';

  const fullText = `Bem-${isMale ? 'vindo, herói' : 'vinda, heroína'}! Você está no Jalapão, Tocantins. Um lugar mágico de belezas naturais incríveis... Mas algo sombrio invadiu o seu celular. Monstros tentam te convencer de que a violência é ${isMale ? 'normal' : 'inevitável'}... A sua missão é usar o conhecimento para ser ${isMale ? 'um aliado' : 'livre'}! Você está preparad${isMale ? 'o' : 'a'} para a Jornada?`;

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(prev => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setShowButton(true);
      }
    }, 40); // typing speed

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center font-pixel overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg_jalapao.jpg')", imageRendering: 'pixelated' }}
      ></div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col md:flex-row items-end justify-between h-full pb-20">
        
        {/* Character Sprite (Left/Bottom) */}
        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 border-4 border-amber-500 rounded-lg overflow-hidden bg-black/50 animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.5)]">
          <img 
            src={selectedCharacter?.image} 
            alt={selectedCharacter?.name} 
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Dialog Box */}
        <div className="flex-1 bg-black/80 border-4 border-amber-500 rounded-xl p-6 ml-0 md:ml-8 mt-8 md:mt-0 min-h-[160px] relative">
          <h3 className="text-amber-400 text-lg md:text-xl mb-3 animate-pulse">{selectedCharacter?.name}</h3>
          <p className="text-white text-sm md:text-lg leading-relaxed h-full">
            {displayedText}
            {!showButton && <span className="animate-ping">_</span>}
          </p>

          {/* Proceed Button */}
          {showButton && (
            <div className="absolute -bottom-8 right-8 animate-bounce">
              <button 
                onClick={onFinishIntro}
                className="bg-amber-600 hover:bg-amber-500 text-white border-2 border-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <span>COMEÇAR AVENTURA</span>
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
