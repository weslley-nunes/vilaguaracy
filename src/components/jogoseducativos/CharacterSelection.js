import React from 'react';
import { characters } from './GameData';

export default function CharacterSelection({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 font-pixel">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12 border-4 border-white bg-black p-6 shadow-[8px_8px_0_0_rgba(255,255,255,0.2)]">
          <h1 className="text-2xl md:text-4xl text-yellow-400 mb-6 leading-loose">JORNADA DA AUTONOMIA</h1>
          <p className="text-xs md:text-sm text-white max-w-3xl mx-auto leading-loose">
            ESCOLHA SUA HEROINA. CADA UMA POSSUI HABILIDADES UNICAS PARA COMBATER VIOLENCIAS E FORTALECER A AUTONOMIA FEMININA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {characters.map((char) => (
            <div 
              key={char.id}
              onClick={() => onSelect(char)}
              className="relative bg-black rounded-none p-6 cursor-pointer border-4 border-white hover:border-yellow-400 group transform hover:-translate-y-2 transition-transform shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] hover:shadow-[8px_8px_0_0_rgba(250,204,21,0.5)] flex flex-col h-full"
            >
              <div className="flex flex-col items-center text-center flex-grow">
                <div className="w-full aspect-square border-4 border-white mb-4 bg-white relative flex items-center justify-center p-2">
                  <img 
                    src={char.image} 
                    alt={char.name} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                
                <h2 className="text-xl text-white mb-4">{char.name.toUpperCase()}</h2>
                <p className="text-[10px] text-slate-300 mb-6 flex-grow leading-loose">{char.description.toUpperCase()}</p>
                
                <div className="w-full space-y-4 mb-6">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white">AUTOESTIMA</span>
                    <div className="w-1/2 bg-slate-800 h-3 border-2 border-slate-600">
                      <div className={`h-full ${char.color}`} style={{ width: `${char.stats.autoestima}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white">SABEDORIA</span>
                    <div className="w-1/2 bg-slate-800 h-3 border-2 border-slate-600">
                      <div className={`h-full ${char.color}`} style={{ width: `${char.stats.conhecimento}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white">EMPATIA</span>
                    <div className="w-1/2 bg-slate-800 h-3 border-2 border-slate-600">
                      <div className={`h-full ${char.color}`} style={{ width: `${char.stats.empatia}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className={`w-full py-3 text-[10px] text-center text-white border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity ${char.color}`}>
                  SELECIONAR
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
