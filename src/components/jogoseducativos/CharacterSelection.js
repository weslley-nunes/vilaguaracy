import React from 'react';
import { characters } from './GameData';
import { Shield, BookOpen, HeartHandshake } from 'lucide-react';

export default function CharacterSelection({ onSelect }) {
  const getIcon = (id) => {
    switch (id) {
      case 'dandara': return <Shield className="w-12 h-12 mb-4 text-purple-600" />;
      case 'sofia': return <BookOpen className="w-12 h-12 mb-4 text-teal-600" />;
      case 'luna': return <HeartHandshake className="w-12 h-12 mb-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Jornada da Autonomia</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Escolha sua heroína. Cada uma possui conhecimentos e habilidades únicas para combater violências e fortalecer a autonomia feminina.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {characters.map((char) => (
            <div 
              key={char.id}
              onClick={() => onSelect(char)}
              className={`relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:${char.borderColor} group overflow-hidden transform hover:-translate-y-2`}
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${char.color}`}></div>
              
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full ${char.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {getIcon(char.id)}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{char.name}</h2>
                <p className="text-sm text-slate-600 mb-6 flex-grow">{char.description}</p>
                
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Autoestima</span>
                    <div className="w-2/3 bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${char.color}`} style={{ width: `${char.stats.autoestima}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Conhecimento</span>
                    <div className="w-2/3 bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${char.color}`} style={{ width: `${char.stats.conhecimento}%` }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Empatia</span>
                    <div className="w-2/3 bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${char.color}`} style={{ width: `${char.stats.empatia}%` }}></div>
                    </div>
                  </div>
                </div>

                <button className={`mt-8 px-6 py-2 rounded-full text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${char.color} ${char.hoverColor}`}>
                  Selecionar {char.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
