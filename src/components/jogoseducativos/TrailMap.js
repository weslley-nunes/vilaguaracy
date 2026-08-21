import React from 'react';
import { Check, Lock, Play } from 'lucide-react';
import { obstacles } from './GameData';

export default function TrailMap({ currentStage, onSelectStage }) {
  const nodes = [
    { top: '80%', left: '15%' },
    { top: '55%', left: '35%' },
    { top: '75%', left: '60%' },
    { top: '45%', left: '80%' },
    { top: '20%', left: '55%' }
  ];

  return (
    <div className="relative w-full h-[600px] max-w-4xl mx-auto rounded-xl overflow-hidden border-4 border-amber-900/50 shadow-2xl">
      <img 
        src="/mapa_tocantins.jpg" 
        alt="Mapa Trilha Tocantins" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {obstacles.map((obstacle, index) => {
        const isCompleted = index < currentStage;
        const isCurrent = index === currentStage;
        const isLocked = index > currentStage;
        
        let bgColor = "bg-gray-500";
        let Icon = Lock;
        
        if (isCompleted) {
          bgColor = "bg-green-500 hover:bg-green-600";
          Icon = Check;
        } else if (isCurrent) {
          bgColor = "bg-amber-500 hover:bg-amber-400 animate-pulse";
          Icon = Play;
        }

        return (
          <div 
            key={obstacle.id}
            className="absolute flex flex-col items-center group"
            style={{ top: nodes[index].top, left: nodes[index].left, transform: 'translate(-50%, -50%)' }}
          >
            <button
              disabled={isLocked || isCompleted}
              onClick={() => isCurrent && onSelectStage(index)}
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-xl transition-transform duration-300 ${isCurrent ? 'scale-110 cursor-pointer' : 'cursor-not-allowed'} ${bgColor}`}
            >
              <Icon className="w-8 h-8 text-white" />
            </button>
            <div className="mt-2 bg-black/80 px-3 py-1 rounded text-white font-pixel text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {isLocked ? "Bloqueado" : obstacle.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
